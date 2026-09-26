> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: convert-binary, unpack-binary
-->

# Flexible Dimensions and Quantization

Voyage AI embedding models support flexible dimensions and quantization to help you optimize storage and search costs for your vector-based applications. This page explains how to use these features to reduce costs while maintaining high retrieval quality.

Learn about flexible dimensions and quantization through an interactive tutorial in [Google Colab.](https://colab.research.google.com/drive/1JcIZ3dHLjsuxwgXsGTL79VwawMl9XXYt)

## Overview

When working with large-scale vector search applications, such as code retrieval across massive repositories, storage and computational costs can be significant. These costs scale linearly with the following factors:

- **Embedding dimensionality**: The number of dimensions in each vector

- **Precision**: The number of bits used to encode each number in the vector

By reducing either or both of these factors, you can dramatically lower costs without significantly impacting retrieval quality. Voyage AI models support two complementary techniques to achieve this:

- [Matryoshka embeddings](https://www.mongodb.com/docs/voyageai/tutorials/dimensions-and-quantization.md#std-label-voyage-matryoshka-embeddings): Allows you to use smaller versions of your embeddings by truncating to fewer dimensions

- [Quantization](https://www.mongodb.com/docs/voyageai/tutorials/dimensions-and-quantization.md#std-label-voyage-quantization): Reduces the precision of each number in your embeddings from 32-bit floats to lower-precision formats

These techniques are enabled through [Matryoshka learning](https://arxiv.org/abs/2205.13147) and [quantization-aware training](https://arxiv.org/abs/1702.00758), which train the models to maintain quality even with reduced dimensions or quantized values.

## Matryoshka Embeddings

Matryoshka embeddings are a special type of vector embedding that contains multiple valid embeddings of different sizes nested within a single vector. This gives you the flexibility to choose the dimensionality that best balances your performance and cost requirements.

The latest Voyage embedding models generate Matryoshka embeddings and support multiple output dimensions directly through the `output_dimension` parameter. To learn more, see [Voyage AI Embedding and Reranking Models Overview.](https://www.mongodb.com/docs/voyageai/models.md#std-label-voyage-models)

### How Matryoshka Embeddings Work

With Matryoshka learning, a single embedding contains a nested family of embeddings at various lengths. For example, a 2048-dimensional Voyage embedding contains valid embeddings at multiple shorter lengths:

- The first 256 dimensions form a valid 256-dimensional embedding

- The first 512 dimensions form a valid 512-dimensional embedding

- The first 1024 dimensions form a valid 1024-dimensional embedding

- All 2048 dimensions form the full-fidelity embedding

Each shorter version provides slightly lower retrieval quality than the full embedding, but requires less storage and computational resources.

### How to Truncate Matryoshka Embeddings

Truncate Matryoshka embeddings by keeping the leading subset of dimensions. The following example demonstrates how to truncate 1024-dimensional vectors to 256 dimensions:

```python
import voyageai
import numpy as np

def embd_normalize(v: np.ndarray) -> np.ndarray:
    # Normalize rows of a 2D array to unit vectors
    row_norms = np.linalg.norm(v, axis=1, keepdims=True)
    if np.any(row_norms == 0):
        raise ValueError("Cannot normalize rows with a norm of zero.")
    return v / row_norms

vo = voyageai.Client()

# Generate 1024-dimensional embeddings
embd = vo.embed(['Sample text 1', 'Sample text 2'], model='voyage-4-large').embeddings

# Truncate to 256 dimensions and normalize
short_dim = 256
resized_embd = embd_normalize(np.array(embd)[:, :short_dim]).tolist()
```

## Quantization

Quantization reduces the precision of embeddings by converting high-precision floating-point numbers into lower-precision formats. This process can dramatically reduce storage and computational costs while maintaining strong retrieval quality.

The latest Voyage embedding models are trained using [quantization-aware training](https://arxiv.org/abs/1702.00758), which means they maintain high retrieval quality even when quantized. To learn more, see [Voyage AI Embedding and Reranking Models Overview.](https://www.mongodb.com/docs/voyageai/models.md#std-label-voyage-models)

**Note:**

Many databases that support vector storage and retrieval also support quantized embeddings, including MongoDB. To learn more about quantization in MongoDB Vector Search, see [About Quantization.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-quantization)

### How Quantization Works

Quantization reduces the precision of embeddings by representing each dimension with fewer bits than the standard 32-bit floating-point format. Instead of using 4 bytes per dimension, quantized embeddings use:

- **8-bit integers** (1 byte per dimension): Reduces storage by 4x

- **Binary** (1 bit per dimension): Reduces storage by 32x

Despite this dramatic reduction in size, quantization-aware trained models like Voyage's maintain high retrieval quality. Supported Voyage models enable quantization by specifying the output data type with the `output_dtype` parameter:

| Data Type | Description |
| --- | --- |
| `float` | Each returned embedding is a list of 32-bit (4-byte) [single-precision floating-point](https://en.wikipedia.org/wiki/Single-precision_floating-point_format) numbers. This is the **default** and provides the highest precision and retrieval accuracy. |
| `int8` and `uint8` | Each returned embedding is a list of 8-bit (1-byte) integers ranging from -128 to 127 and 0 to 255, respectively. |
| `binary` and `ubinary` | Each returned embedding is a list of 8-bit integers that represent bit-packed, quantized single-bit embedding values: `int8` for `binary` and `uint8` for `ubinary`. The length of the returned list of integers is **1/8** of the actual dimension of the embedding. The `binary` type uses the [offset binary](https://www.mongodb.com/docs/voyageai/tutorials/dimensions-and-quantization.md#std-label-offset-binary) method, explained below. |

**Example: Understanding binary quantization**

1. Consider the following embedding values:

   ```text
   -0.0396, 0.0062, -0.0745, -0.0390, 0.0046, 0.0003, -0.0850, 0.0399
   ```

2. Binary quantization converts each value to a single bit, using the following rules:

   - Values less than `0` are converted to `0`

   - Values greater than or equal to `0` are converted to `1`

   ```text
   0, 1, 0, 0, 1, 1, 0, 1
   ```

3. The eight bits pack into one 8-bit integer: `01001101`. This integer converts to `77` in decimal.

4. To convert to the final output type, apply the following conversions:

   | Output Type | Conversion Method | Result |
   | --- | --- | --- |
   | `ubinary` | `uint8`: Use the value directly as unsigned integer. | `77` |
   | `binary` | `int8`: Apply the [offset binary](https://www.mongodb.com/docs/voyageai/tutorials/dimensions-and-quantization.md#std-label-offset-binary) method by subtracting `128`. | `-51` (which equals `77 - 128`) |

### Offset Binary

[Offset binary](https://en.wikipedia.org/wiki/Offset_binary) is a method for representing signed integers in binary form. Voyage AI uses this method for the `binary` output type to encode bit-packed binary embeddings as signed integers (`int8`).

The offset binary method works by adding or subtracting an offset value:

- When converting **to** binary: Add `128` to the signed integer before encoding

- When converting **from** binary: Subtract `128` from the integer after decoding

For 8-bit signed integers (range `-128` to `127`), the offset is always `128`.

**Example: Signed integer to binary**

To represent `-32` as an 8-bit binary number:

1. Add the offset (`128`) to `-32`, resulting in `96`.

2. Convert `96` to binary: `01100000`.

**Example: Binary to signed integer**

To determine the signed integer from the 8-bit binary number `01010101`:

1. Convert it directly to an integer: `85`.

2. Subtract the offset (`128`) from `85`, resulting in `-43`.

### How to Use Quantization with Voyage AI

You can convert float embeddings to binary format manually or unpack binary embeddings back to individual bits. The following examples demonstrate both operations:

### Convert Float to Binary & Ubinary

```python
import numpy as np
import voyageai

vo = voyageai.Client()

# Generate float embeddings
embd_float = vo.embed('Sample text 1', model='voyage-4-large', output_dimension=2048).embeddings[0]

# Compute 512-dimensional bit-packed binary and ubinary embeddings from 2048-dimensional float embeddings
embd_binary_calc = (np.packbits(np.array(embd_float) > 0, axis=0) - 128).astype(np.int8).tolist() # Quantize, binary offset
embd_binary_512_calc = embd_binary_calc[0:64] # Truncate. Binary is 1/8 length of embedding dimension.

embd_ubinary_calc = (np.packbits(np.array(embd_float) > 0, axis=0)).astype(np.uint8).tolist() # Quantize, binary offset
embd_ubinary_512_calc = embd_ubinary_calc[0:64] # Truncate. Binary is 1/8 length of embedding dimension.
```
