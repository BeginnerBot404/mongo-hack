> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Indexes for Query Optimization

## Overview

Indexes are data structures that support the efficient execution of queries in MongoDB. They contain copies of parts of the data in documents to make queries more efficient.

Without indexes, MongoDB must scan *every* document in a collection to find the documents that match each query. These collection scans are slow and can negatively affect the performance of your application. By using an index to limit the number of documents MongoDB scans, queries can be more efficient and therefore return faster.

### Query Coverage and Performance

When you execute a query against MongoDB, your query can include three parts:

- Query criteria that specify one or more fields and values that you are looking for

- Options that affect the query's execution, such as read concern

- Projection criteria to specify the fields you want MongoDB to return (optional)

When all the fields specified in the query criteria and projection of a query are indexed, MongoDB returns results directly from the index without scanning any documents in the collection or loading them into memory.

For more information on how to ensure your index covers your query criteria and projection, see the MongoDB manual articles on [query coverage](https://www.mongodb.com/docs/manual/core/query-optimization/#read-operations-covered-query) and [index intersection.](https://www.mongodb.com/docs/manual/core/index-intersection/)

### Operational Considerations

To improve query performance, build indexes on fields that appear often in your application's queries and operations that return sorted results. Each index that you add consumes disk space and memory when active, so it might be necessary to track index memory and disk usage for capacity planning. In addition, when a write operation updates an indexed field, MongoDB also updates the related index.

For more information on designing your data model and choosing indexes appropriate for your application, see the MongoDB Server documentation on [Indexing Strategies](https://www.mongodb.com/docs/manual/applications/indexes/) and [Data Modeling and Indexes.](https://www.mongodb.com/docs/manual/core/data-model-operations/#data-model-indexes)

### List Indexes

You can use the `listIndexes()` method to list all the indexes for a collection. The [listIndexes()](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#listIndexes) method takes an optional [ListIndexesOptions](https://mongodb.github.io/node-mongodb-native/7.6/types/ListIndexesOptions.html) parameter. The `listIndexes()` method returns an object of type [ListIndexesCursor.](https://mongodb.github.io/node-mongodb-native/7.6/classes/ListIndexesCursor.html)

The following code uses the `listIndexes()` method to list all the indexes in a collection:

```javascript
// List the indexes on the collection and output them as an array
const result = await collection.listIndexes().toArray();

// Print the list of indexes
console.log("Existing indexes:\n");
for(const doc in result){
    console.log(doc);
}
```

## Index Types

MongoDB supports several different index types to support querying your data. The following sections describe the most common index types and provide sample code for creating each index type.

### Single Field Indexes

**Single field indexes** are indexes that improve performance for queries that specify ascending or descending sort order on a single field of a document.

The following example uses the `createIndex()` method to create an ascending order index on the `title` field in the `movies` collection in the `sample_mflix` database.

```js
const database = client.db("sample_mflix");
const movies = database.collection("movies");

// Create an ascending index on the "title" field in the
// "movies" collection.
const result = await movies.createIndex({ title: 1 });
console.log(`Index created: ${result}`);
```

The following is an example of a query that is covered by the index created above.

```js
// Define the query parameters
const query = { title: "Batman" }
const sort = { title: 1 };
const projection = { _id: 0, title: 1 };
// Execute the query using the defined parameters
const cursor = movies
  .find(query)
  .sort(sort)
  .project(projection);

for await (const doc of cursor) {
  console.log(doc);
}
```

To learn more, see  [Single Field Indexes.](https://www.mongodb.com/docs/manual/core/index-single/)

### Compound Indexes

**Compound indexes** are indexes that improve performance for queries that specify ascending or descending sort order for *multiple* fields of a document. You must specify the direction (ascending or descending) for each field in the index.

The following example uses the `createIndex()` method to create a compound index on the `type` and `genre` fields in the `movies` collection in the `sample_mflix` database.

```js
// Connect to the "sample_mflix" database
const database = client.db("sample_mflix");
// Access the database's "movies" collection
const movies = database.collection("movies");

// Create an ascending index on the "type" and "genre" fields
// in the "movies" collection.
const result = await movies.createIndex({ type: 1, genre: 1 });
console.log(`Index created: ${result}`);
```

The following is an example of a query that is covered by the index created above.

```js
// Define a query to find movies in the "Drama" genre
const query = { type: "movie", genre: "Drama" };
// Define sorting criteria for the query results
const sort = { type: 1, genre: 1 };
// Include only the type and genre fields in the query results
const projection = { _id: 0, type: 1, genre: 1 };

// Execute the query using the defined criteria and projection
const cursor = movies
  .find(query)
  .sort(sort)
  .project(projection);

for await (const doc of cursor) {
  console.log(doc);
}
```

To learn more, see  [Compound Indexes.](https://www.mongodb.com/docs/manual/core/index-compound/)

### Multikey Indexes (Indexes on Array Fields)

**Multikey indexes** are indexes that improve the performance of queries on fields that contain array values.

You can create a multikey index on a field with an array value by calling the `createIndex()` method. The following code creates an ascending index on the `cast` field in the `movies` collection of the `sample_mflix` database:

```js
const database = client.db("sample_mflix");
const movies = database.collection("movies");

// Create a multikey index on the "cast" field in the "movies" collection
const result = await movies.createIndex({ cast: 1 });
```

The following code queries the multikey index to find documents in which the `cast` field value contains `"Viola Davis"`:

```js
const query = { cast: "Viola Davis" };
const projection = { _id: 0, cast: 1 , title: 1 };

// Perform a find operation with the preceding filter and projection
const cursor = movies
  .find(query)
  .project(projection);

for await (const doc of cursor) {
  console.log(doc);
}
```

Multikey indexes behave differently from non-multikey indexes in terms of query coverage, index bound computation, and sort behavior. For a full explanation of multikey indexes, including a discussion of their behavior and limitations, see the [Multikey Indexes page](https://www.mongodb.com/docs/manual/core/index-multikey/) in the MongoDB Server manual.

### Clustered Indexes

**Clustered indexes** are indexes that improve the performance of insert, update, and delete operations on **clustered collections**. Clustered collections store documents ordered by the clustered index key value.

To create a clustered index, specify the `clusteredIndex` option in the `CollectionOption`. The `clusteredIndex` option must specify the `_id` field as the key and the unique field as `true`.

The following example uses the `createCollection()` method to create a clustered index on the `_id` field in the `vendors` collection of the `tea` database.

```javascript
const db = client.db('tea');
await db.createCollection('ratings', {
  clusteredIndex: {
    key: { _id: 1 },
    unique: true
  }
});
```

To learn more, see [Clustered Indexes](https://www.mongodb.com/docs/v6.0/reference/method/db.createCollection/#std-label-db.createCollection.clusteredIndex) and [Clustered Collections.](https://www.mongodb.com/docs/v6.0/core/clustered-collections/)

### Text Indexes

**Text indexes** support text queries on string content. These indexes can include any field whose value is a string or an array of string elements.

MongoDB supports text queries for various languages, so you can specify the default language as an option when creating the index. You can also specify a weight option to prioritize certain text fields in your index. These weights denote the significance of fields relative to the other indexed fields.

To learn more about text queries, see our guide on [text queries.](https://www.mongodb.com/docs/drivers/node/current/crud/query/text.md#std-label-node-fundamentals-text)

The following example uses the `createIndex()` method to perform the following actions:

- Create a `text` index on the `title` and `body` fields in the `blogPosts` collection

- Specify `english` as the default language

- Set the field weight of `body` to `10` and `title` to `3`

```js
// Get the database and collection on which to create the index 
const myDB = client.db("testDB");
const myColl = myDB.collection("blogPosts");

// Create a text index on the "title" and "body" fields
const result = await myColl.createIndex(
  { title: "text", body: "text" },
  {
     default_language: "english",
     weights: { body: 10, title: 3 }
  }
);
```

The following query uses the text index created in the preceding code:

```js
// Query for documents where body or title contain "life ahead"
const query = { $text: { $search: "life ahead" } };

// Show only the title field
const projection = { _id: 0, title: 1 };

// Execute the find operation
const cursor = myColl.find(query).project(projection);

for await (const doc of cursor) {
  console.log(doc);
}
```

To learn more about text indexes, see [Text Indexes](https://www.mongodb.com/docs/manual/core/index-text/) in the Server manual.

### Geospatial Indexes

MongoDB supports queries of geospatial coordinate data using **2dsphere
indexes**. With a 2dsphere index, you can query the geospatial data for inclusion, intersection, and proximity. For more information on querying geospatial data with the MongoDB Node.js driver, read our [Search Geospatial](https://www.mongodb.com/docs/drivers/node/current/crud/query/geo.md) guide.

To create a 2dsphere index, you must specify a field that contains only **GeoJSON objects**. For more details on this type, see the MongoDB Server manual page on [GeoJSON objects.](https://www.mongodb.com/docs/manual/reference/geojson/)

The `location.geo` field in following sample document from the `theaters` collection in the `sample_mflix` database is a GeoJSON Point object that describes the coordinates of the theater:

```json
{
   "_id" : ObjectId("59a47286cfa9a3a73e51e75c"),
   "theaterId" : 104,
   "location" : {
      "address" : {
         "street1" : "5000 W 147th St",
         "city" : "Hawthorne",
         "state" : "CA",
         "zipcode" : "90250"
      },
      "geo" : {
         "type" : "Point",
         "coordinates" : [
            -118.36559,
            33.897167
         ]
      }
   }
}
```

The following example uses the `createIndexes()` method to create a `2dsphere` index on the `location.geo` field in the `theaters` collection in the `sample_mflix` database to enable geospatial searches.

```js
const database = client.db("sample_mflix");
const movies = database.collection("movies");

/* Create a 2dsphere index on the "location.geo" field in the
"movies" collection */
const result = await movies.createIndex({ "location.geo": "2dsphere" });

// Print the result of the index creation
console.log(`Index created: ${result}`);
```

MongoDB also supports `2d` indexes for calculating distances on a Euclidean plane and for working with the "legacy coordinate pairs" syntax used in MongoDB 2.2 and earlier. To learn more, see [Geospatial Queries.](https://www.mongodb.com/docs/manual/geospatial-queries/)

### Unique Indexes

**Unique indexes** ensure that the indexed fields do not store duplicate values. By default, MongoDB creates a unique index on the `_id` field during the creation of a collection. To create a unique index, specify the field or combination of fields that you want to prevent duplication on and set the `unique` option to `true`.

The following example uses the `createIndex()` method to create a unique index on the `theaterId` field in the `theaters` collection of the `sample_mflix` database.

```js
const database = client.db("sample_mflix");
const movies = database.collection("movies");

// Create a unique index on the "theaterId" field in the "theaters" collection.
const result = await movies.createIndex({ theaterId: 1 }, { unique: true });
console.log(`Index created: ${result}`);
```

If you attempt to perform a write operation that stores a duplicate value that violates the unique index, MongoDB will throw an error that resembles the following:

```none
E11000 duplicate key error index
```

To learn more, see [Unique Indexes.](https://www.mongodb.com/docs/manual/core/index-unique/)

## MongoDB Search and MongoDB Vector Search Indexes

You can programmatically manage your MongoDB Search and MongoDB Vector Search indexes by using the Node.js driver.

The MongoDB Search feature enables you to perform full-text searches on collections hosted on MongoDB Atlas. To learn more about MongoDB Search, see the [MongoDB Search](https://www.mongodb.com/docs/atlas/atlas-search/atlas-search-overview/) documentation.

MongoDB Vector Search enables you to perform semantic searches on vector embeddings stored in Atlas. To learn more about MongoDB Vector Search, see the [MongoDB Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/) documentation.

To learn more about how to run a MongoDB Search or MongoDB Vector Search query, see the [Run a MongoDB Search Query](https://www.mongodb.com/docs/drivers/node/current/atlas-search.md#std-label-node-atlas-search) or [Run a MongoDB Vector Search Query](https://www.mongodb.com/docs/drivers/node/current/atlas-vector-search.md#std-label-node-atlas-vector-search) guide.

The following sections contain code examples that demonstrate how to manage MongoDB Search and MongoDB Vector Search indexes.

### Create a Search Index

You can use the [createSearchIndex()](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#createSearchIndex) and [createSearchIndexes()](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#createSearchIndexes) methods to create new MongoDB Search and MongoDB Vector Search indexes.

The following code shows how to use the `createSearchIndex()` method to create a MongoDB Search index called `search1`:

```javascript
// Creates a MongoDB Search index
const index1 = {
    name: "search1",
    definition: {
        "mappings": {
            "dynamic": true
        }
    }
}
await collection.createSearchIndex(index1);
```

When connecting to MongoDB Server v6.0.11 and later, you can use the driver to create a MongoDB Vector Search index by specifying `vectorSearch` in the `type` field of the index definition.

The following code shows how to use the `createSearchIndex()` method to create a MongoDB Vector Search index:

```javascript
// Creates a MongoDB Vector Search index
const vectorSearchIdx = {
    name: "vsidx1",
    type: "vectorSearch",
    definition: {
        fields: [{
            type: "vector",
            numDimensions: 384,
            path: "summary",
            similarity: "dotProduct"
        }]
    }
}

await collection.createSearchIndex(vectorSearchIdx);
```

### List Search Indexes

You can use the [listSearchIndexes()](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#listSearchIndexes) method to return a cursor that contains the MongoDB Search and MongoDB Vector Search indexes of a given collection. The `listSearchIndexes()` method takes an optional string parameter, `name`, to return only the indexes with matching names. It also takes an optional [aggregateOptions](https://mongodb.github.io/node-mongodb-native/7.6/interfaces/AggregateOptions.html) parameter.

The following code uses the `listSearchIndexes()` method to list the MongoDB Search and MongoDB Vector Search indexes in a collection:

```javascript
// Lists search indexes
const result = await collection.listSearchIndexes().toArray();
console.log("Existing search indexes:\n");
for (const doc in result) {
    console.log(doc);
}
```

### Update a Search Index

You can use the [updateSearchIndex()](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#updateSearchIndex) method to update a MongoDB Search or MongoDB Vector Search index by providing a new index definition.

The following code shows how to use the `updateSearchIndex()` method to update a MongoDB Search index called `search1` to change the type of the `description` field to a string:

```javascript
// Updates a search index
const index2 = {
    "mappings": {
        "dynamic": true,
        "fields": {
            "description": {
                "type": "string"
            }
        }
    }
}
await collection.updateSearchIndex("search1", index2);
```

### Drop a Search Index

You can use the [dropSearchIndex()](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#dropSearchIndex) method to remove a MongoDB Search or MongoDB Vector Search index.

The following code shows how to use the `dropSearchIndex()` method to remove an index called `search1`:

```javascript
// Drops (deletes) a search index
await collection.dropSearchIndex("search1");
```
