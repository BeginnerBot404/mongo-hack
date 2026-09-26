> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: maven, gradle, cloud, local
-->

# Vector Quantization

MongoDB Vector Search supports automatic quantization of your float vector embeddings (both 32-bit and 64-bit). It also supports ingesting and indexing your pre-quantized scalar and binary vectors from certain embedding models.

## About Quantization

Quantization is the process of shrinking full-fidelity vectors into fewer bits. It reduces the amount of main memory required to store each vector in a MongoDB Vector Search index by indexing the reduced representation vectors instead. This allows for storage of more vectors or vectors with higher dimensions. Therefore, quantization reduces resource consumption and improves speed. We recommend quantization for applications with a large number of vectors, such as over 100,000.

### Scalar Quantization

[Scalar quantization](https://www.mongodb.com/docs/manual/reference/glossary.md#std-term-scalar-quantization) involves first identifying the minimum and maximum values for each dimension of the indexed vectors to establish a range of values for a dimension. Then, the range is divided into equally sized intervals or bins. Finally, each float value is mapped to a bin to convert the continuous float values into discrete integers. In MongoDB Vector Search, this quantization reduces the vector embedding's RAM cost to about one fourth (`1/3.75`) of the pre-quantization cost.

### Binary Quantization

Binary quantization involves assuming a midpoint of `0` for each dimension, which is typically appropriate for embeddings normalized to length `1` such as  OpenAI's `text-embedding-3-large`. Then, each value in the vector is compared to the midpoint and assigned a binary value of `1` if it's greater than the midpoint and a binary value of `0` if it's less than or equal to the midpoint. In MongoDB Vector Search, this quantization reduces the vector embedding's RAM cost to one twenty-fourth (`1/24`) of the pre-quantization cost. The reason it's not `1/32` is because the data structure containing the [Hierarchical Navigable Small Worlds](https://arxiv.org/abs/1603.09320) graph itself, separate from the vector values, isn't compressed.

When you run a query, MongoDB Vector Search converts the float value in the query vector into a binary vector using the same midpoint for efficient comparison between the query vector and indexed binary vectors. It then rescores by reevaluating the identified candidates in the binary comparison using the original float values associated with those results from the binary index to further refine the results. The full fidelity vectors are stored in their own data structure on disk, and are only referenced during rescoring when you configure binary quantization or when you perform exact search against either binary or scalar quantized vectors.

## Requirements

The following table shows the requirements for automatically quantizing and ingesting quantized vectors.

| Requirement | For `int1` Ingestion | For `int8` Ingestion | For Automatic Scalar Quantization | For Automatic Binary Quantization |
| --- | --- | --- | --- | --- |
| Requires index definition settings | No | No | Yes | Yes |
| Requires BSON (Binary Javascript Object Notation) `binData` format | Yes | Yes | No | No |
| Storage on mongod | `binData(int1)` | `binData(int8)` | `binData(float32)``array(double)` | `binData(float32)``array(double)` |
| Supported Similarity method | `euclidean` | `cosine``euclidean``dotProduct` | `cosine``euclidean``dotProduct` | `cosine``euclidean``dotProduct` |
| Maximum Dimensionality | Multiple of 8 | 8192 | 8192 | 8192 |
| Supports ANN (Approximate Nearest Neighbor) and ENN (Exact Nearest Neighbor) Search | Yes | Yes | Yes | Yes |

**Note:**

Atlas stores all floating-point values as the `double` data type internally; therefore, both 32-bit and 64-bit embeddings are compatible with automatic quantization without conversion.

## How to Enable Automatic Quantization of Vectors

You can configure MongoDB Vector Search to automatically quantize float vector embeddings in your collection to reduced representation types, such as `int8` (scalar) and `binary` in your vector indexes.

To set or change the quantization type, specify a `quantization` field value of either `scalar` or `binary` in your index definition. This triggers an index rebuild similar to any other index definition change. The specified quantization type applies to all indexed vectors and query vectors at query-time. You don't need to change your query as your query vectors are automatically quantized.

For most embedding models, we recommend binary quantization with rescoring. If you want to use lower dimension models that are not QAT (Quantization-Aware-Trained), use scalar quantization because it has less representational loss and therefore, incurs less representational capacity loss.

### Benefits

MongoDB Vector Search provides native capabilities for scalar quantization as well as binary quantization with rescoring. Automatic quantization increases scalability and cost savings for your applications by reducing the computational resources for efficient processing of your vectors. Automatic quantization reduces the RAM for `mongot` by 3.75x for scalar and by 24x for binary; the vector values shrink by 4x and 32x respectively, but [Hierarchical Navigable Small Worlds](https://arxiv.org/abs/1603.09320) graph itself does not shrink. This improves performance, even at the highest volume and scale.

### Use Cases

We recommend automatic quantization if you have large number of full fidelity vectors, typically over 100,000 vectors. After quantization, you index reduced representation vectors without compromising the accuracy when retrieving vectors.

### Procedure

To enable automatic quantization:

1. Specify the type of quantization you want in your MongoDB Vector Search index.

   In a new or existing MongoDB Vector Search index, specify one of the following quantization types in the `fields.quantization` field for your [index definition:](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-index-definition)

   - `scalar`: to produce byte vectors from float input vectors.

   - `binary`: to produce bit vectors from float input vectors.

   If you specify automatic quantization on data that is not an array of float values, MongoDB Vector Search silently ignores that vector instead of indexing it, and those vectors will be skipped. Since Atlas stores float values (both 32-bit and 64-bit) as the `double` type internally, embeddings from models that output either precision will work with automatic quantization.

2. Create or update the index.

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   The specified quantization type applies to all indexed vectors and query vectors at query-time.

#### Considerations

When you view your quantized index [in the Atlas UI](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-view-index-procedure), the index size might appear larger than an index without quantization. This is because the Size metric represents the *total data stored*, which includes the [Hierarchical Navigable Small Worlds](https://arxiv.org/abs/1603.09320) graph (in memory), the quantized vectors (in memory), and the full-fidelity vectors (on disk). To estimate the amount of memory used by the index at query-time, refer to the Required Memory metric.

## How to Ingest Pre-Quantized Vectors

MongoDB Vector Search also supports ingestion and indexing of scalar and binary quantized vectors from certain embedding models. If you don't already have quantized vectors, you can convert your embeddings to BSON (Binary Javascript Object Notation) [BinData](https://www.mongodb.com/docs/manual/reference/method/BinData.md#std-label-server-binData-method) vectors with `float32`, `int1`, or `int8` subtype.

### Use Cases

We recommend ingesting quantized BSON (Binary Javascript Object Notation) `binData` vectors for the following use cases:

- You need to index quantized vector output from embedding models.

- You have a large number of float vectors and want to reduce the storage and [WiredTiger](https://www.mongodb.com/docs/manual/core/wiredtiger.md#std-label-storage-wiredtiger) footprint (such as disk and memory usage) in `mongod`.

### Benefits

[BinData](https://www.mongodb.com/docs/manual/reference/method/BinData.md#std-label-server-binData-method) is a BSON (Binary Javascript Object Notation) data type that stores binary data. It compresses your vector embeddings and requires about three times less disk space in your cluster compared to embeddings that use a standard `float32` array. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

This subtype also allows you to index your vectors with alternate types such as `int1` or `int8` vectors, reducing the memory needed to build the MongoDB Vector Search index for your collection. It reduces the RAM for `mongot` by 3.75x for scalar and by 24x for binary; the vector values shrink by 4x and 32x respectively, but the [Hierarchical Navigable Small Worlds](https://arxiv.org/abs/1603.09320) graph itself doesn't shrink.

If you don't already have `binData` vectors, you can convert your embeddings to this format by using any supported driver before writing your data to a collection. The following procedure walks you through the steps for converting your embeddings to the [BinData](https://www.mongodb.com/docs/manual/reference/method/BinData.md#std-label-server-binData-method) vectors with `float32`, `int8`, and `int1` subtypes.

### Supported Drivers

BSON (Binary Javascript Object Notation) [BinData](https://www.mongodb.com/docs/manual/reference/method/BinData.md#std-label-server-binData-method) vectors with `float32`, `int1`, and `int8` subtypes is supported by the following drivers:

- [C++ Driver](https://www.mongodb.com/docs/languages/cpp/cpp-driver/current/) v4.1.0 or later

- [C#/.NET Driver](https://www.mongodb.com/docs/drivers/csharp/current/) v3.2.0 or later

- [Go Driver](https://www.mongodb.com/docs/drivers/go/current/) v2.1.0 or later

- [PyMongo Driver](https://www.mongodb.com/docs/drivers/pymongo/) v4.10 or later

- [Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/) v6.11 or later

- [Java Driver](https://www.mongodb.com/docs/drivers/java/sync/current/) v5.3.1 or later

### Prerequisites

The examples in this procedure use either new data or existing data and embeddings generated by using [Voyage AI's](https://www.voyageai.com/) `voyage-3-large` model. The example for new data uses sample text strings, which you can replace with your own data. The example for existing data uses a subset of documents without any embeddings from the `listingsAndReviews` collection in the `sample_airbnb` database, which you can replace with your own database and collection (with or without any embeddings).

Select whether you want to quantize `binData` vectors for new data or for data you already have in your cluster using the Data Source dropdown menu below. Select your preferred programming language as well.

To quantize your BSON (Binary Javascript Object Notation) `binData` vectors, you must have the following:

- A cluster running MongoDB version 6.0.11, 7.0.2, or later.

  Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

- Access to an embedding model that supports byte vector output.

  The outputs from the following embedding models can be used to generate BSON (Binary Javascript Object Notation) `binData` vectors with a supported MongoDB driver:

  | Embedding Model Provider | Embedding Model |
  | --- | --- |
  | [Voyage AI](https://www.voyageai.com/) | `voyage-3-large` |
  | [Cohere](https://cohere.com/) | `embed-english-v3.0` |
  | [Nomic](https://www.nomic.ai/) | `nomic-embed-text-v1.5` |
  | [Jina](https://jina.ai/) | `jina-embeddings-v2-base-en` |
  | [Mixedbread](https://www.mixedbread.ai/) | `mxbai-embed-large-v1` |

  Scalar quantization preserves recall for these models because these models are all trained to be quantization aware. Therefore, [recall](https://www.mongodb.com/docs/manual/reference/glossary.md#std-term-recall) degradation for scalar quantized embeddings produced by these models is minimal even at lower dimensions like 384.

* A terminal and code editor to run your Node.js project.

* [npm and Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

## Procedure

1. Update your `package.json` file.

   Configure your project to use [ES modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules) by adding `"type": "module"` to your `package.json` file and then saving it.

   ```javascript
   {
     "type": "module",
     // other fields...
   }
   ```

2. Install the required libraries.

   Run the following command to install the MongoDB [Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/) and the `dotenv` package. This operation might take a few minutes to complete.

   ```python
   npm install mongodb dotenv
   ```

   You must install [Node.js](https://www.mongodb.com/docs/drivers/node/current/) v6.11 or later driver.

   If necessary, you must also install libraries from your embedding model provider. In this tutorial, you use the Voyage AI REST API to generate embeddings. Therefore, you don't need to install any additional libraries for Voyage AI.

3. Initialize your Node.js project.

   In a terminal window, run the following commands to create a new directory named `my-quantization-project` and initialize your project:

   ```shell
   mkdir my-quantization-project
   cd my-quantization-project
   npm init -y
   ```

4. Set the environment variables in your terminal.

   To access the embedding model provider for generating and converting embeddings, set the environment variable for the embedding model provider's API key, if necessary.

   For using embeddings from Voyage AI, set up the `VOYAGE_API_KEY` environment variable. To learn how to get your API key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

   ```text
   export VOYAGE_API_KEY="<VOYAGEAI-API-KEY>"
   ```

   If you don't set the environment variable, replace the `<VOYAGE-API-KEY>` in the sample code with the API key before running the code.

   To access your cluster, set the `MONGODB_URI` environment variable.

   ```text
   export MONGODB_URI="<CONNECTION-STRING>"
   ```

   Your connection string should be in the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   If you don't set the environment variable, replace the `<CONNECTION-STRING>` in the sample code with your connection string before running the code.

5. Generate the vector embeddings for your data.

   Create a file named `get-embeddings.js` to generate `float32`, `int8`, and `int1` vector embeddings by using Voyage AI's `embed` API (Application Programming Interface).

   ```shell
   touch get-embeddings.js
   ```

   Copy and paste the following code in the `get-embeddings.js` file.

   This code does the following:

   - Generates `float32`, `int8`, and `int1` embeddings for the given data by using Voyage AI's `voyage-3-large` embedding model.

   - Stores the `float32`, `int8`, and `int1` embeddings in fields named `float`, `int8`, and `ubinary` respectively.

   - Creates a file named `embeddings.json` and saves the embeddings in the file.

   ```javascript
   import { writeFile } from "fs/promises"; // For saving JSON files  
     
   // Retrieve API key from environment or use placeholder value  
   const apiKey = process.env.VOYAGE_API_KEY || "<VOYAGE-API-KEY>";  
     
   if (!apiKey || apiKey === "<VOYAGE-API-KEY>") {  
     throw new Error("API key not found. Please set VOYAGE_API_KEY in your environment.");  
   }  
     
   // Define the Voyage AI REST API endpoint  
   const apiEndpoint = "https://ai.mongodb.com/v1/embeddings";  
     
   /**  
    * Fetch embeddings using Voyage AI REST API for a specific data type (output_dtype)  
    */  
   async function fetchEmbeddings(data, model, outputDtype, dimension) {  
     const response = await fetch(apiEndpoint, {  
       method: "POST",  
       headers: {  
         "Content-Type": "application/json",  
         Authorization: `Bearer ${apiKey}`,  
       },  
       body: JSON.stringify({  
         input: data,  
         model,  
         input_type: "document",  
         output_dtype: outputDtype,  
         output_dimension: dimension,  
       }),  
     });  
     
     // Check for non-success status codes  
     if (!response.ok) {  
       const errorResponse = await response.text();  
       throw new Error(`API request failed with status ${response.status}: ${errorResponse}`);  
     }  
     
     const responseData = await response.json();  
     
     // Ensure the response contains valid data  
     if (!responseData.data || !Array.isArray(responseData.data)) {  
       throw new Error(`Invalid API response for dtype "${outputDtype}": 'data' array is missing.`);  
     }  
     
     // Extract embeddings from the response  
     const embeddings = responseData.data.map((item) => item.embedding);  
     
     // Validate embeddings  
     if (!Array.isArray(embeddings) || embeddings.length !== data.length) {  
       throw new Error(`Invalid embeddings received for dtype "${outputDtype}".`);  
     }  
     
     return embeddings; // Return embeddings for the requested dtype  
   }  
     
   /**  
    * Generate embeddings for predefined texts and save them to a JSON file  
    */  
   async function generateEmbeddings() {  
     const data = [  
       "The Great Wall of China is visible from space.",  
       "The Eiffel Tower was completed in Paris in 1889.",  
       "Mount Everest is the highest peak on Earth at 8,848m.",  
       "Shakespeare wrote 37 plays and 154 sonnets during his lifetime.",  
       "The Mona Lisa was painted by Leonardo da Vinci.",  
     ];  
     
     const model = "voyage-3-large";  
     const dimension = 1024; // Output embedding dimension  
     
     try {  
       // Fetch embeddings for different output types  
       const floatEmbeddings = await fetchEmbeddings(data, model, "float", dimension);  
       const int8Embeddings = await fetchEmbeddings(data, model, "int8", dimension); // Use "int8" dtype  
       const ubinaryEmbeddings = await fetchEmbeddings(data, model, "ubinary", dimension); // Use "ubinary" dtype  
     
       // Map embeddings to their corresponding texts  
       const embeddingsData = data.map((text, index) => ({  
         text,  
         embeddings: {  
           float: floatEmbeddings[index], // Store float embeddings  
           int8: int8Embeddings[index], // Store int8 embeddings  
           ubinary: ubinaryEmbeddings[index], // Store ubinary embeddings  
         },  
       }));  
     
       // Save embeddings to a JSON file  
       const fileName = "embeddings.json";  
       await writeFile(fileName, JSON.stringify(embeddingsData, null, 2));  
       console.log(`Embeddings saved to ${fileName}`);  
     } catch (error) {  
       console.error("Error during embedding generation:", error.message);  
       throw error; // Optionally rethrow to halt execution if desired  
     }  
   }  
     
   // Main process  
   (async function main() {  
     try {  
       await generateEmbeddings(); // Execute embedding generation  
     } catch (error) {  
       console.error("Error in main process:", error.message);  
     }  
   })();  

   ```

   Replace the `<VOYAGE_API_KEY>` placeholder if you didn't set your API Key for Voyage AI as an environment variable and then save the file.

   Run the code to generate embeddings.

   ```shell
   node get-embeddings.js
   ```

   **Output:**

   ```shell
    Embeddings saved to embeddings.json
   ```

   Verify the generated embeddings in the generated `embeddings.json` file.

6. Convert the vector embeddings to `binData` vectors.

   Create a file named `convert-embeddings.js` to convert the `float32`, `int8`, and `int1` vector embeddings from Voyage AI to BSON (Binary Javascript Object Notation) `binData` vectors by using the [MongoDB Node.js](https://www.mongodb.com/docs/drivers/node/current/) driver.

   ```shell
   touch convert-embeddings.js
   ```

   Copy and paste the following code in the `convert-embeddings.js` file.

   This code does the following:

   - Generates BSON (Binary Javascript Object Notation) `binData` vectors for the `float32`, `int8`, and `int1` embeddings.

   - Appends the `float32`, `int8`, and `ubinary` BSON (Binary Javascript Object Notation) `binData` vectors to the `embeddings.json` file.

   ```javascript
   import fs from "fs/promises"; 
   import { BSON } from "mongodb"; 
   const { Binary } = BSON; 
     
   async function main() {  
     try {  
       // Read the contents of the original 'embeddings.json' file  
       const fileContent = await fs.readFile("embeddings.json", "utf8");  
       const embeddingsData = JSON.parse(fileContent); // Parse JSON into a JavaScript object  
     
       // Validate the structure of the original input data  
       if (!Array.isArray(embeddingsData)) {  
         throw new Error("'embeddings.json' must contain an array of objects.");  
       }  
     
       // Convert embeddings to BSON-compatible format  
       const convertEmbeddingsData = embeddingsData.map(({ text, embeddings }) => {  
         // Field validation to ensure all required embeddings are present  
         if (  
           !embeddings ||  
           !Array.isArray(embeddings.float) ||  
           !Array.isArray(embeddings.int8) ||  
           !Array.isArray(embeddings.ubinary)  
         ) {  
           throw new Error(`Embeddings are missing or invalid for text: "${text}"`);  
         }  
     
         // Convert embeddings to BSON-compatible binary format  
         const bsonFloat32 = Binary.fromFloat32Array(new Float32Array(embeddings.float));  
         const bsonInt8 = Binary.fromInt8Array(new Int8Array(embeddings.int8));  
         const bsonPackedBits = Binary.fromPackedBits(new Uint8Array(embeddings.ubinary));  
     
         // Return the updated object structure  
         return {  
           text,  
           embeddings: {  // Original embeddings
             float: embeddings.float, 
             int8: embeddings.int8,  
             ubinary: embeddings.ubinary,  
           },  
           bsonEmbeddings: {  // BSON embeddings
             float32: bsonFloat32, 
             int8: bsonInt8,
             packedBits: bsonPackedBits, 
           },  
         };  
       });  
     
       // Serialize the updated data to BSON-compatible JSON using EJSON  
       const ejsonSerializedData = BSON.EJSON.stringify(convertEmbeddingsData, null, 2, { relaxed: false });  
     
       // Write the updated BSON-converted data back to the same 'embeddings.json' file  
       await fs.writeFile("embeddings.json", ejsonSerializedData);  
     
       console.log("Embeddings with BSON vectors have been saved to embeddings.json");  
     } catch (error) {  
       // Print detailed error information  
       console.error("Error processing embeddings:", error);  
     }  
   }  
     
   // Execute the conversion process  
   main();  

   ```

   Run the program to generate the BSON (Binary Javascript Object Notation) `binData` vectors.

   ```shell
   node convert-embeddings.js
   ```

   **Output:**

   ```shell
   Embeddings with BSON vectors have been saved to embeddings.json
   ```

   Verify the generated BSON (Binary Javascript Object Notation) embeddings in the `embeddings.json` file.

7. Connect to the cluster and upload the data to a collection.

   Create a file named `upload-data.js` to connect to your cluster and create a collection  in a database for the data in the `embeddings.json` file.

   ```shell
   touch upload-data.js
   ```

   Copy and paste the following code in the `upload-data.js` file.

   This code does the following:

   - Connects to your cluster and creates a namespace with the database and collection name that you specify.

   - Uploads the data including the embeddings in the `embeddings.json` file to the specified namespace.

   ```javascript
   import fs from 'fs/promises';  
   import { MongoClient, BSON } from 'mongodb';  
   const { Binary } = BSON; 

   async function main() {
       const MONGODB_URI = process.env.MONGODB_URI || "<CONNECTION-STRING>";
       const DB_NAME = "<DATABASE-NAME>";
       const COLLECTION_NAME = "<COLLECTION-NAME>";

       let client;
       try {
           client = new MongoClient(MONGODB_URI);
           await client.connect();
           console.log("Connected to MongoDB");

           const db = client.db(DB_NAME);
           const collection = db.collection(COLLECTION_NAME);

           // Read and parse the contents of 'embeddings.json' file using EJSON
           const fileContent = await fs.readFile('embeddings.json', 'utf8');
           const embeddingsData = BSON.EJSON.parse(fileContent);

           // Map embeddings data to recreate BSON binary representations with the correct subtype
           const documents = embeddingsData.map(({ text, bsonEmbeddings }) => {
               return {
                   text,
                   bsonEmbeddings: {
                       float32: bsonEmbeddings.float32,
                       int8: bsonEmbeddings.int8,
                       int1: bsonEmbeddings.packedBits
                   }
               };
           });

           const result = await collection.insertMany(documents);
           console.log(`Inserted ${result.insertedCount} documents into MongoDB`);

       } catch (error) {
           console.error('Error storing embeddings in MongoDB:', error);
       } finally {
           if (client) {
               await client.close();
           }
       }
   }

   // Run the store function
   main();

   ```

   Replace the following settings and save the file.

   | `<CONNECTION-STRING>` | Connection string to connect to the cluster where you want to create the database and collection. Replace this value only if you didn't set the `MONGODB_URI` environment variable. |
   | --- | --- |
   | `<DB-NAME>` | Name of the database where you want to create the collection. |
   | `<COLLECTION-NAME>` | Name of the collection where you want to store the generated embeddings. |

   Run the following command to upload the data.

   ```shell
   node upload-data.js
   ```

   Verify that the documents exist in the collection on your cluster.

8. Create the MongoDB Vector Search index on the collection.

   Create a file named `create-index.js` to define a MongoDB Vector Search index on the collection.

   ```shell
   touch create-index.js
   ```

   Copy and paste the following code to create the index in the `create-index.js` file.

   The code does the following:

   - Connects to the cluster and creates an index with the specified name for the specified namespace.

   - Indexes the `bsonEmbeddings.float32` and `bsonEmbeddings.int8` fields as `vector` type that uses the `dotProduct` similarity function, and the `bsonEmbeddings.int1` field also as `vector` type that uses the `euclidean` function.

   ```javascript
   import { MongoClient, BSON } from "mongodb";  
   import { setTimeout } from "timers/promises";  

   // Connect to your MongoDB cluster
   const uri = process.env.MONGODB_URI || "<CONNECTION-STRING>";

   const client = new MongoClient(uri);

   async function main() {
     try {
       const DB_NAME = "<DATABASE-NAME>";
       const COLLECTION_NAME = "<COLLECTION-NAME>";
       const db = client.db(DB_NAME);
       const collection = db.collection(COLLECTION_NAME);

       // define your MongoDB Vector Search index
       const index = {
         name: "<INDEX-NAME>",
         type: "vectorSearch",
         definition: {
           fields: [
             {
               type: "vector",
               numDimensions: 1024,
               path: "bsonEmbeddings.float32",
               similarity: "dotProduct",
             },
             {
               type: "vector",
               numDimensions: 1024,
               path: "bsonEmbeddings.int8",
               similarity: "dotProduct",
             },
             {
               type: "vector",
               numDimensions: 1024,
               path: "bsonEmbeddings.int1",
               similarity: "euclidean",
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

   Replace the following settings and save the file.

   | `<CONNECTION-STRING>` | Connection string to connect to the cluster where you want to create the index. Replace this value only if you didn't set the `MONGODB_URI` environment variable. |
   | --- | --- |
   | `<DB-NAME>` | Name of the database where you want to create the collection. |
   | `<COLLECTION-NAME>` | Name of the collection where you want to store the generated embeddings. |
   | `<INDEX-NAME>` | Name of the index for the collection. |

   Create the index.

   ```shell
   node create-index.js
   ```

9. Generate the embeddings for the query text.

   Create a file named `get-query-embedding.js`.

   ```shell
   touch get-query-embeddings.js
   ```

   Copy and paste the code in the `get-query-embedding.js` file.

   The sample code does the following:

   - Generates `float32`, `int8`, and `int1` embeddings for the query text by using Voyage AI.

   - Converts the generated embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using PyMongo.

   - Saves the generated embeddings to a file named `query-embeddings.json`.

   ```javascript
   import { BSON } from "mongodb"; 
   import { writeFile } from "fs/promises"; 
   import dotenv from "dotenv";  
     
   // Load environment variables  
   dotenv.config();  
     
   const { Binary, EJSON } = BSON; // Import BSON utilities  
     
   // Set your API key from environment or fallback to hardcoded value (not recommended for production)  
   const apiKey = process.env.VOYAGE_API_KEY || "<VOYAGEAI-API-KEY>";  
   const QUERY_TEXT = <QUERY-TEXT>;
     
   if (!apiKey || apiKey === "<VOYAGEAI-API-KEY>") {  
     throw new Error("API key not found. Provide the VOYAGEAI_API_KEY in environment variables.");  
   }  
     
   // Define the Voyage AI REST API endpoint  
   const apiEndpoint = "https://ai.mongodb.com/v1/embeddings";  
     
   /**  
    * Fetch embeddings using Voyage AI REST API  
    */  
   async function fetchEmbeddings(data, model, inputType, outputDtype, outputDimension) {  
     try {  
       const response = await fetch(apiEndpoint, {  
         method: "POST",  
         headers: {  
           "Content-Type": "application/json",  
           Authorization: `Bearer ${apiKey}`,  
         },  
         body: JSON.stringify({  
           input: data,  
           model,  
           input_type: inputType,  
           output_dtype: outputDtype,  
           output_dimension: outputDimension,  
         }),  
       });  
     
       // Check for non-success status codes  
       if (!response.ok) {  
         const errorResponse = await response.text();  
         throw new Error(`API request failed with status ${response.status}: ${errorResponse}`);  
       }  
     
       const responseData = await response.json();  
     
       // Ensure the response contains valid data  
       if (!responseData.data || !Array.isArray(responseData.data)) {  
         console.error("Full API Response:", responseData);  
         throw new Error("Embeddings are not present or not returned in array format.");  
       }  
     
       return responseData.data.map((item) => item.embedding); // Extract embeddings  
     } catch (error) {  
       console.error(`Error fetching embeddings for output_dtype "${outputDtype}":`, error);  
       throw error;  
     }  
   }  
     
   /**  
    * Create BSON Binary objects using VECTOR_TYPE for all embedding types  
    */  
   function convertEmbeddingsToBSON(data, float, int8, ubinary) {  
     return data.map((text, index) => ({  
       text,  
       bsonEmbeddings: {  
         float32: Binary.fromFloat32Array(new Float32Array(float[index])),  
         int8: Binary.fromInt8Array(new Int8Array(int8[index])),  
         int1: Binary.fromPackedBits(new Uint8Array(ubinary[index])),  
       },  
     }));  
   }  
     
   /**  
    * Serialize BSON embeddings and save to JSON file  
    */  
   async function saveBSONEmbeddingsToFile(bsonEmbeddingsData, outputFileName) {  
     try {  
       // Serialize BSON data to JSON format using EJSON  
       const ejsonSerializedData = EJSON.stringify(bsonEmbeddingsData, null, 2, {  
         relaxed: true, // Store binary as raw binary data without base64 encoding  
       });  
     
       // Write serialized data to a file  
       await writeFile(outputFileName, ejsonSerializedData);  
       console.log(`Embeddings with BSON vectors have been saved to ${outputFileName}`);  
     } catch (error) {  
       console.error(`Error saving BSON embeddings to file "${outputFileName}":`, error);  
       throw error;  
     }  
   }  
     
   /**  
    * Process query text, fetch embeddings, convert to BSON, and write to JSON  
    */  
   async function main(queryText) {  
     try {  
       if (!queryText || typeof queryText !== "string" || queryText.trim() === "") {  
         throw new Error("Invalid query text. It must be a non-empty string.");  
       }  
     
       const data = [queryText];  
       const model = "voyage-3-large";  
       const inputType = "query";  
       const dimension = 1024;  
     
       // Fetch embeddings for different data types  
       const floatEmbeddings = await fetchEmbeddings(data, model, inputType, "float", dimension);  
       const int8Embeddings = await fetchEmbeddings(data, model, inputType, "int8", dimension);  
       const packedBitsEmbeddings = await fetchEmbeddings(data, model, inputType, "ubinary", dimension);  
     
       // Convert embeddings into BSON-compatible format  
       const bsonEmbeddingsData = convertEmbeddingsToBSON(  
         data,  
         floatEmbeddings,  
         int8Embeddings,  
         packedBitsEmbeddings  
       );  
     
       // Save BSON embeddings to JSON file  
       const outputFileName = "query-embeddings.json";  
       await saveBSONEmbeddingsToFile(bsonEmbeddingsData, outputFileName);  
     } catch (error) {  
       console.error("Error processing query text:", error);  
     }  
   }  
     
   // Main function invocation  
   (async () => {  
     const queryText = QUERY-TEXT; 
     await main(queryText);  
   })();  

   ```

   Replace the following settings and save the file.

   | `<VOYAGE-API-KEY>` | Your API Key for Voyage AI. Only replace this value if you didn't set the environment variable. |
   | --- | --- |
   | `<QUERY-TEXT>` | Your query text. For this tutorial, use `science fact`. |

   Run the code to generate the embeddings for the query text.

   ```shell
   node get-query-embeddings.js
   ```

   **Output:**

   ```shell
   Embeddings with BSON vectors have been saved to query-embeddings.json
   ```

10. Run a MongoDB Vector Search query.

    Create a file named `run-query.js`.

    ```shell
    touch run-query.js
    ```

    Copy and paste the following sample [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query in the `run-query.js` file.

    The sample query does the following:

    - Connects to your cluster and runs the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query against the `bsonEmbeddings.float32`, `bsonEmbeddings.int8`, and `bsonEmbeddings.int1` fields in the specified collection by using the embeddings in the `query-embeddings.json` file.

    - Prints the results from Float32, Int8, and Packed Binary (Int1) embeddings to the console.

    ```javascript
    import { MongoClient } from "mongodb";  
    import fs from "fs/promises";  
    import { BSON } from "bson"; // Use the BSON package for EJSON parsing  
    import dotenv from "dotenv";  
      
    dotenv.config();  
      
    // MongoDB connection details  
    const mongoUri = process.env.MONGODB_URI || "<CONNECTION-STRING>";  
    const dbName = "<DATABASE-NAME>";  
    const collectionName = "<COLLECTION-NAME>";  
    const VECTOR_INDEX_NAME = "<INDEX-NAME>"; 
    const NUM_CANDIDATES = <NUMBER-OF-CANDIDATES-TO-CONSIDER>; 
    const LIMIT = <NUMBER-OF-DOCUMENTS-TO-RETURN>;  
    const dataField = "<TEXT-FIELD-NAME>";
      
    // Fields in the collection containing BSON-compatible query vectors  
    const FIELDS = [  
      { path: "float32", subtype: 9 },  
      { path: "int8", subtype: 9 },  
      { path: "int1", subtype: 9 },  
    ];  
      
    async function main() {  
      const client = new MongoClient(mongoUri);  
      
      try {  
        await client.connect();  
        console.log("Connected to MongoDB");  
      
        const db = client.db(dbName);  
        const collection = db.collection(collectionName);  
      
        // Read the query embeddings from the JSON file  
        const fileContent = await fs.readFile("query-embeddings.json", "utf8");  
        const embeddingsData = BSON.EJSON.parse(fileContent, { relaxed: true });  
      
        if (!Array.isArray(embeddingsData) || embeddingsData.length === 0) {  
          throw new Error("No embeddings found in the JSON file");  
        }  
      
        const results = {};  
      
        // Perform vector search for each embedding type  
        for (const field of FIELDS) {  
          const { path } = field;  
          const bsonBinary = embeddingsData[0]?.bsonEmbeddings?.[path];  
      
          if (!bsonBinary) {  
            console.warn(`Embedding for path "${path}" not found. Skipping.`);  
            continue;  
          }  
      
          const pipeline = [  
            {  
              $vectorSearch: {  
                index: VECTOR_INDEX_NAME,  
                path: `bsonEmbeddings.${path}`,  
                queryVector: bsonBinary, // Direct raw binary  
                numCandidates: NUM_CANDIDATES,  
                limit: LIMIT,  
              },  
            },  
            {  
              $project: {  
                _id: 0,  
                [dataField]: 1,  
                score: { $meta: "vectorSearchScore" },  
              },  
            },  
          ];  
      
          console.log(`Running vector search using "${path}" embedding...`);  
          results[path] = await collection.aggregate(pipeline).toArray();  
        }  
      
        return results;  
      } catch (error) {  
        console.error("Error during vector search:", error);  
      } finally {  
        await client.close();  
        console.log("MongoDB connection closed");  
      }  
    }  
      
    // Parse and display search results for each embedding type  
    (async () => {  
      const results = await main();  
      
      if (results) {  
        console.log("Results from Float32 embeddings:");
        (results.float32 || []).forEach((result, index) => {
          console.log(`Result ${index + 1}:`, result);
        });

        console.log("Results from Int8 embeddings:");
        (results.int8 || []).forEach((result, index) => {
          console.log(`Result ${index + 1}:`, result);
        });

        console.log("Results from Int1 (PackedBits) embeddings:");
        (results.int1 || []).forEach((result, index) => {
          console.log(`Result ${index + 1}:`, result);
        });  
      }  
    })();  

    ```

    Replace the following settings and save the `run-query.js` file.

    | `<CONNECTION-STRING>` | Connection string to connect to the Atlas cluster where you want to run the query. Replace this value only if you didn't set the `MONGODB_URI` environment variable. |
    | --- | --- |
    | `<DB-NAME>` | Name of the database which contains the collection. |
    | `<COLLECTION-NAME>` | Name of the collection that you want to query. |
    | `<INDEX-NAME>` | Name of the index for the collection. |
    | `<NUMBER-OF-CAANDIDATES-TO-CONSIDER>` | Number of nearest neighbors to consider during the search. For this example, specify `5`. |
    | `<NUMBER-OF-DOCUMENTS-TO-RETURN>` | Number of results to return. For this example, specify `2`. |
    | `<TEXT-FIELD-NAME>` | Name of the field that contains the text data. For this example, specify `text`. |

    Run the following command to execute the query.

    ```shell
    node run-query.js
    ```

    **Output:**

    ```shell
    Connected to MongoDB
    Running vector search using "float32" embedding...
    Running vector search using "int8" embedding...
    Running vector search using "int1" embedding...
    MongoDB connection closed
    Results from Float32 embeddings:
    Result 1: {
      text: 'The Great Wall of China is visible from space.',
      score: 0.7719700336456299
    }
    Result 2: {
      text: 'Mount Everest is the highest peak on Earth at 8,848m.',
      score: 0.735608696937561
    }
    Results from Int8 embeddings:
    Result 1: {
      text: 'The Great Wall of China is visible from space.',
      score: 0.5051995515823364
    }
    Result 2: {
      text: 'Mount Everest is the highest peak on Earth at 8,848m.',
      score: 0.5044659972190857
    }
    Results from Int1 (PackedBits) embeddings:
    Result 1: {
      text: 'The Great Wall of China is visible from space.',
      score: 0.6845703125
    }
    Result 2: {
      text: 'Mount Everest is the highest peak on Earth at 8,848m.',
      score: 0.6650390625
    }
    ```

To quantize your BSON (Binary Javascript Object Notation) `binData` vectors, you must have the following:

- A cluster running MongoDB version 6.0.11, 7.0.2, or later.

  Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

- Access to an embedding model that supports byte vector output.

  The outputs from the following embedding models can be used to generate BSON (Binary Javascript Object Notation) `binData` vectors with a supported MongoDB driver:

  | Embedding Model Provider | Embedding Model |
  | --- | --- |
  | [Voyage AI](https://www.voyageai.com/) | `voyage-3-large` |
  | [Cohere](https://cohere.com/) | `embed-english-v3.0` |
  | [Nomic](https://www.nomic.ai/) | `nomic-embed-text-v1.5` |
  | [Jina](https://jina.ai/) | `jina-embeddings-v2-base-en` |
  | [Mixedbread](https://www.mixedbread.ai/) | `mxbai-embed-large-v1` |

  Scalar quantization preserves recall for these models because these models are all trained to be quantization aware. Therefore, [recall](https://www.mongodb.com/docs/manual/reference/glossary.md#std-term-recall) degradation for scalar quantized embeddings produced by these models is minimal even at lower dimensions like 384.

* A terminal and code editor to run your Node.js project.

* [npm and Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

## Procedure

1. Update your `package.json` file.

   Configure your project to use [ES modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules) by adding `"type": "module"` to your `package.json` file and then saving it.

   ```javascript
   {
     "type": "module",
     // other fields...
   }
   ```

2. Install the required libraries.

   Run the following command to install the MongoDB [Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/) and the `dotenv` package. This operation might take a few minutes to complete.

   ```python
   npm install mongodb dotenv
   ```

   You must install [Node.js](https://www.mongodb.com/docs/drivers/node/current/) v6.11 or later driver.

   If necessary, you must also install libraries from your embedding model provider. In this tutorial, you use the Voyage AI REST API to generate embeddings. Therefore, you don't need to install any additional libraries for Voyage AI.

3. Initialize your Node.js project.

   In a terminal window, run the following commands to create a new directory named `my-quantization-project` and initialize your project:

   ```shell
   mkdir my-quantization-project
   cd my-quantization-project
   npm init -y
   ```

4. Set the environment variables in your terminal.

   To access the embedding model provider for generating and converting embeddings, set the environment variable for the embedding model provider's API key, if necessary.

   For using embeddings from Voyage AI, set up the `VOYAGE_API_KEY` environment variable. To learn how to get your API key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

   ```text
   export VOYAGE_API_KEY="<VOYAGEAI-API-KEY>"
   ```

   If you don't set the environment variable, replace the `<VOYAGE-API-KEY>` in the sample code with the API key before running the code.

   To access your cluster, set the `MONGODB_URI` environment variable.

   ```text
   export MONGODB_URI="<CONNECTION-STRING>"
   ```

   Your connection string should be in the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   If you don't set the environment variable, replace the `<CONNECTION-STRING>` in the sample code with your connection string before running the code.

5. Fetch the data from your cluster.

   Create a file named `get-data.js`.

   ```shell
   touch get-data.js
   ```

   Copy and paste the following sample code to fetch the data from the `sample_airbnb.listingsAndReviews` namespace in your cluster.

   The sample code does the following:

   - Connects to your cluster and finds documents with the `summary` field.

   - Creates a file named `subset.json` to which it writes the data from the collection.

   ```javascript
   import { MongoClient, BSON } from 'mongodb'; 
   import fs from 'fs/promises';
   import { writeFile } from "fs/promises"; 
     
   async function main() {  
     // Replace with your MongoDB connection string
     const uri = process.env.MONGODB_URI || '<CONNECTION-STRING>';

     // Create a new MongoClient instance
     const client = new MongoClient(uri);

     try {
       // Connect to your MongoDB cluster
       await client.connect();
     
       // Specify the database and collection  
       const db = client.db('sample_airbnb');  
       const collection = db.collection('listingsAndReviews');  
     
       // Filter to exclude null or empty summary fields  
       const filter = { summary: { $nin: [null, ''] } };  
     
       // Get a subset of documents in the collection  
       const documentsCursor = collection.find(filter).limit(50);  
     
       // Convert the cursor to an array to get the documents  
       const documents = await documentsCursor.toArray();  
     
       // Write the documents to a local file called "subset.json"  
       const outputFilePath = './subset.json';  
       fs.writeFile(outputFilePath, JSON.stringify(documents, null, 2), 'utf-8');  
     
       // Print the count of documents written to the file  
       console.log(`Written ${documents.length} documents to ${outputFilePath}`);  
     } catch (error) {  
       console.error('An error occurred:', error);  
     } finally {  
       // Ensure the client is closed when finished  
       await client.close();  
     }  
   }  
     
   main().catch(console.error);  


   ```

   Replace the `<CONNECTION-STRING>` placeholder if you didn't set the environment variable for your Atlas connection string and then save the file.

   Run the following command to fetch the data:

   ```shell
   node get-data.js
   ```

   **Output:**

   ```shell
   Subset of documents written to: ./subset.json
   ```

6. Generate the vector embeddings for your data.

   If you already have `float32`, `int8`, or `int1` vector embeddings in your collection, skip this step.

   Create a file named `get-embeddings.js` to generate `float32`, `int8`, and `int1` vector embeddings by using Voyage AI's `embed` API (Application Programming Interface).

   ```shell
   touch get-embeddings.js
   ```

   Copy and paste the following code in the `get-embeddings.js` file.

   This code does the following:

   - Generates `float32`, `int8`, and `int1` embeddings for the given data by using Voyage AI's `embed-english-v3.0` embedding model.

   - Stores the `float32`, `int8`, and `int1` embeddings in fields named `float`, `int8`, and `ubinary` respectively.

   - Creates a file named `embeddings.json` and saves the embeddings in the file.

   ```javascript
   import { readFile, writeFile } from "fs/promises"; 
   import dotenv from "dotenv"; 
   import fetch from "node-fetch"; 
     
   // Load environment variables from `.env` file  
   dotenv.config();  
     
   // Set up API key from environment or fallback to hardcoded value 
   const apiKey = process.env.VOYAGE_API_KEY || "<VOYAGE-API-KEY>";  
     
   if (!apiKey || apiKey === "<VOYAGE-API-KEY>") {  
     throw new Error("API key not found. Please set VOYAGE_API_KEY in your environment.");  
   }  
     
   // Define the Voyage AI REST API endpoint  
   const apiEndpoint = "https://ai.mongodb.com/v1/embeddings";  
     
   /**  
    * Fetch embeddings using Voyage AI REST API for a specific output data type  
    */  
   async function fetchEmbeddings(data, model, outputDtype, dimension) {  
     const response = await fetch(apiEndpoint, {  
       method: "POST",  
       headers: {  
         "Content-Type": "application/json",  
         Authorization: `Bearer ${apiKey}`,  
       },  
       body: JSON.stringify({  
         input: data,  
         model,  
         input_type: "document",  
         output_dtype: outputDtype, 
         output_dimension: dimension, 
       }),  
     });  
     
     // Check for non-success status codes  
     if (!response.ok) {  
       const errorResponse = await response.text();  
       throw new Error(`API request failed with status ${response.status}: ${errorResponse}`);  
     }  
     
     const responseData = await response.json();  
     
     // Ensure the response contains valid data  
     if (!responseData.data || !Array.isArray(responseData.data)) {  
       throw new Error(`Invalid API response for dtype "${outputDtype}": 'data' array is missing.`);  
     }  
     
     // Extract embeddings from the response  
     const embeddings = responseData.data.map((item) => item.embedding);  
     
     // Validate embeddings  
     if (!Array.isArray(embeddings) || embeddings.length !== data.length) {  
       throw new Error(`Invalid embeddings received for dtype "${outputDtype}".`);  
     }  
     
     return embeddings; // Return embeddings for the requested dtype  
   }  
     
   /**  
    * Main function to read input data, fetch embeddings, and save them to JSON  
    */  
   async function main() {  
     try {  
       // Read and parse the contents of `subset.json`  
       const subsetData = await readFile("subset.json", "utf-8");  
       const documents = JSON.parse(subsetData);  
     
       // Extract the `summary` fields and keep only non-empty strings  
       const data = documents  
         .map((doc) => doc.summary)  
         .filter((summary) => typeof summary === "string" && summary.trim().length > 0);  
     
       // If no valid data is found, throw an error  
       if (data.length === 0) {  
         throw new Error("No valid summary texts available in the input file.");  
       }  
     
       // Configuration for embeddings  
       const model = "voyage-3-large";   
       const dimension = 1024;          
     
       // Fetch embeddings for different output types (float, int8, ubinary)  
       const floatEmbeddings = await fetchEmbeddings(data, model, "float", dimension);  
       const int8Embeddings = await fetchEmbeddings(data, model, "int8", dimension);  
       const ubinaryEmbeddings = await fetchEmbeddings(data, model, "ubinary", dimension);  
     
       // Map embeddings to their corresponding texts  
       const embeddingsData = data.map((text, index) => ({  
         text,  
         embeddings: {  
           float: floatEmbeddings[index],
           int8: int8Embeddings[index],   
           ubinary: ubinaryEmbeddings[index], 
         },  
       }));  
     
       // Save embeddings to a JSON file  
       const fileName = "embeddings.json";  
       await writeFile(fileName, JSON.stringify(embeddingsData, null, 2));  
       console.log(`Embeddings saved to ${fileName}`);  
     } catch (error) {  
       console.error("Error during embedding generation:", error.message);  
     }  
   }  
     
   // Execute the main function  
   main();  

   ```

   If you didn't set the environment variable for your Voyage AI API Key, replace the `<VOYAGEAI-API-KEY>` placeholder and save the file.

   Run the code to generate the embeddings.

   ```shell
   node get-embeddings.js
   ```

   **Output:**

   ```shell
    Embeddings saved to embeddings.json
   ```

   Verify the generated embeddings by opening the generated `embeddings.json` file.

7. Convert the vector embeddings to `binData` vectors.

   Create a file named `convert-embeddings.js` to convert the `float32`, `int8`, and `int1` vector embeddings from Voyage AI to BSON (Binary Javascript Object Notation) `binData` vectors.

   ```shell
   touch convert-embeddings.js
   ```

   Copy and paste the following code in the `convert-embeddings.js` file.

   This code does the following:

   - Generates BSON (Binary Javascript Object Notation) `binData` vectors for the `float32`, `int8`, and `int1` embeddings.

   - Appends the `float32`, `int8`, and `ubinary` BSON (Binary Javascript Object Notation) `binData` vectors to the `embeddings.json` file.

   ```javascript
   import fs from "fs/promises"; 
   import { BSON } from "mongodb"; 
   const { Binary } = BSON; 
     
   async function main() {  
     try {  
       // Read the contents of the original 'embeddings.json' file  
       const fileContent = await fs.readFile("embeddings.json", "utf8");  
       const embeddingsData = JSON.parse(fileContent); // Parse JSON into a JavaScript object  
     
       // Validate the structure of the original input data  
       if (!Array.isArray(embeddingsData)) {  
         throw new Error("'embeddings.json' must contain an array of objects.");  
       }  
     
       // Convert embeddings to BSON-compatible format  
       const convertEmbeddingsData = embeddingsData.map(({ text, embeddings }) => {  
         // Field validation to ensure all required embeddings are present  
         if (  
           !embeddings ||  
           !Array.isArray(embeddings.float) ||  
           !Array.isArray(embeddings.int8) ||  
           !Array.isArray(embeddings.ubinary)  
         ) {  
           throw new Error(`Embeddings are missing or invalid for text: "${text}"`);  
         }  
     
         // Convert embeddings to BSON-compatible binary format  
         const bsonFloat32 = Binary.fromFloat32Array(new Float32Array(embeddings.float));  
         const bsonInt8 = Binary.fromInt8Array(new Int8Array(embeddings.int8));  
         const bsonPackedBits = Binary.fromPackedBits(new Uint8Array(embeddings.ubinary));  
     
         // Return the updated object structure  
         return {  
           text,  
           embeddings: {  // Original embeddings
             float: embeddings.float, 
             int8: embeddings.int8,  
             ubinary: embeddings.ubinary,  
           },  
           bsonEmbeddings: {  // BSON embeddings
             float32: bsonFloat32, 
             int8: bsonInt8,
             packedBits: bsonPackedBits, 
           },  
         };  
       });  
     
       // Serialize the updated data to BSON-compatible JSON using EJSON  
       const ejsonSerializedData = BSON.EJSON.stringify(convertEmbeddingsData, null, 2, { relaxed: false });  
     
       // Write the updated BSON-converted data back to the same 'embeddings.json' file  
       await fs.writeFile("embeddings.json", ejsonSerializedData);  
     
       console.log("Embeddings with BSON vectors have been saved to embeddings.json");  
     } catch (error) {  
       // Print detailed error information  
       console.error("Error processing embeddings:", error);  
     }  
   }  
     
   // Execute the conversion process  
   main();  

   ```

   Run the program to generate the BSON (Binary Javascript Object Notation) `binData` vectors.

   ```shell
   node convert-embeddings.js
   ```

   **Output:**

   ```shell
   Embeddings with BSON vectors have been saved to embeddings.json
   ```

   Verify the generated BSON (Binary Javascript Object Notation) embeddings in the `embeddings.json` file.

8. Connect to the cluster and upload the data to the namespace.

   Create a file named `upload-data.js` to connect to your cluster and upload the data to the `sample_airbnb.listingsAndReviews` namespace.

   ```shell
   touch upload-data.js
   ```

   Copy and paste the following code in the `upload-data.js` file.

   This code does the following:

   - Connects to your cluster and creates a namespace with the database and collection name that you specify.

   - Uploads the data including the embeddings into the `sample_airbnb.listingsAndReviews` namespace.

   ```javascript
   import fs from 'fs/promises'; 
   import { MongoClient, BSON } from 'mongodb'; 
   import { EJSON, Binary } from 'bson'; 

   async function main() {
     const MONGODB_URI = process.env.MONGODB_URI || "<CONNECTION-STRING>";
     const DB_NAME = "sample_airbnb";
     const COLLECTION_NAME = "listingsAndReviews";

     let client;
     try {
       // Connect to MongoDB
       client = new MongoClient(MONGODB_URI);
       await client.connect();
       console.log("Connected to MongoDB");

       // Access database and collection
       const db = client.db(DB_NAME);
       const collection = db.collection(COLLECTION_NAME);

       // Load embeddings from JSON using EJSON.parse
       const fileContent = await fs.readFile('embeddings.json', 'utf8');
       const embeddingsData = EJSON.parse(fileContent); // Use EJSON.parse

       // Map embeddings data to recreate BSON binary representations
       const documents = embeddingsData.map(({ text, bsonEmbeddings }) => {
         return {
           summary: text,
           bsonEmbeddings: {
             float32: bsonEmbeddings.float32,
             int8: bsonEmbeddings.int8,
             int1: bsonEmbeddings.packedBits
           }
         };
       });

       // Iterate over documents and upsert each into the MongoDB collection
       for (const doc of documents) {
         const filter = { summary: doc.summary };
         const update = { $set: doc };

         // Update the document with the BSON binary data
         const result = await collection.updateOne(filter, update, { upsert: true });
         if (result.matchedCount > 0) {
           console.log(`Updated document with summary: ${doc.summary}`);
         } else {
           console.log(`Inserted new document with summary: ${doc.summary}`);
         }
       }

       console.log("Embeddings stored in MongoDB successfully.");
     } catch (error) {
       console.error('Error storing embeddings in MongoDB:', error);
     } finally {
       if (client) {
         await client.close();
       }
     }
   }

   // Run the main function to load the data
   main();

   ```

   Replace the `<CONNECTION-STRING>` placeholder if you didn't set the environment variable for your Atlas connection string and then save the file.

   Run the following command to upload the data.

   ```shell
   node upload-data.js
   ```

   **Output:**

   ```shell
   Connected to MongoDB
   Updated document with text: ...
   ...
   Embeddings stored in MongoDB successfully.
   ```

   Verify by logging into your cluster and checking the namespace in the Data Explorer.

9. Create the MongoDB Vector Search index on the collection.

   Create a file named `create-index.js`.

   ```shell
   touch create-index.js
   ```

   Copy and paste the following code to create the index in the `create-index.js` file.

   The code does the following:

   - Connects to the cluster and creates an index with the specified name for the specified namespace.

   - Indexes the `bsonEmbeddings.float32` and `bsonEmbeddings.int8` fields as `vector` type by using the `dotProduct` similarity function, and the `bsonEmbeddings.int1` field also as `vector` type by using the `euclidean` function.

   ```javascript
   import { MongoClient, BSON } from "mongodb";  
   import { setTimeout } from "timers/promises";  

   // Connect to your MongoDB cluster
   const uri = process.env.MONGODB_URI || "<CONNECTION-STRING>";

   const client = new MongoClient(uri);

   async function main() {
     try {
       const DB_NAME = "<DATABASE-NAME>";
       const COLLECTION_NAME = "<COLLECTION-NAME>";
       const db = client.db(DB_NAME);
       const collection = db.collection(COLLECTION_NAME);

       // define your MongoDB Vector Search index
       const index = {
         name: "<INDEX-NAME>",
         type: "vectorSearch",
         definition: {
           fields: [
             {
               type: "vector",
               numDimensions: 1024,
               path: "bsonEmbeddings.float32",
               similarity: "dotProduct",
             },
             {
               type: "vector",
               numDimensions: 1024,
               path: "bsonEmbeddings.int8",
               similarity: "dotProduct",
             },
             {
               type: "vector",
               numDimensions: 1024,
               path: "bsonEmbeddings.int1",
               similarity: "euclidean",
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

   Replace the following settings and save the file.

   | `<CONNECTION-STRING>` | Connection string to connect to your Atlas cluster that you want to create the database and collection. Replace this value only if you didn't set the `MONGODB_URI` environment variable. |
   | --- | --- |
   | `<DB-NAME>` | Name of the collection, which is `sample_airbnb`. |
   | `<COLLECTION-NAME>` | Name of the collection, which is `listingsAndReviews`. |
   | `<INDEX-NAME>` | Name of the index for the collection. |

   Create the index.

   ```shell
   node create-index.js
   ```

   **Output:**

   ```shell
   New search index named vector_index is building.
   Polling to check if the index is ready. This may take up to a minute.
   <INDEX-NAME> is ready for querying.
   ```

10. Generate the embeddings for the query text.

    Create a file named `get-query-embeddings.js`.

    ```shell
    touch get-query-embeddings.js
    ```

    Copy and paste the code in the `get-query-embedding.js` file.

    The sample code does the following:

    - Generates `float32`, `int8`, and `int1` embeddings for the query text by using Voyage AI.

    - Converts the generated embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using PyMongo.

    - Saves the generated embeddings to a file named `query-embeddings.json`.

    ```javascript
    import { BSON } from "mongodb"; 
    import { writeFile } from "fs/promises"; 
    import dotenv from "dotenv";  
      
    // Load environment variables  
    dotenv.config();  
      
    const { Binary, EJSON } = BSON; // Import BSON utilities  
      
    // Set your API key from environment or fallback to hardcoded value (not recommended for production)  
    const apiKey = process.env.VOYAGE_API_KEY || "<VOYAGEAI-API-KEY>";  
    const QUERY_TEXT = <QUERY-TEXT>;
      
    if (!apiKey || apiKey === "<VOYAGEAI-API-KEY>") {  
      throw new Error("API key not found. Provide the VOYAGEAI_API_KEY in environment variables.");  
    }  
      
    // Define the Voyage AI REST API endpoint  
    const apiEndpoint = "https://ai.mongodb.com/v1/embeddings";  
      
    /**  
     * Fetch embeddings using Voyage AI REST API  
     */  
    async function fetchEmbeddings(data, model, inputType, outputDtype, outputDimension) {  
      try {  
        const response = await fetch(apiEndpoint, {  
          method: "POST",  
          headers: {  
            "Content-Type": "application/json",  
            Authorization: `Bearer ${apiKey}`,  
          },  
          body: JSON.stringify({  
            input: data,  
            model,  
            input_type: inputType,  
            output_dtype: outputDtype,  
            output_dimension: outputDimension,  
          }),  
        });  
      
        // Check for non-success status codes  
        if (!response.ok) {  
          const errorResponse = await response.text();  
          throw new Error(`API request failed with status ${response.status}: ${errorResponse}`);  
        }  
      
        const responseData = await response.json();  
      
        // Ensure the response contains valid data  
        if (!responseData.data || !Array.isArray(responseData.data)) {  
          console.error("Full API Response:", responseData);  
          throw new Error("Embeddings are not present or not returned in array format.");  
        }  
      
        return responseData.data.map((item) => item.embedding); // Extract embeddings  
      } catch (error) {  
        console.error(`Error fetching embeddings for output_dtype "${outputDtype}":`, error);  
        throw error;  
      }  
    }  
      
    /**  
     * Create BSON Binary objects using VECTOR_TYPE for all embedding types  
     */  
    function convertEmbeddingsToBSON(data, float, int8, ubinary) {  
      return data.map((text, index) => ({  
        text,  
        bsonEmbeddings: {  
          float32: Binary.fromFloat32Array(new Float32Array(float[index])),  
          int8: Binary.fromInt8Array(new Int8Array(int8[index])),  
          int1: Binary.fromPackedBits(new Uint8Array(ubinary[index])),  
        },  
      }));  
    }  
      
    /**  
     * Serialize BSON embeddings and save to JSON file  
     */  
    async function saveBSONEmbeddingsToFile(bsonEmbeddingsData, outputFileName) {  
      try {  
        // Serialize BSON data to JSON format using EJSON  
        const ejsonSerializedData = EJSON.stringify(bsonEmbeddingsData, null, 2, {  
          relaxed: true, // Store binary as raw binary data without base64 encoding  
        });  
      
        // Write serialized data to a file  
        await writeFile(outputFileName, ejsonSerializedData);  
        console.log(`Embeddings with BSON vectors have been saved to ${outputFileName}`);  
      } catch (error) {  
        console.error(`Error saving BSON embeddings to file "${outputFileName}":`, error);  
        throw error;  
      }  
    }  
      
    /**  
     * Process query text, fetch embeddings, convert to BSON, and write to JSON  
     */  
    async function main(queryText) {  
      try {  
        if (!queryText || typeof queryText !== "string" || queryText.trim() === "") {  
          throw new Error("Invalid query text. It must be a non-empty string.");  
        }  
      
        const data = [queryText];  
        const model = "voyage-3-large";  
        const inputType = "query";  
        const dimension = 1024;  
      
        // Fetch embeddings for different data types  
        const floatEmbeddings = await fetchEmbeddings(data, model, inputType, "float", dimension);  
        const int8Embeddings = await fetchEmbeddings(data, model, inputType, "int8", dimension);  
        const packedBitsEmbeddings = await fetchEmbeddings(data, model, inputType, "ubinary", dimension);  
      
        // Convert embeddings into BSON-compatible format  
        const bsonEmbeddingsData = convertEmbeddingsToBSON(  
          data,  
          floatEmbeddings,  
          int8Embeddings,  
          packedBitsEmbeddings  
        );  
      
        // Save BSON embeddings to JSON file  
        const outputFileName = "query-embeddings.json";  
        await saveBSONEmbeddingsToFile(bsonEmbeddingsData, outputFileName);  
      } catch (error) {  
        console.error("Error processing query text:", error);  
      }  
    }  
      
    // Main function invocation  
    (async () => {  
      const queryText = QUERY-TEXT; 
      await main(queryText);  
    })();  

    ```

    Replace the following settings and save the file.

    | `<VOYAGEAI-API-KEY>` | Your API Key for Voyage AI. Only replace this value if you didn't set the key as an environment variable. |
    | --- | --- |
    | `<QUERY-TEXT>` | Your query text. For this example, use `ocean view`. |

    Run the code to generate the embeddings for the query text.

    ```shell
    node get-query-embeddings.js
    ```

    **Output:**

    ```shell
    Embeddings with BSON vectors have been saved to query-embeddings.json
    ```

11. Run a MongoDB Vector Search query.

    Create a file named `run-query.js`.

    ```shell
    touch run-query.js
    ```

    Copy and paste the following sample [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query in the `run-query.js` file.

    The sample query does the following:

    - Connects to your cluster and runs the [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query against the `bsonEmbeddings.float32`, `bsonEmbeddings.int8`, and `bsonEmbeddings.int1` fields in the `sample_airbnb.listingsAndReviews` namespace by using the embeddings in the `query-embeddings.json` file.

    - Prints the results from Float32, Int8, and Packed Binary (Int1) embeddings to the console.

    ```javascript
    import { MongoClient } from "mongodb";  
    import fs from "fs/promises";  
    import { BSON } from "bson"; // Use the BSON package for EJSON parsing  
    import dotenv from "dotenv";  
      
    dotenv.config();  
      
    // MongoDB connection details  
    const mongoUri = process.env.MONGODB_URI || "<CONNECTION-STRING>";  
    const dbName = "<DATABASE-NAME>";  
    const collectionName = "<COLLECTION-NAME>";  
    const VECTOR_INDEX_NAME = "<INDEX-NAME>"; 
    const NUM_CANDIDATES = <NUMBER-OF-CANDIDATES-TO-CONSIDER>; 
    const LIMIT = <NUMBER-OF-DOCUMENTS-TO-RETURN>;  
    const dataField = "<TEXT-FIELD-NAME>";
      
    // Fields in the collection containing BSON-compatible query vectors  
    const FIELDS = [  
      { path: "float32", subtype: 9 },  
      { path: "int8", subtype: 9 },  
      { path: "int1", subtype: 9 },  
    ];  
      
    async function main() {  
      const client = new MongoClient(mongoUri);  
      
      try {  
        await client.connect();  
        console.log("Connected to MongoDB");  
      
        const db = client.db(dbName);  
        const collection = db.collection(collectionName);  
      
        // Read the query embeddings from the JSON file  
        const fileContent = await fs.readFile("query-embeddings.json", "utf8");  
        const embeddingsData = BSON.EJSON.parse(fileContent, { relaxed: true });  
      
        if (!Array.isArray(embeddingsData) || embeddingsData.length === 0) {  
          throw new Error("No embeddings found in the JSON file");  
        }  
      
        const results = {};  
      
        // Perform vector search for each embedding type  
        for (const field of FIELDS) {  
          const { path } = field;  
          const bsonBinary = embeddingsData[0]?.bsonEmbeddings?.[path];  
      
          if (!bsonBinary) {  
            console.warn(`Embedding for path "${path}" not found. Skipping.`);  
            continue;  
          }  
      
          const pipeline = [  
            {  
              $vectorSearch: {  
                index: VECTOR_INDEX_NAME,  
                path: `bsonEmbeddings.${path}`,  
                queryVector: bsonBinary, // Direct raw binary  
                numCandidates: NUM_CANDIDATES,  
                limit: LIMIT,  
              },  
            },  
            {  
              $project: {  
                _id: 0,  
                [dataField]: 1,  
                score: { $meta: "vectorSearchScore" },  
              },  
            },  
          ];  
      
          console.log(`Running vector search using "${path}" embedding...`);  
          results[path] = await collection.aggregate(pipeline).toArray();  
        }  
      
        return results;  
      } catch (error) {  
        console.error("Error during vector search:", error);  
      } finally {  
        await client.close();  
        console.log("MongoDB connection closed");  
      }  
    }  
      
    // Parse and display search results for each embedding type  
    (async () => {  
      const results = await main();  
      
      if (results) {  
        console.log("Results from Float32 embeddings:");
        (results.float32 || []).forEach((result, index) => {
          console.log(`Result ${index + 1}:`, result);
        });

        console.log("Results from Int8 embeddings:");
        (results.int8 || []).forEach((result, index) => {
          console.log(`Result ${index + 1}:`, result);
        });

        console.log("Results from Int1 (PackedBits) embeddings:");
        (results.int1 || []).forEach((result, index) => {
          console.log(`Result ${index + 1}:`, result);
        });  
      }  
    })();  

    ```

    Replace the following settings and save the `run-query.js` file.

    | `<CONNECTION-STRING>` | Connection string to connect to the cluster where you want to create the index. Replace this value only if you didn't set the `MONGODB_URI` environment variable. |
    | --- | --- |
    | `<DB-NAME>` | Name of the database where you want to create the collection. For this example, specify `sample_airbnb`. |
    | `<COLLECTION-NAME>` | Name of the collection where you want to store the generated embeddings. For this example, specify `listingsAndReviews`. |
    | `<INDEX-NAME>` | Name of the index for the collection. |
    | `<NUMBER-OF-CANDIDATES-TO-CONSIDER>` | Number of nearest neighbors to consider. For this example, specify `20`. |
    | `<NUMBER-OF-DOCUMENTS-TO-RETURN>` | Number of documents to return in the results. For this example, specify `5`. |
    | `<DATA-FIELD-NAME>` | Name of the field that contains text data. For this example, specify `summary`. |

    Run the query.

    To execute the query, run the following command:

    ```shell
    node run-query.js
    ```

    **Output:**

    ```shell
    Results from embeddings_float32 embeddings:
    {"_id":"10266175","summary":"A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.","score":{"$numberDouble":"0.799713134765625"}}
    {"_id":"10227000","summary":"THIS IS A VERY SPACIOUS 1 BEDROOM FULL CONDO (SLEEPS 4) AT THE BEAUTIFUL VALLEY ISLE RESORT ON THE BEACH IN LAHAINA, MAUI!! YOU WILL LOVE THE PERFECT LOCATION OF THIS VERY NICE HIGH RISE! ALSO THIS SPACIOUS FULL CONDO, FULL KITCHEN, BIG BALCONY!!","score":{"$numberDouble":"0.7568193078041077"}}
    {"_id":"1001265","summary":"A short distance from Honolulu's billion dollar mall, and the same distance to Waikiki. Parking included. A great location that work perfectly for business, education, or simple visit. Experience Yacht Harbor views and 5 Star Hilton Hawaiian Village.","score":{"$numberDouble":"0.7500505447387695"}}
    {"summary":"Quarto com vista para a Lagoa Rodrigo de Freitas, cartão postal do Rio de Janeiro. Linda Vista.  1 Quarto e 1 banheiro  Amplo, arejado, vaga na garagem. Prédio com piscina, sauna e playground.  Fácil acesso, próximo da praia e shoppings.","score":{"$numberDouble":"0.7367454171180725"},"_id":"10030955"}
    {"_id":"10220130","summary":"Cozy and comfortable apartment. Ideal for families and vacations.  3 bedrooms, 2 of them suites.  Located 20-min walk to the beach and close to the Rio 2016 Olympics Venues. Situated in a modern and secure condominium, with many entertainment available options around.","score":{"$numberDouble":"0.7315733432769775"}}
    Results from embeddings_int8 embeddings:
    {"_id":"10266175","summary":"A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.","score":{"$numberDouble":"0.5056195259094238"}}
    {"_id":"10227000","summary":"THIS IS A VERY SPACIOUS 1 BEDROOM FULL CONDO (SLEEPS 4) AT THE BEAUTIFUL VALLEY ISLE RESORT ON THE BEACH IN LAHAINA, MAUI!! YOU WILL LOVE THE PERFECT LOCATION OF THIS VERY NICE HIGH RISE! ALSO THIS SPACIOUS FULL CONDO, FULL KITCHEN, BIG BALCONY!!","score":{"$numberDouble":"0.5048412084579468"}}
    {"summary":"A short distance from Honolulu's billion dollar mall, and the same distance to Waikiki. Parking included. A great location that work perfectly for business, education, or simple visit. Experience Yacht Harbor views and 5 Star Hilton Hawaiian Village.","score":{"$numberDouble":"0.5047098398208618"},"_id":"1001265"}
    {"_id":"10030955","summary":"Quarto com vista para a Lagoa Rodrigo de Freitas, cartão postal do Rio de Janeiro. Linda Vista.  1 Quarto e 1 banheiro  Amplo, arejado, vaga na garagem. Prédio com piscina, sauna e playground.  Fácil acesso, próximo da praia e shoppings.","score":{"$numberDouble":"0.5043320655822754"}}
    {"_id":"10220130","summary":"Cozy and comfortable apartment. Ideal for families and vacations.  3 bedrooms, 2 of them suites.  Located 20-min walk to the beach and close to the Rio 2016 Olympics Venues. Situated in a modern and secure condominium, with many entertainment available options around.","score":{"$numberDouble":"0.5043137073516846"}}
    Results from embeddings_int1 embeddings:
    {"_id":"10266175","summary":"A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.","score":{"$numberDouble":"0.7119140625"}}
    {"_id":"1001265","summary":"A short distance from Honolulu's billion dollar mall, and the same distance to Waikiki. Parking included. A great location that work perfectly for business, education, or simple visit. Experience Yacht Harbor views and 5 Star Hilton Hawaiian Village.","score":{"$numberDouble":"0.6787109375"}}
    {"summary":"A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.","score":{"$numberDouble":"0.671875"},"_id":"10209136"}
    {"_id":"10227000","summary":"THIS IS A VERY SPACIOUS 1 BEDROOM FULL CONDO (SLEEPS 4) AT THE BEAUTIFUL VALLEY ISLE RESORT ON THE BEACH IN LAHAINA, MAUI!! YOU WILL LOVE THE PERFECT LOCATION OF THIS VERY NICE HIGH RISE! ALSO THIS SPACIOUS FULL CONDO, FULL KITCHEN, BIG BALCONY!!","score":{"$numberDouble":"0.6669921875"}}
    {"_id":"10264100","summary":"Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.","score":{"$numberDouble":"0.6669921875"}}
    ```

    Your results might be different because the generated embeddings can vary depending on your environment.

To quantize your BSON (Binary Javascript Object Notation) `binData` vectors, you must have the following:

- A cluster running MongoDB version 6.0.11, 7.0.2, or later.

  Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

- Access to an embedding model that supports byte vector output.

  The outputs from the following embedding models can be used to generate BSON (Binary Javascript Object Notation) `binData` vectors with a supported MongoDB driver:

  | Embedding Model Provider | Embedding Model |
  | --- | --- |
  | [Voyage AI](https://www.voyageai.com/) | `voyage-3-large` |
  | [Cohere](https://cohere.com/) | `embed-english-v3.0` |
  | [Nomic](https://www.nomic.ai/) | `nomic-embed-text-v1.5` |
  | [Jina](https://jina.ai/) | `jina-embeddings-v2-base-en` |
  | [Mixedbread](https://www.mixedbread.ai/) | `mxbai-embed-large-v1` |

  Scalar quantization preserves recall for these models because these models are all trained to be quantization aware. Therefore, [recall](https://www.mongodb.com/docs/manual/reference/glossary.md#std-term-recall) degradation for scalar quantized embeddings produced by these models is minimal even at lower dimensions like 384.

* An environment to run interactive Python notebooks such as [VS Code](https://code.visualstudio.com/docs/datascience/jupyter-notebooks) or [Colab.](https://colab.research.google.com)

## Procedure

Create an interactive Python notebook by saving a file with the `.ipynb` extension, and then perform the following steps in the notebook. To try the example, replace the placeholders with valid values.

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/blob/main/quantization/new-data.ipynb)

1. Install the required libraries.

   Run the following command to install Voyage AI and the [PyMongo Driver](https://www.mongodb.com/docs/drivers/pymongo/). You must install [PyMongo](https://www.mongodb.com/docs/drivers/pymongo/) v4.10 or later driver.

   ```shell
   pip install --quiet --upgrade voyageai pymongo
   ```

   This operation might take a few minutes to complete.

2. Define the functions to generate embeddings from your data.

   In this step, you define functions for the following purposes:

   - Generate embeddings by using Voyage AI.

   - Convert embeddings to BSON (Binary Javascript Object Notation) vectors by using the [PyMongo](https://www.mongodb.com/docs/drivers/pymongo/) driver.

   Copy, paste, and run the sample code below after replacing the following placeholder value (highlighted in the code):

   | Placeholder | Valid Value |
   | --- | --- |
   | `<VOYAGE-API-KEY>` | Voyage AI API key to use for generating embeddings. |

   ```python
   import os
   import voyageai
   from bson.binary import Binary, BinaryVectorDtype

   # Initialize the Voyage AI Client
   os.environ["VOYAGE_API_KEY"] = "<VOYAGEAI-API-KEY>"
   vo = voyageai.Client()

   # Define a function to generate embeddings for all strings in `texts`
   def generate_embeddings(texts, model: str, dtype: str, output_dimension: int):
       embeddings = []
       for text in texts:  # Process eachstring in the data list
           embedding = vo.embed(
               texts=[text],  # Pass each string as a list with a single item
               model=model,
               output_dtype=dtype,
               output_dimension=output_dimension,
           ).embeddings[0]
           embeddings.append(embedding)  # Collect the embedding for the current text
       return embeddings

   # Convert embeddings to BSON vectors
   def generate_bson_vector(vector, vector_dtype):
      return Binary.from_vector(vector, vector_dtype)

   ```

3. Load the data for which you want to generate BSON (Binary Javascript Object Notation) vectors in your notebook.

   For this example, use the sample sentences in the following code.

   ```python
   data = [
       "The Great Wall of China is visible from space.",
       "The Eiffel Tower was completed in Paris in 1889.",
       "Mount Everest is the highest peak on Earth at 8,848m.",
       "Shakespeare wrote 37 plays and 154 sonnets during his lifetime.",
       "The Mona Lisa was painted by Leonardo da Vinci.",
   ]
   ```

4. Generate and convert the embeddings.

   In this step, you generate embeddings for the sample data and then convert the embeddings to BSON (Binary Javascript Object Notation) vectors by using the `generate_embeddings` and `generate_bson_vector` functions respectively.

   Generate the embeddings using Voyage AI.

   This step is required if you haven't yet generated embeddings from your data. If you've already generated embeddings, skip this step. To learn more about generating embeddings from your data, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

   Copy, paste, and run the sample code below after replacing the following placeholder values (highlighted in the code):

   | Placeholder | Valid Value |
   | --- | --- |
   | `<EMBEDDING-MODEL>` | Embedding model to use for generating the embeddings. For this example, specify `voyage-3-large`. |
   | `<NUMBER-OF-DIMENSIONS>` | Number of dimensions for the resulting output embeddings. For this example, specify `1024`. |

   ```python
   # Use the function with different output data types to generate embeddings
   model_name = "<EMBEDDING-MODEL>"
   output_dimension = <NUMBER-OF-DIMENSIONS>

   # Generate embeddings in all supported data types
   float32_embeddings = generate_embeddings(data, model=model_name, dtype="float", output_dimension=output_dimension)
   int8_embeddings = generate_embeddings(data, model=model_name, dtype="int8", output_dimension=output_dimension)
   int1_embeddings = generate_embeddings(data, model=model_name, dtype="ubinary", output_dimension=output_dimension)
   ```

   Convert the embeddings to BSON (Binary Javascript Object Notation) vectors.

   Copy, paste, and run the following code:

   ```python
   # For all vectors in your collection, generate BSON vectors of float32, int8, and int1 embeddings
   bson_float32_embeddings = []
   bson_int8_embeddings = []
   bson_int1_embeddings = []
   for i, (f32_emb, int8_emb, int1_emb) in enumerate(zip(float32_embeddings, int8_embeddings, int1_embeddings)):
      bson_float32_embeddings.append(generate_bson_vector(f32_emb, BinaryVectorDtype.FLOAT32))
      bson_int8_embeddings.append(generate_bson_vector(int8_emb, BinaryVectorDtype.INT8))
      bson_int1_embeddings.append(generate_bson_vector(int1_emb, BinaryVectorDtype.PACKED_BIT))
   ```

5. Create documents and load to your cluster.

   You can load your data from the Atlas UI and programmatically. To learn how to load your data from the Atlas UI, see [Insert Your Data.](https://www.mongodb.com/docs/atlas/tutorial/insert-data-into-your-cluster.md#std-label-gswa-insert-data)

   Create documents from the sample data and embeddings.

   Copy, paste, and run the sample code below after replacing the following placeholder values (highlighted in the code):

   | Placeholder | Valid Value |
   | --- | --- |
   | `<FIELD-NAME-FOR-FLOAT32-TYPE>` | Name of field with `float32` values. |
   | `<FIELD-NAME-FOR-INT8-TYPE>` | Name of field with `int8` values. |
   | `<FIELD-NAME-FOR-INT1-TYPE>` | Name of field with `int1` values. |
   | `<TEXT-FIELD-NAME>` | Name of the field where you want to store the text data. |

   ```python
   # Specify the field names for the float32, int8, and int1 embeddings
   float32_field = "<FIELD-NAME-FOR-FLOAT32-TYPE>"
   int8_field = "<FIELD-NAME-FOR-INT8-TYPE>"
   int1_field = "<FIELD-NAME-FOR-INT1-TYPE>"

   # Define function to create documents with BSON vector embeddings
   def create_new_docs_with_bson_vectors(bson_float32_embeddings, bson_int8_embeddings, bson_int1_embeddings, data):
     docs = []
     for i, (bson_f32_emb, bson_int8_emb, bson_int1_emb, text) in enumerate(zip(bson_float32_embeddings, bson_int8_embeddings, bson_int1_embeddings, data)):

        doc = {
             "_id": i,
             "<TEXT-FIELD-NAME>": text,
             float32_field: bson_f32_emb,
             int8_field: bson_int8_emb,
             int1_field: bson_int1_emb
        }
        docs.append(doc)
     return docs

   # Create the documents
   documents = create_new_docs_with_bson_vectors(bson_float32_embeddings, bson_int8_embeddings, bson_int1_embeddings, data)
   ```

   Load your data into your cluster.

   Copy, paste, and run the sample code below after replacing the following placeholder values (highlighted in the code):

   | Placeholder | Valid Value |
   | --- | --- |
   | `<CONNECTION-STRING>` | Cluster connection string. To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver) |
   | `<DATABASE-NAME>` | Name of the database. |
   | `<COLLECTION-NAME>` | Name of the collection in the specified database. |

   ```python
   import pymongo

   mongo_client = pymongo.MongoClient("<CONNECTION-STRING>")
   # Insert documents into a new database and collection
   db = mongo_client["<DATABASE-NAME>"]
   collection_name = "<COLLECTION-NAME>"
   db.create_collection(collection_name)
   collection = db[collection_name]

   collection.insert_many(documents)
   ```

6. Create the MongoDB Vector Search index on the collection.

   You can create MongoDB Vector Search indexes by using the Atlas UI, Atlas CLI, Atlas Administration API, and MongoDB drivers. To learn more, see [How to Index Fields for Vector Search.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search)

   Copy, paste, and run the sample code below after replacing the following placeholder value (highlighted in the code):

   | Placeholder | Valid Value |
   | --- | --- |
   | `<INDEX-NAME>` | Name of `vector` type index. |

   ```python
   from pymongo.operations import SearchIndexModel
   import time

   # Define and create the vector search index
   index_name = "<INDEX-NAME>"
   search_index_model = SearchIndexModel(
     definition={
       "fields": [
         {
           "type": "vector",
           "path": float32_field,
           "similarity": "dotProduct",
           "numDimensions": 1024
         },
         {
           "type": "vector",
           "path": int8_field,
           "similarity": "dotProduct",
           "numDimensions": 1024
         },
         {
           "type": "vector",
           "path": int1_field,
           "similarity": "euclidean",
           "numDimensions": 1024
         }
       ]
     },
     name=index_name,
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
     indices = list(collection.list_search_indexes(index_name))
     if len(indices) and predicate(indices[0]):
       break
     time.sleep(5)
   print(result + " is ready for querying.")
   ```

   **Output:**

   ```shell
   New search index named <INDEX-NAME> is building.
   Polling to check if the index is ready. This may take up to a minute.
   <INDEX-NAME> is ready for querying.
   ```

7. Run MongoDB Vector Search queries on the collection.

   Define a function to run a vector search query.

   The function to run MongoDB Vector Search queries performs the following actions:

   - Generates embeddings using Voyage AI for the query text.

   - Converts the embeddings to BSON (Binary Javascript Object Notation) vectors.

   - Defines the aggregation pipeline for the vector search.

   - Runs the aggregation pipeline and returns the results.

   Copy, paste, and run the sample code below after replacing the following placeholder values (highlighted in the code):

   | Placeholder | Valid Value |
   | --- | --- |
   | `<NUMBER-OF-CANDIDATES-TO-CONSIDER>` | Number of nearest neighbors to use during the search. For this example, specify `5`. |
   | `<NUMBER-OF-DOCUMENTS-TO-RETURN>` | Number of documents to return in the results. For this example, specify `2`. |
   | `<EMBEDDING-MODEL>` | Embedding model to use for generating the embeddings. For this example, specify `voyage-3-large`. |
   | `<TEXT-FIELD-NAME>` | Name of the field that contains the text data. |

   ```python
   import voyageai
   from bson.binary import Binary, BinaryVectorDtype

   # Define a function to run a vector search query
   def run_vector_search(query_text, collection, path):
       # Map path to output dtype and BSON vector type
       path_to_dtype = {
           float32_field: ("float", BinaryVectorDtype.FLOAT32),
           int8_field: ("int8", BinaryVectorDtype.INT8),
           int1_field: ("ubinary", BinaryVectorDtype.PACKED_BIT),
       }

       if path not in path_to_dtype:
           raise ValueError("Invalid path. Must be one of float32_field, int8_field, int1_field.")

       # Get Voyage AI output dtype and BSON vector type based on the path
       output_dtype, bson_dtype = path_to_dtype[path]

       # Generate query embeddings using Voyage AI
       query_vector = vo.embed(
           texts=[query_text],
           model="<EMBEDDING-MODEL>",
           input_type="query",
           output_dtype=output_dtype
       ).embeddings[0]

       # Convert the query vector to BSON format
       bson_query_vector = Binary.from_vector(query_vector, bson_dtype)

       # Define the aggregation pipeline for vector search
       pipeline = [
           {
               "$vectorSearch": {
                   "index": index_name,  # Replace with your index name
                   "path": path,         # Path to the embedding field
                   "queryVector": bson_query_vector,  # BSON-encoded query vector
                   "numCandidates": <NUMBER-OF-CANDIDATES-TO-CONSIDER>,
                   "limit": <NUMBER-OF-DOCUMENTS-TO-RETURN>
               }
           },
           {
               "$project": {
                   "_id": 0,
                   "<TEXT-FIELD-NAME>": 1,
                   "score": { "$meta": "vectorSearchScore" }  # Include the similarity score
               }
           }
       ]

       # Run the aggregation pipeline and return results
       return collection.aggregate(pipeline)
   ```

   Run the MongoDB Vector Search query.

   Copy, paste, and run the sample code below after replacing the following placeholder value as highlighted in the code:

   | Placeholder | Valid Value |
   | --- | --- |
   | `<QUERY-TEXT>` | Text string for which to retrieve semantically similar documents. For this example, specify `science fact`. |

   ```python
   from pprint import pprint

   # Define a list of embedding fields to query
   embedding_fields = [float32_field, int8_field, int1_field] 
   results = {}

   # Run vector search queries for each embedding type
   query_text = "<QUERY-TEXT>"
   for field in embedding_fields:
       results[field] = list(run_vector_search(query_text, collection, field)) 

   # Print the results
   for field, field_results in results.items():
       print(f"Results from {field}")
       pprint(field_results)
   ```

   **Output:**

   ```shell
   Results from float32-embeddings embeddings
   [{'data': 'The Great Wall of China is visible from space.',
   'score': 0.7810189723968506},
   {'data': 'Mount Everest is the highest peak on Earth at 8,848m.',
   'score': 0.7339795827865601}]
   Results from int8-embeddings embeddings
   [{'data': 'The Great Wall of China is visible from space.',
   'score': 0.5053843259811401},
   {'data': 'Mount Everest is the highest peak on Earth at 8,848m.',
   'score': 0.5043729543685913}]
   Results from int1-embeddings embeddings
   [{'data': 'The Great Wall of China is visible from space.', 'score': 0.6640625},
   {'data': 'Mount Everest is the highest peak on Earth at 8,848m.',
   'score': 0.6220703125}]
   ```

   To learn more about MongoDB Vector Search queries, see [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

To quantize your BSON (Binary Javascript Object Notation) `binData` vectors, you must have the following:

- A cluster running MongoDB version 6.0.11, 7.0.2, or later.

  Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

- Access to an embedding model that supports byte vector output.

  The outputs from the following embedding models can be used to generate BSON (Binary Javascript Object Notation) `binData` vectors with a supported MongoDB driver:

  | Embedding Model Provider | Embedding Model |
  | --- | --- |
  | [Voyage AI](https://www.voyageai.com/) | `voyage-3-large` |
  | [Cohere](https://cohere.com/) | `embed-english-v3.0` |
  | [Nomic](https://www.nomic.ai/) | `nomic-embed-text-v1.5` |
  | [Jina](https://jina.ai/) | `jina-embeddings-v2-base-en` |
  | [Mixedbread](https://www.mixedbread.ai/) | `mxbai-embed-large-v1` |

  Scalar quantization preserves recall for these models because these models are all trained to be quantization aware. Therefore, [recall](https://www.mongodb.com/docs/manual/reference/glossary.md#std-term-recall) degradation for scalar quantized embeddings produced by these models is minimal even at lower dimensions like 384.

* An environment to run interactive Python notebooks such as [VS Code](https://code.visualstudio.com/docs/datascience/jupyter-notebooks) or [Colab.](https://colab.research.google.com)

## Procedure

Create an interactive Python notebook by saving a file with the `.ipynb` extension, and then perform the following steps in the notebook. To try the example, replace the placeholders with valid values.

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/blob/main/quantization/existing-data.ipynb)

1. Install the required libraries.

   Run the following command to install Voyage AI and the [PyMongo Driver](https://www.mongodb.com/docs/drivers/pymongo/). You must install [PyMongo](https://www.mongodb.com/docs/drivers/pymongo/) v4.10 or later driver.

   ```shell
   pip install --quiet --upgrade voyageai pymongo
   ```

   This operation might take a few minutes to complete.

2. Define the functions to generate embeddings from your data.

   In this step, you define functions for the following purposes:

   - Generate embeddings by using Voyage AI.

   - Convert embeddings to BSON (Binary Javascript Object Notation) vectors by using the [PyMongo](https://www.mongodb.com/docs/drivers/pymongo/) driver.

   Copy, paste, and run the sample code below after replacing the following placeholder value (highlighted in the code):

   | Placeholder | Valid Value |
   | --- | --- |
   | `<VOYAGE-API-KEY>` | Voyage AI API key to use for generating embeddings. |

   ```python
   import os
   import voyageai
   from bson.binary import Binary, BinaryVectorDtype

   # Initialize the Voyage AI Client
   os.environ["VOYAGE_API_KEY"] = "<VOYAGEAI-API-KEY>"
   vo = voyageai.Client()

   # Define a function to generate embeddings for all strings in `texts`
   def generate_embeddings(texts, model: str, dtype: str, output_dimension: int):
       embeddings = []
       for text in texts:  # Process eachstring in the data list
           embedding = vo.embed(
               texts=[text],  # Pass each string as a list with a single item
               model=model,
               output_dtype=dtype,
               output_dimension=output_dimension,
           ).embeddings[0]
           embeddings.append(embedding)  # Collect the embedding for the current text
       return embeddings

   # Convert embeddings to BSON vectors
   def generate_bson_vector(vector, vector_dtype):
      return Binary.from_vector(vector, vector_dtype)

   ```

3. Connect to the cluster and retrieve existing data.

   You must provide the following:

   - Connection string to connect to your cluster that contains the database and collection for which you want to generate embeddings.

   - Name of the database that contains the collection for which you want to generate embeddings.

   - Name of the collection for which you want to generate embeddings.

   To retrieve the data, copy, paste, and run the sample code below after replacing the placeholder values (highlighted in the code):

   | Placeholder | Valid Value |
   | --- | --- |
   | `<CONNECTION-STRING>` | Cluster connection string. To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver) |
   | `<DATABASE-NAME>` | Name of the database that contains the collection for which you want to generate and convert embeddings. For this example, specify `sample_airbnb`. |
   | `<COLLECTION-NAME>` | Name of the collection for which you want to generate and convert embeddings. For this example, specify `listingsAndReviews`. |
   | `<TEXT-FIELD-NAME>` | Name of the text field for which you want to generate embeddings. For this example, specify `summary`. |

   ```python
   import pymongo  

   # Connect to your MongoDB cluster
   mongo_client = pymongo.MongoClient("<CONNECTION-STRING>")
   db = mongo_client["<DATABASE-NAME>"]
   collection = db["<COLLECTION-NAME>"]

   # Filter to exclude null or empty summary fields
   filter = { "<TEXT-FIELD-NAME>": {"$nin": [None, ""]} }

   # Get a subset of documents in the collection
   documents = collection.find(filter).limit(50)

   # Initialize the count of updated documents
   updated_doc_count = 0
   ```

4. Generate, convert, and load embeddings into your collection.

   The sample code performs the following actions:

   Generates embeddings from your data using any embedding model if your data doesn't already have embeddings. To learn more about generating embeddings from your data, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

   Converts the embeddings to BSON (Binary Javascript Object Notation) vectors (as shown on line 7 in the following example).

   Uploads the embeddings to your collection on your cluster.

   These operation might take a few minutes to complete.

   Copy, paste, and run the code below after replacing the following placeholder values (highlighted in the code):

   | Placeholder | Valid Value |
   | --- | --- |
   | `<EMBEDDING-MODEL>` | Embedding model to use for generating the embeddings. For this example, specify `voyage-3-large`. |
   | `<NUMBER-OF-DIMENSIONS>` | Number of dimensions for the resulting output embeddings. For this example, specify `1024`. |
   | `<FIELD-NAME-FOR-FLOAT32-TYPE>` | Name of field with `float32` values. |
   | `<FIELD-NAME-FOR-INT8-TYPE>` | Name of field with `int8` values. |
   | `<FIELD-NAME-FOR-INT1-TYPE>` | Name of field with `int1` values. |
   | `<EMBEDDING-MODEL>` | Embedding model to use for generating the embeddings. For this example, specify `voyage-3-large`. |
   | `<TEXT-FIELD-NAME>` | Name of the text field for which you generated embeddings. For this example, specify `summary`. |

   ```python
   model_name = "<EMBEDDING-MODEL>"
   output_dimension = <NUMBER-OF-DIMENSIONS>
   float32_field = "<FIELD-NAME-FOR-FLOAT32-TYPE>"
   int8_field = "<FIELD-NAME-FOR-INT8-TYPE>"
   int1_field = "<FIELD-NAME-FOR-INT1-TYPE>"

   # Process and update each document
   updated_doc_count = 0  
   for document in documents:  
       summary = document.get("<TEXT-FIELD-NAME>")  
       if not summary:  
           continue  
     
       # Generate embeddings for the summary field  
       float_embeddings = generate_embeddings([summary], model=model_name, dtype="float", output_dimension=output_dimension)  
       int8_embeddings = generate_embeddings([summary], model=model_name, dtype="int8", output_dimension=output_dimension)  
       ubinary_embeddings = generate_embeddings([summary], model=model_name, dtype="ubinary", output_dimension=output_dimension)  
     
       # Convert embeddings to BSON-compatible format  
       bson_float = generate_bson_vector(float_embeddings[0], BinaryVectorDtype.FLOAT32)  
       bson_int8 = generate_bson_vector(int8_embeddings[0], BinaryVectorDtype.INT8)  
       bson_ubinary = generate_bson_vector(ubinary_embeddings[0], BinaryVectorDtype.PACKED_BIT)  
     
       # Prepare the updated document  
       updated_fields = {  
           float32_field: bson_float,  
           int8_field: bson_int8,  
           int1_field: bson_ubinary,
       }  
     
       # Update the document in MongoDB  
       result = collection.update_one({"_id": document["_id"]}, {"$set": updated_fields})  
       if result.modified_count > 0:  
           updated_doc_count += 1  
     
   # Print the results  
   print(f"Number of documents updated: {updated_doc_count}") 
   ```

5. Create the MongoDB Vector Search index on the collection.

   You can create MongoDB Vector Search indexes by using the Atlas UI, Atlas CLI, Atlas Administration API, and MongoDB drivers. To learn more, see [How to Index Fields for Vector Search.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search)

   To create the index, copy, paste, and run the sample code below after replacing the following placeholder value (highlighted in the code):

   | Placeholder | Valid Value |
   | --- | --- |
   | `<INDEX-NAME>` | Name of `vector` type index. |

   ```python
   from pymongo.operations import SearchIndexModel
   import time

   # Define and create the vector search index
   index_name = "<INDEX-NAME>"
   search_index_model = SearchIndexModel(
     definition={
       "fields": [
         {
           "type": "vector",
           "path": float32_field,
           "similarity": "dotProduct",
           "numDimensions": 1024
         },
         {
           "type": "vector",
           "path": int8_field,
           "similarity": "dotProduct",
           "numDimensions": 1024
         },
         {
           "type": "vector",
           "path": int1_field,
           "similarity": "euclidean",
           "numDimensions": 1024
         }
       ]
     },
     name=index_name,
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
     indices = list(collection.list_search_indexes(index_name))
     if len(indices) and predicate(indices[0]):
       break
     time.sleep(5)
   print(result + " is ready for querying.")
   ```

   **Output:**

   ```shell
   New search index named <INDEX-NAME> is building.
   Polling to check if the index is ready. This may take up to a minute.
   <INDEX-NAME> is ready for querying.
   ```

6. Run MongoDB Vector Search queries on the collection.

   Define a function to run a vector search query.

   The function to run MongoDB Vector Search queries performs the following actions:

   - Generates embeddings using Voyage AI for the query text.

   - Converts the embeddings to BSON (Binary Javascript Object Notation) vectors.

   - Defines the aggregation pipeline for the vector search.

   - Runs the aggregation pipeline and returns the results.

   | Placeholder | Valid Value |
   | --- | --- |
   | `<NUMBER-OF-CANDIDATES-TO-CONSIDER>` | Number of nearest neighbors to use during the search. For this example, specify `20` |
   | `<NUMBER-OF-DOCUMENTS-TO-RETURN>` | Number of documents to return in the results. For this example, specify `5`. |
   | `<TEXT-FIELD-NAME>` | Name of the field that contains the text data. For this example, specify `summary`. |

   ```python
   import voyageai
   from bson.binary import Binary, BinaryVectorDtype

   # Define a function to run a vector search query
   def run_vector_search(query_text, collection, path):
       # Map path to output dtype and BSON vector type
       path_to_dtype = {
           float32_field: ("float", BinaryVectorDtype.FLOAT32),
           int8_field: ("int8", BinaryVectorDtype.INT8),
           int1_field: ("ubinary", BinaryVectorDtype.PACKED_BIT),
       }

       if path not in path_to_dtype:
           raise ValueError("Invalid path. Must be one of float32_field, int8_field, int1_field.")

       # Get Voyage AI output dtype and BSON vector type based on the path
       output_dtype, bson_dtype = path_to_dtype[path]

       # Generate query embeddings using Voyage AI
       query_vector = vo.embed(
           texts=[query_text],
           model="<EMBEDDING-MODEL>",
           input_type="query",
           output_dtype=output_dtype
       ).embeddings[0]

       # Convert the query vector to BSON format
       bson_query_vector = Binary.from_vector(query_vector, bson_dtype)

       # Define the aggregation pipeline for vector search
       pipeline = [
           {
               "$vectorSearch": {
                   "index": index_name,  # Replace with your index name
                   "path": path,         # Path to the embedding field
                   "queryVector": bson_query_vector,  # BSON-encoded query vector
                   "numCandidates": <NUMBER-OF-CANDIDATES-TO-CONSIDER>,
                   "limit": <NUMBER-OF-DOCUMENTS-TO-RETURN>
               }
           },
           {
               "$project": {
                   "_id": 0,
                   "<TEXT-FIELD-NAME>": 1,
                   "score": { "$meta": "vectorSearchScore" }  # Include the similarity score
               }
           }
       ]

       # Run the aggregation pipeline and return results
       return collection.aggregate(pipeline)
   ```

   Run the MongoDB Vector Search query.

   You can run MongoDB Vector Search queries programmatically. To learn more, see [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   | Placeholder | Valid Value |
   | --- | --- |
   | `<QUERY-TEXT>` | Text string for which to retrieve semantically similar documents. For this example, specify `ocean view`. |

   ```python
   from pprint import pprint

   # Define a list of embedding fields to query
   embedding_fields = [float32_field, int8_field, int1_field] 
   results = {}

   # Run vector search queries for each embedding type
   query_text = "<QUERY-TEXT>"
   for field in embedding_fields:
       results[field] = list(run_vector_search(query_text, collection, field)) 

   # Print the results
   for field, field_results in results.items():
       print(f"Results from {field}")
       pprint(field_results)
   ```

   **Output:**

   ```shell
   Results from float32-embeddings
   [{'score': 0.8044508695602417,
   'summary': 'A beautiful and comfortable 1 Bedroom Air Conditioned Condo in '
               'Makaha Valley - stunning Ocean & Mountain views All the '
               'amenities of home, suited for longer stays. Full kitchen & large '
               "bathroom.  Several gas BBQ's for all guests to use & a large "
               'heated pool surrounded by reclining chairs to sunbathe.  The '
               'Ocean you see in the pictures is not even a mile away, known as '
               'the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  '
               'paddle boarding, surfing are all just minutes from the front '
               'door.'},
   {'score': 0.7622430920600891,
   'summary': 'THIS IS A VERY SPACIOUS 1 BEDROOM FULL CONDO (SLEEPS 4) AT THE '
               'BEAUTIFUL VALLEY ISLE RESORT ON THE BEACH IN LAHAINA, MAUI!! YOU '
               'WILL LOVE THE PERFECT LOCATION OF THIS VERY NICE HIGH RISE! ALSO '
               'THIS SPACIOUS FULL CONDO, FULL KITCHEN, BIG BALCONY!!'},
   {'score': 0.7484776973724365,
   'summary': 'Para 2 pessoas. Vista de mar a 150 mts. Prédio com 2 elevadores. '
               'Tem: - quarto com roupeiro e cama de casal (colchão '
               'magnetizado); - cozinha: placa de discos, exaustor, frigorifico, '
               'micro-ondas e torradeira; casa de banho completa; - sala e '
               'varanda.'},
   {'score': 0.7452666759490967,
   'summary': 'Quarto com vista para a Lagoa Rodrigo de Freitas, cartão postal '
               'do Rio de Janeiro. Linda Vista.  1 Quarto e 1 banheiro  Amplo, '
               'arejado, vaga na garagem. Prédio com piscina, sauna e '
               'playground.  Fácil acesso, próximo da praia e shoppings.'},
   {'score': 0.73777174949646,
   'summary': 'próximo aos principais pontos turísticos,,do lado do metro, '
               'vista p o CRISTO REDENTOR, GARAGEM, FAXINEIRA, PLAY.'}]
   Results from int8-embeddings embeddings
   [{'score': 0.5057082176208496,
   'summary': 'A beautiful and comfortable 1 Bedroom Air Conditioned Condo in '
               'Makaha Valley - stunning Ocean & Mountain views All the '
               'amenities of home, suited for longer stays. Full kitchen & large '
               "bathroom.  Several gas BBQ's for all guests to use & a large "
               'heated pool surrounded by reclining chairs to sunbathe.  The '
               'Ocean you see in the pictures is not even a mile away, known as '
               'the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  '
               'paddle boarding, surfing are all just minutes from the front '
               'door.'},
   {'score': 0.5048595666885376,
   'summary': 'THIS IS A VERY SPACIOUS 1 BEDROOM FULL CONDO (SLEEPS 4) AT THE '
               'BEAUTIFUL VALLEY ISLE RESORT ON THE BEACH IN LAHAINA, MAUI!! YOU '
               'WILL LOVE THE PERFECT LOCATION OF THIS VERY NICE HIGH RISE! ALSO '
               'THIS SPACIOUS FULL CONDO, FULL KITCHEN, BIG BALCONY!!'},
   {'score': 0.5045757293701172,
   'summary': 'Para 2 pessoas. Vista de mar a 150 mts. Prédio com 2 elevadores. '
               'Tem: - quarto com roupeiro e cama de casal (colchão '
               'magnetizado); - cozinha: placa de discos, exaustor, frigorifico, '
               'micro-ondas e torradeira; casa de banho completa; - sala e '
               'varanda.'},
   {'score': 0.5044537782669067,
   'summary': 'Quarto com vista para a Lagoa Rodrigo de Freitas, cartão postal '
               'do Rio de Janeiro. Linda Vista.  1 Quarto e 1 banheiro  Amplo, '
               'arejado, vaga na garagem. Prédio com piscina, sauna e '
               'playground.  Fácil acesso, próximo da praia e shoppings.'},
   {'score': 0.5044353604316711,
   'summary': 'The ultimate way to experience Sydney Harbour; fireworks, the '
               'bridge, and the proximity to the city means you can experience '
               'everything this city has to offer.  Tucked into the Balmain '
               "Peninsula, you're close to parks, pubs, shops, buses, and more!"}]
   Results from int1-embeddings embeddings
   [{'score': 0.7158203125,
   'summary': 'A beautiful and comfortable 1 Bedroom Air Conditioned Condo in '
               'Makaha Valley - stunning Ocean & Mountain views All the '
               'amenities of home, suited for longer stays. Full kitchen & large '
               "bathroom.  Several gas BBQ's for all guests to use & a large "
               'heated pool surrounded by reclining chairs to sunbathe.  The '
               'Ocean you see in the pictures is not even a mile away, known as '
               'the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  '
               'paddle boarding, surfing are all just minutes from the front '
               'door.'},
   {'score': 0.6865234375,
   'summary': 'Para 2 pessoas. Vista de mar a 150 mts. Prédio com 2 elevadores. '
               'Tem: - quarto com roupeiro e cama de casal (colchão '
               'magnetizado); - cozinha: placa de discos, exaustor, frigorifico, '
               'micro-ondas e torradeira; casa de banho completa; - sala e '
               'varanda.'},
   {'score': 0.677734375,
   'summary': 'próximo aos principais pontos turísticos,,do lado do metro, '
               'vista p o CRISTO REDENTOR, GARAGEM, FAXINEIRA, PLAY.'},
   {'score': 0.6748046875,
   'summary': 'Cozy and comfortable apartment. Ideal for families and '
               'vacations.  3 bedrooms, 2 of them suites.  Located 20-min walk '
               'to the beach and close to the Rio 2016 Olympics Venues. Situated '
               'in a modern and secure condominium, with many entertainment '
               'available options around.'},
   {'score': 0.6728515625,
   'summary': 'THIS IS A VERY SPACIOUS 1 BEDROOM FULL CONDO (SLEEPS 4) AT THE '
               'BEAUTIFUL VALLEY ISLE RESORT ON THE BEACH IN LAHAINA, MAUI!! YOU '
               'WILL LOVE THE PERFECT LOCATION OF THIS VERY NICE HIGH RISE! ALSO '
               'THIS SPACIOUS FULL CONDO, FULL KITCHEN, BIG BALCONY!!'}]
   ```

To quantize your BSON (Binary Javascript Object Notation) `binData` vectors, you must have the following:

- A cluster running MongoDB version 6.0.11, 7.0.2, or later.

  Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

- Access to an embedding model that supports byte vector output.

  The outputs from the following embedding models can be used to generate BSON (Binary Javascript Object Notation) `binData` vectors with a supported MongoDB driver:

  | Embedding Model Provider | Embedding Model |
  | --- | --- |
  | [Voyage AI](https://www.voyageai.com/) | `voyage-3-large` |
  | [Cohere](https://cohere.com/) | `embed-english-v3.0` |
  | [Nomic](https://www.nomic.ai/) | `nomic-embed-text-v1.5` |
  | [Jina](https://jina.ai/) | `jina-embeddings-v2-base-en` |
  | [Mixedbread](https://www.mixedbread.ai/) | `mxbai-embed-large-v1` |

  Scalar quantization preserves recall for these models because these models are all trained to be quantization aware. Therefore, [recall](https://www.mongodb.com/docs/manual/reference/glossary.md#std-term-recall) degradation for scalar quantized embeddings produced by these models is minimal even at lower dimensions like 384.

* [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) version 8 or later.

* An environment to set up and run a Java application. We recommend that you use an integrated development environment (IDE) such as [IntelliJ IDEA](https://www.jetbrains.com/idea/) or [Eclipse IDE](https://eclipseide.org/) to configure Maven or Gradle to build and run your project.

## Procedure

Create a Java project in your IDE with the dependencies configured for the [MongoDB Java Driver](https://www.mongodb.com/docs/drivers/java/sync/current/quick-start/), and then perform the following steps in the project. To try the example, replace the placeholders with valid values.

1. Create your Java project and install dependencies.

   From your IDE, create a Java project using Maven or Gradle.

   Add the following dependencies, depending on your package manager:

   ### Maven

   If you are using Maven, add the following dependencies to the `dependencies` array in your project's `pom.xml` file:

   ```xml&#xA;
    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.mongodb</groupId>
            <artifactId>mongodb-driver-sync</artifactId>
            <version>5.3.1</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>2.0.16</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-simple</artifactId>
            <version>2.0.16</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.json</groupId>
            <artifactId>json</artifactId>
            <version>20250517</version>
        </dependency>
        <dependency>
            <groupId>com.squareup.okhttp3</groupId>
            <artifactId>okhttp</artifactId>
            <version>4.12.0</version>
        </dependency>
   </dependencies>
   ```

   Run your package manager to install the dependencies to your project.

2. Set your environment variables.

   **Note:**

   This example sets the variables for the project in the IDE. Production applications might manage environment variables through a deployment configuration, CI/CD pipeline, or secrets manager, but you can adapt the provided code to fit your use case.

   In your IDE, create a new configuration template and add the following variables to your project:

   - If you are using IntelliJ IDEA, create a new Application run configuration template, then add your variables as semicolon-separated values in the Environment variables field (for example, `FOO=123;BAR=456`). Apply the changes and click OK.

     To learn more, see the [Create a run/debug configuration from a template](https://www.jetbrains.com/help/idea/run-debug-configuration.html#createExplicitly) section of the IntelliJ IDEA documentation.

   - If you are using Eclipse, create a new Java Application launch configuration, then add each variable as a new key-value pair in the Environment tab. Apply the changes and click OK.

     To learn more, see the [Creating a Java application launch configuration](https://help.eclipse.org/latest/topic/org.eclipse.jdt.doc.user/tasks/tasks-java-local-configuration.htm) section of the Eclipse IDE documentation.

   ```shell&#xA;
   VOYAGE_API_KEY=<api-key>
   MONGODB_URI=<connection-string>
   ```

   Update the placeholders with the following values:

   - Replace the `<api-key>` placeholder value with your Voyage AI API key.

   - Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

     ### Atlas Cluster

     Your connection string should use the following format:

     ```text
     mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
     ```

     To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Generate embeddings from your data.

   You can use an embedding model provider to generate `float`, `int8`, and `int1` embeddings for your data and then use the [MongoDB Java Driver](https://www.mongodb.com/docs/drivers/java/sync/current/) to convert your native vector embedding to BSON (Binary Javascript Object Notation) vectors. The following sample code uses Voyage AI's `voyage-3-large` API (Application Programming Interface) to generate full-precision vectors.

   Create a new file named `GenerateAndConvertEmbeddings.java` in your Java project.

   ```shell
   touch GenerateAndConvertEmbeddings.java
   ```

   Copy and paste the following code in the `GenerateAndConvertEmbeddings.java` file.

   This code does the following:

   - Generates the `float32`, `int8`, and `ubinary` vector embeddings by using Voyage AI's `voyage-3-large` embedding model.

   - Converts the embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using the [MongoDB Java Driver.](https://www.mongodb.com/docs/drivers/java/sync/current/)

   - Creates a file named `embeddings.json` and saves the data with embeddings in the file to upload to Atlas.

   ```java
   import okhttp3.*;  
   import org.bson.BinaryVector;  
   import org.bson.Document;  
   import org.json.JSONArray;  
   import org.json.JSONObject;  
     
   import java.io.FileOutputStream;  
   import java.io.IOException;  
   import java.util.ArrayList;  
   import java.util.List;  
   import java.util.Objects;  
   import java.util.concurrent.TimeUnit;  
     
   public class GenerateAndConvertEmbeddings {  
       // Sample Data
       private static final List<String> DATA = List.of(  
               "The Great Wall of China is visible from space.",  
               "The Eiffel Tower was completed in Paris in 1889.",  
               "Mount Everest is the highest peak on Earth at 8,848m.",  
               "Shakespeare wrote 37 plays and 154 sonnets during his lifetime.",  
               "The Mona Lisa was painted by Leonardo da Vinci."  
       );  
     
       // Configuration settings
       private static final String VOYAGE_API_URL = "https://ai.mongodb.com/v1/embeddings";  
       private static final int CONNECTION_TIMEOUT = 30;  
       private static final int READ_TIMEOUT = 60;  
     
       public static void main(String[] args) {  
           String apiKey = System.getenv("VOYAGE_API_KEY");  // Replace with your actual API key  
     
           if (Objects.isNull(apiKey) || apiKey.isEmpty()) {  
               throw new RuntimeException("API key not found.");  
           }  
     
           Document bsonEmbeddings = fetchEmbeddings(apiKey);  
           writeToFile(bsonEmbeddings, "embeddings.json");  
       }  
     
       // Fetch embeddings from Voyage AI API using the given API key
       private static Document fetchEmbeddings(String apiKey) {  
           OkHttpClient client = new OkHttpClient.Builder()  
                   .connectTimeout(CONNECTION_TIMEOUT, TimeUnit.SECONDS)  
                   .readTimeout(READ_TIMEOUT, TimeUnit.SECONDS)  
                   .build();  
     
           List<List<List<Integer>>> embeddingsByOutputType = new ArrayList<>();  
           List<String> outputDtypes = List.of("float", "int8", "ubinary");  
     
           try {  
               for (String dtype : outputDtypes) {  
                   String responseBody = sendRequest(client, apiKey, dtype);  
                   embeddingsByOutputType.add(parseEmbeddings(responseBody, dtype));  
               }  
           } catch (IOException e) {  
               throw new RuntimeException("Error fetching embeddings: " + e.getMessage(), e);  
           }  
     
           return convertEmbeddingsToBson(embeddingsByOutputType);  
       }  
     
       // Send API request to Voyage AI
       private static String sendRequest(OkHttpClient client, String apiKey, String outputDtype) throws IOException {  
           String requestBody = new JSONObject()  
                   .put("input", DATA)  
                   .put("model", "voyage-3-large")  
                   .put("input_type", "document")  
                   .put("output_dtype", outputDtype)  
                   .put("output_dimension", 1024)  
                   .toString();  
     
           Request request = new Request.Builder()  
                   .url(VOYAGE_API_URL)  
                   .post(RequestBody.create(requestBody, MediaType.get("application/json")))  
                   .addHeader("Authorization", "Bearer " + apiKey)  
                   .build();  
     
           try (Response response = client.newCall(request).execute()) {  
               if (!response.isSuccessful()) {  
                   throw new IOException("API error: HTTP " + response.code());  
               }  
               return response.body().string();  
           }  
       }  
     
       // Parse embeddings from Voyage AI API response
       private static List<List<Integer>> parseEmbeddings(String responseBody, String outputDtype) {  
           JSONObject responseJson = new JSONObject(responseBody);  
           JSONArray dataArray = responseJson.optJSONArray("data");  
     
           if (dataArray == null) {  
               throw new RuntimeException("Invalid response format: 'data' field missing.");  
           }  
     
           List<List<Integer>> embeddings = new ArrayList<>();  
           for (int i = 0; i < dataArray.length(); i++) {  
               JSONArray embeddingVector = dataArray.getJSONObject(i).getJSONArray("embedding");  
     
               List<Integer> vector = new ArrayList<>();  
               for (int j = 0; j < embeddingVector.length(); j++) {  
                   int value = embeddingVector.getInt(j);  
     
                   // Handle binary quantization offset  
                   if ("binary".equals(outputDtype)) {  
                       value = value - 128; // Offset binary method (signed int8 representation)  
                   }  
     
                   vector.add(value);  
               }  
               embeddings.add(vector);  
           }  
           return embeddings;  
       }  
     
       // Convert fetched embeddings into BSON format
       private static Document convertEmbeddingsToBson(List<List<List<Integer>>> embeddingsByOutputType) {  
           List<Document> bsonEmbeddings = new ArrayList<>();  
           for (int i = 0; i < DATA.size(); i++) {  
               Document embedding = new Document()  
                       .append("text", DATA.get(i))  
                       .append("embeddings_float32", BinaryVector.floatVector(listToFloatArray(embeddingsByOutputType.get(0).get(i))))  
                       .append("embeddings_int8", BinaryVector.int8Vector(listToByteArray(embeddingsByOutputType.get(1).get(i)))) // Binary embeddings  
                       .append("embeddings_int1", BinaryVector.packedBitVector(listToByteArray(embeddingsByOutputType.get(2).get(i)), (byte) 0)); // Ubinary embeddings  
               bsonEmbeddings.add(embedding);  
           }  
           return new Document("data", bsonEmbeddings);  
       }  
     
       // Save BSON embeddings to a JSON file
       private static void writeToFile(Document bsonEmbeddings, String fileName) {  
           try (FileOutputStream fos = new FileOutputStream(fileName)) {  
               fos.write(bsonEmbeddings.toJson().getBytes());  
               System.out.println("Embeddings saved to " + fileName);  
           } catch (IOException e) {  
               throw new RuntimeException("Error saving file: " + e.getMessage(), e);  
           }  
       }  
     
       private static float[] listToFloatArray(List<Integer> list) {  
           float[] array = new float[list.size()];  
           for (int i = 0; i < list.size(); i++) {  
               array[i] = list.get(i).floatValue();  
           }  
           return array;  
       }  
     
       private static byte[] listToByteArray(List<Integer> list) {  
           byte[] array = new byte[list.size()];  
           for (int i = 0; i < list.size(); i++) {  
               array[i] = list.get(i).byteValue();  
           }  
           return array;  
       }  
   }  

   ```

   Compile and run the file using your application run configuration.

   If you are using a terminal, run the following commands to compile and execute your program.

   ```shell
   javac GenerateAndConvertEmbeddings.java
   java GenerateAndConvertEmbeddings
   ```

   **Output:**

   ```shell
   Embeddings saved to embeddings.json
   ```

   Verify the embeddings in the `embeddings.json` file.

   To learn more about generating embeddings and converting the embeddings to `binData` vectors, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

4. Ingest the data and create a MongoDB Vector Search index.

   You must upload your data and embeddings to a collection in your cluster and create a MongoDB Vector Search index on the data to run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries against the data.

   Create a new file named `UploadDataAndCreateIndex.java` in your Java project.

   ```shell
   touch UploadDataAndCreateIndex.java
   ```

   Copy and paste the following code in the `UploadDataAndCreateIndex.java` file.

   This code does the following:

   - Uploads the data in the `embeddings.json` file to your cluster.

   - Creates a MongoDB Vector Search index on the `embeddings_float32`, `embeddings_int8`, and `embeddings_int1` fields.

   ```java
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.SearchIndexModel;
   import com.mongodb.client.model.SearchIndexType;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.io.IOException;
   import java.nio.file.Files;
   import java.nio.file.Path;
   import java.util.Collections;
   import java.util.List;
   import java.util.concurrent.TimeUnit;
   import java.util.stream.StreamSupport;

   public class UploadDataAndCreateIndex {

       private static final String MONGODB_URI = System.getenv("MONGODB_URI");
       private static final String DB_NAME = "<DATABASE-NAME>";
       private static final String COLLECTION_NAME = "<COLLECTION-NAME>";
       private static final String INDEX_NAME = "<INDEX-NAME>";

       public static void main(String[] args) {
           try (MongoClient mongoClient = MongoClients.create(MONGODB_URI)) {
               storeEmbeddings(mongoClient);
               setupVectorSearchIndex(mongoClient);
           } catch (IOException | InterruptedException e) {
               e.printStackTrace();
           }
       }

       // Upload the documents in the file to the given MongoDB namespace
       public static void storeEmbeddings(MongoClient client) throws IOException {
           MongoDatabase database = client.getDatabase(DB_NAME);
           MongoCollection<Document> collection = database.getCollection(COLLECTION_NAME);

           String fileContent = Files.readString(Path.of("embeddings.json"));
           List<Document> documents = parseDocuments(fileContent);

           collection.insertMany(documents);
           System.out.println("Inserted documents into MongoDB");
       }

       private static List<Document> parseDocuments(String jsonContent) throws IOException {
           Document rootDoc = Document.parse(jsonContent);
           return rootDoc.getList("data", Document.class);
       }

       // Create the Vector Search index
       public static void setupVectorSearchIndex(MongoClient client) throws InterruptedException {
           MongoDatabase database = client.getDatabase(DB_NAME);
           MongoCollection<Document> collection = database.getCollection(COLLECTION_NAME);
           
           Bson definition = new Document(
               "fields",
               List.of(
                   new Document("type", "vector")
                       .append("path", "embeddings_float32")
                       .append("numDimensions", 1024)
                       .append("similarity", "dotProduct"),
                   new Document("type", "vector")
                       .append("path", "embeddings_int8")
                       .append("numDimensions", 1024)
                       .append("similarity", "dotProduct"),
                   new Document("type", "vector")
                       .append("path", "embeddings_int1")
                       .append("numDimensions", 1024)
                       .append("similarity", "euclidean")
               )
           );
           
           SearchIndexModel indexModel = new SearchIndexModel(
               INDEX_NAME,
               definition,
               SearchIndexType.vectorSearch()
           );
           
           List<String> result = collection.createSearchIndexes(Collections.singletonList(indexModel));
           System.out.println("Successfully created vector index named: " + result.get(0));
           System.out.println("It may take up to a minute for the index to leave the BUILDING status and become queryable.");
           
           System.out.println("Polling to confirm the index has changed from the BUILDING status.");
           waitForIndex(collection, INDEX_NAME);
       }

       // Wait for the index build to complete
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

   Replace the following placeholder values in the code and save the file.

   | `<DATABASE-NAME>` | Name of the database in your cluster. |
   | --- | --- |
   | `<COLLECTION-NAME>` | Name of the collection where you want to upload the data. |
   | `<INDEX-NAME>` | Name of the MongoDB Vector Search index for the collection. |

   Compile and run the file using your application run configuration.

   If you are using a terminal, run the following commands to compile and execute your program.

   ```shell
   javac UploadDataAndCreateIndex.java
   java UploadDataAndCreateIndex
   ```

   **Output:**

   ```shell
   Inserted documents into MongoDB
   Successfully created vector index named: <INDEX_NAME>
   It may take up to a minute for the index to leave the BUILDING status and become queryable.
   Polling to confirm the index has changed from the BUILDING status.
   <INDEX_NAME> index is ready to query
   ```

   Log in to your cluster and verify the following:

   - Data in the namespace.

   - MongoDB Vector Search index for the collection.

5. Create and run a query against the collection.

   To test your embeddings, you can run a query against your collection. Use an embedding model provider to generate `float`, `int8`, and `int1` embeddings for your query text. The following sample code uses Voyage AI's `voyage-3-large` REST API (Application Programming Interface) to generate full-precision vectors. After generating the embeddings, use the [MongoDB Java Driver](https://www.mongodb.com/docs/drivers/java/sync/current/) to convert your native vector embedding to BSON (Binary Javascript Object Notation) vectors and run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query against the collection.

   Create a new file named `CreateEmbeddingsAndRunQuery.java` in your Java project.

   ```shell
   touch CreateEmbeddingsAndRunQuery.java
   ```

   Copy and paste the following code in the `CreateEmbeddingsAndRunQuery.java` file.

   This code does the following:

   - Generates the `float32`, `int8`, and `ubinary` vector embeddings by using Voyage AI's `voyage-3-large` embedding model.

   - Converts the embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using [MongoDB Java Driver.](https://www.mongodb.com/docs/drivers/java/sync/current/)

   - Runs the query against your collection.

   ```java
   import okhttp3.*;  
   import com.mongodb.client.MongoClient;  
   import com.mongodb.client.MongoClients;  
   import com.mongodb.client.MongoCollection;  
   import com.mongodb.client.MongoDatabase;  
   import org.bson.BinaryVector;  
   import org.bson.Document;
   import org.bson.conversions.Bson;
   import org.json.JSONArray;  
   import org.json.JSONObject;  
     
   import java.io.IOException;  
   import java.util.*;  
   import java.util.concurrent.TimeUnit;  
     
   import static com.mongodb.client.model.Aggregates.project;  
   import static com.mongodb.client.model.Aggregates.vectorSearch;  
   import static com.mongodb.client.model.Projections.fields;  
   import static com.mongodb.client.model.Projections.include;  
   import static com.mongodb.client.model.Projections.exclude;  
   import static com.mongodb.client.model.Projections.metaVectorSearchScore;  
   import static com.mongodb.client.model.search.SearchPath.fieldPath;  
   import static com.mongodb.client.model.search.VectorSearchOptions.approximateVectorSearchOptions;  
   import static java.util.Arrays.asList;  
     
   public class CreateEmbeddingsAndRunQuery {  
     
       // Configurations  
       private static final String VOYAGE_API_KEY = System.getenv("VOYAGE_API_KEY");
       private static final String MONGODB_URI = System.getenv("MONGODB_URI");       
       private static final String DB_NAME = "<DATABASE-NAME>";                     
       private static final String COLLECTION_NAME = "<COLLECTION-NAME>";    
       private static final String VECTOR_INDEX_NAME = "<INDEX-NAME>";         
       private static final String DATA_FIELD_NAME = "<DATA-FIELD-NAME>";
       private static final String QUERY_TEXT = "<QUERY-TEXT>";
     
       // Voyage AI API Endpoint  
       private static final String VOYAGE_API_URL = "https://ai.mongodb.com/v1/embeddings";  
     
       // Timeout values for API requests  
       private static final int CONNECTION_TIMEOUT = 30;  
       private static final int READ_TIMEOUT = 60;  
     
       public static void main(String[] args) {  
           if (VOYAGE_API_KEY == null || VOYAGE_API_KEY.isEmpty()) {  
               throw new RuntimeException("API key not found. Set VOYAGE_API_KEY in your environment.");  
           }  
           if (MONGODB_URI == null || MONGODB_URI.isEmpty()) {  
               throw new RuntimeException("MongoDB URI not found. Set MONGODB_URI in your environment.");  
           }  
     
           String queryText = <QUERY-TEXT>; // Query text dynamically provided by the user  
     
           try {  
               CreateEmbeddingsAndRunQuery processor = new CreateEmbeddingsAndRunQuery();  
     
               System.out.println("Fetching embeddings...");  
               Document bsonEmbeddings = processor.fetchEmbeddingsForQuery(queryText);  
     
               System.out.println("Using embeddings in vector search queries...");  
               processor.runVectorSearchQuery(bsonEmbeddings);  
     
           } catch (Exception e) {  
               e.printStackTrace();  
           }  
       }  
     
       // Fetch embeddings from Voyage AI API for multiple output data types  
       private Document fetchEmbeddingsForQuery(String queryText) {  
           OkHttpClient client = new OkHttpClient.Builder()  
                   .connectTimeout(CONNECTION_TIMEOUT, TimeUnit.SECONDS)  
                   .readTimeout(READ_TIMEOUT, TimeUnit.SECONDS)  
                   .build();  
     
           List<List<List<Integer>>> embeddingsByOutputType = new ArrayList<>();  
           List<String> outputDtypes = List.of("float", "int8", "ubinary"); // Supported output data types  
     
           try {  
               for (String dtype : outputDtypes) {  
                   String responseBody = sendRequest(client, VOYAGE_API_KEY, queryText, dtype);  
                   embeddingsByOutputType.add(parseEmbeddings(responseBody, dtype));  
               }  
           } catch (IOException e) {  
               throw new RuntimeException("Error fetching embeddings: " + e.getMessage(), e);  
           }  
     
           return convertEmbeddingsToBson(queryText, embeddingsByOutputType); // Convert embeddings to BSON format  
       }  
     
       // Send API request to Voyage AI to generate embeddings for a specific output data type
       private String sendRequest(OkHttpClient client, String apiKey, String queryText, String outputDtype) throws IOException {  
           String requestBody = new JSONObject()  
                   .put("input", List.of(queryText)) // Dynamic user query text as input  
                   .put("model", "voyage-3-large")  // Model type  
                   .put("input_type", "query")      // Input type for query  
                   .put("output_dtype", outputDtype)  
                   .toString();  
     
           Request request = new Request.Builder()  
                   .url(VOYAGE_API_URL)  
                   .post(RequestBody.create(requestBody, MediaType.get("application/json")))  
                   .addHeader("Authorization", "Bearer " + apiKey)  
                   .build();  
     
           try (Response response = client.newCall(request).execute()) {  
               if (!response.isSuccessful()) {  
                   throw new IOException("API error: HTTP " + response.code());  
               }  
               return response.body().string();  
           }  
       }  
     
       // Parse embeddings from API response
       private static List<List<Integer>> parseEmbeddings(String responseBody, String outputDtype) {  
           JSONObject responseJson = new JSONObject(responseBody);  
           JSONArray dataArray = responseJson.optJSONArray("data");  
     
           if (dataArray == null) {  
               throw new RuntimeException("Invalid response format: 'data' field missing.");  
           }  
     
           List<List<Integer>> embeddings = new ArrayList<>();  
           for (int i = 0; i < dataArray.length(); i++) {  
               JSONArray embeddingVector = dataArray.getJSONObject(i).getJSONArray("embedding");  
     
               List<Integer> vector = new ArrayList<>();  
               for (int j = 0; j < embeddingVector.length(); j++) {  
                   int value = embeddingVector.getInt(j);  
     
                   // Handle binary quantization offset  
                   if ("binary".equals(outputDtype)) {  
                       value = value - 128; // Offset binary method (signed int8 representation)  
                   }  
     
                   vector.add(value);  
               }  
               embeddings.add(vector);  
           }  
           return embeddings;  
       }
     
       // Convert embeddings into BSON format
       private Document convertEmbeddingsToBson(String queryText, List<List<List<Integer>>> embeddingsByOutputType) {  
           Document embedding = new Document()  
                   .append("text", queryText)  
                   .append("embeddings_float32", BinaryVector.floatVector(listToFloatArray(embeddingsByOutputType.get(0).get(0))))  
                   .append("embeddings_int8", BinaryVector.int8Vector(listToByteArray(embeddingsByOutputType.get(1).get(0))))  
                   .append("embeddings_int1", BinaryVector.packedBitVector(listToByteArray(embeddingsByOutputType.get(2).get(0)), (byte) 0));  
             
           return new Document("data", List.of(embedding));  
       }  
     
       // Run MongoDB vector search query using the generated embeddings
       private void runVectorSearchQuery(Document bsonEmbeddings) {  
           try (MongoClient mongoClient = MongoClients.create(MONGODB_URI)) {  
               MongoDatabase database = mongoClient.getDatabase(DB_NAME);  
               MongoCollection<Document> collection = database.getCollection(COLLECTION_NAME);  
     
               List<Document> embeddedDocuments = bsonEmbeddings.getList("data", Document.class);  
     
               for (Document embedding : embeddedDocuments) {  
                   for (String embeddingType : List.of("embeddings_float32", "embeddings_int8", "embeddings_int1")) {  
                       System.out.println("Results from " + embeddingType.replace("embeddings_", "") + " embeddings:");  
     
                       List<Bson> pipeline = asList(  
                               vectorSearch(  
                                       fieldPath(embeddingType),  
                                       embedding.get(embeddingType, BinaryVector.class),  
                                       VECTOR_INDEX_NAME,  
                                       2, approximateVectorSearchOptions(5)  
                               ),  
                               project(fields(  
                                       exclude("_id"),  
                                       include(DATA_FIELD_NAME),  
                                       metaVectorSearchScore("vectorSearchScore"))));  
     
                       List<Document> results = collection.aggregate(pipeline).into(new ArrayList<>());  
     
                       for (Document result : results) {  
                           System.out.println(result.toJson());  
                       }  
                   }  
               }  
           }  
       }  
     
       private static float[] listToFloatArray(List<Integer> list) {  
           float[] array = new float[list.size()];  
           for (int i = 0; i < list.size(); i++) {  
               array[i] = list.get(i).floatValue();  
           }  
           return array;  
       }  
     
       private static byte[] listToByteArray(List<Integer> list) {  
           byte[] array = new byte[list.size()];  
           for (int i = 0; i < list.size(); i++) {  
               array[i] = list.get(i).byteValue();  
           }  
           return array;  
       }  
   }  

   ```

   Replace the following placeholder values in the code and save the file.

   | `<DATABASE-NAME>` | Name of the database in your cluster. |
   | --- | --- |
   | `<COLLECTION-NAME>` | Name of the collection where you ingested the data. |
   | `<INDEX-NAME>` | Name of the MongoDB Vector Search index for the collection. |
   | `<DATA-FIELD-NAME>` | Name of the field that contain the text from which you generated embeddings. For this example, use `text`. |
   | `<QUERY-TEXT>` | Text for the query. For this example, use `science fact`. |

   Compile and run the file using your application run configuration.

   If you are using a terminal, run the following commands to compile and execute your program.

   ```shell
   javac CreateEmbeddingsAndRunQuery.java
   java CreateEmbeddingsAndRunQuery
   ```

   **Output:**

   ```shell
   Fetching embeddings...
   Using embeddings in vector search queries...
   {"text": "The Great Wall of China is visible from space.", "vectorSearchScore": 0.5}
   {"text": "The Eiffel Tower was completed in Paris in 1889.", "vectorSearchScore": 0.5}
   Results from int8 embeddings:
   {"text": "The Great Wall of China is visible from space.", "vectorSearchScore": 0.5051995515823364}
   {"text": "Mount Everest is the highest peak on Earth at 8,848m.", "vectorSearchScore": 0.5044659972190857}
   Results from int1 embeddings:
   {"text": "The Great Wall of China is visible from space.", "vectorSearchScore": 0.6845703125}
   {"text": "Mount Everest is the highest peak on Earth at 8,848m.", "vectorSearchScore": 0.6650390625}
   ```

   To learn more about generating embeddings and converting the embeddings to `binData` vectors, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

To quantize your BSON (Binary Javascript Object Notation) `binData` vectors, you must have the following:

- A cluster running MongoDB version 6.0.11, 7.0.2, or later.

  Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

- Access to an embedding model that supports byte vector output.

  The outputs from the following embedding models can be used to generate BSON (Binary Javascript Object Notation) `binData` vectors with a supported MongoDB driver:

  | Embedding Model Provider | Embedding Model |
  | --- | --- |
  | [Voyage AI](https://www.voyageai.com/) | `voyage-3-large` |
  | [Cohere](https://cohere.com/) | `embed-english-v3.0` |
  | [Nomic](https://www.nomic.ai/) | `nomic-embed-text-v1.5` |
  | [Jina](https://jina.ai/) | `jina-embeddings-v2-base-en` |
  | [Mixedbread](https://www.mixedbread.ai/) | `mxbai-embed-large-v1` |

  Scalar quantization preserves recall for these models because these models are all trained to be quantization aware. Therefore, [recall](https://www.mongodb.com/docs/manual/reference/glossary.md#std-term-recall) degradation for scalar quantized embeddings produced by these models is minimal even at lower dimensions like 384.

* [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) version 8 or later.

* An environment to set up and run a Java application. We recommend that you use an integrated development environment (IDE) such as [IntelliJ IDEA](https://www.jetbrains.com/idea/) or [Eclipse IDE](https://eclipseide.org/) to configure Maven or Gradle to build and run your project.

## Procedure

Create a Java project in your IDE with the dependencies configured for the [MongoDB Java Driver](https://www.mongodb.com/docs/drivers/java/sync/current/quick-start/), and then perform the following steps in the project. To try the example, replace the placeholders with valid values.

1. Create your Java project and install dependencies.

   From your IDE, create a Java project using Maven or Gradle.

   Add the following dependencies, depending on your package manager:

   ### Maven

   If you are using Maven, add the following dependencies to the `dependencies` array in your project's `pom.xml` file:

   ```xml&#xA;
    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.mongodb</groupId>
            <artifactId>mongodb-driver-sync</artifactId>
            <version>5.3.1</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>2.0.16</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-simple</artifactId>
            <version>2.0.16</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.json</groupId>
            <artifactId>json</artifactId>
            <version>20250517</version>
        </dependency>
        <dependency>
            <groupId>com.squareup.okhttp3</groupId>
            <artifactId>okhttp</artifactId>
            <version>4.12.0</version>
        </dependency>
   </dependencies>
   ```

   Run your package manager to install the dependencies to your project.

2. Set your environment variables.

   **Note:**

   This example sets the variables for the project in the IDE. Production applications might manage environment variables through a deployment configuration, CI/CD pipeline, or secrets manager, but you can adapt the provided code to fit your use case.

   In your IDE, create a new configuration template and add the following variables to your project:

   - If you are using IntelliJ IDEA, create a new Application run configuration template, then add your variables as semicolon-separated values in the Environment variables field (for example, `FOO=123;BAR=456`). Apply the changes and click OK.

     To learn more, see the [Create a run/debug configuration from a template](https://www.jetbrains.com/help/idea/run-debug-configuration.html#createExplicitly) section of the IntelliJ IDEA documentation.

   - If you are using Eclipse, create a new Java Application launch configuration, then add each variable as a new key-value pair in the Environment tab. Apply the changes and click OK.

     To learn more, see the [Creating a Java application launch configuration](https://help.eclipse.org/latest/topic/org.eclipse.jdt.doc.user/tasks/tasks-java-local-configuration.htm) section of the Eclipse IDE documentation.

   ```shell&#xA;
   VOYAGE_API_KEY=<api-key>
   MONGODB_URI=<connection-string>
   ```

   Update the placeholders with the following values:

   - Replace the `<api-key>` placeholder value with your Voyage AI API key.

   - Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

     ### Atlas Cluster

     Your connection string should use the following format:

     ```text
     mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
     ```

     To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. (Conditional) Generate embeddings from your data.

   You can use an embedding model provider to generate `float`, `int8`, and `int1` embeddings for your data and then use the [MongoDB Java Driver](https://www.mongodb.com/docs/drivers/java/sync/current/) to convert your native vector embedding to BSON (Binary Javascript Object Notation) vectors. The following sample code uses Voyage AI's REST API (Application Programming Interface) to generate full-precision vectors from the data in the `sample_airbnb.listingsAndReviews` namespace.

   Create a new file named `GenerateAndConvertEmbeddings.java` in your Java project.

   ```shell
   touch GenerateAndConvertEmbeddings.java
   ```

   Copy and paste the following code in the `GenerateAndConvertEmbeddings.java` file.

   This code does the following:

   - Gets the `summary` field from 50 documents in the `sample_airbnb.listingsAndReviews` namespace.

   - Generates the `float32`, `int8`, and `ubinary` vector embeddings by using Voyage AI's `voyage-3-large` embedding model.

   - Converts the embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using the [MongoDB Java Driver.](https://www.mongodb.com/docs/drivers/java/sync/current/)

   - Creates a file named `embeddings.json` and saves the data with embeddings in the file.

   ```java
   import okhttp3.*;

   import com.mongodb.client.FindIterable;
   import com.mongodb.client.MongoClient;  
   import com.mongodb.client.MongoClients;  
   import com.mongodb.client.MongoCollection;  
   import com.mongodb.client.MongoDatabase;  
   import org.bson.Document;  
   import org.bson.BinaryVector;  
   import org.slf4j.Logger;  
   import org.slf4j.LoggerFactory;  
   import org.json.JSONArray;  
   import org.json.JSONObject;  
     
   import java.io.FileOutputStream;  
   import java.io.IOException;  
   import java.util.*;  
   import java.util.concurrent.TimeUnit;  
     
   public class GenerateAndConvertEmbeddings {  
       private static final Logger logger = LoggerFactory.getLogger(GenerateAndConvertEmbeddings.class);  
     
       // Configuration settings  
       private static final String VOYAGE_API_URL = "https://ai.mongodb.com/v1/embeddings"; // Voyage AI API URL  
       private static final String VOYAGE_API_KEY = System.getenv("VOYAGE_API_KEY");         // Voyage API key  
       private static final String MONGODB_URI = System.getenv("MONGODB_URI");               // MongoDB connection URI  
     
       // Timeout values for API requests  
       private static final int CONNECTION_TIMEOUT = 30; // Timeout for API requests  
       private static final int READ_TIMEOUT = 60;       // Timeout for API responses  
     
       public static void main(String[] args) {  
           try {  
               List<String> summaries = fetchSummariesFromMongoDB();  
               if (summaries.isEmpty()) {  
                   throw new RuntimeException("No summaries retrieved from MongoDB.");  
               }  
     
               Document bsonEmbeddings = fetchEmbeddingsFromVoyage(summaries, VOYAGE_API_KEY);  
               if (bsonEmbeddings == null || bsonEmbeddings.isEmpty()) {  
                   throw new RuntimeException("Failed to fetch embeddings.");  
               }  
     
               convertAndSaveEmbeddings(bsonEmbeddings);  
           } catch (Exception e) {  
               logger.error("Unexpected error: {}", e.getMessage(), e);  
           }  
       }  
     
       // Fetch summaries from MongoDB collection
       private static List<String> fetchSummariesFromMongoDB() {  
           List<String> summaries = new ArrayList<>();  
           if (MONGODB_URI == null || MONGODB_URI.isEmpty()) {  
               throw new RuntimeException("MongoDB URI is not set.");  
           }  
           logger.info("Connecting to MongoDB at URI: {}", MONGODB_URI);  
     
           try (MongoClient mongoClient = MongoClients.create(MONGODB_URI)) {  
               String dbName = "sample_airbnb";  
               String collName = "listingsAndReviews";  
               MongoDatabase database = mongoClient.getDatabase(dbName);  
               MongoCollection<Document> collection = database.getCollection(collName);  
     
               // Filter to exclude null or empty summaries  
               Document filter = new Document("summary", new Document("$nin", Arrays.asList(null, "")));  
               FindIterable<Document> documentsCursor = collection.find(filter).limit(50);  
     
               for (Document doc : documentsCursor) {  
                   String summary = doc.getString("summary");  
                   if (summary != null && !summary.isEmpty()) {  
                       summaries.add(summary);  
                   }  
               }  
               logger.info("Retrieved {} summaries from MongoDB.", summaries.size());  
           } catch (Exception e) {  
               logger.error("Error fetching from MongoDB: {}", e.getMessage(), e);  
               throw new RuntimeException("Failed to fetch data from MongoDB", e);  
           }  
           return summaries;  
       }  
     
       // Fetch embeddings from Voyage AI API for the given data input  
       private static Document fetchEmbeddingsFromVoyage(List<String> data, String apiKey) {  
           if (apiKey == null || apiKey.isEmpty()) {  
               throw new RuntimeException("API key is not set.");  
           }  
     
           OkHttpClient client = new OkHttpClient.Builder()  
                   .connectTimeout(CONNECTION_TIMEOUT, TimeUnit.SECONDS)  
                   .readTimeout(READ_TIMEOUT, TimeUnit.SECONDS)  
                   .build();  
     
           List<List<List<Integer>>> embeddingsByOutputType = new ArrayList<>();  
           List<String> outputDtypes = List.of("float", "int8", "ubinary");  
     
           try {  
               for (String dtype : outputDtypes) {  
                   String responseBody = sendRequest(client, apiKey, data, dtype);  
                   embeddingsByOutputType.add(parseEmbeddings(responseBody, dtype));  
               }  
           } catch (IOException e) {  
               logger.error("Error fetching embeddings: {}", e.getMessage(), e);  
               throw new RuntimeException("Error fetching embeddings from Voyage AI.", e);  
           }  
     
           // Convert embeddings to BSON  
           return convertEmbeddingsToBson(data, embeddingsByOutputType);  
       }  
     
       // Send API request to Voyage AI  
       private static String sendRequest(OkHttpClient client, String apiKey, List<String> inputData, String outputDtype) throws IOException {  
           String requestBody = new JSONObject()  
                   .put("input", inputData)  
                   .put("model", "voyage-3-large")  
                   .put("input_type", "document")  
                   .put("output_dtype", outputDtype)  
                   .put("output_dimension", 1024)  
                   .toString();  
     
           Request request = new Request.Builder()  
                   .url(VOYAGE_API_URL)  
                   .post(RequestBody.create(requestBody, MediaType.get("application/json")))  
                   .addHeader("Authorization", "Bearer " + apiKey)  
                   .build();  
     
           try (Response response = client.newCall(request).execute()) {  
               if (!response.isSuccessful()) {  
                   throw new IOException("API error: HTTP " + response.code());  
               }  
               return response.body().string();  
           }  
       }  
     
       // Parse embeddings from Voyage AI API response 
       private static List<List<Integer>> parseEmbeddings(String responseBody, String outputDtype) {  
           JSONObject responseJson = new JSONObject(responseBody);  
           JSONArray dataArray = responseJson.optJSONArray("data");  
     
           if (dataArray == null) {  
               throw new RuntimeException("Invalid response format: 'data' field missing.");  
           }  
     
           List<List<Integer>> embeddings = new ArrayList<>();  
           for (int i = 0; i < dataArray.length(); i++) {  
               JSONArray embeddingVector = dataArray.getJSONObject(i).getJSONArray("embedding");  
     
               List<Integer> vector = new ArrayList<>();  
               for (int j = 0; j < embeddingVector.length(); j++) {  
                   int value = embeddingVector.getInt(j);  
     
                   // Handle binary quantization offset for signed int8 representations  
                   if ("binary".equals(outputDtype)) {  
                       value = value - 128; // Offset binary method  
                   }  
     
                   vector.add(value);  
               }  
               embeddings.add(vector);  
           }  
           return embeddings;  
       }  
     
       // Convert fetched embeddings into BSON format  
       private static Document convertEmbeddingsToBson(List<String> inputData, List<List<List<Integer>>> embeddingsByOutputType) {  
           List<Document> bsonEmbeddings = new ArrayList<>();  
           for (int i = 0; i < inputData.size(); i++) {  
               Document embedding = new Document()  
                       .append("text", inputData.get(i))  
                       .append("embeddings_float32", BinaryVector.floatVector(listToFloatArray(embeddingsByOutputType.get(0).get(i))))  
                       .append("embeddings_int8", BinaryVector.int8Vector(listToByteArray(embeddingsByOutputType.get(1).get(i))))  
                       .append("embeddings_int1", BinaryVector.packedBitVector(listToByteArray(embeddingsByOutputType.get(2).get(i)), (byte) 0));  
               bsonEmbeddings.add(embedding);  
           }  
           return new Document("data", bsonEmbeddings);  
       }  
     
       // Save BSON embeddings to a JSON file 
       private static void convertAndSaveEmbeddings(Document bsonEmbeddings) {  
           try (FileOutputStream fos = new FileOutputStream("embeddings.json")) {  
               fos.write(bsonEmbeddings.toJson().getBytes());  
               logger.info("Embeddings with BSON vectors have been saved to embeddings.json");  
           } catch (IOException e) {  
               logger.error("Error writing embeddings to file: {}", e.getMessage(), e);  
           }  
       }  
     
       private static float[] listToFloatArray(List<Integer> list) {  
           float[] array = new float[list.size()];  
           for (int i = 0; i < list.size(); i++) {  
               array[i] = list.get(i).floatValue();  
           }  
           return array;  
       }  
     
       private static byte[] listToByteArray(List<Integer> list) {  
           byte[] array = new byte[list.size()];  
           for (int i = 0; i < list.size(); i++) {  
               array[i] = list.get(i).byteValue();  
           }  
           return array;  
       }  
   }  

   ```

   Compile and run the file using your application run configuration.

   If you are using a terminal, run the following commands to compile and execute your program.

   ```shell
   javac GenerateAndConvertEmbeddings.java
   java GenerateAndConvertEmbeddings
   ```

   **Output:**

   ```shell
   [main] INFO GenerateAndConvertEmbeddings - Connecting to MongoDB at URI: <CONNECTION-STRING>
   ...
   [main] INFO GenerateAndConvertEmbeddings - Retrieved 50 summaries from MongoDB.
   [main] INFO GenerateAndConvertEmbeddings - Embeddings with BSON vectors have been saved to embeddings.json
   ```

   Verify the embeddings in the `embeddings.json` file.

   To learn more about generating embeddings and converting the embeddings to `binData` vectors, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

4. Ingest the data and create a MongoDB Vector Search index.

   You must upload your data and embeddings to a collection in your cluster and create a MongoDB Vector Search index on the data to run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries against the data.

   Create a new file named `UploadDataAndCreateIndex.java` in your Java project.

   ```shell
   touch UploadDataAndCreateIndex.java
   ```

   Copy and paste the following code in the `UploadDataAndCreateIndex.java` file.

   This code does the following:

   - Uploads the `float32`, `int8`, and `int1` embeddings in the `embeddings.json` file to your cluster.

   - Creates a MongoDB Vector Search index on the `embeddings.float32`, `embeddings.int8`, and `embeddings.int1` fields.

   ```java
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.SearchIndexModel;
   import com.mongodb.client.model.SearchIndexType;

   import org.bson.Document;
   import org.bson.conversions.Bson;
   import org.bson.BinaryVector; // Import the BinaryVector

   import java.io.IOException;
   import java.nio.file.Files;
   import java.nio.file.Path;
   import java.util.Collections;
   import java.util.List;
   import java.util.concurrent.TimeUnit;
   import java.util.stream.StreamSupport;

   public class UploadDataAndCreateIndex {

       private static final String MONGODB_URI = System.getenv("MONGODB_URI");
       private static final String DB_NAME = "<DATABASE-NAME>";
       private static final String COLLECTION_NAME = "<COLLECTION-NAME>";
       private static final String INDEX_NAME = "<INDEX-NAME>";

       public static void main(String[] args) {
           try (MongoClient mongoClient = MongoClients.create(MONGODB_URI)) {
               uploadEmbeddingsData(mongoClient);
               setupVectorSearchIndex(mongoClient);
           } catch (Exception e) {
               e.printStackTrace();
           }
       }

       // Upload the embeddings in the file to the given MongoDB namespace
       public static void uploadEmbeddingsData(MongoClient mongoClient) throws IOException {
           MongoDatabase database = mongoClient.getDatabase(DB_NAME);
           MongoCollection<Document> collection = database.getCollection(COLLECTION_NAME);
           String filePath = "embeddings.json";
           String fileContent = Files.readString(Path.of(filePath));

           Document rootDoc = Document.parse(fileContent);
           List<Document> embeddingsDocs = rootDoc.getList("data", Document.class);

           for (Document doc : embeddingsDocs) {
               // Retrieve the string value from the document
               String summary = doc.getString("text");

               // Get the BinaryVector objects from the document
               BinaryVector embeddingsFloat32 = doc.get("embeddings_float32", BinaryVector.class);
               BinaryVector embeddingsInt8 = doc.get("embeddings_int8", BinaryVector.class);
               BinaryVector embeddingsInt1 = doc.get("embeddings_int1", BinaryVector.class);

               // Create filter and update documents
               Document filter = new Document("summary", summary);
               Document update = new Document("$set", new Document("summary", summary)
                       .append("embeddings_float32", embeddingsFloat32)
                       .append("embeddings_int8", embeddingsInt8)
                       .append("embeddings_int1", embeddingsInt1));

               // Perform update operation with upsert option
               collection.updateOne(filter, update, new com.mongodb.client.model.UpdateOptions().upsert(true));
               System.out.println("Processed document with summary: " + summary);
           }
       }

       // Create a Vector Search index
       public static void setupVectorSearchIndex(MongoClient client) throws InterruptedException {
           MongoDatabase database = client.getDatabase(DB_NAME);
           MongoCollection<Document> collection = database.getCollection(COLLECTION_NAME);
           // Define the index details
           Bson definition = new Document(
               "fields",
               List.of(
                   new Document("type", "vector")
                       .append("path", "embeddings_float32")
                       .append("numDimensions", 1024)
                       .append("similarity", "dotProduct"),
                   new Document("type", "vector")
                       .append("path", "embeddings_int8")
                       .append("numDimensions", 1024)
                       .append("similarity", "dotProduct"),
                   new Document("type", "vector")
                       .append("path", "embeddings_int1")
                       .append("numDimensions", 1024)
                       .append("similarity", "euclidean")
               )
           );
           // Define the index model
           SearchIndexModel indexModel = new SearchIndexModel(
               INDEX_NAME,
               definition,
               SearchIndexType.vectorSearch()
           );
           // Create the index using the defined model
           List<String> result = collection.createSearchIndexes(Collections.singletonList(indexModel));
           System.out.println("Successfully created vector index named: " + result.get(0));
           System.out.println("It may take up to a minute for the index to leave the BUILDING status and become queryable.");
           // wait for index to build and become queryable
           System.out.println("Polling to confirm the index has changed from the BUILDING status.");
           waitForIndex(collection, INDEX_NAME);
       }

       // Wait for the index build to complete
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

   Replace the following placeholder value in the code and save the file.

   | `<INDEX-NAME>` | Name of the MongoDB Vector Search index for the collection. |
   | --- | --- |

   Compile and run the file using your application run configuration.

   If you are using a terminal, run the following commands to compile and execute your program.

   ```shell
   javac UploadDataAndCreateIndex.java
   java UploadDataAndCreateIndex
   ```

   **Output:**

   ```shell
   Processed document with summary: ...
   ...
   Successfully created vector index named: <INDEX_NAME>
   It may take up to a minute for the index to leave the BUILDING status and become queryable.
   Polling to confirm the index has changed from the BUILDING status.
   <INDEX_NAME> index is ready to query
   ```

   Log in to your cluster and verify the following:

   - Data in the namespace.

   - MongoDB Vector Search index for the collection.

5. Create and run query against the collection.

   To test your embeddings, you can run a query against your collection. Use an embedding model provider to generate `float`, `int8`, and `int1` embeddings for your query text. The following sample code uses Voyage AI's REST API (Application Programming Interface) to generate full-precision vectors. After generating the embeddings, use the [MongoDB Java Driver](https://www.mongodb.com/docs/drivers/java/sync/current/) to convert your native vector embedding to BSON (Binary Javascript Object Notation) vectors and run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query against the collection.

   Create a new file named `CreateEmbeddingsAndRunQuery.java` in your Java project.

   ```shell
   touch CreateEmbeddingsAndRunQuery.java
   ```

   Copy and paste the following code in the `CreateEmbeddingsAndRunQuery.java` file.

   This code does the following:

   - Generates the `float32`, `int8`, and `ubinary` vector embeddings by using Voyage AI's `voyage-3-large` embedding model.

   - Converts the embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using [MongoDB Java Driver.](https://www.mongodb.com/docs/drivers/java/sync/current/)

   - Runs the query against your collection and returns the results.

   ```java
   import okhttp3.*;  
   import com.mongodb.client.MongoClient;  
   import com.mongodb.client.MongoClients;  
   import com.mongodb.client.MongoCollection;  
   import com.mongodb.client.MongoDatabase;  
   import org.bson.BinaryVector;  
   import org.bson.Document;
   import org.bson.conversions.Bson;
   import org.json.JSONArray;  
   import org.json.JSONObject;  
     
   import java.io.IOException;  
   import java.util.*;  
   import java.util.concurrent.TimeUnit;  
     
   import static com.mongodb.client.model.Aggregates.project;  
   import static com.mongodb.client.model.Aggregates.vectorSearch;  
   import static com.mongodb.client.model.Projections.fields;  
   import static com.mongodb.client.model.Projections.include;  
   import static com.mongodb.client.model.Projections.exclude;  
   import static com.mongodb.client.model.Projections.metaVectorSearchScore;  
   import static com.mongodb.client.model.search.SearchPath.fieldPath;  
   import static com.mongodb.client.model.search.VectorSearchOptions.approximateVectorSearchOptions;  
   import static java.util.Arrays.asList;  
     
   public class CreateEmbeddingsAndRunQuery {  
     
       // Configurations  
       private static final String VOYAGE_API_KEY = System.getenv("VOYAGE_API_KEY");
       private static final String MONGODB_URI = System.getenv("MONGODB_URI");       
       private static final String DB_NAME = "<DATABASE-NAME>";                     
       private static final String COLLECTION_NAME = "<COLLECTION-NAME>";    
       private static final String VECTOR_INDEX_NAME = "<INDEX-NAME>";         
       private static final String DATA_FIELD_NAME = "<DATA-FIELD-NAME>";
       private static final String QUERY_TEXT = "<QUERY-TEXT>";
     
       // Voyage AI API Endpoint  
       private static final String VOYAGE_API_URL = "https://ai.mongodb.com/v1/embeddings";  
     
       // Timeout values for API requests  
       private static final int CONNECTION_TIMEOUT = 30;  
       private static final int READ_TIMEOUT = 60;  
     
       public static void main(String[] args) {  
           if (VOYAGE_API_KEY == null || VOYAGE_API_KEY.isEmpty()) {  
               throw new RuntimeException("API key not found. Set VOYAGE_API_KEY in your environment.");  
           }  
           if (MONGODB_URI == null || MONGODB_URI.isEmpty()) {  
               throw new RuntimeException("MongoDB URI not found. Set MONGODB_URI in your environment.");  
           }  
     
           String queryText = <QUERY-TEXT>; // Query text dynamically provided by the user  
     
           try {  
               CreateEmbeddingsAndRunQuery processor = new CreateEmbeddingsAndRunQuery();  
     
               System.out.println("Fetching embeddings...");  
               Document bsonEmbeddings = processor.fetchEmbeddingsForQuery(queryText);  
     
               System.out.println("Using embeddings in vector search queries...");  
               processor.runVectorSearchQuery(bsonEmbeddings);  
     
           } catch (Exception e) {  
               e.printStackTrace();  
           }  
       }  
     
       // Fetch embeddings from Voyage AI API for multiple output data types  
       private Document fetchEmbeddingsForQuery(String queryText) {  
           OkHttpClient client = new OkHttpClient.Builder()  
                   .connectTimeout(CONNECTION_TIMEOUT, TimeUnit.SECONDS)  
                   .readTimeout(READ_TIMEOUT, TimeUnit.SECONDS)  
                   .build();  
     
           List<List<List<Integer>>> embeddingsByOutputType = new ArrayList<>();  
           List<String> outputDtypes = List.of("float", "int8", "ubinary"); // Supported output data types  
     
           try {  
               for (String dtype : outputDtypes) {  
                   String responseBody = sendRequest(client, VOYAGE_API_KEY, queryText, dtype);  
                   embeddingsByOutputType.add(parseEmbeddings(responseBody, dtype));  
               }  
           } catch (IOException e) {  
               throw new RuntimeException("Error fetching embeddings: " + e.getMessage(), e);  
           }  
     
           return convertEmbeddingsToBson(queryText, embeddingsByOutputType); // Convert embeddings to BSON format  
       }  
     
       // Send API request to Voyage AI to generate embeddings for a specific output data type
       private String sendRequest(OkHttpClient client, String apiKey, String queryText, String outputDtype) throws IOException {  
           String requestBody = new JSONObject()  
                   .put("input", List.of(queryText)) // Dynamic user query text as input  
                   .put("model", "voyage-3-large")  // Model type  
                   .put("input_type", "query")      // Input type for query  
                   .put("output_dtype", outputDtype)  
                   .toString();  
     
           Request request = new Request.Builder()  
                   .url(VOYAGE_API_URL)  
                   .post(RequestBody.create(requestBody, MediaType.get("application/json")))  
                   .addHeader("Authorization", "Bearer " + apiKey)  
                   .build();  
     
           try (Response response = client.newCall(request).execute()) {  
               if (!response.isSuccessful()) {  
                   throw new IOException("API error: HTTP " + response.code());  
               }  
               return response.body().string();  
           }  
       }  
     
       // Parse embeddings from API response
       private static List<List<Integer>> parseEmbeddings(String responseBody, String outputDtype) {  
           JSONObject responseJson = new JSONObject(responseBody);  
           JSONArray dataArray = responseJson.optJSONArray("data");  
     
           if (dataArray == null) {  
               throw new RuntimeException("Invalid response format: 'data' field missing.");  
           }  
     
           List<List<Integer>> embeddings = new ArrayList<>();  
           for (int i = 0; i < dataArray.length(); i++) {  
               JSONArray embeddingVector = dataArray.getJSONObject(i).getJSONArray("embedding");  
     
               List<Integer> vector = new ArrayList<>();  
               for (int j = 0; j < embeddingVector.length(); j++) {  
                   int value = embeddingVector.getInt(j);  
     
                   // Handle binary quantization offset  
                   if ("binary".equals(outputDtype)) {  
                       value = value - 128; // Offset binary method (signed int8 representation)  
                   }  
     
                   vector.add(value);  
               }  
               embeddings.add(vector);  
           }  
           return embeddings;  
       }
     
       // Convert embeddings into BSON format
       private Document convertEmbeddingsToBson(String queryText, List<List<List<Integer>>> embeddingsByOutputType) {  
           Document embedding = new Document()  
                   .append("text", queryText)  
                   .append("embeddings_float32", BinaryVector.floatVector(listToFloatArray(embeddingsByOutputType.get(0).get(0))))  
                   .append("embeddings_int8", BinaryVector.int8Vector(listToByteArray(embeddingsByOutputType.get(1).get(0))))  
                   .append("embeddings_int1", BinaryVector.packedBitVector(listToByteArray(embeddingsByOutputType.get(2).get(0)), (byte) 0));  
             
           return new Document("data", List.of(embedding));  
       }  
     
       // Run MongoDB vector search query using the generated embeddings
       private void runVectorSearchQuery(Document bsonEmbeddings) {  
           try (MongoClient mongoClient = MongoClients.create(MONGODB_URI)) {  
               MongoDatabase database = mongoClient.getDatabase(DB_NAME);  
               MongoCollection<Document> collection = database.getCollection(COLLECTION_NAME);  
     
               List<Document> embeddedDocuments = bsonEmbeddings.getList("data", Document.class);  
     
               for (Document embedding : embeddedDocuments) {  
                   for (String embeddingType : List.of("embeddings_float32", "embeddings_int8", "embeddings_int1")) {  
                       System.out.println("Results from " + embeddingType.replace("embeddings_", "") + " embeddings:");  
     
                       List<Bson> pipeline = asList(  
                               vectorSearch(  
                                       fieldPath(embeddingType),  
                                       embedding.get(embeddingType, BinaryVector.class),  
                                       VECTOR_INDEX_NAME,  
                                       2, approximateVectorSearchOptions(5)  
                               ),  
                               project(fields(  
                                       exclude("_id"),  
                                       include(DATA_FIELD_NAME),  
                                       metaVectorSearchScore("vectorSearchScore"))));  
     
                       List<Document> results = collection.aggregate(pipeline).into(new ArrayList<>());  
     
                       for (Document result : results) {  
                           System.out.println(result.toJson());  
                       }  
                   }  
               }  
           }  
       }  
     
       private static float[] listToFloatArray(List<Integer> list) {  
           float[] array = new float[list.size()];  
           for (int i = 0; i < list.size(); i++) {  
               array[i] = list.get(i).floatValue();  
           }  
           return array;  
       }  
     
       private static byte[] listToByteArray(List<Integer> list) {  
           byte[] array = new byte[list.size()];  
           for (int i = 0; i < list.size(); i++) {  
               array[i] = list.get(i).byteValue();  
           }  
           return array;  
       }  
   }  

   ```

   Replace the following placeholder values in the code and save the file.

   | `<DATABASE-NAME>` | Name of the database in your cluster. For this example, use `sample_airbnb`. |
   | --- | --- |
   | `<COLLECTION-NAME>` | Name of the collection where you ingested the data. For this example, use `listingsAndReviews`. |
   | `<INDEX-NAME>` | Name of the MongoDB Vector Search index for the collection. |
   | `<DATA-FIELD-NAME>` | Name of the field that contain the text from which you generated embeddings. For this example, use `summary`. |
   | `<QUERY-TEXT>` | Text for the query. For this example, use `ocean view`. |

   Compile and run the file using your application run configuration.

   If you are using a terminal, run the following commands to compile and execute your program.

   ```shell
   javac CreateEmbeddingsAndRunQuery.java
   java CreateEmbeddingsAndRunQuery
   ```

   **Output:**

   ```shell
   Fetching embeddings...
   Using embeddings in vector search queries...
   Results from float32 embeddings:
   {"summary": "Fantastic duplex apartment with three bedrooms, located in the historic area of Porto, Ribeira (Cube) - UNESCO World Heritage Site. Centenary building fully rehabilitated, without losing their original character.", "vectorSearchScore": 0.5}
   {"summary": "One bedroom + sofa-bed in quiet and bucolic neighbourhood right next to the Botanical Garden. Small garden, outside shower, well equipped kitchen and bathroom with shower and tub. Easy for transport with many restaurants and basic facilities in the area.", "vectorSearchScore": 0.5}
   Results from int8 embeddings:
   {"summary": "A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.", "vectorSearchScore": 0.5056195259094238}
   {"summary": "THIS IS A VERY SPACIOUS 1 BEDROOM FULL CONDO (SLEEPS 4) AT THE BEAUTIFUL VALLEY ISLE RESORT ON THE BEACH IN LAHAINA, MAUI!! YOU WILL LOVE THE PERFECT LOCATION OF THIS VERY NICE HIGH RISE! ALSO THIS SPACIOUS FULL CONDO, FULL KITCHEN, BIG BALCONY!!", "vectorSearchScore": 0.5048412084579468}
   Results from int1 embeddings:
   {"summary": "A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.", "vectorSearchScore": 0.7119140625}
   {"summary": "A short distance from Honolulu's billion dollar mall, and the same distance to Waikiki. Parking included. A great location that work perfectly for business, education, or simple visit. Experience Yacht Harbor views and 5 Star Hilton Hawaiian Village.", "vectorSearchScore": 0.6787109375}
   ```

   To learn more about generating embeddings and converting the embeddings to `binData` vectors, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

To quantize your BSON (Binary Javascript Object Notation) `binData` vectors, you must have the following:

- A cluster running MongoDB version 6.0.11, 7.0.2, or later.

  Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

- Access to an embedding model that supports byte vector output.

  The outputs from the following embedding models can be used to generate BSON (Binary Javascript Object Notation) `binData` vectors with a supported MongoDB driver:

  | Embedding Model Provider | Embedding Model |
  | --- | --- |
  | [Voyage AI](https://www.voyageai.com/) | `voyage-3-large` |
  | [Cohere](https://cohere.com/) | `embed-english-v3.0` |
  | [Nomic](https://www.nomic.ai/) | `nomic-embed-text-v1.5` |
  | [Jina](https://jina.ai/) | `jina-embeddings-v2-base-en` |
  | [Mixedbread](https://www.mixedbread.ai/) | `mxbai-embed-large-v1` |

  Scalar quantization preserves recall for these models because these models are all trained to be quantization aware. Therefore, [recall](https://www.mongodb.com/docs/manual/reference/glossary.md#std-term-recall) degradation for scalar quantized embeddings produced by these models is minimal even at lower dimensions like 384.

* A terminal and code editor to run your Go project.

* [Go](https://go.dev/doc/install) installed.

## Procedure

1. Initialize your Go project.

   In a terminal window, run the following commands to create a new directory named `ingest-binary-vectors` and initialize your project:

   ```shell
   mkdir ingest-binary-vectors-project
   cd ingest-binary-vectors-project
   go mod init ingest-binary-vectors-project
   ```

2. Install the required libraries.

   Run the following command to install the MongoDB [Go Driver](https://www.mongodb.com/docs/drivers/go/current/). This operation might take a few minutes to complete.

   ```python
   go get go.mongodb.org/mongo-driver/v2/mongo
   ```

   You must install [Go](https://www.mongodb.com/docs/drivers/go/current/) v2.1 or later driver. If necessary, you can also install libraries from your embedding model provider. For examples in this tutorial, we will use the Voyage AI REST API to generate embeddings. Therefore, you don't need to install any additional libraries.

3. Set the environment variables in your terminal.

   To access the embedding model provider for generating and converting embeddings, set the environment variable for the embedding model provider's API key, if necessary.

   For using embeddings from Voyage AI, set up the `VOYAGE_API_KEY` environment variable. To learn how to get your API key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

   ```text
   export VOYAGE_API_KEY="<VOYAGE-API-KEY>"
   ```

   To access your cluster, set the `MONGODB_URI` environment variable.

   ```shell
   export MONGODB_URI="<CONNECTION-STRING>"
   ```

   Your connection string should be in the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

4. (Conditional) Generate embeddings from your data.

   You can use an embedding model provider to generate `float32`, `int8`, and `int1` embeddings for your data and then use the [MongoDB Go driver](https://www.mongodb.com/docs/drivers/go/current/) to convert your native vector embedding to BSON (Binary Javascript Object Notation) vectors. The following sample code uses Cohere's `embed` API (Application Programming Interface) to generate full-precision vectors.

   Create a new file named `GenerateAndConvertEmbeddings.go` in your Go project.

   ```shell
   touch GenerateAndConvertEmbeddings.go
   ```

   Copy and paste the following code in the `GenerateAndConvertEmbeddings.go` file.

   This code does the following:

   - Generates the `float32`, `int8`, and `ubinary` vector embeddings by using Cohere's `embed` API (Application Programming Interface).

   - Converts the embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using [MongoDB Go driver.](https://www.mongodb.com/docs/drivers/go/current/)

   - Creates a file named `embeddings.json` and saves the data with embeddings in the file.

   ```go
   package main

   import (
   	"bytes"
   	"context"
   	"encoding/json"
   	"fmt"
   	"io/ioutil"
   	"log"
   	"net/http"
   	"os"

   	"go.mongodb.org/mongo-driver/v2/bson"
   )

   // Sample data for embedding
   var data = []string{
   	"The Great Wall of China is visible from space.",
   	"The Eiffel Tower was completed in Paris in 1889.",
   	"Mount Everest is the highest peak on Earth at 8,848m.",
   	"Shakespeare wrote 37 plays and 154 sonnets during his lifetime.",
   	"The Mona Lisa was painted by Leonardo da Vinci.",
   }

   func main() {
   	apiKey := os.Getenv("VOYAGE_API_KEY")
   	if apiKey == "" {
   		log.Fatal("Ensure VOYAGE_API_KEY is set.")
   	}

   	model := "voyage-3-large"

   	// Generate embeddings for float, int8, and ubinary
   	floatEmbeddings, err := fetchEmbeddingsFromVoyage(data, apiKey, model, "float")
   	if err != nil {
   		log.Fatalf("Error fetching float embeddings: %v", err)
   	}

   	int8Embeddings, err := fetchEmbeddingsFromVoyage(data, apiKey, model, "int8")
   	if err != nil {
   		log.Fatalf("Error fetching int8 embeddings: %v", err)
   	}

   	ubinaryEmbeddings, err := fetchEmbeddingsFromVoyage(data, apiKey, model, "ubinary")
   	if err != nil {
   		log.Fatalf("Error fetching ubinary embeddings: %v", err)
   	}

   	// Convert to BSON and store in JSON file
   	documents := convertEmbeddingsToBSON(data, floatEmbeddings, int8Embeddings, ubinaryEmbeddings)

   	err = writeJSONToFile("embeddings.json", documents)
   	if err != nil {
   		log.Fatalf("Error writing embeddings to file: %v", err)
   	}

   	fmt.Println("Embeddings successfully stored in embeddings.json")
   }

   // Fetch embeddings using Voyage AI REST API
   func fetchEmbeddingsFromVoyage(texts []string, apiKey string, model string, outputDType string) ([]map[string]interface{}, error) {
   	url := "https://ai.mongodb.com/v1/embeddings"

   	// Prepare request body
   	requestBody := map[string]interface{}{
   		"input":            texts,
   		"model":            model,
   		"output_dtype":     outputDType,
   		"output_dimension": 1024,
   		"input_type":       "document",
   	}

   	requestBytes, err := json.Marshal(requestBody)
   	if err != nil {
   		return nil, fmt.Errorf("failed to marshal request body: %w", err)
   	}

   	req, err := http.NewRequestWithContext(context.TODO(), "POST", url, bytes.NewBuffer(requestBytes))
   	if err != nil {
   		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
   	}

   	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
   	req.Header.Set("Content-Type", "application/json")

   	client := &http.Client{}
   	resp, err := client.Do(req)
   	if err != nil {
   		return nil, fmt.Errorf("failed to make API request: %w", err)
   	}
   	defer resp.Body.Close()

   	if resp.StatusCode != http.StatusOK {
   		body, _ := ioutil.ReadAll(resp.Body)
   		return nil, fmt.Errorf("unexpected status code %d: %s", resp.StatusCode, string(body))
   	}

   	var response struct {
   		Data []map[string]interface{} `json:"data"`
   	}
   	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
   		return nil, fmt.Errorf("failed to parse API response: %w", err)
   	}

   	return response.Data, nil
   }

   // Convert embeddings to BSON binary vectors
   func convertEmbeddingsToBSON(sentences []string, floatEmbeddings []map[string]interface{}, int8Embeddings []map[string]interface{}, ubinaryEmbeddings []map[string]interface{}) []bson.M {
   	var documents []bson.M

   	for i, sentence := range sentences {
   		floatEmbedding := convertInterfaceToFloat32(floatEmbeddings[i]["embedding"].([]interface{}))
   		int8Embedding := convertInterfaceToInt8(int8Embeddings[i]["embedding"].([]interface{}))
   		ubinaryEmbedding := convertInterfaceToBytes(ubinaryEmbeddings[i]["embedding"].([]interface{}))

   		floatVector := bson.NewVector(floatEmbedding)
   		int8Vector := bson.NewVector(int8Embedding)
   		ubinaryVector, err := bson.NewPackedBitVector(ubinaryEmbedding, 0)
   		if err != nil {
   			log.Fatalf("Error creating PackedBitVector: %v", err)
   		}

   		document := bson.M{
   			"text":               sentence,
   			"embeddings_float32": floatVector.Binary(),
   			"embeddings_int8":    int8Vector.Binary(),
   			"embeddings_int1":    ubinaryVector.Binary(),
   		}
   		documents = append(documents, document)
   	}

   	return documents
   }

   // Write JSON file from in-memory BSON documents
   func writeJSONToFile(filename string, documents []bson.M) error {
   	file, err := os.Create(filename)
   	if err != nil {
   		return fmt.Errorf("failed to create file: %w", err)
   	}
   	defer file.Close()

   	var jsonData []json.RawMessage
   	for _, document := range documents {
   		jsonBytes, err := bson.MarshalExtJSON(document, false, false)
   		if err != nil {
   			return fmt.Errorf("error marshaling BSON to JSON: %w", err)
   		}
   		jsonData = append(jsonData, jsonBytes)
   	}

   	marshaledData, err := json.MarshalIndent(jsonData, "", "  ")
   	if err != nil {
   		return fmt.Errorf("failed to marshal JSON: %w", err)
   	}

   	_, err = file.Write(marshaledData)
   	if err != nil {
   		return fmt.Errorf("failed to write JSON to file: %w", err)
   	}

   	return nil
   }

   // Convert a slice of interfaces to a slice of float32
   func convertInterfaceToFloat32(data []interface{}) []float32 {
   	f32s := make([]float32, len(data))
   	for i, v := range data {
   		f32s[i] = float32(v.(float64))
   	}
   	return f32s
   }

   // Convert a slice of interfaces to a slice of int8
   func convertInterfaceToInt8(data []interface{}) []int8 {
   	ints8 := make([]int8, len(data))
   	for i, v := range data {
   		switch val := v.(type) {
   		case int:
   			ints8[i] = int8(val)
   		case float64:
   			ints8[i] = int8(val)
   		default:
   			log.Fatalf("Unexpected type %T in int8 embedding at index %d", v, i)
   		}
   	}
   	return ints8
   }

   // Convert a slice of interfaces to a slice of bytes
   func convertInterfaceToBytes(data []interface{}) []byte {
   	bytes := make([]byte, len(data))
   	for i, v := range data {
   		switch val := v.(type) {
   		case int:
   			bytes[i] = byte(val)
   		case float64:
   			bytes[i] = byte(val)
   		default:
   			log.Fatalf("Unexpected type %T in ubinary embedding at index %d", v, i)
   		}
   	}
   	return bytes
   }

   ```

   Replace the following placeholder value in the code and save the file.

   | `VOYAGE_API_KEY` | Your Voyage AI API (Application Programming Interface) key only if you didn't set the environment variable. |
   | --- | --- |

   Run the program using the following command.

   If you are using a terminal, run the following commands to compile and execute your program.

   ```shell
   go run GenerateAndConvertEmbeddings.go
   ```

   **Output:**

   ```shell
   Embeddings successfully stored in embeddings.json
   ```

   Verify the embeddings in the `embeddings.json` file.

   To learn more about generating embeddings and converting the embeddings to `binData` vectors, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

5. Ingest the data and create a MongoDB Vector Search index.

   You must upload your data and embeddings to a collection in your cluster and create a MongoDB Vector Search index on the data to run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries against the data.

   Create a new file named `UploadDataAndCreateIndex.go` in your Go project.

   ```shell
   touch UploadDataAndCreateIndex.go
   ```

   Copy and paste the following code in the `UploadDataAndCreateIndex.go` file.

   This code does the following:

   - Uploads the `float32`, `int8`, and `int1` embeddings in the `embeddings.json` file to your cluster.

   - Creates a MongoDB Vector Search index on the `embeddings.float32`, `embeddings.int8`, and `embeddings.int1` fields.

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"io/ioutil"
   	"log"
   	"time"
   	"os"

   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   var (
   	mongodbURI          = os.Getenv("MONGODB_URI")
   	dbName              = "<DATABASE-NAME>"
   	collectionName      = "<COLLECTION-NAME>"
   	indexName           = "<INDEX-NAME>"
   	numberOfDimensions  = 1024
   	embeddingFields     = []string{"embeddings_float32", "embeddings_int8", "embeddings_int1"}
   	embeddingSimilarity = []string{"dotProduct", "dotProduct", "euclidean"}
   )

   func main() {
   	clientOpts := options.Client().ApplyURI(mongodbURI)
   	client, err := mongo.Connect(clientOpts)
   	if err != nil {
   		log.Fatalf("Failed to connect to MongoDB: %v", err)
   	}

   	defer func() {
   		if err := client.Disconnect(context.TODO()); err != nil {
   			log.Fatalf("Failed to disconnect MongoDB client: %v", err)
   		}
   	}()

   	storeEmbeddings(client)
   	setupVectorSearchIndex(client)
   }

   // Reads JSON data, stores it in MongoDB
   func storeEmbeddings(client *mongo.Client) {
   	database := client.Database(dbName)
   	collection := database.Collection(collectionName)

   	data, err := ioutil.ReadFile("embeddings.json")
   	if err != nil {
   		log.Fatalf("Failed to read file: %v", err)
   	}

   	var documents []bson.M
   	if err := bson.UnmarshalExtJSON(data, false, &documents); err != nil {
   		log.Fatalf("Failed to unmarshal JSON data: %v", err)
   	}

   	if _, err := collection.InsertMany(context.TODO(), documents); err != nil {
   		log.Fatalf("Failed to insert documents: %v", err)
   	}

   	fmt.Println("Inserted documents into MongoDB")
   }

   // Sets up vector search index in MongoDB
   func setupVectorSearchIndex(client *mongo.Client) {
   	database := client.Database(dbName)
   	collection := database.Collection(collectionName)

   	ctx := context.TODO()

   	type vectorDefinitionField struct {
   		Type          string `bson:"type"`
   		Path          string `bson:"path"`
   		NumDimensions int    `bson:"numDimensions"`
   		Similarity    string `bson:"similarity"`
   	}

   	type vectorDefinition struct {
   		Fields []vectorDefinitionField `bson:"fields"`
   	}

   	fields := make([]vectorDefinitionField, len(embeddingFields))
   	for i, field := range embeddingFields {
   		fields[i] = vectorDefinitionField{
   			Type:          "vector",
   			Path:          field,
   			NumDimensions: numberOfDimensions,
   			Similarity:    embeddingSimilarity[i],
   		}
   	}
   	fmt.Println(fields)

   	opts := options.SearchIndexes().SetName(indexName).SetType("vectorSearch")

   	indexModel := mongo.SearchIndexModel{
   		Definition: vectorDefinition{
   			Fields: fields,
   		},
   		Options: opts,
   	}

   	// Create the index
   	log.Println("Creating the index.")
   	searchIndexName, err := collection.SearchIndexes().CreateOne(ctx, indexModel)
   	if err != nil {
   		log.Fatalf("Failed to create the search index: %v", err)
   	}

   	// Polling to confirm successful index creation
   	log.Println("Polling to confirm successful index creation.")
   	log.Println("NOTE: This may take up to a minute.")
   	searchIndexes := collection.SearchIndexes()
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

   Replace the following with valid values in the code and save the file.

   | `MONGODB_URI` | Your cluster connection string if you didn't set the environment variable. |
   | --- | --- |
   | `<DATABASE-NAME>` | Name of the MongoDB Vector Search index for the collection. |
   | `<COLLECTION-NAME>` | Name of the MongoDB Vector Search index for the collection. |
   | `<INDEX-NAME>` | Name of the MongoDB Vector Search index for the collection. |

   Run the program using the following command.

   If you are using a terminal, run the following commands to compile and execute your program.

   ```shell
   go run UploadDataAndCreateIndex.go
   ```

   **Output:**

   ```shell
   Inserted documents into MongoDB
   Creating the index.
   Polling to confirm successful index creation.
   NOTE: This may take up to a minute.
   Name of Index Created: <INDEX-NAME>
   ```

   Log in to your cluster and verify the following:

   - Data in the namespace.

   - MongoDB Vector Search index for the collection.

6. Create and run query against the collection.

   To test your embeddings, you can run a query against your collection. Use an embedding model provider to generate `float32`, `int8`, and `int1` embeddings for your query text. The following sample code uses Cohere's `embed` API (Application Programming Interface) to generate full-precision vectors. After generating the embeddings, use the [MongoDB Go driver](https://www.mongodb.com/docs/drivers/go/current/) to convert your native vector embedding to BSON (Binary Javascript Object Notation) binary vectors and run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query against the collection.

   Create a new file named `CreateEmbeddingsAndRunQuery.go` in your Go project.

   ```shell
   touch CreateEmbeddingsAndRunQuery.go
   ```

   Copy and paste the following code in the `CreateEmbeddingsAndRunQuery.go` file.

   This code does the following:

   - Generates the `float32`, `int8`, and `ubinary` vector embeddings by using Cohere's `embed` API (Application Programming Interface).

   - Converts the embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using [MongoDB Go driver.](https://www.mongodb.com/docs/drivers/go/current/)

   - Runs the query against your collection and returns the results.

   ```go
   package main

   import (
   	"bytes"
   	"context"
   	"encoding/json"
   	"fmt"
   	"io"
   	"log"
   	"net/http"
   	"os"

   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   const (
   	dbName          = "<DATABASE-NAME>"
   	collectionName  = "<COLLECTION-NAME>"
   	vectorIndexName = "<INDEX-NAME>"
   	dataFieldName   = "<TEXT-FIELD-NAME>"
   	queryText       = "<QUERY-TEXT>"
   	model           = "voyage-3-large"
   	outputDimension = 1024
   	candidates      = <NUMBER-OF-CANDIDATES-TO-CONSIDER>
   	numDocs         = <NUMBER-OF-DOCUMENTS-TO-RETURN>
   )

   func main() {
   	apiKey := os.Getenv("VOYAGE_API_KEY")
   	mongodbURI := os.Getenv("MONGODB_URI")

   	if apiKey == "" {
   		log.Fatal("API key not found. Set VOYAGE_API_KEY in your environment.")
   	}
   	if mongodbURI == "" {
   		log.Fatal("MongoDB URI not found. Set MONGODB_URI in your environment.")
   	}

   	embeddingsData, err := generateAndConvertEmbeddings(apiKey, queryText)
   	if err != nil {
   		log.Fatalf("Error generating embeddings: %v", err)
   	}

   	err = runVectorSearchQuery(mongodbURI, embeddingsData)
   	if err != nil {
   		log.Fatalf("Error running vector search query: %v", err)
   	}
   }

   // Generate embeddings using Voyage AI's embedding API from the query text
   func generateAndConvertEmbeddings(apiKey, text string) (map[string]bson.Binary, error) {
   	embeddingFormats := []string{"float", "int8", "ubinary"}
   	embeddingsData := make(map[string]bson.Binary)

   	for _, outputDType := range embeddingFormats {
   		response := fetchEmbeddingsFromVoyageAPI(apiKey, text, outputDType)
   		embedding := createBSONVectorEmbeddings(outputDType, response)
   		embeddingsData[outputDType] = embedding
   	}

   	return embeddingsData, nil
   }

   // Fetch embeddings using Voyage AI Embedding REST API
   func fetchEmbeddingsFromVoyageAPI(apiKey, text, outputDType string) map[string]interface{} {
   	url := "https://ai.mongodb.com/v1/embeddings"

   	requestBody := map[string]interface{}{
   		"input":            []string{text},
   		"model":            model,
   		"output_dtype":     outputDType,
   		"output_dimension": outputDimension,
   		"input_type":       "query",
   	}

   	requestBytes, err := json.Marshal(requestBody)
   	if err != nil {
   		log.Fatalf("Failed to marshal request body: %v", err)
   	}

   	req, err := http.NewRequestWithContext(context.TODO(), "POST", url, bytes.NewBuffer(requestBytes))
   	if err != nil {
   		log.Fatalf("Failed to create HTTP request: %v", err)
   	}

   	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
   	req.Header.Set("Content-Type", "application/json")

   	client := &http.Client{}
   	resp, err := client.Do(req)
   	if err != nil {
   		log.Fatalf("Failed to make API request: %v", err)
   	}
   	defer resp.Body.Close()

   	if resp.StatusCode != http.StatusOK {
   		body, _ := io.ReadAll(resp.Body)
   		log.Fatalf("Unexpected status code %d: %s", resp.StatusCode, string(body))
   	}

   	var response struct {
   		Data []map[string]interface{} `json:"data"`
   	}
   	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
   		log.Fatalf("Failed to parse API response: %v", err)
   	}

   	if len(response.Data) == 0 {
   		log.Fatalf("No embeddings found in API response")
   	}

   	return response.Data[0]
   }

   // Convert embeddings to BSON vectors using MongoDB Go Driver
   func createBSONVectorEmbeddings(dataType string, rawEmbedding map[string]interface{}) bson.Binary {
   	embeddingArray := rawEmbedding["embedding"].([]interface{})

   	switch dataType {
   	case "float":
   		floatData := convertInterfaceToFloat32(embeddingArray)
   		floatVector := bson.NewVector(floatData)
   		return floatVector.Binary()
   	case "int8":
   		int8Data := convertInterfaceToInt8(embeddingArray)
   		int8Vector := bson.NewVector(int8Data)
   		return int8Vector.Binary()
   	case "ubinary":
   		int1Data := convertInterfaceToBytes(embeddingArray)
   		ubinaryVector, err := bson.NewPackedBitVector(int1Data, 0)
   		if err != nil {
   			log.Fatalf("Error creating PackedBitVector: %v", err)
   		}
   		return ubinaryVector.Binary()
   	default:
   		log.Fatalf("Unknown data type: %s", dataType)
   		return bson.Binary{}
   	}
   }

   // Run $vectorSearch query using the embeddings
   func runVectorSearchQuery(mongodbURI string, embeddingsData map[string]bson.Binary) error {
   	ctx := context.Background()
   	clientOptions := options.Client().ApplyURI(mongodbURI)
   	client, err := mongo.Connect(clientOptions)
   	if err != nil {
   		return fmt.Errorf("failed to connect to MongoDB: %w", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	db := client.Database(dbName)
   	collection := db.Collection(collectionName)

   	pathMap := map[string]string{
   		"float":   "embeddings_float32",
   		"int8":    "embeddings_int8",
   		"ubinary": "embeddings_int1",
   	}

   	for pathKey, queryVector := range embeddingsData {
   		path, ok := pathMap[pathKey]
   		if !ok {
   			return fmt.Errorf("invalid path key: %s", pathKey)
   		}

   		pipeline := mongo.Pipeline{
   			{
   				{"$vectorSearch", bson.D{
   					{"queryVector", queryVector},
   					{"index", vectorIndexName},
   					{"path", path},
   					{"numCandidates", candidates},
   					{"limit", numDocs},
   				}},
   			},
   			{
   				{"$project", bson.D{
   					{"_id", 1},
   					{dataFieldName, 1},
   					{"score", bson.D{
   						{"$meta", "vectorSearchScore"},
   					}},
   				}},
   			},
   		}

   		cursor, err := collection.Aggregate(context.Background(), pipeline)
   		if err != nil {
   			return fmt.Errorf("failed to run vector search aggregation query: %w", err)
   		}
   		defer cursor.Close(ctx)

   		var results []bson.M
   		if err = cursor.All(context.Background(), &results); err != nil {
   			return fmt.Errorf("failed to parse aggregation query results: %w", err)
   		}

   		fmt.Printf("Results from %v embeddings:\n", path)
   		for _, result := range results {
   			fmt.Println(result)
   		}
   	}

   	return nil
   }

   // Converts []interface{} to []float32 safely
   func convertInterfaceToFloat32(data []interface{}) []float32 {
   	f32s := make([]float32, len(data))
   	for i, v := range data {
   		switch val := v.(type) {
   		case float64:
   			f32s[i] = float32(val)
   		case int:
   			f32s[i] = float32(val)
   		default:
   			log.Fatalf("Unexpected type %T in float32 conversion at index %d", v, i)
   		}
   	}
   	return f32s
   }

   // Converts []interface{} to []int8 safely
   func convertInterfaceToInt8(data []interface{}) []int8 {
   	ints8 := make([]int8, len(data))
   	for i, v := range data {
   		switch val := v.(type) {
   		case float64:
   			ints8[i] = int8(val)
   		case int:
   			ints8[i] = int8(val)
   		default:
   			log.Fatalf("Unexpected type %T in int8 conversion at index %d", v, i)
   		}
   	}
   	return ints8
   }

   // Converts []interface{} to []byte (uint8) safely
   func convertInterfaceToBytes(data []interface{}) []byte {
   	bytesOut := make([]byte, len(data))
   	for i, v := range data {
   		switch val := v.(type) {
   		case float64:
   			bytesOut[i] = byte(val)
   		case int:
   			bytesOut[i] = byte(val)
   		default:
   			log.Fatalf("Unexpected type %T in byte conversion at index %d", v, i)
   		}
   	}
   	return bytesOut
   }

   ```

   Replace the following placeholder values in the code and save the file.

   | `MONGODB_URI` | Your cluster connection string if you didn't set the environment variable. |
   | --- | --- |
   | `VOYAGE_API_KEY` | Your Voyage AI API (Application Programming Interface) key only if you didn't set the environment variable. |
   | `<DATABASE-NAME>` | Name of the database in your cluster. |
   | `<COLLECTION-NAME>` | Name of the collection where you ingested the data. |
   | `<INDEX-NAME>` | Name of the MongoDB Vector Search index for the collection. |
   | `<TEXT-FIELD-NAME>` | Name of the field that contain the text from which you generated embeddings. For this example, use `text`. |
   | `<QUERY-TEXT>` | Text for the query. For this example, use `science fact`. |
   | `<NUMBER-OF-CANDIDATES-TO-CONSIDER>` | Number of nearest neighbors to consider during the search. For this example, use `5`. |
   | `<NUMBER-OF-DOCUMENTS-TO-RETURN>` | Number of documents to return in the results. For this example, use `2`. |

   Compile and run the file using your application run configuration.

   If you are using a terminal, run the following commands to compile and execute your program.

   ```shell
   go run CreateEmbeddingsAndRunQuery.go
   ```

   **Output:**

   ```shell
   Results from embeddings_float32 embeddings:
   {"_id":{"$oid":"68630fc85cb353712a1c521d"},"text":"The Great Wall of China is visible from space.","score":{"$numberDouble":"0.7723928093910217"}}
   {"_id":{"$oid":"68630fc85cb353712a1c521f"},"text":"Mount Everest is the highest peak on Earth at 8,848m.","score":{"$numberDouble":"0.7363046407699585"}}
   Results from embeddings_int8 embeddings:
   {"_id":{"$oid":"68630fc85cb353712a1c521d"},"text":"The Great Wall of China is visible from space.","score":{"$numberDouble":"0.5051995515823364"}}
   {"_id":{"$oid":"68630fc85cb353712a1c521f"},"text":"Mount Everest is the highest peak on Earth at 8,848m.","score":{"$numberDouble":"0.5044659972190857"}}
   Results from embeddings_int1 embeddings:
   {"_id":{"$oid":"68630fc85cb353712a1c521d"},"text":"The Great Wall of China is visible from space.","score":{"$numberDouble":"0.6845703125"}}
   {"_id":{"$oid":"68630fc85cb353712a1c521f"},"text":"Mount Everest is the highest peak on Earth at 8,848m.","score":{"$numberDouble":"0.6650390625"}}
   ```

To quantize your BSON (Binary Javascript Object Notation) `binData` vectors, you must have the following:

- A cluster running MongoDB version 6.0.11, 7.0.2, or later.

  Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

- Access to an embedding model that supports byte vector output.

  The outputs from the following embedding models can be used to generate BSON (Binary Javascript Object Notation) `binData` vectors with a supported MongoDB driver:

  | Embedding Model Provider | Embedding Model |
  | --- | --- |
  | [Voyage AI](https://www.voyageai.com/) | `voyage-3-large` |
  | [Cohere](https://cohere.com/) | `embed-english-v3.0` |
  | [Nomic](https://www.nomic.ai/) | `nomic-embed-text-v1.5` |
  | [Jina](https://jina.ai/) | `jina-embeddings-v2-base-en` |
  | [Mixedbread](https://www.mixedbread.ai/) | `mxbai-embed-large-v1` |

  Scalar quantization preserves recall for these models because these models are all trained to be quantization aware. Therefore, [recall](https://www.mongodb.com/docs/manual/reference/glossary.md#std-term-recall) degradation for scalar quantized embeddings produced by these models is minimal even at lower dimensions like 384.

* A terminal and code editor to run your Go project.

* [Go](https://go.dev/doc/install) installed.

## Procedure

1. Initialize your Go project.

   In a terminal window, run the following commands to create a new directory named `ingest-binary-vectors` and initialize your project:

   ```shell
   mkdir ingest-binary-vectors-project
   cd ingest-binary-vectors-project
   go mod init ingest-binary-vectors-project
   ```

2. Install the required libraries.

   Run the following command to install the MongoDB [Go Driver](https://www.mongodb.com/docs/drivers/go/current/). This operation might take a few minutes to complete.

   ```python
   go get go.mongodb.org/mongo-driver/v2/mongo
   ```

   You must install [Go](https://www.mongodb.com/docs/drivers/go/current/) v2.1 or later driver. If necessary, you can also install libraries from your embedding model provider. For examples in this tutorial, we will use the Voyage AI REST API to generate embeddings. Therefore, you don't need to install any additional libraries.

3. Set the environment variables in your terminal.

   To access the embedding model provider for generating and converting embeddings, set the environment variable for the embedding model provider's API key, if necessary.

   For using embeddings from Voyage AI, set up the `VOYAGE_API_KEY` environment variable. To learn how to get your API key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

   ```text
   export VOYAGE_API_KEY="<VOYAGE-API-KEY>"
   ```

   To access your cluster, set the `MONGODB_URI` environment variable.

   ```shell
   export MONGODB_URI="<CONNECTION-STRING>"
   ```

   Your connection string should be in the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

4. (Conditional) Generate embeddings from your data.

   You can use an embedding model provider to generate `float`, `int8`, and `int1` embeddings for your data and then use the [MongoDB Go driver](https://www.mongodb.com/docs/drivers/go/current/) to convert your native vector embedding to BSON (Binary Javascript Object Notation) vectors. The following sample code uses Voyage AI's `voyage-3-large` embedding model to generate full-precision vectors from the data in the `sample_airbnb.listingsAndReviews` namespace.

   Create a new file named `GenerateAndConvertEmbeddings.go` in your Go project.

   ```shell
   touch GenerateAndConvertEmbeddings.go
   ```

   Copy and paste the following code in the `GenerateAndConvertEmbeddings.go` file.

   This code does the following:

   - Gets the `summary` field from 50 documents in the `sample_airbnb.listingsAndReviews` namespace.

   - Generates the `float32`, `int8`, and `ubinary` vector embeddings by using Voyage AI's API (Application Programming Interface).

   - Converts the embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using [MongoDB Go driver.](https://www.mongodb.com/docs/drivers/go/current/)

   - Creates a file named `embeddings.json` and saves the data with embeddings in the file.

   ```go
   package main

   import (
   	"bytes"
   	"context"
   	"encoding/json"
   	"fmt"
   	"io/ioutil"
   	"log"
   	"net/http"
   	"os"

   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   const (
   	batchSize       = 96
   	dbName          = "sample_airbnb"
   	collName        = "listingsAndReviews"
   	model           = "voyage-3-large"
   	outputDimension = 1024
   )

   func main() {
   	apiKey := os.Getenv("VOYAGE_API_KEY")
   	mongodbURI := os.Getenv("MONGODB_URI")

   	if apiKey == "" || mongodbURI == "" {
   		log.Fatal("Ensure VOYAGE_API_KEY and MONGODB_URI are set.")
   	}

   	summaries, err := fetchSummariesFromMongoDB(mongodbURI)
   	if err != nil {
   		log.Fatalf("Error fetching summaries: %v", err)
   	}

   	for start := 0; start < len(summaries); start += batchSize {
   		end := start + batchSize
   		if end > len(summaries) {
   			end = len(summaries)
   		}

   		floatEmbeddings, err := fetchEmbeddingsFromVoyage(apiKey, summaries[start:end], "float")
   		if err != nil {
   			log.Fatalf("Error fetching float embeddings: %v", err)
   		}

   		int8Embeddings, err := fetchEmbeddingsFromVoyage(apiKey, summaries[start:end], "int8")
   		if err != nil {
   			log.Fatalf("Error fetching int8 embeddings: %v", err)
   		}

   		ubinaryEmbeddings, err := fetchEmbeddingsFromVoyage(apiKey, summaries[start:end], "ubinary")
   		if err != nil {
   			log.Fatalf("Error fetching ubinary embeddings: %v", err)
   		}

   		documents := convertEmbeddingsToBSON(summaries[start:end], floatEmbeddings, int8Embeddings, ubinaryEmbeddings)

   		err = writeJSONToFile("embeddings.json", documents)
   		if err != nil {
   			log.Fatalf("Error writing embeddings to JSON: %v", err)
   		}
   	}

   	fmt.Println("Embeddings successfully saved to embeddings.json")
   }

   // Fetch documents with the summary field from the collection
   func fetchSummariesFromMongoDB(uri string) ([]string, error) {
   	ctx := context.TODO()
   	clientOpts := options.Client().ApplyURI(uri)

   	client, err := mongo.Connect(clientOpts)
   	if err != nil {
   		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
   	}
   	defer func() {
   		if err := client.Disconnect(ctx); err != nil {
   			log.Fatalf("Failed to disconnect MongoDB client: %v", err)
   		}
   	}()

   	collection := client.Database(dbName).Collection(collName)
   	filter := bson.M{"summary": bson.M{"$nin": []interface{}{nil, ""}}}

   	cursor, err := collection.Find(ctx, filter, options.Find().SetLimit(50))
   	if err != nil {
   		return nil, fmt.Errorf("error finding documents: %w", err)
   	}
   	defer cursor.Close(ctx)

   	var summaries []string
   	for cursor.Next(ctx) {
   		var result struct {
   			Summary string `bson:"summary"`
   		}
   		if err := cursor.Decode(&result); err != nil {
   			return nil, fmt.Errorf("error decoding document: %w", err)
   		}
   		if result.Summary != "" {
   			summaries = append(summaries, result.Summary)
   		}
   	}

   	if err := cursor.Err(); err != nil {
   		return nil, fmt.Errorf("cursor error: %w", err)
   	}

   	return summaries, nil
   }

   // Fetch embeddings using Voyage AI REST API
   func fetchEmbeddingsFromVoyage(apiKey string, texts []string, outputDType string) ([]map[string]interface{}, error) {
   	url := "https://ai.mongodb.com/v1/embeddings"

   	requestBody := map[string]interface{}{
   		"input":            texts,
   		"model":            model,
   		"output_dtype":     outputDType,
   		"output_dimension": outputDimension,
   		"input_type":       "document",
   	}

   	requestBytes, err := json.Marshal(requestBody)
   	if err != nil {
   		return nil, fmt.Errorf("failed to marshal request body: %w", err)
   	}

   	req, err := http.NewRequestWithContext(context.TODO(), "POST", url, bytes.NewBuffer(requestBytes))
   	if err != nil {
   		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
   	}

   	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
   	req.Header.Set("Content-Type", "application/json")

   	client := &http.Client{}
   	resp, err := client.Do(req)
   	if err != nil {
   		return nil, fmt.Errorf("failed to make API request: %w", err)
   	}
   	defer resp.Body.Close()

   	if resp.StatusCode != http.StatusOK {
   		body, _ := ioutil.ReadAll(resp.Body)
   		return nil, fmt.Errorf("unexpected status code %d: %s", resp.StatusCode, string(body))
   	}

   	var response struct {
   		Data []map[string]interface{} `json:"data"`
   	}
   	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
   		return nil, fmt.Errorf("failed to parse API response: %w", err)
   	}

   	return response.Data, nil
   }

   // Convert embeddings to BSON binary vectors
   func convertEmbeddingsToBSON(summaries []string, floatEmbeddings []map[string]interface{}, int8Embeddings []map[string]interface{}, ubinaryEmbeddings []map[string]interface{}) []bson.M {
   	var documents []bson.M

   	for i, summary := range summaries {
   		floatEmbedding := convertInterfaceToFloat32(floatEmbeddings[i]["embedding"].([]interface{}))
   		int8Embedding := convertInterfaceToInt8(int8Embeddings[i]["embedding"].([]interface{}))
   		ubinaryEmbedding := convertInterfaceToBytes(ubinaryEmbeddings[i]["embedding"].([]interface{}))

   		floatVector := bson.NewVector(floatEmbedding)
   		int8Vector := bson.NewVector(int8Embedding)
   		ubinaryVector, err := bson.NewPackedBitVector(ubinaryEmbedding, 0)
   		if err != nil {
   			log.Fatalf("Error creating PackedBitVector: %v", err)
   		}

   		document := bson.M{
   			"text":               summary,
   			"embeddings_float32": floatVector.Binary(),
   			"embeddings_int8":    int8Vector.Binary(),
   			"embeddings_int1":    ubinaryVector.Binary(),
   		}

   		documents = append(documents, document)
   	}

   	return documents
   }

   // Write JSON file from in-memory BSON documents
   func writeJSONToFile(filename string, docs []bson.M) error {
   	file, err := os.Create(filename)
   	if err != nil {
   		return fmt.Errorf("failed to create file: %w", err)
   	}
   	defer file.Close()

   	var jsonDocuments []json.RawMessage
   	for _, document := range docs {
   		jsonBytes, err := bson.MarshalExtJSON(document, false, false)
   		if err != nil {
   			log.Fatalf("Error: %v", err)
   		}
   		jsonDocuments = append(jsonDocuments, jsonBytes)
   	}

   	jsonData, err := json.MarshalIndent(jsonDocuments, "", "  ")
   	if err != nil {
   		return fmt.Errorf("failed to marshal JSON: %w", err)
   	}

   	_, err = file.Write(jsonData)
   	if err != nil {
   		return fmt.Errorf("failed to write JSON to file: %w", err)
   	}

   	return nil
   }

   // Converts slice of interface{} to []float32
   func convertInterfaceToFloat32(data []interface{}) []float32 {
   	f32s := make([]float32, len(data))
   	for i, v := range data {
   		f32s[i] = float32(v.(float64))
   	}
   	return f32s
   }

   // Converts slice of interface{} to []int8 safely
   func convertInterfaceToInt8(data []interface{}) []int8 {
   	ints8 := make([]int8, len(data))
   	for i, v := range data {
   		switch val := v.(type) {
   		case float64:
   			ints8[i] = int8(val)
   		case int:
   			ints8[i] = int8(val)
   		default:
   			log.Fatalf("Unexpected type %T in int8 embedding at index %d", v, i)
   		}
   	}
   	return ints8
   }

   // Converts slice of interface{} to []byte safely
   func convertInterfaceToBytes(data []interface{}) []byte {
   	bytes := make([]byte, len(data))
   	for i, v := range data {
   		switch val := v.(type) {
   		case float64:
   			bytes[i] = byte(val)
   		case int:
   			bytes[i] = byte(val)
   		default:
   			log.Fatalf("Unexpected type %T in ubinary embedding at index %d", v, i)
   		}
   	}
   	return bytes
   }

   ```

   Replace the following placeholder values in the code if you didn't set the environment variables and save the file.

   | `MONGODB_URI` | Your cluster connection string if you didn't set the environment variable. |
   | --- | --- |
   | `VOYAGE_API_KEY` | Your Voyage AI API (Application Programming Interface) key if you didn't set the environment variable. |

   Compile and run the file using your application run configuration.

   If you are using a terminal, run the following commands to compile and execute your program.

   ```shell
   go run GenerateAndConvertEmbeddings.go
   ```

   **Output:**

   ```shell
   Embeddings successfully saved to embeddings.json
   ```

   Verify the embeddings in the `embeddings.json` file.

   To learn more about generating embeddings and converting the embeddings to `binData` vectors, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

5. Ingest the data and create a MongoDB Vector Search index.

   You must upload your data and embeddings to a collection in your cluster and create a MongoDB Vector Search index on the data to run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries against the data.

   Create a new file named `UploadDataAndCreateIndex.go` in your Go project.

   ```shell
   touch UploadDataAndCreateIndex.go
   ```

   Copy and paste the following code in the `UploadDataAndCreateIndex.go` file.

   This code does the following:

   - Uploads the `float32`, `int8`, and `int1` embeddings in the `embeddings.json` file to your cluster.

   - Creates a MongoDB Vector Search index on the `embeddings.float32`, `embeddings.int8`, and `embeddings.int1` fields.

   ```go
   package main  
     
   import (  
   	"context"  
   	"fmt"  
   	"io/ioutil"  
   	"log"  
       "time"
   	"os"  
     
   	"go.mongodb.org/mongo-driver/v2/bson"  
   	"go.mongodb.org/mongo-driver/v2/mongo"  
   	"go.mongodb.org/mongo-driver/v2/mongo/options"  
   )  
     
   var (  
   	mongodbURI          = os.Getenv("MONGODB_URI")  
   	dbName              = "sample_airbnb"  
   	collectionName      = "listingsAndReviews"  
   	indexName           = "<INDEX-NAME>"  
   	numberOfDimensions  = 1024  
   	embeddingFields     = []string{"embeddings_float32", "embeddings_int8", "embeddings_int1"}  
   	embeddingSimilarity = []string{"dotProduct", "dotProduct", "euclidean"}  
   )  
     
   func main() {  
   	if mongodbURI == "" {  
   		log.Fatal("MONGODB_URI environment variable not set")  
   	}  
     
   	clientOptions := options.Client().ApplyURI(mongodbURI)  
   	client, err := mongo.Connect(clientOptions)  
   	if err != nil {  
   		log.Fatalf("Error connecting to MongoDB: %v", err)  
   	}  
   	defer func() {  
   		if err = client.Disconnect(context.TODO()); err != nil {  
   			log.Fatal(err)  
   		}  
   	}()  
     
   	if err := uploadEmbeddingsData(client); err != nil {  
   		log.Fatalf("Error uploading embeddings data: %v", err)  
   	}  
     
   	setupVectorSearchIndex(client)  
   }  
     
   func uploadEmbeddingsData(client *mongo.Client) error {  
   	collection := client.Database(dbName).Collection(collectionName)  
     
   	// Load embeddings.json file  
   	fileContent, err := ioutil.ReadFile("embeddings.json")  
   	if err != nil {  
   		return fmt.Errorf("error reading file: %w", err)  
   	}  
     
   	// Convert JSON file content to BSON compatible format using UnmarshalExtJSON  
   	var documents []bson.M  
   	if err := bson.UnmarshalExtJSON(fileContent, false, &documents); err != nil {  
   		return fmt.Errorf("failed to unmarshal JSON data: %w", err)  
   	}  
     
   	// Update documents in MongoDB  
   	for _, doc := range documents {  
   		summary, exists := doc["text"].(string)  
   		if !exists {  
   			return fmt.Errorf("missing 'text' field in document")  
   		}  
     
   		// Using bson.Binary ensures binary data is correctly interpreted  
   		if float32Bin, ok := doc["embeddings_float32"].(bson.Binary); ok {  
   			doc["embeddings_float32"] = float32Bin  
   		}  
   		if int8Bin, ok := doc["embeddings_int8"].(bson.Binary); ok {  
   			doc["embeddings_int8"] = int8Bin  
   		}  
   		if int1Bin, ok := doc["embeddings_int1"].(bson.Binary); ok {  
   			doc["embeddings_int1"] = int1Bin  
   		}  
     
   		filter := bson.M{"summary": summary}  
   		update := bson.M{  
   			"$set": doc,  
   		}  
     
   		// Set the upsert option  
   		opts := options.UpdateMany().SetUpsert(true)  
     
   		_, err = collection.UpdateMany(context.TODO(), filter, update, opts)  
   		if err != nil {  
   			return fmt.Errorf("failed to update documents: %w", err)  
   		}  
   	}  
     
   	return nil  
   }  
     
   // Sets up vector search index in MongoDB  
   func setupVectorSearchIndex(client *mongo.Client) {  
   	database := client.Database(dbName)  
   	collection := database.Collection(collectionName)  
     
   	ctx := context.TODO()  
     
   	type vectorDefinitionField struct {  
   		Type          string `bson:"type"`  
   		Path          string `bson:"path"`  
   		NumDimensions int    `bson:"numDimensions"`  
   		Similarity    string `bson:"similarity"`  
   	}  
     
   	type vectorDefinition struct {  
   		Fields []vectorDefinitionField `bson:"fields"`  
   	}  
     
   	fields := make([]vectorDefinitionField, len(embeddingFields))  
   	for i, field := range embeddingFields {  
   		fields[i] = vectorDefinitionField{  
   			Type:          "vector",  
   			Path:          field,  
   			NumDimensions: numberOfDimensions,  
   			Similarity:    embeddingSimilarity[i],  
   		}  
   	}  
     
   	opts := options.SearchIndexes().SetName(indexName).SetType("vectorSearch")  
     
   	indexModel := mongo.SearchIndexModel{  
   		Definition: vectorDefinition{  
   			Fields: fields,  
   		},  
   		Options: opts,  
   	}  
     
   	// Create the index  
   	log.Println("Creating the index.")  
   	searchIndexName, err := collection.SearchIndexes().CreateOne(ctx, indexModel)  
   	if err != nil {  
   		log.Fatalf("Failed to create the search index: %v", err)  
   	}  
     
   	// Polling to confirm successful index creation  
   	log.Println("Polling to confirm successful index creation.")  
   	log.Println("NOTE: This may take up to a minute.")  
   	searchIndexes := collection.SearchIndexes()  
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

   Replace the following placeholder values in the code and save the file.

   | `MONGODB_URI` | Your cluster connection string if you didn't set the environment variable. |
   | --- | --- |
   | `<INDEX-NAME>` | Name of the MongoDB Vector Search index for the collection. |

   Compile and run the file using your application run configuration.

   If you are using a terminal, run the following commands to compile and execute your program.

   ```shell
   go run UploadDataAndCreateIndex.go
   ```

   **Output:**

   ```shell
   Creating the index.
   Polling to confirm successful index creation.
   NOTE: This may take up to a minute.
   Name of Index Created: <INDEX-NAME>
   ```

   Log in to your cluster and verify the following:

   - Data in the namespace.

   - MongoDB Vector Search index for the collection.

6. Create and run query against the collection.

   To test your embeddings, you can run a query against your collection. Use an embedding model provider to generate `float`, `int8`, and `int1` embeddings for your query text. The following sample code uses Voyage AI's API (Application Programming Interface) to generate full-precision vectors. After generating the embeddings, use the [MongoDB Go driver](https://www.mongodb.com/docs/drivers/go/current/) to convert your native vector embedding to BSON (Binary Javascript Object Notation) vectors and run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query against the collection.

   Create a new file named `CreateEmbeddingsAndRunQuery.go` in your Go project.

   ```shell
   touch CreateEmbeddingsAndRunQuery.go
   ```

   Copy and paste the following code in the `CreateEmbeddingsAndRunQuery.go` file.

   This code does the following:

   - Generates the `float32`, `int8`, and `ubinary` vector embeddings by using Voyage AI's API (Application Programming Interface).

   - Converts the embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using [MongoDB Go driver.](https://www.mongodb.com/docs/drivers/go/current/)

   - Runs the query against your collection and returns the results.

   ```go
   package main

   import (
   	"bytes"
   	"context"
   	"encoding/json"
   	"fmt"
   	"io"
   	"log"
   	"net/http"
   	"os"

   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   const (
   	dbName          = "<DATABASE-NAME>"
   	collectionName  = "<COLLECTION-NAME>"
   	vectorIndexName = "<INDEX-NAME>"
   	dataFieldName   = "<TEXT-FIELD-NAME>"
   	queryText       = "<QUERY-TEXT>"
   	model           = "voyage-3-large"
   	outputDimension = 1024
   	candidates      = <NUMBER-OF-CANDIDATES-TO-CONSIDER>
   	numDocs         = <NUMBER-OF-DOCUMENTS-TO-RETURN>
   )

   func main() {
   	apiKey := os.Getenv("VOYAGE_API_KEY")
   	mongodbURI := os.Getenv("MONGODB_URI")

   	if apiKey == "" {
   		log.Fatal("API key not found. Set VOYAGE_API_KEY in your environment.")
   	}
   	if mongodbURI == "" {
   		log.Fatal("MongoDB URI not found. Set MONGODB_URI in your environment.")
   	}

   	embeddingsData, err := generateAndConvertEmbeddings(apiKey, queryText)
   	if err != nil {
   		log.Fatalf("Error generating embeddings: %v", err)
   	}

   	err = runVectorSearchQuery(mongodbURI, embeddingsData)
   	if err != nil {
   		log.Fatalf("Error running vector search query: %v", err)
   	}
   }

   // Generate embeddings using Voyage AI's embedding API from the query text
   func generateAndConvertEmbeddings(apiKey, text string) (map[string]bson.Binary, error) {
   	embeddingFormats := []string{"float", "int8", "ubinary"}
   	embeddingsData := make(map[string]bson.Binary)

   	for _, outputDType := range embeddingFormats {
   		response := fetchEmbeddingsFromVoyageAPI(apiKey, text, outputDType)
   		embedding := createBSONVectorEmbeddings(outputDType, response)
   		embeddingsData[outputDType] = embedding
   	}

   	return embeddingsData, nil
   }

   // Fetch embeddings using Voyage AI Embedding REST API
   func fetchEmbeddingsFromVoyageAPI(apiKey, text, outputDType string) map[string]interface{} {
   	url := "https://ai.mongodb.com/v1/embeddings"

   	requestBody := map[string]interface{}{
   		"input":            []string{text},
   		"model":            model,
   		"output_dtype":     outputDType,
   		"output_dimension": outputDimension,
   		"input_type":       "query",
   	}

   	requestBytes, err := json.Marshal(requestBody)
   	if err != nil {
   		log.Fatalf("Failed to marshal request body: %v", err)
   	}

   	req, err := http.NewRequestWithContext(context.TODO(), "POST", url, bytes.NewBuffer(requestBytes))
   	if err != nil {
   		log.Fatalf("Failed to create HTTP request: %v", err)
   	}

   	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
   	req.Header.Set("Content-Type", "application/json")

   	client := &http.Client{}
   	resp, err := client.Do(req)
   	if err != nil {
   		log.Fatalf("Failed to make API request: %v", err)
   	}
   	defer resp.Body.Close()

   	if resp.StatusCode != http.StatusOK {
   		body, _ := io.ReadAll(resp.Body)
   		log.Fatalf("Unexpected status code %d: %s", resp.StatusCode, string(body))
   	}

   	var response struct {
   		Data []map[string]interface{} `json:"data"`
   	}
   	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
   		log.Fatalf("Failed to parse API response: %v", err)
   	}

   	if len(response.Data) == 0 {
   		log.Fatalf("No embeddings found in API response")
   	}

   	return response.Data[0]
   }

   // Convert embeddings to BSON vectors using MongoDB Go Driver
   func createBSONVectorEmbeddings(dataType string, rawEmbedding map[string]interface{}) bson.Binary {
   	embeddingArray := rawEmbedding["embedding"].([]interface{})

   	switch dataType {
   	case "float":
   		floatData := convertInterfaceToFloat32(embeddingArray)
   		floatVector := bson.NewVector(floatData)
   		return floatVector.Binary()
   	case "int8":
   		int8Data := convertInterfaceToInt8(embeddingArray)
   		int8Vector := bson.NewVector(int8Data)
   		return int8Vector.Binary()
   	case "ubinary":
   		int1Data := convertInterfaceToBytes(embeddingArray)
   		ubinaryVector, err := bson.NewPackedBitVector(int1Data, 0)
   		if err != nil {
   			log.Fatalf("Error creating PackedBitVector: %v", err)
   		}
   		return ubinaryVector.Binary()
   	default:
   		log.Fatalf("Unknown data type: %s", dataType)
   		return bson.Binary{}
   	}
   }

   // Run $vectorSearch query using the embeddings
   func runVectorSearchQuery(mongodbURI string, embeddingsData map[string]bson.Binary) error {
   	ctx := context.Background()
   	clientOptions := options.Client().ApplyURI(mongodbURI)
   	client, err := mongo.Connect(clientOptions)
   	if err != nil {
   		return fmt.Errorf("failed to connect to MongoDB: %w", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	db := client.Database(dbName)
   	collection := db.Collection(collectionName)

   	pathMap := map[string]string{
   		"float":   "embeddings_float32",
   		"int8":    "embeddings_int8",
   		"ubinary": "embeddings_int1",
   	}

   	for pathKey, queryVector := range embeddingsData {
   		path, ok := pathMap[pathKey]
   		if !ok {
   			return fmt.Errorf("invalid path key: %s", pathKey)
   		}

   		pipeline := mongo.Pipeline{
   			{
   				{"$vectorSearch", bson.D{
   					{"queryVector", queryVector},
   					{"index", vectorIndexName},
   					{"path", path},
   					{"numCandidates", candidates},
   					{"limit", numDocs},
   				}},
   			},
   			{
   				{"$project", bson.D{
   					{"_id", 1},
   					{dataFieldName, 1},
   					{"score", bson.D{
   						{"$meta", "vectorSearchScore"},
   					}},
   				}},
   			},
   		}

   		cursor, err := collection.Aggregate(context.Background(), pipeline)
   		if err != nil {
   			return fmt.Errorf("failed to run vector search aggregation query: %w", err)
   		}
   		defer cursor.Close(ctx)

   		var results []bson.M
   		if err = cursor.All(context.Background(), &results); err != nil {
   			return fmt.Errorf("failed to parse aggregation query results: %w", err)
   		}

   		fmt.Printf("Results from %v embeddings:\n", path)
   		for _, result := range results {
   			fmt.Println(result)
   		}
   	}

   	return nil
   }

   // Converts []interface{} to []float32 safely
   func convertInterfaceToFloat32(data []interface{}) []float32 {
   	f32s := make([]float32, len(data))
   	for i, v := range data {
   		switch val := v.(type) {
   		case float64:
   			f32s[i] = float32(val)
   		case int:
   			f32s[i] = float32(val)
   		default:
   			log.Fatalf("Unexpected type %T in float32 conversion at index %d", v, i)
   		}
   	}
   	return f32s
   }

   // Converts []interface{} to []int8 safely
   func convertInterfaceToInt8(data []interface{}) []int8 {
   	ints8 := make([]int8, len(data))
   	for i, v := range data {
   		switch val := v.(type) {
   		case float64:
   			ints8[i] = int8(val)
   		case int:
   			ints8[i] = int8(val)
   		default:
   			log.Fatalf("Unexpected type %T in int8 conversion at index %d", v, i)
   		}
   	}
   	return ints8
   }

   // Converts []interface{} to []byte (uint8) safely
   func convertInterfaceToBytes(data []interface{}) []byte {
   	bytesOut := make([]byte, len(data))
   	for i, v := range data {
   		switch val := v.(type) {
   		case float64:
   			bytesOut[i] = byte(val)
   		case int:
   			bytesOut[i] = byte(val)
   		default:
   			log.Fatalf("Unexpected type %T in byte conversion at index %d", v, i)
   		}
   	}
   	return bytesOut
   }

   ```

   Replace the following placeholder values in the code and save the file.

   | `MONGODB_URI` | Your cluster connection string if you didn't set the environment variable. |
   | --- | --- |
   | `VOYAGE_API_KEY` | Your Voyage AI API (Application Programming Interface) key if you didn't set the environment variable. |
   | `<DATABASE-NAME>` | Name of the database in your cluster. For this example, use `sample_airbnb`. |
   | `<COLLECTION-NAME>` | Name of the collection where you ingested the data. For this example, use `listingsAndReviews`. |
   | `<INDEX-NAME>` | Name of the MongoDB Vector Search index for the collection. |
   | `<TEXT-FIELD-NAME>` | Name of the field that contain the text from which you generated embeddings. For this example, use `summary`. |
   | `<QUERY-TEXT>` | Text for the query. For this example, use `ocean view`. |
   | `<NUMBER-OF-CANDIDATES-TO-CONSIDER>` | Number of nearest neighbors to consider during the search. For this example, use `20`. |
   | `<NUMBER-OF-DOCUMENTS-TO-RETURN>` | Number of documents to return in the results. For this example, use `5`. |

   Compile and run the file using your application run configuration.

   If you are using a terminal, run the following commands to compile and execute your program.

   ```shell
   go run CreateEmbeddingsAndRunQuery.go
   ```

   **Output:**

   ```shell
   Results from embeddings_float32 embeddings:
   {"_id":"10266175","summary":"A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.","score":{"$numberDouble":"0.7278661131858826"}}
   {"summary":"A short distance from Honolulu's billion dollar mall, and the same distance to Waikiki. Parking included. A great location that work perfectly for business, education, or simple visit. Experience Yacht Harbor views and 5 Star Hilton Hawaiian Village.","score":{"$numberDouble":"0.688639760017395"},"_id":"1001265"}
   Results from embeddings_int8 embeddings:
   {"_id":"10266175","summary":"A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.","score":{"$numberDouble":"0.5215557217597961"}}
   {"_id":"1001265","summary":"A short distance from Honolulu's billion dollar mall, and the same distance to Waikiki. Parking included. A great location that work perfectly for business, education, or simple visit. Experience Yacht Harbor views and 5 Star Hilton Hawaiian Village.","score":{"$numberDouble":"0.5179016590118408"}}
   Results from embeddings_int1 embeddings:
   {"_id":"10266175","summary":"A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.","score":{"$numberDouble":"0.6591796875"}}
   {"_id":"1001265","summary":"A short distance from Honolulu's billion dollar mall, and the same distance to Waikiki. Parking included. A great location that work perfectly for business, education, or simple visit. Experience Yacht Harbor views and 5 Star Hilton Hawaiian Village.","score":{"$numberDouble":"0.6337890625"}}
   ```

   To learn more about generating embeddings and converting the embeddings to `binData` vectors, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

To quantize your BSON (Binary Javascript Object Notation) `binData` vectors, you must have the following:

- A cluster running MongoDB version 6.0.11, 7.0.2, or later.

  Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

- Access to an embedding model that supports byte vector output.

  The outputs from the following embedding models can be used to generate BSON (Binary Javascript Object Notation) `binData` vectors with a supported MongoDB driver:

  | Embedding Model Provider | Embedding Model |
  | --- | --- |
  | [Voyage AI](https://www.voyageai.com/) | `voyage-3-large` |
  | [Cohere](https://cohere.com/) | `embed-english-v3.0` |
  | [Nomic](https://www.nomic.ai/) | `nomic-embed-text-v1.5` |
  | [Jina](https://jina.ai/) | `jina-embeddings-v2-base-en` |
  | [Mixedbread](https://www.mixedbread.ai/) | `mxbai-embed-large-v1` |

  Scalar quantization preserves recall for these models because these models are all trained to be quantization aware. Therefore, [recall](https://www.mongodb.com/docs/manual/reference/glossary.md#std-term-recall) degradation for scalar quantized embeddings produced by these models is minimal even at lower dimensions like 384.

* A terminal and code editor to run your C# project.

* The [.NET SDK](https://dotnet.microsoft.com/download) installed.

## Procedure

1. Create your project and install dependencies.

   Run the following commands in your terminal to create a new directory named `VectorQuantization` and initialize your project:

   ```shell
   dotnet new console -o VectorQuantization
   cd VectorQuantization
   ```

   Run the following command to add the [MongoDB .NET/C# Driver](https://www.mongodb.com/docs/drivers/csharp/current/) to your project. You must install v3.2.0 or later.

   ```shell
   dotnet add package MongoDB.Driver --version 3.2.0
   ```

2. Set your environment variables.

   Export the following environment variables in your terminal, or use your IDE's environment variable manager to make these variables available to your project.

   ```shell
   export VOYAGE_API_KEY="<api-key>"
   export CONNECTION_STRING="<connection-string>"
   ```

   Update the placeholders with the following values:

   - Replace the `<api-key>` placeholder value with your Voyage AI API key.

   - Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

     ### Atlas Cluster

     Your connection string should use the following format:

     ```text
     mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
     ```

     To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Generate embeddings from your data.

   You can use an embedding model provider to generate `float32`, `int8`, and `int1` embeddings for your data and then use the [MongoDB .NET/C# Driver](https://www.mongodb.com/docs/drivers/csharp/current/) to convert your native vector embedding to BSON (Binary Javascript Object Notation) vectors. The following sample code uses Voyage AI's `voyage-3-large` API (Application Programming Interface) to generate full-precision vectors.

   Add the following classes to your project. They define the shape of the documents that the code writes to your cluster.

   ```csharp
   public class QuantizationEmbeddingsFile
   {
       [BsonElement("data")]
       public List<QuantizationEmbeddingDocument> Data { get; set; } = null!;
   }

   public class QuantizationEmbeddingDocument
   {
       [BsonElement("text")]
       public string Text { get; set; } = null!;

       [BsonElement("embeddings_float32")]
       public BinaryVectorFloat32 EmbeddingsFloat32 { get; set; } = null!;

       [BsonElement("embeddings_int8")]
       public BinaryVectorInt8 EmbeddingsInt8 { get; set; } = null!;

       [BsonElement("embeddings_int1")]
       public BinaryVectorPackedBit EmbeddingsInt1 { get; set; } = null!;
   }

   ```

   Add the following method to your project.

   This code does the following:

   - Generates the `float32`, `int8`, and `ubinary` vector embeddings by using Voyage AI's `voyage-3-large` embedding model.

   - Converts the embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using the [MongoDB .NET/C# Driver.](https://www.mongodb.com/docs/drivers/csharp/current/)

   - Creates a file named `embeddings.json` and saves the data with embeddings in the file to upload to Atlas.

   ```csharp
   public async Task GenerateAndConvertEmbeddingsAsync()
   {
       var voyageApiKey = "<voyageApiKey>";
       string[] sampleData =
       [
           "The Great Wall of China is visible from space.",
           "The Eiffel Tower was completed in Paris in 1889.",
           "Mount Everest is the highest peak on Earth at 8,848m.",
           "Shakespeare wrote 37 plays and 154 sonnets during his lifetime.",
           "The Mona Lisa was painted by Leonardo da Vinci."
       ];

       var floatEmbeddings = await FetchEmbeddingsFromVoyageAsync(sampleData, "float", voyageApiKey);
       var int8Embeddings = await FetchEmbeddingsFromVoyageAsync(sampleData, "int8", voyageApiKey);
       var ubinaryEmbeddings = await FetchEmbeddingsFromVoyageAsync(sampleData, "ubinary", voyageApiKey);

       var documents = new List<QuantizationEmbeddingDocument>();
       for (var i = 0; i < sampleData.Length; i++)
       {
           documents.Add(new QuantizationEmbeddingDocument
           {
               Text = sampleData[i],
               EmbeddingsFloat32 = new BinaryVectorFloat32(ToFloatArray(floatEmbeddings[i])),
               EmbeddingsInt8 = new BinaryVectorInt8(ToSByteArray(int8Embeddings[i])),
               EmbeddingsInt1 = new BinaryVectorPackedBit(ToByteArray(ubinaryEmbeddings[i]), 0)
           });
       }

       File.WriteAllText("embeddings.json", new QuantizationEmbeddingsFile { Data = documents }.ToBsonDocument().ToJson());
       Console.WriteLine("Embeddings saved to embeddings.json");
   }

   // Send a request to the Voyage AI embeddings API for the given output data type
   private static async Task<List<List<double>>> FetchEmbeddingsFromVoyageAsync(string[] inputs, string outputDtype, string voyageApiKey)
   {
       using var client = new HttpClient();
       client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", voyageApiKey);

       var requestBody = new
       {
           input = inputs,
           model = "voyage-3-large",
           input_type = "document",
           output_dtype = outputDtype,
           output_dimension = 1024
       };

       const int maxRetries = 5;
       HttpResponseMessage response;
       var attempt = 0;
       while (true)
       {
           var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
           response = await client.PostAsync("https://ai.mongodb.com/v1/embeddings", content);

           if (response.StatusCode != HttpStatusCode.TooManyRequests || attempt >= maxRetries)
           {
               break;
           }

           attempt++;
           var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt));
           Console.WriteLine($"Rate limited by Voyage AI. Retrying in {delay.TotalSeconds}s...");
           await Task.Delay(delay);
       }

       if (!response.IsSuccessStatusCode)
       {
           throw new ApplicationException($"API error: HTTP {(int)response.StatusCode}");
       }

       var responseBody = await response.Content.ReadAsStringAsync();
       using var responseJson = JsonDocument.Parse(responseBody);

       var embeddings = new List<List<double>>();
       foreach (var item in responseJson.RootElement.GetProperty("data").EnumerateArray())
       {
           var vector = new List<double>();
           foreach (var value in item.GetProperty("embedding").EnumerateArray())
           {
               vector.Add(value.GetDouble());
           }
           embeddings.Add(vector);
       }

       return embeddings;
   }

   private static float[] ToFloatArray(List<double> values) => values.Select(v => (float)v).ToArray();

   private static sbyte[] ToSByteArray(List<double> values) => values.Select(v => (sbyte)v).ToArray();

   private static byte[] ToByteArray(List<double> values) => values.Select(v => (byte)v).ToArray();

   ```

   Replace the `<voyageApiKey>` placeholder value in the code with your Voyage AI API (Application Programming Interface) key, then call `GenerateAndConvertEmbeddingsAsync()`.

   ```shell
   Embeddings saved to embeddings.json
   ```

   Verify the embeddings in the `embeddings.json` file.

   To learn more about generating embeddings and converting the embeddings to `binData` vectors, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

4. Ingest the data and create a MongoDB Vector Search index.

   You must upload your data and embeddings to a collection in your cluster and create a MongoDB Vector Search index on the data to run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries against the data.

   Add the following methods to your project.

   This code does the following:

   - Uploads the data in the `embeddings.json` file to your cluster.

   - Creates a MongoDB Vector Search index on the `embeddings_float32`, `embeddings_int8`, and `embeddings_int1` fields.

   ```csharp
   public void StoreEmbeddings(string dbName, string collectionName)
   {
       using var client = new MongoClient("<connectionString>");

       var fileContent = File.ReadAllText("embeddings.json");
       var embeddingsFile = BsonSerializer.Deserialize<QuantizationEmbeddingsFile>(BsonDocument.Parse(fileContent));

       var collection = client.GetDatabase(dbName).GetCollection<QuantizationEmbeddingDocument>(collectionName);
       collection.InsertMany(embeddingsFile.Data);
       Console.WriteLine("Inserted documents into MongoDB");
   }

   public string SetupVectorSearchIndex(string dbName, string collectionName, string indexName)
   {
       using var client = new MongoClient("<connectionString>");
       var collection = client.GetDatabase(dbName).GetCollection<BsonDocument>(collectionName);

       var definition = new BsonDocument
       {
           { "fields", new BsonArray
               {
                   new BsonDocument
                   {
                       { "type", "vector" },
                       { "path", "embeddings_float32" },
                       { "numDimensions", 1024 },
                       { "similarity", "dotProduct" }
                   },
                   new BsonDocument
                   {
                       { "type", "vector" },
                       { "path", "embeddings_int8" },
                       { "numDimensions", 1024 },
                       { "similarity", "dotProduct" }
                   },
                   new BsonDocument
                   {
                       { "type", "vector" },
                       { "path", "embeddings_int1" },
                       { "numDimensions", 1024 },
                       { "similarity", "euclidean" }
                   }
               }
           }
       };

       var indexModel = new CreateSearchIndexModel(indexName, SearchIndexType.VectorSearch, definition);
       var searchIndexView = collection.SearchIndexes;
       var name = searchIndexView.CreateOne(indexModel);
       Console.WriteLine($"Successfully created vector index named: {name}");
       Console.WriteLine("It may take up to a minute for the index to leave the BUILDING status and become queryable.");

       Console.WriteLine("Polling to confirm the index has changed from the BUILDING status.");
       var queryable = false;
       while (!queryable)
       {
           var indexes = searchIndexView.List();
           foreach (var index in indexes.ToEnumerable())
           {
               if (index["name"] == name)
               {
                   queryable = index["queryable"].AsBoolean;
               }
           }
           if (!queryable)
           {
               Thread.Sleep(5000);
           }
       }
       Console.WriteLine($"{name} index is ready to query");
       return name;
   }

   ```

   Replace the `<connectionString>` placeholder value in the code, then call `StoreEmbeddings(dbName, collectionName)` followed by `SetupVectorSearchIndex(dbName, collectionName, indexName)` with the following arguments.

   | Parameter | Value |
   | --- | --- |
   | `dbName` | Name of the database in your cluster. |
   | `collectionName` | Name of the collection where you want to upload the data. |
   | `indexName` | Name of the MongoDB Vector Search index for the collection. |

   ```shell
   Inserted documents into MongoDB
   Successfully created vector index named: <indexName>
   It may take up to a minute for the index to leave the BUILDING status and become queryable.
   Polling to confirm the index has changed from the BUILDING status.
   <indexName> index is ready to query
   ```

   Connect to your cluster and verify the following:

   - Data in the namespace.

   - MongoDB Vector Search index for the collection.

5. Create and run a query against the collection.

   To test your embeddings, you can run a [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query against your collection.

   Add the following class to your project. It defines the shape of the query results.

   ```csharp
   public class QuantizationQueryResult
   {
       [BsonElement("text")]
       public string Text { get; set; } = null!;

       [BsonElement("score")]
       public double Score { get; set; }
   }

   ```

   Add the following method to your project.

   This code does the following:

   - Generates the `float32`, `int8`, and `ubinary` vector embeddings by using Voyage AI's `voyage-3-large` embedding model.

   - Converts the embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using the [MongoDB .NET/C# Driver.](https://www.mongodb.com/docs/drivers/csharp/current/)

   - Runs the query against your collection.

   ```csharp
   public async Task<Dictionary<string, List<QuantizationQueryResult>>> RunQueriesAsync(
       string dbName, string collectionName, string indexName, string dataFieldName, string queryText,
       int numberOfCandidates, int numberOfDocuments)
   {
       using var client = new MongoClient("<connectionString>");
       var voyageApiKey = "<voyageApiKey>";

       var floatEmbedding = await FetchEmbeddingFromVoyageAsync(queryText, "float", voyageApiKey);
       var int8Embedding = await FetchEmbeddingFromVoyageAsync(queryText, "int8", voyageApiKey);
       var ubinaryEmbedding = await FetchEmbeddingFromVoyageAsync(queryText, "ubinary", voyageApiKey);

       QueryVector float32Vector = new BinaryVectorFloat32(floatEmbedding.Select(v => (float)v).ToArray());
       QueryVector int8Vector = new BinaryVectorInt8(int8Embedding.Select(v => (sbyte)v).ToArray());
       QueryVector int1Vector = new BinaryVectorPackedBit(ubinaryEmbedding.Select(v => (byte)v).ToArray(), 0);

       var collection = client.GetDatabase(dbName).GetCollection<QuantizationEmbeddingDocument>(collectionName);

       var resultsByField = new Dictionary<string, List<QuantizationQueryResult>>
       {
           ["embeddings_float32"] = RunVectorSearchQuery(
               collection, d => d.EmbeddingsFloat32, indexName, dataFieldName, float32Vector, numberOfCandidates, numberOfDocuments),
           ["embeddings_int8"] = RunVectorSearchQuery(
               collection, d => d.EmbeddingsInt8, indexName, dataFieldName, int8Vector, numberOfCandidates, numberOfDocuments),
           ["embeddings_int1"] = RunVectorSearchQuery(
               collection, d => d.EmbeddingsInt1, indexName, dataFieldName, int1Vector, numberOfCandidates, numberOfDocuments)
       };

       foreach (var (path, results) in resultsByField)
       {
           Console.WriteLine($"Results from {path} embeddings:");
           foreach (var result in results)
           {
               Console.WriteLine(result.ToBsonDocument().ToJson());
           }
       }

       return resultsByField;
   }

   // Send a request to the Voyage AI embeddings API for the given output data type
   private static async Task<List<double>> FetchEmbeddingFromVoyageAsync(string text, string outputDtype, string voyageApiKey)
   {
       using var client = new HttpClient();
       client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", voyageApiKey);

       var requestBody = new
       {
           input = new[] { text },
           model = "voyage-3-large",
           input_type = "query",
           output_dtype = outputDtype,
           output_dimension = 1024
       };

       const int maxRetries = 5;
       HttpResponseMessage response;
       var attempt = 0;
       while (true)
       {
           var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
           response = await client.PostAsync("https://ai.mongodb.com/v1/embeddings", content);

           if (response.StatusCode != HttpStatusCode.TooManyRequests || attempt >= maxRetries)
           {
               break;
           }

           attempt++;
           var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt));
           Console.WriteLine($"Rate limited by Voyage AI. Retrying in {delay.TotalSeconds}s...");
           await Task.Delay(delay);
       }

       if (!response.IsSuccessStatusCode)
       {
           throw new ApplicationException($"API error: HTTP {(int)response.StatusCode}");
       }

       var responseBody = await response.Content.ReadAsStringAsync();
       using var responseJson = JsonDocument.Parse(responseBody);

       var embedding = new List<double>();
       foreach (var value in responseJson.RootElement.GetProperty("data")[0].GetProperty("embedding").EnumerateArray())
       {
           embedding.Add(value.GetDouble());
       }

       return embedding;
   }

   // Run a $vectorSearch query against the given embedding field
   private static List<QuantizationQueryResult> RunVectorSearchQuery(
       IMongoCollection<QuantizationEmbeddingDocument> collection,
       Expression<Func<QuantizationEmbeddingDocument, object>> path,
       string indexName,
       string dataFieldName,
       QueryVector queryVector,
       int numberOfCandidates,
       int numberOfDocuments)
   {
       var options = new VectorSearchOptions<QuantizationEmbeddingDocument>
       {
           IndexName = indexName,
           NumberOfCandidates = numberOfCandidates
       };

       var results = collection.Aggregate()
           .VectorSearch(path, queryVector, numberOfDocuments, options)
           .Project(Builders<QuantizationEmbeddingDocument>.Projection
               .Include(dataFieldName)
               .MetaVectorSearchScore("score"))
           .As<BsonDocument>()
           .ToList();

       return results.Select(document => new QuantizationQueryResult
       {
           Text = document.Contains(dataFieldName)
               ? document[dataFieldName].AsString
               : throw new InvalidOperationException($"Expected field '{dataFieldName}' not found in query result."),
           Score = document.Contains("score") ? document["score"].AsDouble : 0
       }).ToList();
   }

   ```

   Replace the `<connectionString>` and `<voyageApiKey>` placeholder values in the code, then call `RunQueriesAsync()` with the following arguments.

   | Parameter | Value |
   | --- | --- |
   | `dbName` | Name of the database in your cluster. |
   | `collectionName` | Name of the collection where you ingested the data. |
   | `indexName` | Name of the MongoDB Vector Search index for the collection. |
   | `dataFieldName` | Name of the field that contains the text from which you generated embeddings. For this example, use `text`. |
   | `queryText` | Text for the query. For this example, use `science fact`. |
   | `numberOfCandidates` | Number of nearest neighbors to consider during the search. For this example, use `5`. |
   | `numberOfDocuments` | Number of documents to return in the results. For this example, use `2`. |

   Results from `embeddings_float32` embeddings:

   ```none
   { "text" : "The Great Wall of China is visible from space.", "score" : ... }
   { "text" : "Mount Everest is the highest peak on Earth at 8,848m.", "score" : ... }

   ```

   Results from `embeddings_int8` embeddings:

   ```none
   { "text" : "The Great Wall of China is visible from space.", "score" : ... }
   { "text" : "Mount Everest is the highest peak on Earth at 8,848m.", "score" : ... }

   ```

   Results from `embeddings_int1` embeddings:

   ```none
   { "text" : "The Great Wall of China is visible from space.", "score" : ... }
   { "text" : "Mount Everest is the highest peak on Earth at 8,848m.", "score" : ... }

   ```

   To learn more about generating embeddings and converting the embeddings to `binData` vectors, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

To quantize your BSON (Binary Javascript Object Notation) `binData` vectors, you must have the following:

- A cluster running MongoDB version 6.0.11, 7.0.2, or later.

  Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

- Access to an embedding model that supports byte vector output.

  The outputs from the following embedding models can be used to generate BSON (Binary Javascript Object Notation) `binData` vectors with a supported MongoDB driver:

  | Embedding Model Provider | Embedding Model |
  | --- | --- |
  | [Voyage AI](https://www.voyageai.com/) | `voyage-3-large` |
  | [Cohere](https://cohere.com/) | `embed-english-v3.0` |
  | [Nomic](https://www.nomic.ai/) | `nomic-embed-text-v1.5` |
  | [Jina](https://jina.ai/) | `jina-embeddings-v2-base-en` |
  | [Mixedbread](https://www.mixedbread.ai/) | `mxbai-embed-large-v1` |

  Scalar quantization preserves recall for these models because these models are all trained to be quantization aware. Therefore, [recall](https://www.mongodb.com/docs/manual/reference/glossary.md#std-term-recall) degradation for scalar quantized embeddings produced by these models is minimal even at lower dimensions like 384.

* A terminal and code editor to run your C# project.

* The [.NET SDK](https://dotnet.microsoft.com/download) installed.

## Procedure

1. Create your project and install dependencies.

   Run the following commands in your terminal to create a new directory named `VectorQuantization` and initialize your project:

   ```shell
   dotnet new console -o VectorQuantization
   cd VectorQuantization
   ```

   Run the following command to add the [MongoDB .NET/C# Driver](https://www.mongodb.com/docs/drivers/csharp/current/) to your project. You must install v3.2.0 or later.

   ```shell
   dotnet add package MongoDB.Driver --version 3.2.0
   ```

2. Set your environment variables.

   Export the following environment variables in your terminal, or use your IDE's environment variable manager to make these variables available to your project.

   ```shell
   export VOYAGE_API_KEY="<api-key>"
   export CONNECTION_STRING="<connection-string>"
   ```

   Update the placeholders with the following values:

   - Replace the `<api-key>` placeholder value with your Voyage AI API key.

   - Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

     ### Atlas Cluster

     Your connection string should use the following format:

     ```text
     mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
     ```

     To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. (Conditional) Generate embeddings from your data.

   If you already have `float32`, `int8`, or `int1` vector embeddings in your collection, skip this step.

   You can use an embedding model provider to generate `float32`, `int8`, and `int1` embeddings for your data and then use the [MongoDB .NET/C# Driver](https://www.mongodb.com/docs/drivers/csharp/current/) to convert your native vector embedding to BSON (Binary Javascript Object Notation) vectors. The following sample code uses Voyage AI's `voyage-3-large` API (Application Programming Interface) to generate full-precision vectors from the data in the `sample_airbnb.listingsAndReviews` namespace.

   Add the following classes to your project. They define the shape of the documents that the code reads from and writes to your cluster.

   ```csharp
   [BsonIgnoreExtraElements]
   public class QuantizationSourceDocument
   {
       [BsonElement("summary")]
       public string Summary { get; set; } = null!;
   }

   ```

   ```csharp
   public class QuantizationEmbeddingsFile
   {
       [BsonElement("data")]
       public List<QuantizationEmbeddingDocument> Data { get; set; } = null!;
   }

   public class QuantizationEmbeddingDocument
   {
       [BsonElement("text")]
       public string Text { get; set; } = null!;

       [BsonElement("embeddings_float32")]
       public BinaryVectorFloat32 EmbeddingsFloat32 { get; set; } = null!;

       [BsonElement("embeddings_int8")]
       public BinaryVectorInt8 EmbeddingsInt8 { get; set; } = null!;

       [BsonElement("embeddings_int1")]
       public BinaryVectorPackedBit EmbeddingsInt1 { get; set; } = null!;
   }

   ```

   Add the following method to your project.

   This code does the following:

   - Gets the `summary` field from 50 documents in the `sample_airbnb.listingsAndReviews` namespace.

   - Generates the `float32`, `int8`, and `ubinary` vector embeddings by using Voyage AI's `voyage-3-large` embedding model.

   - Converts the embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using the [MongoDB .NET/C# Driver](https://www.mongodb.com/docs/drivers/csharp/current/). The `ToFloatArray`, `ToSByteArray`, and `ToByteArray` helper functions convert the raw `double` values that Voyage AI returns to the numeric types that these vector constructors require.

   - Creates a file named `embeddings.json` and saves the data with embeddings in the file.

   ```csharp
   public async Task GenerateAndConvertEmbeddingsAsync()
   {
       using var client = new MongoClient("<connectionString>");
       var collection = client.GetDatabase("sample_airbnb").GetCollection<QuantizationSourceDocument>("listingsAndReviews");

       var voyageApiKey = "<voyageApiKey>";

       var filter = Builders<QuantizationSourceDocument>.Filter.Nin(
           d => d.Summary, new[] { null, "" });
       var summaries = collection.Find(filter).Limit(50).ToList()
           .Select(d => d.Summary)
           .Where(s => !string.IsNullOrEmpty(s))
           .ToList();

       var floatEmbeddings = await FetchEmbeddingsFromVoyageAsync(summaries, "float", voyageApiKey);
       var int8Embeddings = await FetchEmbeddingsFromVoyageAsync(summaries, "int8", voyageApiKey);
       var ubinaryEmbeddings = await FetchEmbeddingsFromVoyageAsync(summaries, "ubinary", voyageApiKey);

       var documents = new List<QuantizationEmbeddingDocument>();
       for (var i = 0; i < summaries.Count; i++)
       {
           documents.Add(new QuantizationEmbeddingDocument
           {
               Text = summaries[i],
               EmbeddingsFloat32 = new BinaryVectorFloat32(ToFloatArray(floatEmbeddings[i])),
               EmbeddingsInt8 = new BinaryVectorInt8(ToSByteArray(int8Embeddings[i])),
               EmbeddingsInt1 = new BinaryVectorPackedBit(ToByteArray(ubinaryEmbeddings[i]), 0)
           });
       }

       File.WriteAllText("embeddings.json", new QuantizationEmbeddingsFile { Data = documents }.ToBsonDocument().ToJson());
       Console.WriteLine("Embeddings saved to embeddings.json");
   }

   // Send a request to the Voyage AI embeddings API for the given output data type
   private static async Task<List<List<double>>> FetchEmbeddingsFromVoyageAsync(List<string> inputs, string outputDtype, string voyageApiKey)
   {
       using var client = new HttpClient();
       client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", voyageApiKey);

       var requestBody = new
       {
           input = inputs,
           model = "voyage-3-large",
           input_type = "document",
           output_dtype = outputDtype,
           output_dimension = 1024
       };

       const int maxRetries = 5;
       HttpResponseMessage response;
       var attempt = 0;
       while (true)
       {
           var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
           response = await client.PostAsync("https://ai.mongodb.com/v1/embeddings", content);

           if (response.StatusCode != HttpStatusCode.TooManyRequests || attempt >= maxRetries)
           {
               break;
           }

           attempt++;
           var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt));
           Console.WriteLine($"Rate limited by Voyage AI. Retrying in {delay.TotalSeconds}s...");
           await Task.Delay(delay);
       }

       if (!response.IsSuccessStatusCode)
       {
           throw new ApplicationException($"API error: HTTP {(int)response.StatusCode}");
       }

       var responseBody = await response.Content.ReadAsStringAsync();
       using var responseJson = JsonDocument.Parse(responseBody);

       var embeddings = new List<List<double>>();
       foreach (var item in responseJson.RootElement.GetProperty("data").EnumerateArray())
       {
           var vector = new List<double>();
           foreach (var value in item.GetProperty("embedding").EnumerateArray())
           {
               vector.Add(value.GetDouble());
           }
           embeddings.Add(vector);
       }

       return embeddings;
   }

   private static float[] ToFloatArray(List<double> values) => values.Select(v => (float)v).ToArray();

   private static sbyte[] ToSByteArray(List<double> values) => values.Select(v => (sbyte)v).ToArray();

   private static byte[] ToByteArray(List<double> values) => values.Select(v => (byte)v).ToArray();

   ```

   Replace the following placeholder values in the code and call `GenerateAndConvertEmbeddingsAsync()`.

   | Placeholder | Value |
   | --- | --- |
   | `<connectionString>` | Connection string for your cluster. |
   | `<voyageApiKey>` | Your Voyage AI API (Application Programming Interface) key. |

   ```shell
   Embeddings saved to embeddings.json
   ```

   Verify the embeddings in the `embeddings.json` file.

   To learn more about generating embeddings and converting the embeddings to `binData` vectors, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

4. Ingest the data and create a MongoDB Vector Search index.

   You must upload your data and embeddings to a collection in your cluster and create a MongoDB Vector Search index on the data to run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) queries against the data.

   Add the following methods to your project.

   This code does the following:

   - Uploads the `float32`, `int8`, and `int1` embeddings in the `embeddings.json` file to your cluster.

   - Creates a MongoDB Vector Search index on the `embeddings_float32`, `embeddings_int8`, and `embeddings_int1` fields.

   ```csharp
   public void UploadEmbeddingsData()
   {
       using var client = new MongoClient("<connectionString>");
       var collection = client.GetDatabase("sample_airbnb").GetCollection<QuantizationSourceDocument>("listingsAndReviews");

       var fileContent = File.ReadAllText("embeddings.json");
       var embeddingsFile = BsonSerializer.Deserialize<QuantizationEmbeddingsFile>(BsonDocument.Parse(fileContent));

       foreach (var doc in embeddingsFile.Data)
       {
           var filter = Builders<QuantizationSourceDocument>.Filter.Eq("summary", doc.Text);
           var update = Builders<QuantizationSourceDocument>.Update
               .Set("embeddings_float32", doc.EmbeddingsFloat32)
               .Set("embeddings_int8", doc.EmbeddingsInt8)
               .Set("embeddings_int1", doc.EmbeddingsInt1);

           collection.UpdateOne(filter, update);
           Console.WriteLine($"Processed document with summary: {doc.Text}");
       }
   }

   public string SetupVectorSearchIndex(string indexName)
   {
       using var client = new MongoClient("<connectionString>");
       var collection = client.GetDatabase("sample_airbnb").GetCollection<BsonDocument>("listingsAndReviews");

       var definition = new BsonDocument
       {
           { "fields", new BsonArray
               {
                   new BsonDocument
                   {
                       { "type", "vector" },
                       { "path", "embeddings_float32" },
                       { "numDimensions", 1024 },
                       { "similarity", "dotProduct" }
                   },
                   new BsonDocument
                   {
                       { "type", "vector" },
                       { "path", "embeddings_int8" },
                       { "numDimensions", 1024 },
                       { "similarity", "dotProduct" }
                   },
                   new BsonDocument
                   {
                       { "type", "vector" },
                       { "path", "embeddings_int1" },
                       { "numDimensions", 1024 },
                       { "similarity", "euclidean" }
                   }
               }
           }
       };

       var indexModel = new CreateSearchIndexModel(indexName, SearchIndexType.VectorSearch, definition);
       var searchIndexView = collection.SearchIndexes;
       var name = searchIndexView.CreateOne(indexModel);
       Console.WriteLine($"Successfully created vector index named: {name}");
       Console.WriteLine("It may take up to a minute for the index to leave the BUILDING status and become queryable.");

       Console.WriteLine("Polling to confirm the index has changed from the BUILDING status.");
       var queryable = false;
       while (!queryable)
       {
           var indexes = searchIndexView.List();
           foreach (var index in indexes.ToEnumerable())
           {
               if (index["name"] == name)
               {
                   queryable = index["queryable"].AsBoolean;
               }
           }
           if (!queryable)
           {
               Thread.Sleep(5000);
           }
       }
       Console.WriteLine($"{name} index is ready to query");
       return name;
   }

   ```

   Replace the following placeholder value in the code, then call `UploadEmbeddingsData()` followed by `SetupVectorSearchIndex(indexName)`, passing the name you want to use for the MongoDB Vector Search index.

   - `<connectionString>`: Connection string for your cluster.

   ```shell
   Processed document with summary: ...
   ...
   Successfully created vector index named: <indexName>
   It may take up to a minute for the index to leave the BUILDING status and become queryable.
   Polling to confirm the index has changed from the BUILDING status.
   <indexName> index is ready to query
   ```

   Connect to your cluster and verify the following:

   - Data in the namespace.

   - MongoDB Vector Search index for the collection.

5. Create and run a query against the collection.

   To test your embeddings, you can run a query against your collection. Use an embedding model provider to generate `float`, `int8`, and `int1` embeddings for your query text. The following sample code uses Voyage AI's `voyage-3-large` REST API (Application Programming Interface) to generate full-precision vectors. After generating the embeddings, use the [MongoDB .NET/C# Driver](https://www.mongodb.com/docs/drivers/csharp/current/) to convert your native vector embedding to BSON (Binary Javascript Object Notation) vectors and run [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) query against the collection.

   Add the following class to your project. It defines the shape of the query results.

   ```csharp
   public class QuantizationQueryResult
   {
       [BsonElement("text")]
       public string Text { get; set; } = null!;

       [BsonElement("score")]
       public double Score { get; set; }
   }

   ```

   Add the following method to your project.

   This code does the following:

   - Generates the `float32`, `int8`, and `ubinary` vector embeddings by using Voyage AI's `voyage-3-large` embedding model.

   - Converts the embeddings to BSON (Binary Javascript Object Notation) `binData` vectors by using the [MongoDB .NET/C# Driver.](https://www.mongodb.com/docs/drivers/csharp/current/)

   - Runs the query against your collection and returns the results.

   ```csharp
   public async Task<Dictionary<string, List<QuantizationQueryResult>>> RunQueriesAsync(
       string dbName, string collectionName, string indexName, string dataFieldName, string queryText,
       int numberOfCandidates, int numberOfDocuments)
   {
       using var client = new MongoClient("<connectionString>");
       var voyageApiKey = "<voyageApiKey>";

       var floatEmbedding = await FetchEmbeddingFromVoyageAsync(queryText, "float", voyageApiKey);
       var int8Embedding = await FetchEmbeddingFromVoyageAsync(queryText, "int8", voyageApiKey);
       var ubinaryEmbedding = await FetchEmbeddingFromVoyageAsync(queryText, "ubinary", voyageApiKey);

       QueryVector float32Vector = new BinaryVectorFloat32(floatEmbedding.Select(v => (float)v).ToArray());
       QueryVector int8Vector = new BinaryVectorInt8(int8Embedding.Select(v => (sbyte)v).ToArray());
       QueryVector int1Vector = new BinaryVectorPackedBit(ubinaryEmbedding.Select(v => (byte)v).ToArray(), 0);

       var collection = client.GetDatabase(dbName).GetCollection<QuantizationEmbeddingDocument>(collectionName);

       var resultsByField = new Dictionary<string, List<QuantizationQueryResult>>
       {
           ["embeddings_float32"] = RunVectorSearchQuery(
               collection, d => d.EmbeddingsFloat32, indexName, dataFieldName, float32Vector, numberOfCandidates, numberOfDocuments),
           ["embeddings_int8"] = RunVectorSearchQuery(
               collection, d => d.EmbeddingsInt8, indexName, dataFieldName, int8Vector, numberOfCandidates, numberOfDocuments),
           ["embeddings_int1"] = RunVectorSearchQuery(
               collection, d => d.EmbeddingsInt1, indexName, dataFieldName, int1Vector, numberOfCandidates, numberOfDocuments)
       };

       foreach (var (path, results) in resultsByField)
       {
           Console.WriteLine($"Results from {path} embeddings:");
           foreach (var result in results)
           {
               Console.WriteLine(result.ToBsonDocument().ToJson());
           }
       }

       return resultsByField;
   }

   // Send a request to the Voyage AI embeddings API for the given output data type
   private static async Task<List<double>> FetchEmbeddingFromVoyageAsync(string text, string outputDtype, string voyageApiKey)
   {
       using var client = new HttpClient();
       client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", voyageApiKey);

       var requestBody = new
       {
           input = new[] { text },
           model = "voyage-3-large",
           input_type = "query",
           output_dtype = outputDtype,
           output_dimension = 1024
       };

       const int maxRetries = 5;
       HttpResponseMessage response;
       var attempt = 0;
       while (true)
       {
           var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
           response = await client.PostAsync("https://ai.mongodb.com/v1/embeddings", content);

           if (response.StatusCode != HttpStatusCode.TooManyRequests || attempt >= maxRetries)
           {
               break;
           }

           attempt++;
           var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt));
           Console.WriteLine($"Rate limited by Voyage AI. Retrying in {delay.TotalSeconds}s...");
           await Task.Delay(delay);
       }

       if (!response.IsSuccessStatusCode)
       {
           throw new ApplicationException($"API error: HTTP {(int)response.StatusCode}");
       }

       var responseBody = await response.Content.ReadAsStringAsync();
       using var responseJson = JsonDocument.Parse(responseBody);

       var embedding = new List<double>();
       foreach (var value in responseJson.RootElement.GetProperty("data")[0].GetProperty("embedding").EnumerateArray())
       {
           embedding.Add(value.GetDouble());
       }

       return embedding;
   }

   // Run a $vectorSearch query against the given embedding field
   private static List<QuantizationQueryResult> RunVectorSearchQuery(
       IMongoCollection<QuantizationEmbeddingDocument> collection,
       Expression<Func<QuantizationEmbeddingDocument, object>> path,
       string indexName,
       string dataFieldName,
       QueryVector queryVector,
       int numberOfCandidates,
       int numberOfDocuments)
   {
       var options = new VectorSearchOptions<QuantizationEmbeddingDocument>
       {
           IndexName = indexName,
           NumberOfCandidates = numberOfCandidates
       };

       var results = collection.Aggregate()
           .VectorSearch(path, queryVector, numberOfDocuments, options)
           .Project(Builders<QuantizationEmbeddingDocument>.Projection
               .Include(dataFieldName)
               .MetaVectorSearchScore("score"))
           .As<BsonDocument>()
           .ToList();

       return results.Select(document => new QuantizationQueryResult
       {
           Text = document.Contains(dataFieldName)
               ? document[dataFieldName].AsString
               : throw new InvalidOperationException($"Expected field '{dataFieldName}' not found in query result."),
           Score = document.Contains("score") ? document["score"].AsDouble : 0
       }).ToList();
   }

   ```

   Replace the `<connectionString>` and `<voyageApiKey>` placeholder values in the code, then call `RunQueriesAsync()` with the following arguments.

   | Parameter | Value |
   | --- | --- |
   | `dbName` | Name of the database in your cluster. For this example, use `sample_airbnb`. |
   | `collectionName` | Name of the collection where you ingested the data. For this example, use `listingsAndReviews`. |
   | `indexName` | Name of the MongoDB Vector Search index for the collection. |
   | `dataFieldName` | Name of the field that contains the text from which you generated embeddings. For this example, use `summary`. |
   | `queryText` | Text for the query. For this example, use `ocean view`. |
   | `numberOfCandidates` | Number of nearest neighbors to consider during the search. For this example, use `5`. |
   | `numberOfDocuments` | Number of documents to return in the results. For this example, use `2`. |

   ```shell
   Results from embeddings_float32 embeddings:
   { "text" : "A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom. Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe. The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking, snorkeling, paddle boarding, surfing are all just minutes from the front door.", "score" : 0.79996156692504883 }
   { "text" : "THIS IS A VERY SPACIOUS 1 BEDROOM FULL CONDO (SLEEPS 4) AT THE BEAUTIFUL VALLEY ISLE RESORT ON THE BEACH IN LAHAINA, MAUI!! YOU WILL LOVE THE PERFECT LOCATION OF THIS VERY NICE HIGH RISE! ALSO THIS SPACIOUS FULL CONDO, FULL KITCHEN, BIG BALCONY!!", "score" : 0.75682300329208374 }
   Results from embeddings_int8 embeddings:
   { "text" : "A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom. Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe. The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking, snorkeling, paddle boarding, surfing are all just minutes from the front door.", "score" : 0.50563144683837891 }
   { "text" : "THIS IS A VERY SPACIOUS 1 BEDROOM FULL CONDO (SLEEPS 4) AT THE BEAUTIFUL VALLEY ISLE RESORT ON THE BEACH IN LAHAINA, MAUI!! YOU WILL LOVE THE PERFECT LOCATION OF THIS VERY NICE HIGH RISE! ALSO THIS SPACIOUS FULL CONDO, FULL KITCHEN, BIG BALCONY!!", "score" : 0.50484549999237061 }
   Results from embeddings_int1 embeddings:
   { "text" : "A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom. Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe. The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking, snorkeling, paddle boarding, surfing are all just minutes from the front door.", "score" : 0.712890625 }
   { "text" : "A short distance from Honolulu's billion dollar mall, and the same distance to Waikiki. Parking included. A great location that work perfectly for business, education, or simple visit. Experience Yacht Harbor views and 5 Star Hilton Hawaiian Village.", "score" : 0.6787109375 }
   ```

   To learn more about generating embeddings and converting the embeddings to `binData` vectors, see [How to Create Vector Embeddings Manually.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

## Evaluate Your Query Results

You can measure the accuracy of your MongoDB Vector Search query by evaluating how closely the results for an ANN (Approximate Nearest Neighbor) search match the results of an ENN (Exact Nearest Neighbor) search against your quantized vectors. That is, you can compare the results of ANN (Approximate Nearest Neighbor) search with the results of ENN (Exact Nearest Neighbor) search for the same query criteria and measure how frequently the ANN (Approximate Nearest Neighbor) search results include the nearest neighbors in the results from the ENN (Exact Nearest Neighbor) search.

For a demonstration of evaluating your query results, see [How to Measure the Accuracy of Your Query Results.](https://www.mongodb.com/docs/vector-search/query/improve-accuracy.md#std-label-avs-improve-results)

Automated Embedding supports a variety of quantization methods. By default, it uses `scalar` quantization.

##### `float` Quantization

`float` quantization stores the vector embeddings as 32-bit float values. This option provides the highest accuracy, but also the highest storage and RAM costs. By default, Automated Embedding uses `dotProduct` as the similarity function for this quantization type.

##### `scalar` Quantization

The `scalar` quantization type in Automated Embedding builds index with **scalar/int8 (1 byte) vectors**, which are provided by the embedding model. For Automated Embedding, this quantization reduces the vector embedding's storage and RAM cost to about one fourth compared the `float` quantization. By default, Automated Embedding uses `cosine` as the similarity function for this quantization type. This is the default quantization type for Automated Embedding.

##### `binary` Quantization

Binary quantization in Automated Embedding builds index with binary (1 bit) vector values, but also stores full-precision vectors. The full-precision vectors are provided by the embedding model and MongoDB Vector Search quantizes them to binary during index creation.

MongoDB Vector Search rescoring involves re-ranking a subset of the top binary vector search results using their full-precision counterparts to ensure accurate search results from compressed vectors. This reduces the RAM cost to one twenty-fourth (`1/24`) compared to `float` quantization type. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

##### `binaryNoRescore` Quantization

The `binaryNoRescore` quantization type in Automated Embedding builds index with binary (1 bit) vector values, which are provided by the embedding model. Compared to `binary` (binary quantization with rescoring), this option ensures faster query and lowers storage costs, but provides lower accuracy. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

Automated Embedding supports a variety of quantization methods. By default, it uses `scalar` quantization.

##### `float` Quantization

`float` quantization stores the vector embeddings as 32-bit float values. This option provides the highest accuracy, but also the highest storage and RAM costs. By default, Automated Embedding uses `dotProduct` as the similarity function for this quantization type.

##### `scalar` Quantization

The `scalar` quantization type in Automated Embedding builds index with **scalar/int8 (1 byte) vectors**, which are provided by the embedding model. For Automated Embedding, this quantization reduces the vector embedding's storage and RAM cost to about one fourth compared the `float` quantization. By default, Automated Embedding uses `cosine` as the similarity function for this quantization type. This is the default quantization type for Automated Embedding.

##### `binary` Quantization

Binary quantization in Automated Embedding builds index with binary (1 bit) vector values, but also stores full-precision vectors. The full-precision vectors are provided by the embedding model and MongoDB Vector Search quantizes them to binary during index creation.

MongoDB Vector Search rescoring involves re-ranking a subset of the top binary vector search results using their full-precision counterparts to ensure accurate search results from compressed vectors. This reduces the RAM cost to one twenty-fourth (`1/24`) compared to `float` quantization type. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

##### `binaryNoRescore` Quantization

The `binaryNoRescore` quantization type in Automated Embedding builds index with binary (1 bit) vector values, which are provided by the embedding model. Compared to `binary` (binary quantization with rescoring), this option ensures faster query and lowers storage costs, but provides lower accuracy. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

Automated Embedding supports a variety of quantization methods. By default, it uses `scalar` quantization.

##### `float` Quantization

`float` quantization stores the vector embeddings as 32-bit float values. This option provides the highest accuracy, but also the highest storage and RAM costs. By default, Automated Embedding uses `dotProduct` as the similarity function for this quantization type.

##### `scalar` Quantization

The `scalar` quantization type in Automated Embedding builds index with **scalar/int8 (1 byte) vectors**, which are provided by the embedding model. For Automated Embedding, this quantization reduces the vector embedding's storage and RAM cost to about one fourth compared the `float` quantization. By default, Automated Embedding uses `cosine` as the similarity function for this quantization type. This is the default quantization type for Automated Embedding.

##### `binary` Quantization

Binary quantization in Automated Embedding builds index with binary (1 bit) vector values, but also stores full-precision vectors. The full-precision vectors are provided by the embedding model and MongoDB Vector Search quantizes them to binary during index creation.

MongoDB Vector Search rescoring involves re-ranking a subset of the top binary vector search results using their full-precision counterparts to ensure accurate search results from compressed vectors. This reduces the RAM cost to one twenty-fourth (`1/24`) compared to `float` quantization type. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

##### `binaryNoRescore` Quantization

The `binaryNoRescore` quantization type in Automated Embedding builds index with binary (1 bit) vector values, which are provided by the embedding model. Compared to `binary` (binary quantization with rescoring), this option ensures faster query and lowers storage costs, but provides lower accuracy. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

Automated Embedding supports a variety of quantization methods. By default, it uses `scalar` quantization.

##### `float` Quantization

`float` quantization stores the vector embeddings as 32-bit float values. This option provides the highest accuracy, but also the highest storage and RAM costs. By default, Automated Embedding uses `dotProduct` as the similarity function for this quantization type.

##### `scalar` Quantization

The `scalar` quantization type in Automated Embedding builds index with **scalar/int8 (1 byte) vectors**, which are provided by the embedding model. For Automated Embedding, this quantization reduces the vector embedding's storage and RAM cost to about one fourth compared the `float` quantization. By default, Automated Embedding uses `cosine` as the similarity function for this quantization type. This is the default quantization type for Automated Embedding.

##### `binary` Quantization

Binary quantization in Automated Embedding builds index with binary (1 bit) vector values, but also stores full-precision vectors. The full-precision vectors are provided by the embedding model and MongoDB Vector Search quantizes them to binary during index creation.

MongoDB Vector Search rescoring involves re-ranking a subset of the top binary vector search results using their full-precision counterparts to ensure accurate search results from compressed vectors. This reduces the RAM cost to one twenty-fourth (`1/24`) compared to `float` quantization type. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

##### `binaryNoRescore` Quantization

The `binaryNoRescore` quantization type in Automated Embedding builds index with binary (1 bit) vector values, which are provided by the embedding model. Compared to `binary` (binary quantization with rescoring), this option ensures faster query and lowers storage costs, but provides lower accuracy. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

Automated Embedding supports a variety of quantization methods. By default, it uses `scalar` quantization.

##### `float` Quantization

`float` quantization stores the vector embeddings as 32-bit float values. This option provides the highest accuracy, but also the highest storage and RAM costs. By default, Automated Embedding uses `dotProduct` as the similarity function for this quantization type.

##### `scalar` Quantization

The `scalar` quantization type in Automated Embedding builds index with **scalar/int8 (1 byte) vectors**, which are provided by the embedding model. For Automated Embedding, this quantization reduces the vector embedding's storage and RAM cost to about one fourth compared the `float` quantization. By default, Automated Embedding uses `cosine` as the similarity function for this quantization type. This is the default quantization type for Automated Embedding.

##### `binary` Quantization

Binary quantization in Automated Embedding builds index with binary (1 bit) vector values, but also stores full-precision vectors. The full-precision vectors are provided by the embedding model and MongoDB Vector Search quantizes them to binary during index creation.

MongoDB Vector Search rescoring involves re-ranking a subset of the top binary vector search results using their full-precision counterparts to ensure accurate search results from compressed vectors. This reduces the RAM cost to one twenty-fourth (`1/24`) compared to `float` quantization type. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

##### `binaryNoRescore` Quantization

The `binaryNoRescore` quantization type in Automated Embedding builds index with binary (1 bit) vector values, which are provided by the embedding model. Compared to `binary` (binary quantization with rescoring), this option ensures faster query and lowers storage costs, but provides lower accuracy. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

Automated Embedding supports a variety of quantization methods. By default, it uses `scalar` quantization.

##### `float` Quantization

`float` quantization stores the vector embeddings as 32-bit float values. This option provides the highest accuracy, but also the highest storage and RAM costs. By default, Automated Embedding uses `dotProduct` as the similarity function for this quantization type.

##### `scalar` Quantization

The `scalar` quantization type in Automated Embedding builds index with **scalar/int8 (1 byte) vectors**, which are provided by the embedding model. For Automated Embedding, this quantization reduces the vector embedding's storage and RAM cost to about one fourth compared the `float` quantization. By default, Automated Embedding uses `cosine` as the similarity function for this quantization type. This is the default quantization type for Automated Embedding.

##### `binary` Quantization

Binary quantization in Automated Embedding builds index with binary (1 bit) vector values, but also stores full-precision vectors. The full-precision vectors are provided by the embedding model and MongoDB Vector Search quantizes them to binary during index creation.

MongoDB Vector Search rescoring involves re-ranking a subset of the top binary vector search results using their full-precision counterparts to ensure accurate search results from compressed vectors. This reduces the RAM cost to one twenty-fourth (`1/24`) compared to `float` quantization type. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

##### `binaryNoRescore` Quantization

The `binaryNoRescore` quantization type in Automated Embedding builds index with binary (1 bit) vector values, which are provided by the embedding model. Compared to `binary` (binary quantization with rescoring), this option ensures faster query and lowers storage costs, but provides lower accuracy. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

Automated Embedding supports a variety of quantization methods. By default, it uses `scalar` quantization.

##### `float` Quantization

`float` quantization stores the vector embeddings as 32-bit float values. This option provides the highest accuracy, but also the highest storage and RAM costs. By default, Automated Embedding uses `dotProduct` as the similarity function for this quantization type.

##### `scalar` Quantization

The `scalar` quantization type in Automated Embedding builds index with **scalar/int8 (1 byte) vectors**, which are provided by the embedding model. For Automated Embedding, this quantization reduces the vector embedding's storage and RAM cost to about one fourth compared the `float` quantization. By default, Automated Embedding uses `cosine` as the similarity function for this quantization type. This is the default quantization type for Automated Embedding.

##### `binary` Quantization

Binary quantization in Automated Embedding builds index with binary (1 bit) vector values, but also stores full-precision vectors. The full-precision vectors are provided by the embedding model and MongoDB Vector Search quantizes them to binary during index creation.

MongoDB Vector Search rescoring involves re-ranking a subset of the top binary vector search results using their full-precision counterparts to ensure accurate search results from compressed vectors. This reduces the RAM cost to one twenty-fourth (`1/24`) compared to `float` quantization type. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

##### `binaryNoRescore` Quantization

The `binaryNoRescore` quantization type in Automated Embedding builds index with binary (1 bit) vector values, which are provided by the embedding model. Compared to `binary` (binary quantization with rescoring), this option ensures faster query and lowers storage costs, but provides lower accuracy. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

Automated Embedding supports a variety of quantization methods. By default, it uses `scalar` quantization.

##### `float` Quantization

`float` quantization stores the vector embeddings as 32-bit float values. This option provides the highest accuracy, but also the highest storage and RAM costs. By default, Automated Embedding uses `dotProduct` as the similarity function for this quantization type.

##### `scalar` Quantization

The `scalar` quantization type in Automated Embedding builds index with **scalar/int8 (1 byte) vectors**, which are provided by the embedding model. For Automated Embedding, this quantization reduces the vector embedding's storage and RAM cost to about one fourth compared the `float` quantization. By default, Automated Embedding uses `cosine` as the similarity function for this quantization type. This is the default quantization type for Automated Embedding.

##### `binary` Quantization

Binary quantization in Automated Embedding builds index with binary (1 bit) vector values, but also stores full-precision vectors. The full-precision vectors are provided by the embedding model and MongoDB Vector Search quantizes them to binary during index creation.

MongoDB Vector Search rescoring involves re-ranking a subset of the top binary vector search results using their full-precision counterparts to ensure accurate search results from compressed vectors. This reduces the RAM cost to one twenty-fourth (`1/24`) compared to `float` quantization type. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)

##### `binaryNoRescore` Quantization

The `binaryNoRescore` quantization type in Automated Embedding builds index with binary (1 bit) vector values, which are provided by the embedding model. Compared to `binary` (binary quantization with rescoring), this option ensures faster query and lowers storage costs, but provides lower accuracy. By default, Automated Embedding uses `euclidean` as the [similarity function.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-similarity-functions)
