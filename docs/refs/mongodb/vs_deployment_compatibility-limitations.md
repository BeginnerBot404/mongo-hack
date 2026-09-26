> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# MongoDB Vector Search Compatibility & Limitations

This page describes the compatibility and limitations of MongoDB Vector Search features on Atlas. For details on MongoDB Vector Search compatibility with self-managed deployments, see the [Deployment Options](https://www.mongodb.com/docs/vector-search/deployment/deployment-options.md#std-label-avs-deployment-options) documentation.

## Feature Compatibility

### MongoDB Version Compatibility

| MongoDB Vector Search Feature | MongoDB Version for Feature |
| --- | --- |
| [Create indexes on Views](https://www.mongodb.com/docs/vector-search/query/view-support.md#std-label-avs-transform-documents-collections) | 8.0+ |
| Query Views directly with [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | 8.1+ |
| Views with sharded sub-pipelines via `$lookup`/`$unionWith` | 8.2+ |
| [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) on Views | 8.2+ |
| [Ingest Pre-Quantized BinData Vectors](https://www.mongodb.com/docs/vector-search/about/vector-quantization.md#std-label-avs-bindata-vector-subtype) | 7.0.2+ |
| [Native Reranking](https://www.mongodb.com/docs/vector-search/query/native-reranking/quickstart.md#std-label-native-reranking-quickstart) | 8.3+ |

## Supported Clients

To learn about supported clients, see [Supported Clients.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-index-supported-drivers)

## Index Limitations

A high index count generates significant load on the base cluster and might disrupt your workload. The number of indexes your cluster can support depends on your cluster tier and workload. Smaller cluster tiers like `M10` can experience performance degradation or out-of-memory errors as index count increases. Start with a small number of indexes and monitor your cluster's resource usage as you scale.

You cannot create more than:

- 3 indexes (regardless of the type, `search` or `vector`) on Free clusters.

- 10 indexes on Flex clusters.

To learn more about index limitations, see:

- [Prerequisites](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index-prerequisites)

- [How to Index Fields for Vector Search](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search)

### Field Type Limitations

MongoDB Vector Search indexes support vector embeddings that are less than or equal to 8192 dimensions in length. To learn more about indexing field types, see:

- [How to Index Fields for Vector Search](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search)

- [About Quantization](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-quantization)

### Other Limitations

If you're using a [clustered collection](https://www.mongodb.com/docs/manual/core/clustered-collections.md#std-label-clustered-collections) and have the [`notablescan`](https://www.mongodb.com/docs/manual/reference/parameters.md#mongodb-parameter-param.notablescan) parameter set to `true`, your MongoDB Vector Search indexes may not finish building. To resolve this issue, you must set the `notablescan` parameter to `false` or check your log for index status transitions.

Binary quantization is currently not supported for nested vector indexes. Use `scalar` quantization instead or don't specify any quantization type.

## Query Limitations

### Option Compatibility and Limitations

To learn about query option compatibility and limitations, see:

- [Run Vector Search ANN and ENN Queries](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

- [MongoDB Vector Search Filtering](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-filter)

- [$vectorSearch Options](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options)
