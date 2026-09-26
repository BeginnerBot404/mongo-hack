> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: text, contextualized-chunk, multimodal, rerankers
-->

# Voyage AI Embedding and Reranking Models Overview

Voyage AI provides state-of-the-art embedding and reranking models. The [Embedding and Reranking API](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-api-and-clients) provides access to the latest Voyage AI models. This page describes the available models and when to use them.

[What are embedding models and rerankers?](https://www.mongodb.com/docs/voyageai/index.md#std-label-voyage-key-concepts)

## Choosing a Model

### Expand this section to learn more about which model to choose for your use case.

For text embeddings, we recommend:

- `voyage-4-large` for the best quality

- `voyage-4-lite` for the lowest latency and cost

- `voyage-4` for a balance between quality and performance

- A [domain-specific model](https://www.mongodb.com/docs/voyageai/models.md#std-label-voyage-domain-specific-models) if your application is in one of the listed domains.

For other use cases, we recommend:

- `voyage-multimodal-3.5` for text, image, and video embeddings

- `voyage-context-4` for chunk-level and document-level retrieval tasks

- `rerank-2.5` for adding reranking to most applications

- `rerank-2.5-lite` for adding reranking to latency-sensitive applications

## Text Embeddings

Voyage AI provides the following text embedding models to capture the semantic meaning of text.

For details and example usage, see [Text Embeddings.](https://www.mongodb.com/docs/voyageai/models/text-embeddings.md#std-label-voyage-text-embeddings)

### General-Purpose Models

Use the following models for most AI search and retrieval applications.

| Model | Context Length | Dimensions | Description |
| --- | --- | --- | --- |
| `voyage-4-large` | 32,000 tokens | 1024 (default), 256, 512, 2048 | The best general-purpose and multilingual retrieval quality. All embeddings created with the 4 series are compatible with each other. To learn more, see the [blog post.](https://blog.voyageai.com/2026/01/15/voyage-4/) |
| `voyage-4` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Optimized for general-purpose and multilingual retrieval quality. All embeddings created with the 4 series are compatible with each other. To learn more, see the [blog post.](https://blog.voyageai.com/2026/01/15/voyage-4/) |
| `voyage-4-lite` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Optimized for latency and cost. All embeddings created with the 4 series are compatible with each other. To learn more, see the [blog post.](https://blog.voyageai.com/2026/01/15/voyage-4/) |

### Domain-Specific Models

Use the following models for specialized domains to achieve better accuracy.

| Model | Context Length | Dimensions | Description |
| --- | --- | --- | --- |
| `voyage-code-4` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Optimized for code retrieval and agentic-coding applications. Recommended for new code-retrieval use cases. To learn more, see the [blog post.](https://blog.voyageai.com/2026/08/13/voyage-code-4/) |
| `voyage-finance-2` | 32,000 tokens | 1024 | Optimized for finance retrieval and RAG applications. To learn more, see the [blog post.](https://blog.voyageai.com/2024/06/03/domain-specific-embeddings-finance-edition-voyage-finance-2/) |
| `voyage-law-2` | 16,000 tokens | 1024 | Optimized for legal retrieval and RAG applications. To learn more, see the [blog post.](https://blog.voyageai.com/2024/04/15/domain-specific-embeddings-and-retrieval-legal-edition-voyage-law-2/) |

### Open Models

Voyage also provides the following open-weight models.

| Model | Context Length | Dimensions | Description |
| --- | --- | --- | --- |
| `voyage-4-nano` | 32,000 tokens | 512 (default), 128, 256 | Open-weight model available on [Hugging Face](https://huggingface.co/voyageai/voyage-4-nano). All embeddings created with the 4 series are compatible with eachother To learn more, see the [blog post.](https://blog.voyageai.com/2026/01/15/voyage-4/) |

#### Older Text Embedding Models

##### The following older models are still accessible from the API, but we recommend using the new models for better quality and efficiency.

The latest models perform better than the legacy models in all aspects, such as quality, context length, latency, and throughput.

| Model | Context Length | Dimensions | Description |
| --- | --- | --- | --- |
| `voyage-3-large` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Previous generation of text embeddings for general-purpose and multilingual retrieval quality. To learn more, see the [blog post.](https://blog.voyageai.com/2025/01/07/voyage-3-large/) |
| `voyage-3.5` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Previous generation of text embeddings optimized for general-purpose and multilingual retrieval quality. To learn more, see the [blog post.](https://blog.voyageai.com/2025/05/20/voyage-3-5/) |
| `voyage-3.5-lite` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Previous generation of text embeddings optimized for latency and cost. To learn more, see the [blog post.](https://blog.voyageai.com/2025/05/20/voyage-3-5/) |
| `voyage-code-3` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Previous generation of code embeddings, optimized for code retrieval and documentation. To learn more, see the [blog post.](https://blog.voyageai.com/2024/12/04/voyage-code-3/) |
| `voyage-code-2` | 16,000 tokens | 1536 | Optimized for code retrieval (17% better than alternatives). Previous generation of code embeddings. To learn more, see the [blog post.](https://blog.voyageai.com/2024/01/23/voyage-code-2-elevate-your-code-retrieval/) |

## Contextualized Chunk Embeddings

Voyage AI provides the following models that generate embeddings while incorporating surrounding context for improved retrieval accuracy.

For details and example usage, see [Contextualized Chunk Embeddings.](https://www.mongodb.com/docs/voyageai/models/contextualized-chunk-embeddings.md#std-label-voyage-context-chunk-embeddings)

| Model | Context Length | Dimensions | Description |
| --- | --- | --- | --- |
| `voyage-context-4` | 120,000 tokens * | 1024 (default), 256, 512, 2048 | Contextualized chunk embeddings optimized for general-purpose and multilingual retrieval quality. |

**Note:**

\* The total number of tokens across all inputs must not exceed 120K if `enable_auto_chunk = true`; otherwise they must not exceed 32K.

### Older Contextualized Chunk Embedding Models

#### The following older models are still accessible from the API, but we recommend using the new models for better quality and efficiency.

The latest models perform better than the legacy models in all aspects, such as quality, context length, latency, and throughput.

| Model | Context Length | Dimensions | Description |
| --- | --- | --- | --- |
| `voyage-context-3` | 120,000 tokens * | 1024 (default), 256, 512, 2048 | Contextualized chunk embeddings optimized for general-purpose and multilingual retrieval quality. To learn more, see the [blog post.](https://www.mongodb.com/company/blog/product-release-announcements/voyage-context-3-focused-chunk-level-details-global-document-context) |

## Multimodal Embeddings

Voyage AI provides the following embedding models that process text, images, and video.

For details and example usage, see [Multimodal Embeddings.](https://www.mongodb.com/docs/voyageai/models/multimodal-embeddings.md#std-label-voyage-multimodal-embeddings)

| Model | Context Length | Dimensions | Description |
| --- | --- | --- | --- |
| `voyage-multimodal-3.5` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Rich multimodal embedding model that can vectorize interleaved text and visual data, such as screenshots of PDFs, slides, tables, figures, videos, and more. To learn more, see the [blog post.](https://blog.voyageai.com/2026/01/15/voyage-multimodal-3-5/) |

### Older Multimodal Models

#### The following older models are still accessible from the API, but we recommend using the new models for better quality and efficiency.

The latest models perform better than the legacy models in all aspects, such as quality, context length, latency, and throughput.

| Model | Context Length | Dimensions | Description |
| --- | --- | --- | --- |
| `voyage-multimodal-3` | 32,000 tokens | 1024 | Processes text and images into unified embeddings. Supports images from 50,000 to 2 million pixels. To learn more, see the [blog post.](https://blog.voyageai.com/2024/11/12/voyage-multimodal-3/) |

## Rerankers

Voyage AI provides the following reranking models to refine your search results.

For details and example usage, see [Rerankers.](https://www.mongodb.com/docs/voyageai/models/rerankers.md#std-label-voyage-rerankers)

| Model | Context Length | Description |
| --- | --- | --- |
| `rerank-3` | 32,000 | Highest accuracy. Recommended for most applications. |
| `rerank-3-lite` | 32,000 | Fast and cost-effective model optimized for latency-sensitive applications. |
| `rerank-2.5` | 32,000 | Highest accuracy. Recommended for most applications. To learn more, see the [blog post.](https://blog.voyageai.com/2025/08/11/rerank-2-5/) |
| `rerank-2.5-lite` | 32,000 | Fast and cost-effective model optimized for latency-sensitive applications. To learn more, see the [blog post.](https://blog.voyageai.com/2025/08/11/rerank-2-5/) |

### Older Rerankers

#### The following older models are still accessible from the API, but we recommend using the new models for better quality and efficiency.

The latest models perform better than the legacy models in all aspects, such as quality, context length, latency, and throughput.

| Model | Context Length | Description |
| --- | --- | --- |
| `rerank-2` | 16,000 tokens | Our generalist second-generation reranker optimized for quality with multilingual support. To learn more, see the [blog post.](https://blog.voyageai.com/2024/09/30/rerank-2/) |
| `rerank-2-lite` | 8,000 tokens | Our generalist second-generation reranker optimized for both latency and quality with multilingual support. To learn more, see the [blog post.](https://blog.voyageai.com/2024/09/30/rerank-2/) |

## Models and Geographies

**Note: Public Preview**

The Europe Geography and its endpoint, `eu.ai.mongodb.com`, are available as a Public Preview feature. The feature and the corresponding documentation might change at any time during the Preview period.

Scoped endpoints don't serve every Voyage AI model. The Supported Endpoints column of the model tables lists `All` for models that every endpoint serves, and `ai.mongodb.com` for models that only the unscoped endpoint serves.

To check which endpoints serve a given model, see [Model Deprecations, Lifecycle States, and Support.](https://www.mongodb.com/docs/voyageai/models/lifecycle.md#std-label-voyage-model-lifecycle)

To learn about Geographies and their endpoints, see [Geographies for Voyage AI Inference.](https://www.mongodb.com/docs/voyageai/geographies.md#std-label-voyage-geographies)

## Pricing

Model pricing is usage-based, with charges billed to the Atlas account linked to the API key used for access. All models include a free tier. Get started with 200 million free tokens for most models, or 50 million tokens for specialized models.

### Text Embeddings

Pricing is based on the number of tokens in your documents and queries. The free tier includes 200 million tokens for most models, and 50 million tokens for the following specialized models: `voyage-finance-2`, `voyage-law-2`, `voyage-code-2`.

| Model | Price per 1K tokens | Price per 1M tokens | Free tokens |
| --- | --- | --- | --- |
| `voyage-4-large` | $0.00012 | $0.12 | 200 million |
| `voyage-4` | $0.00006 | $0.06 | 200 million |
| `voyage-4-lite` | $0.00002 | $0.02 | 200 million |
| `voyage-code-4` | $0.00012 | $0.12 | 200 million |
| `voyage-finance-2``voyage-law-2``voyage-code-2` | $0.00012 | $0.12 | 50 million |

### Older Text Embedding Models

#### The following table shows the pricing for older text embedding models. Free tokens are not offered for these models.

| Model | Price per 1K tokens | Price per 1M tokens | Free tokens |
| --- | --- | --- | --- |
| `voyage-3-large` | $0.00018 | $0.18 | 0 |
| `voyage-3.5` | $0.00006 | $0.06 | 0 |
| `voyage-3.5-lite` | $0.00002 | $0.02 | 0 |
| `voyage-code-3` | $0.00018 | $0.18 | 0 |
