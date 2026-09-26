> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# `$rerank` Aggregation Pipeline Stage

**Important:**

Native Reranking is available as a Preview feature. The feature and the corresponding documentation might change at any time during the Preview period. Therefore, we don't recommend using this feature in production environments. We do not use any customer data from this feature to train our models at this time. To learn more, see [Preview Features.](https://www.mongodb.com/docs/preview-features/)

The [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage reorders input documents using [Voyage AI's reranking models](https://www.mongodb.com/docs/voyageai/models/rerankers.md#std-label-voyage-rerankers) and returns the same documents sorted by relevance to the query. The `$rerank` stage can appear anywhere in an aggregation pipeline. MongoDB recommends that you use `$rerank` after a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch), [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search), [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion), or [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) stage.

## Syntax

A `$rerank` pipeline stage has the following syntax:

```json
{
  "$rerank": {
    "query": {
      "text": "<query-text>"
    },
    "path": "<text-field-name>",
    "numDocsToRerank": <number-of-documents-to-rerank>,
    "model": "<reranker-model>"
  }
}
```

## Fields

The `$rerank` stage takes a document with the following fields:

| Field | Type | Necessity | Description |
| --- | --- | --- | --- |
| `query` | Object | Required | Query to use for reranking. |
| `query.``text` | String | Required | Query text to use for reranking. For example, you can specify: What you are searching for; Which fields of a document are most relevant; Complementary information to clarify ambiguous queries |
| `path` | String or Array of Strings | Required | Path to the fields to use for reranking. If `$rerank` is an intermediary stage, specify a field from the results of the preceding stage. NOTE: The `$rerank` query fails if fields specified in the `path` do not exist. Use a prior [`$match`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/match.md#mongodb-pipeline-pipe.-match) stage to filter out documents with missing fields, or use [`$set`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/set.md#mongodb-pipeline-pipe.-set) to set missing fields to `""`. |
| `numDocsToRerank` | Int | Required | Maximum number of documents to send to Voyage AI for reranking and return in the results. Documents are selected based on the pipeline's defined document order. The maximum value must be less than or equal to `1000`. |
| `model` | Object | Required | Voyage AI [model](https://www.mongodb.com/docs/voyageai/models/rerankers.md#std-label-voyage-rerankers) to use to rerank the documents. Value can be one of the following models: `rerank-2.5` - Generalist reranker optimized for quality with instruction-following and multilingual support.; `rerank-2.5-lite` - Generalist reranker optimized for both latency and quality with instruction-following and multilingual support.; `rerank-2` - Legacy model.; `rerank-2-lite` - Legacy model. |

## Considerations

Review the requirements, limitations, and `$rerank` behavior before using `$rerank`.

### Requirements

To use `$rerank`:

- Ensure that your cluster is running MongoDB 8.3 or later by selecting Latest version with auto-upgrades in the Atlas UI Cluster Builder page.

- Enable Native Reranking through Project Settings. To learn more, see [Enable or Disable Native Reranking.](https://www.mongodb.com/docs/vector-search/query/native-reranking/managing.md#std-label-rerank-enable-disable)

### Limitations

You cannot use the `$rerank` stage:

- For self-managed or Atlas Local deployments.

- For [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) or [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) input pipelines.

- For queries on a [View.](https://www.mongodb.com/docs/manual/core/views.md#std-label-views-landing-page)

  If you have a MongoDB Search or MongoDB Vector Search index on a View, query the index by running `.aggregate()` on the source collection instead of the View.

### Behavior

[`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) can appear anywhere in the pipeline. However, MongoDB recommends using `$rerank` after a stage like `$search` or `$vectorSearch` that already returns relevant documents in sorted order.

`$rerank` reranks and returns the first `numDocsToRerank` documents that are passed to the stage. If `$rerank` is the first stage, or prior stages do not return deterministically sorted results, then the documents used for `$rerank` might change between queries.

`$rerank` returns an error if any of the fields specified in `path` are not present in one or more input documents. To mitigate this, use the:

- [`$set`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/set.md#mongodb-pipeline-pipe.-set) stage to set missing fields to an empty string.

- [`$match`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/match.md#mongodb-pipeline-pipe.-match) stage to filter out documents where fields are missing.

### Query

The `query.text` field determines how the reranker model scores each document. The specified [Voyage reranker model](https://www.mongodb.com/docs/voyageai/models/rerankers.md#std-label-voyage-rerankers) computes a relevance score between the query text and the content of each document at the specified `path`. For most use cases, set `$rerank.query.text` to the same or similar text as the query from the preceding `$search` or `$vectorSearch` stage.

### Scoring

Use the `score` variable with the [`$meta`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/meta.md#mongodb-expression-exp.-meta) expression to retrieve the score of each document in the results of the `$rerank` stage.

```json
{
  "$addFields": {
    "rerankScore": { "$meta": "score" }
  }
}
```

The `$rerank` stage replaces the value of `$meta: "score"` with a new score. To preserve the value from a preceding stage like `$rankFusion`, you can project the scores into named fields before the `$rerank` stage.

```text
{
  "$addFields": {
    "originalRankFusionScore": { "$meta": "score" }
  }
},
{
  "$rerank": {
    ...
  }
},
{
  "$addFields": {
    "rerankScore": { "$meta": "score" }
  }
}
```

### Performance and Accuracy

The `$rerank` stage can be computationally expensive, depending on the size of the input such as the fields to rerank over, the number of documents to rerank, and the query text. `$rerank` processes queries and documents jointly at query time. Therefore, `$rerank` might be slower than relevancy search powered by an index, such as the indexes for [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) or [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch). To balance accuracy and performance, configure `numDocsToRerank` and `path` to limit the input size. [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) does not run Voyage AI reranking models on your Atlas cluster resources.

`$rerank` is best suited for workloads where retrieval quality is prioritized over ultra-low latency, such as RAG and agentic AI applications. For workloads that require ultra-low latency, MongoDB recommends using an index-powered search stage like `$search` or `$vectorSearch`.

## Example

The following example demonstrates how to use the `$rerank` stage to reorder documents in the `sample_mflix.embedded_movies` collection based on a Voyage AI reranker model. The query uses `$rerank` after the [`$match`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/match.md#mongodb-pipeline-pipe.-match) stage to reorder documents using the `rerank-2.5` reranker model. In the following aggregation pipeline, the:

- `$match` stage filters the documents to include only documents that have a `plot` field of type string.

- `$sort` stage sorts the documents in descending order of the `released` field to ensure deterministic ordering.

- `$rerank` stage reorders the documents to match the query using the `rerank-2.5` reranker model.

- `$addFields` stage adds a field named `rerankScore` to the documents.

```json
db.embedded_movies.aggregate([
  {
    "$match": {
      "plot": { "$exists": true, "$type": "string" }
    }
  },
  {
    "$sort": { "released": -1 }
  },
  {
    "$rerank": {
      "model": "rerank-2.5",
      "query": {
        "text": "a group of heroes band together to stop a powerful enemy and save the world"
      },
      "numDocsToRerank": 100,
      "path": ["title", "plot"]
    }
  },
  {
    "$addFields": {
      "rerankScore": { "$meta": "score" }
    }
  },
  { "$limit": 10 },
  {
    "$project": {
      "_id": 0,
      "title": 1,
      "plot": 1,
      "rerankScore": 1
    }
  }
])
```

**Output:**

```json
[
  {
    plot: 'No treason, no surrender.',
    title: 'Ti mene nosis',
    rerankScore: 0.5986876487731934
  },
  {
    plot: 'The life of the greatest karate master of a generation.',
    title: 'The Real Miyagi',
    rerankScore: 0.5986876487731934
  },
  {
    plot: 'A shy genius is employed by his former university to design robot software.',
    title: 'Eva',
    rerankScore: 0.5986876487731934
  },
  {
    plot: 'The owners of a failing security company start robbing houses to boost business.',
    title: 'Armed Response',
    rerankScore: 0.5986876487731934
  },
  {
    plot: 'A live telecast of the beloved J. M. Barrie story.',
    title: 'Peter Pan Live!',
    rerankScore: 0.5986876487731934
  },
  {
    plot: "A French police magistrate spends years trying to take down one of the country's most powerful drug rings.",
    title: 'The Connection',
    rerankScore: 0.5986876487731934
  },
  {
    plot: 'A documentary that follows undercover activists trying to stave off a man-made mass extinction.',
    title: 'Racing Extinction',
    rerankScore: 0.5986876487731934
  },
  {
    plot: 'An ex-hitman comes out of retirement to track down the gangsters that took everything from him.',
    title: 'John Wick',
    rerankScore: 0.5986876487731934
  },
  {
    plot: 'A former hit-man for a drug cartel becomes a vigilante to pay for his sins and find redemption.',
    title: 'Redeemer',
    rerankScore: 0.5986876487731934
  },
  {
    plot: 'Charles Ingvar Jènsson gathers three criminals to take vengeance upon the people who killed his uncle.',
    title: 'The Master Plan',
    rerankScore: 0.5986876487731934
  }
]
```
