> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: free-trial, usage-tier-1, usage-tier-2, usage-tier-3
-->

# Embedding and Reranking API Overview

The Embedding and Reranking API provides programmatic access to the latest Voyage AI embedding and reranking models through a RESTful interface. This page provides an overview of the API and its features.

For detailed information and parameters, see the [API specification.](https://www.mongodb.com/docs/api/doc/atlas-embedding-and-reranking-api/)

**Tip: Restrict Project Access to the Embedding and Reranking API.**

You can create an Atlas Resource Policy to restrict access to the Embedding and Reranking API for all or some projects in your organization. To learn more, see [Atlas Resource Policies](https://www.mongodb.com/docs/atlas/atlas-resource-policies.md#std-label-atlas-resource-policies-overview)

## API Key Management

You use [MongoDB Atlas](https://www.mongodb.com/docs/atlas/) to manage API keys for the Embedding and Reranking API. This includes creating and managing your model API keys across your organization and projects, monitoring usage, and configuring rate limits.

To learn more, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

**Note:**

It is named *model API key* to distinguish it from other API keys in Atlas. You use this key the same way as API keys from other model providers.

## Authentication

All requests to the Embedding and Reranking API must include an `Authorization` header with your model API key using the Bearer token format.

```http
Authorization: Bearer VOYAGE_API_KEY
```

When you use a client SDK, you set the API key when constructing a client, and the SDK sends the header on your behalf with every request. When you integrate directly with the API, you must send this header yourself.

## Endpoints

**Note: Public Preview**

The Europe Geography and its endpoint, `eu.ai.mongodb.com`, are available as a Public Preview feature. The feature and the corresponding documentation might change at any time during the Preview period.

The scope of your model API key determines the endpoint that you send requests to. A key scoped to a Geography works only against that Geography's endpoint, and an unscoped key works against the unscoped endpoint.

| Endpoint | Geography |
| --- | --- |
| `ai.mongodb.com` | Unscoped. Atlas can serve the request from any Geography. |
| `eu.ai.mongodb.com` | Europe |
| `us.ai.mongodb.com` | United States |

Scoped endpoints follow the pattern `<geography>.ai.mongodb.com`, where `<geography>` is the `geography` value of the model API key that you send with the request.

If you send a scoped key to an endpoint that doesn't match its scope, the request fails. Atlas doesn't reroute the request to the endpoint that matches the key.

Scoped endpoints differ from the unscoped endpoint in the following ways:

- Atlas charges a 10% uplift on the tokens that you send to a scoped endpoint.

- Scoped endpoints require a paid usage tier and start at usage tier 1. To use a higher usage tier with a scoped endpoint, contact your account team. To learn more about usage tiers, see [Usage Tiers.](https://www.mongodb.com/docs/voyageai/management/billing.md#std-label-voyage-api-usage-tiers)

- Scoped endpoints have their own rate limits, which are lower than those of the unscoped endpoint. To learn more, see [Geography Rate Limits.](https://www.mongodb.com/docs/voyageai/management/rate-limits.md#std-label-voyage-geography-rate-limits)

- Scoped endpoints don't serve every model. To check which endpoints serve a given model, see the Supported Endpoints column of the model tables in [Model Deprecations, Lifecycle States, and Support.](https://www.mongodb.com/docs/voyageai/models/lifecycle.md#std-label-voyage-model-lifecycle)

To learn what a Geography is and when to use one, see [Geographies for Voyage AI Inference.](https://www.mongodb.com/docs/voyageai/geographies.md#std-label-voyage-geographies)

## JSON

All entities are represented in JSON. The following rules and conventions apply:

Content Type Request Header

When you send JSON to the server with a POST request, specify the `Content-Type: application/json` header. Client SDKs handle this automatically.

Invalid Requests

If you attempt to create a request with invalid JSON, incorrect data types, or constraint violations (such as exceeding token limits or batch sizes), the server responds with a `400` status code and an error message describing the issue.

Field Names for Fields with Numbers

Fields that contain numeric values are named to disambiguate the unit being used. For example, token counts are specified in fields like `total_tokens` and `output_dimension` to clarify the measurement unit.

## Rate Limits and Usage Tiers

The Embedding and Reranking API implements rate limiting to ensure fair usage and optimal performance. Rate limits are applied per API key and measured in two dimensions. Your rate limits increase as you advance through [usage tiers.](https://www.mongodb.com/docs/voyageai/management/billing.md#std-label-voyage-api-usage-tiers)

- **TPM (Tokens Per Minute)**: Maximum number of tokens processed per minute

- **RPM (Requests Per Minute)**: Maximum number of API requests per minute

If you exceed the rate limit, the API returns a `429` (Rate Limit Exceeded) HTTP status code.

### Free Trial

Free trial rate limits without a payment method are 3 RPM and 10K TPM. To qualify for higher rate limits, add a payment method to your account.

To learn more about usage tiers, see [Usage Tiers.](https://www.mongodb.com/docs/voyageai/management/billing.md#std-label-voyage-api-usage-tiers)

To set custom rate limits for your organization, use the Atlas UI. To learn more, see [Manage Rate Limits.](https://www.mongodb.com/docs/voyageai/management/rate-limits.md#std-label-voyage-rate-limits)

## Making Requests

The following example demonstrates how you can use `cURL` to make a request to the embedding service. You can also use an HTTP client in any programming language to access the API.

For additional usage examples, see the following resources:

- [Accessing Voyage AI Models](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-api-and-clients) for HTTP request and client SDK examples

- [Model](https://www.mongodb.com/docs/voyageai/models/text-embeddings.md#std-label-voyage-text-embeddings) pages for model-specific usage.

- [API specification](https://www.mongodb.com/docs/api/doc/atlas-embedding-and-reranking-api/) for full details on all API endpoints.

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

## Errors

To learn more about errors returned by the API, see the [API specification.](https://www.mongodb.com/docs/api/doc/atlas-embedding-and-reranking-api/)

## Best Practices

Consider the following best practices when you use the API:

### Specifying Input Type

For semantic search and retrieval tasks, set the `input_type` to `query` or `document` to optimize how Voyage AI models create the vectors. Do not omit this parameter.

The parameter adds the following prompts to your input before generating embeddings:

- `query`: "Represent the query for retrieving supporting documents: "

- `document`: "Represent the document for retrieval: "

**Example:**

`input_type="query"` transforms "When is Apple's conference call scheduled?" into "Represent the query for retrieving supporting documents: When is Apple's conference call scheduled?"

### Troubleshooting

If you're using the Python client, you must use version 0.3.7 or later. To check the version of your Python client installation, run the following command in your terminal:

```shell
python -c "import voyageai; print(voyageai.__version__)"
```
