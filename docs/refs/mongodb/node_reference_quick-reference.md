> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Quick Reference

This page shows the driver syntax for several MongoDB commands and links to their related reference and API documentation.

## Compatibility

You can use the Node.js driver to connect and execute commands for deployments hosted in the following environments:

- [MongoDB Atlas](https://www.mongodb.com/docs/atlas): The fully managed service for MongoDB deployments in the cloud

- [MongoDB Enterprise](https://www.mongodb.com/docs/manual/administration/install-enterprise.md#std-label-install-mdb-enterprise): The subscription-based, self-managed version of MongoDB

- [MongoDB Community](https://www.mongodb.com/docs/manual/administration/install-community.md#std-label-install-mdb-community-edition): The source-available, free-to-use, and self-managed version of MongoDB

To learn more about performing common CRUD operations in the Atlas UI for deployments hosted in MongoDB Atlas, see [Create, View, Update, and Delete Documents](https://www.mongodb.com/docs/atlas/atlas-ui/documents/).

| Command | Syntax |
| --- | --- |
| **Find a Document**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#findOne)[Find Documents Guide](https://www.mongodb.com/docs/drivers/node/current/crud/query/retrieve.md#std-label-node-find) | `await coll.findOne({ title: 'Hamlet' });` **Output:** `{ title: 'Hamlet', type: 'movie', ... }` |
| **Find Multiple Documents**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#find)[Find Documents Guide](https://www.mongodb.com/docs/drivers/node/current/crud/query/retrieve.md#std-label-node-find) | `coll.find({ year: 2005 });` **Output:** `[
  { title: 'Christmas in Boston', year: 2005, ... },
  { title: 'Chicken Little', year: 2005, ... },
  ...
]` |
| **Insert a Document**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#insert)[Insert Documents Guide](https://www.mongodb.com/docs/drivers/node/current/crud/insert.md#std-label-node-insert) | `await coll.insertOne({ title: 'Jackie Robinson' });` |
| **Insert Multiple Documents**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#insertMany)[Insert Documents Guide](https://www.mongodb.com/docs/drivers/node/current/crud/insert.md#std-label-node-insert) | `await coll.insertMany([
  { title: 'Dangal', rating: 'Not Rated' },
  { title: 'The Boss Baby', rating: 'PG' }
 ]);` |
| **Update a Document**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#update)[Update Documents Guide](https://www.mongodb.com/docs/drivers/node/current/crud/update.md#std-label-node-update) | `await coll.updateOne(
  { title: 'Amadeus' },
  { $set: { 'imdb.rating': 9.5 } }
);` **Output:** `{ title: 'Amadeus', imdb: { rating: 9.5, ... } }` |
| **Update Multiple Documents**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#updateMany)[Update Documents Guide](https://www.mongodb.com/docs/drivers/node/current/crud/update.md#std-label-node-update) | `await coll.updateMany(
  { year: 2001 },
  { $inc: { 'imdb.votes': 100 } }
);` **Output:** `[
  { title: 'A Beautiful Mind', year: 2001, imdb: { votes: 826257, ... },
  { title: 'Shaolin Soccer', year: 2001, imdb: { votes: 65442, ... },
  ...
]` |
| **Update Arrays in Documents**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#update)[Update Arrays in a Document Guide](https://www.mongodb.com/docs/drivers/node/current/crud/update/embedded-arrays.md#std-label-node-update-arrays) | `await coll.updateOne(
  { title: 'Cosmos' },
  { $push: { genres: 'Educational' } }
):` **Output:** `{ title: 'Cosmos', genres: [ 'Documentary', 'Educational' ] }` |
| **Replace a Document**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#replaceOne)[Replace Documents Guide](https://www.mongodb.com/docs/drivers/node/current/crud/update/replace.md#std-label-node-replace) | `await coll.replaceOne(
  { name: 'Deli Llama', address: '2 Nassau St' },
  { name: 'Lord of the Wings', zipcode: 10001 }
);` **Output:** `{ name: 'Lord of the Wings', zipcode: 10001 }` |
| **Delete a Document**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#deleteOne)[Delete Documents Guide](https://www.mongodb.com/docs/drivers/node/current/crud/delete.md#std-label-node-delete) | `await coll.deleteOne({ title: 'Congo' });` |
| **Delete Multiple Documents**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#deleteMany)[Delete Documents Guide](https://www.mongodb.com/docs/drivers/node/current/crud/delete.md#std-label-node-delete) | `await coll.deleteMany({ title: { $regex: /^Shark.*/ } });` |
| **Bulk Write**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#bulkWrite)[Bulk Operations Guide](https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write.md#std-label-node-bulk-write) | `await coll.bulkWrite([
  {
    insertOne: {
      document: {
        title: 'A New Movie',
        year: 2022
      }
    }
  },
  {
    deleteMany: {
      filter: { year: { $lt: 1970 } }
    }
  }
]);` **Output:** `BulkWriteResult {
  result: {
    ...
  },
  ...
}` |
| **Watch for Changes**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#watch)[Monitor Data with Change Streams Guide](https://www.mongodb.com/docs/drivers/node/current/monitoring-and-logging/change-streams.md#std-label-node-change-streams) | `coll.watch([ { $match: { year: { $gte: 2022 } } } ]);` |
| **Access Data from a Cursor Iteratively**[Access Data from a Cursor Guide](https://www.mongodb.com/docs/drivers/node/current/crud/query/cursor.md#std-label-node-cursor) | `const cursor = coll.find();
for await (const doc of cursor) {
   console.dir(doc);
}` **Output:** `[
  { title: '2001: A Space Odyssey', ... },
  { title: 'The Sound of Music', ... },
  ...
]` |
| **Access Data from a Cursor as an Array**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/FindCursor.html#toArray)[Access Data from a Cursor Guide](https://www.mongodb.com/docs/drivers/node/current/crud/query/cursor.md#std-label-node-cursor) | `const cursor = coll.find();
const results = await cursor.toArray();` **Output:** `[
  { title: '2001: A Space Odyssey', ... },
  { title: 'The Sound of Music', ... },
  ...
]` |
| **Count Documents**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#countDocuments)[Count Documents Guide](https://www.mongodb.com/docs/drivers/node/current/crud/query/count.md#std-label-node-count) | `await coll.countDocuments({ year: 2000 });` **Output:** `618` |
| **List the Distinct Documents or Field Values**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#distinct)[Retrieve Distinct Values Guide](https://www.mongodb.com/docs/drivers/node/current/crud/query/distinct.md#std-label-node-distinct) | `await coll.distinct('year');` **Output:** `[ 1891, 1893, 1894, 1896, 1903, ... ]` |
| **Limit the Number of Documents Retrieved**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/FindCursor.html#limit)[Limit Documents Reference](https://www.mongodb.com/docs/drivers/node/current/crud/query/specify-documents-to-return.md#std-label-node-fundamentals-limit) | `coll.find().limit(2);` **Output:** `[
  { title: 'My Neighbor Totoro', ... },
  { title: 'Amélie', ... }
]` |
| **Skip Retrieved Documents**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/FindCursor.html#skip)[Skip Documents Reference](https://www.mongodb.com/docs/drivers/node/current/crud/query/specify-documents-to-return.md#std-label-node-fundamentals-skip) | `coll.find({ title: { $regex: /^Rocky/} }, { skip: 2 });` **Output:** `[
  { title: 'Rocky III', ... },
  { title: 'Rocky IV', ... },
  { title: 'Rocky V'}, ... }
]` |
| **Sort the Documents When Retrieving Them**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/FindCursor.html#sort)[Sort Documents Reference](https://www.mongodb.com/docs/drivers/node/current/crud/query/specify-documents-to-return.md#std-label-node-fundamentals-sort) | `coll.find().sort({ year: 1});` **Output:** `[
  { title: 'Newark Athlete', year: 1891, ... },
  { title: 'Blacksmith Scene', year: 1893, ...},
  { title: 'Dickson Experimental Sound Film', year: 1894},
  ...
]` |
| **Project Document Fields When Retrieving Them**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/FindCursor.html#project)[Specify Which Fields to Return Guide](https://www.mongodb.com/docs/drivers/node/current/crud/query/project.md#std-label-node-project) | `coll.find().project({ _id: 0, year: 1, imdb: 1 });` **Output:** `[
  { year: 2012, imdb: { rating: 5.8, votes: 230, id: 8256 }},
  { year: 1985, imdb: { rating: 7.0, votes: 447, id: 1654 }},
  ...
]` |
| **Create an Index**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#createIndex)[Indexes Guide](https://www.mongodb.com/docs/drivers/node/current/indexes.md#std-label-node-fundamentals-indexes) | `await coll.createIndex({ title: 1, year: -1 });` |
| **Query Text**[API Documentation](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#find)[Query Text Guide](https://www.mongodb.com/docs/drivers/node/current/crud/query/text.md#std-label-node-search-text) | `// only searches fields with text indexes
coll.find({ $text: { $search: 'zissou' } });` **Output:** `[
  { title: 'The Life Aquatic with Steve Zissou', ... }
]` |
| **Install the Driver Dependency** | `"dependencies": {
  "mongodb": "^7.6",
  ...
}` |
