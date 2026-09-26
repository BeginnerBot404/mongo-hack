> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Get Started With Native Reranking

**Important:**

Native Reranking is available as a Preview feature. The feature and the corresponding documentation might change at any time during the Preview period. Therefore, we don't recommend using this feature in production environments. We do not use any customer data from this feature to train our models at this time. To learn more, see [Preview Features.](https://www.mongodb.com/docs/preview-features/)

The [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) aggregation stage reorders input documents using [Voyage AI reranking models](https://www.mongodb.com/docs/voyageai/models/rerankers.md#std-label-voyage-rerankers) and returns the same documents sorted by relevance to the query. The `$rerank` stage can appear anywhere in an aggregation pipeline.

You don't need to create an index to run [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) queries. However, MongoDB recommends using [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) after a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch), [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search), [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion), or [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) stage, which require creating a [MongoDB Vector Search](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) or [MongoDB Search](https://www.mongodb.com/docs/search/indexes/manage-indexes.md#std-label-ref-create-index) index on your collection.

This quickstart demonstrates how to enable and use Native Reranking in Atlas by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) aggregation stage on queries against the [sample\_mflix](https://www.mongodb.com/docs/manual/sample-data/sample-mflix.md#std-label-sample-mflix) dataset.

## Prerequisites

Before you begin, complete the following tasks:

- Deploy a Atlas cluster with MongoDB 8.3 or later by selecting Latest Version with Auto-Upgrades in the Atlas UI Cluster Builder page.

  To learn more about an Atlas cluster, see [Create a Cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster). Native reranking is not available for self-managed deployments.

- Load the [sample\_mflix](https://www.mongodb.com/docs/manual/sample-data/sample-mflix.md#std-label-sample-mflix) dataset into your cluster.

  To learn more, see [Load Sample Data.](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-load-sample-data)

- Download and install [`mongosh`.](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh)

  To learn more, see [Install the MongoDB Shell.](https://www.mongodb.com/docs/mongodb-shell/install/)

To learn more about the compatibility and requirements for using `$rerank`, see [Considerations.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#std-label-rerank-considerations)

## Procedure

To get started with native reranking, follow these steps:

1. Enable Native Reranking.

   In Atlas, go to the Project Settings page.

   If it's not already displayed, select the organization that contains your desired project from the  Organizations menu in the navigation bar.

   If it's not already displayed, select your desired project from the Projects menu in the navigation bar.

   In the sidebar, click the  icon next to Project Overview.

   The [Project Settings](https://cloud.mongodb.com/go?l=https%3A%2F%2Fcloud.mongodb.com%2Fv2%2F%3Cproject%3E%23%2Fsettings%2FgroupSettings) page displays.

   1. Scroll down to the Native Reranking section and toggle Enable Native Reranking to On.

   2. Click Confirm.

2. Run a Native Reranking query.

   The following query uses the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage to find the top ten movies that are most relevant to the query for *martial arts*.

   Switch to the `sample_mflix` database:

   ```javascript
   use sample_mflix
   ```

   Run a Native Reranking query.

   The following query uses the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage to return movies that are most relevant to the query for *martial
   arts* using the `rerank-2.5` model. The query *prioritizes
   films about martial arts training and tournaments*. It uses the following pipeline stages:

   | Pipeline Stage | Description |
   | --- | --- |
   | [`$match`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/match.md#mongodb-pipeline-pipe.-match) | Filters the documents to include only documents that have a `fullplot` field of type string. |
   | [`$sort`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/sort.md#mongodb-pipeline-pipe.-sort) | Sorts the documents in descending order of the `released` field to ensure deterministic ordering. |
   | [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reorders the documents to match the query using the `rerank-2.5` reranker model. The `numDocsToRerank` parameter specifies the maximum number of documents to consider for reranking. The `path` parameter specifies the field to use for reranking. |
   | [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds a field named `rerankScore` to the documents. |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to 10 documents. |
   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Excludes all fields except `title`, `fullplot`, and `rerankScore` from the documents in the results. |

   ```json
   db.embedded_movies.aggregate([
     {
       "$match": {
         "fullplot": { "$exists": true, "$type": "string" }
       }
     },
     {
           "$sort": { "released": -1 }
     },
     {
       "$rerank": {
         "model": "rerank-2.5",
         "query": {
           "text": "martial arts; prioritize films about martial arts training and tournaments"
         },
         "path": "fullplot",
         "numDocsToRerank": 100
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
         "fullplot": 1,
         "rerankScore": 1
       }
     }
   ])
   ```

   **Output:**

   ```javascript
   [
     {
       title: 'Ti mene nosis',
       fullplot: 'No treason, no surrender.',
       rerankScore: 0.5986876487731934
     },
     {
       title: 'The Real Miyagi',
       fullplot: 'The life of the greatest karate master of a generation.',
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Peter Pan Live!',
       fullplot: 'A live telecast of the beloved J. M. Barrie story.',
       rerankScore: 0.5986876487731934
     },
     {
       title: "Why Don't You Play in Hell?",
       fullplot: 'A renegade film crew becomes embroiled with a yakuza clan feud.',
       rerankScore: 0.5986876487731934
     },
     {
       fullplot: "A French police magistrate spends years trying to take down one of the country's most powerful drug rings.",
       title: 'The Connection',
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Anomalisa',
       fullplot: "Charlie Kaufman's first stop-motion film about a man crippled by the mundanity of his life.",
       rerankScore: 0.5986876487731934
     },
     {
       title: 'The Master Plan',
       fullplot: 'Charles Ingvar Jènsson gathers three criminals to take vengeance upon the people who killed his uncle.',
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Redeemer',
       fullplot: 'A former hit-man for a drug cartel becomes a vigilante to pay for his sins and find redemption.',
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Rise of the Legend',
       fullplot: 'An orphan, whose father has been killed by dark power, attempts to bring justice back to the town.',
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Darkness on the Edge of Town',
       fullplot: 'A troubled teenage sharpshooter decides to avenge the death of her estranged sister after she is found murdered in a public bathroom.',
       rerankScore: 0.5986876487731934
     }
   ]
   ```

3. Create the indexes for running Native Reranking queries with `$vectorSearch` and `$search`.

   MongoDB recommends using [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) after a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch), [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search), [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion), or [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) stage. To do so, create a MongoDB Vector Search and MongoDB Search index on your collection to run the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stages.

   To try the sample queries that use the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stages in this quickstart, you must create a MongoDB Vector Search and MongoDB Search index on your collection.

   ##### Create a MongoDB Vector Search index

   ###### Create a MongoDB Vector Search index on the plot\_embedding\_voyage\_4\_large field.

   To create the index, complete the following steps:

   Click Search & Vector Search in the sidebar.

   Click Create Index.

   Start your index configuration:

   - Select Vector Search as the index type.

   - Enter `vector_index` as the name of the index.

   - Select the `sample_mflix.embedded_movies` collection.

   - Select JSON Editor as the editor type.

   Click Next and paste the following index definition in the JSON editor:

   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "plot_embedding_voyage_4_large",
         "numDimensions": 2048,
         "similarity": "dotProduct"
       }
     ]
   }
   ```

   Click Next, then click Create Index.

   ##### Create a MongoDB Search index

   ###### Create a MongoDB Search index on the \`\`fullplot\`\` field.

   To create the index, complete the following steps:

   Click Search & Vector Search in the sidebar.

   Click Create Index.

   Start your index configuration:

   - Select Search as the index type.

   - Enter `search_index` as the name of the index.

   - Select the `sample_mflix.embedded_movies` collection.

   - Select JSON Editor as the editor type.

   Click Next and paste the following index definition in the JSON editor:

   ```json
   {
     "mappings": {
       "dynamic": true
     }
   }
   ```

   Click Next, then click Create Index.

4. Prepare to run `$vectorSearch` and `$search` queries with Native Reranking.

   Connect to your cluster using [`mongosh`.](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh)

   Create a file named `embeddings.js` to store the embeddings to use in the queries.

   Copy and paste the following embeddings into the file.

   ```javascript
   MARTIAL_ARTS_EMBEDDINGS=[0.02218237891793251, -0.007462590467184782, -0.01691064052283764,  /* ...embedding floats truncated by snapshot... */ 0.029028791934251785]; 
   ```

   Switch to the `sample_mflix` database:

   ```javascript
   use sample_mflix
   ```

   Load the embeddings into [`mongosh`.](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh)

   ```javascript
   load('embeddings.js');
   ```

5. Run the `$vectorSearch` and `$search` with Native Reranking.

   The following queries use the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage after a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to find the top ten movies that are most relevant to the query for *martial arts*.

   ##### Use Native Reranking with Vector Search

   ###### Run $rerank after $vectorSearch.

   The following query uses the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) stage to match movies that are most relevant to the query for *martial
   arts*. The query then uses the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage to reorder the documents to *focus on combat styles and fight
   choreography*. It uses the following pipeline stages:

   | Pipeline Stage | Description |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a vector search for the query text *martial arts* using the `voyage-4-large` embedding model. The `numCandidates` parameter specifies the maximum number of documents to consider for reranking. |
   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Excludes all fields except `title`, `fullplot`, and `vectorScore` from the documents in the results. |
   | [`$match`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/match.md#mongodb-pipeline-pipe.-match) | Filters the documents to include only documents that have a `fullplot` field of type string. |
   | [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reorders the documents to match the query using the `rerank-2.5` reranker model. The `numDocsToRerank` parameter specifies the maximum number of documents to rerank. The `path` parameter specifies the field to use for reranking. |
   | [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds a field named `rerankScore` to the documents. |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to 10 documents. |
   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Excludes all fields except `title`, `fullplot`, and `rerankScore` from the documents in the results. |

   ```json
   db.embedded_movies.aggregate([
     {
       "$vectorSearch": {
         "index": "vector_index",
         "path": "plot_embedding_voyage_4_large",
         "queryVector": MARTIAL_ARTS_EMBEDDINGS,
         "numCandidates": 100,
         "limit": 100
       }
     },
     { 
       "$project": {
         "_id": 0,
         "title": 1,
         "fullplot": 1,
         "vectorScore": { "$meta": "vectorSearchScore" }
       }
     },
     {
       "$match": {
         "fullplot": { "$exists": true, "$type": "string" }
       }
     },
     {
       "$rerank": {
         "model": "rerank-2.5",
         "query": {
           "text": "martial arts; focus on combat styles and fight choreography"
         },
         "path": "fullplot",
         "numDocsToRerank": 100
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
         "fullplot": 1,
         "vectorScore": 1,
         "rerankScore": 1
       }
     }
   ])
   ```

   **Output:**

   ```javascript
   [
     {
       title: 'The Real Miyagi',
       fullplot: 'The life of the greatest karate master of a generation.',
       vectorScore: 0.7579228281974792,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Kung Fu Killer',
       fullplot: 'A Caucasian monk in Shanghai infiltrates the underworld to find the killers of his spiritual female Grandmaster.',
       vectorScore: 0.7047170996665955,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Dragon Tiger Gate',
       fullplot: 'Three young martial arts masters emerge from the back streets of Hong Kong to help the powerless fight injustice.',
       vectorScore: 0.7224205732345581,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Pistol Opera',
       fullplot: 'The No. 3 assassin of Japan is given the chance to usurp No. 1 and take their place.',
       vectorScore: 0.6872181296348572,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Once Upon a Time in Shanghai',
       fullplot: 'A laborer moves to Shanghai in the hope of becoming rich. But ends up using his kung fu skills to survive.',
       vectorScore: 0.6834211349487305,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Yasmine',
       fullplot: "A young woman who lives with her strict father works to become a a champion at Silat, Brunei's version of kung fu.",
       vectorScore: 0.7219811677932739,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Best of the Best',
       fullplot: 'Team USA gets rid of personal ghosts while fighting Team Korea in Taekwondo championship. "Adversity overcome" formula with excellent fighting scenes.',
       vectorScore: 0.6988193988800049,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Dragon Strike',
       fullplot: 'The adventures of a restless martial arts student called Dragon, who, while constantly pursuing a girl, gets involved in the affairs of a gang of thieves.',
       vectorScore: 0.7163552641868591,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Legendary Weapons of China',
       fullplot: "A band of killers from an ailing kung fu and magic society are sent on a manhunt for a former member of the society, whose bad mouthing threatens it's existence.",
       vectorScore: 0.7019355893135071,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'The Touch',
       fullplot: 'A sister and brother, the last heirs of a family of acrobats, are called upon by a Buddhist monk sect to retrieve an artifact that their ancestors have protected throughout the ages.',
       vectorScore: 0.6897575855255127,
       rerankScore: 0.5986876487731934
     }
   ]
   ```

   ##### Use Native Reranking query with MongoDB Search

   ###### Run $rerank after $search.

   The following query uses the [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to perform a full-text search for the query text *martial arts*. The query then uses the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage to reorder the documents to *prioritize movie plots
   about martial arts competition and training*. It uses the following pipeline stages:

   | Pipeline Stage | Description |
   | --- | --- |
   | [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) | Performs a full-text search for the query text *martial arts*. |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output of the [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to 100 documents. |
   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Excludes all fields except `title`, `fullplot`, and `searchScore` from the documents in the results. |
   | [`$match`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/match.md#mongodb-pipeline-pipe.-match) | Filters the documents to include only documents that have a `fullplot` field of type string. |
   | [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reorders the documents to match the query using the `rerank-2.5` reranker model. The `numDocsToRerank` parameter specifies the maximum number of documents to rerank. The `path` parameter specifies the field to use for reranking. |
   | [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds a field named `rerankScore` to the documents. |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to 10 documents. |
   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Excludes all fields except `title`, `fullplot`, and `rerankScore` from the documents in the results. |

   ```json
   db.embedded_movies.aggregate([
     {
       "$search": {
         "index": "search_index",
         "text": {
           "query": "martial arts",
           "path": "fullplot"
         }
       }
     },
     {
       "$limit": 100
     },
     { 
       "$project": {
         "_id": 0,
         "title": 1,
         "fullplot": 1,
         "searchScore": { "$meta": "searchScore" }
       }
     },
     {
       "$match": {
         "fullplot": { "$exists": true, "$type": "string" }
       }
     },
     {
       "$rerank": {
         "model": "rerank-2.5",
         "query": {
           "text": "martial arts; prioritize movie plots about martial arts competition and training"
         },
         "path": "fullplot",
         "numDocsToRerank": 100
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
         "fullplot": 1,
         "searchScore": 1,
         "rerankScore": 1
       }
     }
   ])
   ```

   **Output:**

   ```javascript
   [
     {
       title: 'Dragon Tiger Gate',
       fullplot: 'Three young martial arts masters emerge from the back streets of Hong Kong to help the powerless fight injustice.',
       searchScore: 5.30598258972168,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Dragon Strike',
       fullplot: 'The adventures of a restless martial arts student called Dragon, who, while constantly pursuing a girl, gets involved in the affairs of a gang of thieves.',
       searchScore: 5.074832439422607,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Here Comes the Boom',
       fullplot: 'A high school biology teacher looks to become a successful mixed-martial arts fighter in an effort to raise money to prevent extra-curricular activities from being axed at his cash-strapped school.',
       searchScore: 4.862981796264648,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Here Comes the Boom',
       fullplot: 'A high school biology teacher looks to become a successful mixed-martial arts fighter in an effort to raise money to prevent extra-curricular activities from being axed at his cash-strapped school.',
       searchScore: 4.862981796264648,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Vampire Effect',
       fullplot: "It's a high-kicking battle on the dark side when an ace vampire slayer and his beautiful sidekicks wage the ultimate martial-arts showdown with one of the most dangerous of the undead.",
       searchScore: 4.862981796264648,
       rerankScore: 0.5986876487731934
     },
     {
       fullplot: 'FBI agent Malcolm Turner and his son, Trent, go undercover at an all-girls performing arts school after Trent witnesses a murder. Posing as Big Momma and Charmaine, they must find the murderer before he finds them.',
       title: 'Big Mommas: Like Father, Like Son',
       searchScore: 2.3932719230651855,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'The Last Dragon',
       fullplot: 'In New York City, a young man searches for the "master" to obtain the final level of martial arts mastery known as the glow. Along the way, he must fight an evil martial arts expert and rescue a beautiful singer from an obsessed music promoter.',
       searchScore: 5.777412414550781,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'SPL: Kill Zone',
       fullplot: 'Chan, an articulate senior detective nearing the end of his career, is taking care of the daughter of a witness killed by ruthless crime lord Po. Martial arts expert Ma is set to take over as head of the crime unit, replacing Chan who wants an early retirement.',
       searchScore: 4.463685035705566,
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Fighter in the Wind',
       fullplot: 'A young Korean man arrives in Japan near the end of World War II with hopes of being a fighter pilot, but ends up on the streets battling racism, organized crime, occupying American servicemen, and his own fear of failure as a martial artist. (Korean with English subtitles)',
       searchScore: 2.2145204544067383,
       rerankScore: 0.5986876487731934
     },
     {
       title: "Bruce Lee: A Warrior's Journey",
       fullplot: "Legendary martial artist Bruce Lee is the subject of this thoughtful documentary by Lee aficionado John Little. Using interviews, behind-the-scenes footage and action sequences from Lee's last (unfinished) film, Game of Death, Little paints a textured, complex portrait of the world's most famous action hero.",
       searchScore: 2.2390332221984863,
       rerankScore: 0.5986876487731934
     }
   ]
   ```

## Additional Resources

To learn more about Native Reranking, see the following resources:

- [$rerank Aggregation Stage](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#std-label-rerank-agg-pipeline)

- [Manage Billing for Native Reranking](https://www.mongodb.com/docs/vector-search/query/native-reranking/billing.md#std-label-native-reranking-billing)

- [Manage Native Reranking](https://www.mongodb.com/docs/vector-search/query/native-reranking/managing.md#std-label-native-reranking-management)

- [Hybrid Search with Native Reranking](https://www.mongodb.com/docs/vector-search/hybrid-search/hybrid-search-overview.md#std-label-avs-hybrid-search)
