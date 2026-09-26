> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Create a MongoClient

## Overview

To connect to a MongoDB deployment, you need two things:

- **Connection URI**, also known as a *connection string*, which tells the Node.js driver which MongoDB deployment to connect to.

- **MongoClient** object, which creates the connection to and performs operations on the MongoDB deployment.

You can also use `MongoClientOptions` to customize the way the Node.js driver behaves while connected to MongoDB.

This guide shows you how to create a connection string and use a `MongoClient` object to connect to MongoDB.

## Connection URI

A standard connection string includes the following components:

| Component | Description |
| --- | --- |
| `mongodb://` | Required. A prefix that identifies this as a string in the standard connection format. |
| `username:password` | Optional. Authentication credentials. If you include these, the client authenticates the user against the database specified in `authSource`. For more information about the `authSource` connection option, see [Verify the User Is in the Authentication Database](https://www.mongodb.com/docs/drivers/node/current/connect/connection-troubleshooting.md#std-label-node-troubleshooting-connection-admin) in the Connection Troubleshooting guide. |
| `host[:port]` | Required. The host and optional port number where MongoDB is running. If you don't include the port number, the driver uses the default port, `27017`. |
| `/defaultauthdb` | Optional. The authentication database to use if the connection string includes `username:password@` authentication credentials but not the `authSource` option. When you call `client.db()` with no argument, this is the database that is used. If you don't include this component, the client authenticates the user against the `admin` database. |
| `?<options>` | Optional. A query string that specifies connection-specific options as `<name>=<value>` pairs. See [Specify Connection Options](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options.md#std-label-node-connection-options) for a full description of these options. |

For more information about creating a connection string, see [Connection Strings](https://www.mongodb.com/docs/manual/reference/connection-string/) in the MongoDB Server documentation.

## Atlas Connection Example

You must create a client to connect to a MongoDB deployment on Atlas. To create a client, construct an instance of `MongoClient`, passing in your URI and a `MongoClientOptions` object.

**Tip: Reuse Your Client**

As each `MongoClient` represents a pool of connections to the database, most applications only require a single instance of a `MongoClient`, even across multiple requests. To learn more about how connection pools work in the driver, see the [Connection Pools page.](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/connection-pools.md#std-label-node-connection-pools)

Use the `serverApi` option in your `MongoClientOptions` object to enable the Stable API feature, which forces the server to run operations with behavior compatible with the specified API version.

The following code shows how you can specify the connection string and the Stable API client option when connecting to a MongoDB deployment on Atlas and verify that the connection is successful:

```javascript
import { MongoClient, ServerApiVersion } from 'mongodb';

// Replace the placeholder with your Atlas connection string
const uri = '<connection-string>';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function runStableAPIConnect() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    const result = await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
    return result;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
runStableAPIConnect().catch(console.dir);

```

**Note:**

The Node.js driver automatically calls the `MongoClient.connect()` method when using the client to perform CRUD operations on your MongoDB deployment. Call the `MongoClient.connect()` method explicitly if you want to verify that the connection is successful.

**Tip: Explicit Resource Management**

The Node.js driver natively supports explicit resource management for `MongoClient`, `ClientSession`, `ChangeStreams`, and cursors. This feature is experimental and subject to change. To learn how to use explicit resource management, see the [v6.9 Release Notes.](https://github.com/mongodb/node-mongodb-native/releases/tag/v6.9.0)

To learn more about the Stable API feature, see the [Stable API page.](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/stable-api.md#std-label-nodejs-stable-api)

## Prevent a Slow Operation From Delaying Other Operations

When you use the same `MongoClient` instance to run multiple MongoDB operations concurrently, a slow operation can cause delays to other operations. Slow operations keep a connection to MongoDB occupied, which can cause other operations to wait until another connection becomes available.

If you suspect that slow MongoDB operations are causing delays, you can check the performance of all in-progress operations by using the following methods:

- Enable the database profiler on your deployment. To learn more, see [Database Profiler](https://www.mongodb.com/docs/manual/tutorial/manage-the-database-profiler/) in the Server manual.

- Run the `db.currentOp()` MongoDB Shell command. To learn more, see the [db.currentOp()](https://www.mongodb.com/docs/manual/reference/method/db.currentOp/) documentation in the Server manual.

- Enable connection pool monitoring. To learn more, see [Connection Pool Events.](https://www.mongodb.com/docs/drivers/node/current/monitoring-and-logging/monitoring.md#std-label-node-connection-pool-monitoring)

After you determine which operations are causing delays, try to improve the performance of these operations. Read the [Best Practices Guide for MongoDB Performance](https://www.mongodb.com/basics/best-practices?tck=docs) for possible solutions.

If you implement performance best practices but still experience delays, you can modify your connection settings to increase the size of the connection pool. A connection pool is the group of connections to the server that the driver maintains at any time.

To specify the maximum size of a connection pool, you can set the `maxPoolSize` option in the [connection options](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options.md#std-label-node-connection-options) for your `MongoClient` instance. The default value of `maxPoolSize` is `100`. If the number of in-use connections to a server reaches `maxPoolSize`, the next operation sent to the server pauses until a connection to the driver becomes available. The following code sets `maxPoolSize` to `150` when creating a new `MongoClient`:

```js
const client = new MongoClient(uri, { maxPoolSize: 150 });
```

**Tip:**

To learn more about connection pooling, see the [Connection Pool Overview](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/connection-pools.md#std-label-node-faq-connection-pool) section in the Connection Pools page.

## API Documentation

For more information about creating a `MongoClient` object with the Node.js driver, see the following API documentation:

- [MongoClient](https://mongodb.github.io/node-mongodb-native/7.6/classes/MongoClient.html)

- [MongoClientOptions](https://mongodb.github.io/node-mongodb-native/7.6/interfaces/MongoClientOptions.html)
