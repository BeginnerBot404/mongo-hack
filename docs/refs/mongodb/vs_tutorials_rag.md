> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: cloud, local, maven, gradle
-->

# Retrieval-Augmented Generation (RAG) with MongoDB

Retrieval-augmented generation (RAG) is an architecture used to augment large language models (LLMs) with additional data so that they can generate more accurate responses. You can implement RAG (Retrieval-Augmented Generation) in your generative AI applications by combining an LLM with a retrieval system powered by MongoDB Vector Search.

## Get Started

To quickly try RAG with MongoDB Vector Search, use the [Chatbot Demo Builder](https://search-playground.mongodb.com/tools/chatbot-demo-builder/snapshots/new) in the MongoDB Search Playground. To learn more, see [Chatbot Demo Builder in Search Playground.](https://www.mongodb.com/docs/vector-search/query/vector-search-playground.md#std-label-avs-playground)

To implement your own RAG system with MongoDB Vector Search, see the [tutorial](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-basic-rag-example) on this page.

## Why use RAG?

When working with LLMs, you might encounter the following limitations:

- Stale data: LLMs are trained on a static dataset up to a certain point in time. This means that they have a limited knowledge base and might use outdated data.

- No access to additional data: LLMs don't have access to local, personalized, or domain-specific data. Therefore, they can lack knowledge about specific domains.

- Hallucinations: When grounded in incomplete or outdated data, LLMs can generate inaccurate responses.

You can address these limitations by taking the following steps to implement RAG (Retrieval-Augmented Generation):

1. **Ingestion:** Store your custom data as vector embeddings in a vector database, such as MongoDB. This allows you to create a knowledge base of up-to-date and personalized data.

2. **Retrieval:** Retrieve semantically similar documents from the database based on the user's question by using a search solution, such as MongoDB Vector Search. These documents augment the LLM with additional, relevant data.

3. **Generation:** Prompt the LLM. The LLM uses the retrieved documents as context to generate a more accurate and relevant response, reducing hallucinations.

RAG is an effective architecture for building AI chatbots, as it enables AI systems to provide personalized, domain-specific responses. To create production-ready chatbots, configure a server to route requests and build a user interface on top of your RAG (Retrieval-Augmented Generation) implementation.

## RAG with MongoDB Vector Search

To implement RAG (Retrieval-Augmented Generation) with MongoDB Vector Search, you ingest data into MongoDB, retrieve documents with MongoDB Vector Search, and generate responses using an LLM. This section describes the components of a basic, or naive, RAG (Retrieval-Augmented Generation) implementation with MongoDB Vector Search. For step-by-step instructions, see [Tutorial.](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-basic-rag-example)

![RAG flowchart with MongoDB Vector Search](/images/rag/rag-flowchart.png)

### Learn by Watching

#### Watch a video that demonstrates how to implement RAG with MongoDB Vector Search.

*Duration: 5 Minutes*

### Ingestion

Data ingestion for RAG (Retrieval-Augmented Generation) involves processing your custom data and storing it in a vector database to prepare it for retrieval. To create a basic ingestion pipeline with MongoDB as the vector database, do the following:

1. Prepare your data.

   Load, process, and [chunk](https://www.mongodb.com/developer/products/atlas/choosing-chunking-strategy-rag/?tck=docs), your data to prepare it for your RAG (Retrieval-Augmented Generation) application. Chunking involves splitting your data into smaller parts for optimal retrieval.

2. Convert the data to vector embeddings.

   Convert your data into vector embeddings by using an [embedding model](https://www.mongodb.com/docs/vector-search/index.md#std-term-embedding-model). You can automatically generate embeddings by using [Automated Embedding](https://www.mongodb.com/docs/vector-search/crud-embeddings/automated-embedding.md#std-label-avs-auto-embeddings) or manually generate embeddings by using an [embedding model.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-create-vector-embeddings)

3. Store the data and embeddings in MongoDB.

   For Automated Embedding, MongoDB Vector Search stores the embeddings in a [dedicated internal database](https://www.mongodb.com/docs/vector-search/crud-embeddings/automated-embedding/overview.md#std-label-auto-embed-materialized-views). For manually created embedding, you store the embedding as a field alongside other data in your collection on your cluster.

### Retrieval

Building a retrieval system involves searching for and returning the most relevant documents from your vector database to augment the LLM with. To retrieve relevant documents with MongoDB Vector Search, you convert the user's question into vector embeddings and run a [vector search query](https://www.mongodb.com/docs/vector-search/index.md#std-label-avs-queries) against the data in your MongoDB collection to find documents with the most similar embeddings.

To perform basic retrieval with MongoDB Vector Search, do the following:

1. Define an [MongoDB Vector Search index](https://www.mongodb.com/docs/vector-search/index.md#std-label-avs-indexes) on the collection that contains your vector embeddings.

2. Choose one of the following methods to retrieve documents based on the user's question:

   - Use an [MongoDB Vector Search integration](https://www.mongodb.com/docs/atlas/ai-integrations.md#std-label-ai-integrations) with a popular framework or service. These integrations include built-in libraries and tools that enable you to easily build retrieval systems with MongoDB Vector Search.

   - Build your own retrieval system. You can define your own functions and pipelines to run [MongoDB Vector Search queries](https://www.mongodb.com/docs/vector-search/index.md#std-label-avs-queries) specific to your use case.

     To learn how to build a basic retrieval system with MongoDB Vector Search, see [Tutorial.](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-basic-rag-example)

### Generation

To generate responses, combine your retrieval system with an LLM. After you perform a vector search to retrieve relevant documents, you provide the user's question along with the relevant documents as context to the LLM so that it can generate a more accurate response.

Choose one of the following methods to connect to an LLM:

- Use an [MongoDB Vector Search integration](https://www.mongodb.com/docs/atlas/ai-integrations.md#std-label-ai-integrations) with a popular framework or service. These integrations include built-in libraries and tools to help you connect to LLMs with minimal set-up.

- Call the LLM's API. Most AI providers offer APIs to their generative models that you can use to generate responses.

- Load an open-source LLM. If you don't have API keys or credits, you can use an open-source LLM by loading it locally from your application. For an example implementation, see the [Build a Local RAG Implementation with MongoDB Vector Search](https://www.mongodb.com/docs/vector-search/tutorials/local-rag.md#std-label-local-rag) tutorial.

## Tutorial

The following example demonstrates how to implement RAG (Retrieval-Augmented Generation) with a retrieval system powered by MongoDB Vector Search. Select your preferred embedding model, LLM, and programming language to get started:

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/blob/main/use-cases/rag.ipynb)

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/blob/main/use-cases/rag.ipynb)

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/blob/main/use-cases/rag.ipynb)

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/blob/main/use-cases/rag.ipynb)

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/blob/main/use-cases/rag.ipynb)

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/blob/main/use-cases/rag.ipynb)

### Prerequisites

To complete this example, you must have the following:

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- An environment to run interactive Python notebooks such as [Colab.](https://colab.research.google.com)

* One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

* A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

* An environment to run interactive Python notebooks such as [Colab.](https://colab.research.google.com)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

- An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- An environment to run interactive Python notebooks such as [Colab.](https://colab.research.google.com)

* One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

* An environment to run interactive Python notebooks such as [Colab.](https://colab.research.google.com)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- A terminal and code editor to run your Node.js project.

- [npm and Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

* One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

* A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

* A terminal and code editor to run your Node.js project.

* [npm and Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

- An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- A terminal and code editor to run your Node.js project.

- [npm and Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

* One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

* A terminal and code editor to run your Node.js project.

* [npm and Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- A terminal and code editor to run your Go project.

- [Go](https://go.dev/doc/install) installed.

* One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

* An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

* A terminal and code editor to run your Go project.

* [Go](https://go.dev/doc/install) installed.

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- A Java IDE such as [IntelliJ IDEA](https://www.jetbrains.com/idea/) or [Eclipse.](https://www.eclipse.org/downloads/)

- [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) version 8 or later.

* One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

* An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

* A Java IDE such as [IntelliJ IDEA](https://www.jetbrains.com/idea/) or [Eclipse.](https://www.eclipse.org/downloads/)

* [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) version 8 or later.

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- A terminal and code editor to run your .NET project.

- [.NET SDK](https://dotnet.microsoft.com/download) version 6.0 or later.

* One of the following MongoDB cluster types:

  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 8.2 or later.

    Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

* An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

* An environment to run interactive Python notebooks such as [Colab.](https://colab.research.google.com)

- One of the following MongoDB cluster types:

  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 8.2 or later.

    Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

- An environment to run interactive Python notebooks such as [Colab.](https://colab.research.google.com)

### Procedure

1. Set up the environment.

   Create an interactive Python notebook by saving a file with the `.ipynb` extension. This notebook allows you to run Python code snippets individually. In your notebook, run the following code to install the dependencies for this tutorial:

   ```shell
   pip install --quiet --upgrade pymongo voyageai openai langchain langchain_community pypdf
   ```

   Then, run the following code to set the environment variables for this tutorial, replacing the placeholders with your API keys.

   ```python
   import os

   os.environ["VOYAGE_API_KEY"] = "<voyage-api-key>"
   os.environ["OPENAI_API_KEY"] = "<openai-api-key>"
   ```

2. Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to. Paste and run each of the following code snippets in your notebook:

   Define a function to generate vector embeddings.

   Paste and run the following code in your notebook to create a function named `get_embedding()` that generates vector embeddings by using an embedding model from [Voyage AI](https://www.voyageai.com). Replace `<api-key>` with your [Voyage API key.](https://docs.voyageai.com/docs/api-key-and-installation)

   The function specifies the following:

   - `voyage-4-large` as the embedding model to use.

   - `input_type` parameter to optimize your embeddings for retrieval. To learn more, see [Voyage AI Python Client.](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-python-client)

   **Tip:**

   For all models and parameters, see [Voyage AI Text Embeddings.](https://www.mongodb.com/docs/voyageai/models/text-embeddings.md#std-label-voyage-text-embeddings)

   ```python
   import voyageai

   # Specify the embedding model
   model = "voyage-3-large"
   vo = voyageai.Client()

   # Define a function to generate embeddings
   def get_embedding(data, input_type="document"):
       embeddings = vo.embed(data, model=model, input_type=input_type).embeddings
       return embeddings[0]



   ```

   Load and split the data.

   Run this code to load and split sample data by using the [LangChain integration](https://www.mongodb.com/docs/atlas/ai-integrations/langchain.md#std-label-langchain). Specifically, this code does the following:

   - Loads a PDF that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236/pdf)

   - Splits the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   ```python
   from langchain_community.document_loaders import PyPDFLoader
   from langchain_text_splitters import RecursiveCharacterTextSplitter

   # Load the PDF
   loader = PyPDFLoader("https://investors.mongodb.com/node/12236/pdf")
   data = loader.load()

   # Split the data into chunks
   text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=20)
   documents = text_splitter.split_documents(data)
   ```

   Store the data and embeddings in MongoDB.

   Run the following code to connect to your MongoDB deployment. Before running the code, replace `<connection-string>` with your MongoDB connection string.

   ```python
   from pymongo import MongoClient

   # Connect to your MongoDB deployment
   client = MongoClient("<connection-string>")
   collection = client["rag_db"]["test"]
   ```

   Then, run the following code to prepare the chunked documents and insert them into the `rag_db.test` collection:

   ```python
   # Prepare documents for insertion
   docs_to_insert = [
       {
           "text": doc.page_content,
           "embedding": get_embedding(doc.page_content),
       }
       for doc in documents
   ]

   result = collection.insert_many(docs_to_insert)

   ```

   **Tip:**

   After you run the code, if you're using Atlas, you can verify your vector embeddings by navigating to the `rag_db.test` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

3. Use MongoDB Vector Search to retrieve documents.

   In this section, you create a [retrieval](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) system using MongoDB Vector Search to get relevant documents from your vector database. Paste and run each of the following code snippets in your notebook:

   Create a MongoDB Vector Search index on your vector embeddings.

   Run the following code to create the index directly from your application with the [PyMongo Driver](https://www.mongodb.com/docs/drivers/pymongo/). This code also includes a polling mechanism to check if the index is ready to use.

   To learn more, see [How to Index Fields for Vector Search.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search)

   ```python
   from pymongo.operations import SearchIndexModel
   import time
   # Create your index model, then create the search index
   index_name = "vector_index"
   search_index_model = SearchIndexModel(
       definition={
           "fields": [
               {
                   "type": "vector",
                   "numDimensions": 1024,
                   "path": "embedding",
                   "similarity": "cosine",
               }
           ]
       },
       name=index_name,
       type="vectorSearch",
   )
   collection.create_search_index(model=search_index_model)

   # Wait for initial sync to complete
   print("Polling to check if the index is ready. This may take up to a minute.")
   predicate = None
   if predicate is None:
       predicate = lambda index: index.get("queryable") is True

   while True:
       indices = list(collection.list_search_indexes(index_name))
       if len(indices) and predicate(indices[0]):
           break
       time.sleep(5)
   print(index_name + " is ready for querying.")

   ```

   Define a function to run vector search queries.

   Run this code to create a retrieval function called `get_query_results()` that runs a basic vector search query. It uses the `get_embedding()` function to create embeddings from the search query. Then, it runs the query to return semantically similar documents.

   To learn more, see [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   ```python
   # Define a function to run vector search queries
   def get_query_results(query):
       """Gets results from a vector search query."""

       query_embedding = get_embedding(query, input_type="query")
       pipeline = [
           {
               "$vectorSearch": {
                   "index": "vector_index",
                   "queryVector": query_embedding,
                   "path": "embedding",
                   "exact": True,
                   "limit": 5,
               }
           },
           {"$project": {"_id": 0, "text": 1}},
       ]

       results = collection.aggregate(pipeline)

       array_of_results = []
       for doc in results:
           array_of_results.append(doc)
       return array_of_results


   ```

4. Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context. This code does the following:

   - Uses the `get_query_results()` function you defined to retrieve relevant documents from your collection.

   - Creates a prompt using the user's question and retrieved documents as context.

   - Prompts the LLM about MongoDB's latest AI announcements. The generated response might vary.

   Run the following code to specify a search query and retrieve relevant documents:

   ```python
   from openai import OpenAI

   # Specify search query and retrieve relevant documents
   query = "What are MongoDB's latest AI announcements?"
   context_docs = get_query_results(query)
   ```

   Then, run the following code to generate a response from the LLM:

   ```python
   # Convert the retrieved documents to a string
   context_string = " ".join([doc["text"] for doc in context_docs])

   # Construct prompt for the LLM using the retrieved documents as the context
   prompt = f"""Use the following pieces of context to answer the question at the end.
       {context_string}
       Question: {query}
   """

   openai_client = OpenAI()

   # OpenAI model to use
   model_name = "gpt-4o"

   completion = openai_client.chat.completions.create(
       model=model_name,
       messages=[{"role": "user", "content": prompt}],
   )
   print(completion.choices[0].message.content)

   ```

   ```none
   MongoDB recently announced several developments in its AI ecosystem. 
   These include the MongoDB AI Applications Program (MAAP), which offers 
   reference architectures, pre-built partner integrations, and professional
   services to help customers efficiently build AI-powered applications. 
   Accenture is the first global systems integrator to join MAAP and will 
   establish a center of excellence for MongoDB projects. Additionally, 
   MongoDB introduced significant updates, including faster performance 
   in version 8.0 and the general availability of Atlas Stream Processing 
   to enable real-time, event-driven applications. These advancements 
   highlight MongoDB's focus on supporting AI-powered applications and 
   modernizing legacy workloads.
   ```

1) Set up the environment.

   Create an interactive Python notebook by saving a file with the `.ipynb` extension. This notebook allows you to run Python code snippets individually. In your notebook, run the following code to install the dependencies for this tutorial:

   ```shell
   pip install --quiet --upgrade pymongo voyageai huggingface_hub einops langchain langchain_community pypdf
   ```

   Then, run the following code to set the environment variables for this tutorial, replacing the placeholders with your API keys.

   ```python
   import os

   os.environ["VOYAGE_API_KEY"] = "<voyage-api-key>"
   os.environ["HF_TOKEN"] = "<hf-token>"
   ```

2) Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to. Paste and run each of the following code snippets in your notebook:

   Define a function to generate vector embeddings.

   Paste and run the following code in your notebook to create a function named `get_embedding()` that generates vector embeddings by using an embedding model from [Voyage AI](https://www.voyageai.com). Replace `<api-key>` with your [Voyage API key.](https://docs.voyageai.com/docs/api-key-and-installation)

   The function specifies the following:

   - `voyage-4-large` as the embedding model to use.

   - `input_type` parameter to optimize your embeddings for retrieval. To learn more, see [Voyage AI Python Client.](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-python-client)

   **Tip:**

   For all models and parameters, see [Voyage AI Text Embeddings.](https://www.mongodb.com/docs/voyageai/models/text-embeddings.md#std-label-voyage-text-embeddings)

   ```python
   import os
   import voyageai

   # Specify the embedding model
   model = "voyage-3-large"
   vo = voyageai.Client()

   # Define a function to generate embeddings
   def get_embedding(data, input_type = "document"):
     embeddings = vo.embed(
         data, model = model, input_type = input_type
     ).embeddings
     return embeddings[0]
   ```

   Load and split the data.

   Run this code to load and split sample data by using the [LangChain integration](https://www.mongodb.com/docs/atlas/ai-integrations/langchain.md#std-label-langchain). Specifically, this code does the following:

   - Loads a PDF that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236/pdf)

   - Splits the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   ```python
   from langchain_community.document_loaders import PyPDFLoader
   from langchain_text_splitters import RecursiveCharacterTextSplitter

   # Load the PDF
   loader = PyPDFLoader("https://investors.mongodb.com/node/12236/pdf")
   data = loader.load()

   # Split the data into chunks
   text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=20)
   documents = text_splitter.split_documents(data)
   ```

   Convert the data to vector embeddings.

   Run this code to prepare the chunked documents for ingestion by creating a list of documents with their corresponding vector embeddings. You generate these embeddings by using the `get_embedding()` function that you just defined.

   ```python
   # Prepare documents for insertion
   docs_to_insert = [{
       "text": doc.page_content,
       "embedding": get_embedding(doc.page_content)
   } for doc in documents]
   ```

   Store the data and embeddings in MongoDB.

   Run this code to insert the documents containing the embeddings into the `rag_db.test` collection. Before running the code, replace `<connection-string>` with your MongoDB connection string.

   ```python
   from pymongo import MongoClient

   # Connect to your MongoDB deployment
   client = MongoClient("<connection-string>")
   collection = client["rag_db"]["test"]

   # Insert documents into the collection
   result = collection.insert_many(docs_to_insert)
   ```

   **Tip:**

   After you run the code, if you're using Atlas, you can verify your vector embeddings by navigating to the `rag_db.test` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

3) Use MongoDB Vector Search to retrieve documents.

   In this section, you create a [retrieval](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) system using MongoDB Vector Search to get relevant documents from your vector database. Paste and run each of the following code snippets in your notebook:

   Create a MongoDB Vector Search index on your vector embeddings.

   Run the following code to create the index directly from your application with the [PyMongo Driver](https://www.mongodb.com/docs/drivers/pymongo/). This code also includes a polling mechanism to check if the index is ready to use.

   To learn more, see [How to Index Fields for Vector Search.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search)

   ```python
   from pymongo.operations import SearchIndexModel
   import time

   # Create your index model, then create the search index
   index_name="vector_index"
   search_index_model = SearchIndexModel(
     definition = {
       "fields": [
         {
           "type": "vector",
           "numDimensions": 1024,
           "path": "embedding",
           "similarity": "cosine"
         }
       ]
     },
     name = index_name,
     type = "vectorSearch"
   )
   collection.create_search_index(model=search_index_model)

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
   print(index_name + " is ready for querying.")
   ```

   Define a function to run vector search queries.

   Run this code to create a retrieval function called `get_query_results()` that runs a basic vector search query. It uses the `get_embedding()` function to create embeddings from the search query. Then, it runs the query to return semantically similar documents.

   To learn more, see [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   ```python
   # Define a function to run vector search queries
   def get_query_results(query):
     """Gets results from a vector search query."""

     query_embedding = get_embedding(query, input_type="query")
     pipeline = [
         {
               "$vectorSearch": {
                 "index": "vector_index",
                 "queryVector": query_embedding,
                 "path": "embedding",
                 "exact": True,
                 "limit": 5
               }
         }, {
               "$project": {
                 "_id": 0,
                 "text": 1
            }
         }
     ]

     results = collection.aggregate(pipeline)

     array_of_results = []
     for doc in results:
         array_of_results.append(doc)
     return array_of_results

   # Test the function with a sample query
   import pprint
   pprint.pprint(get_query_results("AI technology"))
   ```

   **Output:**

   ```text
   [{'text': 'more of our customers. We also see a tremendous opportunity to win '
             'more legacy workloads, as AI has now become a catalyst to modernize '
             'these\n'
             "applications. MongoDB's  document-based architecture is "
             'particularly well-suited for the variety and scale of data required '
             'by AI-powered applications.'},
    {'text': 'artificial intelligence, in our offerings or partnerships; the '
             'growth and expansion of the market for database products and our '
             'ability to penetrate that\n'
             'market; our ability to integrate acquired businesses and '
             'technologies successfully or achieve the expected benefits of such '
             'acquisitions; our ability to'},
    {'text': 'MongoDB  continues to expand its AI ecosystem with the announcement '
             'of the MongoDB AI Applications Program (MAAP),'},
    {'text': 'which provides customers with reference architectures, pre-built '
             'partner integrations, and professional services to help\n'
             'them quickly build AI-powered applications. Accenture will '
             'establish a center of excellence focused on MongoDB  projects,\n'
             'and is the first global systems integrator to join MAAP.'},
    {'text': 'Bendigo and Adelaide Bank partnered with MongoDB  to modernize '
             'their core banking technology. With the help of\n'
             'MongoDB Relational Migrator and generative AI-powered modernization '
             'tools, Bendigo and Adelaide Bank decomposed an\n'
             'outdated consumer-servicing application into microservices and '
             'migrated off its underlying legacy relational database'}]
   ```

4) Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context. This code does the following:

   - Uses the `get_query_results()` function you defined to retrieve relevant documents from your collection.

   - Creates a prompt using the user's question and retrieved documents as context.

   - Prompts the LLM about MongoDB's latest AI announcements. The generated response might vary.

   ```python
   from huggingface_hub import InferenceClient

   # Specify search query, retrieve relevant documents, and convert to string
   query = "What are MongoDB's latest AI announcements?"
   context_docs = get_query_results(query)
   context_string = " ".join([doc["text"] for doc in context_docs])

   # Construct prompt for the LLM using the retrieved documents as the context
   prompt = f"""Use the following pieces of context to answer the question at the end.
       {context_string}
       Question: {query}
   """

   # Use a model from Hugging Face
   llm = InferenceClient(
       "mistralai/Mixtral-8x22B-Instruct-v0.1",
       provider = "fireworks-ai",
       token = os.getenv("HF_TOKEN"))

   # Prompt the LLM (this code varies depending on the model you use)
   output = llm.chat_completion(
       messages=[{"role": "user", "content": prompt}],
       max_tokens=150
   )
   print(output.choices[0].message.content)
   ```

   **Output:**

   ```text
   MongoDB's latest AI announcements include the
   MongoDB AI Applications Program (MAAP), a program designed
   to help customers build AI-powered applications more efficiently.
   Additionally, they have announced significant performance
   improvements in MongoDB 8.0, featuring faster reads, updates,
   bulk inserts, and time series queries. Another announcement is the
   general availability of Atlas Stream Processing to build sophisticated,
   event-driven applications with real-time data.
   ```

1. Set up the environment.

   Create an interactive Python notebook by saving a file with the `.ipynb` extension. This notebook allows you to run Python code snippets individually. In your notebook, run the following code to install the dependencies for this tutorial:

   ```shell
   pip install --quiet --upgrade pymongo sentence_transformers openai einops langchain langchain_community pypdf
   ```

   Then, run the following code to set the environment variables for this tutorial, replacing the placeholders with your API keys.

   ```python
   import os

   os.environ["OPENAI_API_KEY"] = "<openai-api-key>"
   ```

2. Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to. Paste and run each of the following code snippets in your notebook:

   Define a function to generate vector embeddings.

   Paste and run the following code in your notebook to create a function named `get_embedding()` that generates vector embeddings by using the [nomic-embed-text-v1](https://huggingface.co/nomic-ai/nomic-embed-text-v1) embedding model from [Sentence Transformers.](https://huggingface.co/sentence-transformers)

   ```python
   from sentence_transformers import SentenceTransformer

   # Load the embedding model (https://huggingface.co/nomic-ai/nomic-embed-text-v1")
   model = SentenceTransformer("nomic-ai/nomic-embed-text-v1", trust_remote_code=True)
       
   # Define a function to generate embeddings
   def get_embedding(data):
       """Generates vector embeddings for the given data."""

       embedding = model.encode(data)
       return embedding.tolist()
   ```

   Load and split the data.

   Run this code to load and split sample data by using the [LangChain integration](https://www.mongodb.com/docs/atlas/ai-integrations/langchain.md#std-label-langchain). Specifically, this code does the following:

   - Loads a PDF that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236/pdf)

   - Splits the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   ```python
   from langchain_community.document_loaders import PyPDFLoader
   from langchain_text_splitters import RecursiveCharacterTextSplitter

   # Load the PDF
   loader = PyPDFLoader("https://investors.mongodb.com/node/12236/pdf")
   data = loader.load()

   # Split the data into chunks
   text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=20)
   documents = text_splitter.split_documents(data)
   ```

   Convert the data to vector embeddings.

   Run this code to prepare the chunked documents for ingestion by creating a list of documents with their corresponding vector embeddings. You generate these embeddings by using the `get_embedding()` function that you just defined.

   ```python
   # Prepare documents for insertion
   docs_to_insert = [{
       "text": doc.page_content,
       "embedding": get_embedding(doc.page_content)
   } for doc in documents]
   ```

   Store the data and embeddings in MongoDB.

   Run this code to insert the documents containing the embeddings into the `rag_db.test` collection. Before running the code, replace `<connection-string>` with your MongoDB connection string.

   ```python
   from pymongo import MongoClient

   # Connect to your MongoDB deployment
   client = MongoClient("<connection-string>")
   collection = client["rag_db"]["test"]

   # Insert documents into the collection
   result = collection.insert_many(docs_to_insert)
   ```

   **Tip:**

   After you run the code, if you're using Atlas, you can verify your vector embeddings by navigating to the `rag_db.test` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

3. Use MongoDB Vector Search to retrieve documents.

   In this section, you create a [retrieval](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) system using MongoDB Vector Search to get relevant documents from your vector database. Paste and run each of the following code snippets in your notebook:

   Create a MongoDB Vector Search index on your vector embeddings.

   Run the following code to create the index directly from your application with the [PyMongo Driver](https://www.mongodb.com/docs/drivers/pymongo/). This code also includes a polling mechanism to check if the index is ready to use.

   To learn more, see [How to Index Fields for Vector Search.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search)

   ```python
   from pymongo.operations import SearchIndexModel
   import time

   # Create your index model, then create the search index
   index_name="vector_index"
   search_index_model = SearchIndexModel(
     definition = {
       "fields": [
         {
           "type": "vector",
           "numDimensions": 768,
           "path": "embedding",
           "similarity": "cosine"
         }
       ]
     },
     name = index_name,
     type = "vectorSearch"
   )
   collection.create_search_index(model=search_index_model)

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
   print(index_name + " is ready for querying.")
   ```

   Define a function to run vector search queries.

   Run this code to create a retrieval function called `get_query_results()` that runs a basic vector search query. It uses the `get_embedding()` function to create embeddings from the search query. Then, it runs the query to return semantically similar documents. Your results might vary depending on the embedding model you use.

   To learn more, see [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   ```python
   # Define a function to run vector search queries
   def get_query_results(query):
     """Gets results from a vector search query."""

     query_embedding = get_embedding(query)
     pipeline = [
         {
               "$vectorSearch": {
                 "index": "vector_index",
                 "queryVector": query_embedding,
                 "path": "embedding",
                 "exact": True,
                 "limit": 5
               }
         }, {
               "$project": {
                 "_id": 0,
                 "text": 1
            }
         }
     ]

     results = collection.aggregate(pipeline)

     array_of_results = []
     for doc in results:
         array_of_results.append(doc)
     return array_of_results

   # Test the function with a sample query
   import pprint
   pprint.pprint(get_query_results("AI technology"))
   ```

   **Output:**

   ```text
   [{'text': 'more of our customers. We also see a tremendous opportunity to win '
             'more legacy workloads, as AI has now become a catalyst to modernize '
             'these\n'
             "applications. MongoDB's  document-based architecture is "
             'particularly well-suited for the variety and scale of data required '
             'by AI-powered applications.'},
    {'text': 'artificial intelligence, in our offerings or partnerships; the '
             'growth and expansion of the market for database products and our '
             'ability to penetrate that\n'
             'market; our ability to integrate acquired businesses and '
             'technologies successfully or achieve the expected benefits of such '
             'acquisitions; our ability to'},
    {'text': 'MongoDB  continues to expand its AI ecosystem with the announcement '
             'of the MongoDB AI Applications Program (MAAP),'},
    {'text': 'which provides customers with reference architectures, pre-built '
             'partner integrations, and professional services to help\n'
             'them quickly build AI-powered applications. Accenture will '
             'establish a center of excellence focused on MongoDB  projects,\n'
             'and is the first global systems integrator to join MAAP.'},
    {'text': 'Bendigo and Adelaide Bank partnered with MongoDB  to modernize '
             'their core banking technology. With the help of\n'
             'MongoDB Relational Migrator and generative AI-powered modernization '
             'tools, Bendigo and Adelaide Bank decomposed an\n'
             'outdated consumer-servicing application into microservices and '
             'migrated off its underlying legacy relational database'}]
   ```

4. Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context. This code does the following:

   - Uses the `get_query_results()` function you defined to retrieve relevant documents from your collection.

   - Creates a prompt using the user's question and retrieved documents as context.

   - Prompts the LLM about MongoDB's latest AI announcements. The generated response might vary.

   ```python
   from openai import OpenAI

   # Specify search query, retrieve relevant documents, and convert to string
   query = "What are MongoDB's latest AI announcements?"
   context_docs = get_query_results(query)
   context_string = " ".join([doc["text"] for doc in context_docs])

   # Construct prompt for the LLM using the retrieved documents as the context
   prompt = f"""Use the following pieces of context to answer the question at the end.
       {context_string}
       Question: {query}
   """

   openai_client = OpenAI()

   # OpenAI model to use
   model_name = "gpt-4o"

   completion = openai_client.chat.completions.create(
   model=model_name,
   messages=[{"role": "user",
       "content": prompt
     }]
   )
   print(completion.choices[0].message.content)
   ```

   **Output:**

   ```text
   MongoDB recently announced several developments in its AI ecosystem. 
   These include the MongoDB AI Applications Program (MAAP), which offers 
   reference architectures, pre-built partner integrations, and professional
   services to help customers efficiently build AI-powered applications. 
   Accenture is the first global systems integrator to join MAAP and will 
   establish a center of excellence for MongoDB projects. Additionally, 
   MongoDB introduced significant updates, including faster performance 
   in version 8.0 and the general availability of Atlas Stream Processing 
   to enable real-time, event-driven applications. These advancements 
   highlight MongoDB's focus on supporting AI-powered applications and 
   modernizing legacy workloads.
   ```

1) Set up the environment.

   Create an interactive Python notebook by saving a file with the `.ipynb` extension. This notebook allows you to run Python code snippets individually. In your notebook, run the following code to install the dependencies for this tutorial:

   ```shell
   pip install --quiet --upgrade pymongo sentence_transformers huggingface_hub einops langchain langchain_community pypdf
   ```

   Then, run the following code to set the environment variables for this tutorial, replacing the placeholders with your API keys.

   ```python
   import os

   os.environ["HF_TOKEN"] = "<hf-token>"
   ```

2) Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to. Paste and run each of the following code snippets in your notebook:

   Define a function to generate vector embeddings.

   Paste and run the following code in your notebook to create a function named `get_embedding()` that generates vector embeddings by using the [nomic-embed-text-v1](https://huggingface.co/nomic-ai/nomic-embed-text-v1) embedding model from [Sentence Transformers.](https://huggingface.co/sentence-transformers)

   ```python
   from sentence_transformers import SentenceTransformer

   # Load the embedding model (https://huggingface.co/nomic-ai/nomic-embed-text-v1")
   model = SentenceTransformer("nomic-ai/nomic-embed-text-v1", trust_remote_code=True)
       
   # Define a function to generate embeddings
   def get_embedding(data):
       """Generates vector embeddings for the given data."""

       embedding = model.encode(data)
       return embedding.tolist()
   ```

   Load and split the data.

   Run this code to load and split sample data by using the [LangChain integration](https://www.mongodb.com/docs/atlas/ai-integrations/langchain.md#std-label-langchain). Specifically, this code does the following:

   - Loads a PDF that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236/pdf)

   - Splits the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   ```python
   from langchain_community.document_loaders import PyPDFLoader
   from langchain_text_splitters import RecursiveCharacterTextSplitter

   # Load the PDF
   loader = PyPDFLoader("https://investors.mongodb.com/node/12236/pdf")
   data = loader.load()

   # Split the data into chunks
   text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=20)
   documents = text_splitter.split_documents(data)
   ```

   Convert the data to vector embeddings.

   Run this code to prepare the chunked documents for ingestion by creating a list of documents with their corresponding vector embeddings. You generate these embeddings by using the `get_embedding()` function that you just defined.

   ```python
   # Prepare documents for insertion
   docs_to_insert = [{
       "text": doc.page_content,
       "embedding": get_embedding(doc.page_content)
   } for doc in documents]
   ```

   Store the data and embeddings in MongoDB.

   Run this code to insert the documents containing the embeddings into the `rag_db.test` collection. Before running the code, replace `<connection-string>` with your MongoDB connection string.

   ```python
   from pymongo import MongoClient

   # Connect to your MongoDB deployment
   client = MongoClient("<connection-string>")
   collection = client["rag_db"]["test"]

   # Insert documents into the collection
   result = collection.insert_many(docs_to_insert)
   ```

   **Tip:**

   After you run the code, if you're using Atlas, you can verify your vector embeddings by navigating to the `rag_db.test` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

3) Use MongoDB Vector Search to retrieve documents.

   In this section, you create a [retrieval](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) system using MongoDB Vector Search to get relevant documents from your vector database. Paste and run each of the following code snippets in your notebook:

   Create a MongoDB Vector Search index on your vector embeddings.

   Run the following code to create the index directly from your application with the [PyMongo Driver](https://www.mongodb.com/docs/drivers/pymongo/). This code also includes a polling mechanism to check if the index is ready to use.

   To learn more, see [How to Index Fields for Vector Search.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search)

   ```python
   from pymongo.operations import SearchIndexModel
   import time

   # Create your index model, then create the search index
   index_name="vector_index"
   search_index_model = SearchIndexModel(
     definition = {
       "fields": [
         {
           "type": "vector",
           "numDimensions": 768,
           "path": "embedding",
           "similarity": "cosine"
         }
       ]
     },
     name = index_name,
     type = "vectorSearch"
   )
   collection.create_search_index(model=search_index_model)

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
   print(index_name + " is ready for querying.")
   ```

   Define a function to run vector search queries.

   Run this code to create a retrieval function called `get_query_results()` that runs a basic vector search query. It uses the `get_embedding()` function to create embeddings from the search query. Then, it runs the query to return semantically similar documents. Your results might vary depending on the embedding model you use.

   To learn more, see [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   ```python
   # Define a function to run vector search queries
   def get_query_results(query):
     """Gets results from a vector search query."""

     query_embedding = get_embedding(query)
     pipeline = [
         {
               "$vectorSearch": {
                 "index": "vector_index",
                 "queryVector": query_embedding,
                 "path": "embedding",
                 "exact": True,
                 "limit": 5
               }
         }, {
               "$project": {
                 "_id": 0,
                 "text": 1
            }
         }
     ]

     results = collection.aggregate(pipeline)

     array_of_results = []
     for doc in results:
         array_of_results.append(doc)
     return array_of_results

   # Test the function with a sample query
   import pprint
   pprint.pprint(get_query_results("AI technology"))
   ```

   **Output:**

   ```text
   [{'text': 'more of our customers. We also see a tremendous opportunity to win '
             'more legacy workloads, as AI has now become a catalyst to modernize '
             'these\n'
             "applications. MongoDB's  document-based architecture is "
             'particularly well-suited for the variety and scale of data required '
             'by AI-powered applications.'},
    {'text': 'artificial intelligence, in our offerings or partnerships; the '
             'growth and expansion of the market for database products and our '
             'ability to penetrate that\n'
             'market; our ability to integrate acquired businesses and '
             'technologies successfully or achieve the expected benefits of such '
             'acquisitions; our ability to'},
    {'text': 'MongoDB  continues to expand its AI ecosystem with the announcement '
             'of the MongoDB AI Applications Program (MAAP),'},
    {'text': 'which provides customers with reference architectures, pre-built '
             'partner integrations, and professional services to help\n'
             'them quickly build AI-powered applications. Accenture will '
             'establish a center of excellence focused on MongoDB  projects,\n'
             'and is the first global systems integrator to join MAAP.'},
    {'text': 'Bendigo and Adelaide Bank partnered with MongoDB  to modernize '
             'their core banking technology. With the help of\n'
             'MongoDB Relational Migrator and generative AI-powered modernization '
             'tools, Bendigo and Adelaide Bank decomposed an\n'
             'outdated consumer-servicing application into microservices and '
             'migrated off its underlying legacy relational database'}]
   ```

4) Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context. This code does the following:

   - Uses the `get_query_results()` function you defined to retrieve relevant documents from your collection.

   - Creates a prompt using the user's question and retrieved documents as context.

   - Prompts the LLM about MongoDB's latest AI announcements. The generated response might vary.

   ```python
   from huggingface_hub import InferenceClient

   # Specify search query, retrieve relevant documents, and convert to string
   query = "What are MongoDB's latest AI announcements?"
   context_docs = get_query_results(query)
   context_string = " ".join([doc["text"] for doc in context_docs])

   # Construct prompt for the LLM using the retrieved documents as the context
   prompt = f"""Use the following pieces of context to answer the question at the end.
       {context_string}
       Question: {query}
   """

   # Use a model from Hugging Face
   llm = InferenceClient(
       "mistralai/Mixtral-8x22B-Instruct-v0.1",
       provider = "fireworks-ai",
       token = os.getenv("HF_TOKEN"))

   # Prompt the LLM (this code varies depending on the model you use)
   output = llm.chat_completion(
       messages=[{"role": "user", "content": prompt}],
       max_tokens=150
   )
   print(output.choices[0].message.content)
   ```

   **Output:**

   ```text
   MongoDB's latest AI announcements include the
   MongoDB AI Applications Program (MAAP), a program designed
   to help customers build AI-powered applications more efficiently.
   Additionally, they have announced significant performance
   improvements in MongoDB 8.0, featuring faster reads, updates,
   bulk inserts, and time series queries. Another announcement is the
   general availability of Atlas Stream Processing to build sophisticated,
   event-driven applications with real-time data.
   ```

1. Set up the environment.

   Initialize your Node.js project.

   Run the following commands in your terminal to create a new directory named `rag-mongodb` and initialize your project:

   ```text
   mkdir rag-mongodb
   cd rag-mongodb
   npm init -y
   ```

   Install and import dependencies.

   Run the following command:

   ```text
   npm install mongodb voyageai openai langchain @langchain/community pdf-parse@1
   ```

   Update your `package.json` file.

   In your project's `package.json` file, specify the `type` field as shown in the following example, and then save the file.

   ```javascript
   {
      "name": "rag-mongodb",
      "type": "module",
      ...
   ```

   Create a `.env` file.

   In your project, create a `.env` file to store your MongoDB connection string and API keys:

   ```text
   MONGODB_URI = "<connection-string>"
   VOYAGE_API_KEY = "<voyage-api-key>"
   OPENAI_API_KEY = "<openai-api-key>"
   ```

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

   **Note: Minimum Node.js Version Requirements**

   Node.js v20.x introduced the `--env-file` option. If you are using an older version of Node.js, add the `dotenv` package to your project, or use a different method to manage your environment variables.

2. Create a function to generate vector embeddings.

   In your project, create a file called `get-embeddings.js` and paste the following code:

   ```javascript
   import { VoyageAIClient } from 'voyageai';

   // Set up Voyage AI configuration
   const client = new VoyageAIClient({apiKey: process.env.VOYAGE_API_KEY});

   // Function to generate embeddings using the Voyage AI API
   export async function getEmbedding(text) {
       const results = await client.embed({
           input: text,
           model: "voyage-3-large"
       });
       return results.data[0].embedding;
   }

   ```

   The `getEmbedding()` function generates vector embeddings by using the `voyage-3-large` embedding model from [Voyage AI.](https://www.mongodb.com/docs/voyageai.md#std-label-voyage-landing)

   **Tip:**

   To learn more, see [Voyage AI Typescript Library.](https://www.npmjs.com/package/voyageai)

3. Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to. The following code uses the [LangChain integration](https://www.mongodb.com/docs/atlas/ai-integrations/langchain-js.md#std-label-langchain-js) and [Node.js driver](https://www.mongodb.com/docs/drivers/node/current/quick-start/) to do the following:

   - Load a PDF that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236/pdf)

   - Split the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   - Create vector embeddings from the chunked data by using the `getEmbedding()` function that you defined.

   - Store these embeddings alongside the chunked data in the `rag_db.test` collection.

   Create a file called `ingest-data.js` in your project, and paste the following code:

   ```javascript
   import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
   import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';
   import * as fs from 'fs';

   async function run() {
       const client = new MongoClient(process.env.MONGODB_URI);

       try {
           // Save online PDF as a file
           const rawData = await fetch("https://investors.mongodb.com/node/12236/pdf");
           const pdfBuffer = await rawData.arrayBuffer();
           const pdfData = Buffer.from(pdfBuffer);
           fs.writeFileSync("investor-report.pdf", pdfData);

           const loader = new PDFLoader(`investor-report.pdf`);
           const data = await loader.load();

           // Chunk the text from the PDF
           const textSplitter = new RecursiveCharacterTextSplitter({
               chunkSize: 400,
               chunkOverlap: 20,
           });
           const docs = await textSplitter.splitDocuments(data);
           console.log(`Successfully chunked the PDF into ${docs.length} documents.`);

           // Connect to your MongoDB cluster
           await client.connect();
           const db = client.db("rag_db");
           const collection = db.collection("test");

           console.log("Generating embeddings and inserting documents...");
           const insertDocuments = [];
           await Promise.all(docs.map(async doc => {

               // Generate embeddings using the function that you defined
               const embedding = await getEmbedding(doc.pageContent);

               // Add the document with the embedding to array of documents for bulk insert
               insertDocuments.push({
                   document: doc,
                   embedding: embedding
               });
           }))

           // Continue processing documents if an error occurs during an operation
           const options = { ordered: false };

           // Insert documents with embeddings into collection
           const result = await collection.insertMany(insertDocuments, options);  
           console.log("Count of documents inserted: " + result.insertedCount); 

       } catch (err) {
           console.log(err.stack);
       }
       finally {
           await client.close();
       }
   }
   run().catch(console.dir);

   ```

   Then, run the following command to execute the code:

   ```sh
   node --env-file=.env ingest-data.js
   ```

   **Output:**

   ```sh
   Generating embeddings and inserting documents...
   Count of documents inserted: 86
   ```

   **Tip:**

   This code takes some time to run. If you're using Atlas, you can verify your vector embeddings by navigating to the `rag_db.test` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

4. Use MongoDB Vector Search to retrieve documents.

   In this section, you set up MongoDB Vector Search to [retrieve](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) documents from your vector database. Complete the following steps:

   Create a MongoDB Vector Search index on your vector embeddings.

   Create a new file named `rag-vector-index.js` and paste the following code. This code connects to your MongoDB deployment and creates an index of the [vectorSearch](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type on the `rag_db.test` collection with 1024 dimensions for the Voyage AI model.

   ```javascript
   import { MongoClient } from 'mongodb';

   // Connect to your MongoDB cluster
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
       try {
         const database = client.db("rag_db");
         const collection = database.collection("test");
        
         // Define your Vector Search index
         const index = {
             name: "vector_index",
             type: "vectorSearch",
             definition: {
               "fields": [
                 {
                   "type": "vector",
                   "path": "embedding",
                   "similarity": "cosine",
                   "numDimensions": <dimensions> // Replace with the number of dimensions of your embeddings
                 }
               ]
             }
         }
    
         // Call the method to create the index
         const result = await collection.createSearchIndex(index);
         console.log(result);
       } finally {
         await client.close();
       }
   }
   run().catch(console.dir);

   ```

   Then, run the following command to execute the code:

   ```shell
   node --env-file=.env rag-vector-index.js
   ```

   Define a function to retrieve relevant data.

   Create a new file called `retrieve-documents.js`.

   In this step, you create a retrieval function called `getQueryResults()` that runs a query to retrieve relevant documents. It uses the `getEmbedding()` function to create an embedding from the search query. Then, it runs the query to return semantically-similar documents.

   To learn more, refer to [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   Paste this code into your file:

   ```javascript
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';

   // Function to get the results of a vector query
   export async function getQueryResults(query) {
       // Connect to your cluster
       const client = new MongoClient(process.env.MONGODB_URI);
       
       try {
           // Get embedding for a query
           const queryEmbedding = await getEmbedding(query);

           await client.connect();
           const db = client.db("rag_db");
           const collection = db.collection("test");

           const pipeline = [
               {
                   $vectorSearch: {
                       index: "vector_index",
                       queryVector: queryEmbedding,
                       path: "embedding",
                       exact: true,
                       limit: 5
                   }
               },
               {
                   $project: {
                       _id: 0,
                       document: 1,
                   }
               }
           ];

           // Retrieve documents using a Vector Search query
           const result = collection.aggregate(pipeline);

           const arrayOfQueryDocs = [];
           for await (const doc of result) {
               arrayOfQueryDocs.push(doc);
           }
           return arrayOfQueryDocs;
       } catch (err) {
           console.log(err.stack);
       }
       finally {
           await client.close();
       }
   }

   ```

   Test retrieving the data.

   Create a new file called `retrieve-documents-test.js`. In this step, you check that the function you just defined returns relevant results.

   Paste this code into your file:

   ```javascript
   import { getQueryResults } from './retrieve-documents.js';

   async function run() {
       try {
           const query = "AI Technology";
           const documents = await getQueryResults(query);

           documents.forEach( doc => {
               console.log(doc);
           }); 
       } catch (err) {
           console.log(err.stack);
       }
   }
   run().catch(console.dir);

   ```

   Then, run the following command to execute the code. Your results might vary.

   ```shell
   node --env-file=.env retrieve-documents-test.js
   ```

   **Output:**

   ```console
   {
     document: {
       pageContent: 'MongoDB continues to expand its AI ecosystem with the announcement of the MongoDB AI Applications Program (MAAP),',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'artificial intelligence, in our offerings or partnerships; the growth and expansion of the market for database products and our ability to penetrate that\n' +
         'market; our ability to integrate acquired businesses and technologies successfully or achieve the expected benefits of such acquisitions; our ability to',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'more of our customers. We also see a tremendous opportunity to win more legacy workloads, as AI has now become a catalyst to modernize these\n' +
         "applications. MongoDB's document-based architecture is particularly well-suited for the variety and scale of data required by AI-powered applications. \n" +
         'We are confident MongoDB will be a substantial beneficiary of this next wave of application development."',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'which provides customers with reference architectures, pre-built partner integrations, and professional services to help\n' +
         'them quickly build AI-powered applications. Accenture will establish a center of excellence focused on MongoDB projects,\n' +
         'and is the first global systems integrator to join MAAP.',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'Bendigo and Adelaide Bank partnered with MongoDB to modernize their core banking technology. With the help of\n' +
         'MongoDB Relational Migrator and generative AI-powered modernization tools, Bendigo and Adelaide Bank decomposed an\n' +
         'outdated consumer-servicing application into microservices and migrated off its underlying legacy relational database',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }

   ```

5. Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context. This example uses the function you just defined to retrieve matching documents from the database, and additionally:

   - Instructs the LLM to include the user's question and retrieved documents in the prompt.

   - Prompts the LLM about MongoDB's latest AI announcements.

   Create a new file called `generate-responses.js`, and paste the following code into it:

   ```javascript
   import { getQueryResults } from './retrieve-documents.js';
   import OpenAI from 'openai';

   async function run() {
       try {
           // Specify search query and retrieve relevant documents
           const question = "In a few sentences, what are MongoDB's latest AI announcements?";
           const documents = await getQueryResults(question);

           // Build a string representation of the retrieved documents to use in the prompt
           let textDocuments = "";
           documents.forEach(doc => {
               textDocuments += doc.document.pageContent;
           });

           // Create a prompt consisting of the question and context to pass to the LLM
           const prompt = `Answer the following question based on the given context.
               Question: {${question}}
               Context: {${textDocuments}}
           `;

           // Initialize OpenAI client
           const client = new OpenAI({
               apiKey: process.env.OPENAI_API_KEY,
           });

           // Prompt the LLM to generate a response based on the context
           const chatCompletion = await client.chat.completions.create({
               model: "gpt-4o",
               messages: [
                   {
                       role: "user",
                       content: prompt
                   },
               ],
           });

           // Output the LLM's response as text.
           console.log(chatCompletion.choices[0].message.content);
       } catch (err) {
           console.log(err.stack);
       }
   }
   run().catch(console.dir);

   ```

   Then, run this command to execute the code. The generated response might vary.

   ```shell
   node --env-file=.env generate-responses.js
   ```

   **Output:**

   ```text
   MongoDB's latest AI announcements include the launch of the MongoDB
   AI Applications Program (MAAP), which provides customers with
   reference architectures, pre-built partner integrations, and
   professional services to help them build AI-powered applications
   quickly. Accenture has joined MAAP as the first global systems
   integrator, establishing a center of excellence focused on MongoDB
   projects. Additionally, Bendigo and Adelaide Bank have partnered
   with MongoDB to modernize their core banking technology using
   MongoDB's Relational Migrator and generative AI-powered
   modernization tools.
   ```

1) Set up the environment.

   Initialize your Node.js project.

   Run the following commands in your terminal to create a new directory named `rag-mongodb` and initialize your project:

   ```text
   mkdir rag-mongodb
   cd rag-mongodb
   npm init -y
   ```

   Install and import dependencies.

   Run the following command:

   ```text
   npm install mongodb voyageai @huggingface/inference langchain @langchain/community pdf-parse@1
   ```

   Update your `package.json` file.

   In your project's `package.json` file, specify the `type` field as shown in the following example, and then save the file.

   ```javascript
   {
      "name": "rag-mongodb",
      "type": "module",
      ...
   ```

   Create a `.env` file.

   In your project, create a `.env` file to store your MongoDB connection string and API keys:

   ```text
   MONGODB_URI = "<connection-string>"
   VOYAGE_API_KEY = "<voyage-api-key>"
   HUGGING_FACE_ACCESS_TOKEN = "<hf-token>"
   ```

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

   **Note: Minimum Node.js Version Requirements**

   Node.js v20.x introduced the `--env-file` option. If you are using an older version of Node.js, add the `dotenv` package to your project, or use a different method to manage your environment variables.

2) Create a function to generate vector embeddings.

   In your project, create a file called `get-embeddings.js` and paste the following code:

   ```javascript
   import { VoyageAIClient } from 'voyageai';

   // Set up Voyage AI configuration
   const client = new VoyageAIClient({apiKey: process.env.VOYAGE_API_KEY});

   // Function to generate embeddings using the Voyage AI API
   export async function getEmbedding(text) {
       const results = await client.embed({
           input: text,
           model: "voyage-3-large"
       });
       return results.data[0].embedding;
   }

   ```

   The `getEmbedding()` function generates vector embeddings by using the `voyage-3-large` embedding model from [Voyage AI.](https://www.mongodb.com/docs/voyageai.md#std-label-voyage-landing)

   **Tip:**

   To learn more, see [Voyage AI Typescript Library.](https://www.npmjs.com/package/voyageai)

3) Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to. The following code uses the [LangChain integration](https://www.mongodb.com/docs/atlas/ai-integrations/langchain-js.md#std-label-langchain-js) and [Node.js driver](https://www.mongodb.com/docs/drivers/node/current/quick-start/) to do the following:

   - Load a PDF that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236/pdf)

   - Split the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   - Create vector embeddings from the chunked data by using the `getEmbedding()` function that you defined.

   - Store these embeddings alongside the chunked data in the `rag_db.test` collection.

   Create a file called `ingest-data.js` in your project, and paste the following code:

   ```javascript
   import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
   import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';
   import * as fs from 'fs';

   async function run() {
       const client = new MongoClient(process.env.MONGODB_URI);

       try {
           // Save online PDF as a file
           const rawData = await fetch("https://investors.mongodb.com/node/12236/pdf");
           const pdfBuffer = await rawData.arrayBuffer();
           const pdfData = Buffer.from(pdfBuffer);
           fs.writeFileSync("investor-report.pdf", pdfData);

           const loader = new PDFLoader(`investor-report.pdf`);
           const data = await loader.load();

           // Chunk the text from the PDF
           const textSplitter = new RecursiveCharacterTextSplitter({
               chunkSize: 400,
               chunkOverlap: 20,
           });
           const docs = await textSplitter.splitDocuments(data);
           console.log(`Successfully chunked the PDF into ${docs.length} documents.`);

           // Connect to your MongoDB cluster
           await client.connect();
           const db = client.db("rag_db");
           const collection = db.collection("test");

           console.log("Generating embeddings and inserting documents...");
           const insertDocuments = [];
           await Promise.all(docs.map(async doc => {

               // Generate embeddings using the function that you defined
               const embedding = await getEmbedding(doc.pageContent);

               // Add the document with the embedding to array of documents for bulk insert
               insertDocuments.push({
                   document: doc,
                   embedding: embedding
               });
           }))

           // Continue processing documents if an error occurs during an operation
           const options = { ordered: false };

           // Insert documents with embeddings into collection
           const result = await collection.insertMany(insertDocuments, options);  
           console.log("Count of documents inserted: " + result.insertedCount); 

       } catch (err) {
           console.log(err.stack);
       }
       finally {
           await client.close();
       }
   }
   run().catch(console.dir);

   ```

   Then, run the following command to execute the code:

   ```sh
   node --env-file=.env ingest-data.js
   ```

   **Output:**

   ```sh
   Generating embeddings and inserting documents...
   Count of documents inserted: 86
   ```

   **Tip:**

   This code takes some time to run. If you're using Atlas, you can verify your vector embeddings by navigating to the `rag_db.test` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

4) Use MongoDB Vector Search to retrieve documents.

   In this section, you set up MongoDB Vector Search to [retrieve](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) documents from your vector database. Complete the following steps:

   Create a MongoDB Vector Search index on your vector embeddings.

   Create a new file named `rag-vector-index.js` and paste the following code. This code connects to your MongoDB deployment and creates an index of the [vectorSearch](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type on the `rag_db.test` collection with 1024 dimensions for the Voyage AI model.

   ```javascript
   import { MongoClient } from 'mongodb';

   // Connect to your MongoDB cluster
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
       try {
         const database = client.db("rag_db");
         const collection = database.collection("test");
        
         // Define your Vector Search index
         const index = {
             name: "vector_index",
             type: "vectorSearch",
             definition: {
               "fields": [
                 {
                   "type": "vector",
                   "path": "embedding",
                   "similarity": "cosine",
                   "numDimensions": <dimensions> // Replace with the number of dimensions of your embeddings
                 }
               ]
             }
         }
    
         // Call the method to create the index
         const result = await collection.createSearchIndex(index);
         console.log(result);
       } finally {
         await client.close();
       }
   }
   run().catch(console.dir);

   ```

   Then, run the following command to execute the code:

   ```shell
   node --env-file=.env rag-vector-index.js
   ```

   Define a function to retrieve relevant data.

   Create a new file called `retrieve-documents.js`.

   In this step, you create a retrieval function called `getQueryResults()` that runs a query to retrieve relevant documents. It uses the `getEmbedding()` function to create an embedding from the search query. Then, it runs the query to return semantically-similar documents.

   To learn more, refer to [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   Paste this code into your file:

   ```javascript
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';

   // Function to get the results of a vector query
   export async function getQueryResults(query) {
       // Connect to your cluster
       const client = new MongoClient(process.env.MONGODB_URI);
       
       try {
           // Get embedding for a query
           const queryEmbedding = await getEmbedding(query);

           await client.connect();
           const db = client.db("rag_db");
           const collection = db.collection("test");

           const pipeline = [
               {
                   $vectorSearch: {
                       index: "vector_index",
                       queryVector: queryEmbedding,
                       path: "embedding",
                       exact: true,
                       limit: 5
                   }
               },
               {
                   $project: {
                       _id: 0,
                       document: 1,
                   }
               }
           ];

           // Retrieve documents using a Vector Search query
           const result = collection.aggregate(pipeline);

           const arrayOfQueryDocs = [];
           for await (const doc of result) {
               arrayOfQueryDocs.push(doc);
           }
           return arrayOfQueryDocs;
       } catch (err) {
           console.log(err.stack);
       }
       finally {
           await client.close();
       }
   }

   ```

   Test retrieving the data.

   Create a new file called `retrieve-documents-test.js`. In this step, you check that the function you just defined returns relevant results.

   Paste this code into your file:

   ```javascript
   import { getQueryResults } from './retrieve-documents.js';

   async function run() {
       try {
           const query = "AI Technology";
           const documents = await getQueryResults(query);

           documents.forEach( doc => {
               console.log(doc);
           }); 
       } catch (err) {
           console.log(err.stack);
       }
   }
   run().catch(console.dir);

   ```

   Then, run the following command to execute the code. Your results might vary.

   ```shell
   node --env-file=.env retrieve-documents-test.js
   ```

   **Output:**

   ```console
   {
     document: {
       pageContent: 'MongoDB continues to expand its AI ecosystem with the announcement of the MongoDB AI Applications Program (MAAP),',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'artificial intelligence, in our offerings or partnerships; the growth and expansion of the market for database products and our ability to penetrate that\n' +
         'market; our ability to integrate acquired businesses and technologies successfully or achieve the expected benefits of such acquisitions; our ability to',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'more of our customers. We also see a tremendous opportunity to win more legacy workloads, as AI has now become a catalyst to modernize these\n' +
         "applications. MongoDB's document-based architecture is particularly well-suited for the variety and scale of data required by AI-powered applications. \n" +
         'We are confident MongoDB will be a substantial beneficiary of this next wave of application development."',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'which provides customers with reference architectures, pre-built partner integrations, and professional services to help\n' +
         'them quickly build AI-powered applications. Accenture will establish a center of excellence focused on MongoDB projects,\n' +
         'and is the first global systems integrator to join MAAP.',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'Bendigo and Adelaide Bank partnered with MongoDB to modernize their core banking technology. With the help of\n' +
         'MongoDB Relational Migrator and generative AI-powered modernization tools, Bendigo and Adelaide Bank decomposed an\n' +
         'outdated consumer-servicing application into microservices and migrated off its underlying legacy relational database',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }

   ```

5) Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context. This example uses the function you just defined to retrieve matching documents from the database, and additionally:

   - Instructs the LLM to include the user's question and retrieved documents in the prompt.

   - Prompts the LLM about MongoDB's latest AI announcements.

   Create a new file called `generate-responses.js`, and paste the following code into it:

   ```javascript
   import { getQueryResults } from './retrieve-documents.js';
   import { HfInference } from '@huggingface/inference'

   async function run() {
       try {
           // Specify search query and retrieve relevant documents
           const question = "In a few sentences, what are MongoDB's latest AI announcements?";
           const documents = await getQueryResults(question);

           // Build a string representation of the retrieved documents to use in the prompt
           let textDocuments = "";
           documents.forEach(doc => {
               textDocuments += doc.document.pageContent;
           });

           // Create a prompt consisting of the question and context to pass to the LLM
           const prompt = `Answer the following question based on the given context.
               Question: {${question}}
               Context: {${textDocuments}}
           `;

           // Prompt the LLM to generate a response based on the context
           const client = new InferenceClient(process.env.HUGGING_FACE_ACCESS_TOKEN);
           const chatCompletion = await client.chatCompletion({
               provider: "fireworks-ai",
               model: "mistralai/Mixtral-8x22B-Instruct-v0.1",
               messages: [
                   {
                       role: "user",
                       content: prompt
                   },
               ],
           });

           // Output the LLM's response as text.
           console.log(chatCompletion.choices[0].message.content);
       } catch (err) {
           console.log(err.stack);
       }
   }
   run().catch(console.dir);

   ```

   Then, run this command to execute the code. The generated response might vary.

   ```shell
   node --env-file=.env generate-responses.js
   ```

   **Output:**

   ```text
   MongoDB's latest AI announcements include the MongoDB AI Applications
   Program (MAAP), which provides customers with reference architectures,
   pre-built partner integrations, and professional services to help them
   quickly build AI-powered applications. Accenture will establish a
   center of excellence focused on MongoDB projects and is the first
   global systems integrator to join MAAP. Additionally, MongoDB has
   announced significant performance improvements in MongoDB 8.0,
   featuring faster reads, updates, bulk inserts, and time series queries.
   ```

1. Set up the environment.

   Initialize your Node.js project.

   Run the following commands in your terminal to create a new directory named `rag-mongodb` and initialize your project:

   ```text
   mkdir rag-mongodb
   cd rag-mongodb
   npm init -y
   ```

   Install and import dependencies.

   Run the following command:

   ```text
   npm install mongodb @xenova/transformers openai langchain @langchain/community pdf-parse@1
   ```

   Update your `package.json` file.

   In your project's `package.json` file, specify the `type` field as shown in the following example, and then save the file.

   ```javascript
   {
      "name": "rag-mongodb",
      "type": "module",
      ...
   ```

   Create a `.env` file.

   In your project, create a `.env` file to store your MongoDB connection string and API keys:

   ```text
   MONGODB_URI = "<connection-string>"
   OPENAI_API_KEY = "<openai-api-key>"
   ```

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

   **Note: Minimum Node.js Version Requirements**

   Node.js v20.x introduced the `--env-file` option. If you are using an older version of Node.js, add the `dotenv` package to your project, or use a different method to manage your environment variables.

2. Create a function to generate vector embeddings.

   In your project, create a file called `get-embeddings.js` and paste the following code:

   ```javascript
   import { env, pipeline } from '@xenova/transformers';

   // Function to generate embeddings for given data
   export async function getEmbedding(data) {
       // Replace this path with the parent directory that contains the model files
       env.localModelPath = '/Users/<username>/local-rag-mongodb/';
       env.allowRemoteModels = false;
       const task = 'feature-extraction';
       const model = 'mxbai-embed-large-v1';
       const embedder = await pipeline(
           task, model);
       const results = await embedder(data, { pooling: 'mean', normalize: true });
       return Array.from(results.data);
   }

   ```

   The `getEmbedding()` function generates vector embeddings by using the [nomic-embed-text-v1](https://huggingface.co/nomic-ai/nomic-embed-text-v1) embedding model from [Sentence Transformers.](https://huggingface.co/sentence-transformers)

3. Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to. The following code uses the [LangChain integration](https://www.mongodb.com/docs/atlas/ai-integrations/langchain-js.md#std-label-langchain-js) and [Node.js driver](https://www.mongodb.com/docs/drivers/node/current/quick-start/) to do the following:

   - Load a PDF that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236/pdf)

   - Split the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   - Create vector embeddings from the chunked data by using the `getEmbedding()` function that you defined.

   - Store these embeddings alongside the chunked data in the `rag_db.test` collection.

   Create a file called `ingest-data.js` in your project, and paste the following code:

   ```javascript
   import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
   import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';
   import * as fs from 'fs';

   async function run() {
       const client = new MongoClient(process.env.MONGODB_URI);

       try {
           // Save online PDF as a file
           const rawData = await fetch("https://investors.mongodb.com/node/12236/pdf");
           const pdfBuffer = await rawData.arrayBuffer();
           const pdfData = Buffer.from(pdfBuffer);
           fs.writeFileSync("investor-report.pdf", pdfData);

           const loader = new PDFLoader(`investor-report.pdf`);
           const data = await loader.load();

           // Chunk the text from the PDF
           const textSplitter = new RecursiveCharacterTextSplitter({
               chunkSize: 400,
               chunkOverlap: 20,
           });
           const docs = await textSplitter.splitDocuments(data);
           console.log(`Successfully chunked the PDF into ${docs.length} documents.`);

           // Connect to your MongoDB cluster
           await client.connect();
           const db = client.db("rag_db");
           const collection = db.collection("test");

           console.log("Generating embeddings and inserting documents...");
           const insertDocuments = [];
           await Promise.all(docs.map(async doc => {

               // Generate embeddings using the function that you defined
               const embedding = await getEmbedding(doc.pageContent);

               // Add the document with the embedding to array of documents for bulk insert
               insertDocuments.push({
                   document: doc,
                   embedding: embedding
               });
           }))

           // Continue processing documents if an error occurs during an operation
           const options = { ordered: false };

           // Insert documents with embeddings into collection
           const result = await collection.insertMany(insertDocuments, options);  
           console.log("Count of documents inserted: " + result.insertedCount); 

       } catch (err) {
           console.log(err.stack);
       }
       finally {
           await client.close();
       }
   }
   run().catch(console.dir);

   ```

   Then, run the following command to execute the code:

   ```sh
   node --env-file=.env ingest-data.js
   ```

   **Output:**

   ```sh
   Generating embeddings and inserting documents...
   Count of documents inserted: 86
   ```

   **Tip:**

   This code takes some time to run. If you're using Atlas, you can verify your vector embeddings by navigating to the `rag_db.test` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

4. Use MongoDB Vector Search to retrieve documents.

   In this section, you set up MongoDB Vector Search to [retrieve](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) documents from your vector database. Complete the following steps:

   Create a MongoDB Vector Search index on your vector embeddings.

   Create a new file named `rag-vector-index.js` and paste the following code. This code connects to your MongoDB deployment and creates an index of the [vectorSearch](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type on the `rag_db.test` collection with 768 dimensions for the open-source embedding model.

   ```javascript
   import { MongoClient } from 'mongodb';

   // Connect to your MongoDB cluster
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
       try {
         const database = client.db("rag_db");
         const collection = database.collection("test");
        
         // Define your Vector Search index
         const index = {
             name: "vector_index",
             type: "vectorSearch",
             definition: {
               "fields": [
                 {
                   "type": "vector",
                   "path": "embedding",
                   "similarity": "cosine",
                   "numDimensions": <dimensions> // Replace with the number of dimensions of your embeddings
                 }
               ]
             }
         }
    
         // Call the method to create the index
         const result = await collection.createSearchIndex(index);
         console.log(result);
       } finally {
         await client.close();
       }
   }
   run().catch(console.dir);

   ```

   Then, run the following command to execute the code:

   ```shell
   node --env-file=.env rag-vector-index.js
   ```

   Define a function to retrieve relevant data.

   Create a new file called `retrieve-documents.js`.

   In this step, you create a retrieval function called `getQueryResults()` that runs a query to retrieve relevant documents. It uses the `getEmbedding()` function to create an embedding from the search query. Then, it runs the query to return semantically-similar documents.

   To learn more, refer to [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   Paste this code into your file:

   ```javascript
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';

   // Function to get the results of a vector query
   export async function getQueryResults(query) {
       // Connect to your cluster
       const client = new MongoClient(process.env.MONGODB_URI);
       
       try {
           // Get embedding for a query
           const queryEmbedding = await getEmbedding(query);

           await client.connect();
           const db = client.db("rag_db");
           const collection = db.collection("test");

           const pipeline = [
               {
                   $vectorSearch: {
                       index: "vector_index",
                       queryVector: queryEmbedding,
                       path: "embedding",
                       exact: true,
                       limit: 5
                   }
               },
               {
                   $project: {
                       _id: 0,
                       document: 1,
                   }
               }
           ];

           // Retrieve documents using a Vector Search query
           const result = collection.aggregate(pipeline);

           const arrayOfQueryDocs = [];
           for await (const doc of result) {
               arrayOfQueryDocs.push(doc);
           }
           return arrayOfQueryDocs;
       } catch (err) {
           console.log(err.stack);
       }
       finally {
           await client.close();
       }
   }

   ```

   Test retrieving the data.

   Create a new file called `retrieve-documents-test.js`. In this step, you check that the function you just defined returns relevant results.

   Paste this code into your file:

   ```javascript
   import { getQueryResults } from './retrieve-documents.js';

   async function run() {
       try {
           const query = "AI Technology";
           const documents = await getQueryResults(query);

           documents.forEach( doc => {
               console.log(doc);
           }); 
       } catch (err) {
           console.log(err.stack);
       }
   }
   run().catch(console.dir);

   ```

   Then, run the following command to execute the code. Your results might vary depending on the embedding model you use.

   ```shell
   node --env-file=.env retrieve-documents-test.js
   ```

   **Output:**

   ```console
   {
     document: {
       pageContent: 'MongoDB continues to expand its AI ecosystem with the announcement of the MongoDB AI Applications Program (MAAP),',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'artificial intelligence, in our offerings or partnerships; the growth and expansion of the market for database products and our ability to penetrate that\n' +
         'market; our ability to integrate acquired businesses and technologies successfully or achieve the expected benefits of such acquisitions; our ability to',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'more of our customers. We also see a tremendous opportunity to win more legacy workloads, as AI has now become a catalyst to modernize these\n' +
         "applications. MongoDB's document-based architecture is particularly well-suited for the variety and scale of data required by AI-powered applications. \n" +
         'We are confident MongoDB will be a substantial beneficiary of this next wave of application development."',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'which provides customers with reference architectures, pre-built partner integrations, and professional services to help\n' +
         'them quickly build AI-powered applications. Accenture will establish a center of excellence focused on MongoDB projects,\n' +
         'and is the first global systems integrator to join MAAP.',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'Bendigo and Adelaide Bank partnered with MongoDB to modernize their core banking technology. With the help of\n' +
         'MongoDB Relational Migrator and generative AI-powered modernization tools, Bendigo and Adelaide Bank decomposed an\n' +
         'outdated consumer-servicing application into microservices and migrated off its underlying legacy relational database',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }

   ```

5. Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context. This example uses the function you just defined to retrieve matching documents from the database, and additionally:

   - Instructs the LLM to include the user's question and retrieved documents in the prompt.

   - Prompts the LLM about MongoDB's latest AI announcements.

   Create a new file called `generate-responses.js`, and paste the following code into it:

   ```javascript
   import { getQueryResults } from './retrieve-documents.js';
   import OpenAI from 'openai';

   async function run() {
       try {
           // Specify search query and retrieve relevant documents
           const question = "In a few sentences, what are MongoDB's latest AI announcements?";
           const documents = await getQueryResults(question);

           // Build a string representation of the retrieved documents to use in the prompt
           let textDocuments = "";
           documents.forEach(doc => {
               textDocuments += doc.document.pageContent;
           });

           // Create a prompt consisting of the question and context to pass to the LLM
           const prompt = `Answer the following question based on the given context.
               Question: {${question}}
               Context: {${textDocuments}}
           `;

           // Initialize OpenAI client
           const client = new OpenAI({
               apiKey: process.env.OPENAI_API_KEY,
           });

           // Prompt the LLM to generate a response based on the context
           const chatCompletion = await client.chat.completions.create({
               model: "gpt-4o",
               messages: [
                   {
                       role: "user",
                       content: prompt
                   },
               ],
           });

           // Output the LLM's response as text.
           console.log(chatCompletion.choices[0].message.content);
       } catch (err) {
           console.log(err.stack);
       }
   }
   run().catch(console.dir);

   ```

   Then, run this command to execute the code. The generated response might vary.

   ```shell
   node --env-file=.env generate-responses.js
   ```

   **Output:**

   ```text
   MongoDB's latest AI announcements include the launch of the MongoDB
   AI Applications Program (MAAP), which provides customers with
   reference architectures, pre-built partner integrations, and
   professional services to help them build AI-powered applications
   quickly. Accenture has joined MAAP as the first global systems
   integrator, establishing a center of excellence focused on MongoDB
   projects. Additionally, Bendigo and Adelaide Bank have partnered
   with MongoDB to modernize their core banking technology using
   MongoDB's Relational Migrator and generative AI-powered
   modernization tools.
   ```

1) Set up the environment.

   Initialize your Node.js project.

   Run the following commands in your terminal to create a new directory named `rag-mongodb` and initialize your project:

   ```text
   mkdir rag-mongodb
   cd rag-mongodb
   npm init -y
   ```

   Install and import dependencies.

   Run the following command:

   ```text
   npm install mongodb @xenova/transformers @huggingface/inference langchain @langchain/community pdf-parse@1
   ```

   Update your `package.json` file.

   In your project's `package.json` file, specify the `type` field as shown in the following example, and then save the file.

   ```javascript
   {
      "name": "rag-mongodb",
      "type": "module",
      ...
   ```

   Create a `.env` file.

   In your project, create a `.env` file to store your MongoDB connection string and API keys:

   ```text
   MONGODB_URI = "<connection-string>"
   HUGGING_FACE_ACCESS_TOKEN = "<hf-token>"
   ```

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

   **Note: Minimum Node.js Version Requirements**

   Node.js v20.x introduced the `--env-file` option. If you are using an older version of Node.js, add the `dotenv` package to your project, or use a different method to manage your environment variables.

2) Create a function to generate vector embeddings.

   In your project, create a file called `get-embeddings.js` and paste the following code:

   ```javascript
   import { env, pipeline } from '@xenova/transformers';

   // Function to generate embeddings for given data
   export async function getEmbedding(data) {
       // Replace this path with the parent directory that contains the model files
       env.localModelPath = '/Users/<username>/local-rag-mongodb/';
       env.allowRemoteModels = false;
       const task = 'feature-extraction';
       const model = 'mxbai-embed-large-v1';
       const embedder = await pipeline(
           task, model);
       const results = await embedder(data, { pooling: 'mean', normalize: true });
       return Array.from(results.data);
   }

   ```

   The `getEmbedding()` function generates vector embeddings by using the [nomic-embed-text-v1](https://huggingface.co/nomic-ai/nomic-embed-text-v1) embedding model from [Sentence Transformers.](https://huggingface.co/sentence-transformers)

3) Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to. The following code uses the [LangChain integration](https://www.mongodb.com/docs/atlas/ai-integrations/langchain-js.md#std-label-langchain-js) and [Node.js driver](https://www.mongodb.com/docs/drivers/node/current/quick-start/) to do the following:

   - Load a PDF that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236/pdf)

   - Split the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   - Create vector embeddings from the chunked data by using the `getEmbedding()` function that you defined.

   - Store these embeddings alongside the chunked data in the `rag_db.test` collection.

   Create a file called `ingest-data.js` in your project, and paste the following code:

   ```javascript
   import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
   import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';
   import * as fs from 'fs';

   async function run() {
       const client = new MongoClient(process.env.MONGODB_URI);

       try {
           // Save online PDF as a file
           const rawData = await fetch("https://investors.mongodb.com/node/12236/pdf");
           const pdfBuffer = await rawData.arrayBuffer();
           const pdfData = Buffer.from(pdfBuffer);
           fs.writeFileSync("investor-report.pdf", pdfData);

           const loader = new PDFLoader(`investor-report.pdf`);
           const data = await loader.load();

           // Chunk the text from the PDF
           const textSplitter = new RecursiveCharacterTextSplitter({
               chunkSize: 400,
               chunkOverlap: 20,
           });
           const docs = await textSplitter.splitDocuments(data);
           console.log(`Successfully chunked the PDF into ${docs.length} documents.`);

           // Connect to your MongoDB cluster
           await client.connect();
           const db = client.db("rag_db");
           const collection = db.collection("test");

           console.log("Generating embeddings and inserting documents...");
           const insertDocuments = [];
           await Promise.all(docs.map(async doc => {

               // Generate embeddings using the function that you defined
               const embedding = await getEmbedding(doc.pageContent);

               // Add the document with the embedding to array of documents for bulk insert
               insertDocuments.push({
                   document: doc,
                   embedding: embedding
               });
           }))

           // Continue processing documents if an error occurs during an operation
           const options = { ordered: false };

           // Insert documents with embeddings into collection
           const result = await collection.insertMany(insertDocuments, options);  
           console.log("Count of documents inserted: " + result.insertedCount); 

       } catch (err) {
           console.log(err.stack);
       }
       finally {
           await client.close();
       }
   }
   run().catch(console.dir);

   ```

   Then, run the following command to execute the code:

   ```sh
   node --env-file=.env ingest-data.js
   ```

   **Output:**

   ```sh
   Generating embeddings and inserting documents...
   Count of documents inserted: 86
   ```

   **Tip:**

   This code takes some time to run. If you're using Atlas, you can verify your vector embeddings by navigating to the `rag_db.test` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

4) Use MongoDB Vector Search to retrieve documents.

   In this section, you set up MongoDB Vector Search to [retrieve](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) documents from your vector database. Complete the following steps:

   Create a MongoDB Vector Search index on your vector embeddings.

   Create a new file named `rag-vector-index.js` and paste the following code. This code connects to your MongoDB deployment and creates an index of the [vectorSearch](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type on the `rag_db.test` collection with 768 dimensions for the open-source embedding model.

   ```javascript
   import { MongoClient } from 'mongodb';

   // Connect to your MongoDB cluster
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
       try {
         const database = client.db("rag_db");
         const collection = database.collection("test");
        
         // Define your Vector Search index
         const index = {
             name: "vector_index",
             type: "vectorSearch",
             definition: {
               "fields": [
                 {
                   "type": "vector",
                   "path": "embedding",
                   "similarity": "cosine",
                   "numDimensions": <dimensions> // Replace with the number of dimensions of your embeddings
                 }
               ]
             }
         }
    
         // Call the method to create the index
         const result = await collection.createSearchIndex(index);
         console.log(result);
       } finally {
         await client.close();
       }
   }
   run().catch(console.dir);

   ```

   Then, run the following command to execute the code:

   ```shell
   node --env-file=.env rag-vector-index.js
   ```

   Define a function to retrieve relevant data.

   Create a new file called `retrieve-documents.js`.

   In this step, you create a retrieval function called `getQueryResults()` that runs a query to retrieve relevant documents. It uses the `getEmbedding()` function to create an embedding from the search query. Then, it runs the query to return semantically-similar documents.

   To learn more, refer to [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   Paste this code into your file:

   ```javascript
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';

   // Function to get the results of a vector query
   export async function getQueryResults(query) {
       // Connect to your cluster
       const client = new MongoClient(process.env.MONGODB_URI);
       
       try {
           // Get embedding for a query
           const queryEmbedding = await getEmbedding(query);

           await client.connect();
           const db = client.db("rag_db");
           const collection = db.collection("test");

           const pipeline = [
               {
                   $vectorSearch: {
                       index: "vector_index",
                       queryVector: queryEmbedding,
                       path: "embedding",
                       exact: true,
                       limit: 5
                   }
               },
               {
                   $project: {
                       _id: 0,
                       document: 1,
                   }
               }
           ];

           // Retrieve documents using a Vector Search query
           const result = collection.aggregate(pipeline);

           const arrayOfQueryDocs = [];
           for await (const doc of result) {
               arrayOfQueryDocs.push(doc);
           }
           return arrayOfQueryDocs;
       } catch (err) {
           console.log(err.stack);
       }
       finally {
           await client.close();
       }
   }

   ```

   Test retrieving the data.

   Create a new file called `retrieve-documents-test.js`. In this step, you check that the function you just defined returns relevant results.

   Paste this code into your file:

   ```javascript
   import { getQueryResults } from './retrieve-documents.js';

   async function run() {
       try {
           const query = "AI Technology";
           const documents = await getQueryResults(query);

           documents.forEach( doc => {
               console.log(doc);
           }); 
       } catch (err) {
           console.log(err.stack);
       }
   }
   run().catch(console.dir);

   ```

   Then, run the following command to execute the code. Your results might vary depending on the embedding model you use.

   ```shell
   node --env-file=.env retrieve-documents-test.js
   ```

   **Output:**

   ```console
   {
     document: {
       pageContent: 'MongoDB continues to expand its AI ecosystem with the announcement of the MongoDB AI Applications Program (MAAP),',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'artificial intelligence, in our offerings or partnerships; the growth and expansion of the market for database products and our ability to penetrate that\n' +
         'market; our ability to integrate acquired businesses and technologies successfully or achieve the expected benefits of such acquisitions; our ability to',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'more of our customers. We also see a tremendous opportunity to win more legacy workloads, as AI has now become a catalyst to modernize these\n' +
         "applications. MongoDB's document-based architecture is particularly well-suited for the variety and scale of data required by AI-powered applications. \n" +
         'We are confident MongoDB will be a substantial beneficiary of this next wave of application development."',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'which provides customers with reference architectures, pre-built partner integrations, and professional services to help\n' +
         'them quickly build AI-powered applications. Accenture will establish a center of excellence focused on MongoDB projects,\n' +
         'and is the first global systems integrator to join MAAP.',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'Bendigo and Adelaide Bank partnered with MongoDB to modernize their core banking technology. With the help of\n' +
         'MongoDB Relational Migrator and generative AI-powered modernization tools, Bendigo and Adelaide Bank decomposed an\n' +
         'outdated consumer-servicing application into microservices and migrated off its underlying legacy relational database',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }

   ```

5) Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context. This example uses the function you just defined to retrieve matching documents from the database, and additionally:

   - Instructs the LLM to include the user's question and retrieved documents in the prompt.

   - Prompts the LLM about MongoDB's latest AI announcements.

   Create a new file called `generate-responses.js`, and paste the following code into it:

   ```javascript
   import { getQueryResults } from './retrieve-documents.js';
   import { HfInference } from '@huggingface/inference'

   async function run() {
       try {
           // Specify search query and retrieve relevant documents
           const question = "In a few sentences, what are MongoDB's latest AI announcements?";
           const documents = await getQueryResults(question);

           // Build a string representation of the retrieved documents to use in the prompt
           let textDocuments = "";
           documents.forEach(doc => {
               textDocuments += doc.document.pageContent;
           });

           // Create a prompt consisting of the question and context to pass to the LLM
           const prompt = `Answer the following question based on the given context.
               Question: {${question}}
               Context: {${textDocuments}}
           `;

           // Prompt the LLM to generate a response based on the context
           const client = new InferenceClient(process.env.HUGGING_FACE_ACCESS_TOKEN);
           const chatCompletion = await client.chatCompletion({
               provider: "fireworks-ai",
               model: "mistralai/Mixtral-8x22B-Instruct-v0.1",
               messages: [
                   {
                       role: "user",
                       content: prompt
                   },
               ],
           });

           // Output the LLM's response as text.
           console.log(chatCompletion.choices[0].message.content);
       } catch (err) {
           console.log(err.stack);
       }
   }
   run().catch(console.dir);

   ```

   Then, run this command to execute the code. The generated response might vary.

   ```shell
   node --env-file=.env generate-responses.js
   ```

   **Output:**

   ```text
   MongoDB's latest AI announcements include the MongoDB AI Applications
   Program (MAAP), which provides customers with reference architectures,
   pre-built partner integrations, and professional services to help them
   quickly build AI-powered applications. Accenture will establish a
   center of excellence focused on MongoDB projects and is the first
   global systems integrator to join MAAP. Additionally, MongoDB has
   announced significant performance improvements in MongoDB 8.0,
   featuring faster reads, updates, bulk inserts, and time series queries.
   ```

1. Set up the environment.

   Initialize your Go project.

   Run the following commands in your terminal to create a new directory named `rag-mongodb` and initialize your project:

   ```text
   mkdir rag-mongodb
   cd rag-mongodb
   go mod init rag-mongodb
   ```

   Install and import dependencies.

   Run the following commands:

   ```text
   go get github.com/joho/godotenv
   go get go.mongodb.org/mongo-driver/v2/mongo
   go get github.com/tmc/langchaingo/llms
   go get github.com/tmc/langchaingo/documentloaders
   go get github.com/tmc/langchaingo/embeddings/voyageai
   go get github.com/tmc/langchaingo/llms/openai
   go get github.com/tmc/langchaingo/prompts
   go get github.com/tmc/langchaingo/vectorstores/mongovector
   ```

   Create a `.env` file.

   In your project, create a `.env` file to store your MongoDB connection string and API keys.

   ```text
   MONGODB_URI = "<connection-string>"
   VOYAGEAI_API_KEY = "<voyage-api-key>"
   OPENAI_API_KEY = "<openai-api-key>"
   ```

   Replace the placeholder values with your credentials.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

2. Create a function to retrieve and process your data.

   In this section, you download and process sample data into MongoDB that LLMs don't have access to. The following code uses the [Go library for LangChain](https://tmc.github.io/langchaingo/docs/) to perform the following tasks:

   - Create a HTML file that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236)

   - Split the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   Run the following command to create a directory that stores common functions.

   ```text
   mkdir common && cd common
   ```

   Create a file called `process-file.go` in the `common` directory, and paste the following code into it:

   ```go
   package common

   import (
   	"context"
   	"io"
   	"log"
   	"net/http"
   	"os"

   	"github.com/tmc/langchaingo/documentloaders"
   	"github.com/tmc/langchaingo/schema"
   	"github.com/tmc/langchaingo/textsplitter"
   )

   func DownloadReport(filename string) {
   	_, err := os.Stat(filename)
   	if err == nil {
   		return
   	}

   	const url = "https://investors.mongodb.com/node/12236"
   	log.Println("Downloading ", url, " to ", filename)

   	resp, err := http.Get(url)
   	if err != nil {
   		log.Fatalf("failed to connect to download the report: %v", err)
   	}

   	defer func() {
   		if err := resp.Body.Close(); err != nil {
   			log.Fatalf("failed to close the resource: %v", err)
   		}
   	}()

   	f, err := os.Create(filename)
   	if err != nil {
   		return
   	}
   	defer func() {
   		if err := f.Close(); err != nil {
   			log.Fatalf("failed to close file: %v", err)
   		}
   	}()

   	_, err = io.Copy(f, resp.Body)
   	if err != nil {
   		log.Fatalf("failed to copy the report: %v", err)
   	}
   }

   func ProcessFile(filename string) []schema.Document {
   	ctx := context.Background()
   	f, err := os.Open(filename)
   	if err != nil {
   		log.Fatalf("failed to open file: %v", err)
   	}
   	defer func() {
   		if err := f.Close(); err != nil {
   			log.Fatalf("failed to close file: %v", err)
   		}
   	}()

   	html := documentloaders.NewHTML(f)
   	split := textsplitter.NewRecursiveCharacter()
   	split.ChunkSize = 400
   	split.ChunkOverlap = 20
   	docs, err := html.LoadAndSplit(ctx, split)
   	if err != nil {
   		log.Fatalf("failed to chunk the HTML into documents: %v", err)
   	}
   	log.Printf("Successfully chunked the HTML into %v documents.\n", len(docs))

   	return docs
   }

   ```

3. Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to. The following code uses the [Go library for LangChain](https://tmc.github.io/langchaingo/docs/) and [Go driver](https://www.mongodb.com/docs/drivers/go/current/quick-start/) to perform the following tasks:

   - Load the Voyage AI embedding model.

   - Create an instance of [mongovector](https://pkg.go.dev/github.com/tmc/langchaingo/vectorstores/mongovector) from your Go driver client and Voyage AI embedding model to implement the vector store.

   - Create and store vector embeddings from the chunked data by using the `mongovector.AddDocuments()` method. The code stores the chunked data and corresponding embeddings in the `rag_db.test` collection.

   Navigate to the root of the `rag-mongodb` project directory.

   Create a file called `ingest-data.go` in your project, and paste the following code into it:

   This code uses the `voyage-3-large` embedding model from [Voyage AI](https://www.mongodb.com/docs/voyageai.md#std-label-voyage-landing) to generate vector embeddings.

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"os"
   	"rag-mongodb/common"

   	"github.com/joho/godotenv"
   	"github.com/tmc/langchaingo/embeddings/voyageai"
   	"github.com/tmc/langchaingo/vectorstores/mongovector"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	filename := "investor-report.html"
   	common.DownloadReport(filename)
   	docs := common.ProcessFile(filename)

   	if err := godotenv.Load(); err != nil {
   		log.Fatal("no .env file found")
   	}

   	// Connect to your MongoDB cluster
   	uri := os.Getenv("MONGODB_URI")
   	if uri == "" {
   		log.Fatal("set your 'MONGODB_URI' environment variable.")
   	}

   	client, err := mongo.Connect(options.Client().ApplyURI(uri))
   	if err != nil {
   		log.Fatalf("failed to connect to server: %v", err)
   	}

   	defer func() {
   		if err := client.Disconnect(context.Background()); err != nil {
   			log.Fatalf("error disconnecting the client: %v", err)
   		}
   	}()

   	coll := client.Database("rag_db").Collection("test")

   	embedder, err := voyageai.NewVoyageAI(
   		voyageai.WithModel("voyage-3-large"),
   	)

   	if err != nil {
   		log.Fatal("failed to create an embedder: %v", err)
   	}

   	store := mongovector.New(coll, embedder, mongovector.WithPath("embedding"))

   	// Add documents to the MongoDB collection.
   	log.Println("Generating embeddings.")
   	result, err := store.AddDocuments(context.Background(), docs)

   	if err != nil {
   		log.Fatalf("failed to insert documents: %v", err)
   	}
   	fmt.Printf("Successfully inserted %v documents\n", len(result))
   }

   ```

   Run the following command to execute the code:

   ```shell
   go run ingest-data.go
   ```

   **Output:**

   ```console
   Successfully chunked the HTML into 163 documents.
   Generating embeddings.
   Successfully inserted 163 documents

   ```

4. Use MongoDB Vector Search to retrieve documents.

   In this section, you set up MongoDB Vector Search to [retrieve](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) documents from your vector database. Complete the following steps:

   Create a MongoDB Vector Search index on your vector embeddings.

   Create a new file named `rag-vector-index.go` and paste the following code. This code connects to your MongoDB deployment and creates an index of the [vectorSearch](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type on the `rag_db.test` collection.

   ```go
   package main

   import (
   	"context"
   	"log"
   	"os"
   	"time"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Fatal("no .env file found")
   	}
   	// Connect to your MongoDB cluster
   	uri := os.Getenv("MONGODB_URI")
   	if uri == "" {
   		log.Fatal("set your 'MONGODB_URI' environment variable.")
   	}
   	clientOptions := options.Client().ApplyURI(uri)
   	client, err := mongo.Connect(clientOptions)
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	// Specify the database and collection
   	coll := client.Database("rag_db").Collection("test")
   	indexName := "vector_index"
   	opts := options.SearchIndexes().SetName(indexName).SetType("vectorSearch")

   	type vectorDefinitionField struct {
   		Type          string `bson:"type"`
   		Path          string `bson:"path"`
   		NumDimensions int    `bson:"numDimensions"`
   		Similarity    string `bson:"similarity"`
   	}

   	type filterField struct {
   		Type string `bson:"type"`
   		Path string `bson:"path"`
   	}

   	type vectorDefinition struct {
   		Fields []vectorDefinitionField `bson:"fields"`
   	}

   	indexModel := mongo.SearchIndexModel{
   		Definition: vectorDefinition{
   			Fields: []vectorDefinitionField{{
   				Type:          "vector",
   				Path:          "embedding",
   				NumDimensions: 1024,
   				Similarity:    "cosine"}},
   		},
   		Options: opts,
   	}

   	log.Println("Creating the index.")
   	searchIndexName, err := coll.SearchIndexes().CreateOne(ctx, indexModel)
   	if err != nil {
   		log.Fatalf("failed to create the search index: %v", err)
   	}

   	// Await the creation of the index.
   	log.Println("Polling to confirm successful index creation.")
   	log.Println("NOTE: This may take up to a minute.")
   	searchIndexes := coll.SearchIndexes()
   	var doc bson.Raw
   	for doc == nil {
   		cursor, err := searchIndexes.List(ctx, options.SearchIndexes().SetName(searchIndexName))
   		if err != nil {
   			log.Printf("failed to list search indexes: %w", err)
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

   Run the following command to create the index:

   ```shell
   go run rag-vector-index.go
   ```

   Define a function to retrieve relevant data.

   In this step, you create a retrieval function called `GetQueryResults()` that runs a query to retrieve relevant documents. It uses the `mongovector.SimilaritySearch()` method, which automatically generates a vector representation of your query string and returns relevant results.

   To learn more, refer to [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   In the `common` directory, create a new file called `get-query-results.go`, and paste the following code into it:

   ```go
   package common

   import (
   	"context"
   	"log"
   	"os"

   	"github.com/joho/godotenv"
   	"github.com/tmc/langchaingo/embeddings/voyageai"
   	"github.com/tmc/langchaingo/schema"
   	"github.com/tmc/langchaingo/vectorstores/mongovector"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func GetQueryResults(query string) []schema.Document {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Fatal("no .env file found")
   	}

   	// Connect to your MongoDB cluster
   	uri := os.Getenv("MONGODB_URI")
   	if uri == "" {
   		log.Fatal("set your 'MONGODB_URI' environment variable.")
   	}
   	clientOptions := options.Client().ApplyURI(uri)
   	client, err := mongo.Connect(clientOptions)
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	// Specify the database and collection
   	coll := client.Database("rag_db").Collection("test")

   	embedder, err := voyageai.NewVoyageAI(
   		voyageai.WithModel("voyage-3-large"),
   	)

   	if err != nil {
   		log.Fatal("failed to create an embedder: %v", err)
   	}

   	store := mongovector.New(coll, embedder, mongovector.WithPath("embedding"))

   	// Search for similar documents.
   	docs, err := store.SimilaritySearch(context.Background(), query, 5)
   	if err != nil {
   		log.Fatal("error performing similarity search: %v", err)
   	}

   	return docs
   }

   ```

   Test retrieving the data.

   In the `rag-mongodb` project directory, create a new file called `retrieve-documents-test.go`. In this step, you check that the function you just defined returns relevant results.

   Paste this code into your file:

   ```go
   package main

   import (
   	"fmt"
   	"rag-mongodb/common" // Module that contains the GetQueryResults function
   )

   func main() {
   	query := "AI Technology"
   	documents := common.GetQueryResults(query)
   	for _, doc := range documents {
   		fmt.Printf("Text: %s \nScore: %v \n\n", doc.PageContent, doc.Score)
   	}
   }

   ```

   Run the following command to execute the code. Your results might vary.

   ```shell
   go run retrieve-documents-test.go
   ```

   **Output:**

   ```console
   {
     document: {
       pageContent: 'MongoDB continues to expand its AI ecosystem with the announcement of the MongoDB AI Applications Program (MAAP),',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'artificial intelligence, in our offerings or partnerships; the growth and expansion of the market for database products and our ability to penetrate that\n' +
         'market; our ability to integrate acquired businesses and technologies successfully or achieve the expected benefits of such acquisitions; our ability to',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'more of our customers. We also see a tremendous opportunity to win more legacy workloads, as AI has now become a catalyst to modernize these\n' +
         "applications. MongoDB's document-based architecture is particularly well-suited for the variety and scale of data required by AI-powered applications. \n" +
         'We are confident MongoDB will be a substantial beneficiary of this next wave of application development."',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'which provides customers with reference architectures, pre-built partner integrations, and professional services to help\n' +
         'them quickly build AI-powered applications. Accenture will establish a center of excellence focused on MongoDB projects,\n' +
         'and is the first global systems integrator to join MAAP.',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'Bendigo and Adelaide Bank partnered with MongoDB to modernize their core banking technology. With the help of\n' +
         'MongoDB Relational Migrator and generative AI-powered modernization tools, Bendigo and Adelaide Bank decomposed an\n' +
         'outdated consumer-servicing application into microservices and migrated off its underlying legacy relational database',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }

   ```

5. Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context. This example uses the function you just defined to retrieve matching documents from the database, and additionally:

   - Instructs the LLM to include the user's question and retrieved documents in the prompt.

   - Prompts the LLM about MongoDB's latest AI announcements.

   In the `rag-mongodb` project directory, create a new file called `generate-responses.go`, and paste the following code into it:

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"os"
   	"rag-mongodb/common" // Module that contains the GetQueryResults function
   	"strings"

   	"github.com/tmc/langchaingo/llms"
   	"github.com/tmc/langchaingo/llms/openai"
   	"github.com/tmc/langchaingo/prompts"
   )

   func main() {
   	ctx := context.Background()
   	question := "In a few sentences, what are MongoDB's latest AI announcements?"
   	documents := common.GetQueryResults(question)
   	var textDocuments strings.Builder
   	for _, doc := range documents {
   		textDocuments.WriteString(doc.PageContent)
   	}

   	template := prompts.NewPromptTemplate(
   		`Answer the following question based on the given context.
   			Question: {{.question}}
   			Context: {{.context}}`,
   		[]string{"question", "context"},
   	)
   	prompt, err := template.Format(map[string]any{
   		"question": question,
   		"context":  textDocuments.String(),
   	})

   	// Loads OpenAI API key from environment
   	openaiApiKey := os.Getenv("OPENAI_API_KEY")
   	if openaiApiKey == "" {
   		log.Fatal("Set your OPENAI_API_KEY environment variable in the .env file")
   	}

   	// Creates an OpenAI LLM client
   	llm, err := openai.New(
   		openai.WithToken(openaiApiKey),
   		openai.WithModel("gpt-4o"),
   	)
   	if err != nil {
   		log.Fatalf("Failed to create an LLM client: %v", err)
   	}
   	completion, err := llms.GenerateFromSinglePrompt(ctx, llm, prompt)
   	if err != nil {
   		log.Fatalf("failed to generate a response from the prompt: %v", err)
   	}
   	fmt.Println(completion)
   }

   ```

   Run this command to execute the code. The generated response might vary.

   ```shell
   go run generate-responses.go
   ```

   **Output:**

   ```text
   MongoDB's latest AI announcements include the MongoDB AI Applications
   Program (MAAP), which provides customers with reference architectures,
   pre-built partner integrations, and professional services to help them
   quickly build AI-powered applications. Accenture will establish a
   center of excellence focused on MongoDB projects and is the first
   global systems integrator to join MAAP.
   ```

1) Set up the environment.

   Initialize your Go project.

   Run the following commands in your terminal to create a new directory named `rag-mongodb` and initialize your project:

   ```text
   mkdir rag-mongodb
   cd rag-mongodb
   go mod init rag-mongodb
   ```

   Install and import dependencies.

   Run the following commands:

   ```text
   go get github.com/joho/godotenv
   go get go.mongodb.org/mongo-driver/v2/mongo
   go get github.com/tmc/langchaingo/llms
   go get github.com/tmc/langchaingo/documentloaders
   go get github.com/tmc/langchaingo/embeddings/huggingface
   go get github.com/tmc/langchaingo/llms/openai
   go get github.com/tmc/langchaingo/prompts
   go get github.com/tmc/langchaingo/vectorstores/mongovector
   ```

   Create a `.env` file.

   In your project, create a `.env` file to store your MongoDB connection string and API keys.

   ```text
   MONGODB_URI = "<connection-string>"
   HUGGINGFACEHUB_API_TOKEN = "<hf-token>"
   OPENAI_API_KEY = "<openai-api-key>"
   ```

   Replace the placeholder values with your credentials.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

2) Create a function to retrieve and process your data.

   In this section, you download and process sample data into MongoDB that LLMs don't have access to. The following code uses the [Go library for LangChain](https://tmc.github.io/langchaingo/docs/) to perform the following tasks:

   - Create a HTML file that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236)

   - Split the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   Run the following command to create a directory that stores common functions.

   ```text
   mkdir common && cd common
   ```

   Create a file called `process-file.go` in the `common` directory, and paste the following code into it:

   ```go
   package common

   import (
   	"context"
   	"io"
   	"log"
   	"net/http"
   	"os"

   	"github.com/tmc/langchaingo/documentloaders"
   	"github.com/tmc/langchaingo/schema"
   	"github.com/tmc/langchaingo/textsplitter"
   )

   func DownloadReport(filename string) {
   	_, err := os.Stat(filename)
   	if err == nil {
   		return
   	}

   	const url = "https://investors.mongodb.com/node/12236"
   	log.Println("Downloading ", url, " to ", filename)

   	resp, err := http.Get(url)
   	if err != nil {
   		log.Fatalf("failed to connect to download the report: %v", err)
   	}

   	defer func() {
   		if err := resp.Body.Close(); err != nil {
   			log.Fatalf("failed to close the resource: %v", err)
   		}
   	}()

   	f, err := os.Create(filename)
   	if err != nil {
   		return
   	}
   	defer func() {
   		if err := f.Close(); err != nil {
   			log.Fatalf("failed to close file: %v", err)
   		}
   	}()

   	_, err = io.Copy(f, resp.Body)
   	if err != nil {
   		log.Fatalf("failed to copy the report: %v", err)
   	}
   }

   func ProcessFile(filename string) []schema.Document {
   	ctx := context.Background()
   	f, err := os.Open(filename)
   	if err != nil {
   		log.Fatalf("failed to open file: %v", err)
   	}
   	defer func() {
   		if err := f.Close(); err != nil {
   			log.Fatalf("failed to close file: %v", err)
   		}
   	}()

   	html := documentloaders.NewHTML(f)
   	split := textsplitter.NewRecursiveCharacter()
   	split.ChunkSize = 400
   	split.ChunkOverlap = 20
   	docs, err := html.LoadAndSplit(ctx, split)
   	if err != nil {
   		log.Fatalf("failed to chunk the HTML into documents: %v", err)
   	}
   	log.Printf("Successfully chunked the HTML into %v documents.\n", len(docs))

   	return docs
   }

   ```

3) Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to. The following code uses the [Go library for LangChain](https://tmc.github.io/langchaingo/docs/) and [Go driver](https://www.mongodb.com/docs/drivers/go/current/quick-start/) to perform the following tasks:

   - Load the Hugging Face embedding model.

   - Create an instance of [mongovector](https://pkg.go.dev/github.com/tmc/langchaingo/vectorstores/mongovector) from your Go driver client and Hugging Face embedding model to implement the vector store.

   - Create and store vector embeddings from the chunked data by using the `mongovector.AddDocuments()` method. The code stores the chunked data and corresponding embeddings in the `rag_db.test` collection.

   Navigate to the root of the `rag-mongodb` project directory.

   Create a file called `ingest-data.go` in your project, and paste the following code into it:

   This code uses the [mxbai-embed-large-v1](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1) embedding model from Hugging Face to generate vector embeddings.

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"os"
   	"rag-mongodb/common"

   	"github.com/joho/godotenv"
   	"github.com/tmc/langchaingo/embeddings/huggingface"
   	"github.com/tmc/langchaingo/vectorstores/mongovector"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	filename := "investor-report.html"
   	common.DownloadReport(filename)
   	docs := common.ProcessFile(filename)

   	if err := godotenv.Load(); err != nil {
   		log.Fatal("no .env file found")
   	}

   	// Connect to your MongoDB cluster
   	uri := os.Getenv("MONGODB_URI")
   	if uri == "" {
   		log.Fatal("set your 'MONGODB_URI' environment variable.")
   	}

   	client, err := mongo.Connect(options.Client().ApplyURI(uri))
   	if err != nil {
   		log.Fatalf("failed to connect to server: %v", err)
   	}

   	defer func() {
   		if err := client.Disconnect(context.Background()); err != nil {
   			log.Fatalf("error disconnecting the client: %v", err)
   		}
   	}()

   	coll := client.Database("rag_db").Collection("test")

   	embedder, err := huggingface.NewHuggingface(
   		huggingface.WithModel("mixedbread-ai/mxbai-embed-large-v1"),
   		huggingface.WithTask("feature-extraction"))

   	if err != nil {
   		log.Fatal("failed to create an embedder: %v", err)
   	}

   	store := mongovector.New(coll, embedder, mongovector.WithPath("embedding"))

   	// Add documents to the MongoDB collection.
   	log.Println("Generating embeddings.")
   	result, err := store.AddDocuments(context.Background(), docs)

   	if err != nil {
   		log.Fatalf("failed to insert documents: %v", err)
   	}
   	fmt.Printf("Successfully inserted %v documents\n", len(result))
   }

   ```

   Run the following command to execute the code:

   ```shell
   go run ingest-data.go
   ```

   **Output:**

   ```console
   Successfully chunked the HTML into 163 documents.
   Generating embeddings.
   Successfully inserted 163 documents

   ```

4) Use MongoDB Vector Search to retrieve documents.

   In this section, you set up MongoDB Vector Search to [retrieve](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) documents from your vector database. Complete the following steps:

   Create a MongoDB Vector Search index on your vector embeddings.

   Create a new file named `rag-vector-index.go` and paste the following code. This code connects to your MongoDB deployment and creates an index of the [vectorSearch](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type on the `rag_db.test` collection.

   ```go
   package main

   import (
   	"context"
   	"log"
   	"os"
   	"time"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Fatal("no .env file found")
   	}
   	// Connect to your MongoDB cluster
   	uri := os.Getenv("MONGODB_URI")
   	if uri == "" {
   		log.Fatal("set your 'MONGODB_URI' environment variable.")
   	}
   	clientOptions := options.Client().ApplyURI(uri)
   	client, err := mongo.Connect(clientOptions)
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	// Specify the database and collection
   	coll := client.Database("rag_db").Collection("test")
   	indexName := "vector_index"
   	opts := options.SearchIndexes().SetName(indexName).SetType("vectorSearch")

   	type vectorDefinitionField struct {
   		Type          string `bson:"type"`
   		Path          string `bson:"path"`
   		NumDimensions int    `bson:"numDimensions"`
   		Similarity    string `bson:"similarity"`
   	}

   	type filterField struct {
   		Type string `bson:"type"`
   		Path string `bson:"path"`
   	}

   	type vectorDefinition struct {
   		Fields []vectorDefinitionField `bson:"fields"`
   	}

   	indexModel := mongo.SearchIndexModel{
   		Definition: vectorDefinition{
   			Fields: []vectorDefinitionField{{
   				Type:          "vector",
   				Path:          "embedding",
   				NumDimensions: 1024,
   				Similarity:    "cosine"}},
   		},
   		Options: opts,
   	}

   	log.Println("Creating the index.")
   	searchIndexName, err := coll.SearchIndexes().CreateOne(ctx, indexModel)
   	if err != nil {
   		log.Fatalf("failed to create the search index: %v", err)
   	}

   	// Await the creation of the index.
   	log.Println("Polling to confirm successful index creation.")
   	log.Println("NOTE: This may take up to a minute.")
   	searchIndexes := coll.SearchIndexes()
   	var doc bson.Raw
   	for doc == nil {
   		cursor, err := searchIndexes.List(ctx, options.SearchIndexes().SetName(searchIndexName))
   		if err != nil {
   			log.Printf("failed to list search indexes: %w", err)
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

   Run the following command to create the index:

   ```shell
   go run rag-vector-index.go
   ```

   Define a function to retrieve relevant data.

   In this step, you create a retrieval function called `GetQueryResults()` that runs a query to retrieve relevant documents. It uses the `mongovector.SimilaritySearch()` method, which automatically generates a vector representation of your query string and returns relevant results.

   To learn more, refer to [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   In the `common` directory, create a new file called `get-query-results.go`, and paste the following code into it:

   This code uses the [mxbai-embed-large-v1](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1) embedding model from Hugging Face to generate vector embeddings.

   ```go
   package common

   import (
   	"context"
   	"log"
   	"os"

   	"github.com/joho/godotenv"
   	"github.com/tmc/langchaingo/embeddings/huggingface"
   	"github.com/tmc/langchaingo/schema"
   	"github.com/tmc/langchaingo/vectorstores/mongovector"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func GetQueryResults(query string) []schema.Document {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Fatal("no .env file found")
   	}

   	// Connect to your MongoDB cluster
   	uri := os.Getenv("MONGODB_URI")
   	if uri == "" {
   		log.Fatal("set your 'MONGODB_URI' environment variable.")
   	}
   	clientOptions := options.Client().ApplyURI(uri)
   	client, err := mongo.Connect(clientOptions)
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	// Specify the database and collection
   	coll := client.Database("rag_db").Collection("test")

   	embedder, err := huggingface.NewHuggingface(
   		huggingface.WithModel("mixedbread-ai/mxbai-embed-large-v1"),
   		huggingface.WithTask("feature-extraction"))

   	if err != nil {
   		log.Fatal("failed to create an embedder: %v", err)
   	}

   	store := mongovector.New(coll, embedder, mongovector.WithPath("embedding"))

   	// Search for similar documents.
   	docs, err := store.SimilaritySearch(context.Background(), query, 5)
   	if err != nil {
   		log.Fatal("error performing similarity search: %v", err)
   	}

   	return docs
   }

   ```

   Test retrieving the data.

   In the `rag-mongodb` project directory, create a new file called `retrieve-documents-test.go`. In this step, you check that the function you just defined returns relevant results.

   Paste this code into your file:

   ```go
   package main

   import (
   	"fmt"
   	"rag-mongodb/common" // Module that contains the GetQueryResults function
   )

   func main() {
   	query := "AI Technology"
   	documents := common.GetQueryResults(query)
   	for _, doc := range documents {
   		fmt.Printf("Text: %s \nScore: %v \n\n", doc.PageContent, doc.Score)
   	}
   }

   ```

   Run the following command to execute the code. Your results might vary depending on the embedding model you use.

   ```shell
   go run retrieve-documents-test.go
   ```

   **Output:**

   ```console
   {
     document: {
       pageContent: 'MongoDB continues to expand its AI ecosystem with the announcement of the MongoDB AI Applications Program (MAAP),',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'artificial intelligence, in our offerings or partnerships; the growth and expansion of the market for database products and our ability to penetrate that\n' +
         'market; our ability to integrate acquired businesses and technologies successfully or achieve the expected benefits of such acquisitions; our ability to',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'more of our customers. We also see a tremendous opportunity to win more legacy workloads, as AI has now become a catalyst to modernize these\n' +
         "applications. MongoDB's document-based architecture is particularly well-suited for the variety and scale of data required by AI-powered applications. \n" +
         'We are confident MongoDB will be a substantial beneficiary of this next wave of application development."',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'which provides customers with reference architectures, pre-built partner integrations, and professional services to help\n' +
         'them quickly build AI-powered applications. Accenture will establish a center of excellence focused on MongoDB projects,\n' +
         'and is the first global systems integrator to join MAAP.',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'Bendigo and Adelaide Bank partnered with MongoDB to modernize their core banking technology. With the help of\n' +
         'MongoDB Relational Migrator and generative AI-powered modernization tools, Bendigo and Adelaide Bank decomposed an\n' +
         'outdated consumer-servicing application into microservices and migrated off its underlying legacy relational database',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }

   ```

5) Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context. This example uses the function you just defined to retrieve matching documents from the database, and additionally:

   - Instructs the LLM to include the user's question and retrieved documents in the prompt.

   - Prompts the LLM about MongoDB's latest AI announcements.

   In the `rag-mongodb` project directory, create a new file called `generate-responses.go`, and paste the following code into it:

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"os"
   	"rag-mongodb/common" // Module that contains the GetQueryResults function
   	"strings"

   	"github.com/tmc/langchaingo/llms"
   	"github.com/tmc/langchaingo/llms/openai"
   	"github.com/tmc/langchaingo/prompts"
   )

   func main() {
   	ctx := context.Background()
   	question := "In a few sentences, what are MongoDB's latest AI announcements?"
   	documents := common.GetQueryResults(question)
   	var textDocuments strings.Builder
   	for _, doc := range documents {
   		textDocuments.WriteString(doc.PageContent)
   	}

   	template := prompts.NewPromptTemplate(
   		`Answer the following question based on the given context.
   			Question: {{.question}}
   			Context: {{.context}}`,
   		[]string{"question", "context"},
   	)
   	prompt, err := template.Format(map[string]any{
   		"question": question,
   		"context":  textDocuments.String(),
   	})

   	// Loads OpenAI API key from environment
   	openaiApiKey := os.Getenv("OPENAI_API_KEY")
   	if openaiApiKey == "" {
   		log.Fatal("Set your OPENAI_API_KEY environment variable in the .env file")
   	}

   	// Creates an OpenAI LLM client
   	llm, err := openai.New(
   		openai.WithToken(openaiApiKey),
   		openai.WithModel("gpt-4o"),
   	)
   	if err != nil {
   		log.Fatalf("Failed to create an LLM client: %v", err)
   	}
   	completion, err := llms.GenerateFromSinglePrompt(ctx, llm, prompt)
   	if err != nil {
   		log.Fatalf("failed to generate a response from the prompt: %v", err)
   	}
   	fmt.Println(completion)
   }

   ```

   Run this command to execute the code. The generated response might vary.

   ```shell
   go run generate-responses.go
   ```

   **Output:**

   ```text
   MongoDB's latest AI announcements include the MongoDB AI Applications
   Program (MAAP), which provides customers with reference architectures,
   pre-built partner integrations, and professional services to help them
   quickly build AI-powered applications. Accenture will establish a
   center of excellence focused on MongoDB projects and is the first
   global systems integrator to join MAAP.
   ```

1. Create your Java project and install dependencies.

   From your IDE, create a Java project using Maven or Gradle.

   Add the following dependencies, depending on your package manager:

   ### Maven

   If you are using Maven, add the following dependencies to the `dependencies` array and Bill of Materials (BOM) to the `dependencyManagement` array in your project's `pom.xml` file:

   ```xml
   <dependencies>
       <!-- MongoDB Java Sync Driver -->
       <dependency>
           <groupId>org.mongodb</groupId>
           <artifactId>mongodb-driver-sync</artifactId>
           <version>5.2.0</version>
       </dependency>
       <!-- Core LangChain4j library (provides Document interface, etc.) -->
       <dependency>
           <groupId>dev.langchain4j</groupId>
           <artifactId>langchain4j</artifactId>
       </dependency>
       <!-- Voyage AI integration -->
       <dependency>
           <groupId>dev.langchain4j</groupId>
           <artifactId>langchain4j-voyage-ai</artifactId>
       </dependency>
       <!-- Open AI integration -->
       <dependency>
           <groupId>dev.langchain4j</groupId>
           <artifactId>langchain4j-open-ai</artifactId>
       </dependency>
       <!-- Apache PDFBox Document Parser -->
       <dependency>
           <groupId>dev.langchain4j</groupId>
           <artifactId>langchain4j-document-parser-apache-pdfbox</artifactId>
       </dependency>
   </dependencies>
   <dependencyManagement>
      <dependencies>
            <!-- Bill of Materials (BOM) to manage Java library versions -->
            <dependency>
               <groupId>dev.langchain4j</groupId>
               <artifactId>langchain4j-bom</artifactId>
               <version>1.1.0</version>
               <type>pom</type>
               <scope>import</scope>
            </dependency>
      </dependencies>
   </dependencyManagement>
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

   ```shell
      VOYAGE_AI_KEY=<voyage-api-key>
      OPENAI_API_KEY=<openai-api-key>
      MONGODB_URI=<connection-string>
   ```

   Update the placeholders with the following values:

   - Replace the `<voyage-api-key>` placeholder value with your Voyage AI API key.

   - Replace the `<openai-api-key>` placeholder value with your OpenAI API key.

   - Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

     ### Atlas Cluster

     Your connection string should use the following format:

     ```text
     mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
     ```

     To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Define methods to parse and split the data.

   Create a file named `PDFProcessor.java` and paste the following code.

   This code defines the following methods:

   - The `parsePDFDocument` method uses the [Apache PDFBox](https://pdfbox.apache.org/) library and [LangChain4j URL Document Loader](https://docs.langchain4j.dev/integrations/document-loaders/url) to load and parse a PDF file at a given URL. The method returns the parsed PDF as a langchain4j Document.

   - The `splitDocument` method splits a given langchain4j Document into chunks according to the specified *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks). The method returns a list of text segments.

   ```java
   import dev.langchain4j.data.document.Document;
   import dev.langchain4j.data.document.DocumentParser;
   import dev.langchain4j.data.document.DocumentSplitter;
   import dev.langchain4j.data.document.loader.UrlDocumentLoader;
   import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;
   import dev.langchain4j.data.document.splitter.DocumentByCharacterSplitter;
   import dev.langchain4j.data.segment.TextSegment;

   import java.util.List;

   public class PDFProcessor {

       /** Parses a PDF document from the specified URL, and returns a
        * langchain4j Document object.
        * */
       public static Document parsePDFDocument(String url) {
           DocumentParser parser = new ApachePdfBoxDocumentParser();
           return UrlDocumentLoader.load(url, parser);
       }

       /** Splits a parsed langchain4j Document based on the specified chunking
        * parameters, and returns an array of text segments.
        */
       public static List<TextSegment> splitDocument(Document document) {
           int maxChunkSize = 400; // number of characters
           int maxChunkOverlap = 20; // number of overlapping characters between consecutive chunks

           DocumentSplitter splitter = new DocumentByCharacterSplitter(maxChunkSize, maxChunkOverlap);
           return splitter.split(document);
       }
   }

   ```

4. Define a method to generate vector embeddings.

   Create a file named `EmbeddingProvider.java` and paste the following code.

   This code defines two methods to generate embeddings for a given input using the [voyage-3-large](https://www.mongodb.com/docs/voyageai/models.md#std-label-voyage-models) embedding model from Voyage AI:

   - **Multiple Inputs**: The `getEmbeddings()` method accepts an array of text inputs (`List<String>`), allowing you to create multiple embeddings in a single API call. The method converts the API-provided arrays of floats to BSON arrays of doubles for storing in MongoDB.

   - **Single Input**: The `getEmbedding()` method accepts a single `String`, which represents a query you want to make against your vector data. The method converts the API-provided array of floats to a BSON array of doubles to use when querying your collection.

   ```java
   import dev.langchain4j.data.embedding.Embedding;
   import dev.langchain4j.data.segment.TextSegment;
   import dev.langchain4j.model.embedding.EmbeddingModel;
   import dev.langchain4j.model.voyageai.VoyageAiEmbeddingModel;
   import dev.langchain4j.model.output.Response;
   import org.bson.BsonArray;
   import org.bson.BsonDouble;
   import java.util.List;
   import static java.time.Duration.ofSeconds;

   public class EmbeddingProvider {

       private static EmbeddingModel embeddingModel;

       private static EmbeddingModel getEmbeddingModel() {
           if (embeddingModel == null) {
               String apiKey = System.getenv("VOYAGE_AI_KEY");
               if (apiKey == null || apiKey.isEmpty()) {
                   throw new IllegalStateException("VOYAGE_AI_KEY env variable is not set or is empty.");
               }

               return VoyageAiEmbeddingModel.builder()
                       .apiKey(apiKey)
                       .modelName("voyage-3-large")
                       .build();
           }
           return embeddingModel;
       }

       /**
        * Takes an array of strings and returns a BSON array of embeddings to
        * store in the database.
        */
       public List<BsonArray> getEmbeddings(List<String> texts) {

           List<TextSegment> textSegments = texts.stream()
                   .map(TextSegment::from)
                   .toList();

           Response<List<Embedding>> response = getEmbeddingModel().embedAll(textSegments);
           return response.content().stream()
                   .map(e -> new BsonArray(
                           e.vectorAsList().stream()
                                   .map(BsonDouble::new)
                                   .toList()))
                   .toList();
       }

       /**
        * Takes a single string and returns a BSON array embedding to
        * use in a vector query.
        */
       public BsonArray getEmbedding(String text) {
           Response<Embedding> response = getEmbeddingModel().embed(text);
           return new BsonArray(
                   response.content().vectorAsList().stream()
                           .map(BsonDouble::new)
                           .toList());
       }
   }


   ```

5. Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to.

   Create a file named `IngestData.java` and paste the following code.

   This code does the following:

   - Loads a PDF that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236/pdf)

   - Splits the data into chunks.

   - Creates vector embeddings from the chunked data by using the `getEmbeddings()` method that you defined.

   - Stores these embeddings alongside the chunked data in the `rag_db.test` collection.

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.result.InsertManyResult;
   import dev.langchain4j.data.segment.TextSegment;
   import org.bson.BsonArray;
   import org.bson.Document;

   import java.util.ArrayList;
   import java.util.List;
   import java.util.stream.Collectors;

   public class DataIngest {

       public static void main(String[] args) {
           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new RuntimeException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("rag_db");
               MongoCollection<Document> collection = database.getCollection("test");

               // parse the PDF file at the specified URL
               String url = "https://investors.mongodb.com/node/12236/pdf";
               String fileName = "mongodb_annual_report.pdf";
               System.out.println("Parsing the [" + fileName + "] file from url: " + url);
               dev.langchain4j.data.document.Document parsedDoc = PDFProcessor.parsePDFDocument(url);

               // split (or "chunk") the parsed document into text segments
               List<TextSegment> segments = PDFProcessor.splitDocument(parsedDoc);
               System.out.println(segments.size() + " text segments created successfully.");
               
               // create vector embeddings from the chunked data (i.e. text segments)
               System.out.println("Creating vector embeddings from the parsed data segments. This may take a few moments.");
               List<Document> documents = embedText(segments);

               // insert the embeddings into the MongoDB collection
               try {
                   System.out.println("Ingesting data into the " + collection.getNamespace() + " collection.");
                   insertDocuments(documents, collection);
               }
               catch (MongoException me) {
                   throw new RuntimeException("Failed to insert documents", me);
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
       
       /** 
        * Embeds text segments into vector embeddings using the EmbeddingProvider
        * class and returns a list of BSON documents containing the text and 
        * generated embeddings.
       */
       private static List<Document> embedText(List<TextSegment> segments) {
           EmbeddingProvider embeddingProvider = new EmbeddingProvider();

           List<String> texts = segments.stream()
                                        .map(TextSegment::text)
                                        .collect(Collectors.toList());

           List<BsonArray> embeddings = embeddingProvider.getEmbeddings(texts);

           List<Document> documents = new ArrayList<>();
           int i = 0;
           for (TextSegment segment : segments) {
               Document doc = new Document("text", segment.text()).append("embedding", embeddings.get(i));
               documents.add(doc);
               i++;
           }
           return documents;
       }

       /**
        * Inserts a list of BSON documents into the specified MongoDB collection.
        */
       private static void insertDocuments(List<Document> documents, MongoCollection<Document> collection) {
           List<String> insertedIds = new ArrayList<>();

           InsertManyResult result = collection.insertMany(documents);
           result.getInsertedIds().values()
                   .forEach(doc -> insertedIds.add(doc.toString()));
           System.out.println(insertedIds.size() + " documents inserted into the " + collection.getNamespace() + " collection successfully.");
       }
   }

   ```

   Then, run the code. If you're using Atlas, you can verify your vector embeddings by navigating to the `rag_db.test` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

6. Use MongoDB Vector Search to retrieve documents.

   In this section, you set up MongoDB Vector Search to [retrieve](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) documents from your vector database. Complete the following steps:

   Create a MongoDB Vector Search index on your vector embeddings.

   Create a new file named `CreateVectorSearchIndex.java` and paste the following code. This code connects to your MongoDB deployment and creates an index of the [vectorSearch](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type on the `rag_db.test` collection.

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.ListSearchIndexesIterable;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoCursor;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.SearchIndexModel;
   import com.mongodb.client.model.SearchIndexType;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.Collections;
   import java.util.List;

   public class VectorIndex {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("rag_db");
               MongoCollection<Document> collection = database.getCollection("test");

               // define the index details for the index model
               String indexName = "vector_index";
               Bson definition = new Document(
                       "fields",
                       Collections.singletonList(
                               new Document("type", "vector")
                                       .append("path", "embedding")
                                       .append("numDimensions", 1024)
                                       .append("similarity", "cosine")));
               SearchIndexModel indexModel = new SearchIndexModel(
                       indexName,
                       definition,
                       SearchIndexType.vectorSearch());

               // create the index using the defined model
               try {
                   List<String> result = collection.createSearchIndexes(Collections.singletonList(indexModel));
                   System.out.println("Successfully created vector index named: " + result);
                   System.out.println("It may take up to a minute for the index to build before you can query using it.");
               } catch (Exception e) {
                   throw new RuntimeException(e);
               }

               // wait for index to build and become queryable
               System.out.println("Polling to confirm the index has completed building.");
               waitForIndexReady(collection, indexName);
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }

       /**
        * Polls the collection to check whether the specified index is ready to query.
        */
       public static void waitForIndexReady(MongoCollection<Document> collection, String indexName) throws InterruptedException {
           ListSearchIndexesIterable<Document> searchIndexes = collection.listSearchIndexes();
           while (true) {
               try (MongoCursor<Document> cursor = searchIndexes.iterator()) {
                   if (!cursor.hasNext()) {
                       break;
                   }
                   Document current = cursor.next();
                   String name = current.getString("name");
                   boolean queryable = current.getBoolean("queryable");
                   if (name.equals(indexName) && queryable) {
                       System.out.println(indexName + " index is ready to query");
                       return;
                   } else {
                       Thread.sleep(500);
                   }
               }
           }
       }
   }

   ```

   Then, run the code.

   Define a method to retrieve relevant data.

   Create a new file called `RetrieveDocuments.java`.

   In this step, you create a retrieval method called `getQueryResults()` that runs a query to retrieve relevant documents. It uses the `getEmbedding()` method to create an embedding from the search query. Then, it runs the query to return semantically-similar documents.

   To learn more, refer to [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   Paste this code into your file:

   **Note: The retrieval functionality is integrated into the LLMPrompt.java file.**

   Then, run the code. Your results might vary.

7. Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context.

   Create a new file called `GenerateResponses.java`, and paste the following code into it. This example uses the method you just defined to retrieve matching documents from the database, and additionally:

   - Instructs the LLM to include the user's question and retrieved documents in the prompt.

   - Prompts the LLM about MongoDB's latest AI announcements.

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.search.FieldSearchPath;
   import dev.langchain4j.data.message.AiMessage;
   import dev.langchain4j.model.chat.ChatModel;
   import dev.langchain4j.model.chat.request.ChatRequest;
   import dev.langchain4j.model.chat.response.ChatResponse;
   import dev.langchain4j.model.input.Prompt;
   import dev.langchain4j.model.input.PromptTemplate;
   import dev.langchain4j.model.openai.OpenAiChatModel;
   import org.bson.BsonArray;
   import org.bson.BsonValue;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.ArrayList;
   import java.util.Collections;
   import java.util.HashMap;
   import java.util.List;
   import java.util.Map;

   import static com.mongodb.client.model.Aggregates.project;
   import static com.mongodb.client.model.Aggregates.vectorSearch;
   import static com.mongodb.client.model.Projections.exclude;
   import static com.mongodb.client.model.Projections.fields;
   import static com.mongodb.client.model.Projections.include;
   import static com.mongodb.client.model.Projections.metaVectorSearchScore;
   import static com.mongodb.client.model.search.SearchPath.fieldPath;
   import static com.mongodb.client.model.search.VectorSearchOptions.exactVectorSearchOptions;
   import static java.util.Arrays.asList;

   public class LLMPrompt {

       // User input: the question to answer
       static String question = "In a few sentences, what are MongoDB's latest AI announcements?";

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("rag_db");
               MongoCollection<Document> collection = database.getCollection("test");

               // generate a response to the user question
               try {
                   createPrompt(question, collection);
               } catch (Exception e) {
                   throw new RuntimeException("An error occurred while generating the response: ", e);
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }

       /**
        * Returns a list of documents from the specified MongoDB collection that
        * match the user's question.
        * NOTE: Update or omit the projection stage to change the desired fields in the response
        */
       public static List<Document> retrieveDocuments(String question, MongoCollection<Document> collection) {

           try {
               // generate the query embedding to use in the vector search
               EmbeddingProvider embeddingProvider = new EmbeddingProvider();
               BsonArray queryEmbeddingBsonArray = embeddingProvider.getEmbedding(question);
               List<Double> queryEmbedding = new ArrayList<>();
               for (BsonValue value : queryEmbeddingBsonArray.stream().toList()) {
                   queryEmbedding.add(value.asDouble().getValue());
               }

               // define the pipeline stages for the vector search index
               String indexName = "vector_index";
               FieldSearchPath fieldSearchPath = fieldPath("embedding");
               int limit = 5;

               List<Bson> pipeline = asList(
                       vectorSearch(
                               fieldSearchPath,
                               queryEmbedding,
                               indexName,
                               limit,
                               exactVectorSearchOptions()),
                       project(
                               fields(
                                       exclude("_id"),
                                       include("text"),
                                       metaVectorSearchScore("score"))));

               // run the query and return the matching documents
               List<Document> matchingDocuments = new ArrayList<>();
               collection.aggregate(pipeline).forEach(matchingDocuments::add);
               return matchingDocuments;
           } catch (Exception e) {
               System.err.println("Error occurred while retrieving documents: " + e.getMessage());
               return new ArrayList<>();
           }
       }

       /**
        * Creates a templated prompt from a submitted question string and any retrieved documents,
        * then generates a response using the OpenAI chat model.
        */
       public static void createPrompt(String question, MongoCollection<Document> collection) {

           // retrieve documents matching the user's question
           List<Document> retrievedDocuments = retrieveDocuments(question, collection);

           if (retrievedDocuments.isEmpty()) {
               System.out.println("No relevant documents found. Unable to generate a response.");
               return;
           } else
               System.out.println("Generating a response from the retrieved documents. This may take a few moments.");

           // define a prompt template
           PromptTemplate promptBuilder = PromptTemplate.from("""
                   Answer the following question based on the given context:
                   Question: {{question}}
                   Context: {{information}}
                   -------
                   """);

           // build the information string from the retrieved documents
           StringBuilder informationBuilder = new StringBuilder();
           for (Document doc : retrievedDocuments) {
               String text = doc.getString("text");
               informationBuilder.append(text).append("\n");
           }

           Map<String, Object> variables = new HashMap<>();
           variables.put("question", question);
           variables.put("information", informationBuilder);

           // generate and output the response from the chat model
           Prompt prompt = promptBuilder.apply(variables);
           ChatRequest chatRequest = ChatRequest.builder()
                   .messages(Collections.singletonList(prompt.toUserMessage()))
                   .build();

           String openAIApiKey = System.getenv("OPENAI_API_KEY");
           if (openAIApiKey == null || openAIApiKey.isEmpty()) {
               throw new IllegalStateException("OPENAI_API_KEY env variable is not set or is empty.");
           }

           ChatModel chatModel = OpenAiChatModel.builder()
                   .apiKey(openAIApiKey)
                   .modelName("gpt-4o")
                   .build();

           ChatResponse chatResponse = chatModel.chat(chatRequest);

           AiMessage aiMessage = chatResponse.aiMessage();

           // extract the generated text to output a formatted response
           String responseText = aiMessage.text();
           String marker = "-------";
           int markerIndex = responseText.indexOf(marker);
           String generatedResponse;
           if (markerIndex != -1) {
               generatedResponse = responseText.substring(markerIndex + marker.length()).trim();
           } else {
               generatedResponse = responseText; // else fallback to the full response
           }

           // output the question and formatted response
           System.out.println("Question:\n " + question);
           System.out.println("Response:\n " + generatedResponse);

           // output the filled-in prompt and context information for demonstration purposes
           System.out.println("\n" + "---- Prompt Sent to LLM ----");
           System.out.println(prompt.text() + "\n");
       }
   }
   ```

   Then, run the code. The generated response might vary.

1) Create your Java project and install dependencies.

   From your IDE, create a Java project using Maven or Gradle.

   Add the following dependencies, depending on your package manager:

   ### Maven

   If you are using Maven, add the following dependencies to the `dependencies` array and Bill of Materials (BOM) to the `dependencyManagement` array in your project's `pom.xml` file:

   ```xml
   <dependencies>
       <!-- MongoDB Java Sync Driver -->
       <dependency>
           <groupId>org.mongodb</groupId>
           <artifactId>mongodb-driver-sync</artifactId>
           <version>5.2.0</version>
       </dependency>
       <!-- Core LangChain4j library (provides Document interface, etc.) -->
       <dependency>
           <groupId>dev.langchain4j</groupId>
           <artifactId>langchain4j</artifactId>
       </dependency>
       <!-- Hugging Face integration -->
       <dependency>
           <groupId>dev.langchain4j</groupId>
           <artifactId>langchain4j-hugging-face</artifactId>
       </dependency>
       <!-- Open AI integration -->
       <dependency>
           <groupId>dev.langchain4j</groupId>
           <artifactId>langchain4j-open-ai</artifactId>
       </dependency>
       <!-- Apache PDFBox Document Parser -->
       <dependency>
           <groupId>dev.langchain4j</groupId>
           <artifactId>langchain4j-document-parser-apache-pdfbox</artifactId>
       </dependency>
   </dependencies>
   <dependencyManagement>
      <dependencies>
            <!-- Bill of Materials (BOM) to manage Java library versions -->
            <dependency>
               <groupId>dev.langchain4j</groupId>
               <artifactId>langchain4j-bom</artifactId>
               <version>1.1.0</version>
               <type>pom</type>
               <scope>import</scope>
            </dependency>
      </dependencies>
   </dependencyManagement>
   ```

   Run your package manager to install the dependencies to your project.

2) Set your environment variables.

   **Note:**

   This example sets the variables for the project in the IDE. Production applications might manage environment variables through a deployment configuration, CI/CD pipeline, or secrets manager, but you can adapt the provided code to fit your use case.

   In your IDE, create a new configuration template and add the following variables to your project:

   - If you are using IntelliJ IDEA, create a new Application run configuration template, then add your variables as semicolon-separated values in the Environment variables field (for example, `FOO=123;BAR=456`). Apply the changes and click OK.

     To learn more, see the [Create a run/debug configuration from a template](https://www.jetbrains.com/help/idea/run-debug-configuration.html#createExplicitly) section of the IntelliJ IDEA documentation.

   - If you are using Eclipse, create a new Java Application launch configuration, then add each variable as a new key-value pair in the Environment tab. Apply the changes and click OK.

     To learn more, see the [Creating a Java application launch configuration](https://help.eclipse.org/latest/topic/org.eclipse.jdt.doc.user/tasks/tasks-java-local-configuration.htm) section of the Eclipse IDE documentation.

   ```shell
      HUGGING_FACE_ACCESS_TOKEN=<hf-token>
      OPENAI_API_KEY=<openai-api-key>
      MONGODB_URI=<connection-string>
   ```

   Update the placeholders with the following values:

   - Replace the `<hf-token>` placeholder value with your Hugging Face access token.

   - Replace the `<openai-api-key>` placeholder value with your OpenAI API key.

   - Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

     ### Atlas Cluster

     Your connection string should use the following format:

     ```text
     mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
     ```

     To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3) Define methods to parse and split the data.

   Create a file named `PDFProcessor.java` and paste the following code.

   This code defines the following methods:

   - The `parsePDFDocument` method uses the [Apache PDFBox](https://pdfbox.apache.org/) library and [LangChain4j URL Document Loader](https://docs.langchain4j.dev/integrations/document-loaders/url) to load and parse a PDF file at a given URL. The method returns the parsed PDF as a langchain4j Document.

   - The `splitDocument` method splits a given langchain4j Document into chunks according to the specified *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks). The method returns a list of text segments.

   ```java
   import dev.langchain4j.data.document.Document;
   import dev.langchain4j.data.document.DocumentParser;
   import dev.langchain4j.data.document.DocumentSplitter;
   import dev.langchain4j.data.document.loader.UrlDocumentLoader;
   import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;
   import dev.langchain4j.data.document.splitter.DocumentByCharacterSplitter;
   import dev.langchain4j.data.segment.TextSegment;

   import java.util.List;

   public class PDFProcessor {

       /** Parses a PDF document from the specified URL, and returns a
        * langchain4j Document object.
        * */
       public static Document parsePDFDocument(String url) {
           DocumentParser parser = new ApachePdfBoxDocumentParser();
           return UrlDocumentLoader.load(url, parser);
       }

       /** Splits a parsed langchain4j Document based on the specified chunking
        * parameters, and returns an array of text segments.
        */
       public static List<TextSegment> splitDocument(Document document) {
           int maxChunkSize = 400; // number of characters
           int maxChunkOverlap = 20; // number of overlapping characters between consecutive chunks

           DocumentSplitter splitter = new DocumentByCharacterSplitter(maxChunkSize, maxChunkOverlap);
           return splitter.split(document);
       }
   }

   ```

4) Define a method to generate vector embeddings.

   Create a file named `EmbeddingProvider.java` and paste the following code.

   This code defines two methods to generate embeddings for a given input using the [mxbai-embed-large-v1](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1) open-source embedding model:

   - **Multiple Inputs**: The `getEmbeddings()` method accepts an array of text segment inputs (`List<TextSegment>`), allowing you to create multiple embeddings in a single API call. The method converts the API-provided arrays of floats to BSON arrays of doubles for storing in MongoDB.

   - **Single Input**: The `getEmbedding()` method accepts a single `String`, which represents a query you want to make against your vector data. The method converts the API-provided array of floats to a BSON array of doubles to use when querying your collection.

   ```java
   import dev.langchain4j.data.embedding.Embedding;
   import dev.langchain4j.data.segment.TextSegment;
   import dev.langchain4j.model.huggingface.HuggingFaceEmbeddingModel;
   import dev.langchain4j.model.output.Response;
   import org.bson.BsonArray;
   import org.bson.BsonDouble;

   import java.util.List;

   import static java.time.Duration.ofSeconds;

   public class EmbeddingProvider {

       private static HuggingFaceEmbeddingModel embeddingModel;

       private static HuggingFaceEmbeddingModel getEmbeddingModel() {
           if (embeddingModel == null) {
               String accessToken = System.getenv("HUGGING_FACE_ACCESS_TOKEN");
               if (accessToken == null || accessToken.isEmpty()) {
                   throw new RuntimeException("HUGGING_FACE_ACCESS_TOKEN env variable is not set or is empty.");
               }

               embeddingModel = HuggingFaceEmbeddingModel.builder()
                       .accessToken(accessToken)
                       .modelId("mixedbread-ai/mxbai-embed-large-v1")
                       .waitForModel(true)
                       .timeout(ofSeconds(60))
                       .build();
           }
           return embeddingModel;
       }

       /**
        * Takes an array of text segments and returns a BSON array of embeddings to
        * store in the database.
        */
       public List<BsonArray> getEmbeddings(List<TextSegment> texts) {
           List<TextSegment> textSegments = texts.stream()
                   .toList();

           Response<List<Embedding>> response = getEmbeddingModel().embedAll(textSegments);
           return response.content().stream()
                   .map(e -> new BsonArray(
                           e.vectorAsList().stream()
                                   .map(BsonDouble::new)
                                   .toList()))
                   .toList();
       }

       /**
        * Takes a single string and returns a BSON array embedding to
        * use in a vector query.
        */
       public static BsonArray getEmbedding(String text) {
           Response<Embedding> response = getEmbeddingModel().embed(text);
           return new BsonArray(
                   response.content().vectorAsList().stream()
                           .map(BsonDouble::new)
                           .toList());
       }
   }

   ```

5) Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to.

   Create a file named `IngestData.java` and paste the following code.

   This code does the following:

   - Loads a PDF that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236/pdf)

   - Splits the data into chunks.

   - Creates vector embeddings from the chunked data by using the `getEmbeddings()` method that you defined.

   - Stores these embeddings alongside the chunked data in the `rag_db.test` collection.

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.result.InsertManyResult;
   import dev.langchain4j.data.segment.TextSegment;
   import org.bson.BsonArray;
   import org.bson.Document;

   import java.util.ArrayList;
   import java.util.List;
   import java.util.stream.Collectors;

   public class DataIngest {

       public static void main(String[] args) {
           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new RuntimeException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("rag_db");
               MongoCollection<Document> collection = database.getCollection("test");

               // parse the PDF file at the specified URL
               String url = "https://investors.mongodb.com/node/12236/pdf";
               String fileName = "mongodb_annual_report.pdf";
               System.out.println("Parsing the [" + fileName + "] file from url: " + url);
               dev.langchain4j.data.document.Document parsedDoc = PDFProcessor.parsePDFDocument(url);

               // split (or "chunk") the parsed document into text segments
               List<TextSegment> segments = PDFProcessor.splitDocument(parsedDoc);
               System.out.println(segments.size() + " text segments created successfully.");
               
               // create vector embeddings from the chunked data (i.e. text segments)
               System.out.println("Creating vector embeddings from the parsed data segments. This may take a few moments.");
               List<Document> documents = embedText(segments);

               // insert the embeddings into the MongoDB collection
               try {
                   System.out.println("Ingesting data into the " + collection.getNamespace() + " collection.");
                   insertDocuments(documents, collection);
               }
               catch (MongoException me) {
                   throw new RuntimeException("Failed to insert documents", me);
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
       
       /** 
        * Embeds text segments into vector embeddings using the EmbeddingProvider
        * class and returns a list of BSON documents containing the text and 
        * generated embeddings.
       */
       private static List<Document> embedText(List<TextSegment> segments) {
           EmbeddingProvider embeddingProvider = new EmbeddingProvider();

           List<String> texts = segments.stream()
                                        .map(TextSegment::text)
                                        .collect(Collectors.toList());

           List<BsonArray> embeddings = embeddingProvider.getEmbeddings(texts);

           List<Document> documents = new ArrayList<>();
           int i = 0;
           for (TextSegment segment : segments) {
               Document doc = new Document("text", segment.text()).append("embedding", embeddings.get(i));
               documents.add(doc);
               i++;
           }
           return documents;
       }

       /**
        * Inserts a list of BSON documents into the specified MongoDB collection.
        */
       private static void insertDocuments(List<Document> documents, MongoCollection<Document> collection) {
           List<String> insertedIds = new ArrayList<>();

           InsertManyResult result = collection.insertMany(documents);
           result.getInsertedIds().values()
                   .forEach(doc -> insertedIds.add(doc.toString()));
           System.out.println(insertedIds.size() + " documents inserted into the " + collection.getNamespace() + " collection successfully.");
       }
   }

   ```

   Then, run the code. If you're using Atlas, you can verify your vector embeddings by navigating to the `rag_db.test` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

6) Use MongoDB Vector Search to retrieve documents.

   In this section, you set up MongoDB Vector Search to [retrieve](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) documents from your vector database. Complete the following steps:

   Create a MongoDB Vector Search index on your vector embeddings.

   Create a new file named `CreateVectorSearchIndex.java` and paste the following code. This code connects to your MongoDB deployment and creates an index of the [vectorSearch](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type on the `rag_db.test` collection.

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.ListSearchIndexesIterable;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoCursor;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.SearchIndexModel;
   import com.mongodb.client.model.SearchIndexType;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.Collections;
   import java.util.List;

   public class VectorIndex {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("rag_db");
               MongoCollection<Document> collection = database.getCollection("test");

               // define the index details for the index model
               String indexName = "vector_index";
               Bson definition = new Document(
                       "fields",
                       Collections.singletonList(
                               new Document("type", "vector")
                                       .append("path", "embedding")
                                       .append("numDimensions", 1024)
                                       .append("similarity", "cosine")));
               SearchIndexModel indexModel = new SearchIndexModel(
                       indexName,
                       definition,
                       SearchIndexType.vectorSearch());

               // create the index using the defined model
               try {
                   List<String> result = collection.createSearchIndexes(Collections.singletonList(indexModel));
                   System.out.println("Successfully created vector index named: " + result);
                   System.out.println("It may take up to a minute for the index to build before you can query using it.");
               } catch (Exception e) {
                   throw new RuntimeException(e);
               }

               // wait for index to build and become queryable
               System.out.println("Polling to confirm the index has completed building.");
               waitForIndexReady(collection, indexName);
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }

       /**
        * Polls the collection to check whether the specified index is ready to query.
        */
       public static void waitForIndexReady(MongoCollection<Document> collection, String indexName) throws InterruptedException {
           ListSearchIndexesIterable<Document> searchIndexes = collection.listSearchIndexes();
           while (true) {
               try (MongoCursor<Document> cursor = searchIndexes.iterator()) {
                   if (!cursor.hasNext()) {
                       break;
                   }
                   Document current = cursor.next();
                   String name = current.getString("name");
                   boolean queryable = current.getBoolean("queryable");
                   if (name.equals(indexName) && queryable) {
                       System.out.println(indexName + " index is ready to query");
                       return;
                   } else {
                       Thread.sleep(500);
                   }
               }
           }
       }
   }

   ```

   Then, run the code.

   Define a method to retrieve relevant data.

   Create a new file called `RetrieveDocuments.java`.

   In this step, you create a retrieval method called `getQueryResults()` that runs a query to retrieve relevant documents. It uses the `getEmbedding()` method to create an embedding from the search query. Then, it runs the query to return semantically-similar documents.

   To learn more, refer to [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   Paste this code into your file:

   **Note: The retrieval functionality is integrated into the LLMPrompt.java file.**

   Then, run the code. Your results might vary depending on the embedding model you use.

7) Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context.

   Create a new file called `GenerateResponses.java`, and paste the following code into it. This example uses the method you just defined to retrieve matching documents from the database, and additionally:

   - Instructs the LLM to include the user's question and retrieved documents in the prompt.

   - Prompts the LLM about MongoDB's latest AI announcements.

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.search.FieldSearchPath;
   import dev.langchain4j.data.message.AiMessage;
   import dev.langchain4j.model.chat.ChatModel;
   import dev.langchain4j.model.chat.request.ChatRequest;
   import dev.langchain4j.model.chat.response.ChatResponse;
   import dev.langchain4j.model.input.Prompt;
   import dev.langchain4j.model.input.PromptTemplate;
   import dev.langchain4j.model.openai.OpenAiChatModel;
   import org.bson.BsonArray;
   import org.bson.BsonValue;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.ArrayList;
   import java.util.Collections;
   import java.util.HashMap;
   import java.util.List;
   import java.util.Map;

   import static com.mongodb.client.model.Aggregates.project;
   import static com.mongodb.client.model.Aggregates.vectorSearch;
   import static com.mongodb.client.model.Projections.exclude;
   import static com.mongodb.client.model.Projections.fields;
   import static com.mongodb.client.model.Projections.include;
   import static com.mongodb.client.model.Projections.metaVectorSearchScore;
   import static com.mongodb.client.model.search.SearchPath.fieldPath;
   import static com.mongodb.client.model.search.VectorSearchOptions.exactVectorSearchOptions;
   import static java.util.Arrays.asList;

   public class LLMPrompt {

       // User input: the question to answer
       static String question = "In a few sentences, what are MongoDB's latest AI announcements?";

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("rag_db");
               MongoCollection<Document> collection = database.getCollection("test");

               // generate a response to the user question
               try {
                   createPrompt(question, collection);
               } catch (Exception e) {
                   throw new RuntimeException("An error occurred while generating the response: ", e);
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }

       /**
        * Returns a list of documents from the specified MongoDB collection that
        * match the user's question.
        * NOTE: Update or omit the projection stage to change the desired fields in the response
        */
       public static List<Document> retrieveDocuments(String question, MongoCollection<Document> collection) {

           try {
               // generate the query embedding to use in the vector search
               EmbeddingProvider embeddingProvider = new EmbeddingProvider();
               BsonArray queryEmbeddingBsonArray = embeddingProvider.getEmbedding(question);
               List<Double> queryEmbedding = new ArrayList<>();
               for (BsonValue value : queryEmbeddingBsonArray.stream().toList()) {
                   queryEmbedding.add(value.asDouble().getValue());
               }

               // define the pipeline stages for the vector search index
               String indexName = "vector_index";
               FieldSearchPath fieldSearchPath = fieldPath("embedding");
               int limit = 5;

               List<Bson> pipeline = asList(
                       vectorSearch(
                               fieldSearchPath,
                               queryEmbedding,
                               indexName,
                               limit,
                               exactVectorSearchOptions()),
                       project(
                               fields(
                                       exclude("_id"),
                                       include("text"),
                                       metaVectorSearchScore("score"))));

               // run the query and return the matching documents
               List<Document> matchingDocuments = new ArrayList<>();
               collection.aggregate(pipeline).forEach(matchingDocuments::add);
               return matchingDocuments;
           } catch (Exception e) {
               System.err.println("Error occurred while retrieving documents: " + e.getMessage());
               return new ArrayList<>();
           }
       }

       /**
        * Creates a templated prompt from a submitted question string and any retrieved documents,
        * then generates a response using the OpenAI chat model.
        */
       public static void createPrompt(String question, MongoCollection<Document> collection) {

           // retrieve documents matching the user's question
           List<Document> retrievedDocuments = retrieveDocuments(question, collection);

           if (retrievedDocuments.isEmpty()) {
               System.out.println("No relevant documents found. Unable to generate a response.");
               return;
           } else
               System.out.println("Generating a response from the retrieved documents. This may take a few moments.");

           // define a prompt template
           PromptTemplate promptBuilder = PromptTemplate.from("""
                   Answer the following question based on the given context:
                   Question: {{question}}
                   Context: {{information}}
                   -------
                   """);

           // build the information string from the retrieved documents
           StringBuilder informationBuilder = new StringBuilder();
           for (Document doc : retrievedDocuments) {
               String text = doc.getString("text");
               informationBuilder.append(text).append("\n");
           }

           Map<String, Object> variables = new HashMap<>();
           variables.put("question", question);
           variables.put("information", informationBuilder);

           // generate and output the response from the chat model
           Prompt prompt = promptBuilder.apply(variables);
           ChatRequest chatRequest = ChatRequest.builder()
                   .messages(Collections.singletonList(prompt.toUserMessage()))
                   .build();

           String openAIApiKey = System.getenv("OPENAI_API_KEY");
           if (openAIApiKey == null || openAIApiKey.isEmpty()) {
               throw new IllegalStateException("OPENAI_API_KEY env variable is not set or is empty.");
           }

           ChatModel chatModel = OpenAiChatModel.builder()
                   .apiKey(openAIApiKey)
                   .modelName("gpt-4o")
                   .build();

           ChatResponse chatResponse = chatModel.chat(chatRequest);

           AiMessage aiMessage = chatResponse.aiMessage();

           // extract the generated text to output a formatted response
           String responseText = aiMessage.text();
           String marker = "-------";
           int markerIndex = responseText.indexOf(marker);
           String generatedResponse;
           if (markerIndex != -1) {
               generatedResponse = responseText.substring(markerIndex + marker.length()).trim();
           } else {
               generatedResponse = responseText; // else fallback to the full response
           }

           // output the question and formatted response
           System.out.println("Question:\n " + question);
           System.out.println("Response:\n " + generatedResponse);

           // output the filled-in prompt and context information for demonstration purposes
           System.out.println("\n" + "---- Prompt Sent to LLM ----");
           System.out.println(prompt.text() + "\n");
       }
   }
   ```

   Then, run the code. The generated response might vary.

1. Set up the environment.

   Initialize your .NET project.

   Run the following commands in your terminal to create a new directory named `MyCompany.RAG` and initialize your project:

   ```text
   dotnet new console -o MyCompany.RAG
   cd MyCompany.RAG
   ```

   Install and import dependencies.

   Run the following commands:

   ```text
   dotnet add package MongoDB.Driver --version 3.1.0
   dotnet add package PdfPig
   dotnet add package OpenAI
   ```

   Set your environment variables.

   Export the following environment variables, `set` them in PowerShell, or use your IDE's environment variable manager to make these variables available to your project.

   ```text
   export VOYAGE_API_KEY="<voyage-api-key>"
   export OPENAI_API_KEY="<openai-api-key>"
   export MONGODB_URI="<connection-string>"
   ```

   Replace the placeholder values with your Voyage AI and OpenAI API keys.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

2. Create a function to generate vector embeddings.

   Create a new class named `AIService` in a file of the same name by pasting the following code. This code defines an async Task named `GetEmbeddingsAsync()` to generate a array of embeddings for an array of given string inputs. This function uses Voyage AI's `voyage-3-large` model to generate an embedding for a given input.

   ```csharp
   namespace MyCompany.RAG;

   using System;
   using System.Collections.Generic;
   using System.Linq;
   using System.Net.Http;
   using System.Net.Http.Headers;
   using System.Text;
   using System.Text.Json;
   using System.Text.Json.Serialization;
   using System.Threading.Tasks;

   public class AIService
   {
       private static readonly string? VoyageApiKey = Environment.GetEnvironmentVariable("VOYAGE_API_KEY");
       private static readonly string EmbeddingModelName = "voyage-3-large";
       private static readonly string ApiEndpoint = "https://ai.mongodb.com/v1/embeddings";
       
       public async Task<Dictionary<string, float[]>> GetEmbeddingsAsync(string[] texts)
       {
           Dictionary<string, float[]> documentData = new Dictionary<string, float[]>();
           
           try
           {
               using HttpClient client = new HttpClient();
               client.DefaultRequestHeaders.Authorization = 
                   new AuthenticationHeaderValue("Bearer", VoyageApiKey);
               
               var requestBody = new
               {
                   input = texts,
                   model = EmbeddingModelName,
                   truncation = true
               };
               
               var content = new StringContent(
                   JsonSerializer.Serialize(requestBody),
                   Encoding.UTF8,
                   "application/json");
               
               HttpResponseMessage response = await client.PostAsync(ApiEndpoint, content);
               
               if (response.IsSuccessStatusCode)
               {
                   string responseBody = await response.Content.ReadAsStringAsync();
                   var embeddingResponse = JsonSerializer.Deserialize<EmbeddingResponse>(responseBody);
                   
                   if (embeddingResponse != null && embeddingResponse.Data != null)
                   {
                       foreach (var embeddingResult in embeddingResponse.Data)
                       {
                           if (embeddingResult.Index < texts.Length)
                           {
                               documentData[texts[embeddingResult.Index]] = 
                                   embeddingResult.Embedding.Select(e => (float)e).ToArray();
                           }
                       }
                   }
               }
               else
               {
                   throw new ApplicationException($"Error calling Voyage API: {response.ReasonPhrase}");
               }
           }
           catch (Exception e)
           {
               throw new ApplicationException(e.Message);
           }
           
           return documentData;
       }
       
       private class EmbeddingResponse
       {
           [JsonPropertyName("object")]
           public string Object { get; set; } = string.Empty;
           
           [JsonPropertyName("data")]
           public List<EmbeddingResult>? Data { get; set; }
           
           [JsonPropertyName("model")]
           public string Model { get; set; } = string.Empty;
           
           [JsonPropertyName("usage")]
           public Usage? Usage { get; set; }
       }
       
       private class EmbeddingResult
       {
           [JsonPropertyName("object")]
           public string Object { get; set; } = string.Empty;
           
           [JsonPropertyName("embedding")]
           public List<double> Embedding { get; set; } = new();
           
           [JsonPropertyName("index")]
           public int Index { get; set; }
       }
       
       private class Usage
       {
           [JsonPropertyName("total_tokens")]
           public int TotalTokens { get; set; }
       }
   }

   ```

3. Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to.

   Load and split the data.

   Create a new class named `PdfIngester` in a file of the same name by pasting the following code. This code contains a few functions to do the following:

   - Load a PDF that contains a MongoDB earnings report.

   - Use [PdfPig](https://github.com/UglyToad/PdfPig) to parse the PDF into text.

   - Split the text into chunks, specifying the chunk size (number of characters) and chunk overlap (number of overlapping characters between consecutive chunks).

   ```csharp
   namespace MyCompany.RAG;

   using System;
   using System.Net.Http;
   using System.IO;
   using System.Threading.Tasks;
   using System.Collections.Generic;
   using System.Text;

   using UglyToad.PdfPig;
   using UglyToad.PdfPig.Content;

   public class PdfIngester
   {
       public async Task<String> DownloadPdf(string url, string path, string fileName)
       {
           using (HttpClient client = new HttpClient())
           {
               try
               {
                   byte[] pdfBytes = await client.GetByteArrayAsync(url);
                   await File.WriteAllBytesAsync(path + fileName, pdfBytes);
                   return "PDF downloaded and saved to " + path + fileName;
               }
               catch (HttpRequestException e)
               {
                   throw new ApplicationException("Error downloading the PDF: " + e.Message);
               }
               catch (IOException e)
               {
                   throw new ApplicationException("Error writing the file to disk: " + e.Message);
               }
           }
       }
       
       public List<string> ConvertPdfToChunkedText(string filePath)
       {
           List<string> textChunks;
           using (var document = PdfDocument.Open(filePath))
           {
               StringBuilder fullText = new StringBuilder();
               foreach (Page page in document.GetPages())
               {
                   fullText.Append(page.Text + "\n");
               }
               textChunks = ChunkText(fullText.ToString(), 400, 20);
           }
           var chunkCount = textChunks.Count;
           if (chunkCount == 0)
           {
               throw new ApplicationException("Unable to chunk PDF contents into text.");
           }
           Console.WriteLine($"Successfully chunked the PDF text into {chunkCount} chunks.");
           return textChunks;
       }
       
       static List<string> ChunkText(string text, int chunkSize, int overlap)
       {
           List<string> chunks = new List<string>();
           int start = 0;
           int textLength = text.Length;
           while (start < textLength)
           {
               int end = start + chunkSize;
               if (end > textLength)
               {
                   end = textLength;
               }
               string chunk = text.Substring(start, end - start);
               chunks.Add(chunk);
               // Increment starting point, considering the overlap
               start += chunkSize - overlap;
               if (start >= textLength) break;
           }
           return chunks;
       }
   }
   ```

   Prepare to store the data and embeddings in MongoDB.

   Create a new class named `MongoDBDataService` in a file of the same name by pasting the following code. This code defines an async Task named `AddDocumentsAsync` to add documents to MongoDB. This function uses the [Collection.InsertManyAsync()](https://www.mongodb.com/docs/drivers/csharp/current/crud/insert.md#std-label-csharp-insert-guide) .NET/C# driver method to insert a list of the `BsonDocument` type. This code stores the embeddings alongside the chunked data in the `rag_db.test` collection.

   ```csharp
   namespace MyCompany.RAG;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class MongoDBDataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("rag_db");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("test");

       public async Task<string> AddDocumentsAsync(Dictionary<string, float[]> embeddings)
       {
           var documents = new List<BsonDocument>();
           foreach( KeyValuePair<string, float[]> var in embeddings )
           {
               var document = new BsonDocument
               {
                   {
                       "text", var.Key
                   },
                   {
                       "embedding", new BsonArray(var.Value)
                   }
               };
               documents.Add(document);
           }
           await Collection.InsertManyAsync(documents);
           return $"Successfully inserted {embeddings.Count} documents.";
       }
   }
   ```

   Convert the data to vector embeddings.

   Create a new class named `EmbeddingGenerator` in a file of the same name by pasting the following code. This code prepares the chunked documents for ingestion by creating a list of documents with their corresponding vector embeddings. You generate these embeddings using the `GetEmbeddingsAsync()` function that you defined earlier.

   ```csharp
   namespace MyCompany.RAG.Local;

   public class EmbeddingGenerator
   {
       private readonly MongoDBDataService _dataService = new();
       private readonly OllamaAIService _ollamaAiService = new();

       public async Task<string> GenerateEmbeddings()
       {
           // Retrieve documents from MongoDB
           var documents = _dataService.GetDocuments();
           if (documents != null)
           {
               Console.WriteLine("Generating embeddings.");
               Dictionary<string, float[]> embeddings = new Dictionary<string, float[]>();
               foreach (var document in documents)
               {
                   try
                   {
                       var id = document.GetValue("_id").ToString();
                       var summary = document.GetValue("summary").ToString();
                       if (id != null && summary != null)
                       {
                           // Use Ollama to generate vector embeddings for each
                           // document's "summary" field
                           var embedding = await _ollamaAiService.GetEmbedding(summary);
                           embeddings.Add(id, embedding);
                       }
                   }
                   catch (Exception e)
                   {
                       return $"Error creating embeddings for summaries: {e.Message}";
                   }
               }
               // Add a new field to the MongoDB documents with the vector embedding
               var result = await _dataService.UpdateDocuments(embeddings);
               return result;
           }
           else
           {
               return "No documents found";
           }
       }
   }

   ```

   Update the `Program.cs` file.

   Paste this code in your `Program.cs`:

   ```csharp
   using MyCompany.RAG;

   const string pdfUrl = "https://investors.mongodb.com/node/12236/pdf";
   const string savePath = "<path-name>";
   const string fileName = "investor-report.pdf";

   var pdfIngester = new PdfIngester();
   var pdfDownloadResult = await pdfIngester.DownloadPdf(pdfUrl, savePath, fileName);
   Console.WriteLine(pdfDownloadResult);

   var textChunks = pdfIngester.ConvertPdfToChunkedText(savePath + fileName);

   if (textChunks.Any()) {
       var embeddingGenerator = new EmbeddingGenerator();
       var embeddingGenerationResult = await embeddingGenerator.GenerateEmbeddings(textChunks);
       Console.WriteLine(embeddingGenerationResult);
   }

   ```

   This code:

   - Uses the `PdfIngester` to load and chunk the PDF into text segments

   - Uses the `EmbeddingGenerator` to generate embeddings for each text chunk from the PDF, and write the text chunks and embeddings to the `rag_db.test` collection

   Replace the `<path-name>` placeholder with the path where you want to download the report. On a macOS system, the path should resemble `/Users/<username>/MyCompany.RAG/`. The path should end with a trailing slash.

   Compile and run your project to generate embeddings.

   ```shell
   dotnet run MyCompany.RAG.csproj
   ```

   **Output:**

   ```shell
   PDF downloaded and saved to <PATH>
   Successfully chunked the PDF text into 73 chunks.
   Generating embeddings.
   Successfully inserted 73 documents.
   ```

4. Use MongoDB Vector Search to retrieve documents.

   In this section, you set up MongoDB Vector Search to [retrieve](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) documents from your vector database. To create a MongoDB Vector Search index for a collection using the [MongoDB .NET/C# Driver v3.1.0](https://www.mongodb.com/docs/drivers/csharp/current/quick-start/) or later, perform the following steps:

   Define the MongoDB Vector Search index.

   In the `MongoDBDataService` class, add the following code to define a MongoDB Vector Search index on the `embedding` field:

   ```csharp
   namespace MyCompany.RAG;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("rag_db");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("test");

       public async Task<string> AddDocumentsAsync(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }

       public string CreateVectorIndex()
       {
           var searchIndexView = Collection.SearchIndexes;
           var name = "vector_index";

           var model = new CreateVectorSearchIndexModel<Document>(
               d => d.Embedding,
               name,
               VectorSimilarity.Cosine,
               1024);
           
           try
           {
               searchIndexView.CreateOne(model);
               Console.WriteLine($"New search index named {name} is building.");
               // Polling for index status
               Console.WriteLine("Polling to check if the index is ready.");
               bool queryable = false;
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
           }
           catch (Exception e)
           {
               throw new ApplicationException("Error creating the vector index: "  + e.Message);
           }
           return $"{name} is ready for querying.";
       }
   }
   ```

   Create the MongoDB Vector Search index.

   In the `Program.cs` file, replace the existing code with the following code to create the index:

   ```csharp
   using MyCompany.RAG;

   var dataService = new MongoDBDataService();
   var result = dataService.CreateVectorIndex();
   Console.WriteLine(result);

   ```

   Compile and run your project to create the index.

   ```shell
   dotnet run MyCompany.RAG.csproj
   ```

   Define a function to retrieve relevant data.

   In the `MongoDBDataService` class, add the following code to define a function that runs a query to retrieve relevant documents. It uses the `GetEmbeddingsAsync()` function to create an embedding from the search query. Then, it runs the query to return semantically-similar documents.

   To learn more, refer to [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   ```csharp
   namespace MyCompany.RAG;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class MongoDBDataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("rag_db");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("test");
       
       public async Task<string> AddDocumentsAsync(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }

       public string CreateVectorIndex()
       {
           // Method details...
       }

       public List<BsonDocument>? PerformVectorQuery(float[] vector)
       {
           var vectorSearchStage = new BsonDocument
           {
               {
                   "$vectorSearch",
                   new BsonDocument
                   {
                       { "index", "vector_index" },
                       { "path", "embedding" },
                       { "queryVector", new BsonArray(vector) },
                       { "exact", true },
                       { "limit", 5 }
                   }
               }
           };
           var projectStage = new BsonDocument
           {
               {
                   "$project",
                   new BsonDocument
                   {
                       { "_id", 0 },
                       { "text", 1 },
                       { "score", 
                           new BsonDocument
                           {
                               { "$meta", "vectorSearchScore"}
                           }
                       }
                   }
               }
           };
           var pipeline = new[] { vectorSearchStage, projectStage };
           return Collection.Aggregate<BsonDocument>(pipeline).ToList();
       }
   }
   ```

   Test retrieving the data.

   In the `Program.cs` file, replace the existing code with the following code to test the retrieval function:

   ```csharp
   using MyCompany.RAG;

   var query = "AI Technology";
   var queryCoordinator = new PerformTestQuery();
   var result = await queryCoordinator.GetQueryResults(query);
   Console.WriteLine(result);

   ```

   Compile and run your project to test the retrieval function.

   ```shell
   dotnet run MyCompany.RAG.csproj
   ```

   **Output:**

   ```shell
   {
     document: {
       pageContent: 'MongoDB continues to expand its AI ecosystem with the announcement of the MongoDB AI Applications Program (MAAP),',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'artificial intelligence, in our offerings or partnerships; the growth and expansion of the market for database products and our ability to penetrate that\n' +
         'market; our ability to integrate acquired businesses and technologies successfully or achieve the expected benefits of such acquisitions; our ability to',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'more of our customers. We also see a tremendous opportunity to win more legacy workloads, as AI has now become a catalyst to modernize these\n' +
         "applications. MongoDB's document-based architecture is particularly well-suited for the variety and scale of data required by AI-powered applications. \n" +
         'We are confident MongoDB will be a substantial beneficiary of this next wave of application development."',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'which provides customers with reference architectures, pre-built partner integrations, and professional services to help\n' +
         'them quickly build AI-powered applications. Accenture will establish a center of excellence focused on MongoDB projects,\n' +
         'and is the first global systems integrator to join MAAP.',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }
   {
     document: {
       pageContent: 'Bendigo and Adelaide Bank partnered with MongoDB to modernize their core banking technology. With the help of\n' +
         'MongoDB Relational Migrator and generative AI-powered modernization tools, Bendigo and Adelaide Bank decomposed an\n' +
         'outdated consumer-servicing application into microservices and migrated off its underlying legacy relational database',
       metadata: { source: 'investor-report.pdf', pdf: [Object], loc: [Object] },
       id: null
     }
   }

   ```

5. Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context.

   In the `AIService` class, add the following code to define a function that prompts the LLM to use the retrieved documents as context:

   ```csharp
   namespace MyCompany.RAG;

   using OpenAI.Chat;
   using System;
   using System.Collections.Generic;
   using System.Linq;
   using System.Net.Http;
   using System.Net.Http.Headers;
   using System.Text;
   using System.Text.Json;
   using System.Text.Json.Serialization;
   using System.Threading.Tasks;

   public class AIService
   {
    private static readonly string? VoyageApiKey = Environment.GetEnvironmentVariable("VOYAGE_API_KEY");
    private static readonly string EmbeddingModelName = "voyage-3-large";
    private static readonly string ApiEndpoint = "https://ai.mongodb.com/v1/embeddings";
    private static readonly string? OpenAIApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
    private static readonly string ChatModelName = "gpt-4o-mini";
    private static readonly ChatClient ChatClient = new(model: ChatModelName, apiKey: OpenAIApiKey);

    public async Task<Dictionary<string, float[]>> GetEmbeddingsAsync(string[] texts)
    {
     // Method details...
    }

    public async Task<string> GenerateAnswer(string question, string context)
    {
     string prompt = $"""
                            Answer the following question based on the given context.
                            Context: {context}
                            Question: {question}
                            """;
     byte[] binaryContent = Encoding.UTF8.GetBytes(prompt);
     IEnumerable<ChatMessage> messages = new List<ChatMessage>([prompt]);
     ChatCompletion responses = await ChatClient.CompleteChatAsync(messages, new ChatCompletionOptions { MaxOutputTokenCount = 400 });
     var summaryResponse = responses.Content[0].Text;
     if (summaryResponse is null)
     {
      throw new ApplicationException("No response from the chat client.");
     }
     return summaryResponse;
    }
    // Rest of code...
   }
   ```

   In the `Program.cs` file, replace the existing code with the following code. This example uses the function you just defined to retrieve matching documents from the database, and additionally:

   - Instructs the LLM to include the user's question and retrieved documents in the prompt.

   - Prompts the LLM about MongoDB's latest AI announcements.

   ```csharp
   using MyCompany.RAG;

   var question = "In a few sentences, what are MongoDB's latest AI announcements?";
   var ragPipeline = new RAGPipeline();
   var result = await ragPipeline.GenerateResults(question);
   Console.WriteLine(result);

   ```

   Compile and run your project. The generated response might vary.

   ```shell
   dotnet run MyCompany.RAG.csproj
   ```

   **Output:**

   ```text
   MongoDB's latest AI announcements include the MongoDB AI Applications
   Program (MAAP), which provides customers with reference architectures,
   pre-built partner integrations, and professional services to help them
   quickly build AI-powered applications. Accenture will establish a
   center of excellence focused on MongoDB projects and is the first
   global systems integrator to join MAAP.
   ```

Create an interactive Python notebook by saving a file with the `.ipynb` extension. This notebook allows you to run Python code snippets in this tutorial individually.

1. Set up the environment.

   Run the following code to install the dependencies for this tutorial:

   ```python
   pip install --quiet --upgrade pymongo openai langchain langchain_community pypdf
   ```

   Run the following code to set the environment variables for this tutorial, replacing the placeholders with your API keys.

   ```python
   import os

   os.environ["OPENAI_API_KEY"] = "<openai-api-key>"
   ```

2. Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to.

   Load and split the data.

   Run this code to load and split sample data by using the [LangChain integration](https://www.mongodb.com/docs/atlas/ai-integrations/langchain.md#std-label-langchain). Specifically, this code does the following:

   - Loads a PDF that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236/pdf)

   - Splits the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   ```python
   from langchain_community.document_loaders import PyPDFLoader
   from langchain_text_splitters import RecursiveCharacterTextSplitter

   # Load the PDF
   loader = PyPDFLoader("https://investors.mongodb.com/node/12236/pdf")
   data = loader.load()

   # Split the data into chunks
   text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=20)
   documents = text_splitter.split_documents(data)

   docs_to_insert = [{
       "text": doc.page_content
   } for doc in documents]
   ```

   Store the data in MongoDB.

   Run the following code to connect to your MongoDB deployment. Before running the code, replace `<connection-string>` with your MongoDB connection string.

   ```python
   from pymongo import MongoClient

   # Connect to your MongoDB deployment
   client = MongoClient("<connection-string>")
   collection = client["rag_db"]["test"]

   # Insert documents into the collection
   result = collection.insert_many(docs_to_insert)
   ```

   **Tip:**

   After you run the code, if you're using Atlas, you can verify your vector embeddings by navigating to the `rag_db.test` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

3. Use MongoDB Vector Search to retrieve documents.

   In this section, you create a [retrieval](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) system using MongoDB Vector Search to get relevant documents from your database. Paste and run each of the following code snippets in your notebook:

   Create a MongoDB Vector Search index on your data.

   Run the following code to create the index directly from your application with the [PyMongo Driver](https://www.mongodb.com/docs/drivers/pymongo/). This code also includes a polling mechanism to check if the index is ready to use.

   To learn more, see [How to Index Fields for Vector Search.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search)

   ```python
   from pymongo.operations import SearchIndexModel
   import time
   # Create your index model, then create the search index
   index_name = "autoembed_index"
   search_index_model = SearchIndexModel(
       {
           "fields": [
               {
                   "type": "autoEmbed",
                   "modality": "text",
                   "path": "text",
                   "model": "voyage-4"
               }
           ]
       },
       name=index_name,
       type="vectorSearch",
   )
   collection.create_search_index(model=search_index_model)

   # Wait for initial sync to complete
   print("Polling to check if the index is ready. This may take up to a minute.")
   predicate = None
   if predicate is None:
       predicate = lambda index: index.get("queryable") is True

   while True:
       indices = list(collection.list_search_indexes(index_name))
       if len(indices) and predicate(indices[0]):
           break
       time.sleep(5)
   print(index_name + " is ready for querying.")
   ```

   Define a function to run vector search queries.

   Run this code to create a retrieval function called `get_query_results()` that runs a basic vector search query and return semantically similar documents.

   To learn more, see [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   ```python
   # Define a function to run vector search queries
   def get_query_results(query):
       """Gets results from a vector search query."""

       pipeline = [
           {
               "$vectorSearch": {
                   "index": "autoembed_index",
                   "query": {"text": query},
                   "path": "text",
                   "exact": True,
                   "limit": 5,
               }
           },
           {"$project": {"_id": 0, "text": 1}},
       ]

       results = collection.aggregate(pipeline)

       array_of_results = []
       for doc in results:
           array_of_results.append(doc)
       return array_of_results

   # Test the function with a sample query
   import pprint
   pprint.pprint(get_query_results("AI technology"))
   ```

   **Output:**

   ```none
   [{'text': 'MongoDB continues to expand its AI ecosystem with the announcement '
             'of the MongoDB AI Applications Program (MAAP),'},
    {'text': 'more of our customers. We also see a tremendous opportunity to win '
             'more legacy workloads, as AI has now become a catalyst to modernize '
             'these\n'
             "applications. MongoDB's document-based architecture is particularly "
             'well-suited for the variety and scale of data required by '
             'AI-powered applications.\xa0\n'
             'We are confident MongoDB will be a substantial beneficiary of this '
             'next wave of application development."'},
    {'text': 'artificial intelligence, in our offerings or partnerships; the '
             'growth and expansion of the market for database products and our '
             'ability to penetrate that\n'
             'market; our ability to integrate acquired businesses and '
             'technologies successfully or achieve the expected benefits of such '
             'acquisitions; our ability to'},
    {'text': 'which provides customers with reference architectures, pre-built '
             'partner integrations, and professional services to help\n'
             'them quickly build AI-powered applications. Accenture will '
             'establish a center of excellence focused on MongoDB projects,\n'
             'and is the first global systems integrator to join MAAP.'},
    {'text': 'developer community; our ability to add new customers or increase '
             'sales to our existing customers; our ability to maintain, protect, '
             'enforce and\n'
             'enhance our intellectual property; the effects of social, ethical '
             'and regulatory issues relating to the use of new and evolving '
             'technologies, such as'}]
   ```

4. Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context. This code does the following:

   - Uses the `get_query_results()` function you defined to retrieve relevant documents from your collection.

   - Creates a prompt using the user's question and retrieved documents as context.

   - Prompts the LLM about MongoDB's latest AI announcements. The generated response might vary.

   Run the following code to specify a search query and retrieve relevant documents:

   ```python
   from openai import OpenAI

   # Specify search query and retrieve relevant documents
   query = "What are MongoDB's latest AI announcements?"
   context_docs = get_query_results(query)
   ```

   Then, run the following code to generate a response from the LLM:

   ```python
   from openai import OpenAI

   # Specify search query and retrieve relevant documents
   query = "What are MongoDB's latest AI announcements?"
   context_docs = get_query_results(query)

   # Convert the retrieved documents to a string
   context_string = " ".join([doc["text"] for doc in context_docs])

   # Construct prompt for the LLM using the retrieved documents as the context
   prompt = f"""Use the following pieces of context to answer the question at the end.
       {context_string}
       Question: {query}
   """

   openai_client = OpenAI()

   # OpenAI model to use
   model_name = "gpt-4o"

   completion = openai_client.chat.completions.create(
       model=model_name,
       messages=[{"role": "user", "content": prompt}],
   )
   print(completion.choices[0].message.content)
   ```

   **Output:**

   ```none
   MongoDB's latest AI announcements include the introduction of the MongoDB AI Applications Program (MAAP), which aims to expand their AI ecosystem. The program provides customers with reference architectures, pre-built partner integrations, and professional services to help them quickly build AI-powered applications. Additionally, Accenture has been named the first global systems integrator to join MAAP, and they will establish a center of excellence focused on MongoDB projects. MongoDB highlights its document-based architecture as particularly well-suited for AI-powered applications, and they see AI as a catalyst for modernizing legacy applications.
   ```

Create an interactive Python notebook by saving a file with the `.ipynb` extension. This notebook allows you to run Python code snippets in this tutorial individually.

1. Set up the environment.

   Run the following code to install the dependencies for this tutorial:

   ```python
   pip install --quiet --upgrade pymongo huggingface_hub einops langchain langchain_community pypdf
   ```

   Run the following code to set the environment variables for this tutorial, replacing the placeholders with your API keys.

   ```python
   import os

   os.environ["HF_TOKEN"] = "<hf-token>"
   ```

2. Ingest data into your MongoDB deployment.

   In this section, you [ingest](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) sample data into MongoDB that LLMs don't have access to. Paste and run each of the following code snippets in your notebook:

   Load and split the data.

   Run this code to load and split sample data by using the [LangChain integration](https://www.mongodb.com/docs/atlas/ai-integrations/langchain.md#std-label-langchain). Specifically, this code does the following:

   - Loads a PDF that contains a [MongoDB earnings report.](https://investors.mongodb.com/node/12236/pdf)

   - Splits the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   ```python
   from langchain_community.document_loaders import PyPDFLoader
   from langchain_text_splitters import RecursiveCharacterTextSplitter

   # Load the PDF
   loader = PyPDFLoader("https://investors.mongodb.com/node/12236/pdf")
   data = loader.load()

   # Split the data into chunks
   text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=20)
   documents = text_splitter.split_documents(data)

   docs_to_insert = [{
       "text": doc.page_content
   } for doc in documents]
   ```

   Store the data in MongoDB.

   Run the following code to connect to your MongoDB deployment. Before running the code, replace `<connection-string>` with your MongoDB connection string.

   ```python
   from pymongo import MongoClient

   # Connect to your MongoDB deployment
   client = MongoClient("<connection-string>")
   collection = client["rag_db"]["test"]

   # Insert documents into the collection
   result = collection.insert_many(docs_to_insert)
   ```

   **Tip:**

   After you run the code, if you're using Atlas, you can verify your vector embeddings by navigating to the `rag_db.test` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

3. Use MongoDB Vector Search to retrieve documents.

   In this section, you create a [retrieval](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-retrieval) system using MongoDB Vector Search to get relevant documents from your database. Paste and run each of the following code snippets in your notebook:

   Create a MongoDB Vector Search index on your data.

   Run the following code to create the index directly from your application with the [PyMongo Driver](https://www.mongodb.com/docs/drivers/pymongo/). This code also includes a polling mechanism to check if the index is ready to use.

   To learn more, see [How to Index Fields for Vector Search.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search)

   ```python
   from pymongo.operations import SearchIndexModel
   import time
   # Create your index model, then create the search index
   index_name = "autoembed_index"
   search_index_model = SearchIndexModel(
       {
           "fields": [
               {
                   "type": "autoEmbed",
                   "modality": "text",
                   "path": "text",
                   "model": "voyage-4"
               }
           ]
       },
       name=index_name,
       type="vectorSearch",
   )
   collection.create_search_index(model=search_index_model)

   # Wait for initial sync to complete
   print("Polling to check if the index is ready. This may take up to a minute.")
   predicate = None
   if predicate is None:
       predicate = lambda index: index.get("queryable") is True

   while True:
       indices = list(collection.list_search_indexes(index_name))
       if len(indices) and predicate(indices[0]):
           break
       time.sleep(5)
   print(index_name + " is ready for querying.")
   ```

   Define a function to run vector search queries.

   Run this code to create a retrieval function called `get_query_results()` that runs a basic vector search query and return semantically similar documents.

   To learn more, see [Run Vector Search ANN and ENN Queries.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

   ```python
   # Define a function to run vector search queries
   def get_query_results(query):
       """Gets results from a vector search query."""

       pipeline = [
           {
               "$vectorSearch": {
                   "index": "autoembed_index",
                   "query": {"text": query},
                   "path": "text",
                   "exact": True,
                   "limit": 5,
               }
           },
           {"$project": {"_id": 0, "text": 1}},
       ]

       results = collection.aggregate(pipeline)

       array_of_results = []
       for doc in results:
           array_of_results.append(doc)
       return array_of_results

   # Test the function with a sample query
   import pprint
   pprint.pprint(get_query_results("AI technology"))
   ```

   **Output:**

   ```none
   [{'text': 'MongoDB continues to expand its AI ecosystem with the announcement '
             'of the MongoDB AI Applications Program (MAAP),'},
    {'text': 'more of our customers. We also see a tremendous opportunity to win '
             'more legacy workloads, as AI has now become a catalyst to modernize '
             'these\n'
             "applications. MongoDB's document-based architecture is particularly "
             'well-suited for the variety and scale of data required by '
             'AI-powered applications.\xa0\n'
             'We are confident MongoDB will be a substantial beneficiary of this '
             'next wave of application development."'},
    {'text': 'artificial intelligence, in our offerings or partnerships; the '
             'growth and expansion of the market for database products and our '
             'ability to penetrate that\n'
             'market; our ability to integrate acquired businesses and '
             'technologies successfully or achieve the expected benefits of such '
             'acquisitions; our ability to'},
    {'text': 'which provides customers with reference architectures, pre-built '
             'partner integrations, and professional services to help\n'
             'them quickly build AI-powered applications. Accenture will '
             'establish a center of excellence focused on MongoDB projects,\n'
             'and is the first global systems integrator to join MAAP.'},
    {'text': 'developer community; our ability to add new customers or increase '
             'sales to our existing customers; our ability to maintain, protect, '
             'enforce and\n'
             'enhance our intellectual property; the effects of social, ethical '
             'and regulatory issues relating to the use of new and evolving '
             'technologies, such as'}]
   ```

4. Generate responses with the LLM.

   In this section, you [generate](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion) responses by prompting an LLM to use the retrieved documents as context. This code does the following:

   - Uses the `get_query_results()` function you defined to retrieve relevant documents from your collection.

   - Creates a prompt using the user's question and retrieved documents as context.

   - Prompts the LLM about MongoDB's latest AI announcements. The generated response might vary.

   ```python
   from huggingface_hub import InferenceClient

   # Specify search query, retrieve relevant documents, and convert to string
   query = "What are MongoDB's latest AI announcements?"
   context_docs = get_query_results(query)
   context_string = " ".join([doc["text"] for doc in context_docs])

   # Construct prompt for the LLM using the retrieved documents as the context
   prompt = f"""Use the following pieces of context to answer the question at the end.
       {context_string}
       Question: {query}
   """

   # Use a model from Hugging Face
   llm = InferenceClient(
       "openai/gpt-oss-120b",
       provider = "fireworks-ai",
       token = os.getenv("HF_TOKEN"))

   # Prompt the LLM (this code varies depending on the model you use)
   output = llm.chat_completion(
       messages=[{"role": "user", "content": prompt}],
       max_tokens=150
   )
   print(output.choices[0].message.content)
   ```

   **Output:**

   ```none
   MongoDB's latest AI announcements include the introduction of the MongoDB AI Applications Program (MAAP), which aims to expand their AI ecosystem. The program provides customers with reference architectures, pre-built partner integrations, and professional services to help them quickly build AI-powered applications. Additionally, Accenture has been named the first global systems integrator to join MAAP, and they will establish a center of excellence focused on MongoDB projects. MongoDB highlights its document-based architecture as particularly well-suited for AI-powered applications, and they see AI as a catalyst for modernizing legacy applications.
   ```

## Next Steps

For additional RAG tutorials, see the following resources:

- To learn how to implement RAG (Retrieval-Augmented Generation) with popular LLM frameworks and AI services, see [MongoDB AI Integrations and Partners.](https://www.mongodb.com/docs/atlas/ai-integrations.md#std-label-ai-integrations)

- To learn how to implement RAG (Retrieval-Augmented Generation) using a local Atlas deployment and local models, see [Build a Local RAG Implementation with MongoDB Vector Search.](https://www.mongodb.com/docs/vector-search/tutorials/local-rag.md#std-label-local-rag)

- For use-case based tutorials and interactive Python notebooks, see [Docs Notebooks Repository](https://github.com//mongodb/docs-notebooks) and [Generative AI Use Cases Repository.](https://github.com//mongodb-developer/GenAI-Showcase/tree/main)

To build AI agents and implement agentic RAG, see [Build AI Agents with MongoDB.](https://www.mongodb.com/docs/vector-search/about/ai-agents.md#std-label-ai-agents)

### Improve Your Results

To optimize your RAG (Retrieval-Augmented Generation) applications, ensure that you're using a powerful embedding model like [Voyage AI](https://docs.voyageai.com/docs/introduction) to generate high-quality vector embeddings.

Additionally, MongoDB Vector Search supports advanced retrieval systems. You can seamlessly index vector data along with your other data in your cluster. This allows you to improve your results by [pre-filtering](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-filter) on other fields in your collection or performing [hybrid search](https://www.mongodb.com/docs/search/tutorial/hybrid-search.md#std-label-as_hybrid-search) that combine semantic search with full-text search results.

#### Chunking Strategies

Chunking breaks large documents into smaller segments before generating embeddings. The right chunking strategy can significantly improve retrieval quality for your RAG (Retrieval-Augmented Generation) application.

A chunking strategy consists of the following key components:

- **Splitting technique**: Determines where to place chunk boundaries, such as paragraph boundaries, programming language-specific separators, tokens, or semantic boundaries.

- **Chunk size**: Maximum number of characters or tokens per chunk.

- **Chunk overlap**: Number of overlapping characters or tokens between adjacent chunks. Overlap helps preserve context across chunk boundaries.

Common chunking strategies include:

| Strategy | Best For |
| --- | --- |
| Fixed token | Simple use cases with uniform content structure. |
| Fixed token with overlap | General-purpose chunking where context spans chunk boundaries. |
| Recursive | Text documents where you want to preserve paragraph and sentence boundaries. |
| Language-specific recursive | Code or technical documentation with programming language snippets. |
| Semantic | Documents without clear structural boundaries, such as essays or narrative content. |

To experiment with chunking strategies, use the [Chatbot Demo Builder](https://www.mongodb.com/docs/vector-search/query/vector-search-playground.md#std-label-avs-playground) in the MongoDB Search Playground, which lets you try recursive chunking and fixed token chunking with overlap.

For a hands-on tutorial that evaluates different chunking strategies using the Ragas framework, see the [Chunking Strategies notebook](https://github.com/mongodb-developer/GenAI-Showcase/blob/main/notebooks/rag/rag_chunking_strategies.ipynb) in the GenAI-Showcase repository.

You can also use the following resources:

- [How to Measure the Accuracy of Your Query Results](https://www.mongodb.com/docs/vector-search/query/improve-accuracy.md#std-label-avs-improve-results)

- [Benchmark for MongoDB Vector Search.](https://www.mongodb.com/docs/vector-search/benchmark/benchmark-tests.md#std-label-avs-performance-tuning)
