> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Run a MongoDB Search Query

## Overview

In this guide, you can learn how to use the Node.js driver to run [MongoDB Search](https://www.mongodb.com/docs/atlas/atlas-search/) queries on a collection. MongoDB Search enables you to perform full-text searches on collections hosted on MongoDB. MongoDB Search indexes specify the behavior of the search and which fields to index.

### Sample Data

The example in this guide uses the `movies` collection in the `sample_mflix` database from the [Atlas sample datasets](https://www.mongodb.com/docs/atlas/sample-data/). To learn how to create a free MongoDB Atlas cluster and load the sample datasets, see the [MongoDB Get Started](https://www.mongodb.com/docs/get-started/?language=nodejs) guide.

## Run a MongoDB Search Query

This section shows how to create an aggregation pipeline to run a MongoDB Search query on a collection. In your array of pipeline stages, add the `$search` stage to specify the search criteria. Then, call the `aggregate()` method and pass your pipeline array as a parameter.

**Tip:**

To learn more about aggregation operations, see the [Aggregation Operations](https://www.mongodb.com/docs/drivers/node/current/aggregation.md#std-label-node-aggregation) guide.

Before running a MongoDB Search query, you must create a MongoDB Search index on your collection. To learn how to programmatically create a MongoDB Search index, see the [MongoDB Search and MongoDB Vector Search Indexes](https://www.mongodb.com/docs/drivers/node/current/indexes.md#std-label-node-indexes-search) section of the Indexes guide.

### MongoDB Search Example

This example runs a MongoDB Search query by performing the following actions:

- Creates a `$search` stage that instructs the driver to query for documents in which the `title` field contains the word `"Alabama"`

- Creates a `$project` stage that instructs the driver to include the `title` field in the query results

- Passes the pipeline stages to the `aggregate()` method and prints the results

```java
const pipeline = [
    {
      $search: {
        index: "default", // Replace with your search index name
        text: {
          query: "Alabama",
          path: "title"
        }
      }
    },
    {
      $project: {
        title: 1
      }
    }
];

const cursor = collection.aggregate(pipeline);
for await (const document of cursor) {
  console.log(document);
}
```

**Output:**

```console
{
  _id: new ObjectId('...'),
  title: 'Alabama Moon'
}
{
  _id: new ObjectId('...'),
  title: 'Crazy in Alabama'
}
{
  _id: new ObjectId('...'),
  title: 'Sweet Home Alabama'
}
```

**Tip: Node.js Driver MongoDB Search Examples**

To view more examples that use the Node.js driver to perform Atlas Search queries, see [MongoDB Search Tutorials](https://www.mongodb.com/docs/atlas/atlas-search/tutorials/) in the Atlas documentation.

## Additional Information

To learn more about MongoDB Search, see [MongoDB Search](https://www.mongodb.com/docs/atlas/atlas-search/) in the Atlas documentation.

### API Documentation

To learn more about the `aggregate()` method, see the [API documentation.](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#aggregate)
