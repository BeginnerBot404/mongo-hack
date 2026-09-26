> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Run a MongoDB Vector Search Query

## Overview

In this guide, you can learn how to use the MongoDB Vector Search feature in the Node.js driver.

You can use MongoDB Vector Search to perform a vector search on your data stored in MongoDB. Vector search allows you to query your data based on semantic meaning rather than just keyword matches, which helps you retrieve more relevant search results. It enables your AI-powered applications to support use cases such as semantic search, hybrid search, and generative search, including Retrieval-Augmented Generation (RAG).

To learn more about MongoDB Vector Search, see the [MongoDB Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/) guides in the MongoDB Atlas documentation.

**Important: Feature Compatibility**

To learn what versions of MongoDB Atlas support this feature, see [Limitations](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/#limitations) in the MongoDB Atlas documentation.

## Perform a Vector Search

To use this feature, you must create a vector search index and index your vector embeddings. To learn about how to programmatically create a vector search index, see the [MongoDB Search and MongoDB Vector Search Indexes](https://www.mongodb.com/docs/drivers/node/current/indexes.md#std-label-node-indexes-search) section in the Indexes guide. To learn more about vector embeddings, see [How to Create Vector Embeddings](https://www.mongodb.com/docs/atlas/atlas-vector-search/create-embeddings/) in the Atlas documentation.

After you create a vector search index on your vector embeddings, you can reference this index in your pipeline stage, as shown in the following example.

### Sample Data

The example on this page shows how to build an aggregation pipeline that uses the `$vectorSearch` stage to perform a vector search on the `sample_mflix.embedded_movies` collection in the [Atlas sample datasets.](https://www.mongodb.com/docs/atlas/sample-data/)

To learn how to create a free MongoDB Atlas cluster and load the sample datasets, see the [MongoDB Get Started](https://www.mongodb.com/docs/get-started/?language=nodejs) guide.

### Vector Search Example

You can perform a vector search query by using the `$vectorSearch` stage in an [aggregation pipeline](https://www.mongodb.com/docs/drivers/node/current/aggregation.md#std-label-node-aggregation). To perform a vector search on a collection, you must first have a collection with a field that contains vector embeddings and a vector search index that covers that field.

In the following example, the aggregation pipeline searches the `plot`  field of each document in the collection for text semantically related to the term "time travel". The `queryVector` field in the `$vectorSearch` pipeline is the vector representation of your query.

```javascript
const { MongoClient } = require("mongodb");

// Replace with the connection string to your Atlas cluster to connect
const uri = "<connection-string>";

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();

        // Sets the namespace
        const database = client.db("sample_mflix");
        const coll = database.collection("embedded_movies");

        // Defines the pipeline
        const agg = [
            {
              '$vectorSearch': {
                'index': 'vector_index',
                'path': 'plot_embedding',
                'queryVector': Binary.fromFloat32Array(Float32Array.from([
                  -0.0016261312, -0.028070757, -0.011342932,  /* ...embedding floats truncated by snapshot... */ -0.009710136
                ])),
                'numCandidates': 150,
                'limit': 10
              }
            }, {
              '$project': {
                '_id': 0,
                'plot': 1,
                'title': 1,
                'score': {
                  '$meta': 'vectorSearchScore'
                }
              }
            }
          ];
        // Runs pipeline
        const result = coll.aggregate(agg);

        // Prints results
        for await (const doc of result) {
            console.log(doc);
        }
    }   finally {
            await client.close();
    }
}
run().catch(console.dir);


```

**Output:**

```javascript
{
   plot: 'A reporter, learning of time travelers visiting 20th century disasters, tries to change the history they know by averting upcoming disasters.',
   title: 'Thrill Seekers',
   score: 0.9259490966796875
}
{
   plot: 'At the age of 21, Tim discovers he can travel in time and change what happens and has happened in his own life. His decision to make his world a better place by getting a girlfriend turns out not to be as easy as you might think.',
   title: 'About Time',
   score: 0.9253997802734375
}
{
   plot: 'An officer for a security agency that regulates time travel, must fend for his life against a shady politician who has a tie to his past.',
   title: 'Timecop',
   score: 0.922332763671875
}
{
   plot: "After using his mother's newly built time machine, Dolf gets stuck
   involuntary in the year 1212. He ends up in a children's crusade where he confronts
   his new friends with modern techniques...",
   title: 'Crusade in Jeans',
   score: 0.92205810546875
}
{
   plot: 'Hoping to alter the events of the past, a 19th century inventor instead travels 800,000 years into the future, where he finds humankind divided into two warring races.',
   title: 'The Time Machine',
   score: 0.921875
}
{
   plot: 'A time-travel experiment in which a robot probe is sent from the year 2073 to the year 1973 goes terribly wrong thrusting one of the project scientists, a man named Nicholas Sinclair into a...',
   title: 'A.P.E.X.',
   score: 0.9202728271484375
}
{
   plot: "Agent J travels in time to M.I.B.'s early days in 1969 to stop an alien from assassinating his friend Agent K and changing history.",
   title: 'Men in Black 3',
   score: 0.9198150634765625
}
{
   plot: 'Bound by a shared destiny, a teen bursting with scientific curiosity and a former boy-genius inventor embark on a mission to unearth the secrets of a place somewhere in time and space that exists in their collective memory.',
   title: 'Tomorrowland',
   score: 0.91961669921875
}
{
   plot: 'A romantic drama about a Chicago librarian with a gene that causes him to involuntarily time travel, and the complications it creates for his marriage.',
   title: "The Time Traveler's Wife",
   score: 0.9174346923828125
}
{
   plot: 'With the help of his uncle, a man travels to the future to try and bring his girlfriend back to life.',
   title: 'Love Story 2050',
   score: 0.9165191650390625
}
```

This query uses the `$vectorSearch` stage to:

- Perform an Approximate Nearest Neighbor (ANN) vector search

- Search for the specified term in the `plot_embedding` field

- Set the number of nearest neighbors used in the search to 150 by using the `numCandidates` option

- Return a maximum of 10 documents from the query using the `limit` option

It uses the `$project` stage to:

- Only include the movie `plot` and `title` fields in the results

- Add a `score` field to show the relevance of each result to the search term

## Additional Information

To see more MongoDB Vector Search tutorials for the Node.js driver, see the [MongoDB Vector Search tutorials](https://www.mongodb.com/docs/atlas/atlas-vector-search/tutorials/) in the Atlas documentation.

To learn more about the syntax of the `$vectorSearch` pipeline stage, see the Syntax and Fields sections of the [Create and Run Queries](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/#syntax) guide in the MongoDB Vector Search section of the Atlas documentation.

### API Documentation

To learn more about the `aggregate()` method, see [aggregate()](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#aggregate) in the API documentation.
