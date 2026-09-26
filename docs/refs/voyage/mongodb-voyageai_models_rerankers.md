> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Rerankers

A reranker receives a query and many documents, and returns a ranked list of relevancy between the query and documents. The documents are often the preliminary results from an [embedding-based](https://www.mongodb.com/docs/voyageai/models/text-embeddings.md#std-label-voyage-text-embeddings) retrieval system, and the reranker refines the ranks of these candidate documents and provides more accurate relevancy scores.

Unlike embedding models that encode queries and documents separately, rerankers are cross-encoders that jointly process a pair of query and document, enabling more accurate relevancy prediction. Apply a reranker on the top candidates retrieved with embedding-based search or with lexical search algorithms such as BM25 and TF-IDF.

## Available Models

| Model | Context Length | Description |
| --- | --- | --- |
| `rerank-3` | 32,000 | Highest accuracy. Recommended for most applications. |
| `rerank-3-lite` | 32,000 | Fast and cost-effective model optimized for latency-sensitive applications. |
| `rerank-2.5` | 32,000 | Highest accuracy. Recommended for most applications. To learn more, see the [blog post.](https://blog.voyageai.com/2025/08/11/rerank-2-5/) |
| `rerank-2.5-lite` | 32,000 | Fast and cost-effective model optimized for latency-sensitive applications. To learn more, see the [blog post.](https://blog.voyageai.com/2025/08/11/rerank-2-5/) |

### Older Models

#### The following older models are still accessible from our API, but we recommend using the new models for better quality and efficiency.

Our latest models perform better than the legacy models in all aspects, such as quality, context length, latency, and throughput.

| Model | Context Length | Description |
| --- | --- | --- |
| `rerank-2` | 16,000 tokens | Our generalist second-generation reranker optimized for quality with multilingual support. To learn more, see the [blog post.](https://blog.voyageai.com/2024/09/30/rerank-2/) |
| `rerank-2-lite` | 8,000 tokens | Our generalist second-generation reranker optimized for both latency and quality with multilingual support. To learn more, see the [blog post.](https://blog.voyageai.com/2024/09/30/rerank-2/) |

## Tutorials

For tutorials on using rerankers, see the following resources:

- [Quick Start](https://www.mongodb.com/docs/voyageai/quickstart.md#std-label-voyage-quickstart)

- [Semantic Search with Voyage AI Embeddings](https://www.mongodb.com/docs/voyageai/tutorials/semantic-search.md#std-label-voyage-semantic-search)

## Usage

You can access Voyage rerankers in Python through the `voyageai` package. Install the `voyageai` package and set up the API key.

Voyage reranker receives as input a query and a list of candidate documents, for example, the documents retrieved by a nearest neighbor search with embeddings. It reranks the candidate documents according to their semantic relevances to the search query, and returns the list of relevance scores. To access the reranker, create a `voyageai.Client` object and use its `rerank()` method.

```python
voyageai.Client.rerank(
    query: str,
    documents: List[str],
    model: str,
    top_k: Optional[int] = None,
    truncation: bool = True
)
```

### Parameters

#### View the parameters for the rerank method.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `query` | String | Yes | Query string. The query can contain a maximum of 8,000 tokens for `rerank-3`, `rerank-3-lite`, `rerank-2.5`, and `rerank-2.5-lite`. For these models, you can append or prepend optional instructions to the query to better guide the relevance. |
| `documents` | Array of Strings (`List[str]`) | Yes | Documents to rerank as a list of strings. The number of documents cannot exceed 1,000. The sum of the number of tokens in the query and the number of tokens in any single document cannot exceed: 32,000 for `rerank-3`, `rerank-3-lite`, `rerank-2.5`, and `rerank-2.5-lite` The total number of tokens is defined using the following formula: `number of query tokens × number of documents + sum of the
number of tokens in all documents` The total number of tokens cannot exceed the following limits: 600K for `rerank-3`, `rerank-3-lite`, `rerank-2.5`, and `rerank-2.5-lite` |
| `model` | String | Yes | Name of the model. Valid values: `rerank-3`, `rerank-3-lite`, `rerank-2.5`, `rerank-2.5-lite`, `rerank-2`, `rerank-2-lite`. |
| `top_k` | Integer | No | Number of most relevant documents to return. Defaults to `None`. When you omit this parameter, Voyage AI returns the reranking results of all documents. |
| `truncation` | Boolean | No | Flag that specifies whether to truncate the input to satisfy the "context length limit" on the query and the documents. Defaults to `True`. If `True`, Voyage AI truncates the query and documents to fit within the context length limit, before processing using the reranker model. If `False`, Voyage AI returns an error when the query exceeds 8,000 tokens for `rerank-3`, `rerank-3-lite`, `rerank-2.5`, and `rerank-2.5-lite`. |

### Response

#### View the response for the rerank method.

This method returns a `RerankingObject`, which contains the following attributes:

| Attribute | Type | Description |
| --- | --- | --- |
| `results` | Array of Objects (`List[RerankingResult]`) | List of `RerankingResult`, sorted by the descending order of relevance scores. When you specify this argument, the length of the list equals `top_k` and when you omit this argument, the length of the list is the number of the input documents. Each element in the list is a `RerankingResult` object, which contains the following attributes: `index` (int) - The index of the document in the input list.; `document` (str) - The document as a string.; `relevance_score` (float) - The relevance score of the document with respect to the query. |
| `total_tokens` | Integer | Total number of tokens in the input texts, calculated using the following formula: `number of query tokens × number of documents + sum of the
number of tokens in all documents` |

### Example

```python
import voyageai

vo = voyageai.Client()
# This will automatically use the environment variable VOYAGE_API_KEY.
# Alternatively, you can use vo = voyageai.Client(api_key="<model-api-key>")

query = "When is Apple's conference call scheduled?"
documents = [
    "The Mediterranean diet emphasizes fish, olive oil, and vegetables, believed to reduce chronic diseases.",
    "Photosynthesis in plants converts light energy into glucose and produces essential oxygen.",
    "20th-century innovations, from radios to smartphones, centered on electronic advancements.",
    "Rivers provide water, irrigation, and habitat for aquatic species, vital for ecosystems.",
    "Apple's conference call to discuss fourth fiscal quarter results and business updates is scheduled for Thursday, November 2, 2023 at 2:00 p.m. PT / 5:00 p.m. ET.",
    "Shakespeare's works, like 'Hamlet' and 'A Midsummer Night's Dream,' endure in literature."
]

reranking = vo.rerank(query, documents, model="rerank-3", top_k=3)
for r in reranking.results:
    print(f"Document: {r.document}")
    print(f"Relevance Score: {r.relevance_score}")
    print()
```

You can access Voyage rerankers in JavaScript or TypeScript through HTTP requests using the Fetch API or other HTTP clients.

### Example

```javascript
const apiKey = process.env.VOYAGE_API_KEY;
const url = "https://ai.mongodb.com/v1/rerank";

const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
};

const data = {
    query: "When is Apple's conference call scheduled?",
    documents: [
        "The Mediterranean diet emphasizes fish, olive oil, and vegetables, believed to reduce chronic diseases.",
        "Photosynthesis in plants converts light energy into glucose and produces essential oxygen.",
        "20th-century innovations, from radios to smartphones, centered on electronic advancements.",
        "Rivers provide water, irrigation, and habitat for aquatic species, vital for ecosystems.",
        "Apple's conference call to discuss fourth fiscal quarter results and business updates is scheduled for Thursday, November 2, 2023 at 2:00 p.m. PT / 5:00 p.m. ET.",
        "Shakespeare's works, like 'Hamlet' and 'A Midsummer Night's Dream,' endure in literature."
    ],
    model: "rerank-3",
    top_k: 3
};

const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data)
});

const result = await response.json();
```

You can access Voyage rerankers in Java by sending HTTP requests using the built-in `HttpClient` or other HTTP libraries.

### Example

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

String apiKey = System.getenv("VOYAGE_API_KEY");
String url = "https://ai.mongodb.com/v1/rerank";

String jsonBody = """
    {
        "query": "When is Apple's conference call scheduled?",
        "documents": [
            "The Mediterranean diet emphasizes fish, olive oil, and vegetables, believed to reduce chronic diseases.",
            "Photosynthesis in plants converts light energy into glucose and produces essential oxygen.",
            "20th-century innovations, from radios to smartphones, centered on electronic advancements.",
            "Rivers provide water, irrigation, and habitat for aquatic species, vital for ecosystems.",
            "Apple's conference call to discuss fourth fiscal quarter results and business updates is scheduled for Thursday, November 2, 2023 at 2:00 p.m. PT / 5:00 p.m. ET.",
            "Shakespeare's works, like 'Hamlet' and 'A Midsummer Night's Dream,' endure in literature."
        ],
        "model": "rerank-3",
        "top_k": 3
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

You can access Voyage rerankers in Go by sending HTTP requests using the standard `net/http` package.

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
    url := "https://ai.mongodb.com/v1/rerank"

    query := "When is Apple's conference call scheduled?"
    documents := []string{
        "The Mediterranean diet emphasizes fish, olive oil, and vegetables, believed to reduce chronic diseases.",
        "Photosynthesis in plants converts light energy into glucose and produces essential oxygen.",
        "20th-century innovations, from radios to smartphones, centered on electronic advancements.",
        "Rivers provide water, irrigation, and habitat for aquatic species, vital for ecosystems.",
        "Apple's conference call to discuss fourth fiscal quarter results and business updates is scheduled for Thursday, November 2, 2023 at 2:00 p.m. PT / 5:00 p.m. ET.",
        "Shakespeare's works, like 'Hamlet' and 'A Midsummer Night's Dream,' endure in literature.",
    }

    requestBody := map[string]interface{}{
        "query":     query,
        "documents": documents,
        "model":     "rerank-3",
        "top_k":     3,
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

You can access Voyage reranker with cURL by sending a POST request to the endpoint `https://ai.mongodb.com/v1/rerank`.

### Example

```bash
curl \
  --request POST 'https://ai.mongodb.com/v1/rerank' \
  --header "Authorization: Bearer $VOYAGE_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "query": "Sample query",
    "documents": [
      "Sample document 1",
      "Sample document 2"
    ],
    "model": "rerank-3"
  }'
```
