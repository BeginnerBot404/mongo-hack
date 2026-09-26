> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: javascript, typescript
-->

# Insert Documents

## Overview

In this guide, you can learn how to insert documents into MongoDB.

You can use MongoDB to retrieve, update, and delete information that is already stored in MongoDB. To store information, use an **insert operation**.

An insert operation inserts one or more documents into a MongoDB collection. The Node.js driver provides the following methods to perform insert operations:

- `insertOne()`

- `insertMany()`

- `bulkWrite()`

**Tip: Interactive Lab**

This page includes a short interactive lab that demonstrates how to insert data by using the `insertOne()` method. You can complete this lab directly in your browser window without installing MongoDB or a code editor.

To start the lab, click the Open Interactive Tutorial button at the top of the page. To expand the lab to a full-screen format, click the full-screen button (⛶) in the top-right corner of the lab pane.

The following sections focus on `insertOne()` and `insertMany()`. For an example on how to use the `bulkWrite()` method, see the [bulkWrite() Example: Full File](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-usage-bulk) section of the [Bulk Operations](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-write) guide.

## A Note About `_id`

When inserting a document, MongoDB enforces one constraint on your documents by default. Each document *must* contain a unique `_id` field.

There are two ways to manage this field:

- You can manage this field yourself, ensuring each value you use is unique.

- You can let the driver automatically generate unique `ObjectId` values with the [primary key factory.](https://www.mongodb.com/docs/drivers/node/current/crud/pkfactory.md#std-label-node-pkfactory)

Unless you have provided strong guarantees for uniqueness, we recommend you let the driver automatically generate `_id` values.

**Note:**

Duplicate `_id` values violate unique index constraints, resulting in a `WriteError`.

For more information about `_id`, see the Server manual entry on [Unique Indexes.](https://www.mongodb.com/docs/manual/core/index-unique/)

## Insert a Single Document

Use the `insertOne()` method when you want to insert a single document.

On successful insertion, the method returns an `InsertOneResult` instance representing the `_id` of the new document.

### Example

The following example uses the `insertOne()` method to insert a new document into the `myDB.pizzaMenu` collection:

```javascript
const myDB = client.db("myDB");
const myColl = myDB.collection("pizzaMenu");

const doc = { name: "Neapolitan pizza", shape: "round" };
const result = await myColl.insertOne(doc);
console.log(
   `A document was inserted with the _id: ${result.insertedId}`,
);
```

Your output looks similar to the following text:

```text
A document was inserted with the _id: 60c79c0f4cc72b6bb31e3836
```

For more information on the classes and methods mentioned in this section, see the following resources:

- API Documentation on [insertOne()](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#insertOne)

- API Documentation on [InsertOneResult](https://mongodb.github.io/node-mongodb-native/7.6/interfaces/InsertOneResult.html)

- Server manual entry on [insertOne()](https://www.mongodb.com/docs/manual/reference/method/db.collection.insertOne/)

### insertOne() Example: Full File

**Note: Example Setup**

This example connects to an instance of MongoDB by using a connection URI. To learn more about connecting to your MongoDB instance, see the [Connect to MongoDB](https://www.mongodb.com/docs/drivers/node/current/connect.md#std-label-node-connect) guide. This example also uses the `movies` collection in the `sample_mflix` database included in the [Atlas sample datasets](https://www.mongodb.com/docs/atlas/sample-data/). You can load them into your database on the free tier of MongoDB Atlas by following the [MongoDB Get Started.](https://www.mongodb.com/docs/get-started/?language=nodejs)

The following code is a complete, standalone file that performs an insert one operation:

### JavaScript

```javascript
import { MongoClient } from "mongodb";

// Replace the uri string with your MongoDB deployment's connection string.
const uri = "<connection string uri>";

// Create a new client and connect to MongoDB
const client = new MongoClient(uri);

async function run() {
  try {
    // Connect to the "sample_mflix" database and access its "movies" collection
    const database = client.db("sample_mflix");
    const movies = database.collection("movies");
    
    // Create a document to insert
    const doc = {
      title: "Charade",
      genres: ["Comedy", "Romance", "Thriller"],
      year: 1963,
      cast: ["Cary Grant", "Audrey Hepburn", "Walter Matthau"],
    }
    // Insert the defined document into the "movies" collection
    const result = await movies.insertOne(doc);

    // Print the ID of the inserted document
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } finally {
     // Close the MongoDB client connection
    await client.close();
  }
}
// Run the function and handle any errors
run().catch(console.dir);

```

Running the preceding example results in the following output:

```none
A document was inserted with the _id: ...
```

## Insert Multiple Documents

Use the `insertMany()` method when you want to insert multiple documents. This method inserts documents in the order specified until an exception occurs, if any.

For example, assume you want to insert the following documents:

```json
{ "_id": 1, "color": "red" }
{ "_id": 2, "color": "purple" }
{ "_id": 1, "color": "yellow" }
{ "_id": 3, "color": "blue" }
```

When you pass the preceding documents to the `insertMany()` method, the driver inserts the first and second documents, but throws a `WriteError` for the third document because the ID `1` is a duplicate. The driver does not insert any documents after this error.

**Note:**

Use a try-catch block to get an acknowledgment for successfully processed documents before the error occurs:

```javascript
const myDB = client.db("myDB");
const myColl = myDB.collection("colors");

try {
   const docs = [
      { "_id": 1, "color": "red"},
      { "_id": 2, "color": "purple"},
      { "_id": 1, "color": "yellow"},
      { "_id": 3, "color": "blue"}
   ];

   const insertManyresult = await myColl.insertMany(docs);
   let ids = insertManyresult.insertedIds;

   console.log(`${insertManyresult.insertedCount} documents were inserted.`);
   for (let id of Object.values(ids)) {
      console.log(`Inserted a document with id ${id}`);
   }
} catch(e) {
   console.log(`A MongoBulkWriteException occurred, but there are successfully processed documents.`);
   let ids = e.result.result.insertedIds;
   for (let id of Object.values(ids)) {
      console.log(`Processed a document with id ${id._id}`);
   }
   console.log(`Number of documents inserted: ${e.result.result.nInserted}`);
}
```

The output consists of documents MongoDB can process and looks similar to the following:

```text
A MongoBulkWriteException occurred, but there are successfully processed documents.
Processed a document with id 1
Processed a document with id 2
Processed a document with id 1
Processed a document with id 3
Number of documents inserted: 2
```

If you look inside your collection, you see the following documents:

```json
{ "_id": 1, "color": "red" }
{ "_id": 2, "color": "purple" }
```

On successful insertion, the method returns an `InsertManyResult` instance representing the number of documents inserted and the `_id` of the new document.

### Example

The following example uses the `insertMany()` method to insert three new documents into the `myDB.pizzaMenu` collection:

```javascript
const myDB = client.db("myDB");
const myColl = myDB.collection("pizzaMenu");

const docs = [
   { name: "Sicilian pizza", shape: "square" },
   { name: "New York pizza", shape: "round" },
   { name: "Grandma pizza", shape: "square" }
];

const insertManyresult = await myColl.insertMany(docs);
let ids = insertManyresult.insertedIds;

console.log(`${insertManyresult.insertedCount} documents were inserted.`);

for (let id of Object.values(ids)) {
   console.log(`Inserted a document with id ${id}`);
}
```

Your output looks similar to the following:

```text
3 documents were inserted.
Inserted a document with id 60ca09f4a40cf1d1afcd93a2
Inserted a document with id 60ca09f4a40cf1d1afcd93a3
Inserted a document with id 60ca09f4a40cf1d1afcd93a4
```

For more information on the classes and methods mentioned in this section, see the following resources:

- API Documentation on [insertMany()](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#insertMany)

- API Documentation on [InsertManyResult](https://mongodb.github.io/node-mongodb-native/7.6/interfaces/InsertManyResult.html)

- API Documentation on [PkFactory](https://mongodb.github.io/node-mongodb-native/7.6/interfaces/PkFactory.html)

- Server manual entry on [insertMany()](https://www.mongodb.com/docs/manual/reference/method/db.collection.insertMany/)

### insertMany() Example: Full File

**Note: Example Setup**

This example connects to an instance of MongoDB by using a connection URI. To learn more about connecting to your MongoDB instance, see the [Connect to MongoDB](https://www.mongodb.com/docs/drivers/node/current/connect.md#std-label-node-connect) guide. This example also uses the `movies` collection in the `sample_mflix` database included in the [Atlas sample datasets](https://www.mongodb.com/docs/atlas/sample-data/). You can load them into your database on the free tier of MongoDB Atlas by following the [MongoDB Get Started.](https://www.mongodb.com/docs/get-started/?language=nodejs)

The following code is a complete, standalone file that performs an insert many operation:

### JavaScript

```javascript
import { MongoClient } from "mongodb";

// Replace the uri string with your MongoDB deployment's connection string.
const uri = "<connection string uri>";

const client = new MongoClient(uri);

async function run() {
  try {

    // Get the database and collection on which to run the operation
    const database = client.db("sample_mflix");
    const movies = database.collection("movies");

    // Create an array of documents to insert
    const moviesToInsert = [
      { title: "Arsenic and Old Lace", genres: ["Comedy", "Romance"], year: 1944, cast: ["Cary Grant", "Priscilla Lane", "Raymond Massey"] },
      { title: "Ball of Fire", genres: ["Comedy", "Romance"], year: 1941, cast: ["Gary Cooper", "Barbara Stanwyck", "Oskar Homolka"] },
      { title: "I Married a Witch", genres: ["Comedy", "Fantasy", "Romance"], year: 1942, cast: ["Veronica Lake", "Fredric March", "Susan Hayward"] },
    ];

    // Prevent additional documents from being inserted if one fails
    const options = { ordered: true };

    // Execute insert operation
    const result = await movies.insertMany(moviesToInsert, options);
   
    // Print result
    console.log(`${result.insertedCount} documents were inserted`);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

```

Running the preceding example results in the following output:

```none
3 documents were inserted
```

## API Documentation

To learn more about any of the types or methods discussed in this guide, see the following API documentation:

- [MongoClient](https://mongodb.github.io/node-mongodb-native/7.6/classes/MongoClient.html)

- [Db](https://mongodb.github.io/node-mongodb-native/7.6/classes/Db.html)

- [Collection](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html)

- [insertOne()](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#insertOne)

- [insertMany()](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#insertMany)
