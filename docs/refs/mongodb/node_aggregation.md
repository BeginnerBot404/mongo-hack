> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Aggregation Operations

## Overview

In this guide, you can learn how to use the MongoDB Node.js driver to perform **aggregation operations**.

Aggregation operations process data in your MongoDB collections and return computed results. The MongoDB Aggregation framework is modeled on the concept of data processing pipelines. Documents enter a pipeline comprised of one or more stages, and this pipeline transforms the documents into an aggregated result.

To learn more about the aggregation stages supported by the Node.js driver, see [Aggregation Pipeline Stages.](https://www.mongodb.com/docs/drivers/node/current/aggregation/pipeline-stages.md#std-label-node-aggregation-pipeline-stages)

**Tip: Complete Aggregation Tutorials**

You can find tutorials that provide detailed explanations of common aggregation tasks in the [Complete Aggregation Pipeline Tutorials](https://www.mongodb.com/docs/manual/tutorial/aggregation-complete-examples/) section of the Server manual. Select a tutorial, and then pick Node.js from the Select your language drop-down menu in the upper-right corner of the page.

### Analogy

The aggregation pipeline is similar to an automobile factory assembly line. An assembly line has stations with specialized tools that are used to perform specific tasks. For example, when building a car, the assembly line begins with a frame. As the car frame moves though the assembly line, each station assembles a separate part. The result is a transformed final product, the finished car.

The *aggregation pipeline* is the assembly line, the *aggregation stages* are the assembly stations, the *expression operators* are the specialized tools, and the *aggregated result* is the finished product.

## Compare Aggregation and Find Operations

The following table lists the different tasks you can perform with find operations compared to what you can achieve with aggregation operations. The aggregation framework provides expanded functionality that allows you to transform and manipulate your data.

| Find Operations | Aggregation Operations |
| --- | --- |
| Select *certain* documents to returnSelect *which* fields to returnSort the resultsLimit the resultsCount the results | Select *certain* documents to returnSelect *which* fields to returnSort the resultsLimit the resultsCount the resultsGroup the resultsRename fieldsCompute new fieldsSummarize dataConnect and merge data sets |

## Server Limitations

Consider the following [limitations](https://www.mongodb.com/docs/manual/core/aggregation-pipeline-limits/) when performing aggregation operations:

- Returned documents must not violate the [BSON document size limit](https://www.mongodb.com/docs/manual/reference/limits/#mongodb-limit-BSON-Document-Size) of 16 megabytes.

- Pipeline stages have a memory limit of 100 megabytes by default. If required, you can exceed this limit by enabling the [AllowDiskUse](https://mongodb.github.io/node-mongodb-native/6.17/interfaces/AggregateOptions.html#allowDiskUse) property of the `AggregateOptions` object that you pass to the `aggregate()` method.

## Additional information

For a full list of aggregation stages, see [Aggregation Stages](https://www.mongodb.com/docs/manual/reference/mql/aggregation-stages/#std-label-aggregation-pipeline-operator-reference) in the MongoDB Server manual.

To learn about explaining MongoDB aggregation operations, see [Explain Results](https://www.mongodb.com/docs/manual/reference/explain-results/) and [Query Plans](https://www.mongodb.com/docs/manual/core/query-plans/) in the MongoDB Server manual.
