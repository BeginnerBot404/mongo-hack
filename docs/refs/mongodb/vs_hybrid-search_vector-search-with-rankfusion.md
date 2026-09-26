> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: cloud, local, maven, gradle, similar-terms-same-field, same-term-multiple-fields, same-term-multiple-models
-->

# How to Combine Multiple `$vectorSearch` Queries

The MongoDB `$rankFusion` aggregation stage supports [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) inside the input pipeline. You can use `$rankFusion` to combine multiple [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries against the same collection in the same pipeline. [`$rankFusion`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/rankFusion.md#mongodb-pipeline-pipe.-rankFusion) first executes all input pipelines independently, and then de-duplicates and combines the input pipeline results into a final ranked results set. To run multiple [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries against multiple collections in a single pipeline, use [`$unionWith`.](https://www.mongodb.com/docs/manual/reference/operator/aggregation/unionWith.md#mongodb-pipeline-pipe.-unionWith)

## Use Cases and Benefits

You can run the following types of [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries by using the `$rankFusion` pipeline:

- Run multiple [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries for **similar terms
  against the same field**.

  This allows you to perform a comprehensive search of your dataset for similar terms in the same query.

- Run multiple [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries for the **same term
  against multiple fields**.

  This allows you to search multiple fields in your dataset to determine which fields return the best results for the query.

- Run multiple [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries for the **same term
  against embeddings from different embedding models**.

  This allows you to search embeddings from different embedding models to determine the semantic interpretation differences between the different models.

## About the Tutorial

This tutorial demonstrates how to run different [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries against the collections in the `sample_mflix` database. You can use the vector embeddings in the `embedded_movies` collection to try the sample queries or use Automated Embedding to generate embeddings for the sample data.

The example queries in this tutorial use the following fields in the `embedded_movies` collection in the `sample_mflix` database:

- `fullplot`, which contains the summary of a movie's plot as a text string.

- `title`, which contains the title of the movie as a text string.

- `text-embedding-ada-002`, which contains embeddings created by using OpenAI's `text-embedding-ada-002` embedding model.

This tutorial walks you through the following steps:

1. Set up a MongoDB Vector Search index on the `sample_mflix.embedded_movies` collection.

2. Run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query with `$rankFusion` to perform the following searches:

   - Search the `full` field for movie plots that contain movies with plots similar to `light-hearted comedy with ghosts` and `slapstick humor with paranormal events`.

   - Search the `fullplot` and `title` fields for movies with plots similar to `battle between good and evil` using embeddings from Voyage AI.

   - Search the `plot_embedding` and `fullplot` fields for movies with plots similar to `journey across lands` using embeddings from OpenAI and Voyage AI respectively.

The example queries in this tutorial use the following fields in the `embedded_movies` collection in the `sample_mflix` database:

- `fullplot`, which contains the summary of a movie's plot as a text string.

- `title`, which contains the title of the movie as a text string.

- `text-embedding-ada-002`, which contains embeddings created by using OpenAI's `text-embedding-ada-002` embedding model.

This tutorial walks you through the following steps:

1. Set up a MongoDB Vector Search index on the `sample_mflix.embedded_movies` collection.

2. Run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query with `$rankFusion` to perform the following searches:

   - Search the `full` field for movie plots that contain movies with plots similar to `light-hearted comedy with ghosts` and `slapstick humor with paranormal events`.

   - Search the `fullplot` and `title` fields for movies with plots similar to `battle between good and evil` using embeddings from Voyage AI.

   - Search the `plot_embedding` and `fullplot` fields for movies with plots similar to `journey across lands` using embeddings from OpenAI and Voyage AI respectively.

The example queries in this tutorial use the following fields in the `embedded_movies` collection in the `sample_mflix` database:

- `fullplot`, which contains the summary of a movie's plot as a text string.

- `title`, which contains the title of the movie as a text string.

- `text-embedding-ada-002`, which contains embeddings created by using OpenAI's `text-embedding-ada-002` embedding model.

This tutorial walks you through the following steps:

1. Set up a MongoDB Vector Search index on the `sample_mflix.embedded_movies` collection.

2. Run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query with `$rankFusion` to perform the following searches:

   - Search the `full` field for movie plots that contain movies with plots similar to `light-hearted comedy with ghosts` and `slapstick humor with paranormal events`.

   - Search the `fullplot` and `title` fields for movies with plots similar to `battle between good and evil` using embeddings from Voyage AI.

   - Search the `plot_embedding` and `fullplot` fields for movies with plots similar to `journey across lands` using embeddings from OpenAI and Voyage AI respectively.

The example queries in this tutorial use the following fields in the `embedded_movies` collection in the `sample_mflix` database:

- `fullplot`, which contains the summary of a movie's plot as a text string.

- `title`, which contains the title of the movie as a text string.

- `text-embedding-ada-002`, which contains embeddings created by using OpenAI's `text-embedding-ada-002` embedding model.

This tutorial walks you through the following steps:

1. Set up a MongoDB Vector Search index on the `sample_mflix.embedded_movies` collection.

2. Run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query with `$rankFusion` to perform the following searches:

   - Search the `full` field for movie plots that contain movies with plots similar to `light-hearted comedy with ghosts` and `slapstick humor with paranormal events`.

   - Search the `fullplot` and `title` fields for movies with plots similar to `battle between good and evil` using embeddings from Voyage AI.

   - Search the `plot_embedding` and `fullplot` fields for movies with plots similar to `journey across lands` using embeddings from OpenAI and Voyage AI respectively.

The example queries in this tutorial use the following fields in the `embedded_movies` collection in the `sample_mflix` database:

- `fullplot`, which contains the summary of a movie's plot as a text string.

- `title`, which contains the title of the movie as a text string.

- `text-embedding-ada-002`, which contains embeddings created by using OpenAI's `text-embedding-ada-002` embedding model.

This tutorial walks you through the following steps:

1. Set up a MongoDB Vector Search index on the `sample_mflix.embedded_movies` collection.

2. Run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query with `$rankFusion` to perform the following searches:

   - Search the `full` field for movie plots that contain movies with plots similar to `light-hearted comedy with ghosts` and `slapstick humor with paranormal events`.

   - Search the `fullplot` and `title` fields for movies with plots similar to `battle between good and evil` using embeddings from Voyage AI.

   - Search the `plot_embedding` and `fullplot` fields for movies with plots similar to `journey across lands` using embeddings from OpenAI and Voyage AI respectively.

The example queries in this tutorial use the following fields in the `embedded_movies` collection in the `sample_mflix` database:

- `plot_embedding`, which contains embeddings created by using OpenAI's `text-embedding-ada-002` embedding model.

- `plot_embedding_voyage_4_large`, which contains embeddings created by using Voyage AI's `voyage-4-large` embedding model. You use this field for all sample queries in this tutorial.

For the second query listed in [Use Cases and Benefits](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases), you must generate embeddings for another field. To try the sample query for this use case, complete the steps in [Generate the Embeddings.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-generate-embeddings)

This tutorial walks you through the following steps:

1. Set up a MongoDB Vector Search index on the `sample_mflix.embedded_movies` collection.

2. Run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query with `$rankFusion` to perform the following searches:

   - Search the `plot_embedding_voyage_4_large` field for movie plots that contain movies with plots similar to `light-hearted comedy
     with ghosts` and `slapstick humor with paranormal events`.

   - Search the `plot_embedding_voyage_4_large` and `title_embedding` fields for movies with plots similar to `battle between good and evil` using embeddings from Voyage AI.

   - Search the `plot_embedding` and `plot_embedding_voyage_4_large` fields for movies with plots similar to `journey across lands` using embeddings from OpenAI and Voyage AI respectively.

The example queries in this tutorial use the following fields in the `embedded_movies` collection in the `sample_mflix` database:

- `plot_embedding`, which contains embeddings created by using OpenAI's `text-embedding-ada-002` embedding model.

- `plot_embedding_voyage_4_large`, which contains embeddings created by using Voyage AI's `voyage-4-large` embedding model. You use this field for all sample queries in this tutorial.

For the second query listed in [Use Cases and Benefits](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases), you must generate embeddings for another field. To try the sample query for this use case, complete the steps in [Generate the Embeddings.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-generate-embeddings)

This tutorial walks you through the following steps:

1. Set up a MongoDB Vector Search index on the `sample_mflix.embedded_movies` collection.

2. Run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query with `$rankFusion` to perform the following searches:

   - Search the `plot_embedding_voyage_4_large` field for movie plots that contain movies with plots similar to `light-hearted comedy
     with ghosts` and `slapstick humor with paranormal events`.

   - Search the `plot_embedding_voyage_4_large` and `title_embedding` fields for movies with plots similar to `battle between good and evil` using embeddings from Voyage AI.

   - Search the `plot_embedding` and `plot_embedding_voyage_4_large` fields for movies with plots similar to `journey across lands` using embeddings from OpenAI and Voyage AI respectively.

The example queries in this tutorial use the following fields in the `embedded_movies` collection in the `sample_mflix` database:

- `plot_embedding`, which contains embeddings created by using OpenAI's `text-embedding-ada-002` embedding model.

- `plot_embedding_voyage_4_large`, which contains embeddings created by using Voyage AI's `voyage-4-large` embedding model. You use this field for all sample queries in this tutorial.

For the second query listed in [Use Cases and Benefits](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases), you must generate embeddings for another field. To try the sample query for this use case, complete the steps in [Generate the Embeddings.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-generate-embeddings)

This tutorial walks you through the following steps:

1. Set up a MongoDB Vector Search index on the `sample_mflix.embedded_movies` collection.

2. Run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query with `$rankFusion` to perform the following searches:

   - Search the `plot_embedding_voyage_4_large` field for movie plots that contain movies with plots similar to `light-hearted comedy
     with ghosts` and `slapstick humor with paranormal events`.

   - Search the `plot_embedding_voyage_4_large` and `title_embedding` fields for movies with plots similar to `battle between good and evil` using embeddings from Voyage AI.

   - Search the `plot_embedding` and `plot_embedding_voyage_4_large` fields for movies with plots similar to `journey across lands` using embeddings from OpenAI and Voyage AI respectively.

The example queries in this tutorial use the following fields in the `embedded_movies` collection in the `sample_mflix` database:

- `plot_embedding`, which contains embeddings created by using OpenAI's `text-embedding-ada-002` embedding model.

- `plot_embedding_voyage_4_large`, which contains embeddings created by using Voyage AI's `voyage-4-large` embedding model. You use this field for all sample queries in this tutorial.

For the second query listed in [Use Cases and Benefits](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases), you must generate embeddings for another field. To try the sample query for this use case, complete the steps in [Generate the Embeddings.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-generate-embeddings)

This tutorial walks you through the following steps:

1. Set up a MongoDB Vector Search index on the `sample_mflix.embedded_movies` collection.

2. Run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query with `$rankFusion` to perform the following searches:

   - Search the `plot_embedding_voyage_4_large` field for movie plots that contain movies with plots similar to `light-hearted comedy
     with ghosts` and `slapstick humor with paranormal events`.

   - Search the `plot_embedding_voyage_4_large` and `title_embedding` fields for movies with plots similar to `battle between good and evil` using embeddings from Voyage AI.

   - Search the `plot_embedding` and `plot_embedding_voyage_4_large` fields for movies with plots similar to `journey across lands` using embeddings from OpenAI and Voyage AI respectively.

The example queries in this tutorial use the following fields in the `embedded_movies` collection in the `sample_mflix` database:

- `plot_embedding`, which contains embeddings created by using OpenAI's `text-embedding-ada-002` embedding model.

- `plot_embedding_voyage_4_large`, which contains embeddings created by using Voyage AI's `voyage-4-large` embedding model. You use this field for all sample queries in this tutorial.

For the second query listed in [Use Cases and Benefits](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases), you must generate embeddings for another field. To try the sample query for this use case, complete the steps in [Generate the Embeddings.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-generate-embeddings)

This tutorial walks you through the following steps:

1. Set up a MongoDB Vector Search index on the `sample_mflix.embedded_movies` collection.

2. Run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query with `$rankFusion` to perform the following searches:

   - Search the `plot_embedding_voyage_4_large` field for movie plots that contain movies with plots similar to `light-hearted comedy
     with ghosts` and `slapstick humor with paranormal events`.

   - Search the `plot_embedding_voyage_4_large` and `title_embedding` fields for movies with plots similar to `battle between good and evil` using embeddings from Voyage AI.

   - Search the `plot_embedding` and `plot_embedding_voyage_4_large` fields for movies with plots similar to `journey across lands` using embeddings from OpenAI and Voyage AI respectively.

### Prerequisites

Before you begin, ensure that your cluster meets the requirements described in the [Prerequisites](https://www.mongodb.com/docs/vector-search/hybrid-search/hybrid-search-overview.md#std-label-avs-hybrid-search-prereqs). In addition, you must have the following installed:

- MongoDB Compass version 1.37.0 or later.

* [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) version 2.0 or later.

- Go version 1.16 or later.

- MongoDB Go Driver version 1.8 or later.

* Java Development Kit (JDK) version 8 or later.

* MongoDB Java Driver version 4.11 or later.

- Node.js version 14.17.0 or later.

- MongoDB Node.js Driver version 4.11 or later.

* Python version 3.8 or later.

* PyMongo version 4.7 or later.

- Ruby version 2.7 or later.

- MongoDB Ruby Driver version 3.0 or later.

#### Generate the Embeddings

To query for the same term against multiple fields, you must prepare the dataset to include embeddings for different fields. This section demonstrates how to generate embeddings for the `title` field in the collection by using Voyage AI's `voyage-4-large` embedding model.

You can skip this section if you want to only try the other sample use cases.

##### Prerequisites

- An environment to run interactive Python notebooks such as [VS Code](https://code.visualstudio.com/docs/datascience/jupyter-notebooks) or [Colab.](https://colab.research.google.com)

- API key for Voyage AI embedding models.

##### Procedure

In this section, you generate embeddings for the `title` field in the `embedded_movies` collection by using Voyage AI's `voyage-4-large` embedding model.

1. Set up the environment.

   Create an interactive Python notebook by saving a file with the `.ipynb` extension, and then run the following command in the notebook to install the dependencies:

   ```python
   pip install --quiet voyageai pymongo
   ```

2. Define and use a function to generate vector embeddings.

   Paste and run the following code in your notebook after replacing the following placeholder values:

   | `<api-key>` | Your Voyage AI API (Application Programming Interface) key (line 6). |
   | --- | --- |
   | `<connection-string>` | Your MongoDB cluster connection string (line 18). |

   The following code defines a function that generates vector embeddings by using a proprietary embedding model from [Voyage AI](https://www.voyageai.com/). Specifically, this code does the following:

   - Specifies the `voyage-4-large` embedding model.

   - Creates a function named `get_embedding()` that calls the model's API (Application Programming Interface) to generate `2048` dimension embedding for a given text input.

   - Connects to the cluster and fetches `3500` documents from the `sample_mflix.embedded_movies` namespace.

   - Generates embeddings from each document's `title` field by using the `get_embedding()` function.

   - Updates each document with a new field named `title_embedding_voyage_4_large` that contains the embedding value by using the MongoDB PyMongo Driver.

   ```python
   import os
   import pymongo
   import voyageai

   # Specify your Voyage API key and embedding model
   os.environ["VOYAGE_API_KEY"] = "<api-key>"

   model = "voyage-4-large"
   outputDimension = 2048
   vo = voyageai.Client()
   # Define a function to generate embeddings
   def get_embedding(data, input_type = "document"):
     embeddings = vo.embed(
         data, model = model, output_dimension = outputDimension, input_type = input_type
     ).embeddings
     return embeddings[0]

   # Connect to your MongoDB cluster
   mongo_client = pymongo.MongoClient("<connection-string>")
   db = mongo_client["sample_mflix"]
   collection = db["embedded_movies"]

   # Filter to exclude null or empty plot fields
   filter = {"title": {"$nin": [None, ""]}}

   # Get a subset of documents in the collection
   documents = collection.find(filter).limit(3500)

   # Update each document with a new embedding field
   updated_doc_count = 0
   for doc in documents:
       embedding = get_embedding(doc["title"])
       if embedding is not None:
           collection.update_one({"_id": doc["_id"]}, {"$set": {"title_embedding_voyage_4_large": embedding}})
           updated_doc_count += 1

   print(f"Updated {updated_doc_count} documents.")
   ```

   **Output:**

   ```sh
   Updated 3500 documents.
   ```

   **Note:**

   It might take up to 15 minutes for the operation to complete.

### Create the MongoDB Vector Search Index

In this section, you create the MongoDB Vector Search index on the `sample_mflix.embedded_movies` namespace. The section demonstrates the index definitions that can be used for running various queries.

Before creating the index, complete the procedure to [generate the embeddings.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-generate-embeddings)

1. Connect to your cluster using MongoDB Compass.

   To learn more, see [Connect to a Cluster via Compass.](https://www.mongodb.com/docs/atlas/compass-connection.md#std-label-atlas-connect-via-compass)

2. Specify the database and collection.

   On the Database screen, expand the name of the database, `sample_mflix`, then click the name of the collection, `embedded_movies`.

3. Create the MongoDB Vector Search index.

   Click the Indexes tab, then select Search Indexes.

   Click Create, then select Search Index from the dropdown.

   Enter `multiple-vector-search` as the name of the index.

   Select Vector Search to define the MongoDB Vector Search index.

   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "plot_embedding",
         "numDimensions": 1536,
         "similarity": "dotProduct"
       },
       {
         "type": "vector",
         "path": "plot_embedding_voyage_4_large",
         "numDimensions": 2048,
         "similarity": "dotProduct"
       },
       {
         "type": "vector",
         "path": "title_embedding_voyage_4_large",
         "numDimensions": 2048,
         "similarity": "dotProduct"
       }
     ]
   }
   ```

   The `multiple-vector-search` index definition indexes the following fields:

   - `plot_embedding_voyage_4_large` field, which contains vector embeddings generated by the `voyage-4-large` embedding model that represent the summary of a movie's plot. The index definition specifies `2048` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for all the use cases in this tutorial.

   - `title_embedding_voyage_4_large` field, which contains vector embeddings generated by the `voyage-4-large` embedding model that represent the title of the movie. The index definition specifies `2048` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for the [second use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   - `plot_embedding` field, which contains vector embeddings generated by the OpenAI `text-embedding-ada-002` embedding model that represent the summary of a movie's plot. The index definition specifies `1536` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for the [third use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   All three fields use the `vector` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector) and `dotProduct` [similarity.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

   Click Create Search Index.

Before creating the index, complete the procedure to [generate the embeddings.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-generate-embeddings)

1. Connect to the cluster using [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh).

   Open [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) in a terminal window and connect to your Atlas cluster. For detailed instructions on connecting, see [Connect via mongosh.](https://www.mongodb.com/docs/atlas/mongo-shell-connection.md#std-label-connect-mongo-shell)

2. Switch to the database that contains the collection for which you want to create the index.

   **Example:**

   ```shell
   use sample_mflix
   ```

   **Output:**

   ```shell
   switched to db sample_mflix
   ```

3. Run the `db.collection.createSearchIndex()` method.

   ```shell
   db.embedded_movies.createSearchIndex(
     "multiple-vector-search", 
     "vectorSearch", 
     {
       "fields": [
         {
           "type": "vector",
           "path": "plot_embedding",
           "numDimensions": 1536,
           "similarity": "dotProduct"
         },
         {
           "type": "vector",
           "path": "plot_embedding_voyage_4_large",
           "numDimensions": 2048,
           "similarity": "dotProduct"
         },
         {
           "type": "vector",
           "path": "title_embedding_voyage_4_large",
           "numDimensions": 2048,
           "similarity": "dotProduct"
         }
       ]
     }
   );
   ```

   The `multiple-vector-search` index definition indexes the following fields:

   - `plot_embedding_voyage_4_large` field, which contains vector embeddings generated by the `voyage-4-large` embedding model that represent the summary of a movie's plot. The index definition specifies `2048` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for all the use cases in this tutorial.

   - `title_embedding_voyage_4_large` field, which contains vector embeddings generated by the `voyage-4-large` embedding model that represent the title of the movie. The index definition specifies `2048` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for the [second use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   - `plot_embedding` field, which contains vector embeddings generated by the OpenAI `text-embedding-ada-002` embedding model that represent the summary of a movie's plot. The index definition specifies `1536` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for the [third use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   All three fields use the `vector` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector) and `dotProduct` [similarity.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

Before creating the index, complete the procedure to [generate the embeddings.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-generate-embeddings)

1. Initialize your Go module.

   ```sh
   mkdir go-vector-quickstart && cd go-vector-quickstart
   go mod init go-vector-quickstart
   ```

2. Add the Go Driver as a dependency in your project.

   ```sh
   go get go.mongodb.org/mongo-driver/v2/mongo
   ```

   For more detailed installation instructions, see the [MongoDB Go Driver documentation.](https://www.mongodb.com/docs/drivers/go/current/get-started.md#std-label-go-get-started)

3. Define the index.

   Create a file named `vector-index.go`. Copy and paste the following code into the file.

   ```go
   package main

   import (
   	"context"
   	"log"
   	"time"

   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	// Replace the placeholder with your connection string
   	const uri = "<connectionString>"

   	// Connect to your cluster
   	clientOptions := options.Client().ApplyURI(uri)
   	client, err := mongo.Connect(clientOptions)
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	// Set the namespace
   	coll := client.Database("sample_mflix").Collection("embedded_movies")

   	// Define the index details
   	type vectorDefinitionField struct {
   		Type          string `bson:"type"`
   		Path          string `bson:"path"`
   		NumDimensions int    `bson:"numDimensions"`
   		Similarity    string `bson:"similarity"`
   	}

   	type vectorDefinition struct {
   		Fields []vectorDefinitionField `bson:"fields"`
   	}

   	indexName := "multiple-vector-search"
   	opts := options.SearchIndexes().SetName(indexName).SetType("vectorSearch")

   	indexModel := mongo.SearchIndexModel{
   		Definition: vectorDefinition{
   			Fields: []vectorDefinitionField{
   				{
   					Type:          "vector",
   					Path:          "plot_embedding",
   					NumDimensions: 1536,
   					Similarity:    "dotProduct",
   				},
   				{
   					Type:          "vector",
   					Path:          "plot_embedding_voyage_4_large",
   					NumDimensions: 2048,
   					Similarity:    "dotProduct",
   				},
   				{
   					Type:          "vector",
   					Path:          "title_embedding_voyage_4_large",
   					NumDimensions: 2048,
   					Similarity:    "dotProduct",
   				},
   			},
   		},
   		Options: opts,
   	}

   	// Create the index
   	log.Println("Creating the index.")
   	searchIndexName, err := coll.SearchIndexes().CreateOne(ctx, indexModel)
   	if err != nil {
   		log.Fatalf("failed to create the search index: %v", err)
   	}

   	// Await the creation of the index.
   	log.Println("Polling to confirm successful index creation.")
   	log.Println("NOTE: This may take up to a minute.")
   	searchIndexes := coll.SearchIndexes()
   	var doc bson.Raw
   	for doc == nil {
   		cursor, err := searchIndexes.List(ctx, options.SearchIndexes().SetName(searchIndexName))
   		if err != nil {
   			log.Fatalf("failed to list search indexes: %v", err)
   		}

   		if !cursor.Next(ctx) {
   			break
   		}

   		name := cursor.Current.Lookup("name").StringValue()
   		queryable := cursor.Current.Lookup("queryable").Boolean()
   		if name == searchIndexName && queryable {
   			doc = cursor.Current
   		} else {
   			time.Sleep(5 * time.Second)
   		}
   	}

   	log.Println("Name of Index Created: " + searchIndexName)
   }
   ```

   The `multiple-vector-search` index definition indexes the following fields:

   - `plot_embedding_voyage_4_large` field, which contains vector embeddings generated by the `voyage-4-large` embedding model that represent the summary of a movie's plot. The index definition specifies `2048` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for all the use cases in this tutorial.

   - `title_embedding_voyage_4_large` field, which contains vector embeddings generated by the `voyage-4-large` embedding model that represent the title of the movie. The index definition specifies `2048` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for the [second use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   - `plot_embedding` field, which contains vector embeddings generated by the OpenAI `text-embedding-ada-002` embedding model that represent the summary of a movie's plot. The index definition specifies `1536` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for the [third use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   All three fields use the `vector` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector) and `dotProduct` [similarity.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

   This code also includes a polling mechanism to check if the index is ready to use.

4. Specify the `<connectionString>`.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

5. Create the index.

   ```shell
   go run vector-index.go
   ```

   **Output:**

   ```console
   2026/07/14 18:06:39 Creating the index.
   2026/07/14 18:06:41 Polling to confirm successful index creation.
   2026/07/14 18:06:41 NOTE: This may take up to a minute.
   2026/07/14 18:08:20 Name of Index Created: multiple-vector-search
   ```

Before creating the index, complete the procedure to [generate the embeddings.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-generate-embeddings)

1. Add the Java driver version 5.2 or higher as a dependency in your project.

   Select one of the following tabs, depending on your package manager:

   ### Maven

   If you are using Maven, add the following dependencies to the `dependencies` array in your project's `pom.xml` file:

   ```xml
   <dependencies>
      <!-- MongoDB Java Sync Driver v5.2.0 or later -->
      <dependency>
         <groupId>org.mongodb</groupId>
         <artifactId>mongodb-driver-sync</artifactId>
         <version>[5.2.0,)</version> </dependency> </dependencies> ``` 2. Run your package manager to install the dependencies to your project. For more detailed installation instructions and version compatibility, see the [MongoDB Java Driver documentation.](https://www.mongodb.com/docs/drivers/java/sync/current/quick-start/#std-label-add-mongodb-dependency)

3. Create a file named `VectorIndex.java`. Copy and paste the following code into the file.

   ```java
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.SearchIndexModel;
   import com.mongodb.client.model.SearchIndexType;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.Arrays;
   import java.util.Collections;
   import java.util.List;
   import java.util.concurrent.TimeUnit;
   import java.util.stream.StreamSupport;

   public class VectorIndex {

       public static void main(String[] args) {

           // Replace the placeholder with your connection string
           String uri = "<connectionString>";

           // Connect to your cluster
           try (MongoClient mongoClient = MongoClients.create(uri)) {

               // Set the namespace
               MongoDatabase database = mongoClient.getDatabase("sample_mflix");
               MongoCollection<Document> collection = database.getCollection("embedded_movies");

               // Define the index details
               String indexName = "multiple-vector-search";
               Bson definition = new Document(
                   "fields",
                   Arrays.asList(
                       new Document("type", "vector")
                           .append("path", "plot_embedding")
                           .append("numDimensions", 1536)
                           .append("similarity", "dotProduct"),
                       new Document("type", "vector")
                           .append("path", "plot_embedding_voyage_4_large")
                           .append("numDimensions", 2048)
                           .append("similarity", "dotProduct"),
                       new Document("type", "vector")
                           .append("path", "title_embedding_voyage_4_large")
                           .append("numDimensions", 2048)
                           .append("similarity", "dotProduct")));

               // Define the index model
               SearchIndexModel indexModel = new SearchIndexModel(
                   indexName,
                   definition,
                   SearchIndexType.vectorSearch()
               );

                // Create the index using the defined model
               List<String> result = collection.createSearchIndexes(Collections.singletonList(indexModel));
               System.out.println("Successfully created vector index named: " + result.get(0));
               System.out.println("Wait for the index to leave the BUILDING status and become queryable.");

               // Wait for index to build and become queryable
               System.out.println("Polling to confirm the index has left the BUILDING status.");
               // No special handling in case of a timeout. Custom handling can be implemented.           
               waitForIndex(collection, indexName);
           }
       }

       /**
        * Polls the collection to check whether the specified index is ready to query.
        */
       public static <T> boolean waitForIndex(final MongoCollection<T> collection, final String indexName) {
           long startTime = System.nanoTime();
           long timeoutNanos = TimeUnit.SECONDS.toNanos(60);
           while (System.nanoTime() - startTime < timeoutNanos) {
               Document indexRecord = StreamSupport.stream(collection.listSearchIndexes().spliterator(), false)
                       .filter(index -> indexName.equals(index.getString("name")))
                       .findAny().orElse(null);
               if (indexRecord != null) {
                   if ("FAILED".equals(indexRecord.getString("status"))) {
                       throw new RuntimeException("Search index has FAILED status.");
                   }
                   if (indexRecord.getBoolean("queryable")) {
                       System.out.println(indexName + " index is ready to query");
                       return true;
                   }
               }
               try {
                   Thread.sleep(100); // busy-wait, avoid in production
               } catch (InterruptedException e) {
                   Thread.currentThread().interrupt();
                   throw new RuntimeException(e);
               }
           }
           return false;
       }
   }
   ```

   The `multiple-vector-search` index definition indexes the following fields:

   - `plot_embedding_voyage_4_large` field, which contains vector embeddings generated by the `voyage-4-large` embedding model that represent the summary of a movie's plot. The index definition specifies `2048` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for all the use cases in this tutorial.

   - `title_embedding_voyage_4_large` field, which contains vector embeddings generated by the `voyage-4-large` embedding model that represent the title of the movie. The index definition specifies `2048` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for the [second use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   - `plot_embedding` field, which contains vector embeddings generated by the OpenAI `text-embedding-ada-002` embedding model that represent the summary of a movie's plot. The index definition specifies `1536` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for the [third use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   All three fields use the `vector` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector) and `dotProduct` [similarity.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

   This code also includes a polling mechanism to check if the index is ready to use.

4. Specify the `<connectionString>`.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

5. Run the file in your IDE, or execute a command from the command line to run the code.

   ```shell
   javac VectorIndex.java
   java VectorIndex
   ```

   **Output:**

   ```console
   New search index named multiple-vector-search is building.
   Polling to check if the index is ready. This may take up to a minute.
   multiple-vector-search is ready for querying.
   ```

Before creating the index, complete the procedure to [generate the embeddings.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-generate-embeddings)

1. Add the MongoDB Node Driver as a dependency in your project:

   ```sh
   npm install mongodb
   ```

   **Tip:**

   The examples on this page assume your project manages modules as CommonJS modules. If you're using ES modules, instead, you must modify the import syntax.

2. Define the index.

   Create a file named `vector-index.js`. Copy and paste the following code into the file.

   ```javascript
   const { MongoClient } = require("mongodb");
   const { setTimeout } = require("timers/promises");

   // Connect to your MongoDB cluster
   const uri = process.env.MONGODB_URI || "<CONNECTION-STRING>";

   const client = new MongoClient(uri);

   async function main() {
     try {
       const DB_NAME = "sample_mflix";
       const COLLECTION_NAME = "embedded_movies";
       const db = client.db(DB_NAME);
       const collection = db.collection(COLLECTION_NAME);

       // define your MongoDB Vector Search index
       const index = {
         name: "multiple-vector-search",
         type: "vectorSearch",
         definition: {
           fields: [
             {
               type: "vector",
               numDimensions: 1536,
               path: "plot_embedding",
               similarity: "dotProduct",
             },
             {
               type: "vector",
               numDimensions: 2048,
               path: "plot_embedding_voyage_4_large",
               similarity: "dotProduct",
             },
             {
               type: "vector",
               numDimensions: 2048,
               path: "title_embedding_voyage_4_large",
               similarity: "dotProduct",
             },
           ],
         },
       };

       // Run the helper method
       const result = await collection.createSearchIndex(index);
       console.log(`New search index named ${result} is building.`);

       // Wait for the index to be ready to query
       console.log("Polling to check if the index is ready. This may take up to a minute.");
       let isQueryable = false;

       // Use filtered search for index readiness
       while (!isQueryable) {
         const [indexData] = await collection.listSearchIndexes(index.name).toArray();

         if (indexData) {
           isQueryable = indexData.queryable;
           if (!isQueryable) {
             await setTimeout(5000); // Wait for 5 seconds before checking again
           }
         } else {
           // Handle the case where the index might not be found
           console.log(`Index ${index.name} not found.`);
           await setTimeout(5000); // Wait for 5 seconds before checking again
         }
       }

       console.log(`${result} is ready for querying.`);
     } catch (error) {
       console.error("Error:", error);
     } finally {
       await client.close();
     }
   }

   main().catch((err) => {
     console.error("Unhandled error:", err);
   });
   ```

   The `multiple-vector-search` index definition indexes the following fields:

   - `plot_embedding_voyage_4_large` field, which contains vector embeddings generated by the `voyage-4-large` embedding model that represent the summary of a movie's plot. The index definition specifies `2048` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for all the use cases in this tutorial.

   - `title_embedding_voyage_4_large` field, which contains vector embeddings generated by the `voyage-4-large` embedding model that represent the title of the movie. The index definition specifies `2048` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for the [second use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   - `plot_embedding` field, which contains vector embeddings generated by the OpenAI `text-embedding-ada-002` embedding model that represent the summary of a movie's plot. The index definition specifies `1536` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for the [third use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   All three fields use the `vector` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector) and `dotProduct` [similarity.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

   This code also includes a polling mechanism to check if the index is ready to use.

3. Specify the `<connectionString>`.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Create the index.

   ```shell
   node vector-index.js
   ```

   **Output:**

   ```console
   New search index named multiple-vector-search is building.
   Polling to check if the index is ready. This may take up to a minute.
   multiple-vector-search is ready for querying.
   ```

Before creating the index, complete the procedure to [generate the embeddings.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-generate-embeddings)

1. Add the PyMongo Driver as a dependency in your project:

   ```sh
   pip install pymongo
   ```

   For more detailed installation instructions, see the [MongoDB Python Driver documentation.](https://www.mongodb.com/docs/languages/python/pymongo-driver/get-started.md#std-label-pymongo-get-started-download-and-install)

2. Define the index.

   Create a file named `vector-index.py`. Copy and paste the following code into the file.

   ```python
   from pymongo.mongo_client import MongoClient
   from pymongo.operations import SearchIndexModel
   import time

   # Connect to your deployment
   uri = "<connectionString>"
   client = MongoClient(uri)

   # Access your database and collection
   database = client["sample_mflix"]
   collection = database["embedded_movies"]

   # Create your index model, then create the search index
   search_index_model = SearchIndexModel(
     definition={
       "fields": [
         {
           "type": "vector",
           "numDimensions": 1536,
           "path": "plot_embedding",
           "similarity": "dotProduct"
         },
         {
           "type": "vector",
           "numDimensions": 2048,
           "path": "plot_embedding_voyage_4_large",
           "similarity": "dotProduct"
         },
         {
           "type": "vector",
           "numDimensions": 2048,
           "path": "title_embedding_voyage_4_large",
           "similarity": "dotProduct"
         }
       ]
     },
     name="multiple-vector-search",
     type="vectorSearch"
   )

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

   The `multiple-vector-search` index definition indexes the following fields:

   - `plot_embedding_voyage_4_large` field, which contains vector embeddings generated by the `voyage-4-large` embedding model that represent the summary of a movie's plot. The index definition specifies `2048` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for all the use cases in this tutorial.

   - `title_embedding_voyage_4_large` field, which contains vector embeddings generated by the `voyage-4-large` embedding model that represent the title of the movie. The index definition specifies `2048` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for the [second use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   - `plot_embedding` field, which contains vector embeddings generated by the OpenAI `text-embedding-ada-002` embedding model that represent the summary of a movie's plot. The index definition specifies `1536` [vector dimensions.](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector)

     This field mapping is required for the [third use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   All three fields use the `vector` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector) and `dotProduct` [similarity.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

   This code also includes a polling mechanism to check if the index is ready to use.

3. Specify the `<connectionString>`.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Create the index.

   ```shell
   python vector-index.py
   ```

   **Output:**

   ```console
   New search index named multiple-vector-search is building.
   Polling to check if the index is ready. This may take up to a minute.
   multiple-vector-search is ready for querying.
   ```

1) Connect to your cluster using MongoDB Compass.

   To learn more, see [Connect to a Cluster via Compass.](https://www.mongodb.com/docs/atlas/compass-connection.md#std-label-atlas-connect-via-compass)

2) Specify the database and collection.

   On the Database screen, expand the name of the database, `sample_mflix`, then click the name of the collection, `embedded_movies`.

3) Create the MongoDB Vector Search indexes.

   Click the Indexes tab, then select Search Indexes.

   Click Create, then select Search Index from the dropdown.

   Enter `multiple-auto-embed-search` as the name of the index.

   Select Vector Search to define the MongoDB Vector Search index.

   ```json
   {
     "fields": [
       {
         "type": "autoEmbed",
         "modality": "text",
         "path": "fullplot",
         "model": "voyage-4",
         "numDimensions": 2048
       },
       {
         "type": "autoEmbed",
         "modality": "text",
         "path": "title",
         "model": "voyage-4",
         "numDimensions": 2048
       }
     ]
   }
   ```

   The `multiple-auto-embed-search` index definition indexes the following fields:

   - `fullplot` field, which contains the full plot of a movie.

     This field mapping is required for all the use cases in this tutorial.

   - `title` field, which contains the title of a movie.

     This field mapping is required for the [second use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   Both fields use the `autoEmbed` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-auto-embed). MongoDB Vector Search automatically generates `2048`-dimensional embeddings for these fields by using the `voyage-4` embedding model.

   Click Create, then select Search Index from the dropdown.

   Enter `multiple-models-search` as the name of the index.

   Select Vector Search to define the MongoDB Vector Search index.

   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "plot_embedding",
         "numDimensions": 1536,
         "similarity": "dotProduct"
       }
     ]
   }
   ```

   The `multiple-models-search` index definition indexes the following field:

   - `plot_embedding` field, which contains pre-computed embeddings that represent a movie's plot summary generated by the OpenAI `text-embedding-ada-002` embedding model.

     This field mapping is required for the [third use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   This field uses the `vector` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector) and `dotProduct` [similarity](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions). The `1536`-dimensional embeddings are generated by the OpenAI `ada-v2` embedding model.

   Click Create Search Index.

1. Connect to the cluster using [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh).

   Open [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) in a terminal window and connect to your Atlas cluster. For detailed instructions on connecting, see [Connect via mongosh.](https://www.mongodb.com/docs/atlas/mongo-shell-connection.md#std-label-connect-mongo-shell)

2. Switch to the database that contains the collection for which you want to create the index.

   ```shell
   use sample_mflix
   ```

   **Output:**

   ```shell
   switched to db sample_mflix
   ```

3. Run the `db.collection.createSearchIndex()`.

   To create the `autoEmbed` type index, run the following `db.collection.createSearchIndex()` method:

   ```shell
   db.embedded_movies.createSearchIndex(
     "multiple-auto-embed-search",
     "vectorSearch",
     {
       "fields": [
         {
           "type": "autoEmbed",
           "modality": "text",
           "path": "fullplot",
           "model": "voyage-4",
           "numDimensions": 2048
         },
         {
           "type": "autoEmbed",
           "modality": "text",
           "path": "title",
           "model": "voyage-4",
           "numDimensions": 2048
         }
       ]
     }
   );
   ```

   The `multiple-auto-embed-search` index definition indexes the following fields:

   - `fullplot` field, which contains the full plot of a movie.

     This field mapping is required for all the use cases in this tutorial.

   - `title` field, which contains the title of a movie.

     This field mapping is required for the [second use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   Both fields use the `autoEmbed` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-auto-embed). MongoDB Vector Search automatically generates `2048`-dimensional embeddings for these fields by using the `voyage-4` embedding model.

   To create the `vector` type index, run the following `db.collection.createSearchIndex()` method:

   ```shell
   db.embedded_movies.createSearchIndex(
     "multiple-models-search",
     "vectorSearch",
     {
       "fields": [
         {
           "type": "vector",
           "path": "plot_embedding",
           "numDimensions": 1536,
           "similarity": "dotProduct"
         }
       ]
     }
   );
   ```

   The `multiple-models-search` index definition indexes the following field:

   - `plot_embedding` field, which contains pre-computed embeddings that represent a movie's plot summary generated by the OpenAI `text-embedding-ada-002` embedding model.

     This field mapping is required for the [third use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   This field uses the `vector` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector) and `dotProduct` [similarity](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions). The `1536`-dimensional embeddings are generated by the OpenAI `ada-v2` embedding model.

1) Initialize your Go module.

   ```sh
   mkdir go-vector-quickstart && cd go-vector-quickstart
   go mod init go-vector-quickstart
   ```

2) Add the Go Driver as a dependency in your project.

   ```sh
   go get go.mongodb.org/mongo-driver/v2/mongo
   ```

   For more detailed installation instructions, see the [MongoDB Go Driver documentation.](https://www.mongodb.com/docs/drivers/go/current/get-started.md#std-label-go-get-started)

3) Define the indexes.

   Create a file named `create-index.go`.

   Copy and paste the following code into the `create-index.go` file.

   ```go
   package main

   import (
   	"context"
   	"log"
   	"time"

   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	// Replace the placeholder with your connection string
   	const uri = "<connectionString>"

   	// Connect to your cluster
   	clientOptions := options.Client().ApplyURI(uri)
   	client, err := mongo.Connect(clientOptions)
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	// Set the namespace
   	coll := client.Database("sample_mflix").Collection("embedded_movies")

   	// Define the index details
   	type autoEmbedField struct {
   		Type          string `bson:"type"`
   		Modality      string `bson:"modality"`
   		Path          string `bson:"path"`
   		Model         string `bson:"model"`
   		NumDimensions int    `bson:"numDimensions"`
   	}

   	type vectorField struct {
   		Type          string `bson:"type"`
   		Path          string `bson:"path"`
   		NumDimensions int    `bson:"numDimensions"`
   		Similarity    string `bson:"similarity"`
   	}

   	type vectorDefinition struct {
   		Fields []any `bson:"fields"`
   	}

   	// Define the auto-embed index model
   	autoEmbedName := "multiple-auto-embed-search"
   	autoEmbedOpts := options.SearchIndexes().SetName(autoEmbedName).SetType("vectorSearch")
   	autoEmbedIndexModel := mongo.SearchIndexModel{
   		Definition: vectorDefinition{
   			Fields: []any{
   				autoEmbedField{
   					Type:          "autoEmbed",
   					Modality:      "text",
   					Path:          "fullplot",
   					Model:         "voyage-4",
   					NumDimensions: 2048,
   				},
   				autoEmbedField{
   					Type:          "autoEmbed",
   					Modality:      "text",
   					Path:          "title",
   					Model:         "voyage-4",
   					NumDimensions: 2048,
   				},
   			},
   		},
   		Options: autoEmbedOpts,
   	}

   	// Define the vector index model
   	vectorName := "multiple-models-search"
   	vectorOpts := options.SearchIndexes().SetName(vectorName).SetType("vectorSearch")
   	vectorIndexModel := mongo.SearchIndexModel{
   		Definition: vectorDefinition{
   			Fields: []any{
   				vectorField{
   					Type:          "vector",
   					Path:          "plot_embedding",
   					NumDimensions: 1536,
   					Similarity:    "dotProduct",
   				},
   			},
   		},
   		Options: vectorOpts,
   	}

   	// Create the indexes
   	log.Println("Creating the indexes.")
   	searchIndexes := coll.SearchIndexes()
   	autoEmbedResult, err := searchIndexes.CreateOne(ctx, autoEmbedIndexModel)
   	if err != nil {
   		log.Fatalf("failed to create the search index: %v", err)
   	}

   	vectorResult, err := searchIndexes.CreateOne(ctx, vectorIndexModel)
   	if err != nil {
   		log.Fatalf("failed to create the search index: %v", err)
   	}

   	// Await the creation of the indexes.
   	log.Println("Polling to confirm successful index creation.")
   	log.Println("NOTE: This may take up to a minute.")
   	for _, searchIndexName := range []string{autoEmbedResult, vectorResult} {
   		var doc bson.Raw
   		for doc == nil {
   			cursor, err := searchIndexes.List(ctx, options.SearchIndexes().SetName(searchIndexName))
   			if err != nil {
   				log.Fatalf("failed to list search indexes: %v", err)
   			}

   			if !cursor.Next(ctx) {
   				break
   			}

   			name := cursor.Current.Lookup("name").StringValue()
   			queryable := cursor.Current.Lookup("queryable").Boolean()
   			if name == searchIndexName && queryable {
   				doc = cursor.Current
   			} else {
   				time.Sleep(5 * time.Second)
   			}
   		}

   		log.Println("Name of Index Created: " + searchIndexName)
   	}
   }

   ```

   The `multiple-auto-embed-search` index definition indexes the following fields:

   - `fullplot` field, which contains the full plot of a movie.

     This field mapping is required for all the use cases in this tutorial.

   - `title` field, which contains the title of a movie.

     This field mapping is required for the [second use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   Both fields use the `autoEmbed` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-auto-embed). MongoDB Vector Search automatically generates `2048`-dimensional embeddings for these fields by using the `voyage-4` embedding model.

   The `multiple-models-search` index definition indexes the following field:

   - `plot_embedding` field, which contains pre-computed embeddings that represent a movie's plot summary generated by the OpenAI `text-embedding-ada-002` embedding model.

     This field mapping is required for the [third use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   This field uses the `vector` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector) and `dotProduct` [similarity](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions). The `1536`-dimensional embeddings are generated by the OpenAI `ada-v2` embedding model.

4) Specify the `<connectionString>`.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

5) Create the indexes.

   ```shell
   go run create-index.go
   ```

   **Output:**

   ```console
   Creating the indexes.
   Polling to confirm successful index creation.
   NOTE: This may take up to a minute.
   Name of Index Created: multiple-auto-embed-search
   Name of Index Created: multiple-models-search
   ```

1. Add the Java driver version 5.2 or higher as a dependency in your project.

   Select one of the following tabs, depending on your package manager:

   ### Maven

   If you are using Maven, add the following dependencies to the `dependencies` array in your project's `pom.xml` file:

   ```xml
   <dependencies>
      <!-- MongoDB Java Sync Driver v5.2.0 or later -->
      <dependency>
         <groupId>org.mongodb</groupId>
         <artifactId>mongodb-driver-sync</artifactId>
         <version>[5.2.0,)</version> </dependency> </dependencies> ``` 2. Run your package manager to install the dependencies to your project. For more detailed installation instructions and version compatibility, see the [MongoDB Java Driver documentation.](https://www.mongodb.com/docs/drivers/java/sync/current/quick-start/#std-label-add-mongodb-dependency)

3. Define the indexes.

   Create a file named `CreateIndexes.java`.

   Copy and paste the following code into the `CreateIndexes.java` file.

   ```java
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.SearchIndexModel;
   import com.mongodb.client.model.SearchIndexType;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.Arrays;
   import java.util.List;
   import java.util.concurrent.TimeUnit;
   import java.util.stream.StreamSupport;

   public class CreateIndexes {

       public static void main(String[] args) {

           // Replace the placeholder with your connection string
           String uri = "<connectionString>";

           // Connect to your cluster
           try (MongoClient mongoClient = MongoClients.create(uri)) {

               // Set the namespace
               MongoDatabase database = mongoClient.getDatabase("sample_mflix");
               MongoCollection<Document> collection = database.getCollection("embedded_movies");

               // Define the auto-embed index details
               String autoEmbedIndexName = "multiple-auto-embed-search";
               Bson autoEmbedDefinition = new Document(
                   "fields",
                   Arrays.asList(
                       new Document("type", "autoEmbed")
                           .append("modality", "text")
                           .append("path", "fullplot")
                           .append("model", "voyage-4")
                           .append("numDimensions", 2048),
                       new Document("type", "autoEmbed")
                           .append("modality", "text")
                           .append("path", "title")
                           .append("model", "voyage-4")
                           .append("numDimensions", 2048)));

               // Define the vector index details
               String vectorIndexName = "multiple-models-search";
               Bson vectorDefinition = new Document(
                   "fields",
                   Arrays.asList(
                       new Document("type", "vector")
                           .append("path", "plot_embedding")
                           .append("numDimensions", 1536)
                           .append("similarity", "dotProduct")));

               // Define the index models
               List<SearchIndexModel> indexModels = Arrays.asList(
                   new SearchIndexModel(autoEmbedIndexName, autoEmbedDefinition, SearchIndexType.vectorSearch()),
                   new SearchIndexModel(vectorIndexName, vectorDefinition, SearchIndexType.vectorSearch()));

               // Create the indexes using the defined models
               List<String> result = collection.createSearchIndexes(indexModels);
               for (String indexName : result) {
                   System.out.println("Successfully created vector index named: " + indexName);
               }
               System.out.println("Wait for the indexes to leave the BUILDING status and become queryable.");

               // Wait for indexes to build and become queryable
               System.out.println("Polling to confirm the indexes have left the BUILDING status.");
               // No special handling in case of a timeout. Custom handling can be implemented.
               for (String indexName : result) {
                   waitForIndex(collection, indexName);
               }
           }
       }

       /**
        * Polls the collection to check whether the specified index is ready to query.
        */
       public static <T> boolean waitForIndex(final MongoCollection<T> collection, final String indexName) {
           long startTime = System.nanoTime();
           long timeoutNanos = TimeUnit.SECONDS.toNanos(60);
           while (System.nanoTime() - startTime < timeoutNanos) {
               Document indexRecord = StreamSupport.stream(collection.listSearchIndexes().spliterator(), false)
                       .filter(index -> indexName.equals(index.getString("name")))
                       .findAny().orElse(null);
               if (indexRecord != null) {
                   if ("FAILED".equals(indexRecord.getString("status"))) {
                       throw new RuntimeException("Search index has FAILED status.");
                   }
                   if (indexRecord.getBoolean("queryable")) {
                       System.out.println(indexName + " index is ready to query");
                       return true;
                   }
               }
               try {
                   Thread.sleep(100); // busy-wait, avoid in production
               } catch (InterruptedException e) {
                   Thread.currentThread().interrupt();
                   throw new RuntimeException(e);
               }
           }
           return false;
       }
   }

   ```

   The `multiple-auto-embed-search` index definition indexes the following fields:

   - `fullplot` field, which contains the full plot of a movie.

     This field mapping is required for all the use cases in this tutorial.

   - `title` field, which contains the title of a movie.

     This field mapping is required for the [second use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   Both fields use the `autoEmbed` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-auto-embed). MongoDB Vector Search automatically generates `2048`-dimensional embeddings for these fields by using the `voyage-4` embedding model.

   The `multiple-models-search` index definition indexes the following field:

   - `plot_embedding` field, which contains pre-computed embeddings that represent a movie's plot summary generated by the OpenAI `text-embedding-ada-002` embedding model.

     This field mapping is required for the [third use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   This field uses the `vector` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector) and `dotProduct` [similarity](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions). The `1536`-dimensional embeddings are generated by the OpenAI `ada-v2` embedding model.

4. Specify the `<connectionString>`.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

5. Run the file in your IDE, or execute a command from the command line to run the code.

   ```shell
   javac CreateIndexes.java
   java CreateIndexes
   ```

   **Output:**

   ```console
   Successfully created vector index named: multiple-auto-embed-search
   Successfully created vector index named: multiple-models-search
   Wait for the indexes to leave the BUILDING status and become queryable.
   Polling to confirm the indexes have left the BUILDING status.
   multiple-auto-embed-search index is ready to query
   multiple-models-search index is ready to query
   ```

1) Add the MongoDB Node Driver as a dependency in your project:

   ```sh
   npm install mongodb
   ```

   **Tip:**

   The examples on this page assume your project manages modules as CommonJS modules. If you're using ES modules, instead, you must modify the import syntax.

2) Define the indexes.

   Create a file named `create-index.js`.

   Copy and paste the following code into the `create-index.js` file.

   ```javascript
   const { MongoClient } = require("mongodb");
   const { setTimeout } = require("timers/promises");

   // Connect to your MongoDB cluster
   const uri = process.env.MONGODB_URI || "<CONNECTION-STRING>";

   const client = new MongoClient(uri);

   async function main() {
     try {
       const DB_NAME = "sample_mflix";
       const COLLECTION_NAME = "embedded_movies";
       const db = client.db(DB_NAME);
       const collection = db.collection(COLLECTION_NAME);

       // define your MongoDB Vector Search indexes
       const autoEmbedIndex = {
         name: "multiple-auto-embed-search",
         type: "vectorSearch",
         definition: {
           fields: [
             {
               type: "autoEmbed",
               modality: "text",
               path: "fullplot",
               model: "voyage-4",
               numDimensions: 2048,
             },
             {
               type: "autoEmbed",
               modality: "text",
               path: "title",
               model: "voyage-4",
               numDimensions: 2048,
             },
           ],
         },
       };

       const vectorIndex = {
         name: "multiple-models-search",
         type: "vectorSearch",
         definition: {
           fields: [
             {
               type: "vector",
               numDimensions: 1536,
               path: "plot_embedding",
               similarity: "dotProduct",
             },
           ],
         },
       };

       // Run the helper method to create both indexes
       const autoEmbedResult = await collection.createSearchIndex(autoEmbedIndex);
       console.log(`New search index named ${autoEmbedResult} is building.`);

       const vectorResult = await collection.createSearchIndex(vectorIndex);
       console.log(`New search index named ${vectorResult} is building.`);

       // Wait for the indexes to be ready to query
       console.log("Polling to check if the indexes are ready. This may take up to a minute.");

       // Use filtered search for index readiness
       for (const indexName of [autoEmbedResult, vectorResult]) {
         let isQueryable = false;

         while (!isQueryable) {
           const [indexData] = await collection.listSearchIndexes(indexName).toArray();

           if (indexData) {
             isQueryable = indexData.queryable;
             if (!isQueryable) {
               await setTimeout(5000); // Wait for 5 seconds before checking again
             }
           } else {
             // Handle the case where the index might not be found
             console.log(`Index ${indexName} not found.`);
             await setTimeout(5000); // Wait for 5 seconds before checking again
           }
         }

         console.log(`${indexName} is ready for querying.`);
       }
     } catch (error) {
       console.error("Error:", error);
     } finally {
       await client.close();
     }
   }

   main().catch((err) => {
     console.error("Unhandled error:", err);
   });

   ```

   The `multiple-auto-embed-search` index definition indexes the following fields:

   - `fullplot` field, which contains the full plot of a movie.

     This field mapping is required for all the use cases in this tutorial.

   - `title` field, which contains the title of a movie.

     This field mapping is required for the [second use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   Both fields use the `autoEmbed` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-auto-embed). MongoDB Vector Search automatically generates `2048`-dimensional embeddings for these fields by using the `voyage-4` embedding model.

   The `multiple-models-search` index definition indexes the following field:

   - `plot_embedding` field, which contains pre-computed embeddings that represent a movie's plot summary generated by the OpenAI `text-embedding-ada-002` embedding model.

     This field mapping is required for the [third use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   This field uses the `vector` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector) and `dotProduct` [similarity](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions). The `1536`-dimensional embeddings are generated by the OpenAI `ada-v2` embedding model.

3) Specify the `<connectionString>`.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4) Create the indexes.

   ```shell
   node create-index.js
   ```

   **Output:**

   ```console
   New search index named multiple-auto-embed-search is building.
   New search index named multiple-models-search is building.
   Polling to check if the indexes are ready. This may take up to a minute.
   multiple-auto-embed-search is ready for querying.
   multiple-models-search is ready for querying.
   ```

1. Add the PyMongo Driver as a dependency in your project:

   ```sh
   pip install pymongo
   ```

   For more detailed installation instructions, see the [MongoDB Python Driver documentation.](https://www.mongodb.com/docs/languages/python/pymongo-driver/get-started.md#std-label-pymongo-get-started-download-and-install)

2. Define the indexes.

   Create files named `auto-embed-index.py`.

   Copy and paste the following code into the `auto-embed-index.py` file.

   ```python
   from pymongo.mongo_client import MongoClient
   from pymongo.operations import SearchIndexModel
   import time

   # Connect to your deployment
   uri = "<connectionString>"
   client = MongoClient(uri)

   # Access your database and collection
   database = client["sample_mflix"]
   collection = database["embedded_movies"]

   # Create your index model, then create the search index
   search_index_model_auto_embed = SearchIndexModel(
     definition={
       "fields": [
         {
           "type": "autoEmbed",
           "modality": "text",
           "path": "fullplot",
           "model": "voyage-4",
           "numDimensions": 2048
         },
         {
           "type": "autoEmbed",
           "modality": "text",
           "path": "title",
           "model": "voyage-4",
           "numDimensions": 2048
         },
       ]
     },
     name="multiple-auto-embed-search",
     type="vectorSearch"
   )

   search_index_model_vector = SearchIndexModel(
     definition={
       "fields": [
         {
           "type": "vector",
           "numDimensions": 1536,
           "path": "plot_embedding",
           "similarity": "dotProduct"
         }
       ]
     },
     name="multiple-models-search",
     type="vectorSearch"
   )

   result_auto_embed = collection.create_search_index(model=search_index_model_auto_embed)
   print("New search index named " + result_auto_embed + " is building.")

   result_vector = collection.create_search_index(model=search_index_model_vector)
   print("New search index named " + result_vector + " is building.")

   # Wait for initial sync to complete
   print("Polling to check if the index is ready. This may take up to a minute.")
   predicate=None
   if predicate is None:
     predicate = lambda index: index.get("queryable") is True

   while True:
     indices = list(collection.list_search_indexes(result_vector))
     if len(indices) and predicate(indices[0]):
       break
     time.sleep(5)
   print(result_auto_embed + " is ready for querying.")
   print(result_vector + " is ready for querying.")

   client.close()
   ```

   The `multiple-auto-embed-search` index definition indexes the following fields:

   - `fullplot` field, which contains the full plot of a movie.

     This field mapping is required for all the use cases in this tutorial.

   - `title` field, which contains the title of a movie.

     This field mapping is required for the [second use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   Both fields use the `autoEmbed` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-auto-embed). MongoDB Vector Search automatically generates `2048`-dimensional embeddings for these fields by using the `voyage-4` embedding model.

   The `multiple-models-search` index definition indexes the following field:

   - `plot_embedding` field, which contains pre-computed embeddings that represent a movie's plot summary generated by the OpenAI `text-embedding-ada-002` embedding model.

     This field mapping is required for the [third use case.](https://www.mongodb.com/docs/vector-search/hybrid-search/vector-search-with-rankfusion.md#std-label-avs-unionwith-use-cases)

   This field uses the `vector` [type](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector) and `dotProduct` [similarity](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions). The `1536`-dimensional embeddings are generated by the OpenAI `ada-v2` embedding model.

3. Specify the `<connectionString>`.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Create the indexes.

   Create the indexes.

   ```shell
   python auto-embed-index.py
   ```

   **Output:**

   ```console
   New search index named multiple-auto-embed-search is building.
   New search index named multiple-models-search is building.
   Polling to check if the index is ready. This may take up to a minute.
   multiple-auto-embed-search is ready for querying.
   multiple-models-search is ready for querying.
   ```

### Run the MongoDB Vector Search Queries

In this section, you query the `embedded_movies` collection in the `sample_mflix` database by using the index named `multiple-vector-search` that you created on the collection.

1. Navigate to the collection in MongoDB Compass.

   On the Database screen, click the `sample_airbnb` database, then click the `listingsAndReviews` collection.

2. Run the query.

   To run this query in MongoDB Compass:

   Click the Aggregations tab.

   Click \</> Text to switch to JSON (Javascript Object Notation) view.

   Copy and paste to run the following queries:

   ### Similar Terms, Same Field

   Perform a comprehensive search of the dataset for semantically similar terms to determine which query term returns the best results.

   ```javascript
   [
     {
       "$rankFusion": {
         "input": {
           "pipelines": {
             "vectorPipeline1": [
               {
                 "$vectorSearch": {
                   "index": "multiple-vector-search",
                   "path": "plot_embedding_voyage_4_large",
                   "queryVector": [-0.012623000890016556,-0.03503970801830292,0.0017070976318791509, /* ...embedding floats truncated by snapshot... */ 0.029163483530282974],
                   "numCandidates": 2000,
                   "limit": 50
                 }
               }
             ],
             "vectorPipeline2": [
               {
                 "$vectorSearch": {
                   "index": "multiple-vector-search",
                   "path": "plot_embedding_voyage_4_large",
                   "queryVector": [-0.016024498268961906,-0.01714012771844864,-0.013083292171359062, /* ...embedding floats truncated by snapshot... */ 0.023529643192887306],
                   "numCandidates": 2000,
                   "limit": 50
                 }
               }
             ]
           }
         },
         "combination": {
           "weights": {
             "vectorPipeline1": 0.5,
             "vectorPipeline2": 0.5
           }
         },
         "scoreDetails": true
       }
     },
     {
       "$project": {
         "_id": 1,
         "title": 1,
         "plot": 1,
         "scoreDetails": {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 20
     }
   ]
   ```

   **Output:**

   ```javascript
   {
     "_id": {
       "$oid": "573a139af29313caabcef0a4"
     },
     "plot": "A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.",
     "title": "Casper",
     "scoreDetails": {
       "value": 0.01639344262295082,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 1,
           "weight": 0.5,
           "value": 0.7525938749313354,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 1,
           "weight": 0.5,
           "value": 0.7365995645523071,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1398f29313caabce912c"
     },
     "plot": "Three unemployed parapsychology professors set up shop as a unique ghost removal service.",
     "title": "Ghostbusters",
     "scoreDetails": {
       "value": 0.015749007936507936,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 4,
           "weight": 0.5,
           "value": 0.7139781713485718,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 3,
           "weight": 0.5,
           "value": 0.7172677516937256,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1398f29313caabceace9"
     },
     "plot": "A couple of recently deceased ghosts contract the services of a \"bio-exorcist\" in order to remove the obnoxious new owners of their house.",
     "title": "Beetlejuice",
     "scoreDetails": {
       "value": 0.015310892940626462,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 2,
           "weight": 0.5,
           "value": 0.7252534627914429,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 9,
           "weight": 0.5,
           "value": 0.7039943933486938,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1398f29313caabce9a71"
     },
     "plot": "Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...",
     "title": "The Peanut Butter Solution",
     "scoreDetails": {
       "value": 0.014928698752228164,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 8,
           "weight": 0.5,
           "value": 0.7015966176986694,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 6,
           "weight": 0.5,
           "value": 0.7112280130386353,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13b3f29313caabd3e8a1"
     },
     "plot": "A folk tale - supernatural love story about a ghost who falls in love with a newlywed woman.",
     "title": "Paheli",
     "scoreDetails": {
       "value": 0.014835164835164835,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 5,
           "weight": 0.5,
           "value": 0.7116085290908813,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 10,
           "weight": 0.5,
           "value": 0.7006677389144897,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13d3f29313caabd96a55"
     },
     "plot": "A teacher with paranormal abilities helps a group of ghosts graduate high school.",
     "title": "Ghost Graduation",
     "scoreDetails": {
       "value": 0.014242424242424244,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 6,
           "weight": 0.5,
           "value": 0.7095351219177246,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 15,
           "weight": 0.5,
           "value": 0.6966710090637207,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1398f29313caabceaf10"
     },
     "plot": "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...",
     "title": "High Spirits",
     "scoreDetails": {
       "value": 0.013575490735644836,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 9,
           "weight": 0.5,
           "value": 0.6990464925765991,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 19,
           "weight": 0.5,
           "value": 0.6928690671920776,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13b5f29313caabd41f29"
     },
     "plot": "14-year-old Lulu moves to a small provincial town with her mother and younger brother. One night, her brother is struck by a beam of white light - actually the spirit of Herman Hartmann ...",
     "title": "Island of Lost Souls",
     "scoreDetails": {
       "value": 0.013428262436914203,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 16,
           "weight": 0.5,
           "value": 0.6884604692459106,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 13,
           "weight": 0.5,
           "value": 0.6971145868301392,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1399f29313caabced85b"
     },
     "plot": "A comical Gothic horror-movie-type family tries to rescue their beloved uncle from his gold-digging new love.",
     "title": "Addams Family Values",
     "scoreDetails": {
       "value": 0.01324561403508772,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 15,
           "weight": 0.5,
           "value": 0.6893779039382935,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 16,
           "weight": 0.5,
           "value": 0.6955952048301697,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13bdf29313caabd5a0d9"
     },
     "plot": "A haunting ghost story spanning two worlds, two centuries apart. When 13 year old Tolly finds he can mysteriously travel between the two, he begins an adventure that unlocks family secrets laid buried for generations.",
     "title": "From Time to Time",
     "scoreDetails": {
       "value": 0.013139814496736516,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 11,
           "weight": 0.5,
           "value": 0.6945879459381104,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 22,
           "weight": 0.5,
           "value": 0.689332902431488,
           "details": []
         }
       ]
     }
   }

   ```

In this section, you query the `embedded_movies` collection in the `sample_mflix` database by using the index named `multiple-vector-search` that you created on the collection.

1. Create a file for the embeddings to use in the query.

   Create a file named `embeddings.js`.

   ```shell
   touch embeddings.js
   ```

   Copy and paste the following embeddings into the `embeddings.js` file.

   This file contains embeddings for the query terms used in the queries. The following table shows the query term, the variable that contains the embeddings for the query term, the embedding model used to generate the embeddings, and the number of dimensions.

   | Query Phrase | Variable | Embedding Model | Dimensions |
   | --- | --- | --- | --- |
   | light-hearted comedy with ghosts | COMEDY_INVOLVING_GHOSTS | Voyage AI's `voyage-4-large` | 2048 |
   | slapstick humor with paranormal events | HUMOR_INVOLVING_PARANORMAL | Voyage AI's `voyage-4-large` | 2048 |
   | battle between good and evil | BATTLE_GOOD_EVIL | Voyage AI's `voyage-4-large` | 2048 |
   | journey across lands | JOURNEY_ACROSS_LANDS_VOYAGEAI | Voyage AI's `voyage-4-large` | 2048 |
   | journey across lands | JOURNEY_ACROSS_LANDS_OPENAI | OpenAI's `text-embedding-ada-002` | 1536 |

   ```javascript
   COMEDY_INVOLVING_GHOSTS=[-0.012623000890016556, -0.03503970801830292, 0.0017070976318791509,  /* ...embedding floats truncated by snapshot... */ 0.029163483530282974];
   HUMOR_INVOLVING_PARANORMAL=[-0.016024498268961906, -0.01714012771844864, -0.013083292171359062,  /* ...embedding floats truncated by snapshot... */ 0.023529643192887306];
   BATTLE_GOOD_EVIL=[0.009724339470267296, 0.045186154544353485, -0.003959611523896456,  /* ...embedding floats truncated by snapshot... */ 0.006434368435293436];
   JOURNEY_ACROSS_LANDS_OPENAI=[-0.00034048742963932455, -0.03168917074799538, 0.008861231617629528,  /* ...embedding floats truncated by snapshot... */ -0.010582618415355682];
   JOURNEY_ACROSS_LANDS_VOYAGEAI=[0.0026338454335927963, 0.0243317149579525, 0.010786224156618118,  /* ...embedding floats truncated by snapshot... */ -0.00743120675906539];
   ```

   Save and close the file.

2. Connect to your cluster in [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh).

   Open [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) in a terminal window and connect to your cluster. For detailed instructions on connecting, see [Connect via mongosh.](https://www.mongodb.com/docs/atlas/mongo-shell-connection.md#std-label-connect-mongo-shell)

3. Use the `sample_mflix` database.

   Run the following command in the [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) prompt:

   ```javascript
   use sample_mflix
   ```

4. Load the embeddings to use in the query.

   Run the following command to load the embeddings in the `embeddings.js` file after replacing `<path-to-file>` with the absolute path to your `embeddings.js` file.

   ```javascript
   load('/<path-to-file>/embeddings.js';
   ```

   **Output:**

   ```javascript
   true
   ```

   Verify that the embeddings loaded successfully.

   You can verify by running a command similar to the following:

   ```javascript
   COMEDY_INVOLVING_GHOSTS.length
   ```

   **Output:**

   ```javascript
   2048
   ```

5. Run the MongoDB Vector Search queries against the `embedded_movies` collection.

   ### Similar Terms, Same Field

   Perform a comprehensive search of the dataset for semantically similar terms to determine which query term returns the best results.

   ```shell
   db.embedded_movies.aggregate([
     {
       $rankFusion: {
         input: {
           pipelines: {
             vectorPipeline1: [
               {
                 "$vectorSearch": {
                   "index": "multiple-vector-search",
                   "path": "plot_embedding_voyage_4_large",
                   "queryVector": COMEDY_INVOLVING_GHOSTS,
                   "numCandidates": 2000,
                   "limit": 50
                 }
               }
             ],
             vectorPipeline2: [
               {
                 "$vectorSearch": {
                   "index": "multiple-vector-search",
                   "path": "plot_embedding_voyage_4_large",
                   "queryVector": HUMOR_INVOLVING_PARANORMAL,
                   "numCandidates": 2000,
                   "limit": 50
                 }
               }
             ]
           }
         },
         combination: {
           weights: {
             vectorPipeline1: 0.5,
             vectorPipeline2: 0.5
           }
         },
         "scoreDetails": true
       }
     },
     {
       "$project": {
         _id: 1,
         title: 1,
         plot: 1,
         scoreDetails: {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 20
     }
   ]);
   ```

   **Output:**

   ```javascript
   [
     {
       _id: ObjectId('573a139af29313caabcef0a4'),
       plot: 'A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.',
       title: 'Casper',
       scoreDetails: {
         value: 0.01639344262295082,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 1,
             weight: 0.5,
             value: 0.7525938749313354,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 1,
             weight: 0.5,
             value: 0.7365995645523071,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabce912c'),
       plot: 'Three unemployed parapsychology professors set up shop as a unique ghost removal service.',
       title: 'Ghostbusters',
       scoreDetails: {
         value: 0.015749007936507936,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 4,
             weight: 0.5,
             value: 0.7139781713485718,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 3,
             weight: 0.5,
             value: 0.7172677516937256,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabceace9'),
       plot: 'A couple of recently deceased ghosts contract the services of a "bio-exorcist" in order to remove the obnoxious new owners of their house.',
       title: 'Beetlejuice',
       scoreDetails: {
         value: 0.015310892940626462,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 2,
             weight: 0.5,
             value: 0.7252534627914429,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 9,
             weight: 0.5,
             value: 0.7039943933486938,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabce9a71'),
       plot: 'Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...',
       title: 'The Peanut Butter Solution',
       scoreDetails: {
         value: 0.014928698752228164,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 8,
             weight: 0.5,
             value: 0.7015966176986694,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 6,
             weight: 0.5,
             value: 0.7112280130386353,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13b3f29313caabd3e8a1'),
       plot: 'A folk tale - supernatural love story about a ghost who falls in love with a newlywed woman.',
       title: 'Paheli',
       scoreDetails: {
         value: 0.014835164835164835,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 5,
             weight: 0.5,
             value: 0.7116085290908813,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 10,
             weight: 0.5,
             value: 0.7006677389144897,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13d3f29313caabd96a55'),
       plot: 'A teacher with paranormal abilities helps a group of ghosts graduate high school.',
       title: 'Ghost Graduation',
       scoreDetails: {
         value: 0.014242424242424244,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 6,
             weight: 0.5,
             value: 0.7095351219177246,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 15,
             weight: 0.5,
             value: 0.6966710090637207,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabceaf10'),
       plot: "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...",
       title: 'High Spirits',
       scoreDetails: {
         value: 0.013575490735644836,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 9,
             weight: 0.5,
             value: 0.6990464925765991,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 19,
             weight: 0.5,
             value: 0.6928690671920776,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13b5f29313caabd41f29'),
       plot: '14-year-old Lulu moves to a small provincial town with her mother and younger brother. One night, her brother is struck by a beam of white light - actually the spirit of Herman Hartmann ...',
       title: 'Island of Lost Souls',
       scoreDetails: {
         value: 0.013428262436914203,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 16,
             weight: 0.5,
             value: 0.6884604692459106,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 13,
             weight: 0.5,
             value: 0.6971145868301392,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1399f29313caabced85b'),
       plot: 'A comical Gothic horror-movie-type family tries to rescue their beloved uncle from his gold-digging new love.',
       title: 'Addams Family Values',
       scoreDetails: {
         value: 0.01324561403508772,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 15,
             weight: 0.5,
             value: 0.6893779039382935,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 16,
             weight: 0.5,
             value: 0.6955952048301697,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13bdf29313caabd5a0d9'),
       plot: 'A haunting ghost story spanning two worlds, two centuries apart. When 13 year old Tolly finds he can mysteriously travel between the two, he begins an adventure that unlocks family secrets laid buried for generations.',
       title: 'From Time to Time',
       scoreDetails: {
         value: 0.013139814496736516,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 11,
             weight: 0.5,
             value: 0.6945879459381104,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 22,
             weight: 0.5,
             value: 0.689332902431488,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabcebb96'),
       plot: "A mother/daughter pair of witches descend on a yuppie family's home and cause havoc, one at a time since they share one body & the other must live in a cat the rest of the time. Now it's up...",
       title: 'Wicked Stepmother',
       scoreDetails: {
         value: 0.013068651778329199,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 33,
             weight: 0.5,
             value: 0.656587541103363,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 5,
             weight: 0.5,
             value: 0.7130119800567627,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13c6f29313caabd72c06'),
       plot: "Two exorcists literally remove the skeletons from the cupboards from people's homes. Some fairly embarrassing secrets are revealed along the way. A case where the skeletons have hidden themselves turns the lives of all those involved.",
       title: 'Skeletons',
       scoreDetails: {
         value: 0.0130420054200542,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 22,
             weight: 0.5,
             value: 0.6793348789215088,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 12,
             weight: 0.5,
             value: 0.698580265045166,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13bdf29313caabd58274'),
       plot: 'Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy...',
       title: 'Bhoothnath',
       scoreDetails: {
         value: 0.01241318161666913,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 7,
             weight: 0.5,
             value: 0.7085931301116943,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 41,
             weight: 0.5,
             value: 0.6817358732223511,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13b0f29313caabd3380e'),
       plot: 'After a failed suicide attempt, a pregnant woman gains the ability to see ghosts.',
       title: 'The Eye 2',
       scoreDetails: {
         value: 0.011544011544011544,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 17,
             weight: 0.5,
             value: 0.6872396469116211,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 39,
             weight: 0.5,
             value: 0.6822889447212219,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13b0f29313caabd34285'),
       plot: 'After a failed suicide attempt, a pregnant woman gains the ability to see ghosts.',
       title: 'The Eye 2',
       scoreDetails: {
         value: 0.011544011544011544,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 17,
             weight: 0.5,
             value: 0.6872396469116211,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 39,
             weight: 0.5,
             value: 0.6822889447212219,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13a3f29313caabd0cd93'),
       plot: "A simple funeral turns a man's world topsy turvy.",
       title: 'Monday',
       scoreDetails: {
         value: 0.011446886446886448,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 31,
             weight: 0.5,
             value: 0.6580069065093994,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 24,
             weight: 0.5,
             value: 0.6878605484962463,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1399f29313caabced070'),
       plot: 'A man discovers that his dumb, lovable nephew can see through objects and decides to unleash him into the world of gambling.',
       title: 'All for the Winner',
       scoreDetails: {
         value: 0.011210487625581966,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 46,
             weight: 0.5,
             value: 0.641192615032196,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 17,
             weight: 0.5,
             value: 0.6953784227371216,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13a0f29313caabd056df'),
       plot: "A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.",
       title: "Don't Look Under the Bed",
       scoreDetails: {
         value: 0.011027208438211674,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 43,
             weight: 0.5,
             value: 0.64458167552948,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 21,
             weight: 0.5,
             value: 0.6895512342453003,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13d2f29313caabd933c6'),
       plot: "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...",
       title: 'Sien nui yau wan',
       scoreDetails: {
         value: 0.01076007326007326,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 24,
             weight: 0.5,
             value: 0.6691842079162598,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 44,
             weight: 0.5,
             value: 0.6802830696105957,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13a2f29313caabd0af88'),
       plot: 'After dying before his time, an aspiring comic gets a second shot at life...by being reincarnated as a wealthy but un-likeable businessman.',
       title: 'Down to Earth',
       scoreDetails: {
         value: 0.010025062656641603,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 35,
             weight: 0.5,
             value: 0.6498414278030396,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 45,
             weight: 0.5,
             value: 0.6797210574150085,
             details: []
           }
         ]
       }
     }
   ]

   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `plot_embedding_voyage_4_large` field for the phrase *light-hearted comedy with ghosts*, specified in the `queryVector` field of the query as vector embeddings by using the `COMEDY_INVOLVING_GHOSTS` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `plot_embedding_voyage_4_large` field for the phrase *slapstick humor with paranormal events*, specified in the `queryVector` field as vector embeddings by using the `HUMOR_INVOLVING_PARANORMAL` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `plot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 20 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. In the results:

   - The `scoreDetails.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion.

   - The `score.details.rank` shows the rank of the document in the results of the pipeline.

   - The `scoreDetails.details.value` contains the weighted reciprocal rank score.

   You can do the following:

   - Adjust the weights assigned to each pipeline in the query to further refine the results.

   - Increase the number of documents in the results if you see disjoint results.

In this section, you query the `embedded_movies` collection in the `sample_mflix` database by using the index named `multiple-vector-search` that you created on the collection.

1. Create a file named `vector-query.go`.

2. Copy and paste the MongoDB Vector Search query in the `vector-query.go` file.

   ### Similar Terms, Same Field

   Perform a comprehensive search of the dataset for semantically similar terms to determine which query term returns the best results.

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"

   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	// Replace the placeholder with your connection string
   	const uri = "<connectionString>"

   	client, err := mongo.Connect(options.Client().ApplyURI(uri))
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	coll := client.Database("sample_mflix").Collection("embedded_movies")

   	// Query vector for "light-hearted comedy with ghosts"
   	COMEDY_INVOLVING_GHOSTS := []float64{-0.012623000890016556,-0.03503970801830292,0.0017070976318791509, /* ...embedding floats truncated by snapshot... */ 0.029163483530282974}

   	// Query vector for "slapstick humor with paranormal events"
   	HUMOR_INVOLVING_PARANORMAL := []float64{-0.016024498268961906,-0.01714012771844864,-0.013083292171359062, /* ...embedding floats truncated by snapshot... */ 0.023529643192887306}

   	pipeline := mongo.Pipeline{
   		bson.D{{Key: "$rankFusion", Value: bson.D{
   			{Key: "input", Value: bson.D{
   				{Key: "pipelines", Value: bson.D{
   					{Key: "vectorPipeline1", Value: bson.A{
   						bson.D{{Key: "$vectorSearch", Value: bson.D{
   							{Key: "index", Value: "multiple-vector-search"},
   							{Key: "path", Value: "plot_embedding_voyage_4_large"},
   							{Key: "queryVector", Value: COMEDY_INVOLVING_GHOSTS},
   							{Key: "numCandidates", Value: 2000},
   							{Key: "limit", Value: 50},
   						}}},
   					}},
   					{Key: "vectorPipeline2", Value: bson.A{
   						bson.D{{Key: "$vectorSearch", Value: bson.D{
   							{Key: "index", Value: "multiple-vector-search"},
   							{Key: "path", Value: "plot_embedding_voyage_4_large"},
   							{Key: "queryVector", Value: HUMOR_INVOLVING_PARANORMAL},
   							{Key: "numCandidates", Value: 2000},
   							{Key: "limit", Value: 50},
   						}}},
   					}},
   				}},
   			}},
   			{Key: "combination", Value: bson.D{
   				{Key: "weights", Value: bson.D{
   					{Key: "vectorPipeline1", Value: 0.5},
   					{Key: "vectorPipeline2", Value: 0.5},
   				}},
   			}},
   			{Key: "scoreDetails", Value: true},
   		}}},
   		bson.D{{Key: "$project", Value: bson.D{
   			{Key: "_id", Value: 1},
   			{Key: "title", Value: 1},
   			{Key: "plot", Value: 1},
   			{Key: "scoreDetails", Value: bson.D{{Key: "$meta", Value: "scoreDetails"}}},
   		}}},
   		bson.D{{Key: "$limit", Value: 20}},
   	}

   	cursor, err := coll.Aggregate(ctx, pipeline)
   	if err != nil {
   		log.Fatalf("failed to run aggregation: %v", err)
   	}
   	defer cursor.Close(ctx)

   	var results []bson.M
   	if err := cursor.All(ctx, &results); err != nil {
   		log.Fatalf("failed to decode results: %v", err)
   	}
   	for _, doc := range results {
   		fmt.Println(doc)
   	}
   }

   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `plot_embedding_voyage_4_large` field for the phrase *light-hearted comedy with ghosts*, specified in the `queryVector` field of the query as vector embeddings by using the `COMEDY_INVOLVING_GHOSTS` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `plot_embedding_voyage_4_large` field for the phrase *slapstick humor with paranormal events*, specified in the `queryVector` field as vector embeddings by using the `HUMOR_INVOLVING_PARANORMAL` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `plot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 20 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. In the results:

   - The `scoreDetails.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion.

   - The `score.details.rank` shows the rank of the document in the results of the pipeline.

   - The `scoreDetails.details.value` contains the weighted reciprocal rank score.

   You can do the following:

   - Adjust the weights assigned to each pipeline in the query to further refine the results.

   - Increase the number of documents in the results if you see disjoint results.

3. Specify your connection string and save the file.

   In `vector-query.go` file, replace the `<connectionString>` placeholder with your connection string.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the MongoDB Vector Search query against the `embedded_movies` collection.

   ### Similar Terms, Same Field

   ```shell
   go run vector-query.go
   ```

   **Output:**

   ```javascript
   {"_id":{"$oid":"573a139af29313caabcef0a4"},"plot":"A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.","title":"Casper","scoreDetails":{"value":{"$numberDouble":"0.01639344262295082"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"1"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7525938749313354"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"1"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7365995645523071"},"details":[]}]}}
   {"_id":{"$oid":"573a1398f29313caabce912c"},"plot":"Three unemployed parapsychology professors set up shop as a unique ghost removal service.","title":"Ghostbusters","scoreDetails":{"value":{"$numberDouble":"0.015749007936507936"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"4"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7139781713485718"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"3"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7172677516937256"},"details":[]}]}}
   {"_id":{"$oid":"573a1398f29313caabceace9"},"plot":"A couple of recently deceased ghosts contract the services of a \"bio-exorcist\" in order to remove the obnoxious new owners of their house.","title":"Beetlejuice","scoreDetails":{"value":{"$numberDouble":"0.015310892940626462"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"2"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7252534627914429"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"9"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7039943933486938"},"details":[]}]}}
   {"_id":{"$oid":"573a1398f29313caabce9a71"},"plot":"Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...","title":"The Peanut Butter Solution","scoreDetails":{"value":{"$numberDouble":"0.014928698752228164"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"8"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7015966176986694"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"6"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7112280130386353"},"details":[]}]}}
   {"_id":{"$oid":"573a13b3f29313caabd3e8a1"},"plot":"A folk tale - supernatural love story about a ghost who falls in love with a newlywed woman.","title":"Paheli","scoreDetails":{"value":{"$numberDouble":"0.014835164835164835"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"5"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7116085290908813"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"10"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7006677389144897"},"details":[]}]}}
   {"_id":{"$oid":"573a13d3f29313caabd96a55"},"plot":"A teacher with paranormal abilities helps a group of ghosts graduate high school.","title":"Ghost Graduation","scoreDetails":{"value":{"$numberDouble":"0.014242424242424244"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"6"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7095351219177246"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"15"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6966710090637207"},"details":[]}]}}
   {"_id":{"$oid":"573a1398f29313caabceaf10"},"plot":"When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...","title":"High Spirits","scoreDetails":{"value":{"$numberDouble":"0.013575490735644836"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"9"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6990464925765991"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"19"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6928690671920776"},"details":[]}]}}
   {"_id":{"$oid":"573a13b5f29313caabd41f29"},"plot":"14-year-old Lulu moves to a small provincial town with her mother and younger brother. One night, her brother is struck by a beam of white light - actually the spirit of Herman Hartmann ...","title":"Island of Lost Souls","scoreDetails":{"value":{"$numberDouble":"0.013428262436914203"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"16"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6884604692459106"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"13"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6971145868301392"},"details":[]}]}}
   {"_id":{"$oid":"573a1399f29313caabced85b"},"plot":"A comical Gothic horror-movie-type family tries to rescue their beloved uncle from his gold-digging new love.","title":"Addams Family Values","scoreDetails":{"value":{"$numberDouble":"0.01324561403508772"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"15"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6893779039382935"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"16"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6955952048301697"},"details":[]}]}}
   {"_id":{"$oid":"573a13bdf29313caabd5a0d9"},"plot":"A haunting ghost story spanning two worlds, two centuries apart. When 13 year old Tolly finds he can mysteriously travel between the two, he begins an adventure that unlocks family secrets laid buried for generations.","title":"From Time to Time","scoreDetails":{"value":{"$numberDouble":"0.013139814496736516"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"11"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6945879459381104"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"22"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.689332902431488"},"details":[]}]}}
   {"_id":{"$oid":"573a1398f29313caabcebb96"},"plot":"A mother/daughter pair of witches descend on a yuppie family's home and cause havoc, one at a time since they share one body & the other must live in a cat the rest of the time. Now it's up...","title":"Wicked Stepmother","scoreDetails":{"value":{"$numberDouble":"0.013068651778329199"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"33"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.656587541103363"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"5"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7130119800567627"},"details":[]}]}}
   {"_id":{"$oid":"573a13c6f29313caabd72c06"},"plot":"Two exorcists literally remove the skeletons from the cupboards from people's homes. Some fairly embarrassing secrets are revealed along the way. A case where the skeletons have hidden themselves turns the lives of all those involved.","title":"Skeletons","scoreDetails":{"value":{"$numberDouble":"0.0130420054200542"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"22"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6793348789215088"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"12"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.698580265045166"},"details":[]}]}}
   {"_id":{"$oid":"573a13bdf29313caabd58274"},"plot":"Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy...","title":"Bhoothnath","scoreDetails":{"value":{"$numberDouble":"0.01241318161666913"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"7"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7085931301116943"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"41"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6817358732223511"},"details":[]}]}}
   {"_id":{"$oid":"573a13b0f29313caabd3380e"},"plot":"After a failed suicide attempt, a pregnant woman gains the ability to see ghosts.","title":"The Eye 2","scoreDetails":{"value":{"$numberDouble":"0.011544011544011544"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"17"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6872396469116211"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"39"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6822889447212219"},"details":[]}]}}
   {"_id":{"$oid":"573a13b0f29313caabd34285"},"plot":"After a failed suicide attempt, a pregnant woman gains the ability to see ghosts.","title":"The Eye 2","scoreDetails":{"value":{"$numberDouble":"0.011544011544011544"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"17"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6872396469116211"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"39"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6822889447212219"},"details":[]}]}}
   {"_id":{"$oid":"573a13a3f29313caabd0cd93"},"plot":"A simple funeral turns a man's world topsy turvy.","title":"Monday","scoreDetails":{"value":{"$numberDouble":"0.011446886446886448"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"31"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6580069065093994"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"24"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6878605484962463"},"details":[]}]}}
   {"_id":{"$oid":"573a1399f29313caabced070"},"plot":"A man discovers that his dumb, lovable nephew can see through objects and decides to unleash him into the world of gambling.","title":"All for the Winner","scoreDetails":{"value":{"$numberDouble":"0.011210487625581966"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"46"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.641192615032196"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"17"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6953784227371216"},"details":[]}]}}
   {"_id":{"$oid":"573a13a0f29313caabd056df"},"plot":"A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.","title":"Don't Look Under the Bed","scoreDetails":{"value":{"$numberDouble":"0.011027208438211674"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"43"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.64458167552948"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"21"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6895512342453003"},"details":[]}]}}
   {"_id":{"$oid":"573a13d2f29313caabd933c6"},"plot":"Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...","title":"Sien nui yau wan","scoreDetails":{"value":{"$numberDouble":"0.01076007326007326"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"24"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6691842079162598"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"44"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6802830696105957"},"details":[]}]}}
   {"_id":{"$oid":"573a13a2f29313caabd0af88"},"plot":"After dying before his time, an aspiring comic gets a second shot at life...by being reincarnated as a wealthy but un-likeable businessman.","title":"Down to Earth","scoreDetails":{"value":{"$numberDouble":"0.010025062656641603"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"35"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6498414278030396"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"45"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6797210574150085"},"details":[]}]}}

   ```

In this section, you query the `embedded_movies` collection in the `sample_mflix` database by using the index named `multiple-vector-search` that you created on the collection.

1. Create a file named `VectorQuery.java`.

2. Copy and paste the MongoDB Vector Search query into the `VectorQuery.java` file.

   For each of the following programs connect to your cluster, run the query, and print the results.

   ### Similar Terms, Same Field

   Perform a comprehensive search of the dataset for semantically similar terms to determine which query term returns the best results.

   ```java
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import org.bson.Document;

   import java.util.Arrays;
   import java.util.List;

   public class VectorQuery {

       public static void main(String[] args) {

           // Replace the placeholder with your connection string
           String uri = "<connectionString>";

           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_mflix");
               MongoCollection<Document> collection = database.getCollection("embedded_movies");

               // Query vector for "light-hearted comedy with ghosts"
               List<Double> COMEDY_INVOLVING_GHOSTS = Arrays.asList(-0.012623000890016556,-0.03503970801830292,0.0017070976318791509, /* ...embedding floats truncated by snapshot... */ 0.029163483530282974);

               // Query vector for "slapstick humor with paranormal events"
               List<Double> HUMOR_INVOLVING_PARANORMAL = Arrays.asList(-0.016024498268961906,-0.01714012771844864,-0.013083292171359062, /* ...embedding floats truncated by snapshot... */ 0.023529643192887306);

               List<Document> pipeline = Arrays.asList(
                   new Document("$rankFusion", new Document()
                       .append("input", new Document("pipelines", new Document()
                           .append("vectorPipeline1", Arrays.asList(
                               new Document("$vectorSearch", new Document()
                                   .append("index", "multiple-vector-search")
                                   .append("path", "plot_embedding_voyage_4_large")
                                   .append("queryVector", COMEDY_INVOLVING_GHOSTS)
                                   .append("numCandidates", 2000)
                                   .append("limit", 50))))
                           .append("vectorPipeline2", Arrays.asList(
                               new Document("$vectorSearch", new Document()
                                   .append("index", "multiple-vector-search")
                                   .append("path", "plot_embedding_voyage_4_large")
                                   .append("queryVector", HUMOR_INVOLVING_PARANORMAL)
                                   .append("numCandidates", 2000)
                                   .append("limit", 50))))))
                       .append("combination", new Document("weights", new Document()
                           .append("vectorPipeline1", 0.5)
                           .append("vectorPipeline2", 0.5)))
                       .append("scoreDetails", true)),
                   new Document("$project", new Document()
                       .append("_id", 1)
                       .append("title", 1)
                       .append("plot", 1)
                       .append("scoreDetails", new Document("$meta", "scoreDetails"))),
                   new Document("$limit", 20)
               );

               collection.aggregate(pipeline).forEach(doc -> System.out.println(doc.toJson()));
           }
       }
   }

   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `plot_embedding_voyage_4_large` field for the phrase *light-hearted comedy with ghosts*, specified in the `queryVector` field of the query as vector embeddings by using the `COMEDY_INVOLVING_GHOSTS` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `plot_embedding_voyage_4_large` field for the phrase *slapstick humor with paranormal events*, specified in the `queryVector` field as vector embeddings by using the `HUMOR_INVOLVING_PARANORMAL` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `plot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 20 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. In the results:

   - The `scoreDetails.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion.

   - The `score.details.rank` shows the rank of the document in the results of the pipeline.

   - The `scoreDetails.details.value` contains the weighted reciprocal rank score.

   You can do the following:

   - Adjust the weights assigned to each pipeline in the query to further refine the results.

   - Increase the number of documents in the results if you see disjoint results.

3. Specify your connection string and save the file.

   In the `VectorQuery.java` file, replace the `<connectionString>` placeholder with your connection string.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the MongoDB Vector Search query against the `embedded_movies` collection.

   Compile and run the `VectorQuery.java` file:

   ### Similar Terms, Same Field

   ```shell
   javac VectorQuery.java
   java VectorQuery
   ```

   **Output:**

   ```javascript
   {"_id": {"$oid": "573a139af29313caabcef0a4"}, "plot": "A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.", "title": "Casper", "scoreDetails": {"value": 0.01639344262295082, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 1, "weight": 0.5, "value": 0.7525938749313354, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 1, "weight": 0.5, "value": 0.7365995645523071, "details": []}]}}
   {"_id": {"$oid": "573a1398f29313caabce912c"}, "plot": "Three unemployed parapsychology professors set up shop as a unique ghost removal service.", "title": "Ghostbusters", "scoreDetails": {"value": 0.015749007936507936, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 4, "weight": 0.5, "value": 0.7139781713485718, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 3, "weight": 0.5, "value": 0.7172677516937256, "details": []}]}}
   {"_id": {"$oid": "573a1398f29313caabceace9"}, "plot": "A couple of recently deceased ghosts contract the services of a \"bio-exorcist\" in order to remove the obnoxious new owners of their house.", "title": "Beetlejuice", "scoreDetails": {"value": 0.015310892940626462, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 2, "weight": 0.5, "value": 0.7252534627914429, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 9, "weight": 0.5, "value": 0.7039943933486938, "details": []}]}}
   {"_id": {"$oid": "573a1398f29313caabce9a71"}, "plot": "Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...", "title": "The Peanut Butter Solution", "scoreDetails": {"value": 0.014928698752228164, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 8, "weight": 0.5, "value": 0.7015966176986694, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 6, "weight": 0.5, "value": 0.7112280130386353, "details": []}]}}
   {"_id": {"$oid": "573a13b3f29313caabd3e8a1"}, "plot": "A folk tale - supernatural love story about a ghost who falls in love with a newlywed woman.", "title": "Paheli", "scoreDetails": {"value": 0.014835164835164835, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 5, "weight": 0.5, "value": 0.7116085290908813, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 10, "weight": 0.5, "value": 0.7006677389144897, "details": []}]}}
   {"_id": {"$oid": "573a13d3f29313caabd96a55"}, "plot": "A teacher with paranormal abilities helps a group of ghosts graduate high school.", "title": "Ghost Graduation", "scoreDetails": {"value": 0.014242424242424244, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 6, "weight": 0.5, "value": 0.7095351219177246, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 15, "weight": 0.5, "value": 0.6966710090637207, "details": []}]}}
   {"_id": {"$oid": "573a1398f29313caabceaf10"}, "plot": "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...", "title": "High Spirits", "scoreDetails": {"value": 0.013575490735644836, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 9, "weight": 0.5, "value": 0.6990464925765991, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 19, "weight": 0.5, "value": 0.6928690671920776, "details": []}]}}
   {"_id": {"$oid": "573a13b5f29313caabd41f29"}, "plot": "14-year-old Lulu moves to a small provincial town with her mother and younger brother. One night, her brother is struck by a beam of white light - actually the spirit of Herman Hartmann ...", "title": "Island of Lost Souls", "scoreDetails": {"value": 0.013428262436914203, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 16, "weight": 0.5, "value": 0.6884604692459106, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 13, "weight": 0.5, "value": 0.6971145868301392, "details": []}]}}
   {"_id": {"$oid": "573a1399f29313caabced85b"}, "plot": "A comical Gothic horror-movie-type family tries to rescue their beloved uncle from his gold-digging new love.", "title": "Addams Family Values", "scoreDetails": {"value": 0.01324561403508772, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 15, "weight": 0.5, "value": 0.6893779039382935, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 16, "weight": 0.5, "value": 0.6955952048301697, "details": []}]}}
   {"_id": {"$oid": "573a13bdf29313caabd5a0d9"}, "plot": "A haunting ghost story spanning two worlds, two centuries apart. When 13 year old Tolly finds he can mysteriously travel between the two, he begins an adventure that unlocks family secrets laid buried for generations.", "title": "From Time to Time", "scoreDetails": {"value": 0.013139814496736516, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 11, "weight": 0.5, "value": 0.6945879459381104, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 22, "weight": 0.5, "value": 0.689332902431488, "details": []}]}}
   {"_id": {"$oid": "573a1398f29313caabcebb96"}, "plot": "A mother/daughter pair of witches descend on a yuppie family's home and cause havoc, one at a time since they share one body & the other must live in a cat the rest of the time. Now it's up...", "title": "Wicked Stepmother", "scoreDetails": {"value": 0.013068651778329199, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 33, "weight": 0.5, "value": 0.656587541103363, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 5, "weight": 0.5, "value": 0.7130119800567627, "details": []}]}}
   {"_id": {"$oid": "573a13c6f29313caabd72c06"}, "plot": "Two exorcists literally remove the skeletons from the cupboards from people's homes. Some fairly embarrassing secrets are revealed along the way. A case where the skeletons have hidden themselves turns the lives of all those involved.", "title": "Skeletons", "scoreDetails": {"value": 0.0130420054200542, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 22, "weight": 0.5, "value": 0.6793348789215088, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 12, "weight": 0.5, "value": 0.698580265045166, "details": []}]}}
   {"_id": {"$oid": "573a13bdf29313caabd58274"}, "plot": "Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy...", "title": "Bhoothnath", "scoreDetails": {"value": 0.01241318161666913, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 7, "weight": 0.5, "value": 0.7085931301116943, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 41, "weight": 0.5, "value": 0.6817358732223511, "details": []}]}}
   {"_id": {"$oid": "573a13b0f29313caabd3380e"}, "plot": "After a failed suicide attempt, a pregnant woman gains the ability to see ghosts.", "title": "The Eye 2", "scoreDetails": {"value": 0.011544011544011544, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 17, "weight": 0.5, "value": 0.6872396469116211, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 39, "weight": 0.5, "value": 0.6822889447212219, "details": []}]}}
   {"_id": {"$oid": "573a13b0f29313caabd34285"}, "plot": "After a failed suicide attempt, a pregnant woman gains the ability to see ghosts.", "title": "The Eye 2", "scoreDetails": {"value": 0.011544011544011544, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 17, "weight": 0.5, "value": 0.6872396469116211, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 39, "weight": 0.5, "value": 0.6822889447212219, "details": []}]}}
   {"_id": {"$oid": "573a13a3f29313caabd0cd93"}, "plot": "A simple funeral turns a man's world topsy turvy.", "title": "Monday", "scoreDetails": {"value": 0.011446886446886448, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 31, "weight": 0.5, "value": 0.6580069065093994, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 24, "weight": 0.5, "value": 0.6878605484962463, "details": []}]}}
   {"_id": {"$oid": "573a1399f29313caabced070"}, "plot": "A man discovers that his dumb, lovable nephew can see through objects and decides to unleash him into the world of gambling.", "title": "All for the Winner", "scoreDetails": {"value": 0.011210487625581966, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 46, "weight": 0.5, "value": 0.641192615032196, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 17, "weight": 0.5, "value": 0.6953784227371216, "details": []}]}}
   {"_id": {"$oid": "573a13a0f29313caabd056df"}, "plot": "A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.", "title": "Don't Look Under the Bed", "scoreDetails": {"value": 0.011027208438211674, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 43, "weight": 0.5, "value": 0.64458167552948, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 21, "weight": 0.5, "value": 0.6895512342453003, "details": []}]}}
   {"_id": {"$oid": "573a13d2f29313caabd933c6"}, "plot": "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...", "title": "Sien nui yau wan", "scoreDetails": {"value": 0.01076007326007326, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 24, "weight": 0.5, "value": 0.6691842079162598, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 44, "weight": 0.5, "value": 0.6802830696105957, "details": []}]}}
   {"_id": {"$oid": "573a13a2f29313caabd0af88"}, "plot": "After dying before his time, an aspiring comic gets a second shot at life...by being reincarnated as a wealthy but un-likeable businessman.", "title": "Down to Earth", "scoreDetails": {"value": 0.010025062656641603, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 35, "weight": 0.5, "value": 0.6498414278030396, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 45, "weight": 0.5, "value": 0.6797210574150085, "details": []}]}}

   ```

In this section, you query the `embedded_movies` collection in the `sample_mflix` database by using the index named `multiple-vector-search` that you created on the collection.

1. Create a file named `query.js`.

2. Copy and paste the MongoDB Vector Search query into the `query.js` file.

   ### Similar Terms, Same Field

   Perform a comprehensive search of the dataset for semantically similar terms to determine which query term returns the best results.

   ```javascript
   const { MongoClient } = require("mongodb");

   // Replace the placeholder with your connection string
   const uri = "<connectionString>";
   const client = new MongoClient(uri);

   async function run() {
     try {
       const collection = client.db("sample_mflix").collection("embedded_movies");

       // Query vector for "light-hearted comedy with ghosts"
       const COMEDY_INVOLVING_GHOSTS = [-0.012623000890016556,-0.03503970801830292,0.0017070976318791509, /* ...embedding floats truncated by snapshot... */ 0.029163483530282974];

       // Query vector for "slapstick humor with paranormal events"
       const HUMOR_INVOLVING_PARANORMAL = [-0.016024498268961906,-0.01714012771844864,-0.013083292171359062, /* ...embedding floats truncated by snapshot... */ 0.023529643192887306];

       const pipeline = [
         {
           $rankFusion: {
             input: {
               pipelines: {
                 vectorPipeline1: [
                   {
                     $vectorSearch: {
                       index: "multiple-vector-search",
                       path: "plot_embedding_voyage_4_large",
                       queryVector: COMEDY_INVOLVING_GHOSTS,
                       numCandidates: 2000,
                       limit: 50,
                     },
                   },
                 ],
                 vectorPipeline2: [
                   {
                     $vectorSearch: {
                       index: "multiple-vector-search",
                       path: "plot_embedding_voyage_4_large",
                       queryVector: HUMOR_INVOLVING_PARANORMAL,
                       numCandidates: 2000,
                       limit: 50,
                     },
                   },
                 ],
               },
             },
             combination: {
               weights: {
                 vectorPipeline1: 0.5,
                 vectorPipeline2: 0.5,
               },
             },
             scoreDetails: true,
           },
         },
         {
           $project: {
             _id: 1,
             title: 1,
             plot: 1,
             scoreDetails: { $meta: "scoreDetails" },
           },
         },
         { $limit: 20 },
       ];

       const results = await collection.aggregate(pipeline).toArray();
       results.forEach((doc) => console.log(JSON.stringify(doc)));
     } finally {
       await client.close();
     }
   }

   run().catch(console.dir);

   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `plot_embedding_voyage_4_large` field for the phrase *light-hearted comedy with ghosts*, specified in the `queryVector` field of the query as vector embeddings by using the `COMEDY_INVOLVING_GHOSTS` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `plot_embedding_voyage_4_large` field for the phrase *slapstick humor with paranormal events*, specified in the `queryVector` field as vector embeddings by using the `HUMOR_INVOLVING_PARANORMAL` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `plot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 20 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. In the results:

   - The `scoreDetails.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion.

   - The `score.details.rank` shows the rank of the document in the results of the pipeline.

   - The `scoreDetails.details.value` contains the weighted reciprocal rank score.

   You can do the following:

   - Adjust the weights assigned to each pipeline in the query to further refine the results.

   - Increase the number of documents in the results if you see disjoint results.

3. Specify your connection string.

   In each of the following query files, replace the `<connectionString>` placeholder with your connection string.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the query.

   Run the following command to query your collection:

   ### Similar Terms, Same Field

   ```bash
   node query.js
   ```

   **Output:**

   ```javascript
   {"_id":"573a139af29313caabcef0a4","plot":"A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.","title":"Casper","scoreDetails":{"value":0.01639344262295082,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":1,"weight":0.5,"value":0.7525938749313354,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":1,"weight":0.5,"value":0.7365995645523071,"details":[]}]}}
   {"_id":"573a1398f29313caabce912c","plot":"Three unemployed parapsychology professors set up shop as a unique ghost removal service.","title":"Ghostbusters","scoreDetails":{"value":0.015749007936507936,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":4,"weight":0.5,"value":0.7139781713485718,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":3,"weight":0.5,"value":0.7172677516937256,"details":[]}]}}
   {"_id":"573a1398f29313caabceace9","plot":"A couple of recently deceased ghosts contract the services of a \"bio-exorcist\" in order to remove the obnoxious new owners of their house.","title":"Beetlejuice","scoreDetails":{"value":0.015310892940626462,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":2,"weight":0.5,"value":0.7252534627914429,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":9,"weight":0.5,"value":0.7039943933486938,"details":[]}]}}
   {"_id":"573a1398f29313caabce9a71","plot":"Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...","title":"The Peanut Butter Solution","scoreDetails":{"value":0.014928698752228164,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":8,"weight":0.5,"value":0.7015966176986694,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":6,"weight":0.5,"value":0.7112280130386353,"details":[]}]}}
   {"_id":"573a13b3f29313caabd3e8a1","plot":"A folk tale - supernatural love story about a ghost who falls in love with a newlywed woman.","title":"Paheli","scoreDetails":{"value":0.014835164835164835,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":5,"weight":0.5,"value":0.7116085290908813,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":10,"weight":0.5,"value":0.7006677389144897,"details":[]}]}}
   {"_id":"573a13d3f29313caabd96a55","plot":"A teacher with paranormal abilities helps a group of ghosts graduate high school.","title":"Ghost Graduation","scoreDetails":{"value":0.014242424242424244,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":6,"weight":0.5,"value":0.7095351219177246,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":15,"weight":0.5,"value":0.6966710090637207,"details":[]}]}}
   {"_id":"573a1398f29313caabceaf10","plot":"When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...","title":"High Spirits","scoreDetails":{"value":0.013575490735644836,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":9,"weight":0.5,"value":0.6990464925765991,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":19,"weight":0.5,"value":0.6928690671920776,"details":[]}]}}
   {"_id":"573a13b5f29313caabd41f29","plot":"14-year-old Lulu moves to a small provincial town with her mother and younger brother. One night, her brother is struck by a beam of white light - actually the spirit of Herman Hartmann ...","title":"Island of Lost Souls","scoreDetails":{"value":0.013428262436914203,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":16,"weight":0.5,"value":0.6884604692459106,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":13,"weight":0.5,"value":0.6971145868301392,"details":[]}]}}
   {"_id":"573a1399f29313caabced85b","plot":"A comical Gothic horror-movie-type family tries to rescue their beloved uncle from his gold-digging new love.","title":"Addams Family Values","scoreDetails":{"value":0.01324561403508772,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":15,"weight":0.5,"value":0.6893779039382935,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":16,"weight":0.5,"value":0.6955952048301697,"details":[]}]}}
   {"_id":"573a13bdf29313caabd5a0d9","plot":"A haunting ghost story spanning two worlds, two centuries apart. When 13 year old Tolly finds he can mysteriously travel between the two, he begins an adventure that unlocks family secrets laid buried for generations.","title":"From Time to Time","scoreDetails":{"value":0.013139814496736516,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":11,"weight":0.5,"value":0.6945879459381104,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":22,"weight":0.5,"value":0.689332902431488,"details":[]}]}}
   {"_id":"573a1398f29313caabcebb96","plot":"A mother/daughter pair of witches descend on a yuppie family's home and cause havoc, one at a time since they share one body & the other must live in a cat the rest of the time. Now it's up...","title":"Wicked Stepmother","scoreDetails":{"value":0.013068651778329199,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":33,"weight":0.5,"value":0.656587541103363,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":5,"weight":0.5,"value":0.7130119800567627,"details":[]}]}}
   {"_id":"573a13c6f29313caabd72c06","plot":"Two exorcists literally remove the skeletons from the cupboards from people's homes. Some fairly embarrassing secrets are revealed along the way. A case where the skeletons have hidden themselves turns the lives of all those involved.","title":"Skeletons","scoreDetails":{"value":0.0130420054200542,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":22,"weight":0.5,"value":0.6793348789215088,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":12,"weight":0.5,"value":0.698580265045166,"details":[]}]}}
   {"_id":"573a13bdf29313caabd58274","plot":"Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy...","title":"Bhoothnath","scoreDetails":{"value":0.01241318161666913,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":7,"weight":0.5,"value":0.7085931301116943,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":41,"weight":0.5,"value":0.6817358732223511,"details":[]}]}}
   {"_id":"573a13b0f29313caabd3380e","plot":"After a failed suicide attempt, a pregnant woman gains the ability to see ghosts.","title":"The Eye 2","scoreDetails":{"value":0.011544011544011544,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":17,"weight":0.5,"value":0.6872396469116211,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":39,"weight":0.5,"value":0.6822889447212219,"details":[]}]}}
   {"_id":"573a13b0f29313caabd34285","plot":"After a failed suicide attempt, a pregnant woman gains the ability to see ghosts.","title":"The Eye 2","scoreDetails":{"value":0.011544011544011544,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":17,"weight":0.5,"value":0.6872396469116211,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":39,"weight":0.5,"value":0.6822889447212219,"details":[]}]}}
   {"_id":"573a13a3f29313caabd0cd93","plot":"A simple funeral turns a man's world topsy turvy.","title":"Monday","scoreDetails":{"value":0.011446886446886448,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":31,"weight":0.5,"value":0.6580069065093994,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":24,"weight":0.5,"value":0.6878605484962463,"details":[]}]}}
   {"_id":"573a1399f29313caabced070","plot":"A man discovers that his dumb, lovable nephew can see through objects and decides to unleash him into the world of gambling.","title":"All for the Winner","scoreDetails":{"value":0.011210487625581966,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":46,"weight":0.5,"value":0.641192615032196,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":17,"weight":0.5,"value":0.6953784227371216,"details":[]}]}}
   {"_id":"573a13a0f29313caabd056df","plot":"A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.","title":"Don't Look Under the Bed","scoreDetails":{"value":0.011027208438211674,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":43,"weight":0.5,"value":0.64458167552948,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":21,"weight":0.5,"value":0.6895512342453003,"details":[]}]}}
   {"_id":"573a13d2f29313caabd933c6","plot":"Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...","title":"Sien nui yau wan","scoreDetails":{"value":0.01076007326007326,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":24,"weight":0.5,"value":0.6691842079162598,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":44,"weight":0.5,"value":0.6802830696105957,"details":[]}]}}
   {"_id":"573a13a2f29313caabd0af88","plot":"After dying before his time, an aspiring comic gets a second shot at life...by being reincarnated as a wealthy but un-likeable businessman.","title":"Down to Earth","scoreDetails":{"value":0.010025062656641603,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":35,"weight":0.5,"value":0.6498414278030396,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":45,"weight":0.5,"value":0.6797210574150085,"details":[]}]}}

   ```

In this section, you query the `embedded_movies` collection in the `sample_mflix` database by using the index named `multiple-vector-search` that you created on the collection.

1. Create a file named `query.py`.

2. Copy and paste the MongoDB Vector Search query into the `query.py` file.

   ### Similar Terms, Same Field

   Perform a comprehensive search of the dataset for semantically similar terms to determine which query term returns the best results.

   ```python
   from pymongo import MongoClient

   # Replace the placeholder with your connection string
   uri = "<connectionString>"
   client = MongoClient(uri)

   # Access your database and collection
   collection = client["sample_mflix"]["embedded_movies"]

   # Query vector for "light-hearted comedy with ghosts"
   COMEDY_INVOLVING_GHOSTS = [-0.012623000890016556,-0.03503970801830292,0.0017070976318791509, /* ...embedding floats truncated by snapshot... */ 0.029163483530282974]

   # Query vector for "slapstick humor with paranormal events"
   HUMOR_INVOLVING_PARANORMAL = [-0.016024498268961906,-0.01714012771844864,-0.013083292171359062, /* ...embedding floats truncated by snapshot... */ 0.023529643192887306]

   pipeline = [
       {
           "$rankFusion": {
               "input": {
                   "pipelines": {
                       "vectorPipeline1": [
                           {
                               "$vectorSearch": {
                                   "index": "multiple-vector-search",
                                   "path": "plot_embedding_voyage_4_large",
                                   "queryVector": COMEDY_INVOLVING_GHOSTS,
                                   "numCandidates": 2000,
                                   "limit": 50
                               }
                           }
                       ],
                       "vectorPipeline2": [
                           {
                               "$vectorSearch": {
                                   "index": "multiple-vector-search",
                                   "path": "plot_embedding_voyage_4_large",
                                   "queryVector": HUMOR_INVOLVING_PARANORMAL,
                                   "numCandidates": 2000,
                                   "limit": 50
                               }
                           }
                       ]
                   }
               },
               "combination": {
                   "weights": {
                       "vectorPipeline1": 0.5,
                       "vectorPipeline2": 0.5
                   }
               },
               "scoreDetails": True
           }
       },
       {
           "$project": {
               "_id": 1,
               "title": 1,
               "plot": 1,
               "scoreDetails": {"$meta": "scoreDetails"}
           }
       },
       {"$limit": 20}
   ]

   results = collection.aggregate(pipeline)
   for doc in results:
       print(doc)

   client.close()

   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `plot_embedding_voyage_4_large` field for the phrase *light-hearted comedy with ghosts*, specified in the `queryVector` field of the query as vector embeddings by using the `COMEDY_INVOLVING_GHOSTS` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `plot_embedding_voyage_4_large` field for the phrase *slapstick humor with paranormal events*, specified in the `queryVector` field as vector embeddings by using the `HUMOR_INVOLVING_PARANORMAL` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `plot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 20 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. In the results:

   - The `scoreDetails.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion.

   - The `score.details.rank` shows the rank of the document in the results of the pipeline.

   - The `scoreDetails.details.value` contains the weighted reciprocal rank score.

   You can do the following:

   - Adjust the weights assigned to each pipeline in the query to further refine the results.

   - Increase the number of documents in the results if you see disjoint results.

3. Specify your connection string.

   In the query file, replace the `<connectionString>` placeholder with your connection string.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the command to query your collection.

   ### Similar Terms, Same Field

   ```bash
   python query.py
   ```

   **Output:**

   ```javascript
   {'_id': ObjectId('573a139af29313caabcef0a4'), 'plot': 'A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.', 'title': 'Casper', 'scoreDetails': {'value': 0.01639344262295082, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 1, 'weight': 0.5, 'value': 0.7525938749313354, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 1, 'weight': 0.5, 'value': 0.7365995645523071, 'details': []}]}}
   {'_id': ObjectId('573a1398f29313caabce912c'), 'plot': 'Three unemployed parapsychology professors set up shop as a unique ghost removal service.', 'title': 'Ghostbusters', 'scoreDetails': {'value': 0.015749007936507936, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 4, 'weight': 0.5, 'value': 0.7139781713485718, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 3, 'weight': 0.5, 'value': 0.7172677516937256, 'details': []}]}}
   {'_id': ObjectId('573a1398f29313caabceace9'), 'plot': 'A couple of recently deceased ghosts contract the services of a "bio-exorcist" in order to remove the obnoxious new owners of their house.', 'title': 'Beetlejuice', 'scoreDetails': {'value': 0.015310892940626462, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 2, 'weight': 0.5, 'value': 0.7252534627914429, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 9, 'weight': 0.5, 'value': 0.7039943933486938, 'details': []}]}}
   {'_id': ObjectId('573a1398f29313caabce9a71'), 'plot': 'Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...', 'title': 'The Peanut Butter Solution', 'scoreDetails': {'value': 0.014928698752228164, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 8, 'weight': 0.5, 'value': 0.7015966176986694, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 6, 'weight': 0.5, 'value': 0.7112280130386353, 'details': []}]}}
   {'_id': ObjectId('573a13b3f29313caabd3e8a1'), 'plot': 'A folk tale - supernatural love story about a ghost who falls in love with a newlywed woman.', 'title': 'Paheli', 'scoreDetails': {'value': 0.014835164835164835, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 5, 'weight': 0.5, 'value': 0.7116085290908813, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 10, 'weight': 0.5, 'value': 0.7006677389144897, 'details': []}]}}
   {'_id': ObjectId('573a13d3f29313caabd96a55'), 'plot': 'A teacher with paranormal abilities helps a group of ghosts graduate high school.', 'title': 'Ghost Graduation', 'scoreDetails': {'value': 0.014242424242424244, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 6, 'weight': 0.5, 'value': 0.7095351219177246, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 15, 'weight': 0.5, 'value': 0.6966710090637207, 'details': []}]}}
   {'_id': ObjectId('573a1398f29313caabceaf10'), 'plot': "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...", 'title': 'High Spirits', 'scoreDetails': {'value': 0.013575490735644836, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 9, 'weight': 0.5, 'value': 0.6990464925765991, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 19, 'weight': 0.5, 'value': 0.6928690671920776, 'details': []}]}}
   {'_id': ObjectId('573a13b5f29313caabd41f29'), 'plot': '14-year-old Lulu moves to a small provincial town with her mother and younger brother. One night, her brother is struck by a beam of white light - actually the spirit of Herman Hartmann ...', 'title': 'Island of Lost Souls', 'scoreDetails': {'value': 0.013428262436914203, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 16, 'weight': 0.5, 'value': 0.6884604692459106, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 13, 'weight': 0.5, 'value': 0.6971145868301392, 'details': []}]}}
   {'_id': ObjectId('573a1399f29313caabced85b'), 'plot': 'A comical Gothic horror-movie-type family tries to rescue their beloved uncle from his gold-digging new love.', 'title': 'Addams Family Values', 'scoreDetails': {'value': 0.01324561403508772, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 15, 'weight': 0.5, 'value': 0.6893779039382935, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 16, 'weight': 0.5, 'value': 0.6955952048301697, 'details': []}]}}
   {'_id': ObjectId('573a13bdf29313caabd5a0d9'), 'plot': 'A haunting ghost story spanning two worlds, two centuries apart. When 13 year old Tolly finds he can mysteriously travel between the two, he begins an adventure that unlocks family secrets laid buried for generations.', 'title': 'From Time to Time', 'scoreDetails': {'value': 0.013139814496736516, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 11, 'weight': 0.5, 'value': 0.6945879459381104, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 22, 'weight': 0.5, 'value': 0.689332902431488, 'details': []}]}}
   {'_id': ObjectId('573a1398f29313caabcebb96'), 'plot': "A mother/daughter pair of witches descend on a yuppie family's home and cause havoc, one at a time since they share one body & the other must live in a cat the rest of the time. Now it's up...", 'title': 'Wicked Stepmother', 'scoreDetails': {'value': 0.013068651778329199, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 33, 'weight': 0.5, 'value': 0.656587541103363, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 5, 'weight': 0.5, 'value': 0.7130119800567627, 'details': []}]}}
   {'_id': ObjectId('573a13c6f29313caabd72c06'), 'plot': "Two exorcists literally remove the skeletons from the cupboards from people's homes. Some fairly embarrassing secrets are revealed along the way. A case where the skeletons have hidden themselves turns the lives of all those involved.", 'title': 'Skeletons', 'scoreDetails': {'value': 0.0130420054200542, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 22, 'weight': 0.5, 'value': 0.6793348789215088, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 12, 'weight': 0.5, 'value': 0.698580265045166, 'details': []}]}}
   {'_id': ObjectId('573a13bdf29313caabd58274'), 'plot': 'Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy...', 'title': 'Bhoothnath', 'scoreDetails': {'value': 0.01241318161666913, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 7, 'weight': 0.5, 'value': 0.7085931301116943, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 41, 'weight': 0.5, 'value': 0.6817358732223511, 'details': []}]}}
   {'_id': ObjectId('573a13b0f29313caabd3380e'), 'plot': 'After a failed suicide attempt, a pregnant woman gains the ability to see ghosts.', 'title': 'The Eye 2', 'scoreDetails': {'value': 0.011544011544011544, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 17, 'weight': 0.5, 'value': 0.6872396469116211, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 39, 'weight': 0.5, 'value': 0.6822889447212219, 'details': []}]}}
   {'_id': ObjectId('573a13b0f29313caabd34285'), 'plot': 'After a failed suicide attempt, a pregnant woman gains the ability to see ghosts.', 'title': 'The Eye 2', 'scoreDetails': {'value': 0.011544011544011544, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 17, 'weight': 0.5, 'value': 0.6872396469116211, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 39, 'weight': 0.5, 'value': 0.6822889447212219, 'details': []}]}}
   {'_id': ObjectId('573a13a3f29313caabd0cd93'), 'plot': "A simple funeral turns a man's world topsy turvy.", 'title': 'Monday', 'scoreDetails': {'value': 0.011446886446886448, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 31, 'weight': 0.5, 'value': 0.6580069065093994, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 24, 'weight': 0.5, 'value': 0.6878605484962463, 'details': []}]}}
   {'_id': ObjectId('573a1399f29313caabced070'), 'plot': 'A man discovers that his dumb, lovable nephew can see through objects and decides to unleash him into the world of gambling.', 'title': 'All for the Winner', 'scoreDetails': {'value': 0.011210487625581966, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 46, 'weight': 0.5, 'value': 0.641192615032196, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 17, 'weight': 0.5, 'value': 0.6953784227371216, 'details': []}]}}
   {'_id': ObjectId('573a13a0f29313caabd056df'), 'plot': "A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.", 'title': "Don't Look Under the Bed", 'scoreDetails': {'value': 0.011027208438211674, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 43, 'weight': 0.5, 'value': 0.64458167552948, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 21, 'weight': 0.5, 'value': 0.6895512342453003, 'details': []}]}}
   {'_id': ObjectId('573a13d2f29313caabd933c6'), 'plot': "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...", 'title': 'Sien nui yau wan', 'scoreDetails': {'value': 0.01076007326007326, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 24, 'weight': 0.5, 'value': 0.6691842079162598, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 44, 'weight': 0.5, 'value': 0.6802830696105957, 'details': []}]}}
   {'_id': ObjectId('573a13a2f29313caabd0af88'), 'plot': 'After dying before his time, an aspiring comic gets a second shot at life...by being reincarnated as a wealthy but un-likeable businessman.', 'title': 'Down to Earth', 'scoreDetails': {'value': 0.010025062656641603, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 35, 'weight': 0.5, 'value': 0.6498414278030396, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 45, 'weight': 0.5, 'value': 0.6797210574150085, 'details': []}]}}

   ```

1) Navigate to the collection in MongoDB Compass.

   On the Database screen, click the `sample_airbnb` database, then click the `listingsAndReviews` collection.

2) Run the query.

   To run this query in MongoDB Compass:

   Click the Aggregations tab.

   Click \</> Text to switch to JSON (Javascript Object Notation) view.

   Copy and paste to run the following queries:

   ### Similar Terms, Same Field

   Perform a comprehensive search of the dataset for semantically similar terms to determine which query term returns the best results.

   ```javascript
   [
     {
       "$rankFusion": {
         "input": {
           "pipelines": {
             "vectorPipeline1": [
               {
                 "$vectorSearch": {
                   "index": "multiple-auto-embed-search",
                   "path": "fullplot",
                   "query": { "text": "light-hearted comedy with ghosts" },
                   "numCandidates": 2000,
                   "limit": 50
                 }
               }
             ],
             "vectorPipeline2": [
               {
                 "$vectorSearch": {
                   "index": "multiple-auto-embed-search",
                   "path": "fullplot",
                   "query": { "text": "slapstick humor with paranormal events" },
                   "numCandidates": 2000,
                   "limit": 50
                 },
               },
             ],
           },
         },
         "combination": {
           "weights": {
             "vectorPipeline1": 0.5,
             "vectorPipeline2": 0.5
           }
         },
         "scoreDetails": true,
       },
     },
     {
       "$project": {
         "_id": 1,
         "title": 1,
         "fullplot": 1,
         "scoreDetails": { "$meta": "scoreDetails" }
       }
     },
     { "$limit": 20 }
   ]
   ```

   **Output:**

   ```javascript
   {
     "_id": {
       "$oid": "573a13c6f29313caabd72c06"
     },
     "title": "Skeletons",
     "fullplot": "Two exorcists literally remove the skeletons from the cupboards from people's homes. Some fairly embarrassing secrets are revealed along the way. A case where the skeletons have hidden themselves turns the lives of all those involved.",
     "scoreDetails": {
       "value": 0.015772478887232988,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 6,
           "weight": 0.5,
           "value": 0.5045768022537231,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 1,
           "weight": 0.5,
           "value": 0.5040305256843567,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13bdf29313caabd58456"
     },
     "title": "Ghost Town",
     "fullplot": "Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts. Even worse, they all want something from him, particularly Frank Herlihy who pesters him into breaking up the impending marriage of his widow Gwen. That puts Pincus squarely in the middle of a triangle with spirited result.",
     "scoreDetails": {
       "value": 0.01565940787863959,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 1,
           "weight": 0.5,
           "value": 0.50507652759552,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 7,
           "weight": 0.5,
           "value": 0.5037906169891357,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1398f29313caabce98c8"
     },
     "title": "Mr. Vampire",
     "fullplot": "A ghost sucks the life-force out of a one of Uncle Nine's student. The other is slowly turned into a vampire. They halt his transformation by filing down his teeth! The female ghost throws her head around like a boomerang to protect herself. Can Mr. Vampire chase away the Succubus and the hopping ghost and save his two students?",
     "scoreDetails": {
       "value": 0.01466181506849315,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 13,
           "weight": 0.5,
           "value": 0.504249095916748,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 4,
           "weight": 0.5,
           "value": 0.5039034485816956,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1398f29313caabce9a71"
     },
     "title": "The Peanut Butter Solution",
     "fullplot": "Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair back, but too much peanut butter causes things to get a bit hairy.",
     "scoreDetails": {
       "value": 0.014558022622538752,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 17,
           "weight": 0.5,
           "value": 0.5041541457176208,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 2,
           "weight": 0.5,
           "value": 0.5040101408958435,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13a6f29313caabd1787b"
     },
     "title": "Casper's Haunted Christmas",
     "fullplot": "Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and sets out to complete his mission. As usual, kindhearted Casper has a ghastky time trying to scare anyone; so The Ghostly Trio, fed up with his goody-boo-shoes behavior, secretly hires Casper's look-alike cousin Spooky to do the job-with hilarious results.",
     "scoreDetails": {
       "value": 0.014297385620915032,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 8,
           "weight": 0.5,
           "value": 0.5044854879379272,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 12,
           "weight": 0.5,
           "value": 0.5037259459495544,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1393f29313caabcdd652"
     },
     "title": "Wonder Man",
     "fullplot": "Boisterous nightclub entertainer Buzzy Bellew was the witness to a murder committed by gangster Ten Grand Jackson. One night, two of Jackson's thugs kill Buzzy and dump his body in the lake at Prospect Park in Brooklyn. Buzzy comes back as a ghost and summons his bookworm twin, Edwin Dingle, to Prospect Park so that he can help the police nail Jackson.",
     "scoreDetails": {
       "value": 0.014041633935585232,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 7,
           "weight": 0.5,
           "value": 0.5044862627983093,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 16,
           "weight": 0.5,
           "value": 0.5036256313323975,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1398f29313caabceaf10"
     },
     "title": "High Spirits",
     "fullplot": "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The trouble begins when a busload of American tourists arrive - along with some real ghosts. Among the tourists are married couple Jack and Sharon. Sharon's father holds the mortgage on Castle Plunkett, so she's hoping to debunk the ghosts. Jack, on the other hand, after meeting pretty ghost Mary, is very eager to believe. Can there be love between a human and ghost? Jack and Mary are going to try and find out.",
     "scoreDetails": {
       "value": 0.013946869070208728,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 2,
           "weight": 0.5,
           "value": 0.5049547553062439,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 25,
           "weight": 0.5,
           "value": 0.5035316944122314,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a1399f29313caabcec5c4"
     },
     "title": "And You Thought Your Parents Were Weird",
     "fullplot": "Two boys follow in their late father's footsteps by inventing weird and wonderful gadgets. Trouble lies ahead when, after a Halloween party, the spirit of their father ends up in the latest invention, a robot.",
     "scoreDetails": {
       "value": 0.013763197586726998,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 18,
           "weight": 0.5,
           "value": 0.5041317939758301,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 8,
           "weight": 0.5,
           "value": 0.5037808418273926,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13daf29313caabdab644"
     },
     "title": "A Magnificent Haunting",
     "fullplot": "The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.",
     "scoreDetails": {
       "value": 0.013575490735644836,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 9,
           "weight": 0.5,
           "value": 0.5043735504150391,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 19,
           "weight": 0.5,
           "value": 0.5035990476608276,
           "details": []
         }
       ]
     }
   }
   {
     "_id": {
       "$oid": "573a13dbf29313caabdaea1c"
     },
     "title": "A Magnificent Haunting",
     "fullplot": "The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.",
     "scoreDetails": {
       "value": 0.013575490735644836,
       "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
       "details": [
         {
           "inputPipelineName": "vectorPipeline1",
           "rank": 9,
           "weight": 0.5,
           "value": 0.5043735504150391,
           "details": []
         },
         {
           "inputPipelineName": "vectorPipeline2",
           "rank": 19,
           "weight": 0.5,
           "value": 0.5035990476608276,
           "details": []
         }
       ]
     }
   }
   ```

1. Create a file for the embeddings to use in the query.

   Create a file named `query-embeddings.js`.

   ```shell
   touch query-embeddings.js
   ```

   Copy and paste the following embeddings into the `query-embeddings.js` file.

   ```javascript
   JOURNEY_ACROSS_LANDS_OPENAI=[-0.00034048742963932455, -0.03168917074799538, 0.008861231617629528,  /* ...embedding floats truncated by snapshot... */ -0.010582618415355682];
   ```

   Save and close the file.

2. Connect to your cluster in [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh).

   Open [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) in a terminal window and connect to your cluster. For detailed instructions on connecting, see [Connect via mongosh.](https://www.mongodb.com/docs/atlas/mongo-shell-connection.md#std-label-connect-mongo-shell)

3. Use the `sample_mflix` database.

   Run the following command in the [`mongosh`](https://www.mongodb.com/docs/mongodb-shell.md#mongodb-binary-bin.mongosh) prompt:

   ```javascript
   use sample_mflix
   ```

4. Run the MongoDB Vector Search queries against the `embedded_movies` collection.

   ### Similar Terms, Same Field

   Perform a comprehensive search of the dataset for semantically similar terms to determine which query term returns the best results.

   ```shell
   db.embedded_movies.aggregate([
     {
       $rankFusion: {
         input: {
           pipelines: {
             vectorPipeline1: [
               {
                 "$vectorSearch": {
                   "index": "multiple-auto-embed-search",
                   "path": "fullplot",
                   "query": {
                     "text": "light-hearted comedy with ghosts"
                   },
                   "numCandidates": 2000,
                   "limit": 50
                 }
               }
             ],
             vectorPipeline2: [
               {
                 "$vectorSearch": {
                   "index": "multiple-auto-embed-search",
                   "path": "fullplot",
                   "query": {
                     "text": "slapstick humor with paranormal events"
                   },
                   "numCandidates": 2000,
                   "limit": 50
                 }
               }
             ]
           }
         },
         combination: {
           weights: {
             vectorPipeline1: 0.5,
             vectorPipeline2: 0.5
           }
         },
         "scoreDetails": true
       }
     },
     {
       "$project": {
         _id: 1,
         title: 1,
         plot: 1,
         scoreDetails: {"$meta": "scoreDetails"}
       }
     },
     {
       "$limit": 20
     }
   ]);
   ```

   **Output:**

   ```shell
   [
     {
       _id: ObjectId('573a13c6f29313caabd72c06'),
       plot: "Two exorcists literally remove the skeletons from the cupboards from people's homes. Some fairly embarrassing secrets are revealed along the way. A case where the skeletons have hidden themselves turns the lives of all those involved.",
       title: 'Skeletons',
       scoreDetails: {
         value: 0.015772478887232988,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 6,
             weight: 0.5,
             value: 0.5045768022537231,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 1,
             weight: 0.5,
             value: 0.5040305256843567,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13bdf29313caabd58456'),
       plot: 'Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts.',
       title: 'Ghost Town',
       scoreDetails: {
         value: 0.01565940787863959,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 1,
             weight: 0.5,
             value: 0.50507652759552,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 7,
             weight: 0.5,
             value: 0.5037906169891357,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabce98c8'),
       plot: 'The planned reburial of a village elder goes awry as the corpse resurrects into a hopping, bloodthirsty vampire, threatening mankind. Therefore, a Taoist Priest and his two disciples attempt to stop the terror.',
       title: 'Mr. Vampire',
       scoreDetails: {
         value: 0.01466181506849315,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 13,
             weight: 0.5,
             value: 0.504249095916748,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 4,
             weight: 0.5,
             value: 0.5039034485816956,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabce9a71'),
       plot: 'Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...',
       title: 'The Peanut Butter Solution',
       scoreDetails: {
         value: 0.014558022622538752,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 17,
             weight: 0.5,
             value: 0.5041646957397461,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 2,
             weight: 0.5,
             value: 0.504012942314148,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13a6f29313caabd1787b'),
       plot: 'Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and ...',
       title: "Casper's Haunted Christmas",
       scoreDetails: {
         value: 0.014297385620915032,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 8,
             weight: 0.5,
             value: 0.5044854879379272,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 12,
             weight: 0.5,
             value: 0.5037259459495544,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1393f29313caabcdd652'),
       plot: "Boisterous nightclub entertainer Buzzy Bellew was the witness to a murder committed by gangster Ten Grand Jackson. One night, two of Jackson's thugs kill Buzzy and dump his body in the lake...",
       title: 'Wonder Man',
       scoreDetails: {
         value: 0.014041633935585232,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 7,
             weight: 0.5,
             value: 0.5044862627983093,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 16,
             weight: 0.5,
             value: 0.5036256313323975,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabceaf10'),
       plot: "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...",
       title: 'High Spirits',
       scoreDetails: {
         value: 0.013946869070208728,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 2,
             weight: 0.5,
             value: 0.5049547553062439,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 25,
             weight: 0.5,
             value: 0.5035316944122314,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1399f29313caabcec5c4'),
       plot: 'Two inventor brothers create a working robot that is also inhabited by the spirit of their dead father.',
       title: 'And You Thought Your Parents Were Weird',
       scoreDetails: {
         value: 0.013763197586726998,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 18,
             weight: 0.5,
             value: 0.5041317939758301,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 8,
             weight: 0.5,
             value: 0.5037808418273926,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13daf29313caabdab644'),
       plot: 'The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to ...',
       title: 'A Magnificent Haunting',
       scoreDetails: {
         value: 0.013575490735644836,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 9,
             weight: 0.5,
             value: 0.5043735504150391,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 19,
             weight: 0.5,
             value: 0.5035990476608276,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13dbf29313caabdaea1c'),
       plot: 'The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to ...',
       title: 'A Magnificent Haunting',
       scoreDetails: {
         value: 0.013575490735644836,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 9,
             weight: 0.5,
             value: 0.5043735504150391,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 19,
             weight: 0.5,
             value: 0.5035990476608276,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13d3f29313caabd96a55'),
       plot: 'A teacher with paranormal abilities helps a group of ghosts graduate high school.',
       title: 'Ghost Graduation',
       scoreDetails: {
         value: 0.013423423423423425,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 15,
             weight: 0.5,
             value: 0.5041909217834473,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 14,
             weight: 0.5,
             value: 0.5036569833755493,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a139af29313caabcef0a4'),
       plot: 'A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.',
       title: 'Casper',
       scoreDetails: {
         value: 0.013312852022529442,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 3,
             weight: 0.5,
             value: 0.5047479271888733,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 33,
             weight: 0.5,
             value: 0.503459095954895,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabce912c'),
       plot: 'Three unemployed parapsychology professors set up shop as a unique ghost removal service.',
       title: 'Ghostbusters',
       scoreDetails: {
         value: 0.012740882306099698,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 31,
             weight: 0.5,
             value: 0.5037020444869995,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 9,
             weight: 0.5,
             value: 0.5037755966186523,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13d1f29313caabd8dad0'),
       plot: 'The puppies go on a spooky adventure through a haunted mansion.',
       title: 'Spooky Buddies',
       scoreDetails: {
         value: 0.01273166800966962,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 25,
             weight: 0.5,
             value: 0.5038601160049438,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 13,
             weight: 0.5,
             value: 0.5036613941192627,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a1398f29313caabcebb96'),
       plot: "A mother/daughter pair of witches descend on a yuppie family's home and cause havoc, one at a time since they share one body & the other must live in a cat the rest of the time. Now it's up...",
       title: 'Wicked Stepmother',
       scoreDetails: {
         value: 0.012692307692307694,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 40,
             weight: 0.5,
             value: 0.503515362739563,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 5,
             weight: 0.5,
             value: 0.5038493871688843,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13c9f29313caabd7b8f0'),
       plot: 'Live-action role players conjure up a demon from Hell by mistake and they must deal with the consequences.',
       title: 'Knights of Badassdom',
       scoreDetails: {
         value: 0.012677798392084105,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 38,
             weight: 0.5,
             value: 0.5035541653633118,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 6,
             weight: 0.5,
             value: 0.5038090944290161,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13d2f29313caabd933c6'),
       plot: "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...",
       title: 'Sien nui yau wan',
       scoreDetails: {
         value: 0.01196509009009009,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 14,
             weight: 0.5,
             value: 0.5041933059692383,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 36,
             weight: 0.5,
             value: 0.5034355521202087,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13a2f29313caabd0be52'),
       plot: 'The last day of creation. A stranger arrives in London. No one knows who he is or where he has come from. By the time he leaves, the entire universe will have been erased. A black comedy ...',
       title: 'The Nine Lives of Tomas Katz',
       scoreDetails: {
         value: 0.011705914567360351,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 28,
             weight: 0.5,
             value: 0.5038424730300903,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 23,
             weight: 0.5,
             value: 0.5035601258277893,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13a0f29313caabd056df'),
       plot: "A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.",
       title: "Don't Look Under the Bed",
       scoreDetails: {
         value: 0.011618589743589744,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 36,
             weight: 0.5,
             value: 0.5035803914070129,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 18,
             weight: 0.5,
             value: 0.5035999417304993,
             details: []
           }
         ]
       }
     },
     {
       _id: ObjectId('573a13edf29313caabdd4424'),
       plot: 'A ghost returns back from his world to prove something. But on earth, he has something more to do for his country.',
       title: 'Bhoothnath Returns',
       scoreDetails: {
         value: 0.011151960784313726,
         description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
         details: [
           {
             inputPipelineName: 'vectorPipeline1',
             rank: 20,
             weight: 0.5,
             value: 0.504052996635437,
             details: []
           },
           {
             inputPipelineName: 'vectorPipeline2',
             rank: 42,
             weight: 0.5,
             value: 0.5033951997756958,
             details: []
           }
         ]
       }
     }
   ]
   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `fullplot` field for the phrase *light-hearted comedy with ghosts*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `fullplot` field for the phrase *slapstick humor with paranormal events*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages:

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `fullplot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 20 documents. |

   MongoDB Vector Search merges the results for both queries into a single result set. In the results:

   - The `scoreDetails.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion.

   - The `score.details.rank` shows the rank of the document in the results of the pipeline.

   - The `scoreDetails.details.value` contains the weighted reciprocal rank score.

   You can do the following:

   - Adjust the weights assigned to each pipeline in the query to further refine the results.

   - Increase the number of documents in the results if you see disjoint results.

1) Create a file named `auto-embed-query.go`.

2) Copy and paste the MongoDB Vector Search query in the `auto-embed-query.go` file.

   ### Similar Terms, Same Field

   Perform a comprehensive search of the dataset for semantically similar terms to determine which query term returns the best results.

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"

   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	// Replace the placeholder with your connection string
   	const uri = "<connectionString>"

   	client, err := mongo.Connect(options.Client().ApplyURI(uri))
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	coll := client.Database("sample_mflix").Collection("embedded_movies")

   	pipeline := mongo.Pipeline{
   		bson.D{{Key: "$rankFusion", Value: bson.D{
   			{Key: "input", Value: bson.D{
   				{Key: "pipelines", Value: bson.D{
   					{Key: "vectorPipeline1", Value: bson.A{
   						bson.D{{Key: "$vectorSearch", Value: bson.D{
   							{Key: "index", Value: "multiple-auto-embed-search"},
   							{Key: "path", Value: "fullplot"},
   							{Key: "query", Value: bson.D{Key: "text", Value: "light-hearted comedy with ghosts"}},
   							{Key: "numCandidates", Value: 2000},
   							{Key: "limit", Value: 50},
   						}}},
   					}},
   					{Key: "vectorPipeline2", Value: bson.A{
   						bson.D{{Key: "$vectorSearch", Value: bson.D{
   							{Key: "index", Value: "multiple-auto-embed-search"},
   							{Key: "path", Value: "fullplot"},
   							{Key: "query", Value: bson.D{Key: "text", Value: "slapstick humor with paranormal events"}},
   							{Key: "numCandidates", Value: 2000},
   							{Key: "limit", Value: 50},
   						}}},
   					}},
   				}},
   			}},
   			{Key: "combination", Value: bson.D{
   				{Key: "weights", Value: bson.D{
   					{Key: "vectorPipeline1", Value: 0.5},
   					{Key: "vectorPipeline2", Value: 0.5},
   				}},
   			}},
   			{Key: "scoreDetails", Value: true},
   		}}},
   		bson.D{{Key: "$project", Value: bson.D{
   			{Key: "_id", Value: 1},
   			{Key: "title", Value: 1},
   			{Key: "fullplot", Value: 1},
   			{Key: "scoreDetails", Value: bson.D{{Key: "$meta", Value: "scoreDetails"}}},
   		}}},
   		bson.D{{Key: "$limit", Value: 20}},
   	}

   	cursor, err := coll.Aggregate(ctx, pipeline)
   	if err != nil {
   		log.Fatalf("failed to run aggregation: %v", err)
   	}
   	defer cursor.Close(ctx)

   	var results []bson.M
   	if err := cursor.All(ctx, &results); err != nil {
   		log.Fatalf("failed to decode results: %v", err)
   	}
   	for _, doc := range results {
   		fmt.Println(doc)
   	}
   }

   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `fullplot` field for the phrase *light-hearted comedy with ghosts*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `fullplot` field for the phrase *slapstick humor with paranormal events*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages:

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `fullplot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 20 documents. |

   MongoDB Vector Search merges the results for both queries into a single result set. In the results:

   - The `scoreDetails.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion.

   - The `score.details.rank` shows the rank of the document in the results of the pipeline.

   - The `scoreDetails.details.value` contains the weighted reciprocal rank score.

   You can do the following:

   - Adjust the weights assigned to each pipeline in the query to further refine the results.

   - Increase the number of documents in the results if you see disjoint results.

3) Specify your connection string and save the file.

   In `vector-query.go` file, replace the `<connectionString>` placeholder with your connection string.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4) Run the MongoDB Vector Search query against the `embedded_movies` collection.

   ### Similar Terms, Same Field

   ```shell
   go run auto-embed-query.go
   ```

   **Output:**

   ```shell
   PLACEHOLDER: Replace with the actual output from running the Go "Similar Terms, Same Field" (multiple-vectors) query.

   ```

1. Create a file named `AutoEmbedQuery.java`.

2. Copy and paste the MongoDB Vector Search query into the `AutoEmbedQuery.java` file.

   For each of the following programs connect to your cluster, run the query, and print the results.

   ### Similar Terms, Same Field

   Perform a comprehensive search of the dataset for semantically similar terms to determine which query term returns the best results.

   ```java
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import org.bson.Document;

   import java.util.Arrays;
   import java.util.List;

   public class AutoEmbedQuery {

       public static void main(String[] args) {

           // Replace the placeholder with your connection string
           String uri = "<connectionString>";

           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_mflix");
               MongoCollection<Document> collection = database.getCollection("embedded_movies");

               List<Document> pipeline = Arrays.asList(
                   new Document("$rankFusion", new Document()
                       .append("input", new Document("pipelines", new Document()
                           .append("vectorPipeline1", Arrays.asList(
                               new Document("$vectorSearch", new Document()
                                   .append("index", "multiple-auto-embed-search")
                                   .append("path", "fullplot")
                                   .append("query", new Document("text", "light-hearted comedy with ghosts"))
                                   .append("numCandidates", 2000)
                                   .append("limit", 50))))
                           .append("vectorPipeline2", Arrays.asList(
                               new Document("$vectorSearch", new Document()
                                   .append("index", "multiple-auto-embed-search")
                                   .append("path", "fullplot")
                                   .append("query", new Document("text", "slapstick humor with paranormal events"))
                                   .append("numCandidates", 2000)
                                   .append("limit", 50))))))
                       .append("combination", new Document("weights", new Document()
                           .append("vectorPipeline1", 0.5)
                           .append("vectorPipeline2", 0.5)))
                       .append("scoreDetails", true)),
                   new Document("$project", new Document()
                       .append("_id", 1)
                       .append("title", 1)
                       .append("fullplot", 1)
                       .append("scoreDetails", new Document("$meta", "scoreDetails"))),
                   new Document("$limit", 20)
               );

               collection.aggregate(pipeline).forEach(doc -> System.out.println(doc.toJson()));
           }
       }
   }

   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `fullplot` field for the phrase *light-hearted comedy with ghosts*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `fullplot` field for the phrase *slapstick humor with paranormal events*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages:

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `fullplot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 20 documents. |

   MongoDB Vector Search merges the results for both queries into a single result set. In the results:

   - The `scoreDetails.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion.

   - The `score.details.rank` shows the rank of the document in the results of the pipeline.

   - The `scoreDetails.details.value` contains the weighted reciprocal rank score.

   You can do the following:

   - Adjust the weights assigned to each pipeline in the query to further refine the results.

   - Increase the number of documents in the results if you see disjoint results.

3. Specify your connection string and save the file.

   In the `AutoEmbedQuery.java` file, replace the `<connectionString>` placeholder with your connection string.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the MongoDB Vector Search query against the `embedded_movies` collection.

   Compile and run the `AutoEmbedQuery.java` file:

   ### Similar Terms, Same Field

   ```shell
   javac AutoEmbedQuery.java
   java AutoEmbedQuery
   ```

   **Output:**

   ```shell
   {"_id": {"$oid": "573a13c6f29313caabd72c06"}, "title": "Skeletons", "fullplot": "Two exorcists literally remove the skeletons from the cupboards from people's homes. Some fairly embarrassing secrets are revealed along the way. A case where the skeletons have hidden themselves turns the lives of all those involved.", "scoreDetails": {"value": 0.015772478887232988, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 6, "weight": 0.5, "value": 0.5045768022537231, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 1, "weight": 0.5, "value": 0.5040305256843567, "details": []}]}}
   {"_id": {"$oid": "573a13bdf29313caabd58456"}, "title": "Ghost Town", "fullplot": "Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts. Even worse, they all want something from him, particularly Frank Herlihy who pesters him into breaking up the impending marriage of his widow Gwen. That puts Pincus squarely in the middle of a triangle with spirited result.", "scoreDetails": {"value": 0.01565940787863959, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 1, "weight": 0.5, "value": 0.50507652759552, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 7, "weight": 0.5, "value": 0.5037906169891357, "details": []}]}}
   {"_id": {"$oid": "573a1398f29313caabce98c8"}, "title": "Mr. Vampire", "fullplot": "A ghost sucks the life-force out of a one of Uncle Nine's student. The other is slowly turned into a vampire. They halt his transformation by filing down his teeth! The female ghost throws her head around like a boomerang to protect herself. Can Mr. Vampire chase away the Succubus and the hopping ghost and save his two students?", "scoreDetails": {"value": 0.01466181506849315, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 13, "weight": 0.5, "value": 0.504249095916748, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 4, "weight": 0.5, "value": 0.5039034485816956, "details": []}]}}
   {"_id": {"$oid": "573a1398f29313caabce9a71"}, "title": "The Peanut Butter Solution", "fullplot": "Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair back, but too much peanut butter causes things to get a bit hairy.", "scoreDetails": {"value": 0.014558022622538752, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 17, "weight": 0.5, "value": 0.5041646957397461, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 2, "weight": 0.5, "value": 0.504012942314148, "details": []}]}}
   {"_id": {"$oid": "573a13a6f29313caabd1787b"}, "title": "Casper's Haunted Christmas", "fullplot": "Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and sets out to complete his mission. As usual, kindhearted Casper has a ghastky time trying to scare anyone; so The Ghostly Trio, fed up with his goody-boo-shoes behavior, secretly hires Casper's look-alike cousin Spooky to do the job-with hilarious results.", "scoreDetails": {"value": 0.014297385620915032, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 8, "weight": 0.5, "value": 0.5044854879379272, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 12, "weight": 0.5, "value": 0.5037259459495544, "details": []}]}}
   {"_id": {"$oid": "573a1393f29313caabcdd652"}, "title": "Wonder Man", "fullplot": "Boisterous nightclub entertainer Buzzy Bellew was the witness to a murder committed by gangster Ten Grand Jackson. One night, two of Jackson's thugs kill Buzzy and dump his body in the lake at Prospect Park in Brooklyn. Buzzy comes back as a ghost and summons his bookworm twin, Edwin Dingle, to Prospect Park so that he can help the police nail Jackson.", "scoreDetails": {"value": 0.014041633935585232, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 7, "weight": 0.5, "value": 0.5044862627983093, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 16, "weight": 0.5, "value": 0.5036256313323975, "details": []}]}}
   {"_id": {"$oid": "573a1398f29313caabceaf10"}, "title": "High Spirits", "fullplot": "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The trouble begins when a busload of American tourists arrive - along with some real ghosts. Among the tourists are married couple Jack and Sharon. Sharon's father holds the mortgage on Castle Plunkett, so she's hoping to debunk the ghosts. Jack, on the other hand, after meeting pretty ghost Mary, is very eager to believe. Can there be love between a human and ghost? Jack and Mary are going to try and find out.", "scoreDetails": {"value": 0.013946869070208728, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 2, "weight": 0.5, "value": 0.5049547553062439, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 25, "weight": 0.5, "value": 0.5035316944122314, "details": []}]}}
   {"_id": {"$oid": "573a1399f29313caabcec5c4"}, "title": "And You Thought Your Parents Were Weird", "fullplot": "Two boys follow in their late father's footsteps by inventing weird and wonderful gadgets. Trouble lies ahead when, after a Halloween party, the spirit of their father ends up in the latest invention, a robot.", "scoreDetails": {"value": 0.013763197586726998, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 18, "weight": 0.5, "value": 0.5041317939758301, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 8, "weight": 0.5, "value": 0.5037808418273926, "details": []}]}}
   {"_id": {"$oid": "573a13daf29313caabdab644"}, "title": "A Magnificent Haunting", "fullplot": "The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.", "scoreDetails": {"value": 0.013575490735644836, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 9, "weight": 0.5, "value": 0.5043735504150391, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 19, "weight": 0.5, "value": 0.5035990476608276, "details": []}]}}
   {"_id": {"$oid": "573a13dbf29313caabdaea1c"}, "title": "A Magnificent Haunting", "fullplot": "The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.", "scoreDetails": {"value": 0.013575490735644836, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 9, "weight": 0.5, "value": 0.5043735504150391, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 19, "weight": 0.5, "value": 0.5035990476608276, "details": []}]}}
   {"_id": {"$oid": "573a13d3f29313caabd96a55"}, "title": "Ghost Graduation", "fullplot": "\"The Sixth Sense\" meets \"The Breakfast Club\" when a teacher who sees dead people applies for work at a high school haunted by five student poltergeists who died during detention. All his life Modesto has seen dead people walking around like living people and has long accepted the assessment of others that he has a mental problem. Principal Tina Escalonilla turns that around when Modesto describes a detail (known to her) about the school spirits that no others have been able to reveal. With her school poised to be closed due to unrelenting paranormal high jinx, she begs Modesto to stay and see what he can do to ease these spirits into the next life before Founder's Day.", "scoreDetails": {"value": 0.013423423423423425, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 15, "weight": 0.5, "value": 0.5041909217834473, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 14, "weight": 0.5, "value": 0.5036569833755493, "details": []}]}}
   {"_id": {"$oid": "573a139af29313caabcef0a4"}, "title": "Casper", "fullplot": "Furious that her late father only willed her his gloomy-looking mansion rather than his millions, Carrigan Crittenden is ready to burn the place to the ground when she discovers a map to a treasure hidden in the house. But when she enters the rickety mansion to seek her claim, she is frightened away by a wicked wave of ghosts. Determined to get her hands on this hidden fortune, she hires afterlife therapist Dr. James Harvey to exorcise the ghosts from the mansion. Harvey and his daughter Kat move in, and soon Kat meets Casper, the ghost of a young boy who's \"the friendliest ghost you know.\" But not so friendly are Casper's uncles--Stretch, Fatso and Stinkie--who are determined to drive all \"fleshies\" away. Ultimately, it is up to Harvey and Kat to help the ghosts cross over to the other side.", "scoreDetails": {"value": 0.013312852022529442, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 3, "weight": 0.5, "value": 0.5047479271888733, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 33, "weight": 0.5, "value": 0.503459095954895, "details": []}]}}
   {"_id": {"$oid": "573a1398f29313caabce912c"}, "title": "Ghostbusters", "fullplot": "Three odd-ball scientists get kicked out of their cushy positions at a university in New York City where they studied the occult. They decide to set up shop in an old firehouse and become Ghostbusters, trapping pesky ghosts, spirits, haunts, and poltergeists for money. They wise-crack their way through the city, and stumble upon a gateway to another dimension, one which will release untold evil upon the city. The Ghostbusters are called on to save the Big Apple.", "scoreDetails": {"value": 0.012740882306099698, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 31, "weight": 0.5, "value": 0.5037020444869995, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 9, "weight": 0.5, "value": 0.5037755966186523, "details": []}]}}
   {"_id": {"$oid": "573a13d1f29313caabd8dad0"}, "title": "Spooky Buddies", "fullplot": "The puppies go on a spooky adventure through a haunted mansion.", "scoreDetails": {"value": 0.01273166800966962, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 25, "weight": 0.5, "value": 0.5038601160049438, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 13, "weight": 0.5, "value": 0.5036613941192627, "details": []}]}}
   {"_id": {"$oid": "573a1398f29313caabcebb96"}, "title": "Wicked Stepmother", "fullplot": "A mother/daughter pair of witches descend on a yuppie family's home and cause havoc, one at a time since they share one body & the other must live in a cat the rest of the time. Now it's up to the family's mother, a private detective and a suspended police officer to try and stop the witches.", "scoreDetails": {"value": 0.012692307692307694, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 40, "weight": 0.5, "value": 0.503515362739563, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 5, "weight": 0.5, "value": 0.5038493871688843, "details": []}]}}
   {"_id": {"$oid": "573a13c9f29313caabd7b8f0"}, "title": "Knights of Badassdom", "fullplot": "Live-action role players conjure up a demon from Hell by mistake and they must deal with the consequences.", "scoreDetails": {"value": 0.012677798392084105, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 38, "weight": 0.5, "value": 0.5035541653633118, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 6, "weight": 0.5, "value": 0.5038090944290161, "details": []}]}}
   {"_id": {"$oid": "573a13d2f29313caabd933c6"}, "title": "Sien nui yau wan", "fullplot": "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets a very beautiful lady who seduces him, but he doesn't know that she is a ghost, usually not leaving any man alive...", "scoreDetails": {"value": 0.01196509009009009, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 14, "weight": 0.5, "value": 0.5041933059692383, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 36, "weight": 0.5, "value": 0.5034355521202087, "details": []}]}}
   {"_id": {"$oid": "573a13a2f29313caabd0be52"}, "title": "The Nine Lives of Tomas Katz", "fullplot": "The last day of creation. A stranger arrives in London. No one knows who he is or where he has come from. By the time he leaves, the entire universe will have been erased. A black comedy about the Apocalypse, 'The Nine Lives...' presents a unique brand of left-field humour, spiritual beauty and spectral horror.", "scoreDetails": {"value": 0.011705914567360351, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 28, "weight": 0.5, "value": 0.5038424730300903, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 23, "weight": 0.5, "value": 0.5035601258277893, "details": []}]}}
   {"_id": {"$oid": "573a13a0f29313caabd056df"}, "title": "Don't Look Under the Bed", "fullplot": "A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.", "scoreDetails": {"value": 0.011618589743589744, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 36, "weight": 0.5, "value": 0.5035803914070129, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 18, "weight": 0.5, "value": 0.5035999417304993, "details": []}]}}
   {"_id": {"$oid": "573a13edf29313caabdd4424"}, "title": "Bhoothnath Returns", "fullplot": "Bhoothnath Returns takes Bhoothnath's story forward. As he returns to 'Bhoot World' he is greeted with taunts and condemnation from other ghosts for bringing disrepute to the ghost-community for getting bullied by a kid on Earth. Post the humiliation, Bhoothnath decides to redeem himself and come back to scare a bunch of kids. Bhoothnath's search for kids brings him to Akhrot, a slum kid who is also the only person who can see him. Together they agree to help each other and their friendship sees them get involved in a cause that is bigger than they had ever imagined. To move ahead they will need to take on one of the country's most powerful and corrupt politician Bhau. The Lok Sabha elections are nearing and Bhau's victory is a mere formality, or is it? In a world, where a common man is afraid of politics, will a common man's ghost overcome his fear to stand up for what's right and fight against injustice? Bhoothnath Returns is an entertaining tale of good against evil, weak against powerful, past against future.", "scoreDetails": {"value": 0.011151960784313726, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 20, "weight": 0.5, "value": 0.504052996635437, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 42, "weight": 0.5, "value": 0.5033951997756958, "details": []}]}}
   ```

1) Create a file named `auto-embed-query.js`.

2) Copy and paste the MongoDB Vector Search query into the `auto-embed-query.js` file.

   ### Similar Terms, Same Field

   Perform a comprehensive search of the dataset for semantically similar terms to determine which query term returns the best results.

   ```javascript
   const { MongoClient } = require("mongodb");

   // Replace the placeholder with your connection string
   const uri = "<connectionString>";
   const client = new MongoClient(uri);

   async function run() {
     try {
       const collection = client.db("sample_mflix").collection("embedded_movies");

       const pipeline = [
         {
           $rankFusion: {
             input: {
               pipelines: {
                 vectorPipeline1: [
                   {
                     $vectorSearch: {
                       index: "multiple-auto-embed-search",
                       path: "fullplot",
                       query: { text: "light-hearted comedy with ghosts" },
                       numCandidates: 2000,
                       limit: 50,
                     },
                   },
                 ],
                 vectorPipeline2: [
                   {
                     $vectorSearch: {
                       index: "multiple-auto-embed-search",
                       path: "fullplot",
                       query: { text: "slapstick humor with paranormal events" },
                       numCandidates: 2000,
                       limit: 50,
                     },
                   },
                 ],
               },
             },
             combination: {
               weights: {
                 vectorPipeline1: 0.5,
                 vectorPipeline2: 0.5,
               },
             },
             scoreDetails: true,
           },
         },
         {
           $project: {
             _id: 1,
             title: 1,
             fullplot: 1,
             scoreDetails: { $meta: "scoreDetails" },
           },
         },
         { $limit: 20 },
       ];

       const results = await collection.aggregate(pipeline).toArray();
       results.forEach((doc) => console.log(JSON.stringify(doc)));
     } finally {
       await client.close();
     }
   }

   run().catch(console.dir);

   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `fullplot` field for the phrase *light-hearted comedy with ghosts*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `fullplot` field for the phrase *slapstick humor with paranormal events*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages:

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `fullplot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 20 documents. |

   MongoDB Vector Search merges the results for both queries into a single result set. In the results:

   - The `scoreDetails.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion.

   - The `score.details.rank` shows the rank of the document in the results of the pipeline.

   - The `scoreDetails.details.value` contains the weighted reciprocal rank score.

   You can do the following:

   - Adjust the weights assigned to each pipeline in the query to further refine the results.

   - Increase the number of documents in the results if you see disjoint results.

3) Specify your connection string.

   In each of the following query files, replace the `<connectionString>` placeholder with your connection string.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4) Run the query.

   Run the following command to query your collection:

   ### Similar Terms, Same Field

   ```bash
   node auto-embed-query.js
   ```

   **Output:**

   ```shell
   {"_id":"573a13c6f29313caabd72c06","title":"Skeletons","fullplot":"Two exorcists literally remove the skeletons from the cupboards from people's homes. Some fairly embarrassing secrets are revealed along the way. A case where the skeletons have hidden themselves turns the lives of all those involved.","scoreDetails":{"value":0.015772478887232988,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":6,"weight":0.5,"value":0.5045841932296753,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":1,"weight":0.5,"value":0.5040266513824463,"details":[]}]}}
   {"_id":"573a13bdf29313caabd58456","title":"Ghost Town","fullplot":"Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts. Even worse, they all want something from him, particularly Frank Herlihy who pesters him into breaking up the impending marriage of his widow Gwen. That puts Pincus squarely in the middle of a triangle with spirited result.","scoreDetails":{"value":0.01565940787863959,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":1,"weight":0.5,"value":0.5050796866416931,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":7,"weight":0.5,"value":0.5037903785705566,"details":[]}]}}
   {"_id":"573a1398f29313caabce98c8","title":"Mr. Vampire","fullplot":"A ghost sucks the life-force out of a one of Uncle Nine's student. The other is slowly turned into a vampire. They halt his transformation by filing down his teeth! The female ghost throws her head around like a boomerang to protect herself. Can Mr. Vampire chase away the Succubus and the hopping ghost and save his two students?","scoreDetails":{"value":0.01466181506849315,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":13,"weight":0.5,"value":0.5042542219161987,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":4,"weight":0.5,"value":0.5038983225822449,"details":[]}]}}
   {"_id":"573a1398f29313caabce9a71","title":"The Peanut Butter Solution","fullplot":"Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair back, but too much peanut butter causes things to get a bit hairy.","scoreDetails":{"value":0.01464346349745331,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":16,"weight":0.5,"value":0.5041725635528564,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":2,"weight":0.5,"value":0.5040102005004883,"details":[]}]}}
   {"_id":"573a13a6f29313caabd1787b","title":"Casper's Haunted Christmas","fullplot":"Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and sets out to complete his mission. As usual, kindhearted Casper has a ghastky time trying to scare anyone; so The Ghostly Trio, fed up with his goody-boo-shoes behavior, secretly hires Casper's look-alike cousin Spooky to do the job-with hilarious results.","scoreDetails":{"value":0.014297385620915032,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":8,"weight":0.5,"value":0.5044880509376526,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":12,"weight":0.5,"value":0.5037203431129456,"details":[]}]}}
   {"_id":"573a1393f29313caabcdd652","title":"Wonder Man","fullplot":"Boisterous nightclub entertainer Buzzy Bellew was the witness to a murder committed by gangster Ten Grand Jackson. One night, two of Jackson's thugs kill Buzzy and dump his body in the lake at Prospect Park in Brooklyn. Buzzy comes back as a ghost and summons his bookworm twin, Edwin Dingle, to Prospect Park so that he can help the police nail Jackson.","scoreDetails":{"value":0.013956193060670672,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":7,"weight":0.5,"value":0.5044905543327332,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":17,"weight":0.5,"value":0.5036218166351318,"details":[]}]}}
   {"_id":"573a1398f29313caabceaf10","title":"High Spirits","fullplot":"When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The trouble begins when a busload of American tourists arrive - along with some real ghosts. Among the tourists are married couple Jack and Sharon. Sharon's father holds the mortgage on Castle Plunkett, so she's hoping to debunk the ghosts. Jack, on the other hand, after meeting pretty ghost Mary, is very eager to believe. Can there be love between a human and ghost? Jack and Mary are going to try and find out.","scoreDetails":{"value":0.013811642565813867,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":2,"weight":0.5,"value":0.5049566626548767,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":27,"weight":0.5,"value":0.5035264492034912,"details":[]}]}}
   {"_id":"573a1399f29313caabcec5c4","title":"And You Thought Your Parents Were Weird","fullplot":"Two boys follow in their late father's footsteps by inventing weird and wonderful gadgets. Trouble lies ahead when, after a Halloween party, the spirit of their father ends up in the latest invention, a robot.","scoreDetails":{"value":0.013763197586726998,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":18,"weight":0.5,"value":0.5041354894638062,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":8,"weight":0.5,"value":0.5037785768508911,"details":[]}]}}
   {"_id":"573a13daf29313caabdab644","title":"A Magnificent Haunting","fullplot":"The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.","scoreDetails":{"value":0.013575490735644836,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":9,"weight":0.5,"value":0.5043774843215942,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":19,"weight":0.5,"value":0.5035969018936157,"details":[]}]}}
   {"_id":"573a13dbf29313caabdaea1c","title":"A Magnificent Haunting","fullplot":"The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.","scoreDetails":{"value":0.013575490735644836,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":9,"weight":0.5,"value":0.5043774843215942,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":19,"weight":0.5,"value":0.5035969018936157,"details":[]}]}}
   {"_id":"573a13d3f29313caabd96a55","title":"Ghost Graduation","fullplot":"\"The Sixth Sense\" meets \"The Breakfast Club\" when a teacher who sees dead people applies for work at a high school haunted by five student poltergeists who died during detention. All his life Modesto has seen dead people walking around like living people and has long accepted the assessment of others that he has a mental problem. Principal Tina Escalonilla turns that around when Modesto describes a detail (known to her) about the school spirits that no others have been able to reveal. With her school poised to be closed due to unrelenting paranormal high jinx, she begs Modesto to stay and see what he can do to ease these spirits into the next life before Founder's Day.","scoreDetails":{"value":0.013423423423423425,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":15,"weight":0.5,"value":0.5041930675506592,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":14,"weight":0.5,"value":0.5036542415618896,"details":[]}]}}
   {"_id":"573a139af29313caabcef0a4","title":"Casper","fullplot":"Furious that her late father only willed her his gloomy-looking mansion rather than his millions, Carrigan Crittenden is ready to burn the place to the ground when she discovers a map to a treasure hidden in the house. But when she enters the rickety mansion to seek her claim, she is frightened away by a wicked wave of ghosts. Determined to get her hands on this hidden fortune, she hires afterlife therapist Dr. James Harvey to exorcise the ghosts from the mansion. Harvey and his daughter Kat move in, and soon Kat meets Casper, the ghost of a young boy who's \"the friendliest ghost you know.\" But not so friendly are Casper's uncles--Stretch, Fatso and Stinkie--who are determined to drive all \"fleshies\" away. Ultimately, it is up to Harvey and Kat to help the ghosts cross over to the other side.","scoreDetails":{"value":0.013312852022529442,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":3,"weight":0.5,"value":0.504750669002533,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":33,"weight":0.5,"value":0.5034528374671936,"details":[]}]}}
   {"_id":"573a1398f29313caabce912c","title":"Ghostbusters","fullplot":"Three odd-ball scientists get kicked out of their cushy positions at a university in New York City where they studied the occult. They decide to set up shop in an old firehouse and become Ghostbusters, trapping pesky ghosts, spirits, haunts, and poltergeists for money. They wise-crack their way through the city, and stumble upon a gateway to another dimension, one which will release untold evil upon the city. The Ghostbusters are called on to save the Big Apple.","scoreDetails":{"value":0.012740882306099698,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":31,"weight":0.5,"value":0.5037068128585815,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":9,"weight":0.5,"value":0.5037729740142822,"details":[]}]}}
   {"_id":"573a1398f29313caabcebb96","title":"Wicked Stepmother","fullplot":"A mother/daughter pair of witches descend on a yuppie family's home and cause havoc, one at a time since they share one body & the other must live in a cat the rest of the time. Now it's up to the family's mother, a private detective and a suspended police officer to try and stop the witches.","scoreDetails":{"value":0.012692307692307694,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":40,"weight":0.5,"value":0.5035212635993958,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":5,"weight":0.5,"value":0.5038491487503052,"details":[]}]}}
   {"_id":"573a13c9f29313caabd7b8f0","title":"Knights of Badassdom","fullplot":"Live-action role players conjure up a demon from Hell by mistake and they must deal with the consequences.","scoreDetails":{"value":0.012677798392084105,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":38,"weight":0.5,"value":0.5035619139671326,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":6,"weight":0.5,"value":0.503807008266449,"details":[]}]}}
   {"_id":"573a13d1f29313caabd8dad0","title":"Spooky Buddies","fullplot":"The puppies go on a spooky adventure through a haunted mansion.","scoreDetails":{"value":0.012663268556865243,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":26,"weight":0.5,"value":0.5038619637489319,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":13,"weight":0.5,"value":0.5036572813987732,"details":[]}]}}
   {"_id":"573a13d2f29313caabd933c6","title":"Sien nui yau wan","fullplot":"Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets a very beautiful lady who seduces him, but he doesn't know that she is a ghost, usually not leaving any man alive...","scoreDetails":{"value":0.01196509009009009,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":14,"weight":0.5,"value":0.5041970014572144,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":36,"weight":0.5,"value":0.5034324526786804,"details":[]}]}}
   {"_id":"573a13a2f29313caabd0be52","title":"The Nine Lives of Tomas Katz","fullplot":"The last day of creation. A stranger arrives in London. No one knows who he is or where he has come from. By the time he leaves, the entire universe will have been erased. A black comedy about the Apocalypse, 'The Nine Lives...' presents a unique brand of left-field humour, spiritual beauty and spectral horror.","scoreDetails":{"value":0.011779379157427938,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":28,"weight":0.5,"value":0.5038445591926575,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":22,"weight":0.5,"value":0.5035611391067505,"details":[]}]}}
   {"_id":"573a13a0f29313caabd056df","title":"Don't Look Under the Bed","fullplot":"A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.","scoreDetails":{"value":0.011381172839506171,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":36,"weight":0.5,"value":0.5035841464996338,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":21,"weight":0.5,"value":0.5035965442657471,"details":[]}]}}
   {"_id":"573a13edf29313caabdd4424","title":"Bhoothnath Returns","fullplot":"Bhoothnath Returns takes Bhoothnath's story forward. As he returns to 'Bhoot World' he is greeted with taunts and condemnation from other ghosts for bringing disrepute to the ghost-community for getting bullied by a kid on Earth. Post the humiliation, Bhoothnath decides to redeem himself and come back to scare a bunch of kids. Bhoothnath's search for kids brings him to Akhrot, a slum kid who is also the only person who can see him. Together they agree to help each other and their friendship sees them get involved in a cause that is bigger than they had ever imagined. To move ahead they will need to take on one of the country's most powerful and corrupt politician Bhau. The Lok Sabha elections are nearing and Bhau's victory is a mere formality, or is it? In a world, where a common man is afraid of politics, will a common man's ghost overcome his fear to stand up for what's right and fight against injustice? Bhoothnath Returns is an entertaining tale of good against evil, weak against powerful, past against future.","scoreDetails":{"value":0.011011904761904763,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":20,"weight":0.5,"value":0.5040557384490967,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":45,"weight":0.5,"value":0.5033937692642212,"details":[]}]}}
   ```

1. Create a file named `auto-embed-query.py`.

2. Copy and paste the MongoDB Vector Search query into the `auto-embed-query.py` file.

   ### Similar Terms, Same Field

   Perform a comprehensive search of the dataset for semantically similar terms to determine which query term returns the best results.

   ```python
   from pymongo import MongoClient

   # Replace the placeholder with your connection string
   uri = "<connectionString>"
   client = MongoClient(uri)

   # Access your database and collection
   collection = client["sample_mflix"]["embedded_movies"]

   pipeline = [
       {
           "$rankFusion": {
               "input": {
                   "pipelines": {
                       "vectorPipeline1": [
                           {
                               "$vectorSearch": {
                                   "index": "multiple-auto-embed-search",
                                   "path": "fullplot",
                                   "query": {"text": "light-hearted comedy with ghosts"},
                                   "numCandidates": 2000,
                                   "limit": 50
                               }
                           }
                       ],
                       "vectorPipeline2": [
                           {
                               "$vectorSearch": {
                                   "index": "multiple-auto-embed-search",
                                   "path": "fullplot",
                                   "query": {"text": "slapstick humor with paranormal events"},
                                   "numCandidates": 2000,
                                   "limit": 50
                               }
                           }
                       ]
                   }
               },
               "combination": {
                   "weights": {
                       "vectorPipeline1": 0.5,
                       "vectorPipeline2": 0.5
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
       {"$limit": 20}
   ]

   results = collection.aggregate(pipeline)
   for doc in results:
       print(doc)

   client.close()

   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `fullplot` field for the phrase *light-hearted comedy with ghosts*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `fullplot` field for the phrase *slapstick humor with paranormal events*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages:

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `fullplot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 20 documents. |

   MongoDB Vector Search merges the results for both queries into a single result set. In the results:

   - The `scoreDetails.value` shows the raw score from that pipeline before it is weighted and combined by using reciprocal rank fusion.

   - The `score.details.rank` shows the rank of the document in the results of the pipeline.

   - The `scoreDetails.details.value` contains the weighted reciprocal rank score.

   You can do the following:

   - Adjust the weights assigned to each pipeline in the query to further refine the results.

   - Increase the number of documents in the results if you see disjoint results.

3. Specify your connection string.

   In the query file, replace the `<connectionString>` placeholder with your connection string.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Run the command to query your collection.

   ### Similar Terms, Same Field

   ```bash
   python auto-embed-query.py
   ```

   **Output:**

   ```json
   {'_id': ObjectId('573a13c6f29313caabd72c06'), 'title': 'Skeletons', 'fullplot': "Two exorcists literally remove the skeletons from the cupboards from people's homes. Some fairly embarrassing secrets are revealed along the way. A case where the skeletons have hidden themselves turns the lives of all those involved.", 'scoreDetails': {'value': 0.015772478887232988, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 6, 'weight': 0.5, 'value': 0.5045768022537231, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 1, 'weight': 0.5, 'value': 0.5040305256843567, 'details': []}]}}
   {'_id': ObjectId('573a13bdf29313caabd58456'), 'title': 'Ghost Town', 'fullplot': 'Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts. Even worse, they all want something from him, particularly Frank Herlihy who pesters him into breaking up the impending marriage of his widow Gwen. That puts Pincus squarely in the middle of a triangle with spirited result.', 'scoreDetails': {'value': 0.01565940787863959, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 1, 'weight': 0.5, 'value': 0.50507652759552, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 7, 'weight': 0.5, 'value': 0.5037906169891357, 'details': []}]}}
   {'_id': ObjectId('573a1398f29313caabce98c8'), 'title': 'Mr. Vampire', 'fullplot': "A ghost sucks the life-force out of a one of Uncle Nine's student. The other is slowly turned into a vampire. They halt his transformation by filing down his teeth! The female ghost throws her head around like a boomerang to protect herself. Can Mr. Vampire chase away the Succubus and the hopping ghost and save his two students?", 'scoreDetails': {'value': 0.01466181506849315, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 13, 'weight': 0.5, 'value': 0.504249095916748, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 4, 'weight': 0.5, 'value': 0.5039034485816956, 'details': []}]}}
   {'_id': ObjectId('573a1398f29313caabce9a71'), 'title': 'The Peanut Butter Solution', 'fullplot': 'Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair back, but too much peanut butter causes things to get a bit hairy.', 'scoreDetails': {'value': 0.014558022622538752, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 17, 'weight': 0.5, 'value': 0.5041646957397461, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 2, 'weight': 0.5, 'value': 0.504012942314148, 'details': []}]}}
   {'_id': ObjectId('573a13a6f29313caabd1787b'), 'title': "Casper's Haunted Christmas", 'fullplot': "Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and sets out to complete his mission. As usual, kindhearted Casper has a ghastky time trying to scare anyone; so The Ghostly Trio, fed up with his goody-boo-shoes behavior, secretly hires Casper's look-alike cousin Spooky to do the job-with hilarious results.", 'scoreDetails': {'value': 0.014297385620915032, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 8, 'weight': 0.5, 'value': 0.5044854879379272, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 12, 'weight': 0.5, 'value': 0.5037259459495544, 'details': []}]}}
   {'_id': ObjectId('573a1393f29313caabcdd652'), 'title': 'Wonder Man', 'fullplot': "Boisterous nightclub entertainer Buzzy Bellew was the witness to a murder committed by gangster Ten Grand Jackson. One night, two of Jackson's thugs kill Buzzy and dump his body in the lake at Prospect Park in Brooklyn. Buzzy comes back as a ghost and summons his bookworm twin, Edwin Dingle, to Prospect Park so that he can help the police nail Jackson.", 'scoreDetails': {'value': 0.014041633935585232, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 7, 'weight': 0.5, 'value': 0.5044862627983093, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 16, 'weight': 0.5, 'value': 0.5036256313323975, 'details': []}]}}
   {'_id': ObjectId('573a1398f29313caabceaf10'), 'title': 'High Spirits', 'fullplot': "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The trouble begins when a busload of American tourists arrive - along with some real ghosts. Among the tourists are married couple Jack and Sharon. Sharon's father holds the mortgage on Castle Plunkett, so she's hoping to debunk the ghosts. Jack, on the other hand, after meeting pretty ghost Mary, is very eager to believe. Can there be love between a human and ghost? Jack and Mary are going to try and find out.", 'scoreDetails': {'value': 0.013946869070208728, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 2, 'weight': 0.5, 'value': 0.5049547553062439, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 25, 'weight': 0.5, 'value': 0.5035316944122314, 'details': []}]}}
   {'_id': ObjectId('573a1399f29313caabcec5c4'), 'title': 'And You Thought Your Parents Were Weird', 'fullplot': "Two boys follow in their late father's footsteps by inventing weird and wonderful gadgets. Trouble lies ahead when, after a Halloween party, the spirit of their father ends up in the latest invention, a robot.", 'scoreDetails': {'value': 0.013763197586726998, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 18, 'weight': 0.5, 'value': 0.5041317939758301, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 8, 'weight': 0.5, 'value': 0.5037808418273926, 'details': []}]}}
   {'_id': ObjectId('573a13daf29313caabdab644'), 'title': 'A Magnificent Haunting', 'fullplot': 'The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.', 'scoreDetails': {'value': 0.013575490735644836, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 9, 'weight': 0.5, 'value': 0.5043735504150391, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 19, 'weight': 0.5, 'value': 0.5035990476608276, 'details': []}]}}
   {'_id': ObjectId('573a13dbf29313caabdaea1c'), 'title': 'A Magnificent Haunting', 'fullplot': 'The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.', 'scoreDetails': {'value': 0.013575490735644836, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 9, 'weight': 0.5, 'value': 0.5043735504150391, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 19, 'weight': 0.5, 'value': 0.5035990476608276, 'details': []}]}}
   {'_id': ObjectId('573a13d3f29313caabd96a55'), 'title': 'Ghost Graduation', 'fullplot': '"The Sixth Sense" meets "The Breakfast Club" when a teacher who sees dead people applies for work at a high school haunted by five student poltergeists who died during detention. All his life Modesto has seen dead people walking around like living people and has long accepted the assessment of others that he has a mental problem. Principal Tina Escalonilla turns that around when Modesto describes a detail (known to her) about the school spirits that no others have been able to reveal. With her school poised to be closed due to unrelenting paranormal high jinx, she begs Modesto to stay and see what he can do to ease these spirits into the next life before Founder\'s Day.', 'scoreDetails': {'value': 0.013423423423423425, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 15, 'weight': 0.5, 'value': 0.5041909217834473, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 14, 'weight': 0.5, 'value': 0.5036569833755493, 'details': []}]}}
   {'_id': ObjectId('573a139af29313caabcef0a4'), 'title': 'Casper', 'fullplot': 'Furious that her late father only willed her his gloomy-looking mansion rather than his millions, Carrigan Crittenden is ready to burn the place to the ground when she discovers a map to a treasure hidden in the house. But when she enters the rickety mansion to seek her claim, she is frightened away by a wicked wave of ghosts. Determined to get her hands on this hidden fortune, she hires afterlife therapist Dr. James Harvey to exorcise the ghosts from the mansion. Harvey and his daughter Kat move in, and soon Kat meets Casper, the ghost of a young boy who\'s "the friendliest ghost you know." But not so friendly are Casper\'s uncles--Stretch, Fatso and Stinkie--who are determined to drive all "fleshies" away. Ultimately, it is up to Harvey and Kat to help the ghosts cross over to the other side.', 'scoreDetails': {'value': 0.013312852022529442, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 3, 'weight': 0.5, 'value': 0.5047479271888733, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 33, 'weight': 0.5, 'value': 0.503459095954895, 'details': []}]}}
   {'_id': ObjectId('573a1398f29313caabce912c'), 'title': 'Ghostbusters', 'fullplot': 'Three odd-ball scientists get kicked out of their cushy positions at a university in New York City where they studied the occult. They decide to set up shop in an old firehouse and become Ghostbusters, trapping pesky ghosts, spirits, haunts, and poltergeists for money. They wise-crack their way through the city, and stumble upon a gateway to another dimension, one which will release untold evil upon the city. The Ghostbusters are called on to save the Big Apple.', 'scoreDetails': {'value': 0.012740882306099698, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 31, 'weight': 0.5, 'value': 0.5037020444869995, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 9, 'weight': 0.5, 'value': 0.5037755966186523, 'details': []}]}}
   {'_id': ObjectId('573a13d1f29313caabd8dad0'), 'title': 'Spooky Buddies', 'fullplot': 'The puppies go on a spooky adventure through a haunted mansion.', 'scoreDetails': {'value': 0.01273166800966962, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 25, 'weight': 0.5, 'value': 0.5038601160049438, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 13, 'weight': 0.5, 'value': 0.5036613941192627, 'details': []}]}}
   {'_id': ObjectId('573a1398f29313caabcebb96'), 'title': 'Wicked Stepmother', 'fullplot': "A mother/daughter pair of witches descend on a yuppie family's home and cause havoc, one at a time since they share one body & the other must live in a cat the rest of the time. Now it's up to the family's mother, a private detective and a suspended police officer to try and stop the witches.", 'scoreDetails': {'value': 0.012692307692307694, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 40, 'weight': 0.5, 'value': 0.503515362739563, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 5, 'weight': 0.5, 'value': 0.5038493871688843, 'details': []}]}}
   {'_id': ObjectId('573a13c9f29313caabd7b8f0'), 'title': 'Knights of Badassdom', 'fullplot': 'Live-action role players conjure up a demon from Hell by mistake and they must deal with the consequences.', 'scoreDetails': {'value': 0.012677798392084105, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 38, 'weight': 0.5, 'value': 0.5035541653633118, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 6, 'weight': 0.5, 'value': 0.5038090944290161, 'details': []}]}}
   {'_id': ObjectId('573a13d2f29313caabd933c6'), 'title': 'Sien nui yau wan', 'fullplot': "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets a very beautiful lady who seduces him, but he doesn't know that she is a ghost, usually not leaving any man alive...", 'scoreDetails': {'value': 0.01196509009009009, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 14, 'weight': 0.5, 'value': 0.5041933059692383, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 36, 'weight': 0.5, 'value': 0.5034355521202087, 'details': []}]}}
   {'_id': ObjectId('573a13a2f29313caabd0be52'), 'title': 'The Nine Lives of Tomas Katz', 'fullplot': "The last day of creation. A stranger arrives in London. No one knows who he is or where he has come from. By the time he leaves, the entire universe will have been erased. A black comedy about the Apocalypse, 'The Nine Lives...' presents a unique brand of left-field humour, spiritual beauty and spectral horror.", 'scoreDetails': {'value': 0.011705914567360351, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 28, 'weight': 0.5, 'value': 0.5038424730300903, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 23, 'weight': 0.5, 'value': 0.5035601258277893, 'details': []}]}}
   {'_id': ObjectId('573a13a0f29313caabd056df'), 'title': "Don't Look Under the Bed", 'fullplot': "A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.", 'scoreDetails': {'value': 0.011618589743589744, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 36, 'weight': 0.5, 'value': 0.5035803914070129, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 18, 'weight': 0.5, 'value': 0.5035999417304993, 'details': []}]}}
   {'_id': ObjectId('573a13edf29313caabdd4424'), 'title': 'Bhoothnath Returns', 'fullplot': "Bhoothnath Returns takes Bhoothnath's story forward. As he returns to 'Bhoot World' he is greeted with taunts and condemnation from other ghosts for bringing disrepute to the ghost-community for getting bullied by a kid on Earth. Post the humiliation, Bhoothnath decides to redeem himself and come back to scare a bunch of kids. Bhoothnath's search for kids brings him to Akhrot, a slum kid who is also the only person who can see him. Together they agree to help each other and their friendship sees them get involved in a cause that is bigger than they had ever imagined. To move ahead they will need to take on one of the country's most powerful and corrupt politician Bhau. The Lok Sabha elections are nearing and Bhau's victory is a mere formality, or is it? In a world, where a common man is afraid of politics, will a common man's ghost overcome his fear to stand up for what's right and fight against injustice? Bhoothnath Returns is an entertaining tale of good against evil, weak against powerful, past against future.", 'scoreDetails': {'value': 0.011151960784313726, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 20, 'weight': 0.5, 'value': 0.504052996635437, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 42, 'weight': 0.5, 'value': 0.5033951997756958, 'details': []}]}}
   ```

### Reorder the Results

In this section, you reorder the results of the query by using the `$rerank` stage.

**Run the query**.

Copy and paste to run the following queries:

### Similar Terms, Same Field

```javascript
[
  {
    "$rankFusion": {
      "input": {
        "pipelines": {
          "vectorPipeline1": [
            {
              "$vectorSearch": {
                "index": "multiple-vector-search",
                "path": "plot_embedding_voyage_4_large",
                "queryVector": [-0.012623000890016556,-0.03503970801830292,0.0017070976318791509, /* ...embedding floats truncated by snapshot... */ 0.029163483530282974],
                "numCandidates": 2000,
                "limit": 50
              }
            }
          ],
          "vectorPipeline2": [
            {
              "$vectorSearch": {
                "index": "multiple-vector-search",
                "path": "plot_embedding_voyage_4_large",
                "queryVector": [-0.016024498268961906,-0.01714012771844864,-0.013083292171359062, /* ...embedding floats truncated by snapshot... */ 0.023529643192887306],
                "numCandidates": 2000,
                "limit": 50
              }
            }
          ]
        }
      },
      "combination": {
        "weights": {
          "vectorPipeline1": 0.5,
          "vectorPipeline2": 0.5
        }
      },
      "scoreDetails": true
    }
  },
  {
    "$project": {
      "_id": 1,
      "title": 1,
      "plot": 1,
      "scoreDetails": { "$meta": "scoreDetails" }
    }
  },
  { "$limit": 50 },
  {
    "$rerank": {
      "model": "rerank-2.5",
      "query": { "text": "light-hearted comedy with ghosts" },
      "path": "plot",
      "numDocsToRerank": 50
    }
  },
  {
    "$addFields": {
      "rerankScore": { "$meta": "score" }
    },
  },
  { "$limit": 20 },
  {
    "$project": {
      "_id": 0,
      "title": 1,
      "plot": 1,
      "scoreDetails": 1,
      "rerankScore": 1
    }
  }
]
```

**Output:**

```javascript
{
  "plot": "A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.",
  "title": "Casper",
  "scoreDetails": {
    "value": 0.01639344262295082,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 1,
        "weight": 0.5,
        "value": 0.7525938749313354,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 1,
        "weight": 0.5,
        "value": 0.7365995645523071,
        "details": []
      }
    ]
  },
  "rerankScore": 0.640625
}
{
  "plot": "Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts.",
  "title": "Ghost Town",
  "scoreDetails": {
    "value": 0.006944444444444444,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 12,
        "weight": 0.5,
        "value": 0.692762017250061,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": "NA"
      }
    ]
  },
  "rerankScore": 0.6328125
}
{
  "plot": "Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...",
  "title": "The Peanut Butter Solution",
  "scoreDetails": {
    "value": 0.014928698752228164,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 8,
        "weight": 0.5,
        "value": 0.7015966176986694,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 6,
        "weight": 0.5,
        "value": 0.7112280130386353,
        "details": []
      }
    ]
  },
  "rerankScore": 0.62890625
}
{
  "plot": "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...",
  "title": "High Spirits",
  "scoreDetails": {
    "value": 0.013575490735644836,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 9,
        "weight": 0.5,
        "value": 0.6990464925765991,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 19,
        "weight": 0.5,
        "value": 0.6928690671920776,
        "details": []
      }
    ]
  },
  "rerankScore": 0.59765625
}
{
  "plot": "A teacher with paranormal abilities helps a group of ghosts graduate high school.",
  "title": "Ghost Graduation",
  "scoreDetails": {
    "value": 0.014242424242424244,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 6,
        "weight": 0.5,
        "value": 0.7095351219177246,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 15,
        "weight": 0.5,
        "value": 0.6966710090637207,
        "details": []
      }
    ]
  },
  "rerankScore": 0.57421875
}
{
  "plot": "A couple of recently deceased ghosts contract the services of a \"bio-exorcist\" in order to remove the obnoxious new owners of their house.",
  "title": "Beetlejuice",
  "scoreDetails": {
    "value": 0.015310892940626462,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 2,
        "weight": 0.5,
        "value": 0.7252534627914429,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 9,
        "weight": 0.5,
        "value": 0.7039943933486938,
        "details": []
      }
    ]
  },
  "rerankScore": 0.56640625
}
{
  "plot": "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...",
  "title": "Sien nui yau wan",
  "scoreDetails": {
    "value": 0.01076007326007326,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 24,
        "weight": 0.5,
        "value": 0.6691842079162598,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 44,
        "weight": 0.5,
        "value": 0.6802830696105957,
        "details": []
      }
    ]
  },
  "rerankScore": 0.56640625
}
{
  "plot": "Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy...",
  "title": "Bhoothnath",
  "scoreDetails": {
    "value": 0.01241318161666913,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 7,
        "weight": 0.5,
        "value": 0.7085931301116943,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 41,
        "weight": 0.5,
        "value": 0.6817358732223511,
        "details": []
      }
    ]
  },
  "rerankScore": 0.5625
}
{
  "plot": "Three unemployed parapsychology professors set up shop as a unique ghost removal service.",
  "title": "Ghostbusters",
  "scoreDetails": {
    "value": 0.015749007936507936,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 4,
        "weight": 0.5,
        "value": 0.7139781713485718,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 3,
        "weight": 0.5,
        "value": 0.7172677516937256,
        "details": []
      }
    ]
  },
  "rerankScore": 0.55859375
}
{
  "plot": "While attending his brother's wedding, a serial womanizer is haunted by the ghosts of his past girlfriends.",
  "title": "Ghosts of Girlfriends Past",
  "scoreDetails": {
    "value": 0.007142857142857143,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 10,
        "weight": 0.5,
        "value": 0.6970863342285156,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": "NA"
      }
    ]
  },
  "rerankScore": 0.5546875
}

```

**Run the following query to reorder the results.**

### Similar Terms, Same Field

```shell
db.embedded_movies.aggregate([
  {
    $rankFusion: {
      input: {
        pipelines: {
          vectorPipeline1: [
            {
              "$vectorSearch": {
                "index": "multiple-vector-search",
                "path": "plot_embedding_voyage_4_large",
                "queryVector": COMEDY_INVOLVING_GHOSTS,
                "numCandidates": 2000,
                "limit": 50
              }
            }
          ],
          vectorPipeline2: [
            {
              "$vectorSearch": {
                "index": "multiple-vector-search",
                "path": "plot_embedding_voyage_4_large",
                "queryVector": HUMOR_INVOLVING_PARANORMAL,
                "numCandidates": 2000,
                "limit": 50
              }
            }
          ]
        }
      },
      combination: {
        weights: {
          vectorPipeline1: 0.5,
          vectorPipeline2: 0.5
        }
      },
      "scoreDetails": true
    }
  },
  {
    "$project": {
      _id: 1,
      title: 1,
      plot: 1,
      scoreDetails: {"$meta": "scoreDetails"}
    }
  },
  {
    "$limit": 50
  },
  {
    "$rerank": {
      "model": "rerank-2.5",
      "query": {
        "text": "light-hearted comedy with ghosts"
      },
      "path": "plot",
      "numDocsToRerank": 50
    }
  },
  {
    "$addFields": {
      "rerankScore": { "$meta": "score" }
    }
  },
  {
    "$limit": 20
  },
  {
    "$project": {
      _id: 0,
      title: 1,
      plot: 1,
      scoreDetails: 1,
      rerankScore: 1
    }
  }
]);
```

**Output:**

```javascript
[
  {
    plot: 'A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.',
    title: 'Casper',
    scoreDetails: {
      value: 0.01639344262295082,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 1,
          weight: 0.5,
          value: 0.7525938749313354,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 1,
          weight: 0.5,
          value: 0.7365995645523071,
          details: []
        }
      ]
    },
    rerankScore: 0.640625
  },
  {
    plot: 'Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts.',
    title: 'Ghost Town',
    scoreDetails: {
      value: 0.006944444444444444,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 12,
          weight: 0.5,
          value: 0.692762017250061,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 'NA'
        }
      ]
    },
    rerankScore: 0.6328125
  },
  {
    plot: 'Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...',
    title: 'The Peanut Butter Solution',
    scoreDetails: {
      value: 0.014928698752228164,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 8,
          weight: 0.5,
          value: 0.7015966176986694,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 6,
          weight: 0.5,
          value: 0.7112280130386353,
          details: []
        }
      ]
    },
    rerankScore: 0.62890625
  },
  {
    plot: "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...",
    title: 'High Spirits',
    scoreDetails: {
      value: 0.013575490735644836,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 9,
          weight: 0.5,
          value: 0.6990464925765991,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 19,
          weight: 0.5,
          value: 0.6928690671920776,
          details: []
        }
      ]
    },
    rerankScore: 0.59765625
  },
  {
    plot: 'A teacher with paranormal abilities helps a group of ghosts graduate high school.',
    title: 'Ghost Graduation',
    scoreDetails: {
      value: 0.014242424242424244,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 6,
          weight: 0.5,
          value: 0.7095351219177246,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 15,
          weight: 0.5,
          value: 0.6966710090637207,
          details: []
        }
      ]
    },
    rerankScore: 0.57421875
  },
  {
    plot: 'A couple of recently deceased ghosts contract the services of a "bio-exorcist" in order to remove the obnoxious new owners of their house.',
    title: 'Beetlejuice',
    scoreDetails: {
      value: 0.015310892940626462,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 2,
          weight: 0.5,
          value: 0.7252534627914429,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 9,
          weight: 0.5,
          value: 0.7039943933486938,
          details: []
        }
      ]
    },
    rerankScore: 0.56640625
  },
  {
    plot: "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...",
    title: 'Sien nui yau wan',
    scoreDetails: {
      value: 0.01076007326007326,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 24,
          weight: 0.5,
          value: 0.6691842079162598,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 44,
          weight: 0.5,
          value: 0.6802830696105957,
          details: []
        }
      ]
    },
    rerankScore: 0.56640625
  },
  {
    plot: 'Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy...',
    title: 'Bhoothnath',
    scoreDetails: {
      value: 0.01241318161666913,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 7,
          weight: 0.5,
          value: 0.7085931301116943,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 41,
          weight: 0.5,
          value: 0.6817358732223511,
          details: []
        }
      ]
    },
    rerankScore: 0.5625
  },
  {
    plot: 'Three unemployed parapsychology professors set up shop as a unique ghost removal service.',
    title: 'Ghostbusters',
    scoreDetails: {
      value: 0.015749007936507936,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 4,
          weight: 0.5,
          value: 0.7139781713485718,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 3,
          weight: 0.5,
          value: 0.7172677516937256,
          details: []
        }
      ]
    },
    rerankScore: 0.55859375
  },
  {
    plot: "While attending his brother's wedding, a serial womanizer is haunted by the ghosts of his past girlfriends.",
    title: 'Ghosts of Girlfriends Past',
    scoreDetails: {
      value: 0.007142857142857143,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 10,
          weight: 0.5,
          value: 0.6970863342285156,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 'NA'
        }
      ]
    },
    rerankScore: 0.5546875
  },
  {
    plot: 'The Bowery Boys find themselves in London, in an old mansion complete with a dungeon, an ominous bell tower and the ghost of an old hangman.',
    title: 'Loose in London',
    scoreDetails: {
      value: 0.005555555555555556,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 30,
          weight: 0.5,
          value: 0.6594740152359009,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 'NA'
        }
      ]
    },
    rerankScore: 0.5546875
  },
  {
    plot: 'Adaption of the famous Oscar Wilde tale about a young American girl that helps a British ghost find rest and forgiveness.',
    title: 'The Canterville Ghost',
    scoreDetails: {
      value: 0.007936507936507936,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 3,
          weight: 0.5,
          value: 0.7168216109275818,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 'NA'
        }
      ]
    },
    rerankScore: 0.5390625
  },
  {
    plot: 'Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and ...',
    title: "Casper's Haunted Christmas",
    scoreDetails: {
      value: 0.00625,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 20,
          weight: 0.5,
          value: 0.6839188933372498,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 'NA'
        }
      ]
    },
    rerankScore: 0.5390625
  },
  {
    plot: 'When a shy groom practices his wedding vows in the inadvertent presence of a deceased young woman, she rises from the grave assuming he has married her.',
    title: 'Corpse Bride',
    scoreDetails: {
      value: 0.006024096385542169,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 23,
          weight: 0.5,
          value: 0.6706185340881348,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 'NA'
        }
      ]
    },
    rerankScore: 0.52734375
  },
  {
    plot: 'A comical Gothic horror-movie-type family tries to rescue their beloved uncle from his gold-digging new love.',
    title: 'Addams Family Values',
    scoreDetails: {
      value: 0.01324561403508772,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 15,
          weight: 0.5,
          value: 0.6893779039382935,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 16,
          weight: 0.5,
          value: 0.6955952048301697,
          details: []
        }
      ]
    },
    rerankScore: 0.5078125
  },
  {
    plot: "A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.",
    title: "Don't Look Under the Bed",
    scoreDetails: {
      value: 0.011027208438211674,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 43,
          weight: 0.5,
          value: 0.64458167552948,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 21,
          weight: 0.5,
          value: 0.6895512342453003,
          details: []
        }
      ]
    },
    rerankScore: 0.50390625
  },
  {
    plot: 'Elderly Scott kills himself after a heart attack wrecks his body, but then comes back as a ghost and convinces his loving young hot wife Kate to pick and kill a young man in order for Scott to possess his body and be with her again.',
    title: "Ghosts Can't Do It",
    scoreDetails: {
      value: 0.006172839506172839,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 21,
          weight: 0.5,
          value: 0.6802194714546204,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 'NA'
        }
      ]
    },
    rerankScore: 0.49609375
  },
  {
    plot: '14-year-old Lulu moves to a small provincial town with her mother and younger brother. One night, her brother is struck by a beam of white light - actually the spirit of Herman Hartmann ...',
    title: 'Island of Lost Souls',
    scoreDetails: {
      value: 0.013428262436914203,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 16,
          weight: 0.5,
          value: 0.6884604692459106,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 13,
          weight: 0.5,
          value: 0.6971145868301392,
          details: []
        }
      ]
    },
    rerankScore: 0.494140625
  },
  {
    plot: 'A realtor and his wife and children are summoned to a mansion, which they soon discover is haunted, and while they attempt to escape, he learns an important lesson about the family he has neglected.',
    title: 'The Haunted Mansion',
    scoreDetails: {
      value: 0.005813953488372093,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 26,
          weight: 0.5,
          value: 0.66486656665802,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 'NA'
        }
      ]
    },
    rerankScore: 0.4765625
  },
  {
    plot: 'A lonely landscape architect falls for the spirit of the beautiful woman who used to live in his new apartment.',
    title: 'Just Like Heaven',
    scoreDetails: {
      value: 0.006329113924050633,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 19,
          weight: 0.5,
          value: 0.6871809959411621,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 'NA'
        }
      ]
    },
    rerankScore: 0.462890625
  }
]

```

This sample query uses the `$rankFusion` with the following input pipeline stages:

| [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `plot_embedding_voyage_4_large` field for the phrase *light-hearted comedy with ghosts*, specified in the `queryVector` field of the query as vector embeddings by using the `COMEDY_INVOLVING_GHOSTS` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
| --- | --- |
| [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `plot_embedding_voyage_4_large` field for the phrase *slapstick humor with paranormal events*, specified in the `queryVector` field as vector embeddings by using the `HUMOR_INVOLVING_PARANORMAL` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

The sample query also specifies the following pipeline stages.

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `plot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 50 documents. |

MongoDB Vector Search merges the results for both the queries into a single result set. It then reorders the results by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage. The `$rerank` stage reorders the results by relevance to the query term `light-hearted comedy
        with ghosts`. In the results, the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage adds a field named `rerankScore` that shows the score after reordering. The reordered results are more relevant to the query term.

1. Modify the `vector-query.go` file and save the file.

   Copy and paste the highlighted code to your query.

   ### Similar Terms, Same Field

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"

   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	// Replace the placeholder with your connection string
   	const uri = "<connectionString>"

   	client, err := mongo.Connect(options.Client().ApplyURI(uri))
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	coll := client.Database("sample_mflix").Collection("embedded_movies")

   	// Query vector for "light-hearted comedy with ghosts"
   	COMEDY_INVOLVING_GHOSTS := []float64{-0.012623000890016556,-0.03503970801830292,0.0017070976318791509, /* ...embedding floats truncated by snapshot... */ 0.029163483530282974}

   	// Query vector for "light-hearted comedy with ghosts"
   	HUMOR_INVOLVING_PARANORMAL := []float64{-0.016024498268961906,-0.01714012771844864,-0.013083292171359062, /* ...embedding floats truncated by snapshot... */ 0.023529643192887306}

   	pipeline := mongo.Pipeline{
   		bson.D{{Key: "$rankFusion", Value: bson.D{
   			{Key: "input", Value: bson.D{
   				{Key: "pipelines", Value: bson.D{
   					{Key: "vectorPipeline1", Value: bson.A{
   						bson.D{{Key: "$vectorSearch", Value: bson.D{
   							{Key: "index", Value: "multiple-vector-search"},
   							{Key: "path", Value: "plot_embedding_voyage_4_large"},
   							{Key: "queryVector", Value: COMEDY_INVOLVING_GHOSTS},
   							{Key: "numCandidates", Value: 2000},
   							{Key: "limit", Value: 50},
   						}}},
   					}},
   					{Key: "vectorPipeline2", Value: bson.A{
   						bson.D{{Key: "$vectorSearch", Value: bson.D{
   							{Key: "index", Value: "multiple-vector-search"},
   							{Key: "path", Value: "plot_embedding_voyage_4_large"},
   							{Key: "queryVector", Value: HUMOR_INVOLVING_PARANORMAL},
   							{Key: "numCandidates", Value: 2000},
   							{Key: "limit", Value: 50},
   						}}},
   					}},
   				}},
   			}},
   			{Key: "combination", Value: bson.D{
   				{Key: "weights", Value: bson.D{
   					{Key: "vectorPipeline1", Value: 0.5},
   					{Key: "vectorPipeline2", Value: 0.5},
   				}},
   			}},
   			{Key: "scoreDetails", Value: true},
   		}}},
   		bson.D{{Key: "$project", Value: bson.D{
   			{Key: "_id", Value: 1},
   			{Key: "title", Value: 1},
   			{Key: "plot", Value: 1},
   			{Key: "scoreDetails", Value: bson.D{{Key: "$meta", Value: "scoreDetails"}}},
   		}}},
   		bson.D{{Key: "$limit", Value: 50}},
   		bson.D{{Key: "$rerank", Value: bson.D{
   			{Key: "model", Value: "rerank-2.5"},
   			{Key: "query", Value: bson.D{{Key: "text", Value: "light-hearted comedy with ghosts"}}},
   			{Key: "path", Value: "plot"},
   			{Key: "numDocsToRerank", Value: 50},
   		}}},
   		bson.D{{Key: "$addFields", Value: bson.D{
   			{Key: "rerankScore", Value: bson.D{{Key: "$meta", Value: "score"}}},
   		}}},
   		bson.D{{Key: "$limit", Value: 20}},
   		bson.D{{Key: "$project", Value: bson.D{
   			{Key: "_id", Value: 0},
   			{Key: "title", Value: 1},
   			{Key: "plot", Value: 1},
   			{Key: "scoreDetails", Value: 1},
   			{Key: "rerankScore", Value: 1},
   		}}},
   	}

   	cursor, err := coll.Aggregate(ctx, pipeline)
   	if err != nil {
   		log.Fatalf("failed to run aggregation: %v", err)
   	}
   	defer cursor.Close(ctx)

   	var results []bson.M
   	if err := cursor.All(ctx, &results); err != nil {
   		log.Fatalf("failed to decode results: %v", err)
   	}
   	for _, doc := range results {
   		fmt.Println(doc)
   	}
   }

   ```

   This sample query uses the `$rankFusion` with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `plot_embedding_voyage_4_large` field for the phrase *light-hearted comedy with ghosts*, specified in the `queryVector` field of the query as vector embeddings by using the `COMEDY_INVOLVING_GHOSTS` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `plot_embedding_voyage_4_large` field for the phrase *slapstick humor with paranormal events*, specified in the `queryVector` field as vector embeddings by using the `HUMOR_INVOLVING_PARANORMAL` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `plot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 50 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. It then reorders the results by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage. The `$rerank` stage reorders the results by relevance to the query term `light-hearted comedy
               with ghosts`. In the results, the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage adds a field named `rerankScore` that shows the score after reordering. The reordered results are more relevant to the query term.

2. Save the file.

3. Reorder the results of your query.

   To reorder, rerun the query:

   ### Similar Terms, Same Field

   ```bash
   go run vector-query.go
   ```

   **Output:**

   ```javascript
   {"plot":"A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.","title":"Casper","scoreDetails":{"value":{"$numberDouble":"0.01639344262295082"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"1"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7525938749313354"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"1"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7365995645523071"},"details":[]}]},"rerankScore":{"$numberDouble":"0.640625"}}
   {"plot":"Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts.","title":"Ghost Town","scoreDetails":{"value":{"$numberDouble":"0.006944444444444444"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"12"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.692762017250061"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.6328125"}}
   {"plot":"Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...","title":"The Peanut Butter Solution","scoreDetails":{"value":{"$numberDouble":"0.014928698752228164"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"8"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7015966176986694"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"6"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7112280130386353"},"details":[]}]},"rerankScore":{"$numberDouble":"0.62890625"}}
   {"plot":"When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...","title":"High Spirits","scoreDetails":{"value":{"$numberDouble":"0.013575490735644836"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"9"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6990464925765991"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"19"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6928690671920776"},"details":[]}]},"rerankScore":{"$numberDouble":"0.59765625"}}
   {"plot":"A teacher with paranormal abilities helps a group of ghosts graduate high school.","title":"Ghost Graduation","scoreDetails":{"value":{"$numberDouble":"0.014242424242424244"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"6"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7095351219177246"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"15"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6966710090637207"},"details":[]}]},"rerankScore":{"$numberDouble":"0.57421875"}}
   {"plot":"A couple of recently deceased ghosts contract the services of a \"bio-exorcist\" in order to remove the obnoxious new owners of their house.","title":"Beetlejuice","scoreDetails":{"value":{"$numberDouble":"0.015310892940626462"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"2"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7252534627914429"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"9"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7039943933486938"},"details":[]}]},"rerankScore":{"$numberDouble":"0.56640625"}}
   {"plot":"Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...","title":"Sien nui yau wan","scoreDetails":{"value":{"$numberDouble":"0.01076007326007326"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"24"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6691842079162598"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"44"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6802830696105957"},"details":[]}]},"rerankScore":{"$numberDouble":"0.56640625"}}
   {"plot":"Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy...","title":"Bhoothnath","scoreDetails":{"value":{"$numberDouble":"0.01241318161666913"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"7"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7085931301116943"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"41"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6817358732223511"},"details":[]}]},"rerankScore":{"$numberDouble":"0.5625"}}
   {"plot":"Three unemployed parapsychology professors set up shop as a unique ghost removal service.","title":"Ghostbusters","scoreDetails":{"value":{"$numberDouble":"0.015749007936507936"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"4"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7139781713485718"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"3"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7172677516937256"},"details":[]}]},"rerankScore":{"$numberDouble":"0.55859375"}}
   {"plot":"While attending his brother's wedding, a serial womanizer is haunted by the ghosts of his past girlfriends.","title":"Ghosts of Girlfriends Past","scoreDetails":{"value":{"$numberDouble":"0.007142857142857143"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"10"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6970863342285156"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.5546875"}}
   {"plot":"The Bowery Boys find themselves in London, in an old mansion complete with a dungeon, an ominous bell tower and the ghost of an old hangman.","title":"Loose in London","scoreDetails":{"value":{"$numberDouble":"0.005555555555555556"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"30"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6594740152359009"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.5546875"}}
   {"plot":"Adaption of the famous Oscar Wilde tale about a young American girl that helps a British ghost find rest and forgiveness.","title":"The Canterville Ghost","scoreDetails":{"value":{"$numberDouble":"0.007936507936507936"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"3"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.7168216109275818"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.5390625"}}
   {"plot":"Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and ...","title":"Casper's Haunted Christmas","scoreDetails":{"value":{"$numberDouble":"0.00625"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"20"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6839188933372498"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.5390625"}}
   {"plot":"When a shy groom practices his wedding vows in the inadvertent presence of a deceased young woman, she rises from the grave assuming he has married her.","title":"Corpse Bride","scoreDetails":{"value":{"$numberDouble":"0.006024096385542169"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"23"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6706185340881348"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.52734375"}}
   {"plot":"A comical Gothic horror-movie-type family tries to rescue their beloved uncle from his gold-digging new love.","title":"Addams Family Values","scoreDetails":{"value":{"$numberDouble":"0.01324561403508772"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"15"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6893779039382935"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"16"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6955952048301697"},"details":[]}]},"rerankScore":{"$numberDouble":"0.5078125"}}
   {"plot":"A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.","title":"Don't Look Under the Bed","scoreDetails":{"value":{"$numberDouble":"0.011027208438211674"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"43"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.64458167552948"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"21"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6895512342453003"},"details":[]}]},"rerankScore":{"$numberDouble":"0.50390625"}}
   {"plot":"Elderly Scott kills himself after a heart attack wrecks his body, but then comes back as a ghost and convinces his loving young hot wife Kate to pick and kill a young man in order for Scott to possess his body and be with her again.","title":"Ghosts Can't Do It","scoreDetails":{"value":{"$numberDouble":"0.006172839506172839"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"21"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6802194714546204"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.49609375"}}
   {"plot":"14-year-old Lulu moves to a small provincial town with her mother and younger brother. One night, her brother is struck by a beam of white light - actually the spirit of Herman Hartmann ...","title":"Island of Lost Souls","scoreDetails":{"value":{"$numberDouble":"0.013428262436914203"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"16"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6884604692459106"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"13"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6971145868301392"},"details":[]}]},"rerankScore":{"$numberDouble":"0.494140625"}}
   {"plot":"A realtor and his wife and children are summoned to a mansion, which they soon discover is haunted, and while they attempt to escape, he learns an important lesson about the family he has neglected.","title":"The Haunted Mansion","scoreDetails":{"value":{"$numberDouble":"0.005813953488372093"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"26"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.66486656665802"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.4765625"}}
   {"plot":"A lonely landscape architect falls for the spirit of the beautiful woman who used to live in his new apartment.","title":"Just Like Heaven","scoreDetails":{"value":{"$numberDouble":"0.006329113924050633"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"19"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.6871809959411621"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.462890625"}}

   ```

1) Modify your query file to add the reranking stages.

   Copy and paste the highlighted code into your query file.

   ### Similar Terms, Same Field

   ```java
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import org.bson.Document;

   import java.util.Arrays;
   import java.util.List;

   public class VectorQuery {

       public static void main(String[] args) {

           // Replace the placeholder with your connection string
           String uri = "<connectionString>";

           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_mflix");
               MongoCollection<Document> collection = database.getCollection("embedded_movies");

               // Query vector for "light-hearted comedy with ghosts"
               List<Double> queryVector1 = Arrays.asList(-0.012623000890016556,-0.03503970801830292,0.0017070976318791509, /* ...embedding floats truncated by snapshot... */ 0.029163483530282974);

               // Query vector for "light-hearted comedy with ghosts"
               List<Double> queryVector2 = Arrays.asList(-0.016024498268961906,-0.01714012771844864,-0.013083292171359062, /* ...embedding floats truncated by snapshot... */ 0.023529643192887306);

               List<Document> pipeline = Arrays.asList(
                   new Document("$rankFusion", new Document()
                       .append("input", new Document("pipelines", new Document()
                           .append("vectorPipeline1", Arrays.asList(
                               new Document("$vectorSearch", new Document()
                                   .append("index", "multiple-vector-search")
                                   .append("path", "plot_embedding_voyage_4_large")
                                   .append("queryVector", queryVector1)
                                   .append("numCandidates", 2000)
                                   .append("limit", 50))))
                           .append("vectorPipeline2", Arrays.asList(
                               new Document("$vectorSearch", new Document()
                                   .append("index", "multiple-vector-search")
                                   .append("path", "plot_embedding_voyage_4_large")
                                   .append("queryVector", queryVector2)
                                   .append("numCandidates", 2000)
                                   .append("limit", 50))))))
                       .append("combination", new Document("weights", new Document()
                           .append("vectorPipeline1", 0.5)
                           .append("vectorPipeline2", 0.5)))
                       .append("scoreDetails", true)),
                   new Document("$project", new Document()
                       .append("_id", 1)
                       .append("title", 1)
                       .append("fullplot", 1)
                       .append("scoreDetails", new Document("$meta", "scoreDetails"))),
                   new Document("$limit", 50),
                   new Document("$match", new Document("fullplot",
                       new Document("$exists", true).append("$type", "string"))),
                   new Document("$rerank", new Document()
                       .append("model", "rerank-2.5")
                       .append("query", new Document("text", "light-hearted comedy with ghosts"))
                       .append("path", "fullplot")
                       .append("numDocsToRerank", 50)),
                   new Document("$addFields", new Document("rerankScore",
                       new Document("$meta", "score"))),
                   new Document("$limit", 20),
                   new Document("$project", new Document()
                       .append("_id", 0)
                       .append("title", 1)
                       .append("plot", 1)
                       .append("scoreDetails", 1)
                       .append("rerankScore", 1))
               );

               collection.aggregate(pipeline).forEach(doc -> System.out.println(doc.toJson()));
           }
       }
   }

   ```

   This sample query uses the `$rankFusion` with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `plot_embedding_voyage_4_large` field for the phrase *light-hearted comedy with ghosts*, specified in the `queryVector` field of the query as vector embeddings by using the `COMEDY_INVOLVING_GHOSTS` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `plot_embedding_voyage_4_large` field for the phrase *slapstick humor with paranormal events*, specified in the `queryVector` field as vector embeddings by using the `HUMOR_INVOLVING_PARANORMAL` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `plot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 50 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. It then reorders the results by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage. The `$rerank` stage reorders the results by relevance to the query term `light-hearted comedy
               with ghosts`. In the results, the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage adds a field named `rerankScore` that shows the score after reordering. The reordered results are more relevant to the query term.

2) Save the file.

3) Reorder the results of your query.

   To reorder the results, recompile and rerun the query:

   ### Similar Terms, Same Field

   ```bash
   javac VectorQuery.java
   java VectorQuery
   ```

   **Output:**

   ```javascript
   {"plot": "A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.", "title": "Casper", "scoreDetails": {"value": 0.01639344262295082, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 1, "weight": 0.5, "value": 0.7525938749313354, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 1, "weight": 0.5, "value": 0.7365995645523071, "details": []}]}, "rerankScore": 0.640625}
   {"plot": "Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts.", "title": "Ghost Town", "scoreDetails": {"value": 0.006944444444444444, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 12, "weight": 0.5, "value": 0.692762017250061, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.6328125}
   {"plot": "Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...", "title": "The Peanut Butter Solution", "scoreDetails": {"value": 0.014928698752228164, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 8, "weight": 0.5, "value": 0.7015966176986694, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 6, "weight": 0.5, "value": 0.7112280130386353, "details": []}]}, "rerankScore": 0.62890625}
   {"plot": "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...", "title": "High Spirits", "scoreDetails": {"value": 0.013575490735644836, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 9, "weight": 0.5, "value": 0.6990464925765991, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 19, "weight": 0.5, "value": 0.6928690671920776, "details": []}]}, "rerankScore": 0.59765625}
   {"plot": "A teacher with paranormal abilities helps a group of ghosts graduate high school.", "title": "Ghost Graduation", "scoreDetails": {"value": 0.014242424242424244, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 6, "weight": 0.5, "value": 0.7095351219177246, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 15, "weight": 0.5, "value": 0.6966710090637207, "details": []}]}, "rerankScore": 0.57421875}
   {"plot": "A couple of recently deceased ghosts contract the services of a \"bio-exorcist\" in order to remove the obnoxious new owners of their house.", "title": "Beetlejuice", "scoreDetails": {"value": 0.015310892940626462, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 2, "weight": 0.5, "value": 0.7252534627914429, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 9, "weight": 0.5, "value": 0.7039943933486938, "details": []}]}, "rerankScore": 0.56640625}
   {"plot": "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...", "title": "Sien nui yau wan", "scoreDetails": {"value": 0.01076007326007326, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 24, "weight": 0.5, "value": 0.6691842079162598, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 44, "weight": 0.5, "value": 0.6802830696105957, "details": []}]}, "rerankScore": 0.56640625}
   {"plot": "Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy...", "title": "Bhoothnath", "scoreDetails": {"value": 0.01241318161666913, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 7, "weight": 0.5, "value": 0.7085931301116943, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 41, "weight": 0.5, "value": 0.6817358732223511, "details": []}]}, "rerankScore": 0.5625}
   {"plot": "Three unemployed parapsychology professors set up shop as a unique ghost removal service.", "title": "Ghostbusters", "scoreDetails": {"value": 0.015749007936507936, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 4, "weight": 0.5, "value": 0.7139781713485718, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 3, "weight": 0.5, "value": 0.7172677516937256, "details": []}]}, "rerankScore": 0.55859375}
   {"plot": "While attending his brother's wedding, a serial womanizer is haunted by the ghosts of his past girlfriends.", "title": "Ghosts of Girlfriends Past", "scoreDetails": {"value": 0.007142857142857143, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 10, "weight": 0.5, "value": 0.6970863342285156, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.5546875}
   {"plot": "The Bowery Boys find themselves in London, in an old mansion complete with a dungeon, an ominous bell tower and the ghost of an old hangman.", "title": "Loose in London", "scoreDetails": {"value": 0.005555555555555556, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 30, "weight": 0.5, "value": 0.6594740152359009, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.5546875}
   {"plot": "Adaption of the famous Oscar Wilde tale about a young American girl that helps a British ghost find rest and forgiveness.", "title": "The Canterville Ghost", "scoreDetails": {"value": 0.007936507936507936, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 3, "weight": 0.5, "value": 0.7168216109275818, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.5390625}
   {"plot": "Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and ...", "title": "Casper's Haunted Christmas", "scoreDetails": {"value": 0.00625, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 20, "weight": 0.5, "value": 0.6839188933372498, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.5390625}
   {"plot": "When a shy groom practices his wedding vows in the inadvertent presence of a deceased young woman, she rises from the grave assuming he has married her.", "title": "Corpse Bride", "scoreDetails": {"value": 0.006024096385542169, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 23, "weight": 0.5, "value": 0.6706185340881348, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.52734375}
   {"plot": "A comical Gothic horror-movie-type family tries to rescue their beloved uncle from his gold-digging new love.", "title": "Addams Family Values", "scoreDetails": {"value": 0.01324561403508772, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 15, "weight": 0.5, "value": 0.6893779039382935, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 16, "weight": 0.5, "value": 0.6955952048301697, "details": []}]}, "rerankScore": 0.5078125}
   {"plot": "A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.", "title": "Don't Look Under the Bed", "scoreDetails": {"value": 0.011027208438211674, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 43, "weight": 0.5, "value": 0.64458167552948, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 21, "weight": 0.5, "value": 0.6895512342453003, "details": []}]}, "rerankScore": 0.50390625}
   {"plot": "Elderly Scott kills himself after a heart attack wrecks his body, but then comes back as a ghost and convinces his loving young hot wife Kate to pick and kill a young man in order for Scott to possess his body and be with her again.", "title": "Ghosts Can't Do It", "scoreDetails": {"value": 0.006172839506172839, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 21, "weight": 0.5, "value": 0.6802194714546204, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.49609375}
   {"plot": "14-year-old Lulu moves to a small provincial town with her mother and younger brother. One night, her brother is struck by a beam of white light - actually the spirit of Herman Hartmann ...", "title": "Island of Lost Souls", "scoreDetails": {"value": 0.013428262436914203, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 16, "weight": 0.5, "value": 0.6884604692459106, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 13, "weight": 0.5, "value": 0.6971145868301392, "details": []}]}, "rerankScore": 0.494140625}
   {"plot": "A realtor and his wife and children are summoned to a mansion, which they soon discover is haunted, and while they attempt to escape, he learns an important lesson about the family he has neglected.", "title": "The Haunted Mansion", "scoreDetails": {"value": 0.005813953488372093, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 26, "weight": 0.5, "value": 0.66486656665802, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.4765625}
   {"plot": "A lonely landscape architect falls for the spirit of the beautiful woman who used to live in his new apartment.", "title": "Just Like Heaven", "scoreDetails": {"value": 0.006329113924050633, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 19, "weight": 0.5, "value": 0.6871809959411621, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.462890625}

   ```

1. Modify your query file to add the reranking stages.

   Copy and paste the highlighted code into your query file.

   ### Similar Terms, Same Field

   ```javascript
   const { MongoClient } = require("mongodb");

   // Replace the placeholder with your connection string
   const uri = "<connectionString>";
   const client = new MongoClient(uri);

   async function run() {
     try {
       const collection = client.db("sample_mflix").collection("embedded_movies");

       // Query vector for "light-hearted comedy with ghosts"
       const COMEDY_INVOLVING_GHOSTS = [-0.012623000890016556,-0.03503970801830292,0.0017070976318791509, /* ...embedding floats truncated by snapshot... */ 0.029163483530282974];

       // Query vector for "light-hearted comedy with ghosts"
       const HUMOR_INVOLVING_PARANORMAL = [-0.016024498268961906,-0.01714012771844864,-0.013083292171359062, /* ...embedding floats truncated by snapshot... */ 0.023529643192887306];

       const pipeline = [
         {
           $rankFusion: {
             input: {
               pipelines: {
                 vectorPipeline1: [
                   {
                     $vectorSearch: {
                       index: "multiple-vector-search",
                       path: "plot_embedding_voyage_4_large",
                       queryVector: COMEDY_INVOLVING_GHOSTS,
                       numCandidates: 2000,
                       limit: 50,
                     },
                   },
                 ],
                 vectorPipeline2: [
                   {
                     $vectorSearch: {
                       index: "multiple-vector-search",
                       path: "plot_embedding_voyage_4_large",
                       queryVector: HUMOR_INVOLVING_PARANORMAL,
                       numCandidates: 2000,
                       limit: 50,
                     },
                   },
                 ],
               },
             },
             combination: {
               weights: {
                 vectorPipeline1: 0.5,
                 vectorPipeline2: 0.5,
               },
             },
             scoreDetails: true,
           },
         },
         {
           $project: {
             _id: 1,
             title: 1,
             plot: 1,
             scoreDetails: { $meta: "scoreDetails" },
           },
         },
         { $limit: 50 },
         {
           $rerank: {
             model: "rerank-2.5",
             query: { text: "light-hearted comedy with ghosts" },
             path: "plot",
             numDocsToRerank: 50,
           },
         },
         {
           $addFields: {
             rerankScore: { $meta: "score" },
           },
         },
         { $limit: 20 },
         {
           $project: {
             _id: 0,
             title: 1,
             plot: 1,
             scoreDetails: 1,
             rerankScore: 1,
           },
         },
       ];

       const results = await collection.aggregate(pipeline).toArray();
       results.forEach((doc) => console.log(JSON.stringify(doc)));
     } finally {
       await client.close();
     }
   }

   run().catch(console.dir);

   ```

   This sample query uses the `$rankFusion` with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `plot_embedding_voyage_4_large` field for the phrase *light-hearted comedy with ghosts*, specified in the `queryVector` field of the query as vector embeddings by using the `COMEDY_INVOLVING_GHOSTS` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `plot_embedding_voyage_4_large` field for the phrase *slapstick humor with paranormal events*, specified in the `queryVector` field as vector embeddings by using the `HUMOR_INVOLVING_PARANORMAL` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `plot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 50 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. It then reorders the results by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage. The `$rerank` stage reorders the results by relevance to the query term `light-hearted comedy
               with ghosts`. In the results, the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage adds a field named `rerankScore` that shows the score after reordering. The reordered results are more relevant to the query term.

2. Save the file.

3. Reorder the results of your query.

   To reorder the results, rerun the query:

   ### Similar Terms, Same Field

   ```bash
   node vector-query.js
   ```

   **Output:**

   ```javascript
   {"plot":"A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.","title":"Casper","scoreDetails":{"value":0.01639344262295082,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":1,"weight":0.5,"value":0.7525938749313354,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":1,"weight":0.5,"value":0.7365995645523071,"details":[]}]},"rerankScore":0.640625}
   {"plot":"Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts.","title":"Ghost Town","scoreDetails":{"value":0.006944444444444444,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":12,"weight":0.5,"value":0.692762017250061,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.6328125}
   {"plot":"Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...","title":"The Peanut Butter Solution","scoreDetails":{"value":0.014928698752228164,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":8,"weight":0.5,"value":0.7015966176986694,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":6,"weight":0.5,"value":0.7112280130386353,"details":[]}]},"rerankScore":0.62890625}
   {"plot":"When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...","title":"High Spirits","scoreDetails":{"value":0.013575490735644836,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":9,"weight":0.5,"value":0.6990464925765991,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":19,"weight":0.5,"value":0.6928690671920776,"details":[]}]},"rerankScore":0.59765625}
   {"plot":"A teacher with paranormal abilities helps a group of ghosts graduate high school.","title":"Ghost Graduation","scoreDetails":{"value":0.014242424242424244,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":6,"weight":0.5,"value":0.7095351219177246,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":15,"weight":0.5,"value":0.6966710090637207,"details":[]}]},"rerankScore":0.57421875}
   {"plot":"A couple of recently deceased ghosts contract the services of a \"bio-exorcist\" in order to remove the obnoxious new owners of their house.","title":"Beetlejuice","scoreDetails":{"value":0.015310892940626462,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":2,"weight":0.5,"value":0.7252534627914429,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":9,"weight":0.5,"value":0.7039943933486938,"details":[]}]},"rerankScore":0.56640625}
   {"plot":"Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...","title":"Sien nui yau wan","scoreDetails":{"value":0.01076007326007326,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":24,"weight":0.5,"value":0.6691842079162598,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":44,"weight":0.5,"value":0.6802830696105957,"details":[]}]},"rerankScore":0.56640625}
   {"plot":"Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy...","title":"Bhoothnath","scoreDetails":{"value":0.01241318161666913,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":7,"weight":0.5,"value":0.7085931301116943,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":41,"weight":0.5,"value":0.6817358732223511,"details":[]}]},"rerankScore":0.5625}
   {"plot":"Three unemployed parapsychology professors set up shop as a unique ghost removal service.","title":"Ghostbusters","scoreDetails":{"value":0.015749007936507936,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":4,"weight":0.5,"value":0.7139781713485718,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":3,"weight":0.5,"value":0.7172677516937256,"details":[]}]},"rerankScore":0.55859375}
   {"plot":"While attending his brother's wedding, a serial womanizer is haunted by the ghosts of his past girlfriends.","title":"Ghosts of Girlfriends Past","scoreDetails":{"value":0.007142857142857143,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":10,"weight":0.5,"value":0.6970863342285156,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.5546875}
   {"plot":"The Bowery Boys find themselves in London, in an old mansion complete with a dungeon, an ominous bell tower and the ghost of an old hangman.","title":"Loose in London","scoreDetails":{"value":0.005555555555555556,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":30,"weight":0.5,"value":0.6594740152359009,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.5546875}
   {"plot":"Adaption of the famous Oscar Wilde tale about a young American girl that helps a British ghost find rest and forgiveness.","title":"The Canterville Ghost","scoreDetails":{"value":0.007936507936507936,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":3,"weight":0.5,"value":0.7168216109275818,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.5390625}
   {"plot":"Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and ...","title":"Casper's Haunted Christmas","scoreDetails":{"value":0.00625,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":20,"weight":0.5,"value":0.6839188933372498,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.5390625}
   {"plot":"When a shy groom practices his wedding vows in the inadvertent presence of a deceased young woman, she rises from the grave assuming he has married her.","title":"Corpse Bride","scoreDetails":{"value":0.006024096385542169,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":23,"weight":0.5,"value":0.6706185340881348,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.52734375}
   {"plot":"A comical Gothic horror-movie-type family tries to rescue their beloved uncle from his gold-digging new love.","title":"Addams Family Values","scoreDetails":{"value":0.01324561403508772,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":15,"weight":0.5,"value":0.6893779039382935,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":16,"weight":0.5,"value":0.6955952048301697,"details":[]}]},"rerankScore":0.5078125}
   {"plot":"A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.","title":"Don't Look Under the Bed","scoreDetails":{"value":0.011027208438211674,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":43,"weight":0.5,"value":0.64458167552948,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":21,"weight":0.5,"value":0.6895512342453003,"details":[]}]},"rerankScore":0.50390625}
   {"plot":"Elderly Scott kills himself after a heart attack wrecks his body, but then comes back as a ghost and convinces his loving young hot wife Kate to pick and kill a young man in order for Scott to possess his body and be with her again.","title":"Ghosts Can't Do It","scoreDetails":{"value":0.006172839506172839,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":21,"weight":0.5,"value":0.6802194714546204,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.49609375}
   {"plot":"14-year-old Lulu moves to a small provincial town with her mother and younger brother. One night, her brother is struck by a beam of white light - actually the spirit of Herman Hartmann ...","title":"Island of Lost Souls","scoreDetails":{"value":0.013428262436914203,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":16,"weight":0.5,"value":0.6884604692459106,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":13,"weight":0.5,"value":0.6971145868301392,"details":[]}]},"rerankScore":0.494140625}
   {"plot":"A realtor and his wife and children are summoned to a mansion, which they soon discover is haunted, and while they attempt to escape, he learns an important lesson about the family he has neglected.","title":"The Haunted Mansion","scoreDetails":{"value":0.005813953488372093,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":26,"weight":0.5,"value":0.66486656665802,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.4765625}
   {"plot":"A lonely landscape architect falls for the spirit of the beautiful woman who used to live in his new apartment.","title":"Just Like Heaven","scoreDetails":{"value":0.006329113924050633,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":19,"weight":0.5,"value":0.6871809959411621,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.462890625}

   ```

1) Modify your query file to add the reranking stages.

   Copy and paste the highlighted code into your query file.

   ### Similar Terms, Same Field

   ```python
   from pymongo import MongoClient

   # Replace the placeholder with your connection string
   uri = "<connectionString>"
   client = MongoClient(uri)

   # Access your database and collection
   collection = client["sample_mflix"]["embedded_movies"]

   # Query vector for "light-hearted comedy with ghosts"
   COMEDY_INVOLVING_GHOSTS = [-0.012623000890016556,-0.03503970801830292,0.0017070976318791509, /* ...embedding floats truncated by snapshot... */ 0.029163483530282974]

   # Query vector for "light-hearted comedy with ghosts"
   HUMOR_INVOLVING_PARANORMAL = [-0.016024498268961906,-0.01714012771844864,-0.013083292171359062, /* ...embedding floats truncated by snapshot... */ 0.023529643192887306]

   pipeline = [
       {
           "$rankFusion": {
               "input": {
                   "pipelines": {
                       "vectorPipeline1": [
                           {
                               "$vectorSearch": {
                                   "index": "multiple-vector-search",
                                   "path": "plot_embedding_voyage_4_large",
                                   "queryVector": COMEDY_INVOLVING_GHOSTS,
                                   "numCandidates": 2000,
                                   "limit": 50
                               }
                           }
                       ],
                       "vectorPipeline2": [
                           {
                               "$vectorSearch": {
                                   "index": "multiple-vector-search",
                                   "path": "plot_embedding_voyage_4_large",
                                   "queryVector": HUMOR_INVOLVING_PARANORMAL,
                                   "numCandidates": 2000,
                                   "limit": 50
                               }
                           }
                       ]
                   }
               },
               "combination": {
                   "weights": {
                       "vectorPipeline1": 0.5,
                       "vectorPipeline2": 0.5
                   }
               },
               "scoreDetails": True
           }
       },
       {
           "$project": {
               "_id": 1,
               "title": 1,
               "plot": 1,
               "scoreDetails": {"$meta": "scoreDetails"}
           }
       },
       {"$limit": 50},
       {
           "$rerank": {
               "model": "rerank-2.5",
               "query": {"text": "light-hearted comedy with ghosts"},
               "path": "plot",
               "numDocsToRerank": 50
           }
       },
       {
           "$addFields": {
               "rerankScore": {"$meta": "score"}
           }
       },
       {"$limit": 20},
       {
           "$project": {
               "_id": 0,
               "title": 1,
               "plot": 1,
               "scoreDetails": 1,
               "rerankScore": 1
           }
       }
   ]

   results = collection.aggregate(pipeline)
   for doc in results:
       print(doc)

   client.close()

   ```

   This sample query uses the `$rankFusion` with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `plot_embedding_voyage_4_large` field for the phrase *light-hearted comedy with ghosts*, specified in the `queryVector` field of the query as vector embeddings by using the `COMEDY_INVOLVING_GHOSTS` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `plot_embedding_voyage_4_large` field for the phrase *slapstick humor with paranormal events*, specified in the `queryVector` field as vector embeddings by using the `HUMOR_INVOLVING_PARANORMAL` variable.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `plot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 50 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. It then reorders the results by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage. The `$rerank` stage reorders the results by relevance to the query term `light-hearted comedy
               with ghosts`. In the results, the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage adds a field named `rerankScore` that shows the score after reordering. The reordered results are more relevant to the query term.

2) Save the file.

3) Reorder the results of your query.

   To reorder the results, rerun the query:

   ### Similar Terms, Same Field

   ```bash
   python vector-query.py
   ```

   **Output:**

   ```javascript
   {'plot': 'A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.', 'title': 'Casper', 'scoreDetails': {'value': 0.01639344262295082, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 1, 'weight': 0.5, 'value': 0.7525938749313354, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 1, 'weight': 0.5, 'value': 0.7365995645523071, 'details': []}]}, 'rerankScore': 0.640625}
   {'plot': 'Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts.', 'title': 'Ghost Town', 'scoreDetails': {'value': 0.006944444444444444, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 12, 'weight': 0.5, 'value': 0.692762017250061, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.6328125}
   {'plot': 'Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...', 'title': 'The Peanut Butter Solution', 'scoreDetails': {'value': 0.014928698752228164, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 8, 'weight': 0.5, 'value': 0.7015966176986694, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 6, 'weight': 0.5, 'value': 0.7112280130386353, 'details': []}]}, 'rerankScore': 0.62890625}
   {'plot': "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...", 'title': 'High Spirits', 'scoreDetails': {'value': 0.013575490735644836, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 9, 'weight': 0.5, 'value': 0.6990464925765991, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 19, 'weight': 0.5, 'value': 0.6928690671920776, 'details': []}]}, 'rerankScore': 0.59765625}
   {'plot': 'A teacher with paranormal abilities helps a group of ghosts graduate high school.', 'title': 'Ghost Graduation', 'scoreDetails': {'value': 0.014242424242424244, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 6, 'weight': 0.5, 'value': 0.7095351219177246, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 15, 'weight': 0.5, 'value': 0.6966710090637207, 'details': []}]}, 'rerankScore': 0.57421875}
   {'plot': 'A couple of recently deceased ghosts contract the services of a "bio-exorcist" in order to remove the obnoxious new owners of their house.', 'title': 'Beetlejuice', 'scoreDetails': {'value': 0.015310892940626462, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 2, 'weight': 0.5, 'value': 0.7252534627914429, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 9, 'weight': 0.5, 'value': 0.7039943933486938, 'details': []}]}, 'rerankScore': 0.56640625}
   {'plot': "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...", 'title': 'Sien nui yau wan', 'scoreDetails': {'value': 0.01076007326007326, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 24, 'weight': 0.5, 'value': 0.6691842079162598, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 44, 'weight': 0.5, 'value': 0.6802830696105957, 'details': []}]}, 'rerankScore': 0.56640625}
   {'plot': 'Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy...', 'title': 'Bhoothnath', 'scoreDetails': {'value': 0.01241318161666913, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 7, 'weight': 0.5, 'value': 0.7085931301116943, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 41, 'weight': 0.5, 'value': 0.6817358732223511, 'details': []}]}, 'rerankScore': 0.5625}
   {'plot': 'Three unemployed parapsychology professors set up shop as a unique ghost removal service.', 'title': 'Ghostbusters', 'scoreDetails': {'value': 0.015749007936507936, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 4, 'weight': 0.5, 'value': 0.7139781713485718, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 3, 'weight': 0.5, 'value': 0.7172677516937256, 'details': []}]}, 'rerankScore': 0.55859375}
   {'plot': "While attending his brother's wedding, a serial womanizer is haunted by the ghosts of his past girlfriends.", 'title': 'Ghosts of Girlfriends Past', 'scoreDetails': {'value': 0.007142857142857143, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 10, 'weight': 0.5, 'value': 0.6970863342285156, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.5546875}
   {'plot': 'The Bowery Boys find themselves in London, in an old mansion complete with a dungeon, an ominous bell tower and the ghost of an old hangman.', 'title': 'Loose in London', 'scoreDetails': {'value': 0.005555555555555556, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 30, 'weight': 0.5, 'value': 0.6594740152359009, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.5546875}
   {'plot': 'Adaption of the famous Oscar Wilde tale about a young American girl that helps a British ghost find rest and forgiveness.', 'title': 'The Canterville Ghost', 'scoreDetails': {'value': 0.007936507936507936, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 3, 'weight': 0.5, 'value': 0.7168216109275818, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.5390625}
   {'plot': 'Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and ...', 'title': "Casper's Haunted Christmas", 'scoreDetails': {'value': 0.00625, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 20, 'weight': 0.5, 'value': 0.6839188933372498, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.5390625}
   {'plot': 'When a shy groom practices his wedding vows in the inadvertent presence of a deceased young woman, she rises from the grave assuming he has married her.', 'title': 'Corpse Bride', 'scoreDetails': {'value': 0.006024096385542169, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 23, 'weight': 0.5, 'value': 0.6706185340881348, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.52734375}
   {'plot': 'A comical Gothic horror-movie-type family tries to rescue their beloved uncle from his gold-digging new love.', 'title': 'Addams Family Values', 'scoreDetails': {'value': 0.01324561403508772, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 15, 'weight': 0.5, 'value': 0.6893779039382935, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 16, 'weight': 0.5, 'value': 0.6955952048301697, 'details': []}]}, 'rerankScore': 0.5078125}
   {'plot': "A girl calls on her brother's imaginary friend to banish a mischievous boogeyman who has framed her for his pranks.", 'title': "Don't Look Under the Bed", 'scoreDetails': {'value': 0.011027208438211674, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 43, 'weight': 0.5, 'value': 0.64458167552948, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 21, 'weight': 0.5, 'value': 0.6895512342453003, 'details': []}]}, 'rerankScore': 0.50390625}
   {'plot': 'Elderly Scott kills himself after a heart attack wrecks his body, but then comes back as a ghost and convinces his loving young hot wife Kate to pick and kill a young man in order for Scott to possess his body and be with her again.', 'title': "Ghosts Can't Do It", 'scoreDetails': {'value': 0.006172839506172839, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 21, 'weight': 0.5, 'value': 0.6802194714546204, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.49609375}
   {'plot': '14-year-old Lulu moves to a small provincial town with her mother and younger brother. One night, her brother is struck by a beam of white light - actually the spirit of Herman Hartmann ...', 'title': 'Island of Lost Souls', 'scoreDetails': {'value': 0.013428262436914203, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 16, 'weight': 0.5, 'value': 0.6884604692459106, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 13, 'weight': 0.5, 'value': 0.6971145868301392, 'details': []}]}, 'rerankScore': 0.494140625}
   {'plot': 'A realtor and his wife and children are summoned to a mansion, which they soon discover is haunted, and while they attempt to escape, he learns an important lesson about the family he has neglected.', 'title': 'The Haunted Mansion', 'scoreDetails': {'value': 0.005813953488372093, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 26, 'weight': 0.5, 'value': 0.66486656665802, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.4765625}
   {'plot': 'A lonely landscape architect falls for the spirit of the beautiful woman who used to live in his new apartment.', 'title': 'Just Like Heaven', 'scoreDetails': {'value': 0.006329113924050633, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 19, 'weight': 0.5, 'value': 0.6871809959411621, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.462890625}

   ```

**Run the query to reorder the results**.

Copy and paste to run the following queries:

### Similar Terms, Same Field

```javascript
[
  {
    "$rankFusion": {
      "input": {
        "pipelines": {
          "vectorPipeline1": [
            {
              "$vectorSearch": {
                "index": "multiple-auto-embed-search",
                "path": "fullplot",
                "query": { "text": "light-hearted comedy with ghosts" },
                "numCandidates": 2000,
                "limit": 50
              }
            }
          ],
          "vectorPipeline2": [
            {
              "$vectorSearch": {
                "index": "multiple-auto-embed-search",
                "path": "fullplot",
                "query": { "text": "slapstick humor with paranormal events" },
                "numCandidates": 2000,
                "limit": 50
              }
            }
          ]
        }
      },
      "combination": {
        "weights": {
          "vectorPipeline1": 0.5,
          "vectorPipeline2": 0.5
        },
      },
      "scoreDetails": true
    }
  },
  {
    "$project": {
      "_id": 1,
      "title": 1,
      "fullplot": 1,
      "plot": 1,
      "scoreDetails": { "$meta": "scoreDetails" }
    }
  },
  { "$limit": 50 },
  {
    "$rerank": {
      "model": "rerank-2.5",
      "query": { "text": "light-hearted comedy with ghosts and slapstick humor with paranormal events" },
      "path": "fullplot",
      "numDocsToRerank": 50
    }
  },
  {
    "$addFields": {
      "rerankScore": { "$meta": "score" }
    }
  },
  { "$limit": 20 },
  {
    "$project": {
      "_id": 0,
      "title": 1,
      "fullplot": 1,
      "plot": 1,
      "scoreDetails": 1,
      "rerankScore": 1
    }
  }
]
```

**Output:**

```javascript
{
  "plot": "Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and ...",
  "title": "Casper's Haunted Christmas",
  "fullplot": "Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and sets out to complete his mission. As usual, kindhearted Casper has a ghastky time trying to scare anyone; so The Ghostly Trio, fed up with his goody-boo-shoes behavior, secretly hires Casper's look-alike cousin Spooky to do the job-with hilarious results.",
  "scoreDetails": {
    "value": 0.014297385620915032,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 8,
        "weight": 0.5,
        "value": 0.5044854879379272,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 12,
        "weight": 0.5,
        "value": 0.5037259459495544,
        "details": []
      }
    ]
  },
  "rerankScore": 0.7265625
}
{
  "plot": "A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.",
  "title": "Casper",
  "fullplot": "Furious that her late father only willed her his gloomy-looking mansion rather than his millions, Carrigan Crittenden is ready to burn the place to the ground when she discovers a map to a treasure hidden in the house. But when she enters the rickety mansion to seek her claim, she is frightened away by a wicked wave of ghosts. Determined to get her hands on this hidden fortune, she hires afterlife therapist Dr. James Harvey to exorcise the ghosts from the mansion. Harvey and his daughter Kat move in, and soon Kat meets Casper, the ghost of a young boy who's \"the friendliest ghost you know.\" But not so friendly are Casper's uncles--Stretch, Fatso and Stinkie--who are determined to drive all \"fleshies\" away. Ultimately, it is up to Harvey and Kat to help the ghosts cross over to the other side.",
  "scoreDetails": {
    "value": 0.013312852022529442,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 3,
        "weight": 0.5,
        "value": 0.5047479271888733,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 33,
        "weight": 0.5,
        "value": 0.503459095954895,
        "details": []
      }
    ]
  },
  "rerankScore": 0.69921875
}
{
  "plot": "Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts.",
  "title": "Ghost Town",
  "fullplot": "Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts. Even worse, they all want something from him, particularly Frank Herlihy who pesters him into breaking up the impending marriage of his widow Gwen. That puts Pincus squarely in the middle of a triangle with spirited result.",
  "scoreDetails": {
    "value": 0.01565940787863959,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 1,
        "weight": 0.5,
        "value": 0.50507652759552,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 7,
        "weight": 0.5,
        "value": 0.5037906169891357,
        "details": []
      }
    ]
  },
  "rerankScore": 0.68359375
}
{
  "plot": "Three unemployed parapsychology professors set up shop as a unique ghost removal service.",
  "title": "Ghostbusters",
  "fullplot": "Three odd-ball scientists get kicked out of their cushy positions at a university in New York City where they studied the occult. They decide to set up shop in an old firehouse and become Ghostbusters, trapping pesky ghosts, spirits, haunts, and poltergeists for money. They wise-crack their way through the city, and stumble upon a gateway to another dimension, one which will release untold evil upon the city. The Ghostbusters are called on to save the Big Apple.",
  "scoreDetails": {
    "value": 0.012740882306099698,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 31,
        "weight": 0.5,
        "value": 0.5037020444869995,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 9,
        "weight": 0.5,
        "value": 0.5037755966186523,
        "details": []
      }
    ]
  },
  "rerankScore": 0.64453125
}
{
  "plot": "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...",
  "title": "High Spirits",
  "fullplot": "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The trouble begins when a busload of American tourists arrive - along with some real ghosts. Among the tourists are married couple Jack and Sharon. Sharon's father holds the mortgage on Castle Plunkett, so she's hoping to debunk the ghosts. Jack, on the other hand, after meeting pretty ghost Mary, is very eager to believe. Can there be love between a human and ghost? Jack and Mary are going to try and find out.",
  "scoreDetails": {
    "value": 0.013946869070208728,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 2,
        "weight": 0.5,
        "value": 0.5049547553062439,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 25,
        "weight": 0.5,
        "value": 0.5035316944122314,
        "details": []
      }
    ]
  },
  "rerankScore": 0.64453125
}
{
  "plot": "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...",
  "title": "Sien nui yau wan",
  "fullplot": "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets a very beautiful lady who seduces him, but he doesn't know that she is a ghost, usually not leaving any man alive...",
  "scoreDetails": {
    "value": 0.01196509009009009,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 14,
        "weight": 0.5,
        "value": 0.5041933059692383,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 36,
        "weight": 0.5,
        "value": 0.5034355521202087,
        "details": []
      }
    ]
  },
  "rerankScore": 0.62890625
}
{
  "plot": "Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...",
  "title": "The Peanut Butter Solution",
  "fullplot": "Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair back, but too much peanut butter causes things to get a bit hairy.",
  "scoreDetails": {
    "value": 0.014558022622538752,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 17,
        "weight": 0.5,
        "value": 0.5041541457176208,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 2,
        "weight": 0.5,
        "value": 0.5040101408958435,
        "details": []
      }
    ]
  },
  "rerankScore": 0.609375
}
{
  "plot": "The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to ...",
  "title": "A Magnificent Haunting",
  "fullplot": "The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.",
  "scoreDetails": {
    "value": 0.013575490735644836,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 9,
        "weight": 0.5,
        "value": 0.5043735504150391,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 19,
        "weight": 0.5,
        "value": 0.5035990476608276,
        "details": []
      }
    ]
  },
  "rerankScore": 0.60546875
}
{
  "plot": "The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to ...",
  "title": "A Magnificent Haunting",
  "fullplot": "The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.",
  "scoreDetails": {
    "value": 0.013575490735644836,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 9,
        "weight": 0.5,
        "value": 0.5043735504150391,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 19,
        "weight": 0.5,
        "value": 0.5035990476608276,
        "details": []
      }
    ]
  },
  "rerankScore": 0.60546875
}
{
  "plot": "A teacher with paranormal abilities helps a group of ghosts graduate high school.",
  "title": "Ghost Graduation",
  "fullplot": "\"The Sixth Sense\" meets \"The Breakfast Club\" when a teacher who sees dead people applies for work at a high school haunted by five student poltergeists who died during detention. All his life Modesto has seen dead people walking around like living people and has long accepted the assessment of others that he has a mental problem. Principal Tina Escalonilla turns that around when Modesto describes a detail (known to her) about the school spirits that no others have been able to reveal. With her school poised to be closed due to unrelenting paranormal high jinx, she begs Modesto to stay and see what he can do to ease these spirits into the next life before Founder's Day.",
  "scoreDetails": {
    "value": 0.013423423423423425,
    "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:",
    "details": [
      {
        "inputPipelineName": "vectorPipeline1",
        "rank": 15,
        "weight": 0.5,
        "value": 0.5041909217834473,
        "details": []
      },
      {
        "inputPipelineName": "vectorPipeline2",
        "rank": 14,
        "weight": 0.5,
        "value": 0.5036569833755493,
        "details": []
      }
    ]
  },
  "rerankScore": 0.59765625
}
```

**Run the following query to reorder the results.**

### Similar Terms, Same Field

```shell
db.embedded_movies.aggregate([
  {
    $rankFusion: {
      input: {
        pipelines: {
          vectorPipeline1: [
            {
              "$vectorSearch": {
                "index": "multiple-auto-embed-search",
                "path": "fullplot",
                "query": {
                  "text": "light-hearted comedy with ghosts"
                },
                "numCandidates": 2000,
                "limit": 50
              }
            }
          ],
          vectorPipeline2: [
            {
              "$vectorSearch": {
                "index": "multiple-auto-embed-search",
                "path": "fullplot",
                "query": {
                  "text": "slapstick humor with paranormal events"
                },
                "numCandidates": 2000,
                "limit": 50
              }
            }
          ]
        }
      },
      combination: {
        weights: {
          vectorPipeline1: 0.5,
          vectorPipeline2: 0.5
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
    "$limit": 50
  },
  {
    "$rerank": {
      "model": "rerank-2.5",
      "query": {
        "text": "light-hearted comedy with ghosts and slapstick humor with paranormal events"
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
    "$limit": 20
  },
  {
    "$project": {
      _id: 0,
      title: 1,
      fullplot: 1,
      plot: 1,
      scoreDetails: 1,
      rerankScore: 1
    }
  }
]);
```

**Output:**

```javascript
[
  {
    title: "Casper's Haunted Christmas",
    fullplot: "Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and sets out to complete his mission. As usual, kindhearted Casper has a ghastky time trying to scare anyone; so The Ghostly Trio, fed up with his goody-boo-shoes behavior, secretly hires Casper's look-alike cousin Spooky to do the job-with hilarious results.",
    scoreDetails: {
      value: 0.014297385620915032,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 8,
          weight: 0.5,
          value: 0.5044854879379272,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 12,
          weight: 0.5,
          value: 0.5037259459495544,
          details: []
        }
      ]
    },
    rerankScore: 0.7265625
  },
  {
    title: 'Casper',
    fullplot: `Furious that her late father only willed her his gloomy-looking mansion rather than his millions, Carrigan Crittenden is ready to burn the place to the ground when she discovers a map to a treasure hidden in the house. But when she enters the rickety mansion to seek her claim, she is frightened away by a wicked wave of ghosts. Determined to get her hands on this hidden fortune, she hires afterlife therapist Dr. James Harvey to exorcise the ghosts from the mansion. Harvey and his daughter Kat move in, and soon Kat meets Casper, the ghost of a young boy who's "the friendliest ghost you know." But not so friendly are Casper's uncles--Stretch, Fatso and Stinkie--who are determined to drive all "fleshies" away. Ultimately, it is up to Harvey and Kat to help the ghosts cross over to the other side.`,
    scoreDetails: {
      value: 0.013312852022529442,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 3,
          weight: 0.5,
          value: 0.5047479271888733,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 33,
          weight: 0.5,
          value: 0.503459095954895,
          details: []
        }
      ]
    },
    rerankScore: 0.69921875
  },
  {
    title: 'Ghost Town',
    fullplot: 'Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts. Even worse, they all want something from him, particularly Frank Herlihy who pesters him into breaking up the impending marriage of his widow Gwen. That puts Pincus squarely in the middle of a triangle with spirited result.',
    scoreDetails: {
      value: 0.01565940787863959,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 1,
          weight: 0.5,
          value: 0.50507652759552,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 7,
          weight: 0.5,
          value: 0.5037906169891357,
          details: []
        }
      ]
    },
    rerankScore: 0.68359375
  },
  {
    title: 'Ghostbusters',
    fullplot: 'Three odd-ball scientists get kicked out of their cushy positions at a university in New York City where they studied the occult. They decide to set up shop in an old firehouse and become Ghostbusters, trapping pesky ghosts, spirits, haunts, and poltergeists for money. They wise-crack their way through the city, and stumble upon a gateway to another dimension, one which will release untold evil upon the city. The Ghostbusters are called on to save the Big Apple.',
    scoreDetails: {
      value: 0.012740882306099698,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 31,
          weight: 0.5,
          value: 0.5037020444869995,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 9,
          weight: 0.5,
          value: 0.5037755966186523,
          details: []
        }
      ]
    },
    rerankScore: 0.64453125
  },
  {
    title: 'High Spirits',
    fullplot: "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The trouble begins when a busload of American tourists arrive - along with some real ghosts. Among the tourists are married couple Jack and Sharon. Sharon's father holds the mortgage on Castle Plunkett, so she's hoping to debunk the ghosts. Jack, on the other hand, after meeting pretty ghost Mary, is very eager to believe. Can there be love between a human and ghost? Jack and Mary are going to try and find out.",
    scoreDetails: {
      value: 0.013946869070208728,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 2,
          weight: 0.5,
          value: 0.5049547553062439,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 25,
          weight: 0.5,
          value: 0.5035316944122314,
          details: []
        }
      ]
    },
    rerankScore: 0.64453125
  },
  {
    title: 'Sien nui yau wan',
    fullplot: "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets a very beautiful lady who seduces him, but he doesn't know that she is a ghost, usually not leaving any man alive...",
    scoreDetails: {
      value: 0.01196509009009009,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 14,
          weight: 0.5,
          value: 0.5041933059692383,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 36,
          weight: 0.5,
          value: 0.5034355521202087,
          details: []
        }
      ]
    },
    rerankScore: 0.62890625
  },
  {
    title: 'The Peanut Butter Solution',
    fullplot: 'Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair back, but too much peanut butter causes things to get a bit hairy.',
    scoreDetails: {
      value: 0.014558022622538752,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 17,
          weight: 0.5,
          value: 0.5041646957397461,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 2,
          weight: 0.5,
          value: 0.504012942314148,
          details: []
        }
      ]
    },
    rerankScore: 0.609375
  },
  {
    title: 'A Magnificent Haunting',
    fullplot: 'The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.',
    scoreDetails: {
      value: 0.013575490735644836,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 9,
          weight: 0.5,
          value: 0.5043735504150391,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 19,
          weight: 0.5,
          value: 0.5035990476608276,
          details: []
        }
      ]
    },
    rerankScore: 0.60546875
  },
  {
    title: 'A Magnificent Haunting',
    fullplot: 'The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.',
    scoreDetails: {
      value: 0.013575490735644836,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 9,
          weight: 0.5,
          value: 0.5043735504150391,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 19,
          weight: 0.5,
          value: 0.5035990476608276,
          details: []
        }
      ]
    },
    rerankScore: 0.60546875
  },
  {
    title: 'Ghost Graduation',
    fullplot: `"The Sixth Sense" meets "The Breakfast Club" when a teacher who sees dead people applies for work at a high school haunted by five student poltergeists who died during detention. All his life Modesto has seen dead people walking around like living people and has long accepted the assessment of others that he has a mental problem. Principal Tina Escalonilla turns that around when Modesto describes a detail (known to her) about the school spirits that no others have been able to reveal. With her school poised to be closed due to unrelenting paranormal high jinx, she begs Modesto to stay and see what he can do to ease these spirits into the next life before Founder's Day.`,
    scoreDetails: {
      value: 0.013423423423423425,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 15,
          weight: 0.5,
          value: 0.5041909217834473,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 14,
          weight: 0.5,
          value: 0.5036569833755493,
          details: []
        }
      ]
    },
    rerankScore: 0.59765625
  },
  {
    title: 'Bhoothnath',
    fullplot: 'Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy with his new housemates. But what the ghost is not prepared for is his unlikely friendship with Banku. Now Banku must uncover the reason why his ghostly friend is stuck and help him to attain salvation.',
    scoreDetails: {
      value: 0.0078125,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 4,
          weight: 0.5,
          value: 0.5046243667602539,
          details: []
        },
        { inputPipelineName: 'vectorPipeline2', rank: 'NA' }
      ]
    },
    rerankScore: 0.578125
  },
  {
    title: 'The Canterville Ghost',
    fullplot: "When a teenaged girl moves to England, with her brothers and parents into the ancient Canterville Hall, she's not at all happy. Especially as there's a ghost and a mysterious re-appearing bloodstain on the hearth. She campaigns to go back home, and her dad, believing the ghost's pranks are Ginny's, is ready to send her back. But then Ginny actually meets the elusive 17th-century Sir Simon de Canterville (not to mention the cute teenaged duke next door), and she sets her hand to the task of freeing Sir Simon from his curse.",
    scoreDetails: {
      value: 0.006578947368421052,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 16,
          weight: 0.5,
          value: 0.5041683912277222,
          details: []
        },
        { inputPipelineName: 'vectorPipeline2', rank: 'NA' }
      ]
    },
    rerankScore: 0.578125
  },
  {
    fullplot: 'Adam and Barbara are a normal couple...who happen to be dead. They have given their precious time to decorate the house and make it their own, but unfortunately a family is moving in, and not quietly. Adam and Barbara try to scare them out, but ends up becoming the main attraction to the money making family. They call upon Beetlejuice to help, but Beetlejuice has more in mind than just helping.',
    title: 'Beetlejuice',
    scoreDetails: {
      value: 0.010916269887353384,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 19,
          weight: 0.5,
          value: 0.5041239261627197,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 49,
          weight: 0.5,
          value: 0.5033432245254517,
          details: []
        }
      ]
    },
    rerankScore: 0.57421875
  },
  {
    title: 'Mr. Vampire',
    fullplot: "A ghost sucks the life-force out of a one of Uncle Nine's student. The other is slowly turned into a vampire. They halt his transformation by filing down his teeth! The female ghost throws her head around like a boomerang to protect herself. Can Mr. Vampire chase away the Succubus and the hopping ghost and save his two students?",
    scoreDetails: {
      value: 0.01466181506849315,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 13,
          weight: 0.5,
          value: 0.504249095916748,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 4,
          weight: 0.5,
          value: 0.5039034485816956,
          details: []
        }
      ]
    },
    rerankScore: 0.5703125
  },
  {
    fullplot: "Connor Mead, a successful fashion photographer and a Lothario keen on casual sex, goes to his younger brother's wedding to convince him not to marry. He arrives at his dead uncle's estate during the rehearsal the night before the wedding; he starts in, taking his brother aside, trashing marriage. Later in the men's room, his uncle, who taught Connor all he knows about women, appears to him, confesses to have been wrong, and tells Connor that three ghosts will visit him that night: the ghosts of girlfriends past, present, and future. Connor has already set the breakup in motion. Can he learn anything from his life and fix what he's broken?",
    title: 'Ghosts of Girlfriends Past',
    scoreDetails: {
      value: 0.006172839506172839,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 21,
          weight: 0.5,
          value: 0.5040419697761536,
          details: []
        },
        { inputPipelineName: 'vectorPipeline2', rank: 'NA' }
      ]
    },
    rerankScore: 0.55859375
  },
  {
    title: 'Bhoothnath Returns',
    fullplot: "Bhoothnath Returns takes Bhoothnath's story forward. As he returns to 'Bhoot World' he is greeted with taunts and condemnation from other ghosts for bringing disrepute to the ghost-community for getting bullied by a kid on Earth. Post the humiliation, Bhoothnath decides to redeem himself and come back to scare a bunch of kids. Bhoothnath's search for kids brings him to Akhrot, a slum kid who is also the only person who can see him. Together they agree to help each other and their friendship sees them get involved in a cause that is bigger than they had ever imagined. To move ahead they will need to take on one of the country's most powerful and corrupt politician Bhau. The Lok Sabha elections are nearing and Bhau's victory is a mere formality, or is it? In a world, where a common man is afraid of politics, will a common man's ghost overcome his fear to stand up for what's right and fight against injustice? Bhoothnath Returns is an entertaining tale of good against evil, weak against powerful, past against future.",
    scoreDetails: {
      value: 0.011151960784313726,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 20,
          weight: 0.5,
          value: 0.504052996635437,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 42,
          weight: 0.5,
          value: 0.5033951997756958,
          details: []
        }
      ]
    },
    rerankScore: 0.546875
  },
  {
    title: 'Ghost',
    fullplot: "Sam and Molly are a very happy couple and deeply in love. Walking back to their new apartment after a night out at the theatre, they encounter a thief in a dark alley, and Sam is murdered. He finds himself trapped as a ghost and realises that his death was no accident. He must warn Molly about the danger that she is in. But as a ghost he can not be seen or heard by the living, and so he tries to communicate with Molly through Oda Mae Brown, a psychic who didn't even realise that her powers were real.",
    scoreDetails: {
      value: 0.005747126436781609,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 27,
          weight: 0.5,
          value: 0.5038429498672485,
          details: []
        },
        { inputPipelineName: 'vectorPipeline2', rank: 'NA' }
      ]
    },
    rerankScore: 0.52734375
  },
  {
    title: 'Wonder Man',
    fullplot: "Boisterous nightclub entertainer Buzzy Bellew was the witness to a murder committed by gangster Ten Grand Jackson. One night, two of Jackson's thugs kill Buzzy and dump his body in the lake at Prospect Park in Brooklyn. Buzzy comes back as a ghost and summons his bookworm twin, Edwin Dingle, to Prospect Park so that he can help the police nail Jackson.",
    scoreDetails: {
      value: 0.014041633935585232,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 7,
          weight: 0.5,
          value: 0.5044862627983093,
          details: []
        },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 16,
          weight: 0.5,
          value: 0.5036256313323975,
          details: []
        }
      ]
    },
    rerankScore: 0.51171875
  },
  {
    fullplot: "Five years after the events of the first film, the Ghostbusters have been plagued by lawsuits and court orders, and their once-lucrative business is bankrupt. However, when Dana begins to have ghost problems again, the boys come out of retirement only to be promptly arrested. The Ghostbusters discover that New York is once again headed for supernatural doom, with a river of ectoplasmic slime bubbling beneath the city and an ancient sorcerer attempting to possess Dana's baby and be born anew. Can the Ghostbusters quell the negative emotions feeding the otherworldly threat and stop the world from being slimed?",
    title: 'Ghostbusters II',
    scoreDetails: {
      value: 0.005813953488372093,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        { inputPipelineName: 'vectorPipeline1', rank: 'NA' },
        {
          inputPipelineName: 'vectorPipeline2',
          rank: 26,
          weight: 0.5,
          value: 0.5035310983657837,
          details: []
        }
      ]
    },
    rerankScore: 0.50390625
  },
  {
    title: "Ghosts Can't Do It",
    fullplot: "Scott and Kate are married and very much in love with each other. Scott is more than 60 years old, while Kate is at least thirty years younger. When Scott dies, his soul cannot get peace and he becomes a ghost only Kate can see and speak with. Scott wants to return to life, and him and Kate hatch a plan to let a young man drown so that Scott can take over his body. Also, Kate must handle Scott's company's business deal that involves Donald Trump as well as the mob.",
    scoreDetails: {
      value: 0.007692307692307693,
      description: 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:',
      details: [
        {
          inputPipelineName: 'vectorPipeline1',
          rank: 5,
          weight: 0.5,
          value: 0.504621148109436,
          details: []
        },
        { inputPipelineName: 'vectorPipeline2', rank: 'NA' }
      ]
    },
    rerankScore: 0.494140625
  }
]
```

This sample query uses the `$rankFusion` stage with the following input pipeline stages:

| [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `fullplot` field for the phrase *light-hearted comedy with ghosts*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
| --- | --- |
| [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `fullplot` field for the phrase *slapstick humor with paranormal events*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

The sample query also specifies the following pipeline stages.

| [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `fullplot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
| --- | --- |
| [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 50 documents. |

MongoDB Vector Search merges the results for both the queries into a single result set. It then reorders the results by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage. The `$rerank` stage reorders the results by relevance to the query term `light-hearted comedy
        with ghosts`. In the results, the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage adds a field named `rerankScore` that shows the score after reordering. The reordered results are more relevant to the query term.

1. Modify the `auto-embed-query.go` file to add the reranking stages.

   Copy and paste the highlighted code into your query file.

   ### Similar Terms, Same Field

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"

   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	// Replace the placeholder with your connection string
   	const uri = "<connectionString>"

   	client, err := mongo.Connect(options.Client().ApplyURI(uri))
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	coll := client.Database("sample_mflix").Collection("embedded_movies")

   	pipeline := mongo.Pipeline{
   		bson.D{{Key: "$rankFusion", Value: bson.D{
   			{Key: "input", Value: bson.D{
   				{Key: "pipelines", Value: bson.D{
   					{Key: "vectorPipeline1", Value: bson.A{
   						bson.D{{Key: "$vectorSearch", Value: bson.D{
   							{Key: "index", Value: "multiple-auto-embed-search"},
   							{Key: "path", Value: "fullplot"},
   							{Key: "query", Value: bson.D{{Key: "text", Value: "light-hearted comedy with ghosts"}}},
   							{Key: "numCandidates", Value: 2000},
   							{Key: "limit", Value: 50},
   						}}},
   					}},
   					{Key: "vectorPipeline2", Value: bson.A{
   						bson.D{{Key: "$vectorSearch", Value: bson.D{
   							{Key: "index", Value: "multiple-auto-embed-search"},
   							{Key: "path", Value: "fullplot"},
   							{Key: "query", Value: bson.D{{Key: "text", Value: "slapstick humor with paranormal events"}}},
   							{Key: "numCandidates", Value: 2000},
   							{Key: "limit", Value: 50},
   						}}},
   					}},
   				}},
   			}},
   			{Key: "combination", Value: bson.D{
   				{Key: "weights", Value: bson.D{
   					{Key: "vectorPipeline1", Value: 0.5},
   					{Key: "vectorPipeline2", Value: 0.5},
   				}},
   			}},
   			{Key: "scoreDetails", Value: true},
   		}}},
   		bson.D{{Key: "$project", Value: bson.D{
   			{Key: "_id", Value: 1},
   			{Key: "title", Value: 1},
   			{Key: "fullplot", Value: 1},
   			{Key: "scoreDetails", Value: bson.D{{Key: "$meta", Value: "scoreDetails"}}},
   		}}},
   		bson.D{{Key: "$limit", Value: 50}},
   		bson.D{{Key: "$rerank", Value: bson.D{
   			{Key: "model", Value: "rerank-2.5"},
   			{Key: "query", Value: bson.D{{Key: "text", Value: "light-hearted comedy with ghosts and slapstick humor with paranormal events"}}},
   			{Key: "path", Value: "fullplot"},
   			{Key: "numDocsToRerank", Value: 50},
   		}}},
   		bson.D{{Key: "$addFields", Value: bson.D{
   			{Key: "rerankScore", Value: bson.D{{Key: "$meta", Value: "score"}}},
   		}}},
   		bson.D{{Key: "$limit", Value: 20}},
   		bson.D{{Key: "$project", Value: bson.D{
   			{Key: "_id", Value: 0},
   			{Key: "title", Value: 1},
   			{Key: "fullplot", Value: 1},
   			{Key: "scoreDetails", Value: 1},
   			{Key: "rerankScore", Value: 1},
   		}}},
   	}

   	cursor, err := coll.Aggregate(ctx, pipeline)
   	if err != nil {
   		log.Fatalf("failed to run aggregation: %v", err)
   	}
   	defer cursor.Close(ctx)

   	var results []bson.M
   	if err := cursor.All(ctx, &results); err != nil {
   		log.Fatalf("failed to decode results: %v", err)
   	}
   	for _, doc := range results {
   		fmt.Println(doc)
   	}
   }
   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `fullplot` field for the phrase *light-hearted comedy with ghosts*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `fullplot` field for the phrase *slapstick humor with paranormal events*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `fullplot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 50 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. It then reorders the results by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage. The `$rerank` stage reorders the results by relevance to the query term `light-hearted comedy
               with ghosts`. In the results, the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage adds a field named `rerankScore` that shows the score after reordering. The reordered results are more relevant to the query term.

2. Save the file.

3. Reorder the results of your query.

   To reorder the results, rerun the query:

   ### Similar Terms, Same Field

   ```bash
   go run auto-embed-query.go
   ```

   **Output:**

   ```javascript
   {"scoreDetails":{"value":{"$numberDouble":"0.014297385620915032"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"8"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5044854879379272"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"12"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5037259459495544"},"details":[]}]},"rerankScore":{"$numberDouble":"0.7265625"},"title":"Casper's Haunted Christmas","fullplot":"Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and sets out to complete his mission. As usual, kindhearted Casper has a ghastky time trying to scare anyone; so The Ghostly Trio, fed up with his goody-boo-shoes behavior, secretly hires Casper's look-alike cousin Spooky to do the job-with hilarious results."}
   {"scoreDetails":{"value":{"$numberDouble":"0.013312852022529442"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"3"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5047479271888733"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"33"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.503459095954895"},"details":[]}]},"rerankScore":{"$numberDouble":"0.69921875"},"title":"Casper","fullplot":"Furious that her late father only willed her his gloomy-looking mansion rather than his millions, Carrigan Crittenden is ready to burn the place to the ground when she discovers a map to a treasure hidden in the house. But when she enters the rickety mansion to seek her claim, she is frightened away by a wicked wave of ghosts. Determined to get her hands on this hidden fortune, she hires afterlife therapist Dr. James Harvey to exorcise the ghosts from the mansion. Harvey and his daughter Kat move in, and soon Kat meets Casper, the ghost of a young boy who's \"the friendliest ghost you know.\" But not so friendly are Casper's uncles--Stretch, Fatso and Stinkie--who are determined to drive all \"fleshies\" away. Ultimately, it is up to Harvey and Kat to help the ghosts cross over to the other side."}
   {"title":"Ghost Town","fullplot":"Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts. Even worse, they all want something from him, particularly Frank Herlihy who pesters him into breaking up the impending marriage of his widow Gwen. That puts Pincus squarely in the middle of a triangle with spirited result.","scoreDetails":{"value":{"$numberDouble":"0.01565940787863959"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"1"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.50507652759552"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"7"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5037906169891357"},"details":[]}]},"rerankScore":{"$numberDouble":"0.68359375"}}
   {"scoreDetails":{"value":{"$numberDouble":"0.012740882306099698"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"31"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5037020444869995"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"9"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5037755966186523"},"details":[]}]},"rerankScore":{"$numberDouble":"0.64453125"},"title":"Ghostbusters","fullplot":"Three odd-ball scientists get kicked out of their cushy positions at a university in New York City where they studied the occult. They decide to set up shop in an old firehouse and become Ghostbusters, trapping pesky ghosts, spirits, haunts, and poltergeists for money. They wise-crack their way through the city, and stumble upon a gateway to another dimension, one which will release untold evil upon the city. The Ghostbusters are called on to save the Big Apple."}
   {"title":"High Spirits","fullplot":"When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The trouble begins when a busload of American tourists arrive - along with some real ghosts. Among the tourists are married couple Jack and Sharon. Sharon's father holds the mortgage on Castle Plunkett, so she's hoping to debunk the ghosts. Jack, on the other hand, after meeting pretty ghost Mary, is very eager to believe. Can there be love between a human and ghost? Jack and Mary are going to try and find out.","scoreDetails":{"value":{"$numberDouble":"0.013946869070208728"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"2"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5049547553062439"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"25"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5035316944122314"},"details":[]}]},"rerankScore":{"$numberDouble":"0.64453125"}}
   {"title":"Sien nui yau wan","fullplot":"Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets a very beautiful lady who seduces him, but he doesn't know that she is a ghost, usually not leaving any man alive...","scoreDetails":{"value":{"$numberDouble":"0.01196509009009009"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"14"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5041933059692383"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"36"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5034355521202087"},"details":[]}]},"rerankScore":{"$numberDouble":"0.62890625"}}
   {"title":"The Peanut Butter Solution","fullplot":"Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair back, but too much peanut butter causes things to get a bit hairy.","scoreDetails":{"value":{"$numberDouble":"0.014558022622538752"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"17"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5041646957397461"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"2"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.504012942314148"},"details":[]}]},"rerankScore":{"$numberDouble":"0.609375"}}
   {"rerankScore":{"$numberDouble":"0.60546875"},"title":"A Magnificent Haunting","fullplot":"The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.","scoreDetails":{"value":{"$numberDouble":"0.013575490735644836"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"9"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5043735504150391"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"19"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5035990476608276"},"details":[]}]}}
   {"title":"A Magnificent Haunting","fullplot":"The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.","scoreDetails":{"value":{"$numberDouble":"0.013575490735644836"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"9"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5043735504150391"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"19"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5035990476608276"},"details":[]}]},"rerankScore":{"$numberDouble":"0.60546875"}}
   {"title":"Ghost Graduation","fullplot":"\"The Sixth Sense\" meets \"The Breakfast Club\" when a teacher who sees dead people applies for work at a high school haunted by five student poltergeists who died during detention. All his life Modesto has seen dead people walking around like living people and has long accepted the assessment of others that he has a mental problem. Principal Tina Escalonilla turns that around when Modesto describes a detail (known to her) about the school spirits that no others have been able to reveal. With her school poised to be closed due to unrelenting paranormal high jinx, she begs Modesto to stay and see what he can do to ease these spirits into the next life before Founder's Day.","scoreDetails":{"value":{"$numberDouble":"0.013423423423423425"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"15"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5041909217834473"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"14"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5036569833755493"},"details":[]}]},"rerankScore":{"$numberDouble":"0.59765625"}}
   {"title":"Bhoothnath","fullplot":"Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy with his new housemates. But what the ghost is not prepared for is his unlikely friendship with Banku. Now Banku must uncover the reason why his ghostly friend is stuck and help him to attain salvation.","scoreDetails":{"value":{"$numberDouble":"0.0078125"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"4"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5046243667602539"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.578125"}}
   {"title":"The Canterville Ghost","fullplot":"When a teenaged girl moves to England, with her brothers and parents into the ancient Canterville Hall, she's not at all happy. Especially as there's a ghost and a mysterious re-appearing bloodstain on the hearth. She campaigns to go back home, and her dad, believing the ghost's pranks are Ginny's, is ready to send her back. But then Ginny actually meets the elusive 17th-century Sir Simon de Canterville (not to mention the cute teenaged duke next door), and she sets her hand to the task of freeing Sir Simon from his curse.","scoreDetails":{"value":{"$numberDouble":"0.006578947368421052"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"16"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5041683912277222"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.578125"}}
   {"fullplot":"Adam and Barbara are a normal couple...who happen to be dead. They have given their precious time to decorate the house and make it their own, but unfortunately a family is moving in, and not quietly. Adam and Barbara try to scare them out, but ends up becoming the main attraction to the money making family. They call upon Beetlejuice to help, but Beetlejuice has more in mind than just helping.","title":"Beetlejuice","scoreDetails":{"value":{"$numberDouble":"0.010916269887353384"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"19"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5041239261627197"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"49"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5033432245254517"},"details":[]}]},"rerankScore":{"$numberDouble":"0.57421875"}}
   {"scoreDetails":{"value":{"$numberDouble":"0.01466181506849315"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"13"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.504249095916748"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"4"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5039034485816956"},"details":[]}]},"rerankScore":{"$numberDouble":"0.5703125"},"title":"Mr. Vampire","fullplot":"A ghost sucks the life-force out of a one of Uncle Nine's student. The other is slowly turned into a vampire. They halt his transformation by filing down his teeth! The female ghost throws her head around like a boomerang to protect herself. Can Mr. Vampire chase away the Succubus and the hopping ghost and save his two students?"}
   {"rerankScore":{"$numberDouble":"0.55859375"},"fullplot":"Connor Mead, a successful fashion photographer and a Lothario keen on casual sex, goes to his younger brother's wedding to convince him not to marry. He arrives at his dead uncle's estate during the rehearsal the night before the wedding; he starts in, taking his brother aside, trashing marriage. Later in the men's room, his uncle, who taught Connor all he knows about women, appears to him, confesses to have been wrong, and tells Connor that three ghosts will visit him that night: the ghosts of girlfriends past, present, and future. Connor has already set the breakup in motion. Can he learn anything from his life and fix what he's broken?","title":"Ghosts of Girlfriends Past","scoreDetails":{"value":{"$numberDouble":"0.006172839506172839"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"21"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5040419697761536"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]}}
   {"title":"Bhoothnath Returns","fullplot":"Bhoothnath Returns takes Bhoothnath's story forward. As he returns to 'Bhoot World' he is greeted with taunts and condemnation from other ghosts for bringing disrepute to the ghost-community for getting bullied by a kid on Earth. Post the humiliation, Bhoothnath decides to redeem himself and come back to scare a bunch of kids. Bhoothnath's search for kids brings him to Akhrot, a slum kid who is also the only person who can see him. Together they agree to help each other and their friendship sees them get involved in a cause that is bigger than they had ever imagined. To move ahead they will need to take on one of the country's most powerful and corrupt politician Bhau. The Lok Sabha elections are nearing and Bhau's victory is a mere formality, or is it? In a world, where a common man is afraid of politics, will a common man's ghost overcome his fear to stand up for what's right and fight against injustice? Bhoothnath Returns is an entertaining tale of good against evil, weak against powerful, past against future.","scoreDetails":{"value":{"$numberDouble":"0.011151960784313726"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"20"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.504052996635437"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"42"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5033951997756958"},"details":[]}]},"rerankScore":{"$numberDouble":"0.546875"}}
   {"title":"Ghost","fullplot":"Sam and Molly are a very happy couple and deeply in love. Walking back to their new apartment after a night out at the theatre, they encounter a thief in a dark alley, and Sam is murdered. He finds himself trapped as a ghost and realises that his death was no accident. He must warn Molly about the danger that she is in. But as a ghost he can not be seen or heard by the living, and so he tries to communicate with Molly through Oda Mae Brown, a psychic who didn't even realise that her powers were real.","scoreDetails":{"value":{"$numberDouble":"0.005747126436781609"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"27"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5038429498672485"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.52734375"}}
   {"title":"Wonder Man","fullplot":"Boisterous nightclub entertainer Buzzy Bellew was the witness to a murder committed by gangster Ten Grand Jackson. One night, two of Jackson's thugs kill Buzzy and dump his body in the lake at Prospect Park in Brooklyn. Buzzy comes back as a ghost and summons his bookworm twin, Edwin Dingle, to Prospect Park so that he can help the police nail Jackson.","scoreDetails":{"value":{"$numberDouble":"0.014041633935585232"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"7"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5044862627983093"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"16"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5036256313323975"},"details":[]}]},"rerankScore":{"$numberDouble":"0.51171875"}}
   {"fullplot":"Five years after the events of the first film, the Ghostbusters have been plagued by lawsuits and court orders, and their once-lucrative business is bankrupt. However, when Dana begins to have ghost problems again, the boys come out of retirement only to be promptly arrested. The Ghostbusters discover that New York is once again headed for supernatural doom, with a river of ectoplasmic slime bubbling beneath the city and an ancient sorcerer attempting to possess Dana's baby and be born anew. Can the Ghostbusters quell the negative emotions feeding the otherworldly threat and stop the world from being slimed?","title":"Ghostbusters II","scoreDetails":{"value":{"$numberDouble":"0.005813953488372093"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":"NA"},{"inputPipelineName":"vectorPipeline2","rank":{"$numberInt":"26"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.5035310983657837"},"details":[]}]},"rerankScore":{"$numberDouble":"0.50390625"}}
   {"fullplot":"Scott and Kate are married and very much in love with each other. Scott is more than 60 years old, while Kate is at least thirty years younger. When Scott dies, his soul cannot get peace and he becomes a ghost only Kate can see and speak with. Scott wants to return to life, and him and Kate hatch a plan to let a young man drown so that Scott can take over his body. Also, Kate must handle Scott's company's business deal that involves Donald Trump as well as the mob.","scoreDetails":{"value":{"$numberDouble":"0.007692307692307693"},"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":{"$numberInt":"5"},"weight":{"$numberDouble":"0.5"},"value":{"$numberDouble":"0.504621148109436"},"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":{"$numberDouble":"0.494140625"},"title":"Ghosts Can't Do It"}
   ```

1) Modify the `AutoEmbedQuery.java` file to add the reranking stages.

   Copy and paste the highlighted code into your query file.

   ### Similar Terms, Same Field

   ```java
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import org.bson.Document;

   import java.util.Arrays;
   import java.util.List;

   public class AutoEmbedQuery {

       public static void main(String[] args) {

           // Replace the placeholder with your connection string
           String uri = "<connectionString>";

           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_mflix");
               MongoCollection<Document> collection = database.getCollection("embedded_movies");

               List<Document> pipeline = Arrays.asList(
                   new Document("$rankFusion", new Document()
                       .append("input", new Document("pipelines", new Document()
                           .append("vectorPipeline1", Arrays.asList(
                               new Document("$vectorSearch", new Document()
                                   .append("index", "multiple-auto-embed-search")
                                   .append("path", "fullplot")
                                   .append("query", new Document("text", "light-hearted comedy with ghosts"))
                                   .append("numCandidates", 2000)
                                   .append("limit", 50))))
                           .append("vectorPipeline2", Arrays.asList(
                               new Document("$vectorSearch", new Document()
                                   .append("index", "multiple-auto-embed-search")
                                   .append("path", "fullplot")
                                   .append("query", new Document("text", "slapstick humor with paranormal events"))
                                   .append("numCandidates", 2000)
                                   .append("limit", 50))))))
                       .append("combination", new Document("weights", new Document()
                           .append("vectorPipeline1", 0.5)
                           .append("vectorPipeline2", 0.5)))
                       .append("scoreDetails", true)),
                   new Document("$project", new Document()
                       .append("_id", 1)
                       .append("title", 1)
                       .append("fullplot", 1)
                       .append("scoreDetails", new Document("$meta", "scoreDetails"))),
                   new Document("$limit", 50),
                   new Document("$match", new Document("fullplot", new Document("$exists", true).append("$type", "string"))),
                   new Document("$rerank", new Document()
                       .append("model", "rerank-2.5")
                       .append("query", new Document("text", "light-hearted comedy with ghosts and slapstick humor with paranormal events"))
                       .append("path", "fullplot")
                       .append("numDocsToRerank", 50)),
                   new Document("$addFields", new Document("rerankScore",
                       new Document("$meta", "score"))),
                   new Document("$limit", 20),
                   new Document("$project", new Document()
                       .append("_id", 0)
                       .append("title", 1)
                       .append("fullplot", 1)
                       .append("scoreDetails", 1)
                       .append("rerankScore", 1))
               );

               collection.aggregate(pipeline).forEach(doc -> System.out.println(doc.toJson()));
           }
       }
   }

   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `fullplot` field for the phrase *light-hearted comedy with ghosts*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `fullplot` field for the phrase *slapstick humor with paranormal events*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `fullplot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 50 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. It then reorders the results by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage. The `$rerank` stage reorders the results by relevance to the query term `light-hearted comedy
               with ghosts`. In the results, the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage adds a field named `rerankScore` that shows the score after reordering. The reordered results are more relevant to the query term.

2) Save the file.

3) Reorder the results of your query.

   To reorder the results, recompile and rerun the query:

   ### Similar Terms, Same Field

   ```bash
   javac AutoEmbedQuery.java
   java AutoEmbedQuery
   ```

   **Output:**

   ```javascript
   {"title": "Casper's Haunted Christmas", "fullplot": "Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and sets out to complete his mission. As usual, kindhearted Casper has a ghastky time trying to scare anyone; so The Ghostly Trio, fed up with his goody-boo-shoes behavior, secretly hires Casper's look-alike cousin Spooky to do the job-with hilarious results.", "scoreDetails": {"value": 0.014297385620915032, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 8, "weight": 0.5, "value": 0.5044854879379272, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 12, "weight": 0.5, "value": 0.5037259459495544, "details": []}]}, "rerankScore": 0.7265625}
   {"title": "Casper", "fullplot": "Furious that her late father only willed her his gloomy-looking mansion rather than his millions, Carrigan Crittenden is ready to burn the place to the ground when she discovers a map to a treasure hidden in the house. But when she enters the rickety mansion to seek her claim, she is frightened away by a wicked wave of ghosts. Determined to get her hands on this hidden fortune, she hires afterlife therapist Dr. James Harvey to exorcise the ghosts from the mansion. Harvey and his daughter Kat move in, and soon Kat meets Casper, the ghost of a young boy who's \"the friendliest ghost you know.\" But not so friendly are Casper's uncles--Stretch, Fatso and Stinkie--who are determined to drive all \"fleshies\" away. Ultimately, it is up to Harvey and Kat to help the ghosts cross over to the other side.", "scoreDetails": {"value": 0.013312852022529442, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 3, "weight": 0.5, "value": 0.5047479271888733, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 33, "weight": 0.5, "value": 0.503459095954895, "details": []}]}, "rerankScore": 0.69921875}
   {"title": "Ghost Town", "fullplot": "Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts. Even worse, they all want something from him, particularly Frank Herlihy who pesters him into breaking up the impending marriage of his widow Gwen. That puts Pincus squarely in the middle of a triangle with spirited result.", "scoreDetails": {"value": 0.01565940787863959, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 1, "weight": 0.5, "value": 0.50507652759552, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 7, "weight": 0.5, "value": 0.5037906169891357, "details": []}]}, "rerankScore": 0.68359375}
   {"title": "Ghostbusters", "fullplot": "Three odd-ball scientists get kicked out of their cushy positions at a university in New York City where they studied the occult. They decide to set up shop in an old firehouse and become Ghostbusters, trapping pesky ghosts, spirits, haunts, and poltergeists for money. They wise-crack their way through the city, and stumble upon a gateway to another dimension, one which will release untold evil upon the city. The Ghostbusters are called on to save the Big Apple.", "scoreDetails": {"value": 0.012740882306099698, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 31, "weight": 0.5, "value": 0.5037020444869995, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 9, "weight": 0.5, "value": 0.5037755966186523, "details": []}]}, "rerankScore": 0.64453125}
   {"title": "High Spirits", "fullplot": "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The trouble begins when a busload of American tourists arrive - along with some real ghosts. Among the tourists are married couple Jack and Sharon. Sharon's father holds the mortgage on Castle Plunkett, so she's hoping to debunk the ghosts. Jack, on the other hand, after meeting pretty ghost Mary, is very eager to believe. Can there be love between a human and ghost? Jack and Mary are going to try and find out.", "scoreDetails": {"value": 0.013946869070208728, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 2, "weight": 0.5, "value": 0.5049547553062439, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 25, "weight": 0.5, "value": 0.5035316944122314, "details": []}]}, "rerankScore": 0.64453125}
   {"title": "Sien nui yau wan", "fullplot": "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets a very beautiful lady who seduces him, but he doesn't know that she is a ghost, usually not leaving any man alive...", "scoreDetails": {"value": 0.01196509009009009, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 14, "weight": 0.5, "value": 0.5041933059692383, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 36, "weight": 0.5, "value": 0.5034355521202087, "details": []}]}, "rerankScore": 0.62890625}
   {"title": "The Peanut Butter Solution", "fullplot": "Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair back, but too much peanut butter causes things to get a bit hairy.", "scoreDetails": {"value": 0.014558022622538752, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 17, "weight": 0.5, "value": 0.5041646957397461, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 2, "weight": 0.5, "value": 0.504012942314148, "details": []}]}, "rerankScore": 0.609375}
   {"title": "A Magnificent Haunting", "fullplot": "The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.", "scoreDetails": {"value": 0.013575490735644836, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 9, "weight": 0.5, "value": 0.5043735504150391, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 19, "weight": 0.5, "value": 0.5035990476608276, "details": []}]}, "rerankScore": 0.60546875}
   {"title": "A Magnificent Haunting", "fullplot": "The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.", "scoreDetails": {"value": 0.013575490735644836, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 9, "weight": 0.5, "value": 0.5043735504150391, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 19, "weight": 0.5, "value": 0.5035990476608276, "details": []}]}, "rerankScore": 0.60546875}
   {"title": "Ghost Graduation", "fullplot": "\"The Sixth Sense\" meets \"The Breakfast Club\" when a teacher who sees dead people applies for work at a high school haunted by five student poltergeists who died during detention. All his life Modesto has seen dead people walking around like living people and has long accepted the assessment of others that he has a mental problem. Principal Tina Escalonilla turns that around when Modesto describes a detail (known to her) about the school spirits that no others have been able to reveal. With her school poised to be closed due to unrelenting paranormal high jinx, she begs Modesto to stay and see what he can do to ease these spirits into the next life before Founder's Day.", "scoreDetails": {"value": 0.013423423423423425, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 15, "weight": 0.5, "value": 0.5041909217834473, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 14, "weight": 0.5, "value": 0.5036569833755493, "details": []}]}, "rerankScore": 0.59765625}
   {"title": "Bhoothnath", "fullplot": "Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy with his new housemates. But what the ghost is not prepared for is his unlikely friendship with Banku. Now Banku must uncover the reason why his ghostly friend is stuck and help him to attain salvation.", "scoreDetails": {"value": 0.0078125, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 4, "weight": 0.5, "value": 0.5046243667602539, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.578125}
   {"title": "The Canterville Ghost", "fullplot": "When a teenaged girl moves to England, with her brothers and parents into the ancient Canterville Hall, she's not at all happy. Especially as there's a ghost and a mysterious re-appearing bloodstain on the hearth. She campaigns to go back home, and her dad, believing the ghost's pranks are Ginny's, is ready to send her back. But then Ginny actually meets the elusive 17th-century Sir Simon de Canterville (not to mention the cute teenaged duke next door), and she sets her hand to the task of freeing Sir Simon from his curse.", "scoreDetails": {"value": 0.006578947368421052, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 16, "weight": 0.5, "value": 0.5041683912277222, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.578125}
   {"fullplot": "Adam and Barbara are a normal couple...who happen to be dead. They have given their precious time to decorate the house and make it their own, but unfortunately a family is moving in, and not quietly. Adam and Barbara try to scare them out, but ends up becoming the main attraction to the money making family. They call upon Beetlejuice to help, but Beetlejuice has more in mind than just helping.", "title": "Beetlejuice", "scoreDetails": {"value": 0.010916269887353384, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 19, "weight": 0.5, "value": 0.5041239261627197, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 49, "weight": 0.5, "value": 0.5033432245254517, "details": []}]}, "rerankScore": 0.57421875}
   {"title": "Mr. Vampire", "fullplot": "A ghost sucks the life-force out of a one of Uncle Nine's student. The other is slowly turned into a vampire. They halt his transformation by filing down his teeth! The female ghost throws her head around like a boomerang to protect herself. Can Mr. Vampire chase away the Succubus and the hopping ghost and save his two students?", "scoreDetails": {"value": 0.01466181506849315, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 13, "weight": 0.5, "value": 0.504249095916748, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 4, "weight": 0.5, "value": 0.5039034485816956, "details": []}]}, "rerankScore": 0.5703125}
   {"fullplot": "Connor Mead, a successful fashion photographer and a Lothario keen on casual sex, goes to his younger brother's wedding to convince him not to marry. He arrives at his dead uncle's estate during the rehearsal the night before the wedding; he starts in, taking his brother aside, trashing marriage. Later in the men's room, his uncle, who taught Connor all he knows about women, appears to him, confesses to have been wrong, and tells Connor that three ghosts will visit him that night: the ghosts of girlfriends past, present, and future. Connor has already set the breakup in motion. Can he learn anything from his life and fix what he's broken?", "title": "Ghosts of Girlfriends Past", "scoreDetails": {"value": 0.006172839506172839, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 21, "weight": 0.5, "value": 0.5040419697761536, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.55859375}
   {"title": "Bhoothnath Returns", "fullplot": "Bhoothnath Returns takes Bhoothnath's story forward. As he returns to 'Bhoot World' he is greeted with taunts and condemnation from other ghosts for bringing disrepute to the ghost-community for getting bullied by a kid on Earth. Post the humiliation, Bhoothnath decides to redeem himself and come back to scare a bunch of kids. Bhoothnath's search for kids brings him to Akhrot, a slum kid who is also the only person who can see him. Together they agree to help each other and their friendship sees them get involved in a cause that is bigger than they had ever imagined. To move ahead they will need to take on one of the country's most powerful and corrupt politician Bhau. The Lok Sabha elections are nearing and Bhau's victory is a mere formality, or is it? In a world, where a common man is afraid of politics, will a common man's ghost overcome his fear to stand up for what's right and fight against injustice? Bhoothnath Returns is an entertaining tale of good against evil, weak against powerful, past against future.", "scoreDetails": {"value": 0.011151960784313726, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 20, "weight": 0.5, "value": 0.504052996635437, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 42, "weight": 0.5, "value": 0.5033951997756958, "details": []}]}, "rerankScore": 0.546875}
   {"title": "Ghost", "fullplot": "Sam and Molly are a very happy couple and deeply in love. Walking back to their new apartment after a night out at the theatre, they encounter a thief in a dark alley, and Sam is murdered. He finds himself trapped as a ghost and realises that his death was no accident. He must warn Molly about the danger that she is in. But as a ghost he can not be seen or heard by the living, and so he tries to communicate with Molly through Oda Mae Brown, a psychic who didn't even realise that her powers were real.", "scoreDetails": {"value": 0.005747126436781609, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 27, "weight": 0.5, "value": 0.5038429498672485, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.52734375}
   {"title": "Wonder Man", "fullplot": "Boisterous nightclub entertainer Buzzy Bellew was the witness to a murder committed by gangster Ten Grand Jackson. One night, two of Jackson's thugs kill Buzzy and dump his body in the lake at Prospect Park in Brooklyn. Buzzy comes back as a ghost and summons his bookworm twin, Edwin Dingle, to Prospect Park so that he can help the police nail Jackson.", "scoreDetails": {"value": 0.014041633935585232, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 7, "weight": 0.5, "value": 0.5044862627983093, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": 16, "weight": 0.5, "value": 0.5036256313323975, "details": []}]}, "rerankScore": 0.51171875}
   {"fullplot": "Five years after the events of the first film, the Ghostbusters have been plagued by lawsuits and court orders, and their once-lucrative business is bankrupt. However, when Dana begins to have ghost problems again, the boys come out of retirement only to be promptly arrested. The Ghostbusters discover that New York is once again headed for supernatural doom, with a river of ectoplasmic slime bubbling beneath the city and an ancient sorcerer attempting to possess Dana's baby and be born anew. Can the Ghostbusters quell the negative emotions feeding the otherworldly threat and stop the world from being slimed?", "title": "Ghostbusters II", "scoreDetails": {"value": 0.005813953488372093, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": "NA"}, {"inputPipelineName": "vectorPipeline2", "rank": 26, "weight": 0.5, "value": 0.5035310983657837, "details": []}]}, "rerankScore": 0.50390625}
   {"title": "Ghosts Can't Do It", "fullplot": "Scott and Kate are married and very much in love with each other. Scott is more than 60 years old, while Kate is at least thirty years younger. When Scott dies, his soul cannot get peace and he becomes a ghost only Kate can see and speak with. Scott wants to return to life, and him and Kate hatch a plan to let a young man drown so that Scott can take over his body. Also, Kate must handle Scott's company's business deal that involves Donald Trump as well as the mob.", "scoreDetails": {"value": 0.007692307692307693, "description": "value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:", "details": [{"inputPipelineName": "vectorPipeline1", "rank": 5, "weight": 0.5, "value": 0.504621148109436, "details": []}, {"inputPipelineName": "vectorPipeline2", "rank": "NA"}]}, "rerankScore": 0.494140625}
   ```

1. Modify the `auto-embed-query.js` file to add the reranking stages.

   Copy and paste the highlighted code into your query file.

   ### Similar Terms, Same Field

   ```javascript
   const { MongoClient } = require("mongodb");

   // Replace the placeholder with your connection string
   const uri = "<connectionString>";
   const client = new MongoClient(uri);

   async function run() {
     try {
       const collection = client.db("sample_mflix").collection("embedded_movies");

       const pipeline = [
         {
           $rankFusion: {
             input: {
               pipelines: {
                 vectorPipeline1: [
                   {
                     $vectorSearch: {
                       index: "multiple-auto-embed-search",
                       path: "fullplot",
                       query: { text: "light-hearted comedy with ghosts" },
                       numCandidates: 2000,
                       limit: 50,
                     },
                   },
                 ],
                 vectorPipeline2: [
                   {
                     $vectorSearch: {
                       index: "multiple-auto-embed-search",
                       path: "fullplot",
                       query: { text: "slapstick humor with paranormal events" },
                       numCandidates: 2000,
                       limit: 50,
                     },
                   },
                 ],
               },
             },
             combination: {
               weights: {
                 vectorPipeline1: 0.5,
                 vectorPipeline2: 0.5,
               },
             },
             scoreDetails: true,
           },
         },
         {
           $project: {
             _id: 1,
             title: 1,
             fullplot: 1,
             plot: 1,
             scoreDetails: { $meta: "scoreDetails" },
           },
         },
         { $limit: 50 },
         {
           $rerank: {
             model: "rerank-2.5",
             query: { text: "light-hearted comedy with ghosts and slapstick humor with paranormal events" },
             path: "fullplot",
             numDocsToRerank: 50,
           },
         },
         {
           $addFields: {
             rerankScore: { $meta: "score" },
           },
         },
         { $limit: 20 },
         {
           $project: {
             _id: 0,
             title: 1,
             fullplot: 1,
             plot: 1,
             scoreDetails: 1,
             rerankScore: 1,
           },
         },
       ];

       const results = await collection.aggregate(pipeline).toArray();
       results.forEach((doc) => console.log(JSON.stringify(doc)));
     } finally {
       await client.close();
     }
   }

   run().catch(console.dir);

   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `fullplot` field for the phrase *light-hearted comedy with ghosts*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `fullplot` field for the phrase *slapstick humor with paranormal events*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `fullplot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 50 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. It then reorders the results by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage. The `$rerank` stage reorders the results by relevance to the query term `light-hearted comedy
               with ghosts`. In the results, the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage adds a field named `rerankScore` that shows the score after reordering. The reordered results are more relevant to the query term.

2. Save the file.

3. Reorder the results of your query.

   To reorder the results, rerun the query:

   ### Similar Terms, Same Field

   ```bash
   node auto-embed-query.js
   ```

   **Output:**

   ```javascript
   {"plot":"Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and ...","title":"Casper's Haunted Christmas","fullplot":"Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and sets out to complete his mission. As usual, kindhearted Casper has a ghastky time trying to scare anyone; so The Ghostly Trio, fed up with his goody-boo-shoes behavior, secretly hires Casper's look-alike cousin Spooky to do the job-with hilarious results.","scoreDetails":{"value":0.014297385620915032,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":8,"weight":0.5,"value":0.5044854879379272,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":12,"weight":0.5,"value":0.5037259459495544,"details":[]}]},"rerankScore":0.7265625}
   {"plot":"A paranormal expert and his daughter bunk in an abandoned house populated by 3 mischievous ghosts and one friendly one.","title":"Casper","fullplot":"Furious that her late father only willed her his gloomy-looking mansion rather than his millions, Carrigan Crittenden is ready to burn the place to the ground when she discovers a map to a treasure hidden in the house. But when she enters the rickety mansion to seek her claim, she is frightened away by a wicked wave of ghosts. Determined to get her hands on this hidden fortune, she hires afterlife therapist Dr. James Harvey to exorcise the ghosts from the mansion. Harvey and his daughter Kat move in, and soon Kat meets Casper, the ghost of a young boy who's \"the friendliest ghost you know.\" But not so friendly are Casper's uncles--Stretch, Fatso and Stinkie--who are determined to drive all \"fleshies\" away. Ultimately, it is up to Harvey and Kat to help the ghosts cross over to the other side.","scoreDetails":{"value":0.013312852022529442,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":3,"weight":0.5,"value":0.5047479271888733,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":33,"weight":0.5,"value":0.503459095954895,"details":[]}]},"rerankScore":0.69921875}
   {"plot":"Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts.","title":"Ghost Town","fullplot":"Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts. Even worse, they all want something from him, particularly Frank Herlihy who pesters him into breaking up the impending marriage of his widow Gwen. That puts Pincus squarely in the middle of a triangle with spirited result.","scoreDetails":{"value":0.01565940787863959,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":1,"weight":0.5,"value":0.50507652759552,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":7,"weight":0.5,"value":0.5037906169891357,"details":[]}]},"rerankScore":0.68359375}
   {"plot":"Three unemployed parapsychology professors set up shop as a unique ghost removal service.","title":"Ghostbusters","fullplot":"Three odd-ball scientists get kicked out of their cushy positions at a university in New York City where they studied the occult. They decide to set up shop in an old firehouse and become Ghostbusters, trapping pesky ghosts, spirits, haunts, and poltergeists for money. They wise-crack their way through the city, and stumble upon a gateway to another dimension, one which will release untold evil upon the city. The Ghostbusters are called on to save the Big Apple.","scoreDetails":{"value":0.012740882306099698,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":31,"weight":0.5,"value":0.5037020444869995,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":9,"weight":0.5,"value":0.5037755966186523,"details":[]}]},"rerankScore":0.64453125}
   {"plot":"When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The ...","title":"High Spirits","fullplot":"When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The trouble begins when a busload of American tourists arrive - along with some real ghosts. Among the tourists are married couple Jack and Sharon. Sharon's father holds the mortgage on Castle Plunkett, so she's hoping to debunk the ghosts. Jack, on the other hand, after meeting pretty ghost Mary, is very eager to believe. Can there be love between a human and ghost? Jack and Mary are going to try and find out.","scoreDetails":{"value":0.013946869070208728,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":2,"weight":0.5,"value":0.5049547553062439,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":25,"weight":0.5,"value":0.5035316944122314,"details":[]}]},"rerankScore":0.64453125}
   {"plot":"Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets...","title":"Sien nui yau wan","fullplot":"Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets a very beautiful lady who seduces him, but he doesn't know that she is a ghost, usually not leaving any man alive...","scoreDetails":{"value":0.01196509009009009,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":14,"weight":0.5,"value":0.5041933059692383,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":36,"weight":0.5,"value":0.5034355521202087,"details":[]}]},"rerankScore":0.62890625}
   {"plot":"Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair...","title":"The Peanut Butter Solution","fullplot":"Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair back, but too much peanut butter causes things to get a bit hairy.","scoreDetails":{"value":0.014558022622538752,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":17,"weight":0.5,"value":0.5041646957397461,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":2,"weight":0.5,"value":0.504012942314148,"details":[]}]},"rerankScore":0.609375}
   {"plot":"The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to ...","title":"A Magnificent Haunting","fullplot":"The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.","scoreDetails":{"value":0.013575490735644836,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":9,"weight":0.5,"value":0.5043735504150391,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":19,"weight":0.5,"value":0.5035990476608276,"details":[]}]},"rerankScore":0.60546875}
   {"plot":"The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to ...","title":"A Magnificent Haunting","fullplot":"The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.","scoreDetails":{"value":0.013575490735644836,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":9,"weight":0.5,"value":0.5043735504150391,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":19,"weight":0.5,"value":0.5035990476608276,"details":[]}]},"rerankScore":0.60546875}
   {"plot":"A teacher with paranormal abilities helps a group of ghosts graduate high school.","title":"Ghost Graduation","fullplot":"\"The Sixth Sense\" meets \"The Breakfast Club\" when a teacher who sees dead people applies for work at a high school haunted by five student poltergeists who died during detention. All his life Modesto has seen dead people walking around like living people and has long accepted the assessment of others that he has a mental problem. Principal Tina Escalonilla turns that around when Modesto describes a detail (known to her) about the school spirits that no others have been able to reveal. With her school poised to be closed due to unrelenting paranormal high jinx, she begs Modesto to stay and see what he can do to ease these spirits into the next life before Founder's Day.","scoreDetails":{"value":0.013423423423423425,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":15,"weight":0.5,"value":0.5041909217834473,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":14,"weight":0.5,"value":0.5036569833755493,"details":[]}]},"rerankScore":0.59765625}
   {"plot":"Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy...","title":"Bhoothnath","fullplot":"Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy with his new housemates. But what the ghost is not prepared for is his unlikely friendship with Banku. Now Banku must uncover the reason why his ghostly friend is stuck and help him to attain salvation.","scoreDetails":{"value":0.0078125,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":4,"weight":0.5,"value":0.5046243667602539,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.578125}
   {"plot":"Adaption of the famous Oscar Wilde tale about a young American girl that helps a British ghost find rest and forgiveness.","title":"The Canterville Ghost","fullplot":"When a teenaged girl moves to England, with her brothers and parents into the ancient Canterville Hall, she's not at all happy. Especially as there's a ghost and a mysterious re-appearing bloodstain on the hearth. She campaigns to go back home, and her dad, believing the ghost's pranks are Ginny's, is ready to send her back. But then Ginny actually meets the elusive 17th-century Sir Simon de Canterville (not to mention the cute teenaged duke next door), and she sets her hand to the task of freeing Sir Simon from his curse.","scoreDetails":{"value":0.006578947368421052,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":16,"weight":0.5,"value":0.5041683912277222,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.578125}
   {"fullplot":"Adam and Barbara are a normal couple...who happen to be dead. They have given their precious time to decorate the house and make it their own, but unfortunately a family is moving in, and not quietly. Adam and Barbara try to scare them out, but ends up becoming the main attraction to the money making family. They call upon Beetlejuice to help, but Beetlejuice has more in mind than just helping.","plot":"A couple of recently deceased ghosts contract the services of a \"bio-exorcist\" in order to remove the obnoxious new owners of their house.","title":"Beetlejuice","scoreDetails":{"value":0.010916269887353384,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":19,"weight":0.5,"value":0.5041239261627197,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":49,"weight":0.5,"value":0.5033432245254517,"details":[]}]},"rerankScore":0.57421875}
   {"plot":"The planned reburial of a village elder goes awry as the corpse resurrects into a hopping, bloodthirsty vampire, threatening mankind. Therefore, a Taoist Priest and his two disciples attempt to stop the terror.","title":"Mr. Vampire","fullplot":"A ghost sucks the life-force out of a one of Uncle Nine's student. The other is slowly turned into a vampire. They halt his transformation by filing down his teeth! The female ghost throws her head around like a boomerang to protect herself. Can Mr. Vampire chase away the Succubus and the hopping ghost and save his two students?","scoreDetails":{"value":0.01466181506849315,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":13,"weight":0.5,"value":0.504249095916748,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":4,"weight":0.5,"value":0.5039034485816956,"details":[]}]},"rerankScore":0.5703125}
   {"fullplot":"Connor Mead, a successful fashion photographer and a Lothario keen on casual sex, goes to his younger brother's wedding to convince him not to marry. He arrives at his dead uncle's estate during the rehearsal the night before the wedding; he starts in, taking his brother aside, trashing marriage. Later in the men's room, his uncle, who taught Connor all he knows about women, appears to him, confesses to have been wrong, and tells Connor that three ghosts will visit him that night: the ghosts of girlfriends past, present, and future. Connor has already set the breakup in motion. Can he learn anything from his life and fix what he's broken?","plot":"While attending his brother's wedding, a serial womanizer is haunted by the ghosts of his past girlfriends.","title":"Ghosts of Girlfriends Past","scoreDetails":{"value":0.006172839506172839,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":21,"weight":0.5,"value":0.5040419697761536,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.55859375}
   {"plot":"A ghost returns back from his world to prove something. But on earth, he has something more to do for his country.","title":"Bhoothnath Returns","fullplot":"Bhoothnath Returns takes Bhoothnath's story forward. As he returns to 'Bhoot World' he is greeted with taunts and condemnation from other ghosts for bringing disrepute to the ghost-community for getting bullied by a kid on Earth. Post the humiliation, Bhoothnath decides to redeem himself and come back to scare a bunch of kids. Bhoothnath's search for kids brings him to Akhrot, a slum kid who is also the only person who can see him. Together they agree to help each other and their friendship sees them get involved in a cause that is bigger than they had ever imagined. To move ahead they will need to take on one of the country's most powerful and corrupt politician Bhau. The Lok Sabha elections are nearing and Bhau's victory is a mere formality, or is it? In a world, where a common man is afraid of politics, will a common man's ghost overcome his fear to stand up for what's right and fight against injustice? Bhoothnath Returns is an entertaining tale of good against evil, weak against powerful, past against future.","scoreDetails":{"value":0.011151960784313726,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":20,"weight":0.5,"value":0.504052996635437,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":42,"weight":0.5,"value":0.5033951997756958,"details":[]}]},"rerankScore":0.546875}
   {"plot":"After an accident leaves a young man dead, his spirit stays behind to warn his lover of impending danger, with the help of a reluctant psychic.","title":"Ghost","fullplot":"Sam and Molly are a very happy couple and deeply in love. Walking back to their new apartment after a night out at the theatre, they encounter a thief in a dark alley, and Sam is murdered. He finds himself trapped as a ghost and realises that his death was no accident. He must warn Molly about the danger that she is in. But as a ghost he can not be seen or heard by the living, and so he tries to communicate with Molly through Oda Mae Brown, a psychic who didn't even realise that her powers were real.","scoreDetails":{"value":0.005747126436781609,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":27,"weight":0.5,"value":0.5038429498672485,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.52734375}
   {"plot":"Boisterous nightclub entertainer Buzzy Bellew was the witness to a murder committed by gangster Ten Grand Jackson. One night, two of Jackson's thugs kill Buzzy and dump his body in the lake...","title":"Wonder Man","fullplot":"Boisterous nightclub entertainer Buzzy Bellew was the witness to a murder committed by gangster Ten Grand Jackson. One night, two of Jackson's thugs kill Buzzy and dump his body in the lake at Prospect Park in Brooklyn. Buzzy comes back as a ghost and summons his bookworm twin, Edwin Dingle, to Prospect Park so that he can help the police nail Jackson.","scoreDetails":{"value":0.014041633935585232,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":7,"weight":0.5,"value":0.5044862627983093,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":16,"weight":0.5,"value":0.5036256313323975,"details":[]}]},"rerankScore":0.51171875}
   {"fullplot":"Five years after the events of the first film, the Ghostbusters have been plagued by lawsuits and court orders, and their once-lucrative business is bankrupt. However, when Dana begins to have ghost problems again, the boys come out of retirement only to be promptly arrested. The Ghostbusters discover that New York is once again headed for supernatural doom, with a river of ectoplasmic slime bubbling beneath the city and an ancient sorcerer attempting to possess Dana's baby and be born anew. Can the Ghostbusters quell the negative emotions feeding the otherworldly threat and stop the world from being slimed?","plot":"The discovery of a massive river of ectoplasm and a resurgence of spectral activity allows the staff of Ghostbusters to revive the business.","title":"Ghostbusters II","scoreDetails":{"value":0.005813953488372093,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":"NA"},{"inputPipelineName":"vectorPipeline2","rank":26,"weight":0.5,"value":0.5035310983657837,"details":[]}]},"rerankScore":0.50390625}
   {"plot":"Elderly Scott kills himself after a heart attack wrecks his body, but then comes back as a ghost and convinces his loving young hot wife Kate to pick and kill a young man in order for Scott to possess his body and be with her again.","title":"Ghosts Can't Do It","fullplot":"Scott and Kate are married and very much in love with each other. Scott is more than 60 years old, while Kate is at least thirty years younger. When Scott dies, his soul cannot get peace and he becomes a ghost only Kate can see and speak with. Scott wants to return to life, and him and Kate hatch a plan to let a young man drown so that Scott can take over his body. Also, Kate must handle Scott's company's business deal that involves Donald Trump as well as the mob.","scoreDetails":{"value":0.007692307692307693,"description":"value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:","details":[{"inputPipelineName":"vectorPipeline1","rank":5,"weight":0.5,"value":0.504621148109436,"details":[]},{"inputPipelineName":"vectorPipeline2","rank":"NA"}]},"rerankScore":0.494140625}
   ```

1) Modify the `auto-embed-query.py` file to add the reranking stages.

   Copy and paste the highlighted code into your query file.

   ### Similar Terms, Same Field

   ```python
   from pymongo import MongoClient

   # Replace the placeholder with your connection string
   uri = "<connectionString>"
   client = MongoClient(uri)

   # Access your database and collection
   collection = client["sample_mflix"]["embedded_movies"]

   pipeline = [
       {
           "$rankFusion": {
               "input": {
                   "pipelines": {
                       "vectorPipeline1": [
                           {
                               "$vectorSearch": {
                                   "index": "multiple-auto-embed-search",
                                   "path": "fullplot",
                                   "query": {"text": "light-hearted comedy with ghosts"},
                                   "numCandidates": 2000,
                                   "limit": 50
                               }
                           }
                       ],
                       "vectorPipeline2": [
                           {
                               "$vectorSearch": {
                                   "index": "multiple-auto-embed-search",
                                   "path": "fullplot",
                                   "query": {"text": "slapstick humor with paranormal events"},
                                   "numCandidates": 2000,
                                   "limit": 50
                               }
                           }
                       ]
                   }
               },
               "combination": {
                   "weights": {
                       "vectorPipeline1": 0.5,
                       "vectorPipeline2": 0.5
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
       {"$limit": 50},
       {"$match": {"fullplot": {"$exists": True, "$type": "string"}}},
       {
           "$rerank": {
               "model": "rerank-2.5",
               "query": {"text": "light-hearted comedy with ghosts and slapstick humor with paranormal events"},
               "path": "fullplot",
               "numDocsToRerank": 50
           }
       },
       {
           "$addFields": {
               "rerankScore": {"$meta": "score"}
           }
       },
       {"$limit": 20},
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

   results = collection.aggregate(pipeline)
   for doc in results:
       print(doc)

   client.close()

   ```

   This sample query uses the `$rankFusion` stage with the following input pipeline stages:

   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Searches the `fullplot` field for the phrase *light-hearted comedy with ghosts*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |
   | --- | --- |
   | [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) | Performs a sequential vector search on the `fullplot` field for the phrase *slapstick humor with paranormal events*.; Specifies a search for up to `2000` nearest neighbors.; Limits the results from this stage to `50` documents.; Specifies a weight of `0.5` to influence that pipeline's rank contribution to the final score. |

   The sample query also specifies the following pipeline stages.

   | [`$project`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project.md#mongodb-pipeline-pipe.-project) | Includes only the `fullplot` and `title` fields in the results.; Adds a field named `scoreDetails` in the results. |
   | --- | --- |
   | [`$limit`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit.md#mongodb-pipeline-pipe.-limit) | Limits the returned results to 50 documents. |

   MongoDB Vector Search merges the results for both the queries into a single result set. It then reorders the results by using the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage. The `$rerank` stage reorders the results by relevance to the query term `light-hearted comedy
               with ghosts`. In the results, the [`$rerank`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/rerank.md#mongodb-pipeline-pipe.-rerank) stage adds a field named `rerankScore` that shows the score after reordering. The reordered results are more relevant to the query term.

2) Save the file.

3) Reorder the results of your query.

   To reorder the results, rerun the query:

   ### Similar Terms, Same Field

   ```bash
   python auto-embed-query.py
   ```

   **Output:**

   ```javascript
   {'title': "Casper's Haunted Christmas", 'fullplot': "Kibosh, supreme ruler of all ghosts, decrees that casper must scare at least one person before Christmas Day so Casper visits Kriss, Massachusetts where he meets the Jollimore family and sets out to complete his mission. As usual, kindhearted Casper has a ghastky time trying to scare anyone; so The Ghostly Trio, fed up with his goody-boo-shoes behavior, secretly hires Casper's look-alike cousin Spooky to do the job-with hilarious results.", 'scoreDetails': {'value': 0.014297385620915032, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 8, 'weight': 0.5, 'value': 0.5044854879379272, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 12, 'weight': 0.5, 'value': 0.5037259459495544, 'details': []}]}, 'rerankScore': 0.7265625}
   {'title': 'Casper', 'fullplot': 'Furious that her late father only willed her his gloomy-looking mansion rather than his millions, Carrigan Crittenden is ready to burn the place to the ground when she discovers a map to a treasure hidden in the house. But when she enters the rickety mansion to seek her claim, she is frightened away by a wicked wave of ghosts. Determined to get her hands on this hidden fortune, she hires afterlife therapist Dr. James Harvey to exorcise the ghosts from the mansion. Harvey and his daughter Kat move in, and soon Kat meets Casper, the ghost of a young boy who\'s "the friendliest ghost you know." But not so friendly are Casper\'s uncles--Stretch, Fatso and Stinkie--who are determined to drive all "fleshies" away. Ultimately, it is up to Harvey and Kat to help the ghosts cross over to the other side.', 'scoreDetails': {'value': 0.013312852022529442, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 3, 'weight': 0.5, 'value': 0.5047479271888733, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 33, 'weight': 0.5, 'value': 0.503459095954895, 'details': []}]}, 'rerankScore': 0.69921875}
   {'title': 'Ghost Town', 'fullplot': 'Bertram Pincus is a man whose people skills leave much to be desired. When Pincus dies unexpectedly, but is miraculously revived after seven minutes, he wakes up to discover that he now has the annoying ability to see ghosts. Even worse, they all want something from him, particularly Frank Herlihy who pesters him into breaking up the impending marriage of his widow Gwen. That puts Pincus squarely in the middle of a triangle with spirited result.', 'scoreDetails': {'value': 0.01565940787863959, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 1, 'weight': 0.5, 'value': 0.50507652759552, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 7, 'weight': 0.5, 'value': 0.5037906169891357, 'details': []}]}, 'rerankScore': 0.68359375}
   {'title': 'Ghostbusters', 'fullplot': 'Three odd-ball scientists get kicked out of their cushy positions at a university in New York City where they studied the occult. They decide to set up shop in an old firehouse and become Ghostbusters, trapping pesky ghosts, spirits, haunts, and poltergeists for money. They wise-crack their way through the city, and stumble upon a gateway to another dimension, one which will release untold evil upon the city. The Ghostbusters are called on to save the Big Apple.', 'scoreDetails': {'value': 0.012740882306099698, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 31, 'weight': 0.5, 'value': 0.5037020444869995, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 9, 'weight': 0.5, 'value': 0.5037755966186523, 'details': []}]}, 'rerankScore': 0.64453125}
   {'title': 'High Spirits', 'fullplot': "When Peter Plunkett's Irish castle turned hotel is about to be repossesed, he decides to spice up the attraction a bit for the 'Yanks' by having his staff pretend to haunt the castle. The trouble begins when a busload of American tourists arrive - along with some real ghosts. Among the tourists are married couple Jack and Sharon. Sharon's father holds the mortgage on Castle Plunkett, so she's hoping to debunk the ghosts. Jack, on the other hand, after meeting pretty ghost Mary, is very eager to believe. Can there be love between a human and ghost? Jack and Mary are going to try and find out.", 'scoreDetails': {'value': 0.013946869070208728, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 2, 'weight': 0.5, 'value': 0.5049547553062439, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 25, 'weight': 0.5, 'value': 0.5035316944122314, 'details': []}]}, 'rerankScore': 0.64453125}
   {'title': 'Sien nui yau wan', 'fullplot': "Tax collector Ning, a clumsy and easily frightened man, doesn't have any money and decides to stay overnight in an abandoned temple. Little does he know that the temple is haunted. He meets a very beautiful lady who seduces him, but he doesn't know that she is a ghost, usually not leaving any man alive...", 'scoreDetails': {'value': 0.01196509009009009, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 14, 'weight': 0.5, 'value': 0.5041933059692383, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 36, 'weight': 0.5, 'value': 0.5034355521202087, 'details': []}]}, 'rerankScore': 0.62890625}
   {'title': 'The Peanut Butter Solution', 'fullplot': 'Peanut butter is the secret ingredient for magic potions made by two friendly ghosts. Eleven-year-old Michael loses all of his hair when he gets a fright and uses the potion to get his hair back, but too much peanut butter causes things to get a bit hairy.', 'scoreDetails': {'value': 0.014558022622538752, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 17, 'weight': 0.5, 'value': 0.5041646957397461, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 2, 'weight': 0.5, 'value': 0.504012942314148, 'details': []}]}, 'rerankScore': 0.609375}
   {'title': 'A Magnificent Haunting', 'fullplot': 'The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.', 'scoreDetails': {'value': 0.013575490735644836, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 9, 'weight': 0.5, 'value': 0.5043735504150391, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 19, 'weight': 0.5, 'value': 0.5035990476608276, 'details': []}]}, 'rerankScore': 0.60546875}
   {'title': 'A Magnificent Haunting', 'fullplot': 'The only dream of Pietro is to become a famous actor. 28 year-old Pietro is so obsessed with becoming an actor that he does not mind trying every single way. He comes Rome and starts to work in a bakery. Also, at the same time, he tries to be an actor. At first, he stays with his cousin, Maria , but then he rents a house. Nevertheless, in a short time, something weird happens at the house. As if the furniture moves by itself. Then he realizes that the house was haunted by some ghosts, so with it, the adventure itself begins.', 'scoreDetails': {'value': 0.013575490735644836, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 9, 'weight': 0.5, 'value': 0.5043735504150391, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 19, 'weight': 0.5, 'value': 0.5035990476608276, 'details': []}]}, 'rerankScore': 0.60546875}
   {'title': 'Ghost Graduation', 'fullplot': '"The Sixth Sense" meets "The Breakfast Club" when a teacher who sees dead people applies for work at a high school haunted by five student poltergeists who died during detention. All his life Modesto has seen dead people walking around like living people and has long accepted the assessment of others that he has a mental problem. Principal Tina Escalonilla turns that around when Modesto describes a detail (known to her) about the school spirits that no others have been able to reveal. With her school poised to be closed due to unrelenting paranormal high jinx, she begs Modesto to stay and see what he can do to ease these spirits into the next life before Founder\'s Day.', 'scoreDetails': {'value': 0.013423423423423425, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 15, 'weight': 0.5, 'value': 0.5041909217834473, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 14, 'weight': 0.5, 'value': 0.5036569833755493, 'details': []}]}, 'rerankScore': 0.59765625}
   {'title': 'Bhoothnath', 'fullplot': 'Banku, his mother, Anjali Sharma and father move in to their new house -- the Nath villa, unaware of the fact that the house is inhabited by a ghost. It is learnt the ghost is not too happy with his new housemates. But what the ghost is not prepared for is his unlikely friendship with Banku. Now Banku must uncover the reason why his ghostly friend is stuck and help him to attain salvation.', 'scoreDetails': {'value': 0.0078125, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 4, 'weight': 0.5, 'value': 0.5046243667602539, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.578125}
   {'title': 'The Canterville Ghost', 'fullplot': "When a teenaged girl moves to England, with her brothers and parents into the ancient Canterville Hall, she's not at all happy. Especially as there's a ghost and a mysterious re-appearing bloodstain on the hearth. She campaigns to go back home, and her dad, believing the ghost's pranks are Ginny's, is ready to send her back. But then Ginny actually meets the elusive 17th-century Sir Simon de Canterville (not to mention the cute teenaged duke next door), and she sets her hand to the task of freeing Sir Simon from his curse.", 'scoreDetails': {'value': 0.006578947368421052, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 16, 'weight': 0.5, 'value': 0.5041683912277222, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.578125}
   {'fullplot': 'Adam and Barbara are a normal couple...who happen to be dead. They have given their precious time to decorate the house and make it their own, but unfortunately a family is moving in, and not quietly. Adam and Barbara try to scare them out, but ends up becoming the main attraction to the money making family. They call upon Beetlejuice to help, but Beetlejuice has more in mind than just helping.', 'title': 'Beetlejuice', 'scoreDetails': {'value': 0.010916269887353384, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 19, 'weight': 0.5, 'value': 0.5041239261627197, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 49, 'weight': 0.5, 'value': 0.5033432245254517, 'details': []}]}, 'rerankScore': 0.57421875}
   {'title': 'Mr. Vampire', 'fullplot': "A ghost sucks the life-force out of a one of Uncle Nine's student. The other is slowly turned into a vampire. They halt his transformation by filing down his teeth! The female ghost throws her head around like a boomerang to protect herself. Can Mr. Vampire chase away the Succubus and the hopping ghost and save his two students?", 'scoreDetails': {'value': 0.01466181506849315, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 13, 'weight': 0.5, 'value': 0.504249095916748, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 4, 'weight': 0.5, 'value': 0.5039034485816956, 'details': []}]}, 'rerankScore': 0.5703125}
   {'fullplot': "Connor Mead, a successful fashion photographer and a Lothario keen on casual sex, goes to his younger brother's wedding to convince him not to marry. He arrives at his dead uncle's estate during the rehearsal the night before the wedding; he starts in, taking his brother aside, trashing marriage. Later in the men's room, his uncle, who taught Connor all he knows about women, appears to him, confesses to have been wrong, and tells Connor that three ghosts will visit him that night: the ghosts of girlfriends past, present, and future. Connor has already set the breakup in motion. Can he learn anything from his life and fix what he's broken?", 'title': 'Ghosts of Girlfriends Past', 'scoreDetails': {'value': 0.006172839506172839, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 21, 'weight': 0.5, 'value': 0.5040419697761536, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.55859375}
   {'title': 'Bhoothnath Returns', 'fullplot': "Bhoothnath Returns takes Bhoothnath's story forward. As he returns to 'Bhoot World' he is greeted with taunts and condemnation from other ghosts for bringing disrepute to the ghost-community for getting bullied by a kid on Earth. Post the humiliation, Bhoothnath decides to redeem himself and come back to scare a bunch of kids. Bhoothnath's search for kids brings him to Akhrot, a slum kid who is also the only person who can see him. Together they agree to help each other and their friendship sees them get involved in a cause that is bigger than they had ever imagined. To move ahead they will need to take on one of the country's most powerful and corrupt politician Bhau. The Lok Sabha elections are nearing and Bhau's victory is a mere formality, or is it? In a world, where a common man is afraid of politics, will a common man's ghost overcome his fear to stand up for what's right and fight against injustice? Bhoothnath Returns is an entertaining tale of good against evil, weak against powerful, past against future.", 'scoreDetails': {'value': 0.011151960784313726, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 20, 'weight': 0.5, 'value': 0.504052996635437, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 42, 'weight': 0.5, 'value': 0.5033951997756958, 'details': []}]}, 'rerankScore': 0.546875}
   {'title': 'Ghost', 'fullplot': "Sam and Molly are a very happy couple and deeply in love. Walking back to their new apartment after a night out at the theatre, they encounter a thief in a dark alley, and Sam is murdered. He finds himself trapped as a ghost and realises that his death was no accident. He must warn Molly about the danger that she is in. But as a ghost he can not be seen or heard by the living, and so he tries to communicate with Molly through Oda Mae Brown, a psychic who didn't even realise that her powers were real.", 'scoreDetails': {'value': 0.005747126436781609, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 27, 'weight': 0.5, 'value': 0.5038429498672485, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.52734375}
   {'title': 'Wonder Man', 'fullplot': "Boisterous nightclub entertainer Buzzy Bellew was the witness to a murder committed by gangster Ten Grand Jackson. One night, two of Jackson's thugs kill Buzzy and dump his body in the lake at Prospect Park in Brooklyn. Buzzy comes back as a ghost and summons his bookworm twin, Edwin Dingle, to Prospect Park so that he can help the police nail Jackson.", 'scoreDetails': {'value': 0.014041633935585232, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 7, 'weight': 0.5, 'value': 0.5044862627983093, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 16, 'weight': 0.5, 'value': 0.5036256313323975, 'details': []}]}, 'rerankScore': 0.51171875}
   {'fullplot': "Five years after the events of the first film, the Ghostbusters have been plagued by lawsuits and court orders, and their once-lucrative business is bankrupt. However, when Dana begins to have ghost problems again, the boys come out of retirement only to be promptly arrested. The Ghostbusters discover that New York is once again headed for supernatural doom, with a river of ectoplasmic slime bubbling beneath the city and an ancient sorcerer attempting to possess Dana's baby and be born anew. Can the Ghostbusters quell the negative emotions feeding the otherworldly threat and stop the world from being slimed?", 'title': 'Ghostbusters II', 'scoreDetails': {'value': 0.005813953488372093, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 'NA'}, {'inputPipelineName': 'vectorPipeline2', 'rank': 26, 'weight': 0.5, 'value': 0.5035310983657837, 'details': []}]}, 'rerankScore': 0.50390625}
   {'title': "Ghosts Can't Do It", 'fullplot': "Scott and Kate are married and very much in love with each other. Scott is more than 60 years old, while Kate is at least thirty years younger. When Scott dies, his soul cannot get peace and he becomes a ghost only Kate can see and speak with. Scott wants to return to life, and him and Kate hatch a plan to let a young man drown so that Scott can take over his body. Also, Kate must handle Scott's company's business deal that involves Donald Trump as well as the mob.", 'scoreDetails': {'value': 0.007692307692307693, 'description': 'value output by reciprocal rank fusion algorithm, computed as sum of (weight * (1 / (60 + rank))) across input pipelines from which this document is output, from:', 'details': [{'inputPipelineName': 'vectorPipeline1', 'rank': 5, 'weight': 0.5, 'value': 0.504621148109436, 'details': []}, {'inputPipelineName': 'vectorPipeline2', 'rank': 'NA'}]}, 'rerankScore': 0.494140625}
   ```
