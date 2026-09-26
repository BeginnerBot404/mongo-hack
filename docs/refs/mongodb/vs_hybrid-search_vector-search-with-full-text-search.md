> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: cloud, local
-->

# Perform Hybrid Vector and Full-Text Search

This tutorial demonstrates a hybrid search that is an aggregation of full-text and semantic search for the same query criteria. While full-text is effective in finding exact matches for query terms, semantic search provides the added benefit of identifying semantically similar documents even if the documents don't contain the exact query term. This ensures that synonymous and contextually similar matches are also included in the combined results of both methods of search.

Conversely, if you have tokens for proper nouns or specific keywords in your dataset that you don't expect to be considered in the training of an embedding model in the same context that they are used in your dataset, your vector search might benefit from being combined with a full-text search.

You can also set weights for each method of search per query. Based on whether full-text or semantic search results are most relevant and appropriate for a query, you can increase the weight for that search method per query.

You can reorder the documents in the results based on the relevance to the query by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage after the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) or [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) stage. The `$rerank` stage reorders the documents based on a Voyage AI reranker model.

## About the Tutorial

This tutorial demonstrates how to run a hybrid search combining MongoDB Vector Search and MongoDB Search queries on the `sample_mflix.embedded_movies` collection, which contains details about movies, for unified search results. Specifically, this tutorial takes you through the following steps:

1. Create a MongoDB Vector Search index on the `plot_embedding_voyage_4_large` field. This field contains vector embeddings that represent the summary of a movie's plot.

2. Create a MongoDB Search index on the `fullplot` field in the `sample_mflix.embedded_movies` collection. This field contains the movie's name as a text string.

3. Run a query that uses [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) or [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) to combine the results from a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query against the `plot_embedding_voyage_4_large` field and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query against the `fullplot` field and then reorder the documents in the results based on the relevance to the query by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage.

## Prerequisites

Before you begin, complete the [prerequisites.](https://www.mongodb.com/docs/vector-search/hybrid-search/hybrid-search-overview.md#std-label-avs-hybrid-search-prereqs)

## Procedures

### Create the MongoDB Vector Search and MongoDB Search Indexes

This section demonstrates how to create the following indexes on the fields in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search index on the `plot_embedding_voyage_4_large` field for running vector queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Connect to your cluster using MongoDB Compass.

   Open [Compass](https://www.mongodb.com/try/download/compass) and connect to your cluster. For detailed instructions, see [Connect to a Cluster via Compass.](https://www.mongodb.com/docs/atlas/compass-connection.md#std-label-atlas-connect-via-compass)

2. Specify the database and collection.

   On the Database screen, click the name of the database, then click the name of the collection.

3. Create the MongoDB Vector Search index.

   In the Indexes tab, then select Search Indexes.

   From the Create dropdown, select Search Index.

   In the Name of Search Index field, enter `hybrid-vector-search`.

   Your MongoDB Vector Search index is named `vector_index` by default. If you use this name, then your index will be the default MongoDB Vector Search index for any MongoDB Vector Search query that does not specify a different index name in the pipeline. If you are creating multiple indexes, we recommend that you maintain a consistent, descriptive naming convention across your indexes.

   Under Vector Search, specify the JSON (Javascript Object Notation) MongoDB Vector Search index definition.

   ```json
   {
     "fields": [{
       "type": "vector",
       "path": "plot_embedding_voyage_4_large",
       "numDimensions": 2048,
       "similarity": "dotProduct"
     }]
   }
   ```

   Click Create Search Index.

4. Create the MongoDB Search index.

   In the Indexes tab, then select Search Indexes.

   From the Create dropdown, select Search Index.

   In the Name of Search Index field, enter `hybrid-full-text-search`.

   Your MongoDB Search index is named `default` by default. If you keep this name, then your index will be the default Search index for any MongoDB Search query that does not specify a different `index` option in its [operators](https://www.mongodb.com/docs/search/query/operators-collectors/overview.md#std-label-fts-operators). If you are creating multiple indexes, we recommend that you maintain a consistent, descriptive naming convention across your indexes.

   Under Search, specify the JSON (Javascript Object Notation) MongoDB Vector Search index definition.

   ```json
   {
     "mappings": {
       "dynamic": true
     }
   }
   ```

   Click Create Search Index.

This section demonstrates how to create the following indexes on the fields in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search index on the `plot_embedding_voyage_4_large` field for running vector queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Connect to the cluster using [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh).

   To learn more, see [Connect to a Cluster via mongosh.](https://www.mongodb.com/docs/atlas/mongo-shell-connection.md#std-label-connect-mongo-shell)

2. Switch to the database that contains the collection for which you want to create the index.

   ```shell
   use sample_mflix
   ```

   **Output:**

   ```shell
   switched to db sample_mflix
   ```

3. Define the MongoDB Vector Search index.

   Run the following command. This index definition indexes the `plot_embedding_voyage_4_large` field as the MongoDB Vector Search field when querying the collection.

   ```shell
   db.embedded_movies.createSearchIndex(
     "hybrid-vector-search", 
     "vectorSearch", 
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
   );
   ```

4. Define the MongoDB Search index.

   The following index definition automatically indexes all the dynamically indexable fields in the collection.

   ```shell
   db.embedded_movies.createSearchIndex(
     "hybrid-full-text-search", 
     "search", 
     {
       "mappings": {
         "dynamic": true
       }
     }
   );
   ```

This section demonstrates how to create the following indexes on the fields in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search index on the `plot_embedding_voyage_4_large` field for running vector queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Initialize your Node.js project.

   ```shell
   # Create a new directory and initialize the project
   mkdir atlas-search-project && cd atlas-search-project
   npm init -y

   # Add the MongoDB Node.js Driver to your project
   npm install mongodb
   ```

   For detailed installation instructions, see the [MongoDB Node Driver documentation.](https://www.mongodb.com/docs/drivers/node/current/)

2. Define the MongoDB Vector Search index.

   The following index definition indexes the `plot_embedding_voyage_4_large` field as the MongoDB Vector Search field when querying the collection.

   Create a file named `vector-search-index.js`, and paste the following code into it:

   ```javascript
   const { MongoClient } = require("mongodb");

   // Connect to your MongoDB deployment
   const MONGODB_URI = "<connection-string>";
   const client = new MongoClient(MONGODB_URI);

   async function run() {
       try {
         const database = client.db("sample_mflix");
         const collection = database.collection("embedded_movies");

         // Define your vector search index
         const index = {
             name: "hybrid-vector-search",
             type: "vectorSearch",
             definition: {
               "fields": [
                 {
                   "type": "vector",
                   "numDimensions": 2048,
                   "path": "plot_embedding_voyage_4_large",
                   "similarity": "dotProduct"
                 }
               ]
             }
         }

         // Call the method to create the index
         const result = await collection.createSearchIndex(index);
         console.log(result);
       } finally {
         await client.close();
       }
   }
   run().catch(console.dir);

   ```

   Run the following command to execute the code:

   ```javascript
   node vector-search-index.js
   ```

   **Output:**

   ```javascript
   hybrid-vector-search
   ```

   MongoDB Vector Search might take few minutes to create the index.

3. Define the MongoDB Search index.

   The following index definition automatically indexes all dynamically indexable field types in the collection.

   Create a file named `text-search-index.js`, and paste the following code into it:

   ```javascript
   const { MongoClient } = require("mongodb");

   // Connect to your MongoDB deployment
   const MONGODB_URI = "<connection-string>";
   const client = new MongoClient(MONGODB_URI);

   async function run() {
       try {
         const database = client.db("sample_mflix");
         const collection = database.collection("embedded_movies");

         // Define your search index
         const index = {
             name: "hybrid-full-text-search",
             type: "search",
             definition: {
               "mappings": {
                 "dynamic": true
               }
             }
         }

         // Call the method to create the index
         const result = await collection.createSearchIndex(index);
         console.log(result);
       } finally {
         await client.close();
       }
   }
   run().catch(console.dir);
   ```

   Run the following command to execute the code:

   ```javascript
   node text-search-index.js
   ```

   **Output:**

   ```javascript
   hybrid-full-text-search
   ```

   MongoDB Search might take few minutes to create the index.

This section demonstrates how to create the following indexes on the fields in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search index on the `plot_embedding_voyage_4_large` field for running vector queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Set up the Python project.

   ```shell
   # Create a new directory for the project
   mkdir atlas-search-project && cd atlas-search-project

   # Install PyMongo
   pip install pymongo
   ```

   For detailed installation instructions, see [MongoDB Python Driver (PyMongo).](https://www.mongodb.com/docs/languages/python/pymongo-driver/get-started.md#std-label-pymongo-get-started-download-and-install)

2. Define the MongoDB Vector Search index.

   Create a `create_vector_index.py` file in your project directory, and copy and paste the following code into the file.

   ```python
   from pymongo.mongo_client import MongoClient
   from pymongo.operations import SearchIndexModel
   import time

   # Connect to your Atlas deployment
   uri = "<connection-string>"
   client = MongoClient(uri)

   # Access your database and collection
   database = client["sample_mflix"]
   collection = database["embedded_movies"]

   # Define your index
   search_index_model = SearchIndexModel(
     definition={
       "fields": [
         {
           "type": "vector",
           "path": "plot_embedding_voyage_4_large",
           "numDimensions": 2048,
           "similarity": "dotProduct"
         }
       ]
     },
     name="hybrid-vector-search",
     type="vectorSearch"
   )

   # Create the index
   result = collection.create_search_index(model=search_index_model)
   print("New search index named " + result + " is building.")

   # Wait for initial sync to complete
   print("Polling to check if the index is ready. This may take up to a minute.")
   predicate=None
   if predicate is None:
     predicate = lambda index: index.get("queryable") is True

   while True:
     indices = list(collection.list_search_indexes(result))
     if len(indices) and predicate(indices[0]):
       break
     time.sleep(5)
   print(result + " is ready for querying.")

   client.close()
   ```

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Create the MongoDB Vector Search index.

   ```shell
   python create_vector_index.py
   ```

   **Output:**

   ```text
   New search index named hybrid-vector-search is building.
   Polling to check if the index is ready. This may take up to a minute.
   hybrid-vector-search is ready for querying.
   ```

4. Define the MongoDB Vector Search index.

   Create a `create_search_index.py` file in your project directory, and copy and paste the following code into the file.

   ```python
   from pymongo.mongo_client import MongoClient
   from pymongo.operations import SearchIndexModel
   import time

   # Connect to your Atlas deployment
   uri = "<connection-string>"
   client = MongoClient(uri)

   # Access your database and collection
   database = client["sample_mflix"]
   collection = database["embedded_movies"]

   # Define your index 
   search_index_model = SearchIndexModel(
       definition={
           "mappings": {
               "dynamic": True,
           },
       },
       name="hybrid-full-text-search",
   )

   # Create the index
   result = collection.create_search_index(model=search_index_model)
   print("New search index named " + result + " is building.")

   # Wait for initial sync to complete
   print("Polling to check if the index is ready. This may take up to a minute.")
   predicate=None
   if predicate is None:
     predicate = lambda index: index.get("queryable") is True

   while True:
     indices = list(collection.list_search_indexes(result))
     if len(indices) and predicate(indices[0]):
       break
     time.sleep(5)
   print(result + " is ready for querying.")

   client.close()
   ```

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

5. Create the MongoDB Vector Search index.

   ```shell
   python create_search_index.py
   ```

   **Output:**

   ```text
   New search index named hybrid-full-text-search is building.
   Polling to check if the index is ready. This may take up to a minute.
   hybrid-full-text-search is ready for querying.
   ```

This section demonstrates how to create the following indexes on the fields in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search index on the `plot_embedding_voyage_4_large` field for running vector queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Connect to your cluster using MongoDB Compass.

   Open [Compass](https://www.mongodb.com/try/download/compass) and connect to your cluster. For detailed instructions, see [Connect to a Cluster via Compass.](https://www.mongodb.com/docs/atlas/compass-connection.md#std-label-atlas-connect-via-compass)

2. Specify the database and collection.

   On the Database screen, click the name of the database, then click the name of the collection.

3. Create the MongoDB Vector Search index.

   In the Indexes tab, then select Search Indexes.

   From the Create dropdown, select Search Index.

   In the Name of Search Index field, enter `hybrid-vector-search`.

   Your MongoDB Vector Search index is named `vector_index` by default. If you use this name, then your index will be the default MongoDB Vector Search index for any MongoDB Vector Search query that does not specify a different index name in the pipeline. If you are creating multiple indexes, we recommend that you maintain a consistent, descriptive naming convention across your indexes.

   Under Vector Search, specify the JSON (Javascript Object Notation) MongoDB Vector Search index definition.

   ```json
   {
     "fields": [{
       "type": "vector",
       "path": "plot_embedding_voyage_4_large",
       "numDimensions": 2048,
       "similarity": "dotProduct"
     }]
   }
   ```

   Click Create Search Index.

4. Create the MongoDB Search index.

   In the Indexes tab, then select Search Indexes.

   From the Create dropdown, select Search Index.

   In the Name of Search Index field, enter `hybrid-full-text-search`.

   Your MongoDB Search index is named `default` by default. If you keep this name, then your index will be the default Search index for any MongoDB Search query that does not specify a different `index` option in its [operators](https://www.mongodb.com/docs/search/query/operators-collectors/overview.md#std-label-fts-operators). If you are creating multiple indexes, we recommend that you maintain a consistent, descriptive naming convention across your indexes.

   Under Search, specify the JSON (Javascript Object Notation) MongoDB Vector Search index definition.

   ```json
   {
     "mappings": {
       "dynamic": true
     }
   }
   ```

   Click Create Search Index.

This section demonstrates how to create the following indexes on the fields in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search index on the `plot_embedding_voyage_4_large` field for running vector queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Connect to the cluster using [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh).

   To learn more, see [Connect to a Cluster via mongosh.](https://www.mongodb.com/docs/atlas/mongo-shell-connection.md#std-label-connect-mongo-shell)

2. Switch to the database that contains the collection for which you want to create the index.

   ```shell
   use sample_mflix
   ```

   **Output:**

   ```shell
   switched to db sample_mflix
   ```

3. Define the MongoDB Vector Search index.

   Run the following command. This index definition indexes the `plot_embedding_voyage_4_large` field as the MongoDB Vector Search field when querying the collection.

   ```shell
   db.embedded_movies.createSearchIndex(
     "hybrid-vector-search", 
     "vectorSearch", 
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
   );
   ```

4. Define the MongoDB Search index.

   The following index definition automatically indexes all the dynamically indexable fields in the collection.

   ```shell
   db.embedded_movies.createSearchIndex(
     "hybrid-full-text-search", 
     "search", 
     {
       "mappings": {
         "dynamic": true
       }
     }
   );
   ```

This section demonstrates how to create the following indexes on the fields in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search index on the `plot_embedding_voyage_4_large` field for running vector queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Initialize your Node.js project.

   ```shell
   # Create a new directory and initialize the project
   mkdir atlas-search-project && cd atlas-search-project
   npm init -y

   # Add the MongoDB Node.js Driver to your project
   npm install mongodb
   ```

   For detailed installation instructions, see the [MongoDB Node Driver documentation.](https://www.mongodb.com/docs/drivers/node/current/)

2. Define the MongoDB Vector Search index.

   The following index definition indexes the `plot_embedding_voyage_4_large` field as the MongoDB Vector Search field when querying the collection.

   Create a file named `vector-search-index.js`, and paste the following code into it:

   ```javascript
   const { MongoClient } = require("mongodb");

   // Connect to your MongoDB deployment
   const MONGODB_URI = "<connection-string>";
   const client = new MongoClient(MONGODB_URI);

   async function run() {
       try {
         const database = client.db("sample_mflix");
         const collection = database.collection("embedded_movies");

         // Define your vector search index
         const index = {
             name: "hybrid-vector-search",
             type: "vectorSearch",
             definition: {
               "fields": [
                 {
                   "type": "vector",
                   "numDimensions": 2048,
                   "path": "plot_embedding_voyage_4_large",
                   "similarity": "dotProduct"
                 }
               ]
             }
         }

         // Call the method to create the index
         const result = await collection.createSearchIndex(index);
         console.log(result);
       } finally {
         await client.close();
       }
   }
   run().catch(console.dir);

   ```

   Run the following command to execute the code:

   ```javascript
   node vector-search-index.js
   ```

   **Output:**

   ```javascript
   hybrid-vector-search
   ```

   MongoDB Vector Search might take few minutes to create the index.

3. Define the MongoDB Search index.

   The following index definition automatically indexes all dynamically indexable field types in the collection.

   Create a file named `text-search-index.js`, and paste the following code into it:

   ```javascript
   const { MongoClient } = require("mongodb");

   // Connect to your MongoDB deployment
   const MONGODB_URI = "<connection-string>";
   const client = new MongoClient(MONGODB_URI);

   async function run() {
       try {
         const database = client.db("sample_mflix");
         const collection = database.collection("embedded_movies");

         // Define your search index
         const index = {
             name: "hybrid-full-text-search",
             type: "search",
             definition: {
               "mappings": {
                 "dynamic": true
               }
             }
         }

         // Call the method to create the index
         const result = await collection.createSearchIndex(index);
         console.log(result);
       } finally {
         await client.close();
       }
   }
   run().catch(console.dir);
   ```

   Run the following command to execute the code:

   ```javascript
   node text-search-index.js
   ```

   **Output:**

   ```javascript
   hybrid-full-text-search
   ```

   MongoDB Search might take few minutes to create the index.

This section demonstrates how to create the following indexes on the fields in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search index on the `plot_embedding_voyage_4_large` field for running vector queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Set up the Python project.

   ```shell
   # Create a new directory for the project
   mkdir atlas-search-project && cd atlas-search-project

   # Install PyMongo
   pip install pymongo
   ```

   For detailed installation instructions, see [MongoDB Python Driver (PyMongo).](https://www.mongodb.com/docs/languages/python/pymongo-driver/get-started.md#std-label-pymongo-get-started-download-and-install)

2. Define the MongoDB Vector Search index.

   Create a `create_vector_index.py` file in your project directory, and copy and paste the following code into the file.

   ```python
   from pymongo.mongo_client import MongoClient
   from pymongo.operations import SearchIndexModel
   import time

   # Connect to your Atlas deployment
   uri = "<connection-string>"
   client = MongoClient(uri)

   # Access your database and collection
   database = client["sample_mflix"]
   collection = database["embedded_movies"]

   # Define your index
   search_index_model = SearchIndexModel(
     definition={
       "fields": [
         {
           "type": "vector",
           "path": "plot_embedding_voyage_4_large",
           "numDimensions": 2048,
           "similarity": "dotProduct"
         }
       ]
     },
     name="hybrid-vector-search",
     type="vectorSearch"
   )

   # Create the index
   result = collection.create_search_index(model=search_index_model)
   print("New search index named " + result + " is building.")

   # Wait for initial sync to complete
   print("Polling to check if the index is ready. This may take up to a minute.")
   predicate=None
   if predicate is None:
     predicate = lambda index: index.get("queryable") is True

   while True:
     indices = list(collection.list_search_indexes(result))
     if len(indices) and predicate(indices[0]):
       break
     time.sleep(5)
   print(result + " is ready for querying.")

   client.close()
   ```

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Create the MongoDB Vector Search index.

   ```shell
   python create_vector_index.py
   ```

   **Output:**

   ```text
   New search index named hybrid-vector-search is building.
   Polling to check if the index is ready. This may take up to a minute.
   hybrid-vector-search is ready for querying.
   ```

4. Define the MongoDB Vector Search index.

   Create a `create_search_index.py` file in your project directory, and copy and paste the following code into the file.

   ```python
   from pymongo.mongo_client import MongoClient
   from pymongo.operations import SearchIndexModel
   import time

   # Connect to your Atlas deployment
   uri = "<connection-string>"
   client = MongoClient(uri)

   # Access your database and collection
   database = client["sample_mflix"]
   collection = database["embedded_movies"]

   # Define your index 
   search_index_model = SearchIndexModel(
       definition={
           "mappings": {
               "dynamic": True,
           },
       },
       name="hybrid-full-text-search",
   )

   # Create the index
   result = collection.create_search_index(model=search_index_model)
   print("New search index named " + result + " is building.")

   # Wait for initial sync to complete
   print("Polling to check if the index is ready. This may take up to a minute.")
   predicate=None
   if predicate is None:
     predicate = lambda index: index.get("queryable") is True

   while True:
     indices = list(collection.list_search_indexes(result))
     if len(indices) and predicate(indices[0]):
       break
     time.sleep(5)
   print(result + " is ready for querying.")

   client.close()
   ```

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

5. Create the MongoDB Vector Search index.

   ```shell
   python create_search_index.py
   ```

   **Output:**

   ```text
   New search index named hybrid-full-text-search is building.
   Polling to check if the index is ready. This may take up to a minute.
   hybrid-full-text-search is ready for querying.
   ```

This section demonstrates how to create the following indexes on the `fullplot` field in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search `autoEmbed` type index for generating embeddings and running semantic search queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Connect to your cluster using MongoDB Compass.

   Open [Compass](https://www.mongodb.com/try/download/compass) and connect to your cluster. For detailed instructions, see [Connect to a Cluster via Compass.](https://www.mongodb.com/docs/atlas/compass-connection.md#std-label-atlas-connect-via-compass)

2. Specify the database and collection.

   On the Database screen, click the name of the database, then click the name of the collection.

3. Create the MongoDB Vector Search index.

   In the Indexes tab, then select Search Indexes.

   From the Create dropdown, select Search Index.

   In the Name of Search Index field, enter `hybrid-vector-search`.

   Under Vector Search, specify the JSON (Javascript Object Notation) MongoDB Vector Search index definition.

   ```json
   {
     "fields": [
       {
         "type": "autoEmbed",
         "modality": "text",
         "path": "fullplot",
         "model": "voyage-4"
       }
     ]
   }
   ```

   This index definition indexes the `fullplot` field as the `autoEmbed` field, for which MongoDB Vector Search automatically generates embeddings using the `voyage-4` embedding model.

   Click Create Search Index.

4. Create the MongoDB Search index.

   In the Indexes tab, then select Search Indexes.

   From the Create dropdown, select Search Index.

   In the Name of Search Index field, enter `hybrid-full-text-search`.

   Your MongoDB Search index is named `default` by default. If you keep this name, then your index will be the default Search index for any MongoDB Search query that does not specify a different `index` option in its [operators](https://www.mongodb.com/docs/search/query/operators-collectors/overview.md#std-label-fts-operators). If you are creating multiple indexes, we recommend that you maintain a consistent, descriptive naming convention across your indexes.

   Under Search, specify the JSON (Javascript Object Notation) MongoDB Vector Search index definition.

   ```json
   {
     "mappings": {
       "dynamic": true
     }
   }
   ```

   Click Create Search Index.

This section demonstrates how to create the following indexes on the `fullplot` field in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search `autoEmbed` type index for generating embeddings and running semantic search queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Connect to the cluster using [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh).

   To learn more, see [Connect to a Cluster via mongosh.](https://www.mongodb.com/docs/atlas/mongo-shell-connection.md#std-label-connect-mongo-shell)

2. Switch to the database that contains the collection for which you want to create the index.

   ```shell
   use sample_mflix
   ```

   **Output:**

   ```shell
   switched to db sample_mflix
   ```

3. Define the MongoDB Vector Search index.

   Run the following command. This index definition indexes the `fullplot` field as the MongoDB Vector Search field, for which MongoDB Vector Search automatically generates embeddings using the `voyage-4` embedding model.

   ```shell
   db.embedded_movies.createSearchIndex(
     "hybrid-vector-search", 
     "vectorSearch", 
     {
       "fields": [
         {
           "type": "autoEmbed",
           "modality": "text",
           "path": "fullplot",
           "model": "voyage-4"
         }
       ]
     }
   );
   ```

4. Define the MongoDB Search index.

   The following index definition automatically indexes all the dynamically indexable fields in the collection.

   ```shell
   db.embedded_movies.createSearchIndex(
     "hybrid-full-text-search", 
     "search", 
     {
       "mappings": {
         "dynamic": true
       }
     }
   );
   ```

This section demonstrates how to create the following indexes on the `fullplot` field in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search `autoEmbed` type index for generating embeddings and running semantic search queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Initialize your Node.js project.

   ```shell
   # Create a new directory and initialize the project
   mkdir atlas-search-project && cd atlas-search-project
   npm init -y

   # Add the MongoDB Node.js Driver to your project
   npm install mongodb
   ```

   For detailed installation instructions, see the [MongoDB Node Driver documentation.](https://www.mongodb.com/docs/drivers/node/current/)

2. Define the MongoDB Vector Search index.

   The following index definition indexes the `fullplot` field as the `autoEmbed` type field, for which MongoDB Vector Search automatically generates embeddings using the `voyage-4` embedding model.

   Create a file named `vector-search-index.js`, and paste the following code into it:

   ```javascript
   const { MongoClient } = require("mongodb");

   // Connect to your MongoDB deployment
   const MONGODB_URI = "<connection-string>";
   const client = new MongoClient(MONGODB_URI);

   async function run() {
       try {
         const database = client.db("sample_mflix");
         const collection = database.collection("embedded_movies");

         // Define your vector search index
         const index = {
             name: "hybrid-vector-search",
             type: "vectorSearch",
             definition: {
               "fields": [
                 {
                   "type": "autoEmbed",
                   "modality": "text",
                   "path": "fullplot",
                   "model": "voyage-4"
                 }
               ]
             }
         }

         // Call the method to create the index
         const result = await collection.createSearchIndex(index);
         console.log(result);
       } finally {
         await client.close();
       }
   }
   run().catch(console.dir);

   ```

   Run the following command to execute the code:

   ```javascript
   node vector-search-index.js
   ```

   **Output:**

   ```javascript
   hybrid-vector-search
   ```

   MongoDB Vector Search might take few minutes to create the index.

3. Define the MongoDB Search index.

   The following index definition automatically indexes all dynamically indexable field types in the collection.

   Create a file named `text-search-index.js`, and paste the following code into it:

   ```javascript
   const { MongoClient } = require("mongodb");

   // Connect to your MongoDB deployment
   const MONGODB_URI = "<connection-string>";
   const client = new MongoClient(MONGODB_URI);

   async function run() {
       try {
         const database = client.db("sample_mflix");
         const collection = database.collection("embedded_movies");

         // Define your search index
         const index = {
             name: "hybrid-full-text-search",
             type: "search",
             definition: {
               "mappings": {
                 "dynamic": true
               }
             }
         }

         // Call the method to create the index
         const result = await collection.createSearchIndex(index);
         console.log(result);
       } finally {
         await client.close();
       }
   }
   run().catch(console.dir);
   ```

   This index definition indexes the `fullplot` field as the `autoEmbed` field, for which MongoDB Vector Search automatically generates embeddings using the `voyage-4` embedding model.

   Run the following command to execute the code:

   ```javascript
   node text-search-index.js
   ```

   **Output:**

   ```javascript
   hybrid-full-text-search
   ```

   MongoDB Search might take few minutes to create the index.

This section demonstrates how to create the following indexes on the `fullplot` field in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search `autoEmbed` type index for generating embeddings and running semantic search queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Set up the Python project.

   ```shell
   # Create a new directory for the project
   mkdir atlas-search-project && cd atlas-search-project

   # Install PyMongo
   pip install pymongo
   ```

   For detailed installation instructions, see [MongoDB Python Driver (PyMongo).](https://www.mongodb.com/docs/languages/python/pymongo-driver/get-started.md#std-label-pymongo-get-started-download-and-install)

2. Define the MongoDB Vector Search index.

   Create a `create_vector_index.py` file in your project directory, and copy and paste the following code into the file.

   ```python
   from pymongo.mongo_client import MongoClient
   from pymongo.operations import SearchIndexModel
   import time

   # Connect to your Atlas deployment
   uri = "<connection-string>"
   client = MongoClient(uri)

   # Access your database and collection
   database = client["sample_mflix"]
   collection = database["embedded_movies"]

   # Define your index
   search_index_model = SearchIndexModel(
     definition={
       "fields": [
         {
           "type": "autoEmbed",
           "modality": "text",
           "path": "fullplot",
           "model": "voyage-4"
         }
       ]
     },
     name="hybrid-vector-search",
     type="vectorSearch"
   )

   # Create the index
   result = collection.create_search_index(model=search_index_model)
   print("New search index named " + result + " is building.")

   # Wait for initial sync to complete
   print("Polling to check if the index is ready. This may take up to a minute.")
   predicate=None
   if predicate is None:
     predicate = lambda index: index.get("queryable") is True

   while True:
     indices = list(collection.list_search_indexes(result))
     if len(indices) and predicate(indices[0]):
       break
     time.sleep(5)
   print(result + " is ready for querying.")

   client.close()
   ```

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Create the MongoDB Vector Search index.

   ```shell
   python create_vector_index.py
   ```

   **Output:**

   ```text
   New search index named hybrid-vector-search is building.
   Polling to check if the index is ready. This may take up to a minute.
   hybrid-vector-search is ready for querying.
   ```

4. Define the MongoDB Vector Search index.

   Create a `create_search_index.py` file in your project directory, and copy and paste the following code into the file.

   ```python
   from pymongo.mongo_client import MongoClient
   from pymongo.operations import SearchIndexModel
   import time

   # Connect to your Atlas deployment
   uri = "<connection-string>"
   client = MongoClient(uri)

   # Access your database and collection
   database = client["sample_mflix"]
   collection = database["embedded_movies"]

   # Define your index 
   search_index_model = SearchIndexModel(
       definition={
           "mappings": {
               "dynamic": True,
           },
       },
       name="hybrid-full-text-search",
   )

   # Create the index
   result = collection.create_search_index(model=search_index_model)
   print("New search index named " + result + " is building.")

   # Wait for initial sync to complete
   print("Polling to check if the index is ready. This may take up to a minute.")
   predicate=None
   if predicate is None:
     predicate = lambda index: index.get("queryable") is True

   while True:
     indices = list(collection.list_search_indexes(result))
     if len(indices) and predicate(indices[0]):
       break
     time.sleep(5)
   print(result + " is ready for querying.")

   client.close()
   ```

   This index definition indexes the `fullplot` field as the `autoEmbed` field, for which MongoDB Vector Search automatically generates embeddings using the `voyage-4` embedding model.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

5. Create the MongoDB Vector Search index.

   ```shell
   python create_search_index.py
   ```

   **Output:**

   ```text
   New search index named hybrid-full-text-search is building.
   Polling to check if the index is ready. This may take up to a minute.
   hybrid-full-text-search is ready for querying.
   ```

This section demonstrates how to create the following indexes on the `fullplot` field in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search `autoEmbed` type index for generating embeddings and running semantic search queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Connect to your cluster using MongoDB Compass.

   Open [Compass](https://www.mongodb.com/try/download/compass) and connect to your cluster. For detailed instructions, see [Connect to a Cluster via Compass.](https://www.mongodb.com/docs/atlas/compass-connection.md#std-label-atlas-connect-via-compass)

2. Specify the database and collection.

   On the Database screen, click the name of the database, then click the name of the collection.

3. Create the MongoDB Vector Search index.

   In the Indexes tab, then select Search Indexes.

   From the Create dropdown, select Search Index.

   In the Name of Search Index field, enter `hybrid-vector-search`.

   Under Vector Search, specify the JSON (Javascript Object Notation) MongoDB Vector Search index definition.

   ```json
   {
     "fields": [
       {
         "type": "autoEmbed",
         "modality": "text",
         "path": "fullplot",
         "model": "voyage-4"
       }
     ]
   }
   ```

   This index definition indexes the `fullplot` field as the `autoEmbed` field, for which MongoDB Vector Search automatically generates embeddings using the `voyage-4` embedding model.

   Click Create Search Index.

4. Create the MongoDB Search index.

   In the Indexes tab, then select Search Indexes.

   From the Create dropdown, select Search Index.

   In the Name of Search Index field, enter `hybrid-full-text-search`.

   Your MongoDB Search index is named `default` by default. If you keep this name, then your index will be the default Search index for any MongoDB Search query that does not specify a different `index` option in its [operators](https://www.mongodb.com/docs/search/query/operators-collectors/overview.md#std-label-fts-operators). If you are creating multiple indexes, we recommend that you maintain a consistent, descriptive naming convention across your indexes.

   Under Search, specify the JSON (Javascript Object Notation) MongoDB Vector Search index definition.

   ```json
   {
     "mappings": {
       "dynamic": true
     }
   }
   ```

   Click Create Search Index.

This section demonstrates how to create the following indexes on the `fullplot` field in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search `autoEmbed` type index for generating embeddings and running semantic search queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Connect to the cluster using [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh).

   To learn more, see [Connect to a Cluster via mongosh.](https://www.mongodb.com/docs/atlas/mongo-shell-connection.md#std-label-connect-mongo-shell)

2. Switch to the database that contains the collection for which you want to create the index.

   ```shell
   use sample_mflix
   ```

   **Output:**

   ```shell
   switched to db sample_mflix
   ```

3. Define the MongoDB Vector Search index.

   Run the following command. This index definition indexes the `fullplot` field as the MongoDB Vector Search field, for which MongoDB Vector Search automatically generates embeddings using the `voyage-4` embedding model.

   ```shell
   db.embedded_movies.createSearchIndex(
     "hybrid-vector-search", 
     "vectorSearch", 
     {
       "fields": [
         {
           "type": "autoEmbed",
           "modality": "text",
           "path": "fullplot",
           "model": "voyage-4"
         }
       ]
     }
   );
   ```

4. Define the MongoDB Search index.

   The following index definition automatically indexes all the dynamically indexable fields in the collection.

   ```shell
   db.embedded_movies.createSearchIndex(
     "hybrid-full-text-search", 
     "search", 
     {
       "mappings": {
         "dynamic": true
       }
     }
   );
   ```

This section demonstrates how to create the following indexes on the `fullplot` field in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search `autoEmbed` type index for generating embeddings and running semantic search queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Initialize your Node.js project.

   ```shell
   # Create a new directory and initialize the project
   mkdir atlas-search-project && cd atlas-search-project
   npm init -y

   # Add the MongoDB Node.js Driver to your project
   npm install mongodb
   ```

   For detailed installation instructions, see the [MongoDB Node Driver documentation.](https://www.mongodb.com/docs/drivers/node/current/)

2. Define the MongoDB Vector Search index.

   The following index definition indexes the `fullplot` field as the `autoEmbed` type field, for which MongoDB Vector Search automatically generates embeddings using the `voyage-4` embedding model.

   Create a file named `vector-search-index.js`, and paste the following code into it:

   ```javascript
   const { MongoClient } = require("mongodb");

   // Connect to your MongoDB deployment
   const MONGODB_URI = "<connection-string>";
   const client = new MongoClient(MONGODB_URI);

   async function run() {
       try {
         const database = client.db("sample_mflix");
         const collection = database.collection("embedded_movies");

         // Define your vector search index
         const index = {
             name: "hybrid-vector-search",
             type: "vectorSearch",
             definition: {
               "fields": [
                 {
                   "type": "autoEmbed",
                   "modality": "text",
                   "path": "fullplot",
                   "model": "voyage-4"
                 }
               ]
             }
         }

         // Call the method to create the index
         const result = await collection.createSearchIndex(index);
         console.log(result);
       } finally {
         await client.close();
       }
   }
   run().catch(console.dir);

   ```

   Run the following command to execute the code:

   ```javascript
   node vector-search-index.js
   ```

   **Output:**

   ```javascript
   hybrid-vector-search
   ```

   MongoDB Vector Search might take few minutes to create the index.

3. Define the MongoDB Search index.

   The following index definition automatically indexes all dynamically indexable field types in the collection.

   Create a file named `text-search-index.js`, and paste the following code into it:

   ```javascript
   const { MongoClient } = require("mongodb");

   // Connect to your MongoDB deployment
   const MONGODB_URI = "<connection-string>";
   const client = new MongoClient(MONGODB_URI);

   async function run() {
       try {
         const database = client.db("sample_mflix");
         const collection = database.collection("embedded_movies");

         // Define your search index
         const index = {
             name: "hybrid-full-text-search",
             type: "search",
             definition: {
               "mappings": {
                 "dynamic": true
               }
             }
         }

         // Call the method to create the index
         const result = await collection.createSearchIndex(index);
         console.log(result);
       } finally {
         await client.close();
       }
   }
   run().catch(console.dir);
   ```

   This index definition indexes the `fullplot` field as the `autoEmbed` field, for which MongoDB Vector Search automatically generates embeddings using the `voyage-4` embedding model.

   Run the following command to execute the code:

   ```javascript
   node text-search-index.js
   ```

   **Output:**

   ```javascript
   hybrid-full-text-search
   ```

   MongoDB Search might take few minutes to create the index.

This section demonstrates how to create the following indexes on the `fullplot` field in the `sample_mflix.embedded_movies` collection:

- A MongoDB Vector Search `autoEmbed` type index for generating embeddings and running semantic search queries against that field.

- A MongoDB Search index on the `fullplot` field for running full-text search against that field.

1. Set up the Python project.

   ```shell
   # Create a new directory for the project
   mkdir atlas-search-project && cd atlas-search-project

   # Install PyMongo
   pip install pymongo
   ```

   For detailed installation instructions, see [MongoDB Python Driver (PyMongo).](https://www.mongodb.com/docs/languages/python/pymongo-driver/get-started.md#std-label-pymongo-get-started-download-and-install)

2. Define the MongoDB Vector Search index.

   Create a `create_vector_index.py` file in your project directory, and copy and paste the following code into the file.

   ```python
   from pymongo.mongo_client import MongoClient
   from pymongo.operations import SearchIndexModel
   import time

   # Connect to your Atlas deployment
   uri = "<connection-string>"
   client = MongoClient(uri)

   # Access your database and collection
   database = client["sample_mflix"]
   collection = database["embedded_movies"]

   # Define your index
   search_index_model = SearchIndexModel(
     definition={
       "fields": [
         {
           "type": "autoEmbed",
           "modality": "text",
           "path": "fullplot",
           "model": "voyage-4"
         }
       ]
     },
     name="hybrid-vector-search",
     type="vectorSearch"
   )

   # Create the index
   result = collection.create_search_index(model=search_index_model)
   print("New search index named " + result + " is building.")

   # Wait for initial sync to complete
   print("Polling to check if the index is ready. This may take up to a minute.")
   predicate=None
   if predicate is None:
     predicate = lambda index: index.get("queryable") is True

   while True:
     indices = list(collection.list_search_indexes(result))
     if len(indices) and predicate(indices[0]):
       break
     time.sleep(5)
   print(result + " is ready for querying.")

   client.close()
   ```

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Create the MongoDB Vector Search index.

   ```shell
   python create_vector_index.py
   ```

   **Output:**

   ```text
   New search index named hybrid-vector-search is building.
   Polling to check if the index is ready. This may take up to a minute.
   hybrid-vector-search is ready for querying.
   ```

4. Define the MongoDB Vector Search index.

   Create a `create_search_index.py` file in your project directory, and copy and paste the following code into the file.

   ```python
   from pymongo.mongo_client import MongoClient
   from pymongo.operations import SearchIndexModel
   import time

   # Connect to your Atlas deployment
   uri = "<connection-string>"
   client = MongoClient(uri)

   # Access your database and collection
   database = client["sample_mflix"]
   collection = database["embedded_movies"]

   # Define your index 
   search_index_model = SearchIndexModel(
       definition={
           "mappings": {
               "dynamic": True,
           },
       },
       name="hybrid-full-text-search",
   )

   # Create the index
   result = collection.create_search_index(model=search_index_model)
   print("New search index named " + result + " is building.")

   # Wait for initial sync to complete
   print("Polling to check if the index is ready. This may take up to a minute.")
   predicate=None
   if predicate is None:
     predicate = lambda index: index.get("queryable") is True

   while True:
     indices = list(collection.list_search_indexes(result))
     if len(indices) and predicate(indices[0]):
       break
     time.sleep(5)
   print(result + " is ready for querying.")

   client.close()
   ```

   This index definition indexes the `fullplot` field as the `autoEmbed` field, for which MongoDB Vector Search automatically generates embeddings using the `voyage-4` embedding model.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

5. Create the MongoDB Vector Search index.

   ```shell
   python create_search_index.py
   ```

   **Output:**

   ```text
   New search index named hybrid-full-text-search is building.
   Polling to check if the index is ready. This may take up to a minute.
   hybrid-full-text-search is ready for querying.
   ```

### Run a Combined MongoDB Vector Search and MongoDB Search Query

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection for the phrase *charming
animal*. The query searches the `plot_embedding_voyage_4_large` and `fullplot` fields by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$rankFusion` stage to re-sort the documents in the results. The `$rankFusion` stage ensures that documents appearing in both searches appear at the top of the combined results.

1. Navigate to the collection in MongoDB Compass.

   On the Database screen, click the `sample_mflix` database, then click the `embedded_movies` collection.

2. Run a basic query.

   To run this query in MongoDB Compass:

   Click the Aggregations tab.

   Click \</> Text to switch to JSON (Javascript Object Notation) view.

   Copy and paste to run the following query:

   ```javascript
   [
     {
       "$rankFusion": {
         "input": {
           "pipelines": {
             "vectorPipeline": [
               {
                 "$vectorSearch": {
                 "index": "hybrid-vector-search",
                 "path": "plot_embedding_voyage_4_large",
                 "queryVector": [-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403],
                 "numCandidates": 500,
                 "limit": 50
                 }
               }
             ],
             "fullTextPipeline": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot",
                     "fuzzy": {}
                   }
                 }
               },
               { "$limit": 50 }
             ]
           }
         },
         "combination": {
           "weights": {
             "vectorPipeline": 0.5,
             "fullTextPipeline": 0.5
           }
         },
         "scoreDetails": true
       }
     },
     {
       "$project": {
         "_id": 1,
         "title": 1,
         "fullplot": 1,
         "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 10
     }
   ]
   ```

   **Output:**

   ```javascript
   {
     "_id": {
       "$oid": "573a1397f29313caabce80f6"
     },
     "title": "Gauche the Cellist",
     "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
     "scoreDetails": {
       "value": 0.015527202696196438,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 7,
           "weight": 0.5,
           "value": 2.6925015449523926,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 2,
           "weight": 0.5,
           "value": 0.6968950033187866,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13b4f29313caabd4070d"
     },
     "title": "Paragraph 78",
     "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
     "scoreDetails": {
       "value": 0.013793759512937594,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 12,
           "weight": 0.5,
           "value": 2.5729734897613525,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 13,
           "weight": 0.5,
           "value": 0.681915819644928,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1394f29313caabce074d"
     },
     "title": "Perri",
     "fullplot": "This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.",
     "scoreDetails": {
       "value": 0.013144841269841268,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 3,
           "weight": 0.5,
           "value": 3.0468099117279053,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 36,
           "weight": 0.5,
           "value": 0.6600974798202515,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a139af29313caabcf089f"
     },
     "fullplot": "Dr. John Dolittle has the world in his hands: A beautiful wife at his side, two adorable daughters and a career that could not go better. One night, he nearly runs over a dog with his car. The dog yells \"bonehead\" and disappears. From then on, his childhood ability is back: To communicate with animals. Unfortunately, the word of Dolittle's ability is spreading quickly. Soon, many animals from rat to horse flock to his place to get medical advice. But his colleagues suspect he's going mad, and as the clinic Dolittle used to work for is about to being taken over for a huge amount of money, many decisions have to be made. Believe him? Put him into a mental institution? Sell the clinic? But also his family is close to breaking apart. Until a circus tiger falls seriously ill.",
     "title": "Doctor Dolittle",
     "scoreDetails": {
       "value": 0.013010540184453228,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 32,
           "weight": 0.5,
           "value": 2.167940855026245,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 6,
           "weight": 0.5,
           "value": 0.6903904676437378,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1395f29313caabce1b5f"
     },
     "title": "Hatari!",
     "fullplot": "John Wayne and his ensemble cast cavort over the African landscape filling orders from zoos for wild animals. Bruce Cabot plays \"the Indian\", a womanizing sharpshooter who is gored by a rhino in the opening scenes of the film. This becomes a running theme through the movie; their bad luck in catching rhinos, and provides the climactic ending chase. While Bruce is in the hospital, Elsa Martinelli shows up as a woman photographer from a Swiss zoo, and John wants to send her packing. She strongarms the Duke into letting her stay by promising that her zoo will buy most of their animals this season if she's allowed to go along on the hunts and take photos. Hardy Kruger, Gerard Blain, Michelle Girardon and Valentin de Vargas round out the group. They traipse over the African landscape capturing animals; Elsa also has a running gag where she collects baby elephants as the movie goes along. In the end she's acquired three of them.",
     "scoreDetails": {
       "value": 0.01259106746911625,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 17,
           "weight": 0.5,
           "value": 2.464411973953247,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 22,
           "weight": 0.5,
           "value": 0.6660783886909485,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1393f29313caabcde3af"
     },
     "title": "Mighty Joe Young",
     "fullplot": "In Africa, the girl Jill Young trades a baby gorilla with two natives and raises the animal. Twelve years later, the talkative and persuasive promoter Max O'Hara organizes a safari to Africa with the Oklahoma cowboy Gregg to bring attractions to his new night-club in Hollywood. They capture several lions and out of blue, they see a huge gorilla nearby their camping and they try to capture the animal. However, the teenager Jill Young stops the men that intended to kill her gorilla. Max seduces Jill with a fancy life in Hollywood and she signs a contract with him where the gorilla Joseph \"Joe\" Young would be the lead attraction. Soon she realizes that her dream is a nightmare to Joe and she asks Max to return to Africa. However he persuades her to stay a little longer in the show business. But when three alcoholic costumers give booze to Joe, the gorilla destroys the spot and is sentenced by the justice to be sacrificed. Will Jill, Gregg and Max succeed in saving Joe?",
     "scoreDetails": {
       "value": 0.012579113924050634,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 20,
           "weight": 0.5,
           "value": 2.3966262340545654,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 19,
           "weight": 0.5,
           "value": 0.6716707944869995,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13bcf29313caabd55f51"
     },
     "title": "The Missing Lynx",
     "fullplot": "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
     "scoreDetails": {
       "value": 0.012303436225975538,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 8,
           "weight": 0.5,
           "value": 2.674750566482544,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 41,
           "weight": 0.5,
           "value": 0.6568813920021057,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1398f29313caabcea708"
     },
     "fullplot": "Returning from a hunting trip in the forest, the Henderson family's car hits an animal in the road. At first they fear it was a man, but when they examine the \"body\" they find it's a \"bigfoot\". They think it's dead so they decide to take it home (there could be some money in this..). As you guessed, \"it\" isn't dead. Far from being the ferocious monster they fear \"Harry\" to be, he's a friendly giant. In their attempts to keep Harry a secret, the Henderson's have to hide him from the authorities and a man, who has made it his goal in life, to catch a \"bigfoot\".",
     "title": "Harry and the Hendersons",
     "scoreDetails": {
       "value": 0.009662061239731142,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 44,
           "weight": 0.5,
           "value": 2.039764165878296,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 43,
           "weight": 0.5,
           "value": 0.654127836227417,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13a3f29313caabd0d0a8"
     },
     "fullplot": "Dr. John Dolittle the beloved doctor is back, but this time around he plays cupid to bumbling circus bear Archie as he's so smitten by a Pacific Western bear female, Ava. Dr. Dolittle must help a group of forest creatures to save their forest. But with the aid of his mangy, madcap animal friends, Dr. Dolittle must teach Archie the ways of true romance in time to save his species and his home before their habit is gone. So John held a meeting for every animal in the forest to not give up without a fight no matter what kind of animal expression they have and everyone agrees to do it and save their home.",
     "title": "Dr. Dolittle 2",
     "scoreDetails": {
       "value": 0.00819672131147541,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 1,
           "weight": 0.5,
           "value": 3.2179136276245117,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": "NA"
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13a6f29313caabd174a6"
     },
     "title": "Bear's Kiss",
     "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
     "scoreDetails": {
       "value": 0.00819672131147541,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": "NA"
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 1,
           "weight": 0.5,
           "value": 0.7064177393913269,
           "details": []
         }
       ]
     }
   }
   ```

#### About the Query

The sample query retrieves the sorted search results from the semantic search and the full-text search, and assigns a reciprocal rank score to the documents in the results based on their position in the results array. The reciprocal rank score is calculated by using the following formula:

```text
1.0/{document position in the results + constant value}
```

The query then adds the scores from both the searches for each document, ranks the documents based on the combined score, and sorts the documents to return a single result. The value for constant is always `60`.

##### Query Weights

###### Details about the weights applied in the query.

The sample query defines the following weights to the pipelines to influence that pipeline's rank contribution to the final score:

- `vectorPipeline` = 0.5

- `fullTextPipeline` = 0.5

You can adjust the weights to give more importance to one method of search. Note that a lower number provides higher weight.

The weighted reciprocal rank score is calculated by using the following formula:

```text
weight x reciprocal rank
```

The `scoreDetails.details.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion. The `scoreDetails.value` shows the weighted reciprocal rank score.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `fullplot` field for the string *charming animal*. The query uses the `voyage-4` embedding model from Voyage AI to generate embeddings for the query text, which is the same model used for the generating embeddings in the `fullplot` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the sorted documents from the semantic search in the results. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the sorted documents from the full-text search in the results.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to combine the results of the semantic and text search and return a single ranked list of documents in the results:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection for the phrase *charming
animal*. The query searches the `plot_embedding_voyage_4_large` and `fullplot` fields by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$rankFusion` stage to re-sort the documents in the results. The `$rankFusion` stage ensures that documents appearing in both searches appear at the top of the combined results.

1. Set up the embeddings to use in the query.

   Create a file named `embeddings.js`.

   Copy and paste the following embeddings in the file.

   ```javascript
   CHARMING_ANIMAL_EMBEDDING=[-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403];
   ```

   Save and close the file.

2. Connect to your cluster using [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh).

   Open [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) in a terminal window and connect to your cluster. For detailed instructions on connecting, see [Connect to a Cluster via mongosh.](https://www.mongodb.com/docs/atlas/mongo-shell-connection.md#std-label-connect-mongo-shell)

3. Use the `sample_mflix` database.

   Run the following command at [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) prompt:

   ```sh
   use sample_mflix
   ```

   **Output:**

   ```sh
   switched to db sample_mflix
   ```

4. Load the embeddings to use in the query.

   Run the following command to load the embeddings:

   ```shell
   load('embeddings.js');
   ```

   To verify that the embeddings loaded successfully, run the following command:

   ```shell
   CHARMING_ANIMAL_EMBEDDING.length
   ```

   **Output:**

   ```shell
   2048
   ```

5. Run the following query against the `embedded_movies` collection.

   ```javascript
   db.embedded_movies.aggregate([
     {
       $rankFusion: {
         input: {
           pipelines: {
             vectorPipeline: [
               {
                 "$vectorSearch": {
                   "index": "hybrid-vector-search",
                   "path": "plot_embedding_voyage_4_large",
                   "queryVector": CHARMING_ANIMAL_EMBEDDING,
                   "numCandidates": 500,
                   "limit": 50
                 }
               }
             ],
             fullTextPipeline: [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot",
                     "fuzzy": {}
                   }
                 }
               },
               { "$limit": 50 }
             ]
           }
         },
         combination: {
           weights: {
             vectorPipeline: 0.5,
             fullTextPipeline: 0.5
           }
         },
         "scoreDetails": true
       }
     },
     {
       "$project": {
         _id: 1,
         title: 1,
         fullplot: 1,
         scoreDetails: {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 10
     }
   ]);
   ```

   **Output:**

   ```javascript
   [
     {
       _id: ObjectId('573a1397f29313caabce80f6'),
       title: 'Gauche the Cellist',
       fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
       scoreDetails: {
         value: 0.015527202696196438,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 7,
             weight: 0.5,
             value: 2.6925015449523926,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 2,
             weight: 0.5,
             value: 0.6968950033187866,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13b4f29313caabd4070d'),
       title: 'Paragraph 78',
       fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
       scoreDetails: {
         value: 0.013793759512937594,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 12,
             weight: 0.5,
             value: 2.5729734897613525,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 13,
             weight: 0.5,
             value: 0.681915819644928,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1394f29313caabce074d'),
       title: 'Perri',
       fullplot: 'This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.',
       scoreDetails: {
         value: 0.013144841269841268,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 3,
             weight: 0.5,
             value: 3.0468099117279053,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 36,
             weight: 0.5,
             value: 0.6600974798202515,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a139af29313caabcf089f'),
       fullplot: `Dr. John Dolittle has the world in his hands: A beautiful wife at his side, two adorable daughters and a career that could not go better. One night, he nearly runs over a dog with his car. The dog yells "bonehead" and disappears. From then on, his childhood ability is back: To communicate with animals. Unfortunately, the word of Dolittle's ability is spreading quickly. Soon, many animals from rat to horse flock to his place to get medical advice. But his colleagues suspect he's going mad, and as the clinic Dolittle used to work for is about to being taken over for a huge amount of money, many decisions have to be made. Believe him? Put him into a mental institution? Sell the clinic? But also his family is close to breaking apart. Until a circus tiger falls seriously ill.`,
       title: 'Doctor Dolittle',
       scoreDetails: {
         value: 0.013010540184453228,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 32,
             weight: 0.5,
             value: 2.167940855026245,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 6,
             weight: 0.5,
             value: 0.6903904676437378,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1395f29313caabce1b5f'),
       title: 'Hatari!',
       fullplot: `John Wayne and his ensemble cast cavort over the African landscape filling orders from zoos for wild animals. Bruce Cabot plays "the Indian", a womanizing sharpshooter who is gored by a rhino in the opening scenes of the film. This becomes a running theme through the movie; their bad luck in catching rhinos, and provides the climactic ending chase. While Bruce is in the hospital, Elsa Martinelli shows up as a woman photographer from a Swiss zoo, and John wants to send her packing. She strongarms the Duke into letting her stay by promising that her zoo will buy most of their animals this season if she's allowed to go along on the hunts and take photos. Hardy Kruger, Gerard Blain, Michelle Girardon and Valentin de Vargas round out the group. They traipse over the African landscape capturing animals; Elsa also has a running gag where she collects baby elephants as the movie goes along. In the end she's acquired three of them.`,
       scoreDetails: {
         value: 0.01259106746911625,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 17,
             weight: 0.5,
             value: 2.464411973953247,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 22,
             weight: 0.5,
             value: 0.6660783886909485,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1393f29313caabcde3af'),
       title: 'Mighty Joe Young',
       fullplot: `In Africa, the girl Jill Young trades a baby gorilla with two natives and raises the animal. Twelve years later, the talkative and persuasive promoter Max O'Hara organizes a safari to Africa with the Oklahoma cowboy Gregg to bring attractions to his new night-club in Hollywood. They capture several lions and out of blue, they see a huge gorilla nearby their camping and they try to capture the animal. However, the teenager Jill Young stops the men that intended to kill her gorilla. Max seduces Jill with a fancy life in Hollywood and she signs a contract with him where the gorilla Joseph "Joe" Young would be the lead attraction. Soon she realizes that her dream is a nightmare to Joe and she asks Max to return to Africa. However he persuades her to stay a little longer in the show business. But when three alcoholic costumers give booze to Joe, the gorilla destroys the spot and is sentenced by the justice to be sacrificed. Will Jill, Gregg and Max succeed in saving Joe?`,
       scoreDetails: {
         value: 0.012579113924050634,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 20,
             weight: 0.5,
             value: 2.3966262340545654,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 19,
             weight: 0.5,
             value: 0.6716707944869995,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13bcf29313caabd55f51'),
       title: 'The Missing Lynx',
       fullplot: "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
       scoreDetails: {
         value: 0.012303436225975538,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 8,
             weight: 0.5,
             value: 2.674750566482544,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 41,
             weight: 0.5,
             value: 0.6568813920021057,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabcea708'),
       fullplot: `Returning from a hunting trip in the forest, the Henderson family's car hits an animal in the road. At first they fear it was a man, but when they examine the "body" they find it's a "bigfoot". They think it's dead so they decide to take it home (there could be some money in this..). As you guessed, "it" isn't dead. Far from being the ferocious monster they fear "Harry" to be, he's a friendly giant. In their attempts to keep Harry a secret, the Henderson's have to hide him from the authorities and a man, who has made it his goal in life, to catch a "bigfoot".`,
       title: 'Harry and the Hendersons',
       scoreDetails: {
         value: 0.009662061239731142,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 44,
             weight: 0.5,
             value: 2.039764165878296,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 43,
             weight: 0.5,
             value: 0.654127836227417,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13a3f29313caabd0d0a8'),
       fullplot: "Dr. John Dolittle the beloved doctor is back, but this time around he plays cupid to bumbling circus bear Archie as he's so smitten by a Pacific Western bear female, Ava. Dr. Dolittle must help a group of forest creatures to save their forest. But with the aid of his mangy, madcap animal friends, Dr. Dolittle must teach Archie the ways of true romance in time to save his species and his home before their habit is gone. So John held a meeting for every animal in the forest to not give up without a fight no matter what kind of animal expression they have and everyone agrees to do it and save their home.",
       title: 'Dr. Dolittle 2',
       scoreDetails: {
         value: 0.00819672131147541,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 1,
             weight: 0.5,
             value: 3.2179136276245117,
             details: []
           },
           { inputPipelineName: 'vectorPipeline', rank: 'NA' }
         ]
       }
     },
     {
       _id: ObjectId('573a13a6f29313caabd174a6'),
       title: "Bear's Kiss",
       fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
       scoreDetails: {
         value: 0.00819672131147541,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 1,
             weight: 0.5,
             value: 0.7064177393913269,
             details: []
           }
         ]
       }
     }
   ]
   ```

#### About the Query

The sample query retrieves the sorted search results from the semantic search and the full-text search, and assigns a reciprocal rank score to the documents in the results based on their position in the results array. The reciprocal rank score is calculated by using the following formula:

```text
1.0/{document position in the results + constant value}
```

The query then adds the scores from both the searches for each document, ranks the documents based on the combined score, and sorts the documents to return a single result. The value for constant is always `60`.

##### Query Weights

###### Details about the weights applied in the query.

The sample query defines the following weights to the pipelines to influence that pipeline's rank contribution to the final score:

- `vectorPipeline` = 0.5

- `fullTextPipeline` = 0.5

You can adjust the weights to give more importance to one method of search. Note that a lower number provides higher weight.

The weighted reciprocal rank score is calculated by using the following formula:

```text
weight x reciprocal rank
```

The `scoreDetails.details.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion. The `scoreDetails.value` shows the weighted reciprocal rank score.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `fullplot` field for the string *charming animal*. The query uses the `voyage-4` embedding model from Voyage AI to generate embeddings for the query text, which is the same model used for the generating embeddings in the `fullplot` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the sorted documents from the semantic search in the results. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the sorted documents from the full-text search in the results.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to combine the results of the semantic and text search and return a single ranked list of documents in the results:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection for the phrase *charming
animal*. The query searches the `plot_embedding_voyage_4_large` and `fullplot` fields by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$rankFusion` stage to re-sort the documents in the results. The `$rankFusion` stage ensures that documents appearing in both searches appear at the top of the combined results.

1. Create a new file named `run-query.js`.

2. Copy and paste the sample code in the file.

   ```javascript
   const { MongoClient } = require("mongodb");

   async function main() {
     // Replace the placeholder with your connection string
     const uri = "<connection-string>";
     const client = new MongoClient(uri);

     try {
       await client.connect();
       const database = client.db("sample_mflix");
       const movies = database.collection("embedded_movies");

       const query = [
         {
           $rankFusion: {
             input: {
               pipelines: {
                 vectorPipeline: [
                   {
                     "$vectorSearch": {
                       "index": "hybrid-vector-search",
                       "path": "plot_embedding_voyage_4_large",
                       "queryVector": [-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403],
                       "numCandidates": 500,
                       "limit": 50
                     }
                   }
                 ],
                 fullTextPipeline: [
                   {
                     "$search": {
                       "index": "hybrid-full-text-search",
                       "text": {
                         "query": "charming animal",
                         "path": "fullplot",
                         "fuzzy": {}
                       }
                     }
                   },
                   { "$limit": 50 }
                 ]
               }
             },
             combination: {
               weights: {
                 vectorPipeline: 0.5,
                 fullTextPipeline: 0.5
               }
             },
             "scoreDetails": true
           }
         },
         {
           "$project": {
             _id: 1,
             title: 1,
             fullplot: 1,
             scoreDetails: {"$meta": "scoreDetails"}
           }
         },
         {
           "$limit": 10
         },
       ];

       const cursor = movies.aggregate(query);
       await cursor.forEach(doc =>
         console.log(inspect(doc, { depth: null, colors: true, maxArrayLength: null }))
       );
     } finally {
       await client.close();
     }
   }

   main().catch(console.error);

   ```

3. Replace the `<connection-string>`.

   Ensure that your connection string includes your database user's credentials. To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the following command to query your collection.

   ```bash
   node run-query.js
   ```

   **Output:**

   ```javascript
   {
     _id: new ObjectId('573a1397f29313caabce80f6'),
     title: 'Gauche the Cellist',
     fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
     scoreDetails: {
       value: 0.015527202696196438,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 7,
           weight: 0.5,
           value: 2.6925015449523926,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 2,
           weight: 0.5,
           value: 0.6968950033187866,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a13b4f29313caabd4070d'),
     title: 'Paragraph 78',
     fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
     scoreDetails: {
       value: 0.013793759512937594,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 12,
           weight: 0.5,
           value: 2.5729734897613525,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 13,
           weight: 0.5,
           value: 0.681915819644928,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a1394f29313caabce074d'),
     title: 'Perri',
     fullplot: 'This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.',
     scoreDetails: {
       value: 0.013144841269841268,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 3,
           weight: 0.5,
           value: 3.0468099117279053,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 36,
           weight: 0.5,
           value: 0.6600974798202515,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a139af29313caabcf089f'),
     fullplot: `Dr. John Dolittle has the world in his hands: A beautiful wife at his side, two adorable daughters and a career that could not go better. One night, he nearly runs over a dog with his car. The dog yells "bonehead" and disappears. From then on, his childhood ability is back: To communicate with animals. Unfortunately, the word of Dolittle's ability is spreading quickly. Soon, many animals from rat to horse flock to his place to get medical advice. But his colleagues suspect he's going mad, and as the clinic Dolittle used to work for is about to being taken over for a huge amount of money, many decisions have to be made. Believe him? Put him into a mental institution? Sell the clinic? But also his family is close to breaking apart. Until a circus tiger falls seriously ill.`,
     title: 'Doctor Dolittle',
     scoreDetails: {
       value: 0.013010540184453228,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 32,
           weight: 0.5,
           value: 2.167940855026245,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 6,
           weight: 0.5,
           value: 0.6903904676437378,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a1395f29313caabce1b5f'),
     title: 'Hatari!',
     fullplot: `John Wayne and his ensemble cast cavort over the African landscape filling orders from zoos for wild animals. Bruce Cabot plays "the Indian", a womanizing sharpshooter who is gored by a rhino in the opening scenes of the film. This becomes a running theme through the movie; their bad luck in catching rhinos, and provides the climactic ending chase. While Bruce is in the hospital, Elsa Martinelli shows up as a woman photographer from a Swiss zoo, and John wants to send her packing. She strongarms the Duke into letting her stay by promising that her zoo will buy most of their animals this season if she's allowed to go along on the hunts and take photos. Hardy Kruger, Gerard Blain, Michelle Girardon and Valentin de Vargas round out the group. They traipse over the African landscape capturing animals; Elsa also has a running gag where she collects baby elephants as the movie goes along. In the end she's acquired three of them.`,
     scoreDetails: {
       value: 0.01259106746911625,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 17,
           weight: 0.5,
           value: 2.464411973953247,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 22,
           weight: 0.5,
           value: 0.6660783886909485,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a1393f29313caabcde3af'),
     title: 'Mighty Joe Young',
     fullplot: `In Africa, the girl Jill Young trades a baby gorilla with two natives and raises the animal. Twelve years later, the talkative and persuasive promoter Max O'Hara organizes a safari to Africa with the Oklahoma cowboy Gregg to bring attractions to his new night-club in Hollywood. They capture several lions and out of blue, they see a huge gorilla nearby their camping and they try to capture the animal. However, the teenager Jill Young stops the men that intended to kill her gorilla. Max seduces Jill with a fancy life in Hollywood and she signs a contract with him where the gorilla Joseph "Joe" Young would be the lead attraction. Soon she realizes that her dream is a nightmare to Joe and she asks Max to return to Africa. However he persuades her to stay a little longer in the show business. But when three alcoholic costumers give booze to Joe, the gorilla destroys the spot and is sentenced by the justice to be sacrificed. Will Jill, Gregg and Max succeed in saving Joe?`,
     scoreDetails: {
       value: 0.012579113924050634,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 20,
           weight: 0.5,
           value: 2.3966262340545654,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 19,
           weight: 0.5,
           value: 0.6716707944869995,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a13bcf29313caabd55f51'),
     title: 'The Missing Lynx',
     fullplot: "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
     scoreDetails: {
       value: 0.012303436225975538,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 8,
           weight: 0.5,
           value: 2.674750566482544,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 41,
           weight: 0.5,
           value: 0.6568813920021057,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a1398f29313caabcea708'),
     fullplot: `Returning from a hunting trip in the forest, the Henderson family's car hits an animal in the road. At first they fear it was a man, but when they examine the "body" they find it's a "bigfoot". They think it's dead so they decide to take it home (there could be some money in this..). As you guessed, "it" isn't dead. Far from being the ferocious monster they fear "Harry" to be, he's a friendly giant. In their attempts to keep Harry a secret, the Henderson's have to hide him from the authorities and a man, who has made it his goal in life, to catch a "bigfoot".`,
     title: 'Harry and the Hendersons',
     scoreDetails: {
       value: 0.009662061239731142,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 44,
           weight: 0.5,
           value: 2.039764165878296,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 43,
           weight: 0.5,
           value: 0.654127836227417,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a13a3f29313caabd0d0a8'),
     fullplot: "Dr. John Dolittle the beloved doctor is back, but this time around he plays cupid to bumbling circus bear Archie as he's so smitten by a Pacific Western bear female, Ava. Dr. Dolittle must help a group of forest creatures to save their forest. But with the aid of his mangy, madcap animal friends, Dr. Dolittle must teach Archie the ways of true romance in time to save his species and his home before their habit is gone. So John held a meeting for every animal in the forest to not give up without a fight no matter what kind of animal expression they have and everyone agrees to do it and save their home.",
     title: 'Dr. Dolittle 2',
     scoreDetails: {
       value: 0.00819672131147541,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 1,
           weight: 0.5,
           value: 3.2179136276245117,
           details: []
         },
         { inputPipelineName: 'vectorPipeline', rank: 'NA' }
       ]
     }
   }
   {
     _id: new ObjectId('573a13a6f29313caabd174a6'),
     title: "Bear's Kiss",
     fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
     scoreDetails: {
       value: 0.00819672131147541,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 1,
           weight: 0.5,
           value: 0.7064177393913269,
           details: []
         }
       ]
     }
   }
   ```

#### About the Query

The sample query retrieves the sorted search results from the semantic search and the full-text search, and assigns a reciprocal rank score to the documents in the results based on their position in the results array. The reciprocal rank score is calculated by using the following formula:

```text
1.0/{document position in the results + constant value}
```

The query then adds the scores from both the searches for each document, ranks the documents based on the combined score, and sorts the documents to return a single result. The value for constant is always `60`.

##### Query Weights

###### Details about the weights applied in the query.

The sample query defines the following weights to the pipelines to influence that pipeline's rank contribution to the final score:

- `vectorPipeline` = 0.5

- `fullTextPipeline` = 0.5

You can adjust the weights to give more importance to one method of search. Note that a lower number provides higher weight.

The weighted reciprocal rank score is calculated by using the following formula:

```text
weight x reciprocal rank
```

The `scoreDetails.details.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion. The `scoreDetails.value` shows the weighted reciprocal rank score.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `fullplot` field for the string *charming animal*. The query uses the `voyage-4` embedding model from Voyage AI to generate embeddings for the query text, which is the same model used for the generating embeddings in the `fullplot` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the sorted documents from the semantic search in the results. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the sorted documents from the full-text search in the results.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to combine the results of the semantic and text search and return a single ranked list of documents in the results:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection for the phrase *charming
animal*. The query searches the `plot_embedding_voyage_4_large` and `fullplot` fields by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$rankFusion` stage to re-sort the documents in the results. The `$rankFusion` stage ensures that documents appearing in both searches appear at the top of the combined results.

1. Create a file named `run-query.py`.

2. Copy and paste the following code into the `run-query.py` file.

   ```python
   import json
   import pymongo

   client = pymongo.MongoClient('<connection-string>')

   # charming animal embedding vector 
   CHARMING_ANIMAL_EMBEDDING = [-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403]

   result = client['sample_mflix']['embedded_movies'].aggregate([
     {
       "$rankFusion": {
         "input": {
           "pipelines": {
             "vectorPipeline": [
               {
                 "$vectorSearch": {
                   "index": "hybrid-vector-search",
                   "path": "plot_embedding_voyage_4_large",
                   "queryVector": CHARMING_ANIMAL_EMBEDDING,
                   "numCandidates": 500,
                   "limit": 50
                 }
               }
             ],
             "fullTextPipeline": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot",
                     "fuzzy": {}
                   }
                 }
               },
               { "$limit": 50 }
             ]
           }
         },
         "combination": {
           "weights": {
             "vectorPipeline": 0.5,
             "fullTextPipeline": 0.5
           }
         },
         "scoreDetails": True
       }
     },
     {
       "$project": {
           "_id": 1,
           "title": 1,
           "fullplot": 1,
           "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 10
     }
   ])

   print(json.dumps(list(result), indent=2, default=str))
   ```

3. Replace the `<connection-string>`.

   Ensure that your connection string includes your database user's credentials. To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the following command to query your collection:

   ```bash
   python run-query.py
   ```

   **Output:**

   ```javascript
   [
     {
       "_id": "573a1397f29313caabce80f6",
       "title": "Gauche the Cellist",
       "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
       "scoreDetails": {
         "value": 0.015527202696196438,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 7,
             "weight": 0.5,
             "value": 2.6925015449523926,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 2,
             "weight": 0.5,
             "value": 0.6968950033187866,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13b4f29313caabd4070d",
       "title": "Paragraph 78",
       "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
       "scoreDetails": {
         "value": 0.013793759512937594,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 12,
             "weight": 0.5,
             "value": 2.5729734897613525,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 13,
             "weight": 0.5,
             "value": 0.681915819644928,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a1394f29313caabce074d",
       "title": "Perri",
       "fullplot": "This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.",
       "scoreDetails": {
         "value": 0.013144841269841268,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 3,
             "weight": 0.5,
             "value": 3.0468099117279053,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 36,
             "weight": 0.5,
             "value": 0.6600974798202515,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a139af29313caabcf089f",
       "fullplot": "Dr. John Dolittle has the world in his hands: A beautiful wife at his side, two adorable daughters and a career that could not go better. One night, he nearly runs over a dog with his car. The dog yells \"bonehead\" and disappears. From then on, his childhood ability is back: To communicate with animals. Unfortunately, the word of Dolittle's ability is spreading quickly. Soon, many animals from rat to horse flock to his place to get medical advice. But his colleagues suspect he's going mad, and as the clinic Dolittle used to work for is about to being taken over for a huge amount of money, many decisions have to be made. Believe him? Put him into a mental institution? Sell the clinic? But also his family is close to breaking apart. Until a circus tiger falls seriously ill.",
       "title": "Doctor Dolittle",
       "scoreDetails": {
         "value": 0.013010540184453228,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 32,
             "weight": 0.5,
             "value": 2.167940855026245,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 6,
             "weight": 0.5,
             "value": 0.6903904676437378,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a1395f29313caabce1b5f",
       "title": "Hatari!",
       "fullplot": "John Wayne and his ensemble cast cavort over the African landscape filling orders from zoos for wild animals. Bruce Cabot plays \"the Indian\", a womanizing sharpshooter who is gored by a rhino in the opening scenes of the film. This becomes a running theme through the movie; their bad luck in catching rhinos, and provides the climactic ending chase. While Bruce is in the hospital, Elsa Martinelli shows up as a woman photographer from a Swiss zoo, and John wants to send her packing. She strongarms the Duke into letting her stay by promising that her zoo will buy most of their animals this season if she's allowed to go along on the hunts and take photos. Hardy Kruger, Gerard Blain, Michelle Girardon and Valentin de Vargas round out the group. They traipse over the African landscape capturing animals; Elsa also has a running gag where she collects baby elephants as the movie goes along. In the end she's acquired three of them.",
       "scoreDetails": {
         "value": 0.01259106746911625,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 17,
             "weight": 0.5,
             "value": 2.464411973953247,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 22,
             "weight": 0.5,
             "value": 0.6660783886909485,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a1393f29313caabcde3af",
       "title": "Mighty Joe Young",
       "fullplot": "In Africa, the girl Jill Young trades a baby gorilla with two natives and raises the animal. Twelve years later, the talkative and persuasive promoter Max O'Hara organizes a safari to Africa with the Oklahoma cowboy Gregg to bring attractions to his new night-club in Hollywood. They capture several lions and out of blue, they see a huge gorilla nearby their camping and they try to capture the animal. However, the teenager Jill Young stops the men that intended to kill her gorilla. Max seduces Jill with a fancy life in Hollywood and she signs a contract with him where the gorilla Joseph \"Joe\" Young would be the lead attraction. Soon she realizes that her dream is a nightmare to Joe and she asks Max to return to Africa. However he persuades her to stay a little longer in the show business. But when three alcoholic costumers give booze to Joe, the gorilla destroys the spot and is sentenced by the justice to be sacrificed. Will Jill, Gregg and Max succeed in saving Joe?",
       "scoreDetails": {
         "value": 0.012579113924050634,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 20,
             "weight": 0.5,
             "value": 2.3966262340545654,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 19,
             "weight": 0.5,
             "value": 0.6716707944869995,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13bcf29313caabd55f51",
       "title": "The Missing Lynx",
       "fullplot": "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
       "scoreDetails": {
         "value": 0.012303436225975538,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 8,
             "weight": 0.5,
             "value": 2.674750566482544,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 41,
             "weight": 0.5,
             "value": 0.6568813920021057,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a1398f29313caabcea708",
       "fullplot": "Returning from a hunting trip in the forest, the Henderson family's car hits an animal in the road. At first they fear it was a man, but when they examine the \"body\" they find it's a \"bigfoot\". They think it's dead so they decide to take it home (there could be some money in this..). As you guessed, \"it\" isn't dead. Far from being the ferocious monster they fear \"Harry\" to be, he's a friendly giant. In their attempts to keep Harry a secret, the Henderson's have to hide him from the authorities and a man, who has made it his goal in life, to catch a \"bigfoot\".",
       "title": "Harry and the Hendersons",
       "scoreDetails": {
         "value": 0.009662061239731142,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 44,
             "weight": 0.5,
             "value": 2.039764165878296,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 43,
             "weight": 0.5,
             "value": 0.654127836227417,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13a3f29313caabd0d0a8",
       "fullplot": "Dr. John Dolittle the beloved doctor is back, but this time around he plays cupid to bumbling circus bear Archie as he's so smitten by a Pacific Western bear female, Ava. Dr. Dolittle must help a group of forest creatures to save their forest. But with the aid of his mangy, madcap animal friends, Dr. Dolittle must teach Archie the ways of true romance in time to save his species and his home before their habit is gone. So John held a meeting for every animal in the forest to not give up without a fight no matter what kind of animal expression they have and everyone agrees to do it and save their home.",
       "title": "Dr. Dolittle 2",
       "scoreDetails": {
         "value": 0.00819672131147541,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 1,
             "weight": 0.5,
             "value": 3.2179136276245117,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": "NA"
           }
         ]
       }
     },
     {
       "_id": "573a13a6f29313caabd174a6",
       "title": "Bear's Kiss",
       "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
       "scoreDetails": {
         "value": 0.00819672131147541,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 1,
             "weight": 0.5,
             "value": 0.7064177393913269,
             "details": []
           }
         ]
       }
     }
   ]
   ```

#### About the Query

The sample query retrieves the sorted search results from the semantic search and the full-text search, and assigns a reciprocal rank score to the documents in the results based on their position in the results array. The reciprocal rank score is calculated by using the following formula:

```text
1.0/{document position in the results + constant value}
```

The query then adds the scores from both the searches for each document, ranks the documents based on the combined score, and sorts the documents to return a single result. The value for constant is always `60`.

##### Query Weights

###### Details about the weights applied in the query.

The sample query defines the following weights to the pipelines to influence that pipeline's rank contribution to the final score:

- `vectorPipeline` = 0.5

- `fullTextPipeline` = 0.5

You can adjust the weights to give more importance to one method of search. Note that a lower number provides higher weight.

The weighted reciprocal rank score is calculated by using the following formula:

```text
weight x reciprocal rank
```

The `scoreDetails.details.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion. The `scoreDetails.value` shows the weighted reciprocal rank score.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `fullplot` field for the string *charming animal*. The query uses the `voyage-4` embedding model from Voyage AI to generate embeddings for the query text, which is the same model used for the generating embeddings in the `fullplot` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the sorted documents from the semantic search in the results. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the sorted documents from the full-text search in the results.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to combine the results of the semantic and text search and return a single ranked list of documents in the results:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection using the `$scoreFusion` stage to re-sort the documents in the results based on their combined scores. The `$scoreFusion` stage uses mathematical expressions to combine the scores of a document and influence the position of the document in the results. The query searches for movie plots that contain the phrase *charming animal* in the `plot_embedding_voyage_4_large` and `fullplot` fields by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$scoreFusion` stage.

1. Navigate to the collection in MongoDB Compass.

   On the Database screen, click the `sample_mflix` database, then click the `embedded_movies` collection.

2. Run a basic query.

   This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection using the `$scoreFusion` stage to re-sort the documents in the results based on their combined scores. The `$scoreFusion` stage uses mathematical expressions to combine the scores of a document and influence the position of the document in the results. The query searches for movie plots that contain the phrase *charming animal* in the `plot_embedding_voyage_4_large` and `fullplot` fields by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$scoreFusion` stage.

   To run this query in MongoDB Compass:

   Click the Aggregations tab.

   Click \</> Text to switch to JSON (Javascript Object Notation) view.

   Copy and paste to run the following query:

   ```javascript
   [
     {
       "$scoreFusion": {
         "input": {
           "pipelines": {
             "searchOne": [
               {
                 "$vectorSearch": {
                   "index": "hybrid-vector-search",
                   "path": "plot_embedding_voyage_4_large",
                   "queryVector": [-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403],
                   "numCandidates": 500,
                   "limit": 50
                 }
               }
             ],
             "searchTwo": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot"
                   }
                 }
               },
               {
                 "$limit": 50
               }
             ]
           },
           "normalization": "sigmoid"
         },
         "combination": {
           "method": "expression",
           "expression": {
             "$sum": [
               {"$multiply": [ "$$searchOne", 10]}, "$$searchTwo"
             ]
           }
         },
         "scoreDetails": true
       }
     },
     {
       "$project": {
         "_id": 1,
         "title": 1,
         "fullplot": 1,
         "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     { "$limit": 10 }
   ]
   ```

   **Output:**

   ```javascript
   {
     "_id": {
       "$oid": "573a1393f29313caabcde3af"
     },
     "title": "Mighty Joe Young",
     "fullplot": "In Africa, the girl Jill Young trades a baby gorilla with two natives and raises the animal. Twelve years later, the talkative and persuasive promoter Max O'Hara organizes a safari to Africa with the Oklahoma cowboy Gregg to bring attractions to his new night-club in Hollywood. They capture several lions and out of blue, they see a huge gorilla nearby their camping and they try to capture the animal. However, the teenager Jill Young stops the men that intended to kill her gorilla. Max seduces Jill with a fancy life in Hollywood and she signs a contract with him where the gorilla Joseph \"Joe\" Young would be the lead attraction. Soon she realizes that her dream is a nightmare to Joe and she asks Max to return to Africa. However he persuades her to stay a little longer in the show business. But when three alcoholic costumers give booze to Joe, the gorilla destroys the spot and is sentenced by the justice to be sacrificed. Will Jill, Gregg and Max succeed in saving Joe?",
     "scoreDetails": {
       "value": 7.5663241753251596,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6716707944869995,
           "weight": 1,
           "value": 0.6618771770288111,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 2.8940677642822266,
           "weight": 1,
           "value": 0.9475524050370486,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1394f29313caabce074d"
     },
     "title": "Perri",
     "fullplot": "This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.",
     "scoreDetails": {
       "value": 7.55219687040973,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6600974798202515,
           "weight": 1,
           "value": 0.6592822856008668,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 3.1618731021881104,
           "weight": 1,
           "value": 0.9593740144010627,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13abf29313caabd24d08"
     },
     "title": "The Web of the Witch",
     "fullplot": "In a small North Indian village, Legend has it that a 100 years-old witch lives in an abandoned mansion on the village outskirts, and any person who goes inside is turned into an animal. In the same village a clever, naughty girl named Chunni (Shweta Prasad) lives with her widowed father, grandmother and her identical twin Munni, who is just the exact opposite of Chunni in mannerisms. But one day, Chunni's prank causes Munni enters the witch's mansion and the witch turns her into a hen. Chunni strikes a deal with Makdee (Shabana Azmi) that she will present Makdee with 100 hens in exchange for Munni in human form. How she manages this task forms the crux of the rest of this fun-filled children's movie.",
     "scoreDetails": {
       "value": 7.503994348185039,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6608105897903442,
           "weight": 1,
           "value": 0.6594424526903044,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 2.308393716812134,
           "weight": 1,
           "value": 0.9095698212819944,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1398f29313caabcea708"
     },
     "fullplot": "Returning from a hunting trip in the forest, the Henderson family's car hits an animal in the road. At first they fear it was a man, but when they examine the \"body\" they find it's a \"bigfoot\". They think it's dead so they decide to take it home (there could be some money in this..). As you guessed, \"it\" isn't dead. Far from being the ferocious monster they fear \"Harry\" to be, he's a friendly giant. In their attempts to keep Harry a secret, the Henderson's have to hide him from the authorities and a man, who has made it his goal in life, to catch a \"bigfoot\".",
     "title": "Harry and the Hendersons",
     "scoreDetails": {
       "value": 7.500917322707863,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.654127836227417,
           "weight": 1,
           "value": 0.6579400573308622,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 2.4631357192993164,
           "weight": 1,
           "value": 0.9215167493992404,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13a6f29313caabd174a6"
     },
     "title": "Bear's Kiss",
     "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
     "scoreDetails": {
       "value": 6.696091285390122,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.7064177393913269,
           "weight": 1,
           "value": 0.6696091285390122,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1397f29313caabce80f6"
     },
     "title": "Gauche the Cellist",
     "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
     "scoreDetails": {
       "value": 6.674989952910186,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6968950033187866,
           "weight": 1,
           "value": 0.6674989952910186,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13c3f29313caabd699fb"
     },
     "title": "Animals",
     "fullplot": "Pol is a teenager with a seemingly calm life. He lives with his brother, and is still in high school. However, Pol has a secret: Deerhoof, a cuddly teddy bear who thinks, moves around, and with whom he shares his best moments. Life goes on as normal until the arrival of Ikari, an enigmatic student who seems to be hiding something. Pol is fascinated by his new classmate and attracted to the dark side he harbors. An inexplicable death and a series of strange events will transform the meek student's routine into a fantastic adventure, which will take over their lives.",
     "scoreDetails": {
       "value": 6.674137957081891,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6965111494064331,
           "weight": 1,
           "value": 0.6674137957081892,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1398f29313caabcea42c"
     },
     "title": "The Storyteller",
     "fullplot": "A variety of European folk tales are retold in nine new stories. A soldier captures Death in a magic sack. A fearless young man sets out to learn to shudder. A boy with a destiny that frightens a tyrant is sent on an impossible task that will see him wed the princess, or dead. A storyteller must spin tales to stay alive. A woman bears a hedgehog-child who grows up to live alone in a castle until he does a king a favor and gets the princess's hand in return. A princess must keep silent while she works to free her brothers from an evil spell. A princess runs away from wedding her father and disguises herself as an ugly forest creature. A young boy must overcome a heartless giant. A princess searches the earth for her stolen bridegroom.",
     "scoreDetails": {
       "value": 6.670683209915876,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6949551701545715,
           "weight": 1,
           "value": 0.6670683209915876,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13b7f29313caabd4a224"
     },
     "fullplot": "A boy finds an interesting egg. His curiosity leads him to protect it and want to figure out what will come out of it. He didn't realize that it would turn into something magical. The boy and the Water horse grow a strong relationship together in this wonderful story.",
     "title": "The Water Horse",
     "scoreDetails": {
       "value": 6.661972545615498,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6910355687141418,
           "weight": 1,
           "value": 0.6661972545615498,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a139af29313caabcf089f"
     },
     "fullplot": "Dr. John Dolittle has the world in his hands: A beautiful wife at his side, two adorable daughters and a career that could not go better. One night, he nearly runs over a dog with his car. The dog yells \"bonehead\" and disappears. From then on, his childhood ability is back: To communicate with animals. Unfortunately, the word of Dolittle's ability is spreading quickly. Soon, many animals from rat to horse flock to his place to get medical advice. But his colleagues suspect he's going mad, and as the clinic Dolittle used to work for is about to being taken over for a huge amount of money, many decisions have to be made. Believe him? Put him into a mental institution? Sell the clinic? But also his family is close to breaking apart. Until a circus tiger falls seriously ill.",
     "title": "Doctor Dolittle",
     "scoreDetails": {
       "value": 6.660537825936243,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6903904676437378,
           "weight": 1,
           "value": 0.6660537825936242,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   ```

#### About the Query

The sample query retrieves the scored search results from the semantic and full-text searches and applies the `sigmoid` expression to normalize the score before combining the results. It then combines the score from the pipelines into a single aggregated score for each document.

##### Query Weights

###### Details about the weights applied in the query.

The sample query applies weights to the normalized input pipeline scores when combining the results. It applies the weights using a custom aggregation expression. In this example, the query uses the `$multiply` expression to multiply the score from the `searchOne` pipeline by `10`. This ensures that results from this pipeline contribute more to the final score than results from the `searchTwo` pipeline. It then uses the `$sum` aggregation operator to add the scores from the two pipeline stages.

```shell
Final Score = ($$searchOne * 10) + $$searchTwo
```

**Note:**

If you combine the query results using an expression (`combination.method`: `expression`), you can't use weight in your query. We recommend using `$multiply` as demonstrated in the preceding sample query.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `plot_embedding_voyage_4_large` field for the string *charming animal* specified as vector embeddings in the `queryVector` field of the query. The query uses the `voyage-4-large` embedding model from Voyage AI, which is the same model used for the embeddings in the `plot_embedding_voyage_4_large` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the scored documents from the semantic search. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the scored documents from the full-text search.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to return the results of the semantic and text search as a single scored list of documents:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection using the `$scoreFusion` stage to re-sort the documents in the results based on their combined scores. The `$scoreFusion` stage uses mathematical expressions to combine the scores of a document and influence the position of the document in the results. The query searches for movie plots that contain the phrase *charming animal* in the `plot_embedding_voyage_4_large` and `fullplot` fields by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$scoreFusion` stage.

1. Set up the embeddings to use in the query.

   Create a file named `embeddings.js`.

   Copy and paste the following embeddings in the file.

   ```javascript
   CHARMING_ANIMAL_EMBEDDING=[-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403];
   ```

   Save and close the file.

2. Connect to your cluster using [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh).

   Open [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) in a terminal window and connect to your cluster. For detailed instructions on connecting, see [Connect to a Cluster via mongosh.](https://www.mongodb.com/docs/atlas/mongo-shell-connection.md#std-label-connect-mongo-shell)

3. Use the `sample_mflix` database.

   Run the following command at [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) prompt:

   ```sh
   use sample_mflix
   ```

   **Output:**

   ```sh
   switched to db sample_mflix
   ```

4. Load the embeddings to use in the query.

   Run the following command to load the embeddings:

   ```shell
   load('embeddings.js');
   ```

   To verify that the embeddings loaded successfully, run the following command:

   ```shell
   CHARMING_ANIMAL_EMBEDDING.length
   ```

   **Output:**

   ```shell
   2048
   ```

5. Run the following MongoDB Search queries against the `embedded_movies` collection.

   ```js
   db.embedded_movies.aggregate( [
      {
         "$scoreFusion": {
            "input": {
               "pipelines": {
                  "searchOne": [
                     {
                        "$vectorSearch": {
                           "index": "hybrid-vector-search",
                           "path": "plot_embedding_voyage_4_large",
                           "queryVector": CHARMING_ANIMAL_EMBEDDING,
                           "numCandidates": 500,
                           "limit": 50
                        }
                     }
                  ],
                  "searchTwo": [
                     {
                        "$search": {
                           "index": "hybrid-full-text-search",
                           "text": {
                              "query": "charming animal",
                              "path": "fullplot"
                           }
                        }
                     },
                     {
                        "$limit": 50
                     }
                  ]
               },
               "normalization": "sigmoid"
            },
            "combination": {
               "method": "expression",
               "expression": {
                  "$sum": [
                    {"$multiply": [ "$$searchOne", 10]}, "$$searchTwo"
                  ]
               }
            },
            "scoreDetails": true
         }
      },
      {
         "$project": {
            "_id": 1,
            "title": 1,
            "fullplot": 1,
            "scoreDetails": {"$meta": "scoreDetails"}
         }
      },
      { "$limit": 10 }
   ] )
   ```

   **Output:**

   ```js
   [
     {
       _id: ObjectId('573a1393f29313caabcde3af'),
       title: 'Mighty Joe Young',
       fullplot: `In Africa, the girl Jill Young trades a baby gorilla with two natives and raises the animal. Twelve years later, the talkative and persuasive promoter Max O'Hara organizes a safari to Africa with the Oklahoma cowboy Gregg to bring attractions to his new night-club in Hollywood. They capture several lions and out of blue, they see a huge gorilla nearby their camping and they try to capture the animal. However, the teenager Jill Young stops the men that intended to kill her gorilla. Max seduces Jill with a fancy life in Hollywood and she signs a contract with him where the gorilla Joseph "Joe" Young would be the lead attraction. Soon she realizes that her dream is a nightmare to Joe and she asks Max to return to Africa. However he persuades her to stay a little longer in the show business. But when three alcoholic costumers give booze to Joe, the gorilla destroys the spot and is sentenced by the justice to be sacrificed. Will Jill, Gregg and Max succeed in saving Joe?`,
       scoreDetails: {
         value: 7.5663241753251596,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6716707944869995,
             weight: 1,
             value: 0.6618771770288111,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 2.8940677642822266,
             weight: 1,
             value: 0.9475524050370486,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1394f29313caabce074d'),
       title: 'Perri',
       fullplot: 'This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.',
       scoreDetails: {
         value: 7.55219687040973,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6600974798202515,
             weight: 1,
             value: 0.6592822856008668,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 3.1618731021881104,
             weight: 1,
             value: 0.9593740144010627,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13abf29313caabd24d08'),
       title: 'The Web of the Witch',
       fullplot: "In a small North Indian village, Legend has it that a 100 years-old witch lives in an abandoned mansion on the village outskirts, and any person who goes inside is turned into an animal. In the same village a clever, naughty girl named Chunni (Shweta Prasad) lives with her widowed father, grandmother and her identical twin Munni, who is just the exact opposite of Chunni in mannerisms. But one day, Chunni's prank causes Munni enters the witch's mansion and the witch turns her into a hen. Chunni strikes a deal with Makdee (Shabana Azmi) that she will present Makdee with 100 hens in exchange for Munni in human form. How she manages this task forms the crux of the rest of this fun-filled children's movie.",
       scoreDetails: {
         value: 7.503994348185039,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6608105897903442,
             weight: 1,
             value: 0.6594424526903044,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 2.308393716812134,
             weight: 1,
             value: 0.9095698212819944,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabcea708'),
       fullplot: `Returning from a hunting trip in the forest, the Henderson family's car hits an animal in the road. At first they fear it was a man, but when they examine the "body" they find it's a "bigfoot". They think it's dead so they decide to take it home (there could be some money in this..). As you guessed, "it" isn't dead. Far from being the ferocious monster they fear "Harry" to be, he's a friendly giant. In their attempts to keep Harry a secret, the Henderson's have to hide him from the authorities and a man, who has made it his goal in life, to catch a "bigfoot".`,
       title: 'Harry and the Hendersons',
       scoreDetails: {
         value: 7.500917322707863,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.654127836227417,
             weight: 1,
             value: 0.6579400573308622,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 2.4631357192993164,
             weight: 1,
             value: 0.9215167493992404,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13a6f29313caabd174a6'),
       title: "Bear's Kiss",
       fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
       scoreDetails: {
         value: 6.696091285390122,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.7064177393913269,
             weight: 1,
             value: 0.6696091285390122,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1397f29313caabce80f6'),
       title: 'Gauche the Cellist',
       fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
       scoreDetails: {
         value: 6.674989952910186,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6968950033187866,
             weight: 1,
             value: 0.6674989952910186,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13c3f29313caabd699fb'),
       title: 'Animals',
       fullplot: "Pol is a teenager with a seemingly calm life. He lives with his brother, and is still in high school. However, Pol has a secret: Deerhoof, a cuddly teddy bear who thinks, moves around, and with whom he shares his best moments. Life goes on as normal until the arrival of Ikari, an enigmatic student who seems to be hiding something. Pol is fascinated by his new classmate and attracted to the dark side he harbors. An inexplicable death and a series of strange events will transform the meek student's routine into a fantastic adventure, which will take over their lives.",
       scoreDetails: {
         value: 6.674137957081891,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6965111494064331,
             weight: 1,
             value: 0.6674137957081892,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabcea42c'),
       title: 'The Storyteller',
       fullplot: "A variety of European folk tales are retold in nine new stories. A soldier captures Death in a magic sack. A fearless young man sets out to learn to shudder. A boy with a destiny that frightens a tyrant is sent on an impossible task that will see him wed the princess, or dead. A storyteller must spin tales to stay alive. A woman bears a hedgehog-child who grows up to live alone in a castle until he does a king a favor and gets the princess's hand in return. A princess must keep silent while she works to free her brothers from an evil spell. A princess runs away from wedding her father and disguises herself as an ugly forest creature. A young boy must overcome a heartless giant. A princess searches the earth for her stolen bridegroom.",
       scoreDetails: {
         value: 6.670683209915876,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6949551701545715,
             weight: 1,
             value: 0.6670683209915876,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13b7f29313caabd4a224'),
       fullplot: "A boy finds an interesting egg. His curiosity leads him to protect it and want to figure out what will come out of it. He didn't realize that it would turn into something magical. The boy and the Water horse grow a strong relationship together in this wonderful story.",
       title: 'The Water Horse',
       scoreDetails: {
         value: 6.661972545615498,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6910355687141418,
             weight: 1,
             value: 0.6661972545615498,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     },
     {
       _id: ObjectId('573a139af29313caabcf089f'),
       fullplot: `Dr. John Dolittle has the world in his hands: A beautiful wife at his side, two adorable daughters and a career that could not go better. One night, he nearly runs over a dog with his car. The dog yells "bonehead" and disappears. From then on, his childhood ability is back: To communicate with animals. Unfortunately, the word of Dolittle's ability is spreading quickly. Soon, many animals from rat to horse flock to his place to get medical advice. But his colleagues suspect he's going mad, and as the clinic Dolittle used to work for is about to being taken over for a huge amount of money, many decisions have to be made. Believe him? Put him into a mental institution? Sell the clinic? But also his family is close to breaking apart. Until a circus tiger falls seriously ill.`,
       title: 'Doctor Dolittle',
       scoreDetails: {
         value: 6.660537825936243,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6903904676437378,
             weight: 1,
             value: 0.6660537825936242,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     }
   ]
   ```

#### About the Query

The sample query retrieves the scored search results from the semantic and full-text searches and applies the `sigmoid` expression to normalize the score before combining the results. It then combines the score from the pipelines into a single aggregated score for each document.

##### Query Weights

###### Details about the weights applied in the query.

The sample query applies weights to the normalized input pipeline scores when combining the results. It applies the weights using a custom aggregation expression. In this example, the query uses the `$multiply` expression to multiply the score from the `searchOne` pipeline by `10`. This ensures that results from this pipeline contribute more to the final score than results from the `searchTwo` pipeline. It then uses the `$sum` aggregation operator to add the scores from the two pipeline stages.

```shell
Final Score = ($$searchOne * 10) + $$searchTwo
```

**Note:**

If you combine the query results using an expression (`combination.method`: `expression`), you can't use weight in your query. We recommend using `$multiply` as demonstrated in the preceding sample query.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `plot_embedding_voyage_4_large` field for the string *charming animal* specified as vector embeddings in the `queryVector` field of the query. The query uses the `voyage-4-large` embedding model from Voyage AI, which is the same model used for the embeddings in the `plot_embedding_voyage_4_large` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the scored documents from the semantic search. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the scored documents from the full-text search.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to return the results of the semantic and text search as a single scored list of documents:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection using the `$scoreFusion` stage to re-sort the documents in the results based on their combined scores. The `$scoreFusion` stage uses mathematical expressions to combine the scores of a document and influence the position of the document in the results. The query searches for movie plots that contain the phrase *charming animal* in the `plot_embedding_voyage_4_large` and `fullplot` fields by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$scoreFusion` stage.

1. Create a new file named `run-query.js`.

2. Copy and paste the sample code in the file.

   ```javascript
   const { MongoClient } = require("mongodb");

   async function main() {
     // Replace the placeholder with your connection string
     const uri = "<connection-string>";
     const client = new MongoClient(uri);

     try {
       await client.connect();
       const database = client.db("sample_mflix");
       const movies = database.collection("embedded_movies");

       const query = [
         {
           $scoreFusion: {
             input: {
               pipelines: {
                 searchOne: [
                   {
                     "$vectorSearch": {
                       "index": "hybrid-vector-search",
                       "path": "plot_embedding_voyage_4_large",
                       "queryVector": [-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403],
                       "numCandidates": 500,
                       "limit": 50
                     }
                   }
                 ],
                 searchTwo: [
                   {
                     "$search": {
                       "index": "hybrid-full-text-search",
                       "text": {
                         "query": "charming animal",
                         "path": "fullplot"
                       }
                     }
                   },
                   {
                     "$limit": 50
                   }
                 ]
               },
               normalization: "sigmoid"
             },
             combination: {
               method: "expression",
               expression: {
                 $sum: [
                   {$multiply: [ "$$searchOne", 10]}, "$$searchTwo"
                 ]
               }
             },
             "scoreDetails": true
           }
         },
         {
           "$project": {
             _id: 1,
             title: 1,
             fullplot: 1,
             scoreDetails: {"$meta": "scoreDetails"}
           }
         },
         { $limit: 10 },
         {
           "$rerank": {
             "model": "rerank-2.5",
             "query": {
               "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
             },
             "path": "fullplot",
             "numDocsToRerank": 50
           }
         },
         {
           "$addFields": {
             "rerankScore": { "$meta": "score" }
           }
         },
         {
           "$limit": 10
         },
         {
           "$project": {
             "_id": 0,
             "title": 1,
             "fullplot": 1,
             "scoreDetails": 1,
             "rerankScore": 1
           }
         }
       ];

       const cursor = movies.aggregate(query);
       await cursor.forEach(doc => console.log(doc));
     } finally {
       await client.close();
     }
   }

   main().catch(console.error);
   ```

3. Replace the `<connection-string>`.

   Ensure that your connection string includes your database user's credentials. To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the following command to query your collection.

   ```bash
   node run-query.js
   ```

   **Output:**

   ```javascript
   {
     title: 'Gauche the Cellist',
     fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
     scoreDetails: {
       value: 6.674989952910186,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: "Bear's Kiss",
     fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
     scoreDetails: {
       value: 6.696091285390122,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     fullplot: "A boy finds an interesting egg. His curiosity leads him to protect it and want to figure out what will come out of it. He didn't realize that it would turn into something magical. The boy and the Water horse grow a strong relationship together in this wonderful story.",
     title: 'The Water Horse',
     scoreDetails: {
       value: 6.661972545615498,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Perri',
     fullplot: 'This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.',
     scoreDetails: {
       value: 7.55219687040973,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Animals',
     fullplot: "Pol is a teenager with a seemingly calm life. He lives with his brother, and is still in high school. However, Pol has a secret: Deerhoof, a cuddly teddy bear who thinks, moves around, and with whom he shares his best moments. Life goes on as normal until the arrival of Ikari, an enigmatic student who seems to be hiding something. Pol is fascinated by his new classmate and attracted to the dark side he harbors. An inexplicable death and a series of strange events will transform the meek student's routine into a fantastic adventure, which will take over their lives.",
     scoreDetails: {
       value: 6.674137957081891,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     fullplot: `Returning from a hunting trip in the forest, the Henderson family's car hits an animal in the road. At first they fear it was a man, but when they examine the "body" they find it's a "bigfoot". They think it's dead so they decide to take it home (there could be some money in this..). As you guessed, "it" isn't dead. Far from being the ferocious monster they fear "Harry" to be, he's a friendly giant. In their attempts to keep Harry a secret, the Henderson's have to hide him from the authorities and a man, who has made it his goal in life, to catch a "bigfoot".`,
     title: 'Harry and the Hendersons',
     scoreDetails: {
       value: 7.500917322707863,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Storyteller',
     fullplot: "A variety of European folk tales are retold in nine new stories. A soldier captures Death in a magic sack. A fearless young man sets out to learn to shudder. A boy with a destiny that frightens a tyrant is sent on an impossible task that will see him wed the princess, or dead. A storyteller must spin tales to stay alive. A woman bears a hedgehog-child who grows up to live alone in a castle until he does a king a favor and gets the princess's hand in return. A princess must keep silent while she works to free her brothers from an evil spell. A princess runs away from wedding her father and disguises herself as an ugly forest creature. A young boy must overcome a heartless giant. A princess searches the earth for her stolen bridegroom.",
     scoreDetails: {
       value: 6.670683209915876,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Web of the Witch',
     fullplot: "In a small North Indian village, Legend has it that a 100 years-old witch lives in an abandoned mansion on the village outskirts, and any person who goes inside is turned into an animal. In the same village a clever, naughty girl named Chunni (Shweta Prasad) lives with her widowed father, grandmother and her identical twin Munni, who is just the exact opposite of Chunni in mannerisms. But one day, Chunni's prank causes Munni enters the witch's mansion and the witch turns her into a hen. Chunni strikes a deal with Makdee (Shabana Azmi) that she will present Makdee with 100 hens in exchange for Munni in human form. How she manages this task forms the crux of the rest of this fun-filled children's movie.",
     scoreDetails: {
       value: 7.503994348185039,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     fullplot: `Dr. John Dolittle has the world in his hands: A beautiful wife at his side, two adorable daughters and a career that could not go better. One night, he nearly runs over a dog with his car. The dog yells "bonehead" and disappears. From then on, his childhood ability is back: To communicate with animals. Unfortunately, the word of Dolittle's ability is spreading quickly. Soon, many animals from rat to horse flock to his place to get medical advice. But his colleagues suspect he's going mad, and as the clinic Dolittle used to work for is about to being taken over for a huge amount of money, many decisions have to be made. Believe him? Put him into a mental institution? Sell the clinic? But also his family is close to breaking apart. Until a circus tiger falls seriously ill.`,
     title: 'Doctor Dolittle',
     scoreDetails: {
       value: 6.660537825936243,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Mighty Joe Young',
     fullplot: `In Africa, the girl Jill Young trades a baby gorilla with two natives and raises the animal. Twelve years later, the talkative and persuasive promoter Max O'Hara organizes a safari to Africa with the Oklahoma cowboy Gregg to bring attractions to his new night-club in Hollywood. They capture several lions and out of blue, they see a huge gorilla nearby their camping and they try to capture the animal. However, the teenager Jill Young stops the men that intended to kill her gorilla. Max seduces Jill with a fancy life in Hollywood and she signs a contract with him where the gorilla Joseph "Joe" Young would be the lead attraction. Soon she realizes that her dream is a nightmare to Joe and she asks Max to return to Africa. However he persuades her to stay a little longer in the show business. But when three alcoholic costumers give booze to Joe, the gorilla destroys the spot and is sentenced by the justice to be sacrificed. Will Jill, Gregg and Max succeed in saving Joe?`,
     scoreDetails: {
       value: 7.5663241753251596,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   ```

#### About the Query

The sample query retrieves the scored search results from the semantic and full-text searches and applies the `sigmoid` expression to normalize the score before combining the results. It then combines the score from the pipelines into a single aggregated score for each document.

##### Query Weights

###### Details about the weights applied in the query.

The sample query applies weights to the normalized input pipeline scores when combining the results. It applies the weights using a custom aggregation expression. In this example, the query uses the `$multiply` expression to multiply the score from the `searchOne` pipeline by `10`. This ensures that results from this pipeline contribute more to the final score than results from the `searchTwo` pipeline. It then uses the `$sum` aggregation operator to add the scores from the two pipeline stages.

```shell
Final Score = ($$searchOne * 10) + $$searchTwo
```

**Note:**

If you combine the query results using an expression (`combination.method`: `expression`), you can't use weight in your query. We recommend using `$multiply` as demonstrated in the preceding sample query.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `plot_embedding_voyage_4_large` field for the string *charming animal* specified as vector embeddings in the `queryVector` field of the query. The query uses the `voyage-4-large` embedding model from Voyage AI, which is the same model used for the embeddings in the `plot_embedding_voyage_4_large` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the scored documents from the semantic search. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the scored documents from the full-text search.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to return the results of the semantic and text search as a single scored list of documents:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection using the `$scoreFusion` stage to re-sort the documents in the results based on their combined scores. The `$scoreFusion` stage uses mathematical expressions to combine the scores of a document and influence the position of the document in the results. The query searches for movie plots that contain the phrase *charming animal* in the `plot_embedding_voyage_4_large` and `fullplot` fields by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$scoreFusion` stage.

1. Create a file named `run-query.py`.

2. Copy and paste the following code into the `run-query.py` file.

   ```python
   import json
   import pymongo

   client = pymongo.MongoClient('<connection-string>')

   # charming animal embedding vector 
   CHARMING_ANIMAL_EMBEDDING = [-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403]

   result = client['sample_mflix']['embedded_movies'].aggregate([
     {
       "$scoreFusion": {
         "input": {
           "pipelines": {
             "searchOne": [
               {
                 "$vectorSearch": {
                   "index": "hybrid-vector-search",
                   "path": "plot_embedding_voyage_4_large",
                   "queryVector": CHARMING_ANIMAL_EMBEDDING,
                   "numCandidates": 500,
                   "limit": 50
                 }
               }
             ],
             "searchTwo": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot"
                   }
                 }
               },
               {
                 "$limit": 50
               }
             ]
           },
           "normalization": "sigmoid"
         },
         "combination": {
           "method": "expression",
           "expression": {
             "$sum": [
               {"$multiply": [ "$$searchOne", 10]}, "$$searchTwo"
             ]
           }
         },
         "scoreDetails": True
       }
     },
     {
       "$project": {
           "_id": 1,
           "title": 1,
           "fullplot": 1,
           "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 10
     }
   ])

   print(json.dumps(list(result), indent=2, default=str))
   ```

3. Replace the `<connection-string>`.

   Ensure that your connection string includes your database user's credentials. To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the following command to query your collection:

   ```bash
   python run-query.py
   ```

   **Output:**

   ```javascript
   [
     {
       "_id": "573a1393f29313caabcde3af",
       "title": "Mighty Joe Young",
       "fullplot": "In Africa, the girl Jill Young trades a baby gorilla with two natives and raises the animal. Twelve years later, the talkative and persuasive promoter Max O'Hara organizes a safari to Africa with the Oklahoma cowboy Gregg to bring attractions to his new night-club in Hollywood. They capture several lions and out of blue, they see a huge gorilla nearby their camping and they try to capture the animal. However, the teenager Jill Young stops the men that intended to kill her gorilla. Max seduces Jill with a fancy life in Hollywood and she signs a contract with him where the gorilla Joseph \"Joe\" Young would be the lead attraction. Soon she realizes that her dream is a nightmare to Joe and she asks Max to return to Africa. However he persuades her to stay a little longer in the show business. But when three alcoholic costumers give booze to Joe, the gorilla destroys the spot and is sentenced by the justice to be sacrificed. Will Jill, Gregg and Max succeed in saving Joe?",
       "scoreDetails": {
         "value": 7.5663241753251596,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6716707944869995,
             "weight": 1.0,
             "value": 0.6618771770288111,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 2.8940677642822266,
             "weight": 1.0,
             "value": 0.9475524050370486,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a1394f29313caabce074d",
       "title": "Perri",
       "fullplot": "This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.",
       "scoreDetails": {
         "value": 7.55219687040973,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6600974798202515,
             "weight": 1.0,
             "value": 0.6592822856008668,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 3.1618731021881104,
             "weight": 1.0,
             "value": 0.9593740144010627,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13abf29313caabd24d08",
       "title": "The Web of the Witch",
       "fullplot": "In a small North Indian village, Legend has it that a 100 years-old witch lives in an abandoned mansion on the village outskirts, and any person who goes inside is turned into an animal. In the same village a clever, naughty girl named Chunni (Shweta Prasad) lives with her widowed father, grandmother and her identical twin Munni, who is just the exact opposite of Chunni in mannerisms. But one day, Chunni's prank causes Munni enters the witch's mansion and the witch turns her into a hen. Chunni strikes a deal with Makdee (Shabana Azmi) that she will present Makdee with 100 hens in exchange for Munni in human form. How she manages this task forms the crux of the rest of this fun-filled children's movie.",
       "scoreDetails": {
         "value": 7.503994348185039,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6608105897903442,
             "weight": 1.0,
             "value": 0.6594424526903044,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 2.308393716812134,
             "weight": 1.0,
             "value": 0.9095698212819944,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a1398f29313caabcea708",
       "fullplot": "Returning from a hunting trip in the forest, the Henderson family's car hits an animal in the road. At first they fear it was a man, but when they examine the \"body\" they find it's a \"bigfoot\". They think it's dead so they decide to take it home (there could be some money in this..). As you guessed, \"it\" isn't dead. Far from being the ferocious monster they fear \"Harry\" to be, he's a friendly giant. In their attempts to keep Harry a secret, the Henderson's have to hide him from the authorities and a man, who has made it his goal in life, to catch a \"bigfoot\".",
       "title": "Harry and the Hendersons",
       "scoreDetails": {
         "value": 7.500917322707863,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.654127836227417,
             "weight": 1.0,
             "value": 0.6579400573308622,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 2.4631357192993164,
             "weight": 1.0,
             "value": 0.9215167493992404,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13a6f29313caabd174a6",
       "title": "Bear's Kiss",
       "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
       "scoreDetails": {
         "value": 6.696091285390122,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.7064177393913269,
             "weight": 1.0,
             "value": 0.6696091285390122,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     },
     {
       "_id": "573a1397f29313caabce80f6",
       "title": "Gauche the Cellist",
       "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
       "scoreDetails": {
         "value": 6.674989952910186,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6968950033187866,
             "weight": 1.0,
             "value": 0.6674989952910186,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     },
     {
       "_id": "573a13c3f29313caabd699fb",
       "title": "Animals",
       "fullplot": "Pol is a teenager with a seemingly calm life. He lives with his brother, and is still in high school. However, Pol has a secret: Deerhoof, a cuddly teddy bear who thinks, moves around, and with whom he shares his best moments. Life goes on as normal until the arrival of Ikari, an enigmatic student who seems to be hiding something. Pol is fascinated by his new classmate and attracted to the dark side he harbors. An inexplicable death and a series of strange events will transform the meek student's routine into a fantastic adventure, which will take over their lives.",
       "scoreDetails": {
         "value": 6.674137957081891,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6965111494064331,
             "weight": 1.0,
             "value": 0.6674137957081892,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     },
     {
       "_id": "573a1398f29313caabcea42c",
       "title": "The Storyteller",
       "fullplot": "A variety of European folk tales are retold in nine new stories. A soldier captures Death in a magic sack. A fearless young man sets out to learn to shudder. A boy with a destiny that frightens a tyrant is sent on an impossible task that will see him wed the princess, or dead. A storyteller must spin tales to stay alive. A woman bears a hedgehog-child who grows up to live alone in a castle until he does a king a favor and gets the princess's hand in return. A princess must keep silent while she works to free her brothers from an evil spell. A princess runs away from wedding her father and disguises herself as an ugly forest creature. A young boy must overcome a heartless giant. A princess searches the earth for her stolen bridegroom.",
       "scoreDetails": {
         "value": 6.670683209915876,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6949551701545715,
             "weight": 1.0,
             "value": 0.6670683209915876,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     },
     {
       "_id": "573a13b7f29313caabd4a224",
       "fullplot": "A boy finds an interesting egg. His curiosity leads him to protect it and want to figure out what will come out of it. He didn't realize that it would turn into something magical. The boy and the Water horse grow a strong relationship together in this wonderful story.",
       "title": "The Water Horse",
       "scoreDetails": {
         "value": 6.661972545615498,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6910355687141418,
             "weight": 1.0,
             "value": 0.6661972545615498,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     },
     {
       "_id": "573a139af29313caabcf089f",
       "fullplot": "Dr. John Dolittle has the world in his hands: A beautiful wife at his side, two adorable daughters and a career that could not go better. One night, he nearly runs over a dog with his car. The dog yells \"bonehead\" and disappears. From then on, his childhood ability is back: To communicate with animals. Unfortunately, the word of Dolittle's ability is spreading quickly. Soon, many animals from rat to horse flock to his place to get medical advice. But his colleagues suspect he's going mad, and as the clinic Dolittle used to work for is about to being taken over for a huge amount of money, many decisions have to be made. Believe him? Put him into a mental institution? Sell the clinic? But also his family is close to breaking apart. Until a circus tiger falls seriously ill.",
       "title": "Doctor Dolittle",
       "scoreDetails": {
         "value": 6.660537825936243,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6903904676437378,
             "weight": 1.0,
             "value": 0.6660537825936242,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     }
   ]
   ```

#### About the Query

The sample query retrieves the scored search results from the semantic and full-text searches and applies the `sigmoid` expression to normalize the score before combining the results. It then combines the score from the pipelines into a single aggregated score for each document.

##### Query Weights

###### Details about the weights applied in the query.

The sample query applies weights to the normalized input pipeline scores when combining the results. It applies the weights using a custom aggregation expression. In this example, the query uses the `$multiply` expression to multiply the score from the `searchOne` pipeline by `10`. This ensures that results from this pipeline contribute more to the final score than results from the `searchTwo` pipeline. It then uses the `$sum` aggregation operator to add the scores from the two pipeline stages.

```shell
Final Score = ($$searchOne * 10) + $$searchTwo
```

**Note:**

If you combine the query results using an expression (`combination.method`: `expression`), you can't use weight in your query. We recommend using `$multiply` as demonstrated in the preceding sample query.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `plot_embedding_voyage_4_large` field for the string *charming animal* specified as vector embeddings in the `queryVector` field of the query. The query uses the `voyage-4-large` embedding model from Voyage AI, which is the same model used for the embeddings in the `plot_embedding_voyage_4_large` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the scored documents from the semantic search. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the scored documents from the full-text search.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to return the results of the semantic and text search as a single scored list of documents:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection for the phrase *charming
animal*. The query searches the `fullplot` field by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$rankFusion` stage to re-sort the documents in the results. The `$rankFusion` stage ensures that documents appearing in both searches appear at the top of the combined results.

1. Navigate to the collection in MongoDB Compass.

   On the Database screen, click the `sample_mflix` database, then click the `embedded_movies` collection.

2. Run a basic query.

   To run this query in MongoDB Compass:

   Click the Aggregations tab.

   Click \</> Text to switch to JSON (Javascript Object Notation) view.

   Copy and paste to run the following query:

   ```javascript
   [
     {
       "$rankFusion": {
         "input": {
           "pipelines": {
             "vectorPipeline": [
               {
                 "$vectorSearch": {
                 "index": "hybrid-vector-search",
                 "path": "fullplot",
                 "query": {
                   "text": "charming animal"
                 },
                 "numCandidates": 500,
                 "limit": 50
                 }
               }
             ],
             "fullTextPipeline": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot",
                     "fuzzy": {}
                   }
                 }
               },
               { "$limit": 50 }
             ]
           }
         },
         "combination": {
           "weights": {
             "vectorPipeline": 0.5,
             "fullTextPipeline": 0.5
           }
         },
         "scoreDetails": true
       }
     },
     {
       "$project": {
         "_id": 1,
         "fullplot": 1,
         "fullplot": 1,
         "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 10
     }
   ]
   ```

   **Output:**

   ```javascript
   {
     "_id": {
       "$oid": "573a1394f29313caabce074d"
     },
     "fullplot": "This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.",
     "scoreDetails": {
       "value": 0.015289449112978524,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 3,
           "weight": 0.5,
           "value": 3.0468099117279053,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 8,
           "weight": 0.5,
           "value": 0.5038293600082397,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1397f29313caabce80f6"
     },
     "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
     "scoreDetails": {
       "value": 0.01527518656716418,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 7,
           "weight": 0.5,
           "value": 2.6925015449523926,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 4,
           "weight": 0.5,
           "value": 0.5039638876914978,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13a3f29313caabd0d0a8"
     },
     "fullplot": "Dr. John Dolittle the beloved doctor is back, but this time around he plays cupid to bumbling circus bear Archie as he's so smitten by a Pacific Western bear female, Ava. Dr. Dolittle must help a group of forest creatures to save their forest. But with the aid of his mangy, madcap animal friends, Dr. Dolittle must teach Archie the ways of true romance in time to save his species and his home before their habit is gone. So John held a meeting for every animal in the forest to not give up without a fight no matter what kind of animal expression they have and everyone agrees to do it and save their home.",
     "scoreDetails": {
       "value": 0.01504603637996856,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 1,
           "weight": 0.5,
           "value": 3.2179136276245117,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 13,
           "weight": 0.5,
           "value": 0.5037489533424377,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13b4f29313caabd4070d"
     },
     "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
     "scoreDetails": {
       "value": 0.01488095238095238,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 12,
           "weight": 0.5,
           "value": 2.5729734897613525,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 3,
           "weight": 0.5,
           "value": 0.5040066838264465,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13bcf29313caabd55f51"
     },
     "fullplot": "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
     "scoreDetails": {
       "value": 0.014395194697597348,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 8,
           "weight": 0.5,
           "value": 2.674750566482544,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 11,
           "weight": 0.5,
           "value": 0.503793478012085,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a139af29313caabcf089f"
     },
     "fullplot": "Dr. John Dolittle has the world in his hands: A beautiful wife at his side, two adorable daughters and a career that could not go better. One night, he nearly runs over a dog with his car. The dog yells \"bonehead\" and disappears. From then on, his childhood ability is back: To communicate with animals. Unfortunately, the word of Dolittle's ability is spreading quickly. Soon, many animals from rat to horse flock to his place to get medical advice. But his colleagues suspect he's going mad, and as the clinic Dolittle used to work for is about to being taken over for a huge amount of money, many decisions have to be made. Believe him? Put him into a mental institution? Sell the clinic? But also his family is close to breaking apart. Until a circus tiger falls seriously ill.",
     "scoreDetails": {
       "value": 0.01210144927536232,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 32,
           "weight": 0.5,
           "value": 2.167940855026245,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 15,
           "weight": 0.5,
           "value": 0.503582239151001,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1398f29313caabcea7fe"
     },
     "fullplot": "The CIA asks for ex-spy Leonard's help in stopping an evil force that is brainwashing small animals into killing people. Leonard, however, has his own problems to deal with: winning back his ex-wife.",
     "scoreDetails": {
       "value": 0.011274880322499369,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 21,
           "weight": 0.5,
           "value": 2.391012668609619,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 38,
           "weight": 0.5,
           "value": 0.5031183958053589,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13b3f29313caabd3c269"
     },
     "fullplot": "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
     "scoreDetails": {
       "value": 0.00819672131147541,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": "NA"
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 1,
           "weight": 0.5,
           "value": 0.5041331648826599,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13b3f29313caabd3ca2a"
     },
     "fullplot": "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
     "scoreDetails": {
       "value": 0.00819672131147541,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": "NA"
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": 1,
           "weight": 0.5,
           "value": 0.5041331648826599,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13c5f29313caabd71215"
     },
     "fullplot": "A slick, sexy, action-packed show about Neal Bannen, a charming con-man with a police chief for a father, a mob boss for an uncle and a weakness for beautiful women, who wants to turn his life around and leave the criminal lifestyle forever.",
     "scoreDetails": {
       "value": 0.008064516129032258,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "fullTextPipeline",
           "rank": 2,
           "weight": 0.5,
           "value": 3.0809128284454346,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline",
           "rank": "NA"
         }
       ]
     }
   }
   ```

#### About the Query

The sample query retrieves the sorted search results from the semantic search and the full-text search, and assigns a reciprocal rank score to the documents in the results based on their position in the results array. The reciprocal rank score is calculated by using the following formula:

```text
1.0/{document position in the results + constant value}
```

The query then adds the scores from both the searches for each document, ranks the documents based on the combined score, and sorts the documents to return a single result. The value for constant is always `60`.

##### Query Weights

###### Details about the weights applied in the query.

The sample query defines the following weights to the pipelines to influence that pipeline's rank contribution to the final score:

- `vectorPipeline` = 0.5

- `fullTextPipeline` = 0.5

You can adjust the weights to give more importance to one method of search. Note that a lower number provides higher weight.

The weighted reciprocal rank score is calculated by using the following formula:

```text
weight x reciprocal rank
```

The `scoreDetails.details.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion. The `scoreDetails.value` shows the weighted reciprocal rank score.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `fullplot` field for the string *charming animal*. The query uses the `voyage-4` embedding model from Voyage AI to generate embeddings for the query text, which is the same model used for the generating embeddings in the `fullplot` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the sorted documents from the semantic search in the results. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the sorted documents from the full-text search in the results.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to combine the results of the semantic and text search and return a single ranked list of documents in the results:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection for the phrase *charming
animal*. The query searches the `fullplot` field by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$rankFusion` stage to re-sort the documents in the results. The `$rankFusion` stage ensures that documents appearing in both searches appear at the top of the combined results.

1. Connect to your cluster using [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh).

   Open [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) in a terminal window and connect to your cluster. For detailed instructions on connecting, see [Connect to a Cluster via mongosh.](https://www.mongodb.com/docs/atlas/mongo-shell-connection.md#std-label-connect-mongo-shell)

2. Use the `sample_mflix` database.

   Run the following command at [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) prompt:

   ```sh
   use sample_mflix
   ```

   **Output:**

   ```sh
   switched to db sample_mflix
   ```

3. Run the following query against the `embedded_movies` collection.

   ```javascript
   db.embedded_movies.aggregate([
     {
       $rankFusion: {
         input: {
           pipelines: {
             vectorPipeline: [
               {
                 "$vectorSearch": {
                   "index": "hybrid-vector-search",
                   "path": "fullplot",
                   "query": {
                     "text": "charming animal"
                   },
                   "numCandidates": 500,
                   "limit": 50
                 }
               }
             ],
             fullTextPipeline: [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot",
                     "fuzzy": {}
                   }
                 }
               },
               { "$limit": 50 }
             ]
           }
         },
         combination: {
           weights: {
             vectorPipeline: 0.5,
             fullTextPipeline: 0.5
           }
         },
         "scoreDetails": true
       }
     },
     {
       "$project": {
         _id: 1,
         title: 1,
         fullplot: 1,
         scoreDetails: {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 10
     }
   ]);
   ```

   **Output:**

   ```javascript
   [
     {
       _id: ObjectId('573a1394f29313caabce074d'),
       title: 'Perri',
       fullplot: 'This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.',
       scoreDetails: {
         value: 0.015289449112978524,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 3,
             weight: 0.5,
             value: 3.0468099117279053,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 8,
             weight: 0.5,
             value: 0.5038293600082397,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1397f29313caabce80f6'),
       title: 'Gauche the Cellist',
       fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
       scoreDetails: {
         value: 0.01527518656716418,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 7,
             weight: 0.5,
             value: 2.6925015449523926,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 4,
             weight: 0.5,
             value: 0.5039638876914978,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13a3f29313caabd0d0a8'),
       fullplot: "Dr. John Dolittle the beloved doctor is back, but this time around he plays cupid to bumbling circus bear Archie as he's so smitten by a Pacific Western bear female, Ava. Dr. Dolittle must help a group of forest creatures to save their forest. But with the aid of his mangy, madcap animal friends, Dr. Dolittle must teach Archie the ways of true romance in time to save his species and his home before their habit is gone. So John held a meeting for every animal in the forest to not give up without a fight no matter what kind of animal expression they have and everyone agrees to do it and save their home.",
       title: 'Dr. Dolittle 2',
       scoreDetails: {
         value: 0.01504603637996856,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 1,
             weight: 0.5,
             value: 3.2179136276245117,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 13,
             weight: 0.5,
             value: 0.5037489533424377,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13b4f29313caabd4070d'),
       title: 'Paragraph 78',
       fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
       scoreDetails: {
         value: 0.01488095238095238,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 12,
             weight: 0.5,
             value: 2.5729734897613525,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 3,
             weight: 0.5,
             value: 0.5040066838264465,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13bcf29313caabd55f51'),
       title: 'The Missing Lynx',
       fullplot: "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
       scoreDetails: {
         value: 0.014395194697597348,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 8,
             weight: 0.5,
             value: 2.674750566482544,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 11,
             weight: 0.5,
             value: 0.503793478012085,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a139af29313caabcf089f'),
       fullplot: `Dr. John Dolittle has the world in his hands: A beautiful wife at his side, two adorable daughters and a career that could not go better. One night, he nearly runs over a dog with his car. The dog yells "bonehead" and disappears. From then on, his childhood ability is back: To communicate with animals. Unfortunately, the word of Dolittle's ability is spreading quickly. Soon, many animals from rat to horse flock to his place to get medical advice. But his colleagues suspect he's going mad, and as the clinic Dolittle used to work for is about to being taken over for a huge amount of money, many decisions have to be made. Believe him? Put him into a mental institution? Sell the clinic? But also his family is close to breaking apart. Until a circus tiger falls seriously ill.`,
       title: 'Doctor Dolittle',
       scoreDetails: {
         value: 0.01210144927536232,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 32,
             weight: 0.5,
             value: 2.167940855026245,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 15,
             weight: 0.5,
             value: 0.503582239151001,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabcea7fe'),
       title: 'Leonard Part 6',
       fullplot: "The CIA asks for ex-spy Leonard's help in stopping an evil force that is brainwashing small animals into killing people. Leonard, however, has his own problems to deal with: winning back his ex-wife.",
       scoreDetails: {
         value: 0.011274880322499369,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 21,
             weight: 0.5,
             value: 2.391012668609619,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 38,
             weight: 0.5,
             value: 0.5031183958053589,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13b3f29313caabd3c269'),
       title: 'Princess Raccoon',
       fullplot: "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
       scoreDetails: {
         value: 0.00819672131147541,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 1,
             weight: 0.5,
             value: 0.5041331648826599,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13b3f29313caabd3ca2a'),
       title: 'Princess Raccoon',
       fullplot: "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
       scoreDetails: {
         value: 0.00819672131147541,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
           {
             inputPipelineName: 'vectorPipeline',
             rank: 1,
             weight: 0.5,
             value: 0.5041331648826599,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13c5f29313caabd71215'),
       title: 'The Bannen Way',
       fullplot: 'A slick, sexy, action-packed show about Neal Bannen, a charming con-man with a police chief for a father, a mob boss for an uncle and a weakness for beautiful women, who wants to turn his life around and leave the criminal lifestyle forever.',
       scoreDetails: {
         value: 0.008064516129032258,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'fullTextPipeline',
             rank: 2,
             weight: 0.5,
             value: 3.0809128284454346,
             details: []
           },
           { inputPipelineName: 'vectorPipeline', rank: 'NA' }
         ]
       }
     }
   ]
   ```

#### About the Query

The sample query retrieves the sorted search results from the semantic search and the full-text search, and assigns a reciprocal rank score to the documents in the results based on their position in the results array. The reciprocal rank score is calculated by using the following formula:

```text
1.0/{document position in the results + constant value}
```

The query then adds the scores from both the searches for each document, ranks the documents based on the combined score, and sorts the documents to return a single result. The value for constant is always `60`.

##### Query Weights

###### Details about the weights applied in the query.

The sample query defines the following weights to the pipelines to influence that pipeline's rank contribution to the final score:

- `vectorPipeline` = 0.5

- `fullTextPipeline` = 0.5

You can adjust the weights to give more importance to one method of search. Note that a lower number provides higher weight.

The weighted reciprocal rank score is calculated by using the following formula:

```text
weight x reciprocal rank
```

The `scoreDetails.details.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion. The `scoreDetails.value` shows the weighted reciprocal rank score.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `fullplot` field for the string *charming animal*. The query uses the `voyage-4` embedding model from Voyage AI to generate embeddings for the query text, which is the same model used for the generating embeddings in the `fullplot` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the sorted documents from the semantic search in the results. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the sorted documents from the full-text search in the results.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to combine the results of the semantic and text search and return a single ranked list of documents in the results:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection for the phrase *charming
animal*. The query searches the `fullplot` field by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$rankFusion` stage to re-sort the documents in the results. The `$rankFusion` stage ensures that documents appearing in both searches appear at the top of the combined results.

1. Create a new file named `run-query.js`.

2. Copy and paste the sample code in the file.

   ```javascript
   const { MongoClient } = require("mongodb");
   const { inspect } = require("util");

   async function main() {
     // Replace the placeholder with your connection string
     const uri = "<connection-string>";
     const client = new MongoClient(uri);

     try {
       await client.connect();
       const database = client.db("sample_mflix");
       const movies = database.collection("embedded_movies");

       const query = [
         {
           $rankFusion: {
             input: {
               pipelines: {
                 vectorPipeline: [
                   {
                     "$vectorSearch": {
                       "index": "hybrid-vector-search",
                       "path": "fullplot",
                       "query": {
                         "text": "charming animal"
                       },
                       "numCandidates": 500,
                       "limit": 50
                     }
                   }
                 ],
                 fullTextPipeline: [
                   {
                     "$search": {
                       "index": "hybrid-full-text-search",
                       "text": {
                         "query": "charming animal",
                         "path": "fullplot",
                         "fuzzy": {}
                       }
                     }
                   },
                   { "$limit": 50 }
                 ]
               }
             },
             combination: {
               weights: {
                 vectorPipeline: 0.5,
                 fullTextPipeline: 0.5
               }
             },
             "scoreDetails": true
           }
         },
         {
           "$project": {
             _id: 1,
             title: 1,
             fullplot: 1,
             scoreDetails: {"$meta": "scoreDetails"}
           }
         },
         {
           "$limit": 10
         },
       ];

       const cursor = movies.aggregate(query);
       await cursor.forEach(doc =>
         console.log(inspect(doc, { depth: null, colors: true, maxArrayLength: null }))
       );
     } finally {
       await client.close();
     }
   }

   main().catch(console.error);

   ```

3. Replace the `<connection-string>`.

   Ensure that your connection string includes your database user's credentials. To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the following command to query your collection.

   ```bash
   node run-query.js
   ```

   **Output:**

   ```javascript
   {
     _id: new ObjectId('573a1394f29313caabce074d'),
     title: 'Perri',
     fullplot: 'This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.',
     scoreDetails: {
       value: 0.015289449112978524,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 3,
           weight: 0.5,
           value: 3.0468099117279053,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 8,
           weight: 0.5,
           value: 0.5038293600082397,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a1397f29313caabce80f6'),
     title: 'Gauche the Cellist',
     fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
     scoreDetails: {
       value: 0.01527518656716418,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 7,
           weight: 0.5,
           value: 2.6925015449523926,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 4,
           weight: 0.5,
           value: 0.5039638876914978,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a13a3f29313caabd0d0a8'),
     fullplot: "Dr. John Dolittle the beloved doctor is back, but this time around he plays cupid to bumbling circus bear Archie as he's so smitten by a Pacific Western bear female, Ava. Dr. Dolittle must help a group of forest creatures to save their forest. But with the aid of his mangy, madcap animal friends, Dr. Dolittle must teach Archie the ways of true romance in time to save his species and his home before their habit is gone. So John held a meeting for every animal in the forest to not give up without a fight no matter what kind of animal expression they have and everyone agrees to do it and save their home.",
     title: 'Dr. Dolittle 2',
     scoreDetails: {
       value: 0.01504603637996856,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 1,
           weight: 0.5,
           value: 3.2179136276245117,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 13,
           weight: 0.5,
           value: 0.5037489533424377,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a13b4f29313caabd4070d'),
     title: 'Paragraph 78',
     fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
     scoreDetails: {
       value: 0.01488095238095238,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 12,
           weight: 0.5,
           value: 2.5729734897613525,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 3,
           weight: 0.5,
           value: 0.5040066838264465,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a13bcf29313caabd55f51'),
     title: 'The Missing Lynx',
     fullplot: "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
     scoreDetails: {
       value: 0.014395194697597348,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 8,
           weight: 0.5,
           value: 2.674750566482544,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 11,
           weight: 0.5,
           value: 0.503793478012085,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a139af29313caabcf089f'),
     fullplot: `Dr. John Dolittle has the world in his hands: A beautiful wife at his side, two adorable daughters and a career that could not go better. One night, he nearly runs over a dog with his car. The dog yells "bonehead" and disappears. From then on, his childhood ability is back: To communicate with animals. Unfortunately, the word of Dolittle's ability is spreading quickly. Soon, many animals from rat to horse flock to his place to get medical advice. But his colleagues suspect he's going mad, and as the clinic Dolittle used to work for is about to being taken over for a huge amount of money, many decisions have to be made. Believe him? Put him into a mental institution? Sell the clinic? But also his family is close to breaking apart. Until a circus tiger falls seriously ill.`,
     title: 'Doctor Dolittle',
     scoreDetails: {
       value: 0.01210144927536232,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 32,
           weight: 0.5,
           value: 2.167940855026245,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 15,
           weight: 0.5,
           value: 0.503582239151001,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a1398f29313caabcea7fe'),
     title: 'Leonard Part 6',
     fullplot: "The CIA asks for ex-spy Leonard's help in stopping an evil force that is brainwashing small animals into killing people. Leonard, however, has his own problems to deal with: winning back his ex-wife.",
     scoreDetails: {
       value: 0.011274880322499369,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 21,
           weight: 0.5,
           value: 2.391012668609619,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 38,
           weight: 0.5,
           value: 0.5031183958053589,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a13b3f29313caabd3c269'),
     title: 'Princess Raccoon',
     fullplot: "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
     scoreDetails: {
       value: 0.00819672131147541,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 1,
           weight: 0.5,
           value: 0.5041331648826599,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a13b3f29313caabd3ca2a'),
     title: 'Princess Raccoon',
     fullplot: "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
     scoreDetails: {
       value: 0.00819672131147541,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 1,
           weight: 0.5,
           value: 0.5041331648826599,
           details: []
         }
       ]
     }
   }
   {
     _id: new ObjectId('573a13c5f29313caabd71215'),
     title: 'The Bannen Way',
     fullplot: 'A slick, sexy, action-packed show about Neal Bannen, a charming con-man with a police chief for a father, a mob boss for an uncle and a weakness for beautiful women, who wants to turn his life around and leave the criminal lifestyle forever.',
     scoreDetails: {
       value: 0.008064516129032258,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 2,
           weight: 0.5,
           value: 3.0809128284454346,
           details: []
         },
         { inputPipelineName: 'vectorPipeline', rank: 'NA' }
       ]
     }
   }
   ```

#### About the Query

The sample query retrieves the sorted search results from the semantic search and the full-text search, and assigns a reciprocal rank score to the documents in the results based on their position in the results array. The reciprocal rank score is calculated by using the following formula:

```text
1.0/{document position in the results + constant value}
```

The query then adds the scores from both the searches for each document, ranks the documents based on the combined score, and sorts the documents to return a single result. The value for constant is always `60`.

##### Query Weights

###### Details about the weights applied in the query.

The sample query defines the following weights to the pipelines to influence that pipeline's rank contribution to the final score:

- `vectorPipeline` = 0.5

- `fullTextPipeline` = 0.5

You can adjust the weights to give more importance to one method of search. Note that a lower number provides higher weight.

The weighted reciprocal rank score is calculated by using the following formula:

```text
weight x reciprocal rank
```

The `scoreDetails.details.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion. The `scoreDetails.value` shows the weighted reciprocal rank score.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `fullplot` field for the string *charming animal*. The query uses the `voyage-4` embedding model from Voyage AI to generate embeddings for the query text, which is the same model used for the generating embeddings in the `fullplot` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the sorted documents from the semantic search in the results. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the sorted documents from the full-text search in the results.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to combine the results of the semantic and text search and return a single ranked list of documents in the results:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection for the phrase *charming
animal*. The query searches the `fullplot` field by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$rankFusion` stage to re-sort the documents in the results. The `$rankFusion` stage ensures that documents appearing in both searches appear at the top of the combined results.

1. Create a file named `run-query.py`.

2. Copy and paste the following code into the `run-query.py` file.

   ```python
   import json
   import pymongo

   client = pymongo.MongoClient('<connection-string>')

   result = client['sample_mflix']['embedded_movies'].aggregate([
     {
       "$rankFusion": {
         "input": {
           "pipelines": {
             "vectorPipeline": [
               {
                 "$vectorSearch": {
                   "index": "hybrid-vector-search",
                   "path": "fullplot",
                   "queryVector": {"text": "charming animal"},
                   "numCandidates": 500,
                   "limit": 50
                 }
               }
             ],
             "fullTextPipeline": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot",
                     "fuzzy": {}
                   }
                 }
               },
               { "$limit": 50 }
             ]
           }
         },
         "combination": {
           "weights": {
             "vectorPipeline": 0.5,
             "fullTextPipeline": 0.5
           }
         },
         "scoreDetails": True
       }
     },
     {
       "$project": {
           "_id": 1,
           "title": 1,
           "fullplot": 1,
           "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 10
     }
   ])

   print(json.dumps(list(result), indent=2, default=str))
   ```

3. Replace the `<connection-string>`.

   Ensure that your connection string includes your database user's credentials. To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the following command to query your collection:

   ```bash
   python run-query.py
   ```

   **Output:**

   ```javascript
   [
     {
       "_id": "573a1394f29313caabce074d",
       "title": "Perri",
       "fullplot": "This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.",
       "scoreDetails": {
         "value": 0.015289449112978524,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 3,
             "weight": 0.5,
             "value": 3.0468099117279053,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 8,
             "weight": 0.5,
             "value": 0.5038293600082397,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a1397f29313caabce80f6",
       "title": "Gauche the Cellist",
       "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
       "scoreDetails": {
         "value": 0.01527518656716418,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 7,
             "weight": 0.5,
             "value": 2.6925015449523926,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 4,
             "weight": 0.5,
             "value": 0.5039638876914978,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13a3f29313caabd0d0a8",
       "fullplot": "Dr. John Dolittle the beloved doctor is back, but this time around he plays cupid to bumbling circus bear Archie as he's so smitten by a Pacific Western bear female, Ava. Dr. Dolittle must help a group of forest creatures to save their forest. But with the aid of his mangy, madcap animal friends, Dr. Dolittle must teach Archie the ways of true romance in time to save his species and his home before their habit is gone. So John held a meeting for every animal in the forest to not give up without a fight no matter what kind of animal expression they have and everyone agrees to do it and save their home.",
       "title": "Dr. Dolittle 2",
       "scoreDetails": {
         "value": 0.01504603637996856,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 1,
             "weight": 0.5,
             "value": 3.2179136276245117,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 13,
             "weight": 0.5,
             "value": 0.5037489533424377,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13b4f29313caabd4070d",
       "title": "Paragraph 78",
       "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
       "scoreDetails": {
         "value": 0.01488095238095238,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 12,
             "weight": 0.5,
             "value": 2.5729734897613525,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 3,
             "weight": 0.5,
             "value": 0.5040066838264465,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13bcf29313caabd55f51",
       "title": "The Missing Lynx",
       "fullplot": "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
       "scoreDetails": {
         "value": 0.014395194697597348,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 8,
             "weight": 0.5,
             "value": 2.674750566482544,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 11,
             "weight": 0.5,
             "value": 0.503793478012085,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a139af29313caabcf089f",
       "fullplot": "Dr. John Dolittle has the world in his hands: A beautiful wife at his side, two adorable daughters and a career that could not go better. One night, he nearly runs over a dog with his car. The dog yells \"bonehead\" and disappears. From then on, his childhood ability is back: To communicate with animals. Unfortunately, the word of Dolittle's ability is spreading quickly. Soon, many animals from rat to horse flock to his place to get medical advice. But his colleagues suspect he's going mad, and as the clinic Dolittle used to work for is about to being taken over for a huge amount of money, many decisions have to be made. Believe him? Put him into a mental institution? Sell the clinic? But also his family is close to breaking apart. Until a circus tiger falls seriously ill.",
       "title": "Doctor Dolittle",
       "scoreDetails": {
         "value": 0.01210144927536232,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 32,
             "weight": 0.5,
             "value": 2.167940855026245,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 15,
             "weight": 0.5,
             "value": 0.503582239151001,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a1398f29313caabcea7fe",
       "title": "Leonard Part 6",
       "fullplot": "The CIA asks for ex-spy Leonard's help in stopping an evil force that is brainwashing small animals into killing people. Leonard, however, has his own problems to deal with: winning back his ex-wife.",
       "scoreDetails": {
         "value": 0.011274880322499369,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 21,
             "weight": 0.5,
             "value": 2.391012668609619,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 38,
             "weight": 0.5,
             "value": 0.5031183958053589,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13b3f29313caabd3c269",
       "title": "Princess Raccoon",
       "fullplot": "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
       "scoreDetails": {
         "value": 0.00819672131147541,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 1,
             "weight": 0.5,
             "value": 0.5041331648826599,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13b3f29313caabd3ca2a",
       "title": "Princess Raccoon",
       "fullplot": "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
       "scoreDetails": {
         "value": 0.00819672131147541,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 1,
             "weight": 0.5,
             "value": 0.5041331648826599,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13c5f29313caabd71215",
       "title": "The Bannen Way",
       "fullplot": "A slick, sexy, action-packed show about Neal Bannen, a charming con-man with a police chief for a father, a mob boss for an uncle and a weakness for beautiful women, who wants to turn his life around and leave the criminal lifestyle forever.",
       "scoreDetails": {
         "value": 0.008064516129032258,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 2,
             "weight": 0.5,
             "value": 3.0809128284454346,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": "NA"
           }
         ]
       }
     }
   ]
   ```

#### About the Query

The sample query retrieves the sorted search results from the semantic search and the full-text search, and assigns a reciprocal rank score to the documents in the results based on their position in the results array. The reciprocal rank score is calculated by using the following formula:

```text
1.0/{document position in the results + constant value}
```

The query then adds the scores from both the searches for each document, ranks the documents based on the combined score, and sorts the documents to return a single result. The value for constant is always `60`.

##### Query Weights

###### Details about the weights applied in the query.

The sample query defines the following weights to the pipelines to influence that pipeline's rank contribution to the final score:

- `vectorPipeline` = 0.5

- `fullTextPipeline` = 0.5

You can adjust the weights to give more importance to one method of search. Note that a lower number provides higher weight.

The weighted reciprocal rank score is calculated by using the following formula:

```text
weight x reciprocal rank
```

The `scoreDetails.details.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion. The `scoreDetails.value` shows the weighted reciprocal rank score.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `fullplot` field for the string *charming animal*. The query uses the `voyage-4` embedding model from Voyage AI to generate embeddings for the query text, which is the same model used for the generating embeddings in the `fullplot` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the sorted documents from the semantic search in the results. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the sorted documents from the full-text search in the results.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to combine the results of the semantic and text search and return a single ranked list of documents in the results:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection using the `$scoreFusion` stage to re-sort the documents in the results based on their combined scores. The `$scoreFusion` stage uses mathematical expressions to combine the scores of a document and influence the position of the document in the results. The query searches for movie plots that contain the phrase *charming animal* in the `fullplot` field by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$scoreFusion` stage.

1. Navigate to the collection in MongoDB Compass.

   On the Database screen, click the `sample_mflix` database, then click the `embedded_movies` collection.

2. Run a basic query.

   This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection using the `$scoreFusion` stage to re-sort the documents in the results based on their combined scores. The `$scoreFusion` stage uses mathematical expressions to combine the scores of a document and influence the position of the document in the results. The query searches for movie plots that contain the phrase *charming animal* in the `plot_embedding_voyage_4_large` and `fullplot` fields by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$scoreFusion` stage.

   To run this query in MongoDB Compass:

   Click the Aggregations tab.

   Click \</> Text to switch to JSON (Javascript Object Notation) view.

   Copy and paste to run the following query:

   ```javascript
   [
     {
       "$scoreFusion": {
         "input": {
           "pipelines": {
             "searchOne": [
               {
                 "$vectorSearch": {
                   "index": "hybrid-vector-search",
                   "path": "fullplot",
                   "query": {
                     "text": "charming animal"
                   },
                   "numCandidates": 500,
                   "limit": 50
                 }
               }
             ],
             "searchTwo": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot"
                   }
                 }
               },
               {
                 "$limit": 50
               }
             ]
           },
           "normalization": "sigmoid"
         },
         "combination": {
           "method": "expression",
           "expression": {
             "$sum": [
               {"$multiply": [ "$$searchOne", 10]}, "$$searchTwo"
             ]
           }
         },
         "scoreDetails": true
       }
     },
     {
       "$project": {
         "_id": 1,
         "title": 1,
         "fullplot": 1,
         "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     { "$limit": 10 }
   ]
   ```

   **Output:**

   ```javascript
   {
     "_id": {
       "$oid": "573a13a3f29313caabd0d0a8"
     },
     "fullplot": "Dr. John Dolittle the beloved doctor is back, but this time around he plays cupid to bumbling circus bear Archie as he's so smitten by a Pacific Western bear female, Ava. Dr. Dolittle must help a group of forest creatures to save their forest. But with the aid of his mangy, madcap animal friends, Dr. Dolittle must teach Archie the ways of true romance in time to save his species and his home before their habit is gone. So John held a meeting for every animal in the forest to not give up without a fight no matter what kind of animal expression they have and everyone agrees to do it and save their home.",
     "title": "Dr. Dolittle 2",
     "scoreDetails": {
       "value": 7.21329423576734,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5037543773651123,
           "weight": 1,
           "value": 0.6233412173291081,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 3.8858203887939453,
           "weight": 1,
           "value": 0.97988206247626,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1394f29313caabce074d"
     },
     "title": "Perri",
     "fullplot": "This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.",
     "scoreDetails": {
       "value": 7.192980847699699,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5038372874259949,
           "weight": 1,
           "value": 0.6233606833298636,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 3.1618731021881104,
           "weight": 1,
           "value": 0.9593740144010627,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13abf29313caabd24d08"
     },
     "title": "The Web of the Witch",
     "fullplot": "In a small North Indian village, Legend has it that a 100 years-old witch lives in an abandoned mansion on the village outskirts, and any person who goes inside is turned into an animal. In the same village a clever, naughty girl named Chunni (Shweta Prasad) lives with her widowed father, grandmother and her identical twin Munni, who is just the exact opposite of Chunni in mannerisms. But one day, Chunni's prank causes Munni enters the witch's mansion and the witch turns her into a hen. Chunni strikes a deal with Makdee (Shabana Azmi) that she will present Makdee with 100 hens in exchange for Munni in human form. How she manages this task forms the crux of the rest of this fun-filled children's movie.",
     "scoreDetails": {
       "value": 7.1420166124422755,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5033432245254517,
           "weight": 1,
           "value": 0.6232446791160281,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 2.308393716812134,
           "weight": 1,
           "value": 0.9095698212819944,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13b3f29313caabd3c269"
     },
     "title": "Princess Raccoon",
     "fullplot": "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
     "scoreDetails": {
       "value": 6.234299516337254,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5041323304176331,
           "weight": 1,
           "value": 0.6234299516337254,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13b3f29313caabd3ca2a"
     },
     "title": "Princess Raccoon",
     "fullplot": "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
     "scoreDetails": {
       "value": 6.234299516337254,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5041323304176331,
           "weight": 1,
           "value": 0.6234299516337254,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13b4f29313caabd4070d"
     },
     "title": "Paragraph 78",
     "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
     "scoreDetails": {
       "value": 6.23401433294385,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5040108561515808,
           "weight": 1,
           "value": 0.623401433294385,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1397f29313caabce80f6"
     },
     "title": "Gauche the Cellist",
     "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
     "scoreDetails": {
       "value": 6.233901124800184,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5039626359939575,
           "weight": 1,
           "value": 0.6233901124800184,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13a6f29313caabd174a6"
     },
     "title": "Bear's Kiss",
     "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
     "scoreDetails": {
       "value": 6.233729280939727,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5038894414901733,
           "weight": 1,
           "value": 0.6233729280939727,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13daf29313caabdad539"
     },
     "title": "Beauty and the Beast",
     "fullplot": "An unexpected romance blooms after the the youngest daughter of a merchant who has fallen on hard times offers herself to the mysterious beast to which her father has become indebted.",
     "scoreDetails": {
       "value": 6.233718365671121,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5038847923278809,
           "weight": 1,
           "value": 0.623371836567112,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1395f29313caabce10b7"
     },
     "title": "The Shaggy Dog",
     "fullplot": "Through an ancient spell, a boy changes into a sheepdog and back again. It seems to happen at inopportune times and the spell can only be broken by an act of bravery....",
     "scoreDetails": {
       "value": 6.233690377745682,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5038728713989258,
           "weight": 1,
           "value": 0.6233690377745682,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     }
   }
   ```

#### About the Query

The sample query retrieves the scored search results from the semantic and full-text searches and applies the `sigmoid` expression to normalize the score before combining the results. It then combines the score from the pipelines into a single aggregated score for each document.

##### Query Weights

###### Details about the weights applied in the query.

The sample query applies weights to the normalized input pipeline scores when combining the results. It applies the weights using a custom aggregation expression. In this example, the query uses the `$multiply` expression to multiply the score from the `searchOne` pipeline by `10`. This ensures that results from this pipeline contribute more to the final score than results from the `searchTwo` pipeline. It then uses the `$sum` aggregation operator to add the scores from the two pipeline stages.

```shell
Final Score = ($$searchOne * 10) + $$searchTwo
```

**Note:**

If you combine the query results using an expression (`combination.method`: `expression`), you can't use weight in your query. We recommend using `$multiply` as demonstrated in the preceding sample query.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `fullplot` field for the string *charming animal*. The query uses the `voyage-4` embedding model from Voyage AI to generate embeddings for the query text, which is the same model used for the generating embeddings for the `fullplot` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the scored documents from the semantic search. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the scored documents from the full-text search.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to return the results of the semantic and text search as a single scored list of documents:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection using the `$scoreFusion` stage to re-sort the documents in the results based on their combined scores. The `$scoreFusion` stage uses mathematical expressions to combine the scores of a document and influence the position of the document in the results. The query searches for movie plots that contain the phrase *charming animal* in the `fullplot` field by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$scoreFusion` stage.

1. Connect to your cluster using [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh).

   Open [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) in a terminal window and connect to your cluster. For detailed instructions on connecting, see [Connect to a Cluster via mongosh.](https://www.mongodb.com/docs/atlas/mongo-shell-connection.md#std-label-connect-mongo-shell)

2. Use the `sample_mflix` database.

   Run the following command at [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) prompt:

   ```sh
   use sample_mflix
   ```

   **Output:**

   ```sh
   switched to db sample_mflix
   ```

3. Run the following MongoDB Search queries against the `embedded_movies` collection.

   ```js
   db.embedded_movies.aggregate( [
      {
         "$scoreFusion": {
            "input": {
               "pipelines": {
                  "searchOne": [
                     {
                        "$vectorSearch": {
                           "index": "hybrid-vector-search",
                           "path": "fullplot",
                           "query": {
                              "text": "charming animal"
                           },
                           "numCandidates": 500,
                           "limit": 50
                        }
                     }
                  ],
                  "searchTwo": [
                     {
                        "$search": {
                           "index": "hybrid-full-text-search",
                           "text": {
                              "query": "charming animal",
                              "path": "fullplot"
                           }
                        }
                     },
                     {
                        "$limit": 50
                     }
                  ]
               },
               "normalization": "sigmoid"
            },
            "combination": {
               "method": "expression",
               "expression": {
                  "$sum": [
                    {"$multiply": [ "$$searchOne", 10]}, "$$searchTwo"
                  ]
               }
            },
            "scoreDetails": true
         }
      },
      {
         "$project": {
            "_id": 1,
            "title": 1,
            "fullplot": 1,
            "scoreDetails": {"$meta": "scoreDetails"}
         }
      },
      { "$limit": 10 }
   ] )
   ```

   **Output:**

   ```js
   [
     {
       _id: ObjectId('573a13a3f29313caabd0d0a8'),
       fullplot: "Dr. John Dolittle the beloved doctor is back, but this time around he plays cupid to bumbling circus bear Archie as he's so smitten by a Pacific Western bear female, Ava. Dr. Dolittle must help a group of forest creatures to save their forest. But with the aid of his mangy, madcap animal friends, Dr. Dolittle must teach Archie the ways of true romance in time to save his species and his home before their habit is gone. So John held a meeting for every animal in the forest to not give up without a fight no matter what kind of animal expression they have and everyone agrees to do it and save their home.",
       title: 'Dr. Dolittle 2',
       scoreDetails: {
         value: 7.2132815008617355,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5037489533424377,
             weight: 1,
             value: 0.6233399438385476,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 3.8858203887939453,
             weight: 1,
             value: 0.97988206247626,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1394f29313caabce074d'),
       title: 'Perri',
       fullplot: 'This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.',
       scoreDetails: {
         value: 7.192962235520302,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5038293600082397,
             weight: 1,
             value: 0.6233588221119238,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 3.1618731021881104,
             weight: 1,
             value: 0.9593740144010627,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13abf29313caabd24d08'),
       title: 'The Web of the Witch',
       fullplot: "In a small North Indian village, Legend has it that a 100 years-old witch lives in an abandoned mansion on the village outskirts, and any person who goes inside is turned into an animal. In the same village a clever, naughty girl named Chunni (Shweta Prasad) lives with her widowed father, grandmother and her identical twin Munni, who is just the exact opposite of Chunni in mannerisms. But one day, Chunni's prank causes Munni enters the witch's mansion and the witch turns her into a hen. Chunni strikes a deal with Makdee (Shabana Azmi) that she will present Makdee with 100 hens in exchange for Munni in human form. How she manages this task forms the crux of the rest of this fun-filled children's movie.",
       scoreDetails: {
         value: 7.1420149329447735,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5033425092697144,
             weight: 1,
             value: 0.6232445111662779,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 2.308393716812134,
             weight: 1,
             value: 0.9095698212819944,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13b3f29313caabd3c269'),
       title: 'Princess Raccoon',
       fullplot: "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
       scoreDetails: {
         value: 6.234301475369264,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5041331648826599,
             weight: 1,
             value: 0.6234301475369264,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13b3f29313caabd3ca2a'),
       title: 'Princess Raccoon',
       fullplot: "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
       scoreDetails: {
         value: 6.234301475369264,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5041331648826599,
             weight: 1,
             value: 0.6234301475369264,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13b4f29313caabd4070d'),
       title: 'Paragraph 78',
       fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
       scoreDetails: {
         value: 6.234004537484044,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5040066838264465,
             weight: 1,
             value: 0.6234004537484044,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1397f29313caabce80f6'),
       title: 'Gauche the Cellist',
       fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
       scoreDetails: {
         value: 6.2339040634711305,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5039638876914978,
             weight: 1,
             value: 0.6233904063471131,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13a6f29313caabd174a6'),
       title: "Bear's Kiss",
       fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
       scoreDetails: {
         value: 6.233723963246328,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5038871765136719,
             weight: 1,
             value: 0.6233723963246328,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13daf29313caabdad539'),
       title: 'Beauty and the Beast',
       fullplot: 'An unexpected romance blooms after the the youngest daughter of a merchant who has fallen on hard times offers herself to the mysterious beast to which her father has become indebted.',
       scoreDetails: {
         value: 6.23371192845556,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5038820505142212,
             weight: 1,
             value: 0.623371192845556,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1395f29313caabce10b7'),
       title: 'The Shaggy Dog',
       fullplot: 'Through an ancient spell, a boy changes into a sheepdog and back again. It seems to happen at inopportune times and the spell can only be broken by an act of bravery....',
       scoreDetails: {
         value: 6.233675823991921,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5038666725158691,
             weight: 1,
             value: 0.6233675823991921,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       }
     }
   ]
   ```

#### About the Query

The sample query retrieves the scored search results from the semantic and full-text searches and applies the `sigmoid` expression to normalize the score before combining the results. It then combines the score from the pipelines into a single aggregated score for each document.

##### Query Weights

###### Details about the weights applied in the query.

The sample query applies weights to the normalized input pipeline scores when combining the results. It applies the weights using a custom aggregation expression. In this example, the query uses the `$multiply` expression to multiply the score from the `searchOne` pipeline by `10`. This ensures that results from this pipeline contribute more to the final score than results from the `searchTwo` pipeline. It then uses the `$sum` aggregation operator to add the scores from the two pipeline stages.

```shell
Final Score = ($$searchOne * 10) + $$searchTwo
```

**Note:**

If you combine the query results using an expression (`combination.method`: `expression`), you can't use weight in your query. We recommend using `$multiply` as demonstrated in the preceding sample query.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `fullplot` field for the string *charming animal*. The query uses the `voyage-4` embedding model from Voyage AI to generate embeddings for the query text, which is the same model used for the generating embeddings for the `fullplot` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the scored documents from the semantic search. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the scored documents from the full-text search.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to return the results of the semantic and text search as a single scored list of documents:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection using the `$scoreFusion` stage to re-sort the documents in the results based on their combined scores. The `$scoreFusion` stage uses mathematical expressions to combine the scores of a document and influence the position of the document in the results. The query searches for movie plots that contain the phrase *charming animal* in the `fullplot` field by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$scoreFusion` stage.

1. Create a new file named `run-query.js`.

2. Copy and paste the sample code in the file.

   ```javascript
   const { MongoClient } = require("mongodb");

   async function main() {
     // Replace the placeholder with your connection string
     const uri = "<connection-string>";
     const client = new MongoClient(uri);

     try {
       await client.connect();
       const database = client.db("sample_mflix");
       const movies = database.collection("embedded_movies");

       const query = [
         {
           $scoreFusion: {
             input: {
               pipelines: {
                 searchOne: [
                   {
                     "$vectorSearch": {
                       "index": "hybrid-vector-search",
                       "path": "fullplot",
                       "query": {
                         "text": "charming animal"
                       },                 
                       "numCandidates": 500,
                       "limit": 50
                     }
                   }
                 ],
                 searchTwo: [
                   {
                     "$search": {
                       "index": "hybrid-full-text-search",
                       "text": {
                         "query": "charming animal",
                         "path": "fullplot"
                       }
                     }
                   },
                   {
                     "$limit": 50
                   }
                 ]
               },
               normalization: "sigmoid"
             },
             combination: {
               method: "expression",
               expression: {
                 $sum: [
                   {$multiply: [ "$$searchOne", 10]}, "$$searchTwo"
                 ]
               }
             },
             "scoreDetails": true
           }
         },
         {
           "$project": {
             _id: 1,
             title: 1,
             fullplot: 1,
             scoreDetails: {"$meta": "scoreDetails"}
           }
         },
         { $limit: 10 },
         {
           "$rerank": {
             "model": "rerank-2.5",
             "query": {
               "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
             },
             "path": "fullplot",
             "numDocsToRerank": 50
           }
         },
         {
           "$addFields": {
             "rerankScore": { "$meta": "score" }
           }
         },
         {
           "$limit": 10
         },
         {
           "$project": {
             "_id": 0,
             "title": 1,
             "fullplot": 1,
             "scoreDetails": 1,
             "rerankScore": 1
           }
         }
       ];

       const cursor = movies.aggregate(query);
       await cursor.forEach(doc => console.log(doc));
     } finally {
       await client.close();
     }
   }

   main().catch(console.error);
   ```

3. Replace the `<connection-string>`.

   Ensure that your connection string includes your database user's credentials. To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the following command to query your collection.

   ```bash
   node run-query.js
   ```

   **Output:**

   ```javascript
   {
     title: 'Gauche the Cellist',
     fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
     scoreDetails: {
       value: 6.2339040634711305,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Paragraph 78',
     fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
     scoreDetails: {
       value: 6.234004537484044,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: "Bear's Kiss",
     fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
     scoreDetails: {
       value: 6.233723963246328,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Beauty and the Beast',
     fullplot: 'An unexpected romance blooms after the the youngest daughter of a merchant who has fallen on hard times offers herself to the mysterious beast to which her father has become indebted.',
     scoreDetails: {
       value: 6.23371192845556,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Shaggy Dog',
     fullplot: 'Through an ancient spell, a boy changes into a sheepdog and back again. It seems to happen at inopportune times and the spell can only be broken by an act of bravery....',
     scoreDetails: {
       value: 6.233675823991921,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Perri',
     fullplot: 'This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.',
     scoreDetails: {
       value: 7.192962235520302,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Princess Raccoon',
     fullplot: "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
     scoreDetails: {
       value: 6.234301475369264,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Princess Raccoon',
     fullplot: "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
     scoreDetails: {
       value: 6.234301475369264,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     fullplot: "Dr. John Dolittle the beloved doctor is back, but this time around he plays cupid to bumbling circus bear Archie as he's so smitten by a Pacific Western bear female, Ava. Dr. Dolittle must help a group of forest creatures to save their forest. But with the aid of his mangy, madcap animal friends, Dr. Dolittle must teach Archie the ways of true romance in time to save his species and his home before their habit is gone. So John held a meeting for every animal in the forest to not give up without a fight no matter what kind of animal expression they have and everyone agrees to do it and save their home.",
     title: 'Dr. Dolittle 2',
     scoreDetails: {
       value: 7.2132815008617355,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Web of the Witch',
     fullplot: "In a small North Indian village, Legend has it that a 100 years-old witch lives in an abandoned mansion on the village outskirts, and any person who goes inside is turned into an animal. In the same village a clever, naughty girl named Chunni (Shweta Prasad) lives with her widowed father, grandmother and her identical twin Munni, who is just the exact opposite of Chunni in mannerisms. But one day, Chunni's prank causes Munni enters the witch's mansion and the witch turns her into a hen. Chunni strikes a deal with Makdee (Shabana Azmi) that she will present Makdee with 100 hens in exchange for Munni in human form. How she manages this task forms the crux of the rest of this fun-filled children's movie.",
     scoreDetails: {
       value: 7.1420149329447735,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   ```

#### About the Query

The sample query retrieves the scored search results from the semantic and full-text searches and applies the `sigmoid` expression to normalize the score before combining the results. It then combines the score from the pipelines into a single aggregated score for each document.

##### Query Weights

###### Details about the weights applied in the query.

The sample query applies weights to the normalized input pipeline scores when combining the results. It applies the weights using a custom aggregation expression. In this example, the query uses the `$multiply` expression to multiply the score from the `searchOne` pipeline by `10`. This ensures that results from this pipeline contribute more to the final score than results from the `searchTwo` pipeline. It then uses the `$sum` aggregation operator to add the scores from the two pipeline stages.

```shell
Final Score = ($$searchOne * 10) + $$searchTwo
```

**Note:**

If you combine the query results using an expression (`combination.method`: `expression`), you can't use weight in your query. We recommend using `$multiply` as demonstrated in the preceding sample query.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `fullplot` field for the string *charming animal*. The query uses the `voyage-4` embedding model from Voyage AI to generate embeddings for the query text, which is the same model used for the generating embeddings for the `fullplot` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the scored documents from the semantic search. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the scored documents from the full-text search.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to return the results of the semantic and text search as a single scored list of documents:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

This section demonstrates how to query the data in the `sample_mflix.embedded_movies` collection using the `$scoreFusion` stage to re-sort the documents in the results based on their combined scores. The `$scoreFusion` stage uses mathematical expressions to combine the scores of a document and influence the position of the document in the results. The query searches for movie plots that contain the phrase *charming animal* in the `plot_embedding_voyage_4_large` and `fullplot` fields by using the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) pipeline stages inside the `$scoreFusion` stage.

1. Create a file named `run-query.py`.

2. Copy and paste the following code into the `run-query.py` file.

   ```python
   import json
   import pymongo

   client = pymongo.MongoClient('<connection-string>')

   result = client['sample_mflix']['embedded_movies'].aggregate([
     {
       "$scoreFusion": {
         "input": {
           "pipelines": {
             "searchOne": [
               {
                 "$vectorSearch": {
                   "index": "hybrid-vector-search",
                   "path": "fullplot",
                   "query": {
                     "text": "charming animal"
                   },
                   "numCandidates": 500,
                   "limit": 50
                 }
               }
             ],
             "searchTwo": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot"
                   }
                 }
               },
               {
                 "$limit": 50
               }
             ]
           },
           "normalization": "sigmoid"
         },
         "combination": {
           "method": "expression",
           "expression": {
             "$sum": [
               {"$multiply": [ "$$searchOne", 10]}, "$$searchTwo"
             ]
           }
         },
         "scoreDetails": True
       }
     },
     {
       "$project": {
           "_id": 1,
           "title": 1,
           "fullplot": 1,
           "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 10
     }
   ])

   print(json.dumps(list(result), indent=2, default=str))
   ```

3. Replace the `<connection-string>`.

   Ensure that your connection string includes your database user's credentials. To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the following command to query your collection:

   ```bash
   python run-query.py
   ```

   **Output:**

   ```javascript
   [
     {
       "_id": "573a13a3f29313caabd0d0a8",
       "fullplot": "Dr. John Dolittle the beloved doctor is back, but this time around he plays cupid to bumbling circus bear Archie as he's so smitten by a Pacific Western bear female, Ava. Dr. Dolittle must help a group of forest creatures to save their forest. But with the aid of his mangy, madcap animal friends, Dr. Dolittle must teach Archie the ways of true romance in time to save his species and his home before their habit is gone. So John held a meeting for every animal in the forest to not give up without a fight no matter what kind of animal expression they have and everyone agrees to do it and save their home.",
       "title": "Dr. Dolittle 2",
       "scoreDetails": {
         "value": 7.21329423576734,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5037543773651123,
             "weight": 1.0,
             "value": 0.6233412173291081,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 3.8858203887939453,
             "weight": 1.0,
             "value": 0.97988206247626,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a1394f29313caabce074d",
       "title": "Perri",
       "fullplot": "This True Life Fantasy follows and shows how the life of a female squirrel, Perri, in the forest is filled with danger and fraught with peril. When not fleeing her natural enemy, the Marten, Perri finds time to fall in love with her prince-charming male squirrel.",
       "scoreDetails": {
         "value": 7.192980847699699,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5038372874259949,
             "weight": 1.0,
             "value": 0.6233606833298636,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 3.1618731021881104,
             "weight": 1.0,
             "value": 0.9593740144010627,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13abf29313caabd24d08",
       "title": "The Web of the Witch",
       "fullplot": "In a small North Indian village, Legend has it that a 100 years-old witch lives in an abandoned mansion on the village outskirts, and any person who goes inside is turned into an animal. In the same village a clever, naughty girl named Chunni (Shweta Prasad) lives with her widowed father, grandmother and her identical twin Munni, who is just the exact opposite of Chunni in mannerisms. But one day, Chunni's prank causes Munni enters the witch's mansion and the witch turns her into a hen. Chunni strikes a deal with Makdee (Shabana Azmi) that she will present Makdee with 100 hens in exchange for Munni in human form. How she manages this task forms the crux of the rest of this fun-filled children's movie.",
       "scoreDetails": {
         "value": 7.1420166124422755,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5033432245254517,
             "weight": 1.0,
             "value": 0.6232446791160281,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 2.308393716812134,
             "weight": 1.0,
             "value": 0.9095698212819944,
             "details": []
           }
         ]
       }
     },
     {
       "_id": "573a13b3f29313caabd3c269",
       "title": "Princess Raccoon",
       "fullplot": "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
       "scoreDetails": {
         "value": 6.234299516337254,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5041323304176331,
             "weight": 1.0,
             "value": 0.6234299516337254,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     },
     {
       "_id": "573a13b3f29313caabd3ca2a",
       "title": "Princess Raccoon",
       "fullplot": "Amechiyo is being hunted by his father for being too beautiful and as he tries to escape he runs into Princess Raccoon, a raccoon in human form. They fall for each other, but humans and raccoons shouldn't mix so the raccoon court causes some trouble. She saves his life, then he saves hers by finding the Frog of Paradise on the Sacred Mountain and so forth, until the tragic finale.",
       "scoreDetails": {
         "value": 6.234299516337254,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5041323304176331,
             "weight": 1.0,
             "value": 0.6234299516337254,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     },
     {
       "_id": "573a13b4f29313caabd4070d",
       "title": "Paragraph 78",
       "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
       "scoreDetails": {
         "value": 6.23401433294385,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5040108561515808,
             "weight": 1.0,
             "value": 0.623401433294385,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     },
     {
       "_id": "573a1397f29313caabce80f6",
       "title": "Gauche the Cellist",
       "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
       "scoreDetails": {
         "value": 6.233901124800184,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5039626359939575,
             "weight": 1.0,
             "value": 0.6233901124800184,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     },
     {
       "_id": "573a13a6f29313caabd174a6",
       "title": "Bear's Kiss",
       "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
       "scoreDetails": {
         "value": 6.233729280939727,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5038894414901733,
             "weight": 1.0,
             "value": 0.6233729280939727,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     },
     {
       "_id": "573a13daf29313caabdad539",
       "title": "Beauty and the Beast",
       "fullplot": "An unexpected romance blooms after the the youngest daughter of a merchant who has fallen on hard times offers herself to the mysterious beast to which her father has become indebted.",
       "scoreDetails": {
         "value": 6.233718365671121,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5038847923278809,
             "weight": 1.0,
             "value": 0.623371836567112,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     },
     {
       "_id": "573a1395f29313caabce10b7",
       "title": "The Shaggy Dog",
       "fullplot": "Through an ancient spell, a boy changes into a sheepdog and back again. It seems to happen at inopportune times and the spell can only be broken by an act of bravery....",
       "scoreDetails": {
         "value": 6.233690377745682,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5038728713989258,
             "weight": 1.0,
             "value": 0.6233690377745682,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       }
     }
   ]
   ```

#### About the Query

The sample query retrieves the scored search results from the semantic and full-text searches and applies the `sigmoid` expression to normalize the score before combining the results. It then combines the score from the pipelines into a single aggregated score for each document.

##### Query Weights

###### Details about the weights applied in the query.

The sample query applies weights to the normalized input pipeline scores when combining the results. It applies the weights using a custom aggregation expression. In this example, the query uses the `$multiply` expression to multiply the score from the `searchOne` pipeline by `10`. This ensures that results from this pipeline contribute more to the final score than results from the `searchTwo` pipeline. It then uses the `$sum` aggregation operator to add the scores from the two pipeline stages.

```shell
Final Score = ($$searchOne * 10) + $$searchTwo
```

**Note:**

If you combine the query results using an expression (`combination.method`: `expression`), you can't use weight in your query. We recommend using `$multiply` as demonstrated in the preceding sample query.

##### Query Stages

###### Details about the pipeline stages in the query.

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. Specifically, this stage takes the following input pipelines:

| `vectorPipeline` | This pipeline contains the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query. It searches the `fullplot` field for the string *charming animal*. The query uses the `voyage-4` embedding model from Voyage AI to generate embeddings for the query text, which is the same model used for the generating embeddings for the `fullplot` field. The query also specifies a search for up to `500` nearest neighbors and limit the results to `50` documents only. This stage returns the scored documents from the semantic search. |
| --- | --- |
| `fullTextPipeline` | This pipeline contains the following stages: [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) to search for movies that contain the term `charming animal` in the `fullplot` field. This stage returns the scored documents from the full-text search.; [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) to limit the output of [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) stage to `50` results only. |

The sample query uses the following stages to return the results of the semantic and text search as a single scored list of documents:

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `_id`; `title`; `fullplot`; `scoreDetails` |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |

### Reorder the Results of the Combined MongoDB Vector Search and MongoDB Search Query

This section demonstrates how to use the `$rerank` stage after the `$rankFusion` stage to reorder the documents in the results based on the relevance to the query. The query uses the `$rankFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query on the `plot_embedding_voyage_4_large` field and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

**Copy and paste the highlighted lines to your query to reorder the results.**

```json
[
  {
    "$rankFusion": {
      "input": {
        "pipelines": {
          "vectorPipeline": [
            {
              "$vectorSearch": {
              "index": "hybrid-vector-search",
              "path": "plot_embedding_voyage_4_large",
              "queryVector": [-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403],
              "numCandidates": 500,
              "limit": 50
              }
            }
          ],
          "fullTextPipeline": [
            {
              "$search": {
                "index": "hybrid-full-text-search",
                "text": {
                  "query": "charming animal",
                  "path": "fullplot",
                  "fuzzy": {}
                }
              }
            },
            { "$limit": 50 }
          ]
        }
      },
      "combination": {
        "weights": {
          "vectorPipeline": 0.5,
          "fullTextPipeline": 0.5
        }
      },
      "scoreDetails": true
    }
  },
  {
    "$project": {
      "_id": 1,
      "title": 1,
      "fullplot": 1,
      "scoreDetails": {"$meta": "scoreDetails"}
    }
  },
  {
    "$limit": 50
  },
  {
    "$rerank": {
      "model": "rerank-2.5",
      "query": {
        "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
      },
      "path": "fullplot",
      "numDocsToRerank": 50
    }
  },
  {
    "$addFields": {
      "rerankScore": { "$meta": "score" }
    }
  },
  {
    "$limit": 10
  },
  {
    "$project": {
      "_id": 0,
      "title": 1,
      "fullplot": 1,
      "scoreDetails": 1,
      "rerankScore": 1
    }
  }
]
```

**Output:**

```javascript
{
  "title": "Frog",
  "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
  "scoreDetails": {
    "value": 0.006666666666666667,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 15,
        "weight": 0.5,
        "value": 0.676909863948822,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "Frog",
  "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
  "scoreDetails": {
    "value": 0.006666666666666667,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 15,
        "weight": 0.5,
        "value": 0.676909863948822,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "Gauche the Cellist",
  "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
  "scoreDetails": {
    "value": 0.015527202696196438,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": 7,
        "weight": 0.5,
        "value": 2.6925015449523926,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 2,
        "weight": 0.5,
        "value": 0.6968950033187866,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "The Shaggy Dog",
  "fullplot": "A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.",
  "scoreDetails": {
    "value": 0.006756756756756757,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 14,
        "weight": 0.5,
        "value": 0.6772013902664185,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "The Missing Lynx",
  "fullplot": "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
  "scoreDetails": {
    "value": 0.012303436225975538,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": 8,
        "weight": 0.5,
        "value": 2.674750566482544,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 41,
        "weight": 0.5,
        "value": 0.6568813920021057,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "Paragraph 78",
  "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
  "scoreDetails": {
    "value": 0.013793759512937594,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": 12,
        "weight": 0.5,
        "value": 2.5729734897613525,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 13,
        "weight": 0.5,
        "value": 0.681915819644928,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "Bear's Kiss",
  "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
  "scoreDetails": {
    "value": 0.00819672131147541,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 1,
        "weight": 0.5,
        "value": 0.7064177393913269,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "Mac and Me",
  "fullplot": "A Mysterious Alien Creature (MAC ?) trying to escape from NASA is befriended by a young boy in a wheel chair.",
  "scoreDetails": {
    "value": 0.006024096385542169,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 23,
        "weight": 0.5,
        "value": 0.6659607887268066,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "The Shaggy Dog",
  "fullplot": "Through an ancient spell, a boy changes into a sheepdog and back again. It seems to happen at inopportune times and the spell can only be broken by an act of bravery....",
  "scoreDetails": {
    "value": 0.007042253521126761,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 11,
        "weight": 0.5,
        "value": 0.6823509931564331,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "Wild America",
  "fullplot": "Three brothers - Marshall, Marty and Mark dream of becoming naturalists and portraying animal life of America. One summer their dream comes true, they travel through America, filming alligators, bears and moose.",
  "scoreDetails": {
    "value": 0.0078125,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": 4,
        "weight": 0.5,
        "value": 2.9384851455688477,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": "NA"
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
```

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. The sample query then uses the following stages to rerank the results from the `$rankFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

The query results show the results reordered based on the rerank scores. It varies from the preceding query because the results demonstrate the full sentence describing intent (tone, adventurous, or comedic) from the movie plot. For example, "Frog" is at the top in the reranked output even though it had a lower `rankFusion` score because the rerank model judged its plot as semantically close to "charming animals with a fun, adventurous, or comedic tone," regardless of its rank-fusion score.

This section demonstrates how to use the `$rerank` stage after the `$rankFusion` stage to reorder the documents in the results based on the relevance to the query. The query uses the `$rankFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query on the `plot_embedding_voyage_4_large` field and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

**Run the following query against the collection to reorder the results.**

```shell
db.embedded_movies.aggregate([
  {
    "$rankFusion": {
      "input": {
        "pipelines": {
          "vectorPipeline": [
            {
              "$vectorSearch": {
              "index": "hybrid-vector-search",
              "path": "plot_embedding_voyage_4_large",
              "queryVector": CHARMING_ANIMAL_EMBEDDING,
              "numCandidates": 500,
              "limit": 50
              }
            }
          ],
          "fullTextPipeline": [
            {
              "$search": {
                "index": "hybrid-full-text-search",
                "text": {
                  "query": "charming animal",
                  "path": "fullplot",
                  "fuzzy": {}
                }
              }
            },
            { "$limit": 50 }
          ]
        }
      },
      "combination": {
        "weights": {
          "vectorPipeline": 0.5,
          "fullTextPipeline": 0.5
        }
      },
      "scoreDetails": true
    }
  },
  {
    "$project": {
      "_id": 1,
      "title": 1,
      "fullplot": 1,
      "scoreDetails": {"$meta": "scoreDetails"}
    }
  },
  {
    "$limit": 50
  },
  {
    "$rerank": {
      "model": "rerank-2.5",
      "query": {
        "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
      },
      "path": "fullplot",
      "numDocsToRerank": 50
    }
  },
  {
    "$addFields": {
      "rerankScore": { "$meta": "score" }
    }
  },
  {
    "$limit": 10
  },
  {
    "$project": {
      "_id": 0,
      "title": 1,
      "fullplot": 1,
      "scoreDetails": 1,
      "rerankScore": 1
    }
  }
])
```

**Output:**

```javascript
[
  {
    title: 'Frog',
    fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
    scoreDetails: {
      value: 0.006666666666666667,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 15,
          weight: 0.5,
          value: 0.676909863948822,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'Frog',
    fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
    scoreDetails: {
      value: 0.006666666666666667,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 15,
          weight: 0.5,
          value: 0.676909863948822,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'Gauche the Cellist',
    fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
    scoreDetails: {
      value: 0.015527202696196438,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'fullTextPipeline',
          rank: 7,
          weight: 0.5,
          value: 2.6925015449523926,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 2,
          weight: 0.5,
          value: 0.6968950033187866,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'The Shaggy Dog',
    fullplot: 'A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.',
    scoreDetails: {
      value: 0.006756756756756757,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 14,
          weight: 0.5,
          value: 0.6772013902664185,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'The Missing Lynx',
    fullplot: "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
    scoreDetails: {
      value: 0.012303436225975538,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'fullTextPipeline',
          rank: 8,
          weight: 0.5,
          value: 2.674750566482544,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 41,
          weight: 0.5,
          value: 0.6568813920021057,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'Paragraph 78',
    fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
    scoreDetails: {
      value: 0.013793759512937594,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'fullTextPipeline',
          rank: 12,
          weight: 0.5,
          value: 2.5729734897613525,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 13,
          weight: 0.5,
          value: 0.681915819644928,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: "Bear's Kiss",
    fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
    scoreDetails: {
      value: 0.00819672131147541,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 1,
          weight: 0.5,
          value: 0.7064177393913269,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'Mac and Me',
    fullplot: 'A Mysterious Alien Creature (MAC ?) trying to escape from NASA is befriended by a young boy in a wheel chair.',
    scoreDetails: {
      value: 0.006024096385542169,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 23,
          weight: 0.5,
          value: 0.6659607887268066,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'The Shaggy Dog',
    fullplot: 'Through an ancient spell, a boy changes into a sheepdog and back again. It seems to happen at inopportune times and the spell can only be broken by an act of bravery....',
    scoreDetails: {
      value: 0.007042253521126761,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 11,
          weight: 0.5,
          value: 0.6823509931564331,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'Wild America',
    fullplot: 'Three brothers - Marshall, Marty and Mark dream of becoming naturalists and portraying animal life of America. One summer their dream comes true, they travel through America, filming alligators, bears and moose.',
    scoreDetails: {
      value: 0.0078125,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'fullTextPipeline',
          rank: 4,
          weight: 0.5,
          value: 2.9384851455688477,
          details: []
        },
        { inputPipelineName: 'vectorPipeline', rank: 'NA' }
      ]
    },
    rerankScore: 0.5986876487731934
  }
]
```

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. The sample query then uses the following stages to rerank the results from the `$rankFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

The query results show the results reordered based on the rerank scores. It varies from the preceding query because the results demonstrate the full sentence describing intent (tone, adventurous, or comedic) from the movie plot. For example, "Frog" is at the top in the reranked output even though it had a lower `rankFusion` score because the rerank model judged its plot as semantically close to "charming animals with a fun, adventurous, or comedic tone," regardless of its rank-fusion score.

This section demonstrates how to use the `$rerank` stage after the `$rankFusion` stage to reorder the documents in the results based on the relevance to the query. The query uses the `$rankFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query on the `plot_embedding_voyage_4_large` field and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

1. Modify your `run-query.js` file.

   Copy and paste the highlighted code to your query.

   ```javascript
   const { MongoClient } = require("mongodb");
   const { inspect } = require("util");

   async function main() {
     // Replace the placeholder with your connection string
     const uri = "<connection-string>";
     const client = new MongoClient(uri);

     try {
       await client.connect();
       const database = client.db("sample_mflix");
       const movies = database.collection("embedded_movies");

       const query = [
         {
           $rankFusion: {
             input: {
               pipelines: {
                 vectorPipeline: [
                   {
                     "$vectorSearch": {
                       "index": "hybrid-vector-search",
                       "path": "plot_embedding_voyage_4_large",
                       "queryVector": [-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403],
                       "numCandidates": 500,
                       "limit": 50
                     }
                   }
                 ],
                 fullTextPipeline: [
                   {
                     "$search": {
                       "index": "hybrid-full-text-search",
                       "text": {
                         "query": "charming animal",
                         "path": "fullplot",
                         "fuzzy": {}
                       }
                     }
                   },
                   { "$limit": 50 }
                 ]
               }
             },
             combination: {
               weights: {
                 vectorPipeline: 0.5,
                 fullTextPipeline: 0.5
               }
             },
             "scoreDetails": true
           }
         },
         {
           "$project": {
             "_id": 1,
             "title": 1,
             "fullplot": 1,
             "scoreDetails": {"$meta": "scoreDetails"}
           }
         },
         {
           "$limit": 50
         },
         {
           "$rerank": {
             "model": "rerank-2.5",
             "query": {
               "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
             },
             "path": "fullplot",
             "numDocsToRerank": 50
           }
         },
         {
           "$addFields": {
             "rerankScore": { "$meta": "score" }
           }
         },
         {
           "$limit": 10
         },
         {
           "$project": {
             "_id": 0,
             "title": 1,
             "fullplot": 1,
             "scoreDetails": 1,
             "rerankScore": 1
           }
         }
       ];

       const cursor = movies.aggregate(query);
       await cursor.forEach(doc =>
         console.log(inspect(doc, { depth: null, colors: true, maxArrayLength: null }))
       );
     } finally {
       await client.close();
     }
   }

   main().catch(console.error);

   ```

2. Save the file.

3. Reorder the results of your query.

   To reorder, run the following command:

   ```bash
   node run-query.js
   ```

   **Output:**

   ```javascript
   {
     title: 'Frog',
     fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
     scoreDetails: {
       value: 0.006666666666666667,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 15,
           weight: 0.5,
           value: 0.676909863948822,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Frog',
     fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
     scoreDetails: {
       value: 0.006666666666666667,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 15,
           weight: 0.5,
           value: 0.676909863948822,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Gauche the Cellist',
     fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
     scoreDetails: {
       value: 0.015527202696196438,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 7,
           weight: 0.5,
           value: 2.6925015449523926,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 2,
           weight: 0.5,
           value: 0.6968950033187866,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Shaggy Dog',
     fullplot: 'A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.',
     scoreDetails: {
       value: 0.006756756756756757,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 14,
           weight: 0.5,
           value: 0.6772013902664185,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Missing Lynx',
     fullplot: "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
     scoreDetails: {
       value: 0.012303436225975538,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 8,
           weight: 0.5,
           value: 2.674750566482544,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 41,
           weight: 0.5,
           value: 0.6568813920021057,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Paragraph 78',
     fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
     scoreDetails: {
       value: 0.013793759512937594,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 12,
           weight: 0.5,
           value: 2.5729734897613525,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 13,
           weight: 0.5,
           value: 0.681915819644928,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: "Bear's Kiss",
     fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
     scoreDetails: {
       value: 0.00819672131147541,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 1,
           weight: 0.5,
           value: 0.7064177393913269,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Mac and Me',
     fullplot: 'A Mysterious Alien Creature (MAC ?) trying to escape from NASA is befriended by a young boy in a wheel chair.',
     scoreDetails: {
       value: 0.006024096385542169,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 23,
           weight: 0.5,
           value: 0.6659607887268066,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Shaggy Dog',
     fullplot: 'Through an ancient spell, a boy changes into a sheepdog and back again. It seems to happen at inopportune times and the spell can only be broken by an act of bravery....',
     scoreDetails: {
       value: 0.007042253521126761,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 11,
           weight: 0.5,
           value: 0.6823509931564331,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Wild America',
     fullplot: 'Three brothers - Marshall, Marty and Mark dream of becoming naturalists and portraying animal life of America. One summer their dream comes true, they travel through America, filming alligators, bears and moose.',
     scoreDetails: {
       value: 0.0078125,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 4,
           weight: 0.5,
           value: 2.9384851455688477,
           details: []
         },
         { inputPipelineName: 'vectorPipeline', rank: 'NA' }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   ```

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. The sample query then uses the following stages to rerank the results from the `$rankFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

The query results show the results reordered based on the rerank scores. It varies from the preceding query because the results demonstrate the full sentence describing intent (tone, adventurous, or comedic) from the movie plot. For example, "Frog" is at the top in the reranked output even though it had a lower `rankFusion` score because the rerank model judged its plot as semantically close to "charming animals with a fun, adventurous, or comedic tone," regardless of its rank-fusion score.

This section demonstrates how to use the `$rerank` stage after the `$rankFusion` stage to reorder the documents in the results based on the relevance to the query. The query uses the `$rankFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query on the `plot_embedding_voyage_4_large` field and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

1. Modify the query in the `run-query.py`.

   Copy and paste the highlighted code to your query.

   ```python
   import json
   import pymongo

   client = pymongo.MongoClient('<connection-string>')

   # charming animal embedding vector 
   CHARMING_ANIMAL_EMBEDDING = [-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403];

   result = client['sample_mflix']['embedded_movies'].aggregate([
     {
       "$rankFusion": {
         "input": {
           "pipelines": {
             "vectorPipeline": [
               {
                 "$vectorSearch": {
                 "index": "hybrid-vector-search",
                 "path": "plot_embedding_voyage_4_large",
                 "queryVector": CHARMING_ANIMAL_EMBEDDING,
                 "numCandidates": 500,
                 "limit": 50
                 }
               }
             ],
             "fullTextPipeline": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot",
                     "fuzzy": {}
                   }
                 }
               },
               { "$limit": 50 }
             ]
           }
         },
         "combination": {
           "weights": {
             "vectorPipeline": 0.5,
             "fullTextPipeline": 0.5
           }
         },
         "scoreDetails": True
       }
     },
     {
       "$project": {
         "_id": 1,
         "title": 1,
         "fullplot": 1,
         "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 50
     },
     {
       "$rerank": {
         "model": "rerank-2.5",
         "query": {
           "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
         },
         "path": "fullplot",
         "numDocsToRerank": 50
       }
     },
     {
       "$addFields": {
         "rerankScore": { "$meta": "score" }
       }
     },
     {
       "$limit": 10
     },
     {
       "$project": {
         "_id": 0,
         "title": 1,
         "fullplot": 1,
         "scoreDetails": 1,
         "rerankScore": 1
       }
     }
   ])

   print(json.dumps(list(result), indent=2, default=str))
   ```

2. Save the file.

3. Reorder the results of your query.

   To reorder, run the following command:

   ```bash
   python run-query.py
   ```

   **Output:**

   ```javascript
   [
     {
       "title": "Frog",
       "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
       "scoreDetails": {
         "value": 0.006666666666666667,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 15,
             "weight": 0.5,
             "value": 0.676909863948822,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Frog",
       "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
       "scoreDetails": {
         "value": 0.006666666666666667,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 15,
             "weight": 0.5,
             "value": 0.676909863948822,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Gauche the Cellist",
       "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
       "scoreDetails": {
         "value": 0.015527202696196438,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 7,
             "weight": 0.5,
             "value": 2.6925015449523926,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 2,
             "weight": 0.5,
             "value": 0.6968950033187866,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "The Shaggy Dog",
       "fullplot": "A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.",
       "scoreDetails": {
         "value": 0.006756756756756757,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 14,
             "weight": 0.5,
             "value": 0.6772013902664185,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "The Missing Lynx",
       "fullplot": "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
       "scoreDetails": {
         "value": 0.012303436225975538,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 8,
             "weight": 0.5,
             "value": 2.674750566482544,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 41,
             "weight": 0.5,
             "value": 0.6568813920021057,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Paragraph 78",
       "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
       "scoreDetails": {
         "value": 0.013793759512937594,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 12,
             "weight": 0.5,
             "value": 2.5729734897613525,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 13,
             "weight": 0.5,
             "value": 0.681915819644928,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Bear's Kiss",
       "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
       "scoreDetails": {
         "value": 0.00819672131147541,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 1,
             "weight": 0.5,
             "value": 0.7064177393913269,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Mac and Me",
       "fullplot": "A Mysterious Alien Creature (MAC ?) trying to escape from NASA is befriended by a young boy in a wheel chair.",
       "scoreDetails": {
         "value": 0.006024096385542169,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 23,
             "weight": 0.5,
             "value": 0.6659607887268066,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "The Shaggy Dog",
       "fullplot": "Through an ancient spell, a boy changes into a sheepdog and back again. It seems to happen at inopportune times and the spell can only be broken by an act of bravery....",
       "scoreDetails": {
         "value": 0.007042253521126761,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 11,
             "weight": 0.5,
             "value": 0.6823509931564331,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Wild America",
       "fullplot": "Three brothers - Marshall, Marty and Mark dream of becoming naturalists and portraying animal life of America. One summer their dream comes true, they travel through America, filming alligators, bears and moose.",
       "scoreDetails": {
         "value": 0.0078125,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 4,
             "weight": 0.5,
             "value": 2.9384851455688477,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": "NA"
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     }
   ]
   ```

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. The sample query then uses the following stages to rerank the results from the `$rankFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

The query results show the results reordered based on the rerank scores. It varies from the preceding query because the results demonstrate the full sentence describing intent (tone, adventurous, or comedic) from the movie plot. For example, "Frog" is at the top in the reranked output even though it had a lower `rankFusion` score because the rerank model judged its plot as semantically close to "charming animals with a fun, adventurous, or comedic tone," regardless of its rank-fusion score.

This section demonstrates how to use the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage after the `$scoreFusion` stage to reorder the documents in the results using Voyage AI [reranker models](https://www.mongodb.com/docs/voyageai/models/rerankers.md#std-label-voyage-rerankers) to provide more accurate relevancy scores. The query uses the `$scoreFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query on the `plot_embedding_voyage_4_large` field and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

1. Modify your [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) query.

   Copy and paste the highlighted lines to your query:

   ```javascript
   [
     {
       "$scoreFusion": {
         "input": {
           "pipelines": {
             "searchOne": [
               {
                 "$vectorSearch": {
                   "index": "hybrid-vector-search",
                   "path": "plot_embedding_voyage_4_large",
                   "queryVector": [-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403],
                   "numCandidates": 500,
                   "limit": 50
                 }
               }
             ],
             "searchTwo": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot"
                   }
                 }
               },
               {
                 "$limit": 50
               }
             ]
           },
           "normalization": "sigmoid"
         },
         "combination": {
           "method": "expression",
           "expression": {
             "$sum": [
               {"$multiply": [ "$$searchOne", 10]}, "$$searchTwo"
             ]
           }
         },
         "scoreDetails": true
       }
     },
     {
       "$project": {
         "_id": 1,
         "title": 1,
         "fullplot": 1,
         "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     { "$limit": 50 },
     {
       "$rerank": {
         "model": "rerank-2.5",
         "query": {
           "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
         },
         "path": "fullplot",
         "numDocsToRerank": 50
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
         "scoreDetails": 1,
         "rerankScore": 1
       }
     }
   ]
   ```

   **Output:**

   ```javascript
   {
     "title": "Peter Pan",
     "fullplot": "The fabled children's story show from Broadway produced for television.",
     "scoreDetails": {
       "value": 6.587427462035054,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6576964855194092,
           "weight": 1,
           "value": 0.6587427462035054,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "The Pied Piper",
     "fullplot": "The story of the Pied Piper of Hamelin with a twist.",
     "scoreDetails": {
       "value": 6.5889683326412225,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.658381998538971,
           "weight": 1,
           "value": 0.6588968332641223,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "Balloon Farm",
     "fullplot": "Uplifting tale about a man who grows a crop of colored balloons.",
     "scoreDetails": {
       "value": 6.5981568637652,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6624729633331299,
           "weight": 1,
           "value": 0.65981568637652,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "Frog",
     "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
     "scoreDetails": {
       "value": 6.630486624634797,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.676909863948822,
           "weight": 1,
           "value": 0.6630486624634797,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "Frog",
     "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
     "scoreDetails": {
       "value": 6.630486624634797,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.676909863948822,
           "weight": 1,
           "value": 0.6630486624634797,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "Gauche the Cellist",
     "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
     "scoreDetails": {
       "value": 6.674989952910186,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6968950033187866,
           "weight": 1,
           "value": 0.6674989952910186,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "The Shaggy Dog",
     "fullplot": "A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.",
     "scoreDetails": {
       "value": 6.631137907584907,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6772013902664185,
           "weight": 1,
           "value": 0.6631137907584906,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "The Missing Lynx",
     "fullplot": "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
     "scoreDetails": {
       "value": 6.58559488875663,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.6568813920021057,
           "weight": 1,
           "value": 0.658559488875663,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "Bear's Kiss",
     "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
     "scoreDetails": {
       "value": 6.696091285390122,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.7064177393913269,
           "weight": 1,
           "value": 0.6696091285390122,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "Paragraph 78",
     "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
     "scoreDetails": {
       "value": 6.6416615427792,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.681915819644928,
           "weight": 1,
           "value": 0.66416615427792,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   ```

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. The sample query then uses the following stages to rerank the results from the `$scoreFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

This section demonstrates how to use the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage after the `$scoreFusion` stage to reorder the documents in the results using Voyage AI [reranker models](https://www.mongodb.com/docs/voyageai/models/rerankers.md#std-label-voyage-rerankers) to provide more accurate relevancy scores. The query uses the `$scoreFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query on the `plot_embedding_voyage_4_large` field and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

1. Modify your [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) query.

   ```js
   db.embedded_movies.aggregate( [
      {
         "$scoreFusion": {
            "input": {
               "pipelines": {
                  "searchOne": [
                     {
                        "$vectorSearch": {
                           "index": "hybrid-vector-search",
                           "path": "plot_embedding_voyage_4_large",
                           "queryVector": CHARMING_ANIMAL_EMBEDDING,
                           "numCandidates": 500,
                           "limit": 50
                        }
                     }
                  ],
                  "searchTwo": [
                     {
                        "$search": {
                           "index": "hybrid-full-text-search",
                           "text": {
                              "query": "charming animal",
                              "path": "fullplot"
                           }
                        }
                     },
                     {
                        "$limit": 50
                     }
                  ]
               },
               "normalization": "sigmoid"
            },
            "combination": {
               "method": "expression",
               "expression": {
                  "$sum": [
                    {"$multiply": [ "$$searchOne", 10]}, "$$searchTwo"
                  ]
               }
            },
            "scoreDetails": true
         }
      },
      {
         "$project": {
            "_id": 1,
            "title": 1,
            "fullplot": 1,
            "scoreDetails": {"$meta": "scoreDetails"}
         }
      },
      { "$limit": 50 },
      {
         "$rerank": {
            "model": "rerank-2.5",
            "query": {
               "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
            },
            "path": "fullplot",
            "numDocsToRerank": 50
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
            "scoreDetails": 1,
            "rerankScore": 1
         }
      }
   ] )
   ```

   **Output:**

   ```js
   [
     {
       title: 'Peter Pan',
       fullplot: "The fabled children's story show from Broadway produced for television.",
       scoreDetails: {
         value: 6.587427462035054,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6576964855194092,
             weight: 1,
             value: 0.6587427462035054,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'The Pied Piper',
       fullplot: 'The story of the Pied Piper of Hamelin with a twist.',
       scoreDetails: {
         value: 6.5889683326412225,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.658381998538971,
             weight: 1,
             value: 0.6588968332641223,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Balloon Farm',
       fullplot: 'Uplifting tale about a man who grows a crop of colored balloons.',
       scoreDetails: {
         value: 6.5981568637652,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6624729633331299,
             weight: 1,
             value: 0.65981568637652,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Frog',
       fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
       scoreDetails: {
         value: 6.630486624634797,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.676909863948822,
             weight: 1,
             value: 0.6630486624634797,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Frog',
       fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
       scoreDetails: {
         value: 6.630486624634797,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.676909863948822,
             weight: 1,
             value: 0.6630486624634797,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Gauche the Cellist',
       fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
       scoreDetails: {
         value: 6.674989952910186,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6968950033187866,
             weight: 1,
             value: 0.6674989952910186,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'The Shaggy Dog',
       fullplot: 'A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.',
       scoreDetails: {
         value: 6.631137907584907,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6772013902664185,
             weight: 1,
             value: 0.6631137907584906,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'The Missing Lynx',
       fullplot: "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
       scoreDetails: {
         value: 6.58559488875663,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.6568813920021057,
             weight: 1,
             value: 0.658559488875663,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: "Bear's Kiss",
       fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
       scoreDetails: {
         value: 6.696091285390122,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.7064177393913269,
             weight: 1,
             value: 0.6696091285390122,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Paragraph 78',
       fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
       scoreDetails: {
         value: 6.6416615427792,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.681915819644928,
             weight: 1,
             value: 0.66416615427792,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     }
   ]
   ```

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. The sample query then uses the following stages to rerank the results from the `$scoreFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

This section demonstrates how to use the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage after the `$scoreFusion` stage to reorder the documents in the results using Voyage AI [reranker models](https://www.mongodb.com/docs/voyageai/models/rerankers.md#std-label-voyage-rerankers) to provide more accurate relevancy scores. The query uses the `$scoreFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query on the `plot_embedding_voyage_4_large` field and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

1. Modify your query in the `run-query.js` file.

   Copy and paste the highlighted code to your query as shown.

   ```javascript
   const { MongoClient } = require("mongodb");

   async function main() {
     // Replace the placeholder with your connection string
     const uri = "<connection-string>";
     const client = new MongoClient(uri);

     try {
       await client.connect();
       const database = client.db("sample_mflix");
       const movies = database.collection("embedded_movies");

       const query = [
         {
           $scoreFusion: {
             input: {
               pipelines: {
                 searchOne: [
                   {
                     "$vectorSearch": {
                       "index": "hybrid-vector-search",
                       "path": "plot_embedding_voyage_4_large",
                       "queryVector": [-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403],
                       "numCandidates": 500,
                       "limit": 50
                     }
                   }
                 ],
                 searchTwo: [
                   {
                     "$search": {
                       "index": "hybrid-full-text-search",
                       "text": {
                         "query": "charming animal",
                         "path": "fullplot"
                       }
                     }
                   },
                   {
                     "$limit": 50
                   }
                 ]
               },
               normalization: "sigmoid"
             },
             combination: {
               method: "expression",
               expression: {
                 $sum: [
                   {$multiply: [ "$$searchOne", 10]}, "$$searchTwo"
                 ]
               }
             },
             "scoreDetails": true
           }
         },
         {
           "$project": {
             _id: 1,
             title: 1,
             fullplot: 1,
             scoreDetails: {"$meta": "scoreDetails"}
           }
         },
         { $limit: 50 },
         {
           "$rerank": {
             "model": "rerank-2.5",
             "query": {
               "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
             },
             "path": "fullplot",
             "numDocsToRerank": 50
           }
         },
         {
           "$addFields": {
             "rerankScore": { "$meta": "score" }
           }
         },
         {
           "$limit": 10
         },
         {
           "$project": {
             "_id": 0,
             "title": 1,
             "fullplot": 1,
             "scoreDetails": 1,
             "rerankScore": 1
           }
         }
       ];

       const cursor = movies.aggregate(query);
       await cursor.forEach(doc => console.log(doc));
     } finally {
       await client.close();
     }
   }

   main().catch(console.error);
   ```

2. Save the file.

3. Reorder the results of your [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) query.

   To reorder, run the following command:

   ```bash
   node run-query.js
   ```

   **Output:**

   ```javascript
   {
     title: 'Peter Pan',
     fullplot: "The fabled children's story show from Broadway produced for television.",
     scoreDetails: {
       value: 6.587427462035054,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Pied Piper',
     fullplot: 'The story of the Pied Piper of Hamelin with a twist.',
     scoreDetails: {
       value: 6.5889683326412225,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Balloon Farm',
     fullplot: 'Uplifting tale about a man who grows a crop of colored balloons.',
     scoreDetails: {
       value: 6.5981568637652,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Frog',
     fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
     scoreDetails: {
       value: 6.630486624634797,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Frog',
     fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
     scoreDetails: {
       value: 6.630486624634797,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Gauche the Cellist',
     fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
     scoreDetails: {
       value: 6.674989952910186,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Shaggy Dog',
     fullplot: 'A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.',
     scoreDetails: {
       value: 6.631137907584907,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Missing Lynx',
     fullplot: "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
     scoreDetails: {
       value: 6.58559488875663,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: "Bear's Kiss",
     fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
     scoreDetails: {
       value: 6.696091285390122,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Paragraph 78',
     fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
     scoreDetails: {
       value: 6.6416615427792,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   ```

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. The sample query then uses the following stages to rerank the results from the `$scoreFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

This section demonstrates how to use the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage after the `$scoreFusion` stage to reorder the documents in the results using Voyage AI [reranker models](https://www.mongodb.com/docs/voyageai/models/rerankers.md#std-label-voyage-rerankers) to provide more accurate relevancy scores. The query uses the `$scoreFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query on the `plot_embedding_voyage_4_large` field and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

1. Modify your query in the `run-query.py` file.

   Copy and paste the highlighted code into the `run-query.py` file.

   ```python
   import json
   import pymongo

   client = pymongo.MongoClient('<connection-string>')

   # charming animal embedding vector 
   CHARMING_ANIMAL_EMBEDDING = [-0.02300029993057251, -0.040718235075473785, 0.026521876454353333,  /* ...embedding floats truncated by snapshot... */ 0.03609616681933403]

   result = client['sample_mflix']['embedded_movies'].aggregate([
     {
       "$scoreFusion": {
         "input": {
           "pipelines": {
             "searchOne": [
               {
                 "$vectorSearch": {
                   "index": "hybrid-vector-search",
                   "path": "plot_embedding_voyage_4_large",
                   "queryVector": CHARMING_ANIMAL_EMBEDDING,
                   "numCandidates": 500,
                   "limit": 50
                 }
               }
             ],
             "searchTwo": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot"
                   }
                 }
               },
               {
                 "$limit": 50
               }
             ]
           },
           "normalization": "sigmoid"
         },
         "combination": {
           "method": "expression",
           "expression": {
             "$sum": [
               {"$multiply": [ "$$searchOne", 10]}, "$$searchTwo"
             ]
           }
         },
         "scoreDetails": True
       }
     },
     {
       "$project": {
           "_id": 1,
           "title": 1,
           "fullplot": 1,
           "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 50
     },
     {
       "$rerank": {
         "model": "rerank-2.5",
         "query": {
           "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
         },
         "path": "fullplot",
         "numDocsToRerank": 50
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
         "scoreDetails": 1,
         "rerankScore": 1
       }
     }
   ])

   print(json.dumps(list(result), indent=2, default=str))
   ```

2. Save the file.

3. Reorder the results of your [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) query.

   To reorder, run the following command:

   ```bash
   python run-query.py
   ```

   **Output:**

   ```javascript
   [
     {
       "title": "Peter Pan",
       "fullplot": "The fabled children's story show from Broadway produced for television.",
       "scoreDetails": {
         "value": 6.587427462035054,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6576964855194092,
             "weight": 1.0,
             "value": 0.6587427462035054,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "The Pied Piper",
       "fullplot": "The story of the Pied Piper of Hamelin with a twist.",
       "scoreDetails": {
         "value": 6.5889683326412225,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.658381998538971,
             "weight": 1.0,
             "value": 0.6588968332641223,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Balloon Farm",
       "fullplot": "Uplifting tale about a man who grows a crop of colored balloons.",
       "scoreDetails": {
         "value": 6.5981568637652,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6624729633331299,
             "weight": 1.0,
             "value": 0.65981568637652,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Frog",
       "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
       "scoreDetails": {
         "value": 6.630486624634797,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.676909863948822,
             "weight": 1.0,
             "value": 0.6630486624634797,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Frog",
       "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
       "scoreDetails": {
         "value": 6.630486624634797,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.676909863948822,
             "weight": 1.0,
             "value": 0.6630486624634797,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Gauche the Cellist",
       "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
       "scoreDetails": {
         "value": 6.674989952910186,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6968950033187866,
             "weight": 1.0,
             "value": 0.6674989952910186,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "The Shaggy Dog",
       "fullplot": "A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.",
       "scoreDetails": {
         "value": 6.631137907584907,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6772013902664185,
             "weight": 1.0,
             "value": 0.6631137907584906,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "The Missing Lynx",
       "fullplot": "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
       "scoreDetails": {
         "value": 6.58559488875663,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.6568813920021057,
             "weight": 1.0,
             "value": 0.658559488875663,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Bear's Kiss",
       "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
       "scoreDetails": {
         "value": 6.696091285390122,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.7064177393913269,
             "weight": 1.0,
             "value": 0.6696091285390122,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Paragraph 78",
       "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
       "scoreDetails": {
         "value": 6.6416615427792,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.681915819644928,
             "weight": 1.0,
             "value": 0.66416615427792,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     }
   ]
   ```

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. The sample query then uses the following stages to rerank the results from the `$scoreFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

This section demonstrates how to use the `$rerank` stage after the `$rankFusion` stage to reorder the documents in the results based on the relevance to the query. The query uses the `$rankFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) queries on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

**Copy and paste the highlighted lines to your query to reorder the results.**

```json
[
  {
    "$rankFusion": {
      "input": {
        "pipelines": {
          "vectorPipeline": [
            {
              "$vectorSearch": {
              "index": "hybrid-vector-search",
              "path": "fullplot",
              "query": {
                "text": "charming animal"
              },           
              "numCandidates": 500,
              "limit": 50
              }
            }
          ],
          "fullTextPipeline": [
            {
              "$search": {
                "index": "hybrid-full-text-search",
                "text": {
                  "query": "charming animal",
                  "path": "fullplot",
                  "fuzzy": {}
                }
              }
            },
            { "$limit": 50 }
          ]
        }
      },
      "combination": {
        "weights": {
          "vectorPipeline": 0.5,
          "fullTextPipeline": 0.5
        }
      },
      "scoreDetails": true
    }
  },
  {
    "$project": {
      "_id": 1,
      "title": 1,
      "fullplot": 1,
      "scoreDetails": {"$meta": "scoreDetails"}
    }
  },
  {
    "$limit": 50
  },
  {
    "$rerank": {
      "model": "rerank-2.5",
      "query": {
        "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
      },
      "path": "fullplot",
      "numDocsToRerank": 50
    }
  },
  {
    "$addFields": {
      "rerankScore": { "$meta": "score" }
    }
  },
  {
    "$limit": 10
  },
  {
    "$project": {
      "_id": 0,
      "title": 1,
      "fullplot": 1,
      "scoreDetails": 1,
      "rerankScore": 1
    }
  }
]
```

**Output:**

```javascript
{
  "title": "Frog",
  "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
  "scoreDetails": {
    "value": 0.00641025641025641,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 18,
        "weight": 0.5,
        "value": 0.5034534931182861,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "Frog",
  "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
  "scoreDetails": {
    "value": 0.00641025641025641,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 18,
        "weight": 0.5,
        "value": 0.5034534931182861,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "Gauche the Cellist",
  "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
  "scoreDetails": {
    "value": 0.01527518656716418,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": 7,
        "weight": 0.5,
        "value": 2.6925015449523926,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 4,
        "weight": 0.5,
        "value": 0.5039638876914978,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "The Shaggy Dog",
  "fullplot": "A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.",
  "scoreDetails": {
    "value": 0.006756756756756757,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 14,
        "weight": 0.5,
        "value": 0.5036964416503906,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "The Missing Lynx",
  "fullplot": "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
  "scoreDetails": {
    "value": 0.014395194697597348,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": 8,
        "weight": 0.5,
        "value": 2.674750566482544,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 11,
        "weight": 0.5,
        "value": 0.503793478012085,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "Bear's Kiss",
  "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
  "scoreDetails": {
    "value": 0.007692307692307693,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 5,
        "weight": 0.5,
        "value": 0.5038871765136719,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "Paragraph 78",
  "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
  "scoreDetails": {
    "value": 0.01488095238095238,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": 12,
        "weight": 0.5,
        "value": 2.5729734897613525,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 3,
        "weight": 0.5,
        "value": 0.5040066838264465,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "Mac and Me",
  "fullplot": "A Mysterious Alien Creature (MAC ?) trying to escape from NASA is befriended by a young boy in a wheel chair.",
  "scoreDetails": {
    "value": 0.006172839506172839,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 21,
        "weight": 0.5,
        "value": 0.503449022769928,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "Beauty and the Beast",
  "fullplot": "An unexpected romance blooms after the the youngest daughter of a merchant who has fallen on hard times offers herself to the mysterious beast to which her father has become indebted.",
  "scoreDetails": {
    "value": 0.007575757575757576,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 6,
        "weight": 0.5,
        "value": 0.5038820505142212,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
{
  "title": "The Shaggy Dog",
  "fullplot": "Through an ancient spell, a boy changes into a sheepdog and back again. It seems to happen at inopportune times and the spell can only be broken by an act of bravery....",
  "scoreDetails": {
    "value": 0.007462686567164179,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "fullTextPipeline",
        "rank": "NA"
      },
      {
        "inputPipelineName": "vectorPipeline",
        "rank": 7,
        "weight": 0.5,
        "value": 0.5038666725158691,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5986876487731934
}
```

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. The sample query then uses the following stages to rerank the results from the `$rankFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

The query results show the results reordered based on the rerank scores. It varies from the preceding query because the results demonstrate the full sentence describing intent (tone, adventurous, or comedic) from the movie plot. For example, "Frog" is at the top in the reranked output even though it had a lower `rankFusion` score because the rerank model judged its plot as semantically close to "charming animals with a fun, adventurous, or comedic tone," regardless of its rank-fusion score.

This section demonstrates how to use the `$rerank` stage after the `$rankFusion` stage to reorder the documents in the results based on the relevance to the query. The query uses the `$rankFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) queries on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

**Run the following query against the collection to reorder the results.**

```shell
db.embedded_movies.aggregate([
  {
    "$rankFusion": {
      "input": {
        "pipelines": {
          "vectorPipeline": [
            {
              "$vectorSearch": {
              "index": "hybrid-vector-search",
              "path": "fullplot",
              "query": {
                "text": "charming animal"
              },
              "numCandidates": 500,
              "limit": 50
              }
            }
          ],
          "fullTextPipeline": [
            {
              "$search": {
                "index": "hybrid-full-text-search",
                "text": {
                  "query": "charming animal",
                  "path": "fullplot",
                  "fuzzy": {}
                }
              }
            },
            { "$limit": 50 }
          ]
        }
      },
      "combination": {
        "weights": {
          "vectorPipeline": 0.5,
          "fullTextPipeline": 0.5
        }
      },
      "scoreDetails": true
    }
  },
  {
    "$project": {
      "_id": 1,
      "title": 1,
      "fullplot": 1,
      "scoreDetails": {"$meta": "scoreDetails"}
    }
  },
  {
    "$limit": 50
  },
  {
    "$rerank": {
      "model": "rerank-2.5",
      "query": {
        "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
      },
      "path": "fullplot",
      "numDocsToRerank": 50
    }
  },
  {
    "$addFields": {
      "rerankScore": { "$meta": "score" }
    }
  },
  {
    "$limit": 10
  },
  {
    "$project": {
      "_id": 0,
      "title": 1,
      "fullplot": 1,
      "scoreDetails": 1,
      "rerankScore": 1
    }
  }
])
```

**Output:**

```javascript
[
  {
    title: 'Frog',
    fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
    scoreDetails: {
      value: 0.00641025641025641,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 18,
          weight: 0.5,
          value: 0.5034534931182861,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'Frog',
    fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
    scoreDetails: {
      value: 0.00641025641025641,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 18,
          weight: 0.5,
          value: 0.5034534931182861,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'Gauche the Cellist',
    fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
    scoreDetails: {
      value: 0.01527518656716418,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'fullTextPipeline',
          rank: 7,
          weight: 0.5,
          value: 2.6925015449523926,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 4,
          weight: 0.5,
          value: 0.5039638876914978,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'The Shaggy Dog',
    fullplot: 'A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.',
    scoreDetails: {
      value: 0.006756756756756757,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 14,
          weight: 0.5,
          value: 0.5036964416503906,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'The Missing Lynx',
    fullplot: "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
    scoreDetails: {
      value: 0.014395194697597348,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'fullTextPipeline',
          rank: 8,
          weight: 0.5,
          value: 2.674750566482544,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 11,
          weight: 0.5,
          value: 0.503793478012085,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: "Bear's Kiss",
    fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
    scoreDetails: {
      value: 0.007692307692307693,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 5,
          weight: 0.5,
          value: 0.5038871765136719,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'Paragraph 78',
    fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
    scoreDetails: {
      value: 0.01488095238095238,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'fullTextPipeline',
          rank: 12,
          weight: 0.5,
          value: 2.5729734897613525,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 3,
          weight: 0.5,
          value: 0.5040066838264465,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'Mac and Me',
    fullplot: 'A Mysterious Alien Creature (MAC ?) trying to escape from NASA is befriended by a young boy in a wheel chair.',
    scoreDetails: {
      value: 0.006172839506172839,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 21,
          weight: 0.5,
          value: 0.503449022769928,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'Beauty and the Beast',
    fullplot: 'An unexpected romance blooms after the the youngest daughter of a merchant who has fallen on hard times offers herself to the mysterious beast to which her father has become indebted.',
    scoreDetails: {
      value: 0.007575757575757576,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 6,
          weight: 0.5,
          value: 0.5038820505142212,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  },
  {
    title: 'The Shaggy Dog',
    fullplot: 'Through an ancient spell, a boy changes into a sheepdog and back again. It seems to happen at inopportune times and the spell can only be broken by an act of bravery....',
    scoreDetails: {
      value: 0.007462686567164179,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline',
          rank: 7,
          weight: 0.5,
          value: 0.5038666725158691,
          details: []
        }
      ]
    },
    rerankScore: 0.5986876487731934
  }
]
```

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. The sample query then uses the following stages to rerank the results from the `$rankFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

The query results show the results reordered based on the rerank scores. It varies from the preceding query because the results demonstrate the full sentence describing intent (tone, adventurous, or comedic) from the movie plot. For example, "Frog" is at the top in the reranked output even though it had a lower `rankFusion` score because the rerank model judged its plot as semantically close to "charming animals with a fun, adventurous, or comedic tone," regardless of its rank-fusion score.

This section demonstrates how to use the `$rerank` stage after the `$rankFusion` stage to reorder the documents in the results based on the relevance to the query. The query uses the `$rankFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) queries on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

1. Modify your `run-query.js` file.

   Copy and paste the highlighted code to your query.

   ```javascript
   const { MongoClient } = require("mongodb");
   const { inspect } = require("util");

   async function main() {
     // Replace the placeholder with your connection string
     const uri = "<connection-string>";
     const client = new MongoClient(uri);

     try {
       await client.connect();
       const database = client.db("sample_mflix");
       const movies = database.collection("embedded_movies");

       const query = [
         {
           $rankFusion: {
             input: {
               pipelines: {
                 vectorPipeline: [
                   {
                     "$vectorSearch": {
                       "index": "hybrid-vector-search",
                       "path": "fullplot",
                       "query": {
                         "text": "charming animal"
                       },                     
                       "numCandidates": 500,
                       "limit": 50
                     }
                   }
                 ],
                 fullTextPipeline: [
                   {
                     "$search": {
                       "index": "hybrid-full-text-search",
                       "text": {
                         "query": "charming animal",
                         "path": "fullplot",
                         "fuzzy": {}
                       }
                     }
                   },
                   { "$limit": 50 }
                 ]
               }
             },
             combination: {
               weights: {
                 vectorPipeline: 0.5,
                 fullTextPipeline: 0.5
               }
             },
             "scoreDetails": true
           }
         },
         {
           "$project": {
             "_id": 1,
             "title": 1,
             "fullplot": 1,
             "scoreDetails": {"$meta": "scoreDetails"}
           }
         },
         {
           "$limit": 50
         },
         {
           "$rerank": {
             "model": "rerank-2.5",
             "query": {
               "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
             },
             "path": "fullplot",
             "numDocsToRerank": 50
           }
         },
         {
           "$addFields": {
             "rerankScore": { "$meta": "score" }
           }
         },
         {
           "$limit": 10
         },
         {
           "$project": {
             "_id": 0,
             "title": 1,
             "fullplot": 1,
             "scoreDetails": 1,
             "rerankScore": 1
           }
         }
       ];

       const cursor = movies.aggregate(query);
       await cursor.forEach(doc =>
         console.log(inspect(doc, { depth: null, colors: true, maxArrayLength: null }))
       );
     } finally {
       await client.close();
     }
   }

   main().catch(console.error);

   ```

2. Save the file.

3. Reorder the results of your query.

   To reorder, run the following command:

   ```bash
   node run-query.js
   ```

   **Output:**

   ```javascript
   {
     title: 'Frog',
     fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
     scoreDetails: {
       value: 0.00641025641025641,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 18,
           weight: 0.5,
           value: 0.5034534931182861,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Frog',
     fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
     scoreDetails: {
       value: 0.00641025641025641,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 18,
           weight: 0.5,
           value: 0.5034534931182861,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Gauche the Cellist',
     fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
     scoreDetails: {
       value: 0.01527518656716418,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 7,
           weight: 0.5,
           value: 2.6925015449523926,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 4,
           weight: 0.5,
           value: 0.5039638876914978,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Shaggy Dog',
     fullplot: 'A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.',
     scoreDetails: {
       value: 0.006756756756756757,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 14,
           weight: 0.5,
           value: 0.5036964416503906,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Missing Lynx',
     fullplot: "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
     scoreDetails: {
       value: 0.014395194697597348,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 8,
           weight: 0.5,
           value: 2.674750566482544,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 11,
           weight: 0.5,
           value: 0.503793478012085,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: "Bear's Kiss",
     fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
     scoreDetails: {
       value: 0.007692307692307693,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 5,
           weight: 0.5,
           value: 0.5038871765136719,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Paragraph 78',
     fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
     scoreDetails: {
       value: 0.01488095238095238,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         {
           inputPipelineName: 'fullTextPipeline',
           rank: 12,
           weight: 0.5,
           value: 2.5729734897613525,
           details: []
         },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 3,
           weight: 0.5,
           value: 0.5040066838264465,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Mac and Me',
     fullplot: 'A Mysterious Alien Creature (MAC ?) trying to escape from NASA is befriended by a young boy in a wheel chair.',
     scoreDetails: {
       value: 0.006172839506172839,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 21,
           weight: 0.5,
           value: 0.503449022769928,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Beauty and the Beast',
     fullplot: 'An unexpected romance blooms after the the youngest daughter of a merchant who has fallen on hard times offers herself to the mysterious beast to which her father has become indebted.',
     scoreDetails: {
       value: 0.007575757575757576,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 6,
           weight: 0.5,
           value: 0.5038820505142212,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Shaggy Dog',
     fullplot: 'Through an ancient spell, a boy changes into a sheepdog and back again. It seems to happen at inopportune times and the spell can only be broken by an act of bravery....',
     scoreDetails: {
       value: 0.007462686567164179,
       description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
       details: [
         { inputPipelineName: 'fullTextPipeline', rank: 'NA' },
         {
           inputPipelineName: 'vectorPipeline',
           rank: 7,
           weight: 0.5,
           value: 0.5038666725158691,
           details: []
         }
       ]
     },
     rerankScore: 0.5986876487731934
   }
   ```

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. The sample query then uses the following stages to rerank the results from the `$rankFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

The query results show the results reordered based on the rerank scores. It varies from the preceding query because the results demonstrate the full sentence describing intent (tone, adventurous, or comedic) from the movie plot. For example, "Frog" is at the top in the reranked output even though it had a lower `rankFusion` score because the rerank model judged its plot as semantically close to "charming animals with a fun, adventurous, or comedic tone," regardless of its rank-fusion score.

This section demonstrates how to use the `$rerank` stage after the `$rankFusion` stage to reorder the documents in the results based on the relevance to the query. The query uses the `$rankFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) and [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) queries on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

1. Modify the query in the `run-query.py`.

   Copy and paste the highlighted code to your query.

   ```python
   import json
   import pymongo

   client = pymongo.MongoClient('<connection-string>')

   result = client['sample_mflix']['embedded_movies'].aggregate([
     {
       "$rankFusion": {
         "input": {
           "pipelines": {
             "vectorPipeline": [
               {
                 "$vectorSearch": {
                 "index": "hybrid-vector-search",
                 "path": "fullplot",
                 "query": {
                   "text": "charming animal"
                 },
                 "numCandidates": 500,
                 "limit": 50
                 }
               }
             ],
             "fullTextPipeline": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot",
                     "fuzzy": {}
                   }
                 }
               },
               { "$limit": 50 }
             ]
           }
         },
         "combination": {
           "weights": {
             "vectorPipeline": 0.5,
             "fullTextPipeline": 0.5
           }
         },
         "scoreDetails": True
       }
     },
     {
       "$project": {
         "_id": 1,
         "title": 1,
         "fullplot": 1,
         "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 50
     },
     {
       "$rerank": {
         "model": "rerank-2.5",
         "query": {
           "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
         },
         "path": "fullplot",
         "numDocsToRerank": 50
       }
     },
     {
       "$addFields": {
         "rerankScore": { "$meta": "score" }
       }
     },
     {
       "$limit": 10
     },
     {
       "$project": {
         "_id": 0,
         "title": 1,
         "fullplot": 1,
         "scoreDetails": 1,
         "rerankScore": 1
       }
     }
   ])

   print(json.dumps(list(result), indent=2, default=str))
   ```

2. Save the file.

3. Reorder the results of your query.

   To reorder, run the following command:

   ```bash
   python run-query.py
   ```

   **Output:**

   ```javascript
   [
     {
       "title": "Frog",
       "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
       "scoreDetails": {
         "value": 0.00641025641025641,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 18,
             "weight": 0.5,
             "value": 0.5034534931182861,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Frog",
       "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
       "scoreDetails": {
         "value": 0.00641025641025641,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 18,
             "weight": 0.5,
             "value": 0.5034534931182861,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Gauche the Cellist",
       "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
       "scoreDetails": {
         "value": 0.01527518656716418,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 7,
             "weight": 0.5,
             "value": 2.6925015449523926,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 4,
             "weight": 0.5,
             "value": 0.5039638876914978,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "The Shaggy Dog",
       "fullplot": "A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.",
       "scoreDetails": {
         "value": 0.006756756756756757,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 14,
             "weight": 0.5,
             "value": 0.5036964416503906,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "The Missing Lynx",
       "fullplot": "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
       "scoreDetails": {
         "value": 0.014395194697597348,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 8,
             "weight": 0.5,
             "value": 2.674750566482544,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 11,
             "weight": 0.5,
             "value": 0.503793478012085,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Bear's Kiss",
       "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
       "scoreDetails": {
         "value": 0.007692307692307693,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 5,
             "weight": 0.5,
             "value": 0.5038871765136719,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Paragraph 78",
       "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
       "scoreDetails": {
         "value": 0.01488095238095238,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": 12,
             "weight": 0.5,
             "value": 2.5729734897613525,
             "details": []
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 3,
             "weight": 0.5,
             "value": 0.5040066838264465,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Mac and Me",
       "fullplot": "A Mysterious Alien Creature (MAC ?) trying to escape from NASA is befriended by a young boy in a wheel chair.",
       "scoreDetails": {
         "value": 0.006172839506172839,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 21,
             "weight": 0.5,
             "value": 0.503449022769928,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Beauty and the Beast",
       "fullplot": "An unexpected romance blooms after the the youngest daughter of a merchant who has fallen on hard times offers herself to the mysterious beast to which her father has become indebted.",
       "scoreDetails": {
         "value": 0.007575757575757576,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 6,
             "weight": 0.5,
             "value": 0.5038820505142212,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "The Shaggy Dog",
       "fullplot": "Through an ancient spell, a boy changes into a sheepdog and back again. It seems to happen at inopportune times and the spell can only be broken by an act of bravery....",
       "scoreDetails": {
         "value": 0.007462686567164179,
         "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
         "details": [
           {
             "inputPipelineName": "fullTextPipeline",
             "rank": "NA"
           },
           {
             "inputPipelineName": "vectorPipeline",
             "rank": 7,
             "weight": 0.5,
             "value": 0.5038666725158691,
             "details": []
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     }
   ]
   ```

The sample query uses the `$rankFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final ranked results set. It returns a ranked set of documents based on the ranks that appear in their input pipelines and the pipeline weights. The sample query then uses the following stages to rerank the results from the `$rankFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

The query results show the results reordered based on the rerank scores. It varies from the preceding query because the results demonstrate the full sentence describing intent (tone, adventurous, or comedic) from the movie plot. For example, "Frog" is at the top in the reranked output even though it had a lower `rankFusion` score because the rerank model judged its plot as semantically close to "charming animals with a fun, adventurous, or comedic tone," regardless of its rank-fusion score.

This section demonstrates how to use the `$rerank` stage after the `$scoreFusion` stage to reorder the documents in the results based on the relevance to the query. The query uses the `$scoreFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

1. Modify your [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) query.

   Copy and paste the highlighted lines to your query:

   ```javascript
   [
     {
       "$scoreFusion": {
         "input": {
           "pipelines": {
             "searchOne": [
               {
                 "$vectorSearch": {
                   "index": "hybrid-vector-search",
                   "path": "fullplot",
                   "query": {
                     "text": "charming animal"
                   },         
                   "numCandidates": 500,
                   "limit": 50
                 }
               }
             ],
             "searchTwo": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot"
                   }
                 }
               },
               {
                 "$limit": 50
               }
             ]
           },
           "normalization": "sigmoid"
         },
         "combination": {
           "method": "expression",
           "expression": {
             "$sum": [
               {"$multiply": [ "$$searchOne", 10]}, "$$searchTwo"
             ]
           }
         },
         "scoreDetails": true
       }
     },
     {
       "$project": {
         "_id": 1,
         "title": 1,
         "fullplot": 1,
         "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     { "$limit": 50 },
     {
       "$rerank": {
         "model": "rerank-2.5",
         "query": {
           "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
         },
         "path": "fullplot",
         "numDocsToRerank": 50
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
         "scoreDetails": 1,
         "rerankScore": 1
       }
     }
   ]
   ```

   **Output:**

   ```javascript
   {
     "title": "Spooky Buddies",
     "fullplot": "The puppies go on a spooky adventure through a haunted mansion.",
     "scoreDetails": {
       "value": 6.2317282191140535,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5030372142791748,
           "weight": 1,
           "value": 0.6231728219114053,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "The Pied Piper",
     "fullplot": "The story of the Pied Piper of Hamelin with a twist.",
     "scoreDetails": {
       "value": 6.23214811586569,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.503216028213501,
           "weight": 1,
           "value": 0.623214811586569,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "Balloon Farm",
     "fullplot": "Uplifting tale about a man who grows a crop of colored balloons.",
     "scoreDetails": {
       "value": 6.2319795995251255,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5031442642211914,
           "weight": 1,
           "value": 0.6231979599525126,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "Frog",
     "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
     "scoreDetails": {
       "value": 6.232705710150128,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5034534931182861,
           "weight": 1,
           "value": 0.6232705710150128,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "Frog",
     "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
     "scoreDetails": {
       "value": 6.232705710150128,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5034534931182861,
           "weight": 1,
           "value": 0.6232705710150128,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "Gauche the Cellist",
     "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
     "scoreDetails": {
       "value": 6.2339040634711305,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5039638876914978,
           "weight": 1,
           "value": 0.6233904063471131,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "The Missing Lynx",
     "fullplot": "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
     "scoreDetails": {
       "value": 6.233503976062483,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.503793478012085,
           "weight": 1,
           "value": 0.6233503976062483,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "The Shaggy Dog",
     "fullplot": "A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.",
     "scoreDetails": {
       "value": 6.23327614682495,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5036964416503906,
           "weight": 1,
           "value": 0.623327614682495,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "Bear's Kiss",
     "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.",
     "scoreDetails": {
       "value": 6.233723963246328,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5038871765136719,
           "weight": 1,
           "value": 0.6233723963246328,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   {
     "title": "Paragraph 78",
     "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
     "scoreDetails": {
       "value": 6.234004537484044,
       "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
       "normalization": "sigmoid",
       "combination": {
         "method": "custom expression",
         "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       "details": [
         {
           "inputPipelineName": "searchOne",
           "inputPipelineRawScore": 0.5040066838264465,
           "weight": 1,
           "value": 0.6234004537484044,
           "details": []
         },
         {
           "inputPipelineName": "searchTwo",
           "inputPipelineRawScore": 0,
           "weight": 1,
           "value": 0
         }
       ]
     },
     "rerankScore": 0.5986876487731934
   }
   ```

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. The sample query then uses the following stages to rerank the results from the `$scoreFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

This section demonstrates how to use the `$rerank` stage after the `$scoreFusion` stage to reorder the documents in the results based on the relevance to the query. The query uses the `$scoreFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

1. Modify your [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) query.

   ```js
   db.embedded_movies.aggregate( [
      {
         "$scoreFusion": {
            "input": {
               "pipelines": {
                  "searchOne": [
                     {
                        "$vectorSearch": {
                           "index": "hybrid-vector-search",
                           "path": "fullplot",
                           "query": {
                              "text": "charming animal"
                           },
                           "numCandidates": 500,
                           "limit": 50
                        }
                     }
                  ],
                  "searchTwo": [
                     {
                        "$search": {
                           "index": "hybrid-full-text-search",
                           "text": {
                              "query": "charming animal",
                              "path": "fullplot"
                           }
                        }
                     },
                     {
                        "$limit": 50
                     }
                  ]
               },
               "normalization": "sigmoid"
            },
            "combination": {
               "method": "expression",
               "expression": {
                  "$sum": [
                    {"$multiply": [ "$$searchOne", 10]}, "$$searchTwo"
                  ]
               }
            },
            "scoreDetails": true
         }
      },
      {
         "$project": {
            "_id": 1,
            "title": 1,
            "fullplot": 1,
            "scoreDetails": {"$meta": "scoreDetails"}
         }
      },
      { "$limit": 50 },
      {
         "$rerank": {
            "model": "rerank-2.5",
            "query": {
               "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
            },
            "path": "fullplot",
            "numDocsToRerank": 50
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
            "scoreDetails": 1,
            "rerankScore": 1
         }
      }
   ] )
   ```

   **Output:**

   ```js
   [
     {
       title: 'Spooky Buddies',
       fullplot: 'The puppies go on a spooky adventure through a haunted mansion.',
       scoreDetails: {
         value: 6.2317282191140535,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5030372142791748,
             weight: 1,
             value: 0.6231728219114053,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'The Pied Piper',
       fullplot: 'The story of the Pied Piper of Hamelin with a twist.',
       scoreDetails: {
         value: 6.23214811586569,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.503216028213501,
             weight: 1,
             value: 0.623214811586569,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Balloon Farm',
       fullplot: 'Uplifting tale about a man who grows a crop of colored balloons.',
       scoreDetails: {
         value: 6.2319795995251255,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5031442642211914,
             weight: 1,
             value: 0.6231979599525126,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Frog',
       fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
       scoreDetails: {
         value: 6.232705710150128,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5034534931182861,
             weight: 1,
             value: 0.6232705710150128,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Frog',
       fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
       scoreDetails: {
         value: 6.232705710150128,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5034534931182861,
             weight: 1,
             value: 0.6232705710150128,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Gauche the Cellist',
       fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
       scoreDetails: {
         value: 6.2339040634711305,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5039638876914978,
             weight: 1,
             value: 0.6233904063471131,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'The Missing Lynx',
       fullplot: "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
       scoreDetails: {
         value: 6.233503976062483,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.503793478012085,
             weight: 1,
             value: 0.6233503976062483,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'The Shaggy Dog',
       fullplot: 'A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.',
       scoreDetails: {
         value: 6.23327614682495,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5036964416503906,
             weight: 1,
             value: 0.623327614682495,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: "Bear's Kiss",
       fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
       scoreDetails: {
         value: 6.233723963246328,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5038871765136719,
             weight: 1,
             value: 0.6233723963246328,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     },
     {
       title: 'Paragraph 78',
       fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
       scoreDetails: {
         value: 6.234004537484044,
         description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
         normalization: 'sigmoid',
         combination: {
           method: 'custom expression',
           expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         details: [
           {
             inputPipelineName: 'searchOne',
             inputPipelineRawScore: 0.5040066838264465,
             weight: 1,
             value: 0.6234004537484044,
             details: []
           },
           {
             inputPipelineName: 'searchTwo',
             inputPipelineRawScore: 0,
             weight: 1,
             value: 0
           }
         ]
       },
       rerankScore: 0.5986876487731934
     }
   ]
   ```

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. The sample query then uses the following stages to rerank the results from the `$scoreFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

This section demonstrates how to use the `$rerank` stage after the `$scoreFusion` stage to reorder the documents in the results based on the relevance to the query. The query uses the `$scoreFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

1. Modify your query in the `run-query.js` file.

   Copy and paste the highlighted code to your query as shown.

   ```javascript
   const { MongoClient } = require("mongodb");

   async function main() {
     // Replace the placeholder with your connection string
     const uri = "<connection-string>";
     const client = new MongoClient(uri);

     try {
       await client.connect();
       const database = client.db("sample_mflix");
       const movies = database.collection("embedded_movies");

       const query = [
         {
           $scoreFusion: {
             input: {
               pipelines: {
                 searchOne: [
                   {
                     "$vectorSearch": {
                       "index": "hybrid-vector-search",
                       "path": "fullplot",
                       "query": {
                         "text": "charming animal"
                       },                    
                       "numCandidates": 500,
                       "limit": 50
                     }
                   }
                 ],
                 searchTwo: [
                   {
                     "$search": {
                       "index": "hybrid-full-text-search",
                       "text": {
                         "query": "charming animal",
                         "path": "fullplot"
                       }
                     }
                   },
                   {
                     "$limit": 50
                   }
                 ]
               },
               normalization: "sigmoid"
             },
             combination: {
               method: "expression",
               expression: {
                 $sum: [
                   {$multiply: [ "$$searchOne", 10]}, "$$searchTwo"
                 ]
               }
             },
             "scoreDetails": true
           }
         },
         {
           "$project": {
             _id: 1,
             title: 1,
             fullplot: 1,
             scoreDetails: {"$meta": "scoreDetails"}
           }
         },
         { $limit: 50 },
         {
           "$rerank": {
             "model": "rerank-2.5",
             "query": {
               "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
             },
             "path": "fullplot",
             "numDocsToRerank": 50
           }
         },
         {
           "$addFields": {
             "rerankScore": { "$meta": "score" }
           }
         },
         {
           "$limit": 10
         },
         {
           "$project": {
             "_id": 0,
             "title": 1,
             "fullplot": 1,
             "scoreDetails": 1,
             "rerankScore": 1
           }
         }
       ];

       const cursor = movies.aggregate(query);
       await cursor.forEach(doc => console.log(doc));
     } finally {
       await client.close();
     }
   }

   main().catch(console.error);
   ```

2. Save the file.

3. Reorder the results of your [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) query.

   To reorder, run the following command:

   ```bash
   node run-query.js
   ```

   **Output:**

   ```javascript
   {
     title: 'Spooky Buddies',
     fullplot: 'The puppies go on a spooky adventure through a haunted mansion.',
     scoreDetails: {
       value: 6.2317282191140535,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Pied Piper',
     fullplot: 'The story of the Pied Piper of Hamelin with a twist.',
     scoreDetails: {
       value: 6.23214811586569,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Balloon Farm',
     fullplot: 'Uplifting tale about a man who grows a crop of colored balloons.',
     scoreDetails: {
       value: 6.2319795995251255,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Frog',
     fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
     scoreDetails: {
       value: 6.232705710150128,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Frog',
     fullplot: 'A kid experimenting with frogs finds that one of the subjects can actually speak.',
     scoreDetails: {
       value: 6.232705710150128,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Gauche the Cellist',
     fullplot: 'A cellist in a small orchestra receives help from animals to help him practice his music.',
     scoreDetails: {
       value: 6.2339040634711305,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Missing Lynx',
     fullplot: "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
     scoreDetails: {
       value: 6.233503976062483,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'The Shaggy Dog',
     fullplot: 'A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.',
     scoreDetails: {
       value: 6.23327614682495,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: "Bear's Kiss",
     fullplot: 'A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms into a human.',
     scoreDetails: {
       value: 6.233723963246328,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   {
     title: 'Paragraph 78',
     fullplot: 'This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals',
     scoreDetails: {
       value: 6.234004537484044,
       description: 'the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:',
       normalization: 'sigmoid',
       combination: {
         method: 'custom expression',
         expression: "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
       },
       details: [ [Object], [Object] ]
     },
     rerankScore: 0.5986876487731934
   }
   ```

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. The sample query then uses the following stages to rerank the results from the `$scoreFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |

This section demonstrates how to use the `$rerank` stage after the `$scoreFusion` stage to reorder the documents in the results based on the relevance to the query. The query uses the `$scoreFusion` stage to combine the results of a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query and a [`$search`](https://www.mongodb.com/docs/search/query/aggregation-stages/search.md#mongodb-pipeline-pipe.-search) query on the `fullplot` field. The `$rerank` stage then reorders the results based on the relevance to the query.

1. Modify your query in the `run-query.py` file.

   Copy and paste the highlighted code into the `run-query.py` file.

   ```python
   import json
   import pymongo

   client = pymongo.MongoClient('<connection-string>')

   result = client['sample_mflix']['embedded_movies'].aggregate([
     {
       "$scoreFusion": {
         "input": {
           "pipelines": {
             "searchOne": [
               {
                 "$vectorSearch": {
                   "index": "hybrid-vector-search",
                   "path": "fullplot",
                   "query": {
                     "text": "charming animal"
                   },
                   "numCandidates": 500,
                   "limit": 50
                 }
               }
             ],
             "searchTwo": [
               {
                 "$search": {
                   "index": "hybrid-full-text-search",
                   "text": {
                     "query": "charming animal",
                     "path": "fullplot"
                   }
                 }
               },
               {
                 "$limit": 50
               }
             ]
           },
           "normalization": "sigmoid"
         },
         "combination": {
           "method": "expression",
           "expression": {
             "$sum": [
               {"$multiply": [ "$$searchOne", 10]}, "$$searchTwo"
             ]
           }
         },
         "scoreDetails": True
       }
     },
     {
       "$project": {
           "_id": 1,
           "title": 1,
           "fullplot": 1,
           "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 50
     },
     {
       "$rerank": {
         "model": "rerank-2.5",
         "query": {
           "text": "Movies about charming animals with a fun, adventurous, or comedic tone."
         },
         "path": "fullplot",
         "numDocsToRerank": 50
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
         "scoreDetails": 1,
         "rerankScore": 1
       }
     }
   ])

   print(json.dumps(list(result), indent=2, default=str))
   ```

2. Save the file.

3. Reorder the results of your [`$scoreFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/scoreFusion.md#mongodb-pipeline-pipe.-scoreFusion) query.

   To reorder, run the following command:

   ```bash
   python run-query.py
   ```

   **Output:**

   ```javascript
   [
     {
       "title": "Spooky Buddies",
       "fullplot": "The puppies go on a spooky adventure through a haunted mansion.",
       "scoreDetails": {
         "value": 6.2317282191140535,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5030372142791748,
             "weight": 1.0,
             "value": 0.6231728219114053,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "The Pied Piper",
       "fullplot": "The story of the Pied Piper of Hamelin with a twist.",
       "scoreDetails": {
         "value": 6.23214811586569,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.503216028213501,
             "weight": 1.0,
             "value": 0.623214811586569,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Balloon Farm",
       "fullplot": "Uplifting tale about a man who grows a crop of colored balloons.",
       "scoreDetails": {
         "value": 6.2319795995251255,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5031442642211914,
             "weight": 1.0,
             "value": 0.6231979599525126,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Frog",
       "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
       "scoreDetails": {
         "value": 6.232705710150128,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5034534931182861,
             "weight": 1.0,
             "value": 0.6232705710150128,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Frog",
       "fullplot": "A kid experimenting with frogs finds that one of the subjects can actually speak.",
       "scoreDetails": {
         "value": 6.232705710150128,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5034534931182861,
             "weight": 1.0,
             "value": 0.6232705710150128,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Gauche the Cellist",
       "fullplot": "A cellist in a small orchestra receives help from animals to help him practice his music.",
       "scoreDetails": {
         "value": 6.2339040634711305,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5039638876914978,
             "weight": 1.0,
             "value": 0.6233904063471131,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "The Missing Lynx",
       "fullplot": "A group of animals look for a way off of an eccentric billionaire's own personal Noah's Ark.",
       "scoreDetails": {
         "value": 6.233503976062483,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.503793478012085,
             "weight": 1.0,
             "value": 0.6233503976062483,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "The Shaggy Dog",
       "fullplot": "A man tries to live a normal life despite the fact that he sometimes turns into a sheepdog.",
       "scoreDetails": {
         "value": 6.23327614682495,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5036964416503906,
             "weight": 1.0,
             "value": 0.623327614682495,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Bear's Kiss",
       "fullplot": "A fairy tale-like love story between young circus artist Lola and the bear Misha, who one day transforms intoa human.",
       "scoreDetails": {
         "value": 6.233723963246328,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5038871765136719,
             "weight": 1.0,
             "value": 0.6233723963246328,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     },
     {
       "title": "Paragraph 78",
       "fullplot": "This is a wonderful movie about a group of men frontier the Nashville area who like to make puppets out of real animals",
       "scoreDetails": {
         "value": 6.234004537484044,
         "description": "the value calculated by combining the scores (either normalized or raw) across input pipelines from which this document is output from:",
         "normalization": "sigmoid",
         "combination": {
           "method": "custom expression",
           "expression": "{ string: { $sum: [ { $multiply: [ '$$searchOne', 10 ] }, '$$searchTwo' ] } }"
         },
         "details": [
           {
             "inputPipelineName": "searchOne",
             "inputPipelineRawScore": 0.5040066838264465,
             "weight": 1.0,
             "value": 0.6234004537484044,
             "details": []
           },
           {
             "inputPipelineName": "searchTwo",
             "inputPipelineRawScore": 0,
             "weight": 1.0,
             "value": 0
           }
         ]
       },
       "rerankScore": 0.5986876487731934
     }
   ]
   ```

The sample query uses the `$scoreFusion` stage to execute the semantic and full text queries independently and then de-duplicate and combine the input query results into a final scored results set. It returns a set of documents based on the combined score from their input pipelines and the combination weights. The sample query then uses the following stages to rerank the results from the `$scoreFusion` stage:

| [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) | Reranks the results from the `$rankFusion` stage using the `rerank-2.5` model. The `query` field specifies the same query as the [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) query. The `path` field specifies the `fullplot` field as the text field to use for reranking. The `numDocsToRerank` field specifies the number of documents to rerank. This stage returns the reranked documents in the results. |
| --- | --- |
| [`$addFields`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields.md#mongodb-pipeline-pipe.-addFields) | Adds the `rerankScore` field to the results. The value of the `rerankScore` field is the score returned by the `$rerank` stage. |

The sample query uses the following stages to limit and return the results:

| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the output to `10` results only. |
| --- | --- |
| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the following fields in the results: `title`; `fullplot`; `scoreDetails`; `rerankScore` |
