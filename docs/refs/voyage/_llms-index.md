# Voyage AI Documentation

> Voyage AI provides cutting-edge embedding models for retrieval-augmented generation (RAG).

Append .md to any documentation page URL to get its markdown version.

## Guides
- [Introduction](https://docs.voyageai.com/docs/introduction.md)
- [API Key and Python Client](https://docs.voyageai.com/docs/api-key-and-installation.md)
- [Quickstart Tutorial](https://docs.voyageai.com/docs/quickstart-tutorial.md)
- [Text Embeddings](https://docs.voyageai.com/docs/embeddings.md)
- [Contextualized Chunk Embeddings](https://docs.voyageai.com/docs/contextualized-chunk-embeddings.md)
- [Multimodal Embeddings](https://docs.voyageai.com/docs/multimodal-embeddings.md)
- [Rerankers](https://docs.voyageai.com/docs/reranker.md)
- [Tokenization](https://docs.voyageai.com/docs/tokenization.md)
- [Flexible Dimensions and Quantization](https://docs.voyageai.com/docs/flexible-dimensions-and-quantization.md)
- [Batch Inference](https://docs.voyageai.com/docs/batch-inference.md)
- [Error Codes](https://docs.voyageai.com/docs/error-codes.md)
- [Rate Limits](https://docs.voyageai.com/docs/rate-limits.md)
- [Pricing](https://docs.voyageai.com/docs/pricing.md)
- [Organizations and Projects](https://docs.voyageai.com/docs/organizations-and-projects.md)
- [Service Level Objectives](https://docs.voyageai.com/docs/service-level-objectives.md)
- [MongoDB Voyage AI Models in AWS](https://docs.voyageai.com/docs/aws-marketplace-mongodb-voyage.md): Deploy MongoDB Voyage AI models using AWS Marketplace
- [Voyage AI Models in AWS](https://docs.voyageai.com/docs/aws-marketplace-voyage.md): Deploy Voyage AI models using AWS Marketplace
- [MongoDB Voyage AI Models in Azure](https://docs.voyageai.com/docs/azure-marketplace-mongodb-voyage.md): Deploy MongoDB Voyage AI models using Azure Marketplace
- [Voyage AI Models in Azure](https://docs.voyageai.com/docs/azure-marketplace-voyage.md): Deploy Voyage AI models using Azure Marketplace
- [Integrations](https://docs.voyageai.com/docs/integrations-and-other-libraries.md)
- [Community SDKs](https://docs.voyageai.com/docs/community-sdks.md)
- [FAQ](https://docs.voyageai.com/docs/faq.md)
- [Contact Email](https://docs.voyageai.com/docs/contact-email.md)
- [Discord](https://docs.voyageai.com/docs/discord.md)

## API Reference
- [Text embedding models](https://docs.voyageai.com/reference/embeddings-api.md): The Voyage text embedding endpoint receives as input a string (or a list of strings) and other arguments such as the preferred model name, and returns a response containing a list of embeddings.
- [Contextualized chunk embedding models](https://docs.voyageai.com/reference/contextualized-embeddings-api.md): The Voyage contextualized chunk embedding endpoint accepts document chunks—in addition to queries and full documents—and returns a response containing contextualized chunk vector embeddings. These…
- [Multimodal embedding models](https://docs.voyageai.com/reference/multimodal-embeddings-api.md): The Voyage multimodal embedding endpoint returns vector representations for a given list of multimodal inputs consisting of text, images, or an interleaving of both modalities. <blockquote…
- [Rerankers](https://docs.voyageai.com/reference/reranker-api.md): Voyage reranker endpoint receives as input a query, a list of documents, and other arguments such as the model name, and returns a response containing the reranking results.
- [Upload file](https://docs.voyageai.com/reference/upload-file.md): Upload a file that can be used with the Batch API. The Batch API only supports `.jsonl` files with a specific required format.
- [List files](https://docs.voyageai.com/reference/list-files.md): Returns a list of files that can be optionally limited to a set of results (e.g., `limit`, `after`), ordered (e.g., `order`), and filtered (e.g., `purpose`).
- [Retrieve file](https://docs.voyageai.com/reference/retrieve-file.md): Returns information about a specific file.
- [Delete file](https://docs.voyageai.com/reference/delete-file.md): Delete a file.
- [Retrieve file content](https://docs.voyageai.com/reference/retrieve-file-content.md): Returns the contents of the specified file.
- [Bulk delete files](https://docs.voyageai.com/reference/bulk-delete-files.md): Delete one or more files at once.
- [Create batch](https://docs.voyageai.com/reference/create-batch.md): Creates and executes a batch.
- [List batches](https://docs.voyageai.com/reference/list-batches.md): List organization batches.
- [Retrieve batch](https://docs.voyageai.com/reference/retrieve-batch.md): Returns a batch.
- [Cancel batch](https://docs.voyageai.com/reference/cancel-batch.md): Cancels a batch that is currently in progress. You can only cancel batches that are in `validating` or `in_progress` status. The batch status will change to `cancelling` for up to 10 minutes before…
