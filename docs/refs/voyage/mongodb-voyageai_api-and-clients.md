> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Accessing Voyage AI Models

You can access Voyage AI models by using the Embedding and Reranking API, which is available through MongoDB Atlas. Use the following methods to access the API:

- [REST API](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-rest-api): for language-agnostic access.

- [Python client](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-python-client): official client for ease of use.

- [TypeScript client](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-typescript-client): official client for TypeScript and JavaScript applications.

This page summarizes how to access the API. For full details about the API, including rate limits and usage tiers, see the [API Reference.](https://www.mongodb.com/docs/voyageai/api-reference/overview.md#std-label-voyage-api-overview)

## API Keys

The Embedding and Reranking API uses API keys to monitor usage and manage permissions. To create and manage your model API keys, use the MongoDB Atlas UI. For instructions, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

## REST API

The following examples demonstrate how to call the embedding service through the REST API. The API supports cURL and HTTP requests from any programming language.

Authentication is handled through the [model API Key](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys), which you must include in the authorization header of every API request as a Bearer token.

To learn more, see the [full API specification.](https://www.mongodb.com/docs/api/doc/atlas-embedding-and-reranking-api/)

```bash
curl \
  --request POST 'https://ai.mongodb.com/v1/embeddings' \
  --header "Authorization: Bearer $VOYAGE_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "input": [
      "MongoDB is redefining what a database is in the AI era.",
      "Voyage AI embedding and reranking models are state-of-the-art."
    ],
    "model": "voyage-4-large"
  }'
```

**Important:**

We recommend the [Python client](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-python-client) for ease of use. The following example is only provided for reference.

```python
import os
import requests

api_key = os.environ.get("VOYAGE_API_KEY")
url = "https://ai.mongodb.com/v1/embeddings"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "input": [
        "MongoDB is redefining what a database is in the AI era.",
        "Voyage AI embedding and reranking models are state-of-the-art."
    ],
    "model": "voyage-4-large"
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
```

```typescript
const apiKey = process.env.VOYAGE_API_KEY;
const url = "https://ai.mongodb.com/v1/embeddings";

const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
};

const data = {
    input: [
        "MongoDB is redefining what a database is in the AI era.",
        "Voyage AI embedding and reranking models are state-of-the-art."
    ],
    model: "voyage-4-large"
};

const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data)
});

const result = await response.json();
```

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
            "MongoDB is redefining what a database is in the AI era.",
            "Voyage AI embedding and reranking models are state-of-the-art."
        ],
        "model": "voyage-4-large"
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
String result = response.body();
```

```go
package main

import (
    "bytes"
    "encoding/json"
    "io"
    "net/http"
    "os"
)

func main() {
    apiKey := os.Getenv("VOYAGE_API_KEY")
    url := "https://ai.mongodb.com/v1/embeddings"

    requestBody := map[string]interface{}{
        "input": []string{
            "MongoDB is redefining what a database is in the AI era.",
            "Voyage AI embedding and reranking models are state-of-the-art.",
        },
        "model": "voyage-4-large",
    }

    jsonData, _ := json.Marshal(requestBody)

    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    req.Header.Set("Authorization", "Bearer "+apiKey)
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    _, _ = io.ReadAll(resp.Body)
}
```

### Scoped Endpoints

**Note: Public Preview**

The Europe Geography and its endpoint, `eu.ai.mongodb.com`, are available as a Public Preview feature. The feature and the corresponding documentation might change at any time during the Preview period.

If your model API key is scoped to a Geography, send your requests to that Geography's endpoint instead of `ai.mongodb.com`. The request body, headers, and response format don't change. Only the host changes.

| Endpoint | Geography |
| --- | --- |
| `ai.mongodb.com` | Unscoped. Atlas can serve the request from any Geography. |
| `eu.ai.mongodb.com` | Europe |
| `us.ai.mongodb.com` | United States |

Scoped endpoints follow the pattern `<geography>.ai.mongodb.com`, where `<geography>` is the `geography` value of the model API key that you send with the request.

To adapt any of the preceding examples, replace the host in the request URL. For example, a key scoped to Europe uses the following URL to generate embeddings:

```text
https://eu.ai.mongodb.com/v1/embeddings
```

A scoped key works only against its matching endpoint. Sending a Europe-scoped key to `us.ai.mongodb.com` or to `ai.mongodb.com` fails.

To learn what a Geography is and when to scope a key to one, see [Geographies for Voyage AI Inference.](https://www.mongodb.com/docs/voyageai/geographies.md#std-label-voyage-geographies)

## Python Client

To install the official Python package using `pip`:

```bash
pip install --upgrade voyageai
```

Use the `--upgrade` or  `-U` option to install the latest version of the package. This gives you access to the most recent features and bug fixes. For model-specific parameters, see the usage examples for each [model page.](https://www.mongodb.com/docs/voyageai/models/text-embeddings.md#std-label-voyage-text-embeddings)

**Important:**

You must use version 0.3.7 or later of the Python client library. This version adds support for the Embedding and Reranking API.

The `voyageai.Client` class provides a synchronous interface to invoke Voyage's API. Create a client object and use it to access Voyage AI models.

**Example:**

The following example shows how to initialize the client with custom settings and generate embeddings:

```python
import voyageai

# Initialize the client with custom settings
vo = voyageai.Client(
    api_key="<model-api-key>",  # Or use VOYAGE_API_KEY environment variable
    max_retries=3,              # Retry up to 3 times on rate limit errors
    timeout=30                  # Timeout after 30 seconds
)

# Generate embeddings
result = vo.embed(
    texts=["MongoDB is redefining what a database is in the AI era."],
    model="voyage-4-large"
)

print(f"Embedding dimension: {len(result.embeddings[0])}")
print(f"Total tokens used: {result.total_tokens}")
```

The following table describes the parameters you can pass when initializing the client:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `api_key` | String | No | [Model API key](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys). Defaults to None. If None, the client searches for the API key in the following order: `voyageai.api_key_path`, path to the file containing the key; environment variable `VOYAGE_API_KEY_PATH`, which can be set to the path to the file containing the key; `voyageai.api_key`, an attribute of the voyageai module, which can be used to store the key; environment variable `VOYAGE_API_KEY` NOTE: The Python client automatically routes requests to the correct API endpoint based on the API key format: [Model API keys](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys) created in MongoDB Atlas route to the `ai.mongodb.com` endpoints.; Model API keys scoped to a [Geography](https://www.mongodb.com/docs/voyageai/geographies.md#std-label-voyage-geographies) route to that Geography's endpoint, such as `eu.ai.mongodb.com`.; API keys created on the Voyage platform route to the `api.voyageai.com` endpoints. You can override this behavior by setting the `base_url` parameter when creating the client. |
| `max_retries` | Integer | No | Maximum number of retries for each API request in case of rate limit errors or temporary server unavailability. Defaults to 0. The client employs a wait-and-retry strategy to handle such errors and raises an exception upon reaching the maximum retry limit. By default, the client does not retry. |
| `timeout` | Integer | No | Maximum time in seconds to wait for a response from the API before aborting the request. Defaults to None. If the specified timeout is exceeded, the request is terminated and a timeout exception is raised. By default, no timeout constraint is enforced. |
| `base_url` | String | No | Custom base URL for API requests. By default, the client automatically detects the correct endpoint based on the provided API key. |

## TypeScript Client

To install the official TypeScript package using `npm`:

```bash
npm install voyageai
```

The `VoyageAIClient` class provides an asynchronous interface to invoke Voyage's API from TypeScript and JavaScript applications. Create a client object and use it to access Voyage AI models.

Unlike the [Python client](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-python-client), the TypeScript client sends requests to the Voyage platform endpoint (`https://api.voyageai.com/v1`) by default. To use the Embedding and Reranking API with your [model API key](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys), set the `environment` option to `https://ai.mongodb.com/v1` when you create the client.

**Example:**

The following example shows how to initialize the client for the Embedding and Reranking API and generate embeddings:

```typescript
import { VoyageAIClient } from "voyageai";

// Initialize the client for the Embedding and Reranking API
const client = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY,     // Model API key
  environment: "https://ai.mongodb.com/v1",
  maxRetries: 3,                          // Retry up to 3 times
  timeoutInSeconds: 30                    // Time out after 30 seconds
});

// Generate embeddings
const result = await client.embed({
  input: ["MongoDB is redefining what a database is in the AI era."],
  model: "voyage-4-large"
});

console.log(`Embedding dimension: ${result.data[0].embedding.length}`);
console.log(`Total tokens used: ${result.usage.totalTokens}`);
```

The following table describes the options you can pass when initializing the client:

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `apiKey` | String | Yes | [Model API key](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys). If you don't set this option, the client uses the `VOYAGE_API_KEY` environment variable. |
| `environment` | String | No | Base URL for API requests. Defaults to `https://api.voyageai.com/v1`, the Voyage platform endpoint. Set this option to `https://ai.mongodb.com/v1` to use the Embedding and Reranking API. |
| `maxRetries` | Number | No | Maximum number of retries for each API request in case of rate limit errors or temporary server unavailability. Defaults to 2. The client employs a wait-and-retry strategy to handle such errors and throws an exception upon reaching the maximum retry limit. |
| `timeoutInSeconds` | Number | No | Maximum time in seconds to wait for a response from the API before aborting the request. Defaults to 60. If the request exceeds the specified timeout, the client terminates the request and throws a timeout exception. |
| `headers` | Object | No | Extra HTTP headers to send with every API request. |

In addition to `embed`, the client provides the `rerank`, `multimodalEmbed`, and `contextualizedEmbed` methods. For model-specific parameters, see the usage examples for each [model page.](https://www.mongodb.com/docs/voyageai/models/text-embeddings.md#std-label-voyage-text-embeddings)
