> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: single-string, list-strings
-->

# Text Embeddings

Voyage AI's text embedding models convert your text into high-dimensional vectors that capture semantic meaning. The models are inherently multilingual, meaning semantic similarity of texts is irrespective of language. Use the following models to power your AI search applications with state-of-the-art retrieval accuracy.

## Available Models

Voyage AI provides the following text embedding models:

General Purpose Models

| Model | Context Length | Dimensions | Description |
| --- | --- | --- | --- |
| `voyage-4-large` | 32,000 tokens | 1024 (default), 256, 512, 2048 | The best general-purpose and multilingual retrieval quality. All embeddings created with the 4 series are compatible with each other. To learn more, see the [blog post.](https://blog.voyageai.com/2026/01/15/voyage-4/) |
| `voyage-4` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Optimized for general-purpose and multilingual retrieval quality. All embeddings created with the 4 series are compatible with each other. To learn more, see the [blog post.](https://blog.voyageai.com/2026/01/15/voyage-4/) |
| `voyage-4-lite` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Optimized for latency and cost. All embeddings created with the 4 series are compatible with each other. To learn more, see the [blog post.](https://blog.voyageai.com/2026/01/15/voyage-4/) |

Domain-Specific Models

| Model | Context Length | Dimensions | Description |
| --- | --- | --- | --- |
| `voyage-code-4` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Optimized for code retrieval and agentic-coding applications. Recommended for new code-retrieval use cases. To learn more, see the [blog post.](https://blog.voyageai.com/2026/08/13/voyage-code-4/) |
| `voyage-finance-2` | 32,000 tokens | 1024 | Optimized for finance retrieval and RAG applications. To learn more, see the [blog post.](https://blog.voyageai.com/2024/06/03/domain-specific-embeddings-finance-edition-voyage-finance-2/) |
| `voyage-law-2` | 16,000 tokens | 1024 | Optimized for legal retrieval and RAG applications. To learn more, see the [blog post.](https://blog.voyageai.com/2024/04/15/domain-specific-embeddings-and-retrieval-legal-edition-voyage-law-2/) |

Open Models

| Model | Context Length | Dimensions | Description |
| --- | --- | --- | --- |
| `voyage-4-nano` | 32,000 tokens | 512 (default), 128, 256 | Open-weight model available on [Hugging Face](https://huggingface.co/voyageai/voyage-4-nano). All embeddings created with the 4 series are compatible with eachother To learn more, see the [blog post.](https://blog.voyageai.com/2026/01/15/voyage-4/) |

### Older Models

#### The following older models are still accessible from our API, but we recommend using the new models above for better quality and efficiency.

Our latest models perform better than the legacy models in all aspects, such as quality, context length, latency, and throughput.

| Model | Context Length | Dimensions | Description |
| --- | --- | --- | --- |
| `voyage-3-large` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Previous generation of text embeddings for general-purpose and multilingual retrieval quality. To learn more, see the [blog post.](https://blog.voyageai.com/2025/01/07/voyage-3-large/) |
| `voyage-3.5` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Previous generation of text embeddings optimized for general-purpose and multilingual retrieval quality. To learn more, see the [blog post.](https://blog.voyageai.com/2025/05/20/voyage-3-5/) |
| `voyage-3.5-lite` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Previous generation of text embeddings optimized for latency and cost. To learn more, see the [blog post.](https://blog.voyageai.com/2025/05/20/voyage-3-5/) |
| `voyage-code-3` | 32,000 tokens | 1024 (default), 256, 512, 2048 | Previous generation of code embeddings, optimized for code retrieval and documentation. To learn more, see the [blog post.](https://blog.voyageai.com/2024/12/04/voyage-code-3/) |
| `voyage-code-2` | 16,000 tokens | 1536 | Optimized for code retrieval (17% better than alternatives). Previous generation of code embeddings. To learn more, see the [blog post.](https://blog.voyageai.com/2024/01/23/voyage-code-2-elevate-your-code-retrieval/) |

## Tutorials

For tutorials on using text embeddings, see the following resources:

- [Quick Start](https://www.mongodb.com/docs/voyageai/quickstart.md#std-label-voyage-quickstart)

- [Semantic Search with Voyage AI Embeddings](https://www.mongodb.com/docs/voyageai/tutorials/semantic-search.md#std-label-voyage-semantic-search)

- [Retrieval-Augmented Generation (RAG) with Voyage AI](https://www.mongodb.com/docs/voyageai/tutorials/rag.md#std-label-voyage-rag)

## Usage

You can access Voyage text embeddings in Python through the `voyageai` package. Install the `voyageai` package, set up the API key, and use the `voyageai.Client.embed()` function to vectorize your inputs.

```python
voyageai.Client.embed(
    texts: List[str],
    model: str,
    input_type: Optional[str] = None,
    truncation: Optional[bool] = None,
    output_dimension: Optional[int] = None,
    output_dtype: Optional[str] = "float"
)
```

### Parameters

#### View the parameters for the embed method.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `texts` | String or Array of Strings (`Union[str, List[str]]`) | Yes | Single text string, or a list of texts as a list of strings, such as `["I like cats", "I also like dogs"]`. The following constraints apply: The maximum length of the list is 1,000.; The total number of tokens in the list is at most:1M for `voyage-4-lite`, `voyage-3.5-lite`; 320K for `voyage-4`, `voyage-3.5`, `voyage-code-4`; 120K for `voyage-4-large`, `voyage-3-large`, `voyage-code-3`, `voyage-finance-2`, and `voyage-law-2` |
| `model` | String | Yes | Name of the model. Recommended options: `voyage-4-large`, `voyage-4`, `voyage-4-lite`, `voyage-code-4`, `voyage-finance-2`, `voyage-law-2`. |
| `input_type` | String | No | Type of the input text. Defaults to `None`. Valid values: `None`, `query`, `document`. For semantic search and retrieval tasks, always specify `input_type` as either `query` or `document` for optimal results. When `input_type` is `None`, the embedding model directly converts the inputs into numerical vectors. If you use a "query" to search for relevant information among a collection of data (referred to as "documents"), we recommend specifying whether your inputs are intended as queries or documents by setting `input_type` to `query` or `document`, Voyage AI automatically prepends the following prompts to your inputs before vectorizing them, creating vectors more tailored for search and retrieval tasks: For `query`, the prompt is "Represent the query for retrieving supporting documents: ".; For `document`, the prompt is "Represent the document for retrieval: ". While embeddings generated with and without the `input_type` argument are technically compatible for comparison, specifying `input_type` significantly improves retrieval accuracy. |
| `truncation` | Boolean | No | Flag that specifies whether to truncate the input to fit within the context length. Defaults to `True`. If `True`, the system truncates an over-length input to fit within the context length before the embedding model vectorizes it.; If `False`, the system raises an error if any input exceeds the context length. |
| `output_dimension` | Integer | No | The number of dimensions for resulting output embeddings. Defaults to `None`. Most models only support a single default dimension, used when `output_dimension` is set to `None` (see model embedding dimensions in the tables above). `voyage-4-large`, `voyage-4`, `voyage-4-lite`, `voyage-3-large`, `voyage-3.5`, `voyage-3.5-lite`, `voyage-code-4`, and `voyage-code-3` support the following `output_dimension` values: 2048, 1024 (default), 512, and 256. |
| `output_dtype` | String | No | The data type for the embeddings returned. Defaults to `"float"`. Options: `float`, `int8`, `uint8`, `binary`, `ubinary`. `float`: Each returned embedding is a list of 32-bit (4-byte) single-precision floating-point numbers. This is the default and provides the highest precision and retrieval accuracy.; `int8` and `uint8`: Each returned embedding is a list of 8-bit (1-byte) integers ranging from -128 to 127 and 0 to 255, respectively.; `binary` and `ubinary`: Each returned embedding is a list of 8-bit integers that represent bit-packed, quantized single-bit embedding values: int8 for `binary` and uint8 for `ubinary`. The length of the returned list of integers is 1/8 of the `output_dimension` (which is the actual dimension of the embedding). The `binary` type uses the offset binary method. `float` is supported for all models. `int8`, `uint8`, `binary`, and `ubinary` are supported by `voyage-4-large`, `voyage-4`, `voyage-4-lite`, `voyage-3-large`, `voyage-3.5`, `voyage-3.5-lite`, `voyage-code-4`, and `voyage-code-3`. |

### Response

#### View the response for the embed method.

This method returns an `EmbeddingsObject`, which contains the following attributes:

| Attribute | Type | Description |
| --- | --- | --- |
| `embeddings` | Nested Array of Floats or Integers (`List[List[float]]` or `List[List[int]]`) | List of embeddings for the corresponding list of input texts. Each embedding is a vector represented in one of the following formats: List of floats when you set `output_dtype` to `float`; List of integers when you set `output_dtype` to `int8`, `uint8`, `binary`, `ubinary` |
| `total_tokens` | Integer | Total number of tokens in the input texts, calculated using the following formula: `number of query tokens × number of documents + sum of the
number of tokens in all documents` |

### Example

```python
import voyageai

vo = voyageai.Client()
# This will automatically use the environment variable VOYAGE_API_KEY.
# Alternatively, you can use vo = voyageai.Client(api_key="<model-api-key>")

texts = [
    "The Mediterranean diet emphasizes fish, olive oil, and vegetables, believed to reduce chronic diseases.",
    "Photosynthesis in plants converts light energy into glucose and produces essential oxygen.",
    "20th-century innovations, from radios to smartphones, centered on electronic advancements.",
    "Rivers provide water, irrigation, and habitat for aquatic species, vital for ecosystems.",
    "Apple's conference call to discuss fourth fiscal quarter results and business updates is scheduled for Thursday, November 2, 2023 at 2:00 p.m. PT / 5:00 p.m. ET.",
    "Shakespeare's works, like 'Hamlet' and 'A Midsummer Night's Dream,' endure in literature."
]

# Embed the documents
result = vo.embed(texts, model="voyage-4-large", input_type="document")
print(result.embeddings)
```

You can access Voyage text embeddings in JavaScript or TypeScript through HTTP requests using the Fetch API or other HTTP clients.

### Example

```javascript
const apiKey = process.env.VOYAGE_API_KEY;
const url = "https://ai.mongodb.com/v1/embeddings";

const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
};

const data = {
    input: [
        "The Mediterranean diet emphasizes fish, olive oil, and vegetables, believed to reduce chronic diseases.",
        "Photosynthesis in plants converts light energy into glucose and produces essential oxygen.",
        "20th-century innovations, from radios to smartphones, centered on electronic advancements.",
        "Rivers provide water, irrigation, and habitat for aquatic species, vital for ecosystems.",
        "Apple's conference call to discuss fourth fiscal quarter results and business updates is scheduled for Thursday, November 2, 2023 at 2:00 p.m. PT / 5:00 p.m. ET.",
        "Shakespeare's works, like 'Hamlet' and 'A Midsummer Night's Dream,' endure in literature."
    ],
    model: "voyage-4-large",
    input_type: "document"
};

const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data)
});

const result = await response.json();
```

You can access Voyage text embeddings in Java by sending HTTP requests using the built-in `HttpClient` or other HTTP libraries.

### Example

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

String apiKey = System.getenv("VOYAGE_API_KEY");
String url = "https://ai.mongodb.com/v1/embeddings";

String jsonBody = """
    {
        "input": [
            "The Mediterranean diet emphasizes fish, olive oil, and vegetables, believed to reduce chronic diseases.",
            "Photosynthesis in plants converts light energy into glucose and produces essential oxygen.",
            "20th-century innovations, from radios to smartphones, centered on electronic advancements.",
            "Rivers provide water, irrigation, and habitat for aquatic species, vital for ecosystems.",
            "Apple's conference call to discuss fourth fiscal quarter results and business updates is scheduled for Thursday, November 2, 2023 at 2:00 p.m. PT / 5:00 p.m. ET.",
            "Shakespeare's works, like 'Hamlet' and 'A Midsummer Night's Dream,' endure in literature."
        ],
        "model": "voyage-4-large",
        "input_type": "document"
    }
    """;

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create(url))
    .header("Authorization", "Bearer " + apiKey)
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());
```

You can access Voyage text embeddings in Go by sending HTTP requests using the standard `net/http` package.

### Example

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
)

func main() {
    apiKey := os.Getenv("VOYAGE_API_KEY")
    url := "https://ai.mongodb.com/v1/embeddings"

    texts := []string{
        "The Mediterranean diet emphasizes fish, olive oil, and vegetables, believed to reduce chronic diseases.",
        "Photosynthesis in plants converts light energy into glucose and produces essential oxygen.",
        "20th-century innovations, from radios to smartphones, centered on electronic advancements.",
        "Rivers provide water, irrigation, and habitat for aquatic species, vital for ecosystems.",
        "Apple's conference call to discuss fourth fiscal quarter results and business updates is scheduled for Thursday, November 2, 2023 at 2:00 p.m. PT / 5:00 p.m. ET.",
        "Shakespeare's works, like 'Hamlet' and 'A Midsummer Night's Dream,' endure in literature.",
    }

    requestBody := map[string]interface{}{
        "input":      texts,
        "model":      "voyage-4-large",
        "input_type": "document",
    }

    jsonData, _ := json.Marshal(requestBody)

    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    req.Header.Set("Authorization", "Bearer "+apiKey)
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```

You can access Voyage text embeddings with cURL by sending a POST request to the endpoint `https://ai.mongodb.com/v1/embeddings`.

### Example

### Embed a single string

```bash
curl \
  --request POST 'https://ai.mongodb.com/v1/embeddings' \
  --header "Authorization: Bearer $VOYAGE_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "input": "Sample text",
    "model": "voyage-4-large",
    "input_type": "document"
  }'
```
