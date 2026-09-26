> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Troubleshooting

This document provides advice for troubleshooting problems with MongoDB Vector Search. For direct assistance with MongoDB Vector Search issues, you can either start a discussion on the MongoDB communities on [Reddit](https://www.reddit.com/r/mongodb/) or [Stack Overflow](https://stackoverflow.com/questions/tagged/mongodb), or [contact support.](https://www.mongodb.com/docs/atlas/support.md#std-label-request-support)

## Cannot use the `$vectorSearch` stage on cluster

To use the `$vectorSearch` pipeline stage to query your cluster, your cluster must run MongoDB 7.0.2+. If you invoke `$vectorSearch` on an incompatible version of MongoDB, you might see the following error:

```sh
OperationFailure: $vectorSearch is not allowed with the current
configuration. You may need to enable the corresponding feature
flag.
```

To check the MongoDB version of your cluster:

1. In Atlas, go to the Clusters page for your project.

   If it's not already displayed, select the organization that contains your desired project from the  Organizations menu in the navigation bar.

   If it's not already displayed, select your desired project from the Projects menu in the navigation bar.

   In the sidebar, click Clusters under the Database heading.

   The [Clusters](https://cloud.mongodb.com/go?l=https%3A%2F%2Fcloud.mongodb.com%2Fv2%2F%3Cproject%3E%23%2Fclusters) page displays.

2. Locate the information pane of the cluster you want to use `$vectorSearch` on.

3. Consult the Version number in the bottom section of the information pane.

If your cluster runs a version of MongoDB earlier than 6.0.11 or 7.0.2, you must [upgrade the MongoDB version of the cluster.](https://www.mongodb.com/docs/atlas/atlas-versions.md#std-label-scale-cluster-version)

## Slow queries

For recommendations on improving query performance, see [Benchmark for MongoDB Vector Search.](https://www.mongodb.com/docs/vector-search/benchmark/benchmark-tests.md#std-label-avs-performance-tuning)

## `$vectorSearch` returns no results

If `$vectorSearch` queries return no results, perform the following actions:

- Ensure that you're using the same embedding model for both your data and your query. If you embed your query using a different model than you use to embed your data, `$vectorSearch` can't identify matches.

- Ensure that your MongoDB Vector Search has finished building. When you create or update a MongoDB Vector Search index, the index the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

## `Error during document retrieval` when using filtering with LangChain

When you use LangChain to perform RAG (Retrieval-Augmented Generation) with pre-filtering, you might encounter the following error:

```js
Error during the document retrieval or generation process:
MongoServerError: PlanExecutor error during aggregation :: caused
by :: Path 'field' needs to be indexed as token
```

If an index on `field` exists, ensure you have created this index as a MongoDB Vector Search index, not a MongoDB Search index. If no index on `field` exists, [create one](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index). To learn more about implementing RAG (Retrieval-Augmented Generation) with MongoDB Vector Search and LangChain, see [Answer Questions on Your Data.](https://www.mongodb.com/docs/atlas/ai-integrations/langchain/get-started.md#std-label-langchain-rag)

## `Command not found` when creating MongoDB Vector Search index

When you attempt to create a MongoDB Vector Search index programmatically, you might encounter a `Command not found` error. This error occurs for one of two reasons:

- You run the command against a cluster running a version of MongoDB earlier than 6.0.11 or 7.0.2. In this case, you must [upgrade the MongoDB version of the cluster](https://www.mongodb.com/docs/atlas/atlas-versions.md#std-label-scale-cluster-version) to enable MongoDB Vector Search for the cluster.

- You run the command against a Free cluster (formerly known as `M0`). In this case, as long as the cluster is running a compatible MongoDB version, you can [create a MongoDB Vector Search index with the Atlas UI.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index-procedure)

## Unable to filter on a given field

MongoDB Vector Search currently supports filtering only on fields with boolean, date, number, objectId, string, and UUID values. To learn more, see [About the `filter` Type.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-filter-vector)
