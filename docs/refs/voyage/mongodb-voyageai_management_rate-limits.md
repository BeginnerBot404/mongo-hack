> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: org-level, project-level, usage-tier-1, usage-tier-2, usage-tier-3
-->

# Manage Rate Limits

Rate limits are restrictions on the frequency and number of tokens you can request from Voyage AI within a specified period of time. To learn more about rate limits, see [Best Practices.](https://www.mongodb.com/docs/voyageai/management/rate-limits.md#std-label-voyage-mdb-rate-limits-purpose)

Atlas enforces rate limits based on the model API key [usage](https://www.mongodb.com/docs/voyageai/management/monitor-usage.md#std-label-voyage-monitor-usage) (requests per minute (RPM) and tokens per minute (TPM)). If you exceed the number of requests or tokens in the most recent minute, the API (Application Programming Interface) denies any subsequent additional request and returns a `429` (Rate Limit Exceeded) HTTP status code.

## Manage Rate Limits

The following sections describe how to manage rate limits in the Atlas UI.

### Required Permissions

To set and reset rate limits at the project level, you must have [`Project Owner`](https://www.mongodb.com/docs/atlas/reference/user-roles.md#mongodb-authrole-Project-Owner) access or higher to Atlas.

To view rate limits:

- At the organization and project levels, you must have [`Organization Read Only`](https://www.mongodb.com/docs/atlas/reference/user-roles.md#mongodb-authrole-Organization-Read-Only) or higher access to Atlas.

- At only the project level, you must have [`Project Read Only`](https://www.mongodb.com/docs/atlas/reference/user-roles.md#mongodb-authrole-Project-Read-Only) or higher access to Atlas.

### Set Rate Limits

You can set different limits for each project at the project level. Project level rate limits can't exceed the rate limits for the organization. Rate limits set at the project level apply to all model API keys for the project.

1. Log in to [Atlas](https://cloud.mongodb.com/).

2. Go to the AI Model APIs page in the Atlas UI.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   If it's not already displayed, select your desired project from the Projects menu in the navigation bar.

   At the project level, click AI Model APIs under the Services header in the navigation bar.

3. Set the rate limits for the project.

   From the navigation bar, select Rate Limits.

   In the Actions column corresponding to the embeddings model for which you want to modify rate limits, click .

   Modify the TPM (Tokens Per Minute) and RPM (Requests Per Minute) values.

   Project-level rate limits for each model can be any value less than or equal to the organization's rate limit.

   **Example:**

   At usage tier 1, rate limits for the `voyage-4` embedding model for a project can be set to `2000` RPM and `8,000,000` TPM, or lower.

   Click  to apply the rate limit.

### View Rate Limits

You can view the rate limits at the organization and project levels.

### Organization Level

1. Log in to [Atlas](https://cloud.mongodb.com).

2. Go to the AI Model APIs page in the Atlas UI.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   At the organization level, click Rate Limits under the Services header in the navigation bar.

The page displays the following information:

| Name | Description |
| --- | --- |
| Model | List of Voyage AI embedding models. |
| Tokens Per Minute (TPM) | Number of tokens that you can request within a minute from the Embedding and Reranking API endpoints. |
| Requests Per Min (RPM) | Number of API requests that you can send within a minute to the Embedding and Reranking API endpoints. |

### Reset All Rate Limits

You can reset all the custom limits that you set for a project at any time. When you reset the limits, the rate limits for the project revert to the default rate limits for the organization.

1. Log in to [Atlas](https://cloud.mongodb.com/).

2. Go to the AI Model APIs page in the Atlas UI.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   If it's not already displayed, select your desired project from the Projects menu in the navigation bar.

   At the project level, click AI Model APIs under the Services header in the navigation bar.

3. Reset the custom rate limits.

   From the navigation bar, select Rate Limits.

   On the page, click Reset all limits in the top right corner.

## Usage Tiers

Rate limits follow a tiered system, with higher tiers offering increased limits. Qualification for a tier is based on billed usage (excluding free tokens). Atlas offers 200 million free tokens for each model. The multimodal models also include 150,000,000,000 free pixels. Once you qualify for a tier, you are never downgraded. As your usage and spending increase, Atlas automatically promotes you to the next usage tier, raising rate limits across all models.

To learn more, see [Rate Limits and Usage Tiers.](https://www.mongodb.com/docs/voyageai/api-reference/overview.md#std-label-voyage-api-rate-limits)

## Default Rate Limits

This section describes the default rate limits for each usage tier that are applied at the organization level. It also describes the rate limits that you can configure for each project.

### Organization Rate Limits

The following tables show the default rate limits (TPM (Tokens Per Minute) and RPM (Requests Per Minute)) based on usage tier for each Voyage AI embedding model.

### Usage Tier 1

| Model | Tokens Per Min (TPM) | Requests Per Min (RPM) |
| --- | --- | --- |
| `voyage-4-lite`, `voyage-3.5-lite` | 16,000,000 | 2,000 |
| `voyage-4`, `voyage-3.5`, `voyage-code-4` | 8,000,000 | 2,000 |
| `voyage-4-large`, `voyage-context-4` | 3,000,000 | 2,000 |
| `voyage-3-large`, `voyage-context-3`, `voyage-code-3`, `voyage-code-2`, `voyage-law-2`, `voyage-finance-2` | 3,000,000 | 2,000 |
| `voyage-multimodal-3.5`, `voyage-multimodal-3` | 2,000,000 | 2,000 |
| `rerank-3-lite`, `rerank-2.5-lite`, `rerank-2-lite` | 4,000,000 | 2,000 |
| `rerank-3`, `rerank-2.5`, `rerank-2` | 2,000,000 | 2,000 |

### Project Rate Limits

By default, projects inherit the rate limits based on the rate limits for the organization. However, you can set different limits for each project at the project level. Project level rate limits can't exceed the rate limits for the organization. Rate limits set at the project level apply to all model API keys for the project. However, if the organization rate limit is reached first, projects might be rate-limited to a lower rate. This can occur when the sum of all project rate limits exceeds the organization limit.

**Example:**

Consider an organization rate limit *O* with three projects with rate limits *P1*, *P2*, and *P3*. The table below illustrates three scenarios where the sum of the project rate limits is less than, equal to, or greater than the organization rate limit. For each scenario, the table indicates whether the organization limit can be reached and whether one project's usage can impact another.

|  | Scenario 1P1 + P2 + P3 < O | Scenario 2P1 + P2 + P3 = O | Scenario 3P1 + P2 + P3 > O |
| --- | --- | --- | --- |
| Scenario Description | Sum of all project rate limits is *less than* the organization limit. | Sum of all project rate limits is *equal to* the organization limit. | Sum of all project rate limits is *greater than* the organization limit. |
| Can the organization limit be reached? | *No*, even if all projects reach their rate limits, the organization rate limit will not be exceeded. | *Yes*, if all projects reach their rate limits, the organization limit will also be reached. | *Yes*, as the sum of all project rate limits exceeds the organization limit, the organization limit can be reached before individual projects hit their own limits. |
| Can one project's usage impact another? | *No*. | *No*. | *Yes*. If projects collectively consume enough usage to reach the organization limit before any or all projects reach their individual limits, projects can be rate-limited to a lower rate than their individual limits. |

### Geography Rate Limits

**Note: Public Preview**

The Europe Geography and its endpoint, `eu.ai.mongodb.com`, are available as a Public Preview feature. The feature and the corresponding documentation might change at any time during the Preview period.

Scoped endpoints have their own rate limits, separate from the rate limits that apply to the unscoped endpoint. Atlas sets these limits per scope, meaning per combination of cloud provider and Geography. Rate limits for scoped endpoints are the same as those for unscoped endpoints; however, you must request an increase for tier 2 and tier 3 limits for scoped endpoints. Conversely, Atlas automatically applies upgrades for unscoped endpoints.

Scoped endpoints also require a paid usage tier. To learn more, see [Usage Tiers.](https://www.mongodb.com/docs/voyageai/management/billing.md#std-label-voyage-api-usage-tiers)

To learn about Geographies and their endpoints, see [Geographies for Voyage AI Inference.](https://www.mongodb.com/docs/voyageai/geographies.md#std-label-voyage-geographies)

## Best Practices

Rate limits ensure a balanced and efficient usage of the API (Application Programming Interface)'s resources, preventing excessive traffic that could impact the overall performance and accessibility of the service. Specifically, rate limits serve the following vital purposes:

- *Rate limits promote equitable access to the API for all users*. If one individual or organization generates an excessive volume of requests, it could potentially impede the API (Application Programming Interface)'s performance for others. Through rate limiting, we ensure that a larger number of users can use the API (Application Programming Interface) without encountering performance issues.

- *Rate limits enable Voyage AI to effectively manage the workload on
  its infrastructure*. Sudden and substantial spikes in API (Application Programming Interface) requests could strain server resources and lead to performance degradation. By establishing rate limits, Voyage AI can effectively maintain a consistent and reliable experience for all users.

- *They act as a safeguard against potential abuse or misuse of the
  API*. For instance, malicious actors might attempt to inundate the API (Application Programming Interface) with excessive requests to overload it or disrupt its services. By instituting rate limits, Voyage AI can thwart such nefarious activities.

To avoid and manage rate limit errors, we recommend the following best practices.

### Use Large Batches

If you have many documents to embed, you can increase the number of documents you embed per request and increase your overall throughput by sending larger batches. A "batch" is the collection of documents you are embedding in one request, and the "batch size" is the number of documents in the batch, meaning the length of the list of documents.

**Example:**

Suppose you want to vectorize 512 documents. If you used a batch size of 1, then this would require 512 requests and you could hit your RPM (Requests Per Minute) limit. However, if you used a batch size of 128, then this would require only 4 requests and you would not hit your RPM (Requests Per Minute) limit. You can control the batch size by changing the number of documents you provide in the request, and using larger batch sizes will reduce your overall RPM (Requests Per Minute) for a given number of documents.

You must consider the API (Application Programming Interface) maximum batch size and tokens when selecting your batch size. You cannot exceed the API (Application Programming Interface) max batch size. If you have longer documents, the token limit per request might constrain you to a smaller batch size.

### Set a Wait Period

Make requests less frequently. You can do this by pacing your requests, and the most straightforward approach is inserting a wait period between each request.

### Perform Exponential Backoff

Backoff once you've hit your rate limit (that is, receive a `429` error). You could wait for an exponentially increased time after receiving a rate limit error before trying again. Wait until the request is successful or until a maximum number of retries is reached.

**Example:**

If your initial wait time was one second and you got three consecutive rate limit errors before success, you would wait one, two, and four seconds after each rate limit error, respectively, before resending the request.
