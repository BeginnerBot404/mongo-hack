> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: javascript, typescript
-->

# Bulk Operations

## Overview

In this guide, you can learn how to use the Node.js driver to perform **bulk operations**. Bulk operations help reduce the number of calls to the server. Instead of sending a request for each operation, you can perform multiple operations within one action.

**Tip:**

To learn more about bulk operations, see [Bulk Write Operations](https://www.mongodb.com/docs/manual/core/bulk-write-operations/) in the MongoDB Server manual.

You can use bulk operations to perform multiple write operations on a collection. You can also run bulk operations from the client, which allows you to perform bulk writes across multiple namespaces. In MongoDB, a namespace consists of the database name and the collection name in the format `<database>.<collection>`.

**Note:**

There is no limit to the amount of [write](https://www.mongodb.com/docs/manual/reference/mql/crud-commands.md#std-label-query-and-write-commands) operations that a driver can handle. Drivers group data into batches according to the [maxWriteBatchSize](https://www.mongodb.com/docs/manual/reference/limits.md#mongodb-limit-Write-Command-Batch-Limit-Size), which is 100,000 and cannot be modified. If the batch contains more than 100,000 operations, the driver divides the batch into smaller groups with counts less than or equal to the [maxWriteBatchSize](https://www.mongodb.com/docs/manual/reference/limits.md#mongodb-limit-Write-Command-Batch-Limit-Size). For example, if the operation contains 250,000 operations, the driver creates three batches: two with 100,000 operations and one with 50,000 operations.

This guide includes the following sections:

- [Bulk Insert Operations](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-insert-operation) describes how to perform bulk insert operations on your collection or client.

- [Bulk Replace Operations](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-replace-operation) describes how to perform bulk replace operations on your collection or client.

- [Bulk Update Operations](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-update-operation) describes how to perform bulk update operations on your collection or client.

- [Bulk Delete Operations](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-delete-operation) describes how to perform bulk delete operations on your collection or client.

- [Return Type](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-return-type) describes the return object that results from your bulk write operations.

- [Handling Exceptions](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-handle-exceptions) describes the exceptions that occur if any of the operations in a bulk write operation fail.

- [Additional Information](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-addtl-info) provides links to resources and API documentation for types and methods mentioned in this guide.

**Important: Server and Driver Version Requirements**

Collection-level bulk write operations require the following versions:

- MongoDB Server version 3.2 or later

- Node.js driver version 3.6 or later

Client-level bulk write operations require the following versions:

- MongoDB Server version 8.0 or later

- Node.js driver version 6.10 or later

### Sample Data

The examples in this guide use the `movies` and `users` collections in the `sample_mflix` database, which is included in the [Atlas sample datasets](https://www.mongodb.com/docs/atlas/sample-data/). To learn how to create a free MongoDB Atlas cluster and load the sample datasets, see the [MongoDB Get Started](https://www.mongodb.com/docs/get-started/?language=nodejs) guide.

## Bulk Insert Operations

To perform a bulk insert operation, create a bulk operation model for each document you want to insert. Then, pass a list of these models to the `bulkWrite()` method.

This section describes how to perform the following types of bulk operations:

- [Collection Bulk Inserts](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-insert-collection)

- [Client Bulk Inserts](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-insert-client)

### Collection Bulk Inserts

To perform a bulk insert operation on your collection, create an `InsertOneModel` for each operation. Then, call the `bulkWrite()` method on your collection and pass an array of models as a parameter. To create an `InsertOneModel`, specify the model's `document` field and set it to the document you want to insert.

#### Example

This example performs the following actions:

1. Specifies two `InsertOneModel` instances in an array. Each `InsertOneModel` represents a document to insert into the `movies` collection in the `sample_mflix` database.

2. Calls the `bulkWrite()` method on the `movies` collection and passes an array of models as a parameter.

3. Prints the number of inserted documents.

```javascript
const insertModels = [{
    insertOne: {
        document: {
            title: "The Favourite",
            year: 2018,
            rated: "R",
            released: "2018-12-21"
        }
    }
}, {
    insertOne: {
        document: {
            title: "I, Tonya",
            year: 2017,
            rated: "R",
            released: "2017-12-08"
        }
    }
}];

const insertResult = await movies.bulkWrite(insertModels);
console.log(`Inserted documents: ${insertResult.insertedCount}`);
```

**Output:**

```console
Inserted documents: 2
```

### Client Bulk Inserts

To perform a bulk insert operation across multiple collections or databases, create a `ClientBulkWriteModel` for each operation. Then, call the `bulkWrite()` method on your client and pass an array of models as a parameter.

The following table describes the fields that you can set in a `ClientBulkWriteModel` to specify an insert operation:

| Field | Description |
| --- | --- |
| `namespace` | The namespace in which to insert a document.Type: `String` |
| `name` | The operation you want to perform. For insert operations, set this field to `"insertOne"`.Type: `String` |
| `document` | The document to insert.Type: `Document` |

#### Example

This example performs the following actions:

1. Specifies three `ClientBulkWriteModel` instances in an array. The first two models represent documents to insert into the `movies` collection, and the last model represents a document to insert into the `users` collection.

2. Calls the `bulkWrite()` method on a client and passes an array of models as a parameter.

3. Prints the number of inserted documents.

```javascript
const clientInserts = [{
    namespace: "sample_mflix.movies",
    name: "insertOne",
    document: {
        title: "The Favourite",
        year: 2018,
        rated: "R",
        released: "2018-12-21"
    }
}, {
    namespace: "sample_mflix.movies",
    name: "insertOne",
    document: {
        title: "I, Tonya",
        year: 2017,
        rated: "R",
        released: "2017-12-08"
    }
}, {
    namespace: "sample_mflix.users",
    name: "insertOne",
    document: {
        name: "Brian Schwartz",
        email: "bschwartz@example.com"
    }
}];

const clientInsertRes = await client.bulkWrite(clientInserts);
console.log(`Inserted documents: ${clientInsertRes.insertedCount}`);
```

**Output:**

```console
Inserted documents: 3
```

## Bulk Replace Operations

To perform a bulk replace operation, create a bulk operation model for each document you want to replace. Then, pass a list of these models to the `bulkWrite()` method.

This section describes how to perform the following types of bulk operations:

- [Collection Bulk Replacements](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-replace-collection)

- [Client Bulk Replacements](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-replace-client)

### Collection Bulk Replacements

To perform a bulk replace operation on your collection, create a `ReplaceOneModel` for each operation. Then, call the `bulkWrite()` method on your collection and pass an array of models as a parameter.

The following table describes the fields that you can set in a `ReplaceOneModel`:

| Field | Description |
| --- | --- |
| `filter` | The filter that matches the document you want to replace.Type: `Document` |
| `replacement` | The replacement document.Type: `Document` |
| `collation` | (Optional) The collation to use when sorting results. To learn more about collations, see the [Collation](https://www.mongodb.com/docs/drivers/node/current/crud/configure.md#std-label-node-collations) section of the [Configure CRUD Operations](https://www.mongodb.com/docs/drivers/node/current/crud/configure.md#std-label-node-configure) guide.Type: `String` or `Object` |
| `hint` | (Optional) The index to use for the operation. To learn more about indexes, see the [Indexes for Query Optimization](https://www.mongodb.com/docs/drivers/node/current/indexes.md#std-label-node-fundamentals-indexes) guide.Type: `Bson` |
| `upsert` | (Optional) Whether a new document is created if no document matches the filter.By default, this field is set to `false`.Type: `Boolean` |

#### Example

This example performs the following actions:

1. Specifies two `ReplaceOneModel` instances in an array. The `ReplaceOneModel` instances contain instructions to replace documents representing movies in the `movies` collection.

2. Calls the `bulkWrite()` method on the `movies` collection and passes an array of models as a parameter.

3. Prints the number of modified documents.

```javascript
const replaceOperations = [{
    replaceOne: {
        filter: {
            title: "The Dark Knight"
        },
        replacement: {
            title: "The Dark Knight Rises",
            year: 2012,
            rating: "PG-13"
        },
        upsert: false
    }
}, {
    replaceOne: {
        filter: {
            title: "Inception"
        },
        replacement: {
            title: "Inception Reloaded",
            year: 2010,
            rating: "PG-13"
        },
        upsert: false
    }
}];

const replaceResult = await movies.bulkWrite(replaceOperations);
console.log(`Modified documents: ${replaceResult.modifiedCount}`);
```

**Output:**

```console
Modified documents: 2
```

### Client Bulk Replacements

To perform a bulk replace operation across multiple collections or databases, create a `ClientBulkWriteModel` for each operation. Then, call the `bulkWrite()` method on your client and pass an array of models as a parameter.

The following table describes the fields that you can set in a `ClientBulkWriteModel` to specify a replace operation:

| Field | Description |
| --- | --- |
| `namespace` | The namespace in which to replace a document.Type: `String` |
| `name` | The operation you want to perform. For replace operations, set this field to `"replaceOne"`.Type: `String` |
| `filter` | The filter that matches the document you want to replace.Type: `Document` |
| `replacement` | The replacement document.Type: `Document` |
| `collation` | (Optional) The collation to use when sorting results. To learn more about collations, see the [Collation](https://www.mongodb.com/docs/drivers/node/current/crud/configure.md#std-label-node-collations) section of the [Configure CRUD Operations](https://www.mongodb.com/docs/drivers/node/current/crud/configure.md#std-label-node-configure) guide.Type: `String` or `Object` |
| `hint` | (Optional) The index to use for the operation. To learn more about indexes, see the [Indexes for Query Optimization](https://www.mongodb.com/docs/drivers/node/current/indexes.md#std-label-node-fundamentals-indexes) guide.Type: `Bson` |

#### Example

This example performs the following actions:

1. Specifies three `ClientBulkWriteModel` instances in an array. The first two models contain replacement instructions for documents in the `movies` collection, and the last model contains replacement instructions for a document in the `users` collection.

2. Calls the `bulkWrite()` method on a client and passes an array of models as a parameter.

3. Prints the number of modified documents.

```javascript
const clientReplacements = [{
    namespace: "sample_mflix.movies",
    name: "replaceOne",
    filter: {
        title: "The Dark Knight"
    },
    replacement: {
        title: "The Dark Knight Rises",
        year: 2012,
        rating: "PG-13"
    }
}, {
    namespace: "sample_mflix.movies",
    name: "replaceOne",
    filter: {
        title: "Inception"
    },
    replacement: {
        title: "Inception Reloaded",
        year: 2010,
        rating: "PG-13"
    }
}, {
    namespace: "sample_mflix.users",
    name: "replaceOne",
    filter: {
        name: "April Cole"
    },
    replacement: {
        name: "April Franklin",
        email: "aprilfrank@example.com"
    }
}];

const clientReplaceRes = await client.bulkWrite(clientReplacements);
console.log(`Modified documents: ${clientReplaceRes.modifiedCount}`);
```

**Output:**

```console
Modified documents: 3
```

## Bulk Update Operations

To perform a bulk update operation, create a bulk operation model for each update you want to make. Then, pass a list of these models to the `bulkWrite()` method.

This section describes how to perform the following types of bulk operations:

- [Collection Bulk Updates](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-update-collection)

- [Client Bulk Updates](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-update-client)

### Collection Bulk Updates

To perform a bulk update operation on your collection, create an `UpdateOneModel` or `UpdateManyModel` for each operation. Then, call the `bulkWrite()` method on your collection and pass an array of models as a parameter. An `UpdateOneModel` updates only one document that matches a filter, while an `UpdateManyModel` updates all documents that match a filter.

The following table describes the fields you can set in an `UpdateOneModel` or `UpdateManyModel`:

| Field | Description |
| --- | --- |
| `filter` | The filter that matches one or more documents you want to update. When specified in an `UpdateOneModel`, only the first matching document will be updated. When specified in an `UpdateManyModel`, all matching documents will be updated.Type: `Document` |
| `update` | The update to perform.Type: `Document` |
| `arrayFilters` | (Optional) A set of filters specifying which array elements an update applies to if you are updating an array-valued field.Type: `Array` |
| `collation` | (Optional) The collation to use when sorting results. To learn more about collations, see the [Collation](https://www.mongodb.com/docs/drivers/node/current/crud/configure.md#std-label-node-collations) section of the [Configure CRUD Operations](https://www.mongodb.com/docs/drivers/node/current/crud/configure.md#std-label-node-configure) guide.Type: `Object` |
| `hint` | (Optional) The index to use for the operation. To learn more about indexes, see the [Indexes for Query Optimization](https://www.mongodb.com/docs/drivers/node/current/indexes.md#std-label-node-fundamentals-indexes) guide.Type: `String or Object` |
| `upsert` | (Optional) Whether a new document is created if no document matches the filter. By default, this field is set to `false`.Type: `Boolean` |

#### Example

This example performs the following actions:

1. Specifies an `UpdateOneModel` and an `UpdateManyModel` instance in an array. These models contain instructions to update documents representing movies in the `movies` collection.

2. Calls the `bulkWrite()` method on the `movies` collection and passes an array of models as a parameter.

3. Prints the number of modified documents.

```javascript
const updateOperations = [{
    updateOne: {
        filter: {
            title: "Interstellar"
        },
        update: {
            $set: {
                title: "Interstellar Updated",
                genre: "Sci-Fi Adventure"
            }
        },
        upsert: true
    }
}, {
    updateMany: {
        filter: {
            rated: "PG-13"
        },
        update: {
            $set: {
                rated: "PG-13 Updated",
                genre: "Updated Genre"
            }
        }
    }
}];

const updateResult = await movies.bulkWrite(updateOperations);
console.log(`Modified documents: ${updateResult.modifiedCount}`);
```

**Output:**

```console
Modified documents: 2320
```

### Client Bulk Updates

To perform a bulk update operation across multiple collections or databases, create a `ClientBulkWriteModel` for each operation. Then, call the `bulkWrite()` method on your client and pass an array of models as a parameter.

The following table describes the fields you can set in a `ClientBulkWriteModel` to specify an update operation:

| Field | Description |
| --- | --- |
| `namespace` | The namespace in which to update a document.Type: `String` |
| `name` | The operation you want to perform. For update operations, set this field to `"updateOne"` or `"updateMany"`.Type: `String` |
| `filter` | The filter that matches one or more documents you want to update. If you set the model `name` to `"updateOne"`, only the first matching document is updated. If you set `name` to `"updateMany"`, all matching documents are updated.Type: `Document` |
| `update` | The updates to perform.Type: `Document` or `Document[]` |
| `arrayFilters` | (Optional) A set of filters specifying which array elements an update applies to if you are updating an array-valued field.Type: `Document[]` |
| `collation` | (Optional) The collation to use when sorting results. To learn more about collations, see the [Collation](https://www.mongodb.com/docs/drivers/node/current/crud/configure.md#std-label-node-collations) section of the [Configure CRUD Operations](https://www.mongodb.com/docs/drivers/node/current/crud/configure.md#std-label-node-configure) guide.Type: `Document` |
| `hint` | (Optional) The index to use for the operation. To learn more about indexes, see the [Indexes for Query Optimization](https://www.mongodb.com/docs/drivers/node/current/indexes.md#std-label-node-fundamentals-indexes) guide.Type: `Document` or `String` |
| `upsert` | (Optional) Whether a new document is created if no document matches the filter. By default, this field is set to `false`.Type: `Boolean` |

#### Example

This example performs the following actions:

1. Specifies two `ClientBulkWriteModel` instances in an array. The first model specifies an update many operation on the `movies` collection, and the second model specifies an update one operation on the `users` collection.

2. Calls the `bulkWrite()` method on a client and passes an array of models as a parameter.

3. Prints the number of modified documents.

```javascript
const clientUpdates = [{
    namespace: "sample_mflix.movies",
    name: "updateMany",
    filter: {
        rated: "PG-13"
    },
    update: {
        $set: {
            rated: "PG-13 Updated",
            genre: "Updated Genre"
        }
    },
    upsert: false
}, {
    namespace: "sample_mflix.users",
    name: "updateOne",
    filter: {
        name: "Jon Snow"
    },
    update: {
        $set: {
            name: "Aegon Targaryen",
            email: "targaryen@example.com"
        }
    },
    upsert: false
}];
const clientUpdateRes = await client.bulkWrite(clientUpdates);
console.log(`Modified documents: ${clientUpdateRes.modifiedCount}`);
```

**Output:**

```console
Modified documents: 2320
```

## Bulk Delete Operations

To perform a bulk delete operation, create a bulk operation model for each delete operation. Then, pass a list of these models to the `bulkWrite()` method.

This section describes how to perform the following types of bulk operations:

- [Collection Bulk Deletes](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-delete-collection)

- [Client Bulk Deletes](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-delete-client)

### Collection Bulk Deletes

To perform a bulk delete operation on your collection, create a `DeleteOneModel` or `DeleteManyModel` for each operation. Then, call the `bulkWrite()` method on your collection and pass an array of models as a parameter.  A `DeleteOneModel` deletes only one document that matches a filter, while a `DeleteManyModel` deletes all documents that match a filter.

The following table describes the fields you can set in a `DeleteOneModel` or `DeleteManyModel`:

| Field | Description |
| --- | --- |
| `filter` | The filter that matches one or more documents you want to delete. When specified in a `DeleteOneModel`, only the first matching document will be deleted. When specified in a `DeleteManyModel`, all matching documents will be deleted.Type: `Document` |
| `collation` | (Optional) The collation to use when sorting results. To learn more about collations, see the [Collation](https://www.mongodb.com/docs/drivers/node/current/crud/configure.md#std-label-node-collations) section of the [Configure CRUD Operations](https://www.mongodb.com/docs/drivers/node/current/crud/configure.md#std-label-node-configure) guide.Type: `Object` |
| `hint` | (Optional) The index to use for the operation. To learn more about indexes, see the [Indexes for Query Optimization](https://www.mongodb.com/docs/drivers/node/current/indexes.md#std-label-node-fundamentals-indexes) guide.Type: `String or Object` |

#### Example

This example performs the following actions:

1. Specifies a `DeleteOneModel` and a `DeleteManyModel` instance in an array. These models contain instructions to delete documents in the `movies` collection.

2. Calls the `bulkWrite()` method on the `movies` collection and passes an array of models as a parameter.

3. Prints the number of deleted documents.

```javascript
const deleteOperations = [{
    deleteOne: {
        filter: {
            title: "Dunkirk"
        }
    }
}, {
    deleteMany: {
        filter: {
            rated: "R"
        }
    }
}];

const deleteResult = await movies.bulkWrite(deleteOperations);
console.log(`Deleted documents: ${deleteResult.deletedCount}`);
```

**Output:**

```console
Deleted documents: 5538
```

### Client Bulk Deletes

To perform a bulk delete operation across multiple collections or databases, create a `ClientBulkWriteModel` for each operation. Then, call the `bulkWrite()` method on your client and pass an array of models as a parameter.

The following table describes the fields you can set in a `ClientBulkWriteModel` to specify a delete operation:

| Field | Description |
| --- | --- |
| `namespace` | The namespace in which to delete a document.Type: `String` |
| `name` | The operation you want to perform. For delete operations, set this field to `"deleteOne"` or `"deleteMany"`.Type: `String` |
| `filter` | The filter that matches one or more documents you want to delete. If you set the model `name` to `"deleteOne"`, only the first matching document is deleted. If you set `name` to `"deleteMany"`, all matching documents are deleted.Type: `Document` |
| `hint` | (Optional) The index to use for the operation. To learn more about indexes, see the [Indexes for Query Optimization](https://www.mongodb.com/docs/drivers/node/current/indexes.md#std-label-node-fundamentals-indexes) guide.Type: `Document` or `String` |
| `collation` | (Optional) The collation to use when sorting results. To learn more about collations, see the [Collation](https://www.mongodb.com/docs/drivers/node/current/crud/configure.md#std-label-node-collations) section of the [Configure CRUD Operations](https://www.mongodb.com/docs/drivers/node/current/crud/configure.md#std-label-node-configure) guide.Type: `Document` |

#### Example

This example performs the following actions:

1. Specifies two `ClientBulkWriteModel` instances in an array. The first model specifies a delete many operation on the `movies` collection, and the second model specifies a delete one operation on the `users` collection.

2. Calls the `bulkWrite()` method on a client and passes an array of models as a parameter.

3. Prints the number of modified documents.

```javascript
const clientDeletes = [{
    namespace: "sample_mflix.movies",
    name: "deleteMany",
    filter: {
        rated: "R"
    }
}, {
    namespace: "sample_mflix.users",
    name: "deleteOne",
    filter: {
        email: "emilia_clarke@gameofthron.es"
    }
}];

const clientDeleteRes = await client.bulkWrite(clientDeletes);
console.log(`Deleted documents: ${clientDeleteRes.deletedCount}`);
```

**Output:**

```console
Deleted documents: 5538
```

## Return Type

### BulkWriteResult

The `Collection.bulkWrite()` method returns a `BulkWriteResult` object, which provides information about your bulk operation.

The following tables describes the fields of a `BulkWriteResult` object:

| Field | Description |
| --- | --- |
| `insertedCount` | The number of inserted documents |
| `matchedCount` | The number of matched documents |
| `modifiedCount` | The number of updated documents |
| `upsertedCount` | The number of upserted documents |
| `deletedCount` | The number of deleted documents |

### ClientBulkWriteResult

The `MongoClient.bulkWrite()` method returns a `ClientBulkWriteResult` object, which includes information about the client bulk write operation.

The following tables describes the fields of a `ClientBulkWriteResult` object:

| Field | Description |
| --- | --- |
| `acknowledged` | A boolean value indicating whether the bulk write was acknowledged |
| `insertedCount` | The number of inserted documents |
| `matchedCount` | The number of matched documents |
| `modifiedCount` | The number of updated documents |
| `upsertedCount` | The number of upserted documents |
| `deletedCount` | The number of deleted documents |
| `insertResults` | The results of each individual successful insert operation |
| `updateResults` | The results of each individual successful update operation |
| `deleteResults` | The results of each individual successful delete operation |

## Handling Exceptions

### Collection Bulk Write Exceptions

If any bulk write operations called on a collection are unsuccessful, the Node.js driver throws a `MongoBulkWriteError` and does not perform any further operations if the `ordered` option is set to `true`. If `ordered` is set to `false`, it will attempt to continue with subsequent operations.

**Tip:**

To learn more about ordered and unordered bulk operations, see the [Ordered vs Unordered Operations](https://www.mongodb.com/docs/manual/core/bulk-write-operations/#ordered-vs-unordered-operations) section in the Bulk Write guide from the MongoDB Server manual.

A `MongoBulkWriteError` object contains the following properties:

| Property | Description |
| --- | --- |
| `message` | The error message.Type: `String` |
| `writeErrors` | An array of errors that occurred during the bulk write operation.Type: `BulkWriteError[]` |
| `writeConcernErrors` | Write concern errors that occurred during execution of the bulk write operation.Type: `WriteConnectionError[]` |
| `result` | The results of any successful operations performed before the exception was thrown.Type: `BulkWriteResult[]` |
| `err` | The underlying error object, which may contain more details.Type: `Error` |

### Client Bulk Write Exceptions

If any bulk write operations called on your client are unsuccessful, the Node.js driver generates a `MongoClientBulkWriteError`. By default, the driver does not perform any subsequent operations after encountering an error. If you pass the `ordered` option to the `bulkWrite()` method and set it to `false`, the driver continues to attempt the remaining operations.

A `MongoClientBulkWriteError` object contains the following properties:

| Property | Description |
| --- | --- |
| `writeConcernErrors` | An array of documents specifying each write concern error.Type: `Document[]` |
| `writeErrors` | An map of errors that occurred during individual write operations.Type: `Map<number, ClientBulkWriteError>` |
| `partialResult` | The partial result of the client bulk write that reflects the operation's progress before the error.Type: `ClientBulkWriteResult` |

## bulkWrite() Example: Full File

**Note: Example Setup**

This example connects to an instance of MongoDB by using a connection URI. To learn more about connecting to your MongoDB instance, see the [Connect to MongoDB](https://www.mongodb.com/docs/drivers/node/current/connect.md#std-label-node-connect) guide. This example also uses the `movies` collection in the `sample_mflix` database included in the [Atlas sample datasets](https://www.mongodb.com/docs/atlas/sample-data/). You can load them into your database on the free tier of MongoDB Atlas by following the [MongoDB Get Started.](https://www.mongodb.com/docs/get-started/?language=nodejs)

The following code is a complete, standalone file that performs a bulk write operation on the `theaters` collection in the `sample_mflix` database. The `operations` parameter includes examples of `insertOne`, `updateMany`, and `deleteOne` write operations:

### JavaScript

```javascript
// Bulk write operation

// Import MongoClient from the MongoDB node driver package
const { MongoClient } = require("mongodb");

// Replace the uri string with your MongoDB deployment's connection string
const uri = "<connection string uri>";

const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db("sample_mflix");
    const theaters = database.collection("theaters");

    // Insert a new document into the "theaters" collection
    const result = await theaters.bulkWrite([
      {
        insertOne: {
          document: {
            location: {
              address: {
                street1: "3 Main St.",
                city: "Anchorage",
                state: "AK",
                zipcode: "99501",
              },
            },
          },
        },
      },
      {
        insertOne: {
          document: {
            location: {
              address: {
                street1: "75 Penn Plaza",
                city: "New York",
                state: "NY",
                zipcode: "10001",
              },
            },
          },
        },
      },
      {
        // Update documents that match the specified filter
        updateMany: {
          filter: { "location.address.zipcode": "44011" },
          update: { $set: { is_in_ohio: true } },
          upsert: true,
        },
      },
      {
        // Delete a document that matches the specified filter
        deleteOne: { filter: { "location.address.street1": "221b Baker St" } },
      },
    ]);
    // Log the result of the bulk write operation 
    console.log(result);
  } finally {
    // Close the database connection when the operations are completed or if an error occurs
    await client.close();
  }
}
run().catch(console.dir);

```

Running the preceding example results in the following output:

```javascript
BulkWriteResult {
  insertedCount: 2,
  matchedCount: 1,
  modifiedCount: 1,
  deletedCount: 0,
  upsertedCount: 0,
  upsertedIds: {},
  insertedIds: {
    '0': new ObjectId("..."),
    '1': new ObjectId("...")
  }
}
```

## Additional Information

To learn more about bulk operations, see [Bulk Write Operations](https://www.mongodb.com/docs/manual/core/bulk-write-operations/) in the MongoDB Server manual.

### API Documentation

To learn more about any of the methods or types discussed in this guide, see the following API documentation:

- [Collection.bulkWrite()](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#bulkWrite)

- [MongoClient.bulkWrite()](https://mongodb.github.io/node-mongodb-native/7.6/classes/MongoClient.html#bulkWrite)

- [BulkWriteResult](https://mongodb.github.io/node-mongodb-native/7.6/classes/BulkWriteResult.html)

- [ClientBulkWriteResult](https://mongodb.github.io/node-mongodb-native/7.6/interfaces/ClientBulkWriteResult.html)

- [ClientBulkWriteModel](https://mongodb.github.io/node-mongodb-native/7.6/types/ClientBulkWriteModel.html)

- [InsertOneModel](https://mongodb.github.io/node-mongodb-native/7.6/classes/OrderedBulkOperation.html#insert)

- [InsertOne](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#insertOne)

- [ReplaceOne](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#replaceOne)

- [ReplaceOneModel](https://mongodb.github.io/node-mongodb-native/7.6/interfaces/ReplaceOneModel.html)

- [UpdateOne](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#updateOne)

- [UpdateMany](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#updateMany)

- [UpdateOneModel](https://mongodb.github.io/node-mongodb-native/7.6/interfaces/UpdateOneModel.html)

- [DeleteOne](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#deleteOne)

- [DeleteMany](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#deleteMany)

- [DeleteOneModel](https://mongodb.github.io/node-mongodb-native/7.6/interfaces/DeleteOneModel.html)
