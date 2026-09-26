> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: atlas, self
-->

# Manage Automated Embedding

You can manage Automated Embedding from the Atlas UI.

## Enable or Disable Automated Embedding

### Atlas

To enable Automated Embedding, you must create a MongoDB Vector Search index with the `autoEmbed` type. To learn more, see [Create an Automated Embedding Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

To disable Automated Embedding at the organization level, use an [Atlas Resource Policy](https://www.mongodb.com/docs/atlas/atlas-resource-policies.md#std-label-atlas-resource-policies-overview). You can disable Automated Embedding entirely or disable it with project-level exceptions.

To disable Automated Embedding entirely, use the following syntax in your Atlas Resource Policy:

```text
forbid (
  principal,
  action == ResourcePolicy::Action::"search.index.modify",
  resource
)
when {
  context.search.index.isAutoEmbed
};
```

To disable Automated Embedding with exceptions for specific projects, use the following syntax in your Atlas Resource Policy. Replace each `<project-id>` with the ID of the project to exempt. To find your project ID, see: [Manage Project Settings.](https://www.mongodb.com/docs/atlas/tutorial/manage-project-settings.md#std-label-atlas-modify-project-settings)

```text
forbid (
  principal,
  action == ResourcePolicy::Action::"search.index.modify",
  resource
)
when {
  context.search.index.isAutoEmbed
}
unless {
  resource in ResourcePolicy::Project::"<project-id-1>" ||
  resource in ResourcePolicy::Project::"<project-id-2>"
};
```

When active, these policies prevent new `autoEmbed` type indexes from being created. Indexes created before the resource policy was activated are not affected and must be deleted manually to maintain compliance.

To apply this policy to your organization:

1. In Atlas, go to the Organization Settings page.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   In the sidebar, click Organization Settings.

2. Go to the Resource Policies page.

   In the sidebar, click Resource Policies under the Configurations header.

3. Click Create policy.

4. Name, describe, and define your policy.

   Give the policy a unique name.

   (Optional) Add a description.

   In the Cedar Policy field, paste the Cedar policy. Replace `<project-id>` with your project ID.

5. Click Create policy.

## View Automated Embedding Usage

To view aggregated token usage and embedding model requests for Automated Embedding service, you can use MongoDB Vector Search dashboard or Atlas metrics.

### Monitor Dashboard

### Atlas

1. Log in to [Atlas](https://cloud.mongodb.com).

2. In Atlas, go to the Search & Vector Search page for your cluster.

   You can go the MongoDB Search page from the Search & Vector Search option, or the Data Explorer.

   ###### Search & Vector Search

   If it's not already displayed, select the organization that contains your project from the  Organizations menu in the navigation bar.

   If it's not already displayed, select your project from the Projects menu in the navigation bar.

   In the sidebar, click Search & Vector Search under the Database heading.

   If your project has multiple clusters, select the cluster you want to use from the Select cluster dropdown, then click Go to Atlas Search.

   The [Search & Vector Search](https://cloud.mongodb.com/go?l=https%3A%2F%2Fcloud.mongodb.com%2Fv2%2F%3Cproject%3E%23%2Fclusters%2FatlasSearch%2F%3Ccluster%3E) page displays.

   ###### Data Explorer

   If it's not already displayed, select the organization that contains your project from the  Organizations menu in the navigation bar.

   If it's not already displayed, select your project from the Projects menu in the navigation bar.

   In the sidebar, click Data Explorer under the Database heading.

   Expand the database and select the collection.

   Click the Indexes tab for the collection.

   Click the Search and Vector Search link in the banner.

   The [Search & Vector Search](https://cloud.mongodb.com/go?l=https%3A%2F%2Fcloud.mongodb.com%2Fv2%2F%3Cproject%3E%23%2Fclusters%2FatlasSearch%2F%3Ccluster%3E%3Fdatabase%3Dsample_mflix%26collectionName%3Dusers) page displays.

3. Click the Automated Embedding section if it's not already expanded.

4. Click Usage under Automated Embedding.

   The [Automated Embedding Usage](https://cloud.mongodb.com/go?l=https%3A%2F%2Fcloud.mongodb.com%2Fv2%2F%3Cproject%3E%23%2FautoEmbedding%4E%23%2Fusage%2F) page displays. The Automated Embedding Usage page displays the following information:

   | Section | Description |
   | --- | --- |
   | Usage Summary | Overview of your Automated Embedding usage, including total tokens used and remaining free tokens. |
   | Usage by Model or Index | Breakdown of total token usage by embedding model or selected index during a selected time period. |
   | Usage by Operation | Breakdown of token requests by operation type (indexing and querying). |

5. Filter the usage data by date range and model.

## Monitor Metrics

To monitor Automated Embedding usage using metrics:

### Atlas

1. Log in to [Atlas](https://cloud.mongodb.com).

2. Go to the Metrics view for your cluster.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   If it's not already displayed, select your desired project from the Projects menu in the navigation bar.

   Click on your cluster name to open the Cluster sidebar.

   In the sidebar, click Metrics.

3. Select the Auto Embedding Metrics to review.

   You can monitor Automated Embedding usage through the following metrics in the Auto Embedding Metrics section:

   | Metric | Description |
   | --- | --- |
   | Auto Embedding Index Embedding Request | The Auto Embedding Index Embedding Request graph displays the number of requests to generate embeddings for indexing operations. Rates are shown for each embedding model in use. |
   | Auto Embedding Index Tokens | The Auto Embedding Index Tokens graph displays the number of tokens used for indexing operations. |
   | Auto Embedding Query Embedding Request | The Auto Embedding Query Embedding Request graph displays the number of requests to generate embeddings for query operations. |
   | Auto Embedding Query Tokens | The Auto Embedding Query Tokens graph displays the number of tokens used for query operations. |
   | Auto Embedding Replication Lag | The Auto Embedding Replication Lag graph displays the replication lag in milliseconds for Automated Embedding indexing operations. |

   For each cluster, Atlas displays a single graph that aggregates token usage across all Automated Embedding indexes on the cluster. The graph includes token usage from both the initial sync and steady-state updates, and displays a separate line for each embedding model that your indexes use so you can compare token usage by model.

   If you deployed Search Nodes for workload isolation, Atlas displays this graph in the Search Nodes metrics view for each Search Node instead of the cluster metrics view.

## Manage Rate Limits

You can manage rate limits for Automated Embedding from the Atlas UI.

### View Rate Limits

To view rate limits for Automated Embedding:

### Atlas

1. Log in to [Atlas](https://cloud.mongodb.com).

2. Go to the Search & Vector Search page for your project.

   If it's not already displayed, select your desired organization from the  Organizations menu in the navigation bar.

   If it's not already displayed, select your desired project from the Projects menu in the navigation bar.

   In the sidebar, click Search & Vector Search under the Database header.

   The [Search & Vector Search](https://cloud.mongodb.com/go?l=https%3A%2F%2Fcloud.mongodb.com%2Fv2%2F%3Cproject%3E%23%2FautoEmbedding%2F) page displays.

3. Click the Automated Embedding section if it's not already expanded.

4. Click Rate Limits under Automated Embedding.

   The page displays the following information:

   | Name | Description |
   | --- | --- |
   | Model | List of Voyage AI embedding models. |
   | Tokens Per Minute (TPM) | Number of tokens that you can process per minute. |
   | Requests Per Min (RPM) | Number of API requests that you can send per minute. |

### Increase Rate Limits

If you are on the Free Tier and need to increase rate limits for Automated Embedding, add a payment method to upgrade to a paid tier. To learn more, see [Set Payment Method.](https://www.mongodb.com/docs/atlas/billing.md#std-label-atlas-payment-method)

If you are on a Paid Tier, MongoDB automatically increases rate limits as your usage increases. If you still need a higher rate limit, contact [MongoDB Support.](https://support.mongodb.com/)
