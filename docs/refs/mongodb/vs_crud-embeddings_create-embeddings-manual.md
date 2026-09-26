> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: cloud, local, maven, gradle, open-source, openai, voyage-ai
-->

# How to Create Vector Embeddings Manually

You can store [vector embeddings](https://www.mongodb.com/docs/vector-search/index.md#std-term-vector-embeddings) alongside your other MongoDB data. These embeddings capture meaningful relationships in your data and allow you to perform semantic search and implement [RAG.](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-avs-rag)

## Get Started

Use the following tutorial to learn how to create vector embeddings and query them using vector search. Specifically, you perform the following actions:

1. Define a function that uses an [embedding model](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-choose-embedding-method) to generate vector embeddings.

   Select whether you want to use a proprietary or open-source model. For state-of-the-art embeddings, use Voyage AI.

2. Create embeddings from your data and store them in MongoDB.

   Select whether you want to create embeddings from new data or from existing data that you already have in a MongoDB collection.

3. Create embeddings from your search terms and run a vector search query.

For production applications, you typically write a script to generate vector embeddings. You can start with the sample code on this page and customize it for your use case.

**Note:**

MongoDB Vector Search Automated Embedding service is a one-click way to enable semantic search on the text data in your collection. With Automated Embedding, you don't need to generate, store, or manage vector embeddings yourself. Instead, MongoDB Vector Search automatically generates and manages vector embeddings for you. To learn more, see [Automated Embedding Overview.](https://www.mongodb.com/docs/vector-search/crud-embeddings/automated-embedding.md#std-label-avs-auto-embeddings)

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/tree/main/create-embeddings)

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/tree/main/create-embeddings)

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/tree/main/create-embeddings)

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/tree/main/create-embeddings)

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/tree/main/create-embeddings)

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/tree/main/create-embeddings)

### Prerequisites

To complete this tutorial, you must have the following:

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- An environment to run interactive Python notebooks such as [VS Code](https://code.visualstudio.com/docs/datascience/jupyter-notebooks) or [Colab.](https://colab.research.google.com)

* A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- An environment to run interactive Python notebooks such as [VS Code](https://code.visualstudio.com/docs/datascience/jupyter-notebooks) or [Colab.](https://colab.research.google.com)

* A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your Node.js project.

- [npm and Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

* A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your Node.js project.

- [npm and Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

* A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your Go project.

- [Go](https://go.dev/doc/install) installed.

* A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your Go project.

- [Go](https://go.dev/doc/install) installed.

* A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

* [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) version 8 or later.

* An environment to set up and run a Java application. We recommend that you use an integrated development environment (IDE) such as [IntelliJ IDEA](https://www.jetbrains.com/idea/) or [Eclipse IDE](https://eclipseide.org/) to configure Maven or Gradle to build and run your project.

- A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

* One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) version 8 or later.

- An environment to set up and run a Java application. We recommend that you use an integrated development environment (IDE) such as [IntelliJ IDEA](https://www.jetbrains.com/idea/) or [Eclipse IDE](https://eclipseide.org/) to configure Maven or Gradle to build and run your project.

* A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your C# project.

- [.NET 8.0 or higher](https://dotnet.microsoft.com/en-us/) installed.

* A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your C# project.

- [.NET 8.0 or higher](https://dotnet.microsoft.com/en-us/) installed.

* A Voyage AI API (Application Programming Interface) key. To create an API (Application Programming Interface) key, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-api-keys)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- An environment to run interactive Python notebooks such as [VS Code](https://code.visualstudio.com/docs/datascience/jupyter-notebooks) or [Colab.](https://colab.research.google.com)

* An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- An environment to run interactive Python notebooks such as [VS Code](https://code.visualstudio.com/docs/datascience/jupyter-notebooks) or [Colab.](https://colab.research.google.com)

* An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your Node.js project.

- [npm and Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

* An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your Node.js project.

- [npm and Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

* An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your Go project.

- [Go](https://go.dev/doc/install) installed.

* An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your Go project.

- [Go](https://go.dev/doc/install) installed.

* An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

* [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) version 8 or later.

* An environment to set up and run a Java application. We recommend that you use an integrated development environment (IDE) such as [IntelliJ IDEA](https://www.jetbrains.com/idea/) or [Eclipse IDE](https://eclipseide.org/) to configure Maven or Gradle to build and run your project.

- An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

* One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) version 8 or later.

- An environment to set up and run a Java application. We recommend that you use an integrated development environment (IDE) such as [IntelliJ IDEA](https://www.jetbrains.com/idea/) or [Eclipse IDE](https://eclipseide.org/) to configure Maven or Gradle to build and run your project.

* An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your C# project.

- [.NET 8.0 or higher](https://dotnet.microsoft.com/en-us/) installed.

* An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your C# project.

- [.NET 8.0 or higher](https://dotnet.microsoft.com/en-us/) installed.

* An OpenAI API Key. You must have an OpenAI account with credits available for API requests. To learn more about registering an OpenAI account, see the [OpenAI API website.](https://openai.com/api/)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- An environment to run interactive Python notebooks such as [VS Code](https://code.visualstudio.com/docs/datascience/jupyter-notebooks) or [Colab.](https://colab.research.google.com)

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- An environment to run interactive Python notebooks such as [VS Code](https://code.visualstudio.com/docs/datascience/jupyter-notebooks) or [Colab.](https://colab.research.google.com)

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your Node.js project.

- [npm and Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your Node.js project.

- [npm and Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your Go project.

- [Go](https://go.dev/doc/install) installed.

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your Go project.

- [Go](https://go.dev/doc/install) installed.

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

* [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) version 8 or later.

* An environment to set up and run a Java application. We recommend that you use an integrated development environment (IDE) such as [IntelliJ IDEA](https://www.jetbrains.com/idea/) or [Eclipse IDE](https://eclipseide.org/) to configure Maven or Gradle to build and run your project.

- A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

* One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) version 8 or later.

- An environment to set up and run a Java application. We recommend that you use an integrated development environment (IDE) such as [IntelliJ IDEA](https://www.jetbrains.com/idea/) or [Eclipse IDE](https://eclipseide.org/) to configure Maven or Gradle to build and run your project.

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your C# project.

- [.NET 8.0 or higher](https://dotnet.microsoft.com/en-us/) installed.

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A terminal and code editor to run your C# project.

- [.NET 8.0 or higher](https://dotnet.microsoft.com/en-us/) installed.

* A [Hugging Face Access Token.](https://huggingface.co/docs/hub/en/security-tokens)

### Use an Embedding Model

1. Set up the environment.

   Create an interactive Python notebook by saving a file with the `.ipynb` extension, and then run the following command in the notebook to install the dependencies:

   ```python
   pip install --quiet --upgrade voyageai pymongo
   ```

2. Define and test the function to generate vector embeddings.

   Paste and run the following code in your notebook to create a function named `get_embedding()` that generates vector embeddings by using an embedding model from [Voyage AI](https://www.voyageai.com). Replace `<api-key>` with your [Voyage API key.](https://docs.voyageai.com/docs/api-key-and-installation)

   The function specifies the following:

   - `voyage-4-large` as the embedding model to use.

   - `input_type` parameter to optimize your embeddings for retrieval. To learn more, see [Voyage AI Python Client.](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-python-client)

   **Tip:**

   For all models and parameters, see [Voyage AI Text Embeddings.](https://www.mongodb.com/docs/voyageai/models/text-embeddings.md#std-label-voyage-text-embeddings)

   ```python
   import os
   import voyageai

   # Specify your Voyage API key and embedding model
   os.environ["VOYAGE_API_KEY"] = "<api-key>"
   model = "voyage-4-large"
   vo = voyageai.Client()

   # Define a function to generate embeddings
   def get_embedding(data, input_type = "document"):
     embeddings = vo.embed(
         data, model = model, input_type = input_type
     ).embeddings
     return embeddings[0]

   # Generate an embedding
   embedding = get_embedding("foo")
   print(embedding)
   ```

   **Output:**

   ```shell
   [-0.0680396631360054, 0.03951127082109451, 0.010895480401813984, -0.041856683790683746, ... 0.0393928699195385, 0.0013418495655059814, -0.005869182292371988, -0.014275475405156612]
   ```

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section to define a function that converts your embeddings to BSON binary format.

   Optionally, you can compress your embeddings by converting them to BSON (Binary Javascript Object Notation) binary format, also called `binData` vectors, for efficient storage and retrieval. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

   This code does the following:

   - Defines a function named `generate_bson_vector` to convert embeddings to `binData` vectors by using binary tools from the [PyMongo driver.](https://www.mongodb.com/docs/drivers/pymongo/)

   - Converts the embeddings you generated for the string `foo` to `binData` vectors. The exact embedding varies depending on the model you use.

   **Note:**

   When you convert your embeddings to `binData` vectors, your embeddings appear in binary format.

   ```python
   from bson.binary import Binary 
   from bson.binary import BinaryVectorDtype

   # Define a function to generate BSON vectors
   def generate_bson_vector(vector, vector_dtype):
      return Binary.from_vector(vector, vector_dtype)

   # Generate BSON vector from the sample float32 embedding
   bson_float32_embedding = generate_bson_vector(embedding, BinaryVectorDtype.FLOAT32)

   # Print the converted embedding
   print(f"The converted BSON embedding is: {bson_float32_embedding}")
   ```

   **Output:**

   ```shell
   The converted BSON embedding is: b'\'\x00aX\x8b\xbd\x92\xd6!=\xf5\x822<\x ... \xc0\xbb\xaf\xe3i\xbc'
   ```

1) Set up the environment.

   Create an interactive Python notebook by saving a file with the `.ipynb` extension, and then run the following command in the notebook to install the dependencies:

   ```python
   pip install --quiet --upgrade voyageai pymongo
   ```

2) Define and test the function to generate vector embeddings.

   Paste and run the following code in your notebook to create a function named `get_embedding()` that generates vector embeddings by using an embedding model from [Voyage AI](https://www.voyageai.com). Replace `<api-key>` with your [Voyage API key.](https://docs.voyageai.com/docs/api-key-and-installation)

   The function specifies the following:

   - `voyage-4-large` as the embedding model to use.

   - `input_type` parameter to optimize your embeddings for retrieval. To learn more, see [Voyage AI Python Client.](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-python-client)

   **Tip:**

   For all models and parameters, see [Voyage AI Text Embeddings.](https://www.mongodb.com/docs/voyageai/models/text-embeddings.md#std-label-voyage-text-embeddings)

   ```python
   import os
   import voyageai

   # Specify your Voyage API key and embedding model
   os.environ["VOYAGE_API_KEY"] = "<api-key>"
   model = "voyage-4-large"
   vo = voyageai.Client()

   # Define a function to generate embeddings
   def get_embedding(data, input_type = "document"):
     embeddings = vo.embed(
         data, model = model, input_type = input_type
     ).embeddings
     return embeddings[0]

   # Generate an embedding
   embedding = get_embedding("foo")
   print(embedding)
   ```

   **Output:**

   ```shell
   [-0.0680396631360054, 0.03951127082109451, 0.010895480401813984, -0.041856683790683746, ... 0.0393928699195385, 0.0013418495655059814, -0.005869182292371988, -0.014275475405156612]
   ```

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section to define a function that converts your embeddings to BSON binary format.

   Optionally, you can compress your embeddings by converting them to BSON (Binary Javascript Object Notation) binary format, also called `binData` vectors, for efficient storage and retrieval. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

   This code does the following:

   - Defines a function named `generate_bson_vector` to convert embeddings to `binData` vectors by using binary tools from the [PyMongo driver.](https://www.mongodb.com/docs/drivers/pymongo/)

   - Converts the embeddings you generated for the string `foo` to `binData` vectors. The exact embedding varies depending on the model you use.

   **Note:**

   When you convert your embeddings to `binData` vectors, your embeddings appear in binary format.

   ```python
   from bson.binary import Binary 
   from bson.binary import BinaryVectorDtype

   # Define a function to generate BSON vectors
   def generate_bson_vector(vector, vector_dtype):
      return Binary.from_vector(vector, vector_dtype)

   # Generate BSON vector from the sample float32 embedding
   bson_float32_embedding = generate_bson_vector(embedding, BinaryVectorDtype.FLOAT32)

   # Print the converted embedding
   print(f"The converted BSON embedding is: {bson_float32_embedding}")
   ```

   **Output:**

   ```shell
   The converted BSON embedding is: b'\'\x00aX\x8b\xbd\x92\xd6!=\xf5\x822<\x ... \xc0\xbb\xaf\xe3i\xbc'
   ```

1. Initialize your Node.js project.

   In a terminal window, run the following commands to create a new directory named `my-embeddings-project` and initialize your project:

   ```text
   mkdir my-embeddings-project
   cd my-embeddings-project
   npm init -y
   ```

2. Update your `package.json` file.

   Configure your project to use [ES modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules) by adding `"type": "module"` to your `package.json` file and then saving it.

   ```javascript
   {
     "type": "module",
     // other fields...
   }
   ```

3. Install and import dependencies.

   In a terminal window, run the following command:

   ```text
   npm install mongodb voyageai
   ```

4. Store environment variables.

   In your project, create a `.env` file with the following contents:

   ```text
   VOYAGE_API_KEY = "<api-key>"
   MONGODB_URI = "<connection-string>"
   ```

   Replace the `<api-key>` placeholder value with your [Voyage API key.](https://docs.voyageai.com/docs/api-key-and-installation)

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

   **Note: Minimum Node.js Version Requirements**

   Node.js v20.x introduced the `--env-file` option. If you are using an older version of Node.js, add the `dotenv` package to your project, or use a different method to manage your environment variables.

   Save the file.

5. Define a function to generate vector embeddings.

   Create a file named `get-embeddings.js`.

   Paste the following code. This code defines a function named `getEmbedding()` that uses the `voyage-3-large` model to generate an embedding for a given text input.

   ```js
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

   **Tip:**

   To learn more, see [Voyage Typescript Library](https://www.npmjs.com/package/voyageai) and [embedding models.](https://www.mongodb.com/docs/voyageai/models.md#std-label-voyage-models)

   Save the file.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section to define a function that converts your embeddings to BSON binary format.

   Optionally, you can compress your embeddings by converting them to BSON (Binary Javascript Object Notation) binary format, also called `binData` vectors, for efficient storage and retrieval. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

   Create a file named `convert-embeddings.js`.

   ```shell
   touch convert-embeddings.js
   ```

   Paste the following code in the file.

   This code defines a function named `convertEmbeddingsToBSON` to convert `float32` embeddings to `binData` vectors by using binary tools from the [Node.js driver.](https://www.mongodb.com/docs/drivers/node/)

   **Note:**

   When you convert your embeddings to `binData` vectors, your embeddings appear in binary format.

   ```js
   import fs from "fs/promises"; 
   import { BSON } from "mongodb"; 
   const { Binary } = BSON; 
     
   async function main() {  
     try {  
       // Read the contents of the original 'embeddings.json' file  
       const fileContent = await fs.readFile("embeddings.json", "utf8");  
       const embeddingsData = JSON.parse(fileContent); // Parse JSON into a JavaScript object  
     
       // Validate the structure of the original input data  
       if (!Array.isArray(embeddingsData)) {  
         throw new Error("'embeddings.json' must contain an array of objects.");  
       }  
     
       // Convert embeddings to BSON-compatible format  
       const convertEmbeddingsData = embeddingsData.map(({ text, embeddings }) => {  
         // Field validation to ensure all required embeddings are present  
         if (  
           !embeddings ||  
           !Array.isArray(embeddings.float) ||  
           !Array.isArray(embeddings.int8) ||  
           !Array.isArray(embeddings.ubinary)  
         ) {  
           throw new Error(`Embeddings are missing or invalid for text: "${text}"`);  
         }  
     
         // Convert embeddings to BSON-compatible binary format  
         const bsonFloat32 = Binary.fromFloat32Array(new Float32Array(embeddings.float));  
         const bsonInt8 = Binary.fromInt8Array(new Int8Array(embeddings.int8));  
         const bsonPackedBits = Binary.fromPackedBits(new Uint8Array(embeddings.ubinary));  
     
         // Return the updated object structure  
         return {  
           text,  
           embeddings: {  // Original embeddings
             float: embeddings.float, 
             int8: embeddings.int8,  
             ubinary: embeddings.ubinary,  
           },  
           bsonEmbeddings: {  // BSON embeddings
             float32: bsonFloat32, 
             int8: bsonInt8,
             packedBits: bsonPackedBits, 
           },  
         };  
       });  
     
       // Serialize the updated data to BSON-compatible JSON using EJSON  
       const ejsonSerializedData = BSON.EJSON.stringify(convertEmbeddingsData, null, 2, { relaxed: false });  
     
       // Write the updated BSON-converted data back to the same 'embeddings.json' file  
       await fs.writeFile("embeddings.json", ejsonSerializedData);  
     
       console.log("Embeddings with BSON vectors have been saved to embeddings.json");  
     } catch (error) {  
       // Print detailed error information  
       console.error("Error processing embeddings:", error);  
     }  
   }  
     
   // Execute the conversion process  
   main();  

   ```

   Save the file.

1) Initialize your Node.js project.

   In a terminal window, run the following commands to create a new directory named `my-embeddings-project` and initialize your project:

   ```text
   mkdir my-embeddings-project
   cd my-embeddings-project
   npm init -y
   ```

2) Update your `package.json` file.

   Configure your project to use [ES modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules) by adding `"type": "module"` to your `package.json` file and then saving it.

   ```javascript
   {
     "type": "module",
     // other fields...
   }
   ```

3) Install and import dependencies.

   In a terminal window, run the following command:

   ```text
   npm install mongodb voyageai
   ```

4) Store environment variables.

   In your project, create a `.env` file with the following contents:

   ```text
   VOYAGE_API_KEY = "<api-key>"
   MONGODB_URI = "<connection-string>"
   ```

   Replace the `<api-key>` placeholder value with your [Voyage API key.](https://docs.voyageai.com/docs/api-key-and-installation)

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

   **Note: Minimum Node.js Version Requirements**

   Node.js v20.x introduced the `--env-file` option. If you are using an older version of Node.js, add the `dotenv` package to your project, or use a different method to manage your environment variables.

   Save the file.

5) Define a function to generate vector embeddings.

   Create a file named `get-embeddings.js`.

   Paste the following code. This code defines a function named `getEmbedding()` that uses the `voyage-3-large` model to generate an embedding for a given text input.

   ```js
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

   **Tip:**

   To learn more, see [Voyage Typescript Library](https://www.npmjs.com/package/voyageai) and [embedding models.](https://www.mongodb.com/docs/voyageai/models.md#std-label-voyage-models)

   Save the file.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section to define a function that converts your embeddings to BSON binary format.

   Optionally, you can compress your embeddings by converting them to BSON (Binary Javascript Object Notation) binary format, also called `binData` vectors, for efficient storage and retrieval. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

   Create a file named `convert-embeddings.js`.

   ```shell
   touch convert-embeddings.js
   ```

   Paste the following code in the file.

   This code defines a function named `convertEmbeddingsToBSON` to convert `float32` embeddings to `binData` vectors by using binary tools from the [Node.js driver.](https://www.mongodb.com/docs/drivers/node/)

   **Note:**

   When you convert your embeddings to `binData` vectors, your embeddings appear in binary format.

   ```js
   import fs from "fs/promises"; 
   import { BSON } from "mongodb"; 
   const { Binary } = BSON; 
     
   async function main() {  
     try {  
       // Read the contents of the original 'embeddings.json' file  
       const fileContent = await fs.readFile("embeddings.json", "utf8");  
       const embeddingsData = JSON.parse(fileContent); // Parse JSON into a JavaScript object  
     
       // Validate the structure of the original input data  
       if (!Array.isArray(embeddingsData)) {  
         throw new Error("'embeddings.json' must contain an array of objects.");  
       }  
     
       // Convert embeddings to BSON-compatible format  
       const convertEmbeddingsData = embeddingsData.map(({ text, embeddings }) => {  
         // Field validation to ensure all required embeddings are present  
         if (  
           !embeddings ||  
           !Array.isArray(embeddings.float) ||  
           !Array.isArray(embeddings.int8) ||  
           !Array.isArray(embeddings.ubinary)  
         ) {  
           throw new Error(`Embeddings are missing or invalid for text: "${text}"`);  
         }  
     
         // Convert embeddings to BSON-compatible binary format  
         const bsonFloat32 = Binary.fromFloat32Array(new Float32Array(embeddings.float));  
         const bsonInt8 = Binary.fromInt8Array(new Int8Array(embeddings.int8));  
         const bsonPackedBits = Binary.fromPackedBits(new Uint8Array(embeddings.ubinary));  
     
         // Return the updated object structure  
         return {  
           text,  
           embeddings: {  // Original embeddings
             float: embeddings.float, 
             int8: embeddings.int8,  
             ubinary: embeddings.ubinary,  
           },  
           bsonEmbeddings: {  // BSON embeddings
             float32: bsonFloat32, 
             int8: bsonInt8,
             packedBits: bsonPackedBits, 
           },  
         };  
       });  
     
       // Serialize the updated data to BSON-compatible JSON using EJSON  
       const ejsonSerializedData = BSON.EJSON.stringify(convertEmbeddingsData, null, 2, { relaxed: false });  
     
       // Write the updated BSON-converted data back to the same 'embeddings.json' file  
       await fs.writeFile("embeddings.json", ejsonSerializedData);  
     
       console.log("Embeddings with BSON vectors have been saved to embeddings.json");  
     } catch (error) {  
       // Print detailed error information  
       console.error("Error processing embeddings:", error);  
     }  
   }  
     
   // Execute the conversion process  
   main();  

   ```

   Save the file.

In this section, you use an embedding model to generate vector embeddings.

1. Initialize your Go project.

   In a terminal window, run the following commands to create a new directory named `my-embeddings-project` and initialize your project:

   ```text
   mkdir my-embeddings-project
   cd my-embeddings-project
   go mod init my-embeddings-project
   ```

2. Install and import dependencies.

   In a terminal window, run the following commands:

   ```text
   go get github.com/joho/godotenv
   go get go.mongodb.org/mongo-driver/v2/mongo
   ```

3. Set your environment variables.

   In your terminal window, run the following commands to set the required environment variables.

   ```text
   export VOYAGE_API_KEY="<api-key>"
   export MONGODB_URI="<connection-string>"
   ```

   Replace the `<api-key>` placeholder value with your Voyage API key.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Define a function to generate vector embeddings.

   Create a directory in your project called `common` to store code you'll use in multiple steps:

   ```text
   mkdir common && cd common
   ```

   Create a file named `get-embeddings.go` and paste the following code. This code defines a function named `GetEmbeddings()` that uses Voyage AI's `voyage-3-large` model to generate an embedding for a given input.

   ```go
   package common

   import (
   	"bytes"
   	"context"
   	"encoding/json"
   	"fmt"
   	"io/ioutil"
   	"log"
   	"net/http"
   	"os"
   	"time"
   )

   var apiKey = os.Getenv("VOYAGE_API_KEY")

   // Fetch embeddings using Voyage AI REST API
   func GetEmbeddings(docs []string) [][]float32 {
   	if apiKey == "" {
   		log.Fatalf("VOYAGE_API_KEY environment variable is not set")
   		return nil
   	}

   	url := "https://ai.mongodb.com/v1/embeddings"

   	// Prepare request body according to the API specification
   	requestBody := map[string]interface{}{
   		"input":            docs,
   		"model":            "voyage-3-large",
   		"output_dimension": 1024,
   	}

   	requestBytes, err := json.Marshal(requestBody)
   	if err != nil {
   		log.Fatalf("failed to marshal request body: %v", err)
   		return nil
   	}

   	// Create context with timeout
   	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
   	defer cancel()

   	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(requestBytes))
   	if err != nil {
   		log.Fatalf("failed to create HTTP request: %v", err)
   		return nil
   	}

   	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
   	req.Header.Set("Content-Type", "application/json")

   	client := &http.Client{}
   	resp, err := client.Do(req)
   	if err != nil {
   		log.Fatalf("failed to make API request: %v", err)
   		return nil
   	}
   	defer resp.Body.Close()

   	if resp.StatusCode != http.StatusOK {
   		body, _ := ioutil.ReadAll(resp.Body)
   		log.Fatalf("unexpected status code %d: %s", resp.StatusCode, string(body))
   		return nil
   	}

   	// Response structure according to the API specification
   	var response struct {
   		Object string `json:"object"`
   		Data   []struct {
   			Object    string    `json:"object"`
   			Embedding []float32 `json:"embedding"`
   			Index     int       `json:"index"`
   		} `json:"data"`
   		Model string `json:"model"`
   		Usage struct {
   			TotalTokens int `json:"total_tokens"`
   		} `json:"usage"`
   	}

   	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
   		log.Fatalf("failed to parse API response: %v", err)
   		return nil
   	}

   	// Extract embeddings from the response
   	embeddings := make([][]float32, len(response.Data))
   	for i, item := range response.Data {
   		embeddings[i] = item.Embedding
   	}

   	return embeddings
   }

   ```

   Move back into the main project root directory.

   ```console
   cd ../
   ```

In this section, you use an embedding model to generate vector embeddings.

1. Initialize your Go project.

   In a terminal window, run the following commands to create a new directory named `my-embeddings-project` and initialize your project:

   ```text
   mkdir my-embeddings-project
   cd my-embeddings-project
   go mod init my-embeddings-project
   ```

2. Install and import dependencies.

   In a terminal window, run the following commands:

   ```text
   go get github.com/joho/godotenv
   go get go.mongodb.org/mongo-driver/v2/mongo
   ```

3. Set your environment variables.

   In your terminal window, run the following commands to set the required environment variables.

   ```text
   export VOYAGE_API_KEY="<api-key>"
   export MONGODB_URI="<connection-string>"
   ```

   Replace the `<api-key>` placeholder value with your Voyage API key.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Define a function to generate vector embeddings.

   Create a directory in your project called `common` to store code you'll use in multiple steps:

   ```text
   mkdir common && cd common
   ```

   Create a file named `get-embeddings.go` and paste the following code. This code defines a function named `GetEmbeddings()` that uses Voyage AI's `voyage-3-large` model to generate an embedding for a given input.

   ```go
   package common

   import (
   	"bytes"
   	"context"
   	"encoding/json"
   	"fmt"
   	"io/ioutil"
   	"log"
   	"net/http"
   	"os"
   	"time"
   )

   var apiKey = os.Getenv("VOYAGE_API_KEY")

   // Fetch embeddings using Voyage AI REST API
   func GetEmbeddings(docs []string) [][]float32 {
   	if apiKey == "" {
   		log.Fatalf("VOYAGE_API_KEY environment variable is not set")
   		return nil
   	}

   	url := "https://ai.mongodb.com/v1/embeddings"

   	// Prepare request body according to the API specification
   	requestBody := map[string]interface{}{
   		"input":            docs,
   		"model":            "voyage-3-large",
   		"output_dimension": 1024,
   	}

   	requestBytes, err := json.Marshal(requestBody)
   	if err != nil {
   		log.Fatalf("failed to marshal request body: %v", err)
   		return nil
   	}

   	// Create context with timeout
   	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
   	defer cancel()

   	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(requestBytes))
   	if err != nil {
   		log.Fatalf("failed to create HTTP request: %v", err)
   		return nil
   	}

   	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
   	req.Header.Set("Content-Type", "application/json")

   	client := &http.Client{}
   	resp, err := client.Do(req)
   	if err != nil {
   		log.Fatalf("failed to make API request: %v", err)
   		return nil
   	}
   	defer resp.Body.Close()

   	if resp.StatusCode != http.StatusOK {
   		body, _ := ioutil.ReadAll(resp.Body)
   		log.Fatalf("unexpected status code %d: %s", resp.StatusCode, string(body))
   		return nil
   	}

   	// Response structure according to the API specification
   	var response struct {
   		Object string `json:"object"`
   		Data   []struct {
   			Object    string    `json:"object"`
   			Embedding []float32 `json:"embedding"`
   			Index     int       `json:"index"`
   		} `json:"data"`
   		Model string `json:"model"`
   		Usage struct {
   			TotalTokens int `json:"total_tokens"`
   		} `json:"usage"`
   	}

   	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
   		log.Fatalf("failed to parse API response: %v", err)
   		return nil
   	}

   	// Extract embeddings from the response
   	embeddings := make([][]float32, len(response.Data))
   	for i, item := range response.Data {
   		embeddings[i] = item.Embedding
   	}

   	return embeddings
   }

   ```

   Move back into the main project root directory.

   ```console
   cd ../
   ```

In this section, you use an embedding model to generate vector embeddings.

1. Create your Java project and install dependencies.

   From your IDE, create a Java project using Maven or Gradle.

   Add the following dependencies, depending on your package manager:

   ### Maven

   If you are using Maven, add the following dependencies to the `dependencies` array in your project's `pom.xml` file:

   ```xml
   <dependencies>
      <!-- MongoDB Java Sync Driver v5.2.0 or later -->
      <dependency>
         <groupId>org.mongodb</groupId>
         <artifactId>mongodb-driver-sync</artifactId>
         <version>[5.2.0,)</version> </dependency> <!-- Java library for working with Voyage AI models --> <dependency> <groupId>dev.langchain4j</groupId> <artifactId>langchain4j-voyage-ai</artifactId> <version>1.1.0-beta7</version> </dependency> </dependencies> ``` Run your package manager to install the dependencies to your project. 2. Set your environment variables. **Note:** This example sets the variables for the project in the IDE. Production applications might manage environment variables through a deployment configuration, CI/CD pipeline, or secrets manager, but you can adapt the provided code to fit your use case. In your IDE, create a new configuration template and add the following variables to your project: - If you are using IntelliJ IDEA, create a new Application run configuration template, then add your variables as semicolon-separated values in the Environment variables field (for example, `FOO=123;BAR=456`). Apply the changes and click OK. To learn more, see the [Create a run/debug configuration from a template](https://www.jetbrains.com/help/idea/run-debug-configuration.html#createExplicitly) section of the IntelliJ IDEA documentation.

   - If you are using Eclipse, create a new Java Application launch configuration, then add each variable as a new key-value pair in the Environment tab. Apply the changes and click OK.

     To learn more, see the [Creating a Java application launch configuration](https://help.eclipse.org/latest/topic/org.eclipse.jdt.doc.user/tasks/tasks-java-local-configuration.htm) section of the Eclipse IDE documentation.

   ```shell
   VOYAGE_AI_KEY=<api-key>
   MONGODB_URI=<connection-string>
   ```

   Update the placeholders with the following values:

   - Replace the `<api-key>` placeholder value with your Voyage AI API key.

   - Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

     ### Atlas Cluster

     Your connection string should use the following format:

     ```text
     mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
     ```

     To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Define a method to generate vector embeddings.

   Create a file named `EmbeddingProvider.java` and paste the following code.

   This code defines two methods to generate embeddings for a given input using the [voyage-4-large](https://www.mongodb.com/docs/voyageai/models.md#std-label-voyage-models) embedding model from Voyage AI:

   - **Multiple Inputs**: The `getEmbeddings()` method accepts an array of text inputs (`List<String>`), allowing you to create multiple embeddings in a single API call. The method converts the API-provided arrays of floats to BSON arrays of doubles for storing in your Atlas cluster.

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
                       .modelName("voyage-4-large")
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

In this section, you use an embedding model to generate vector embeddings.

1. Create your Java project and install dependencies.

   From your IDE, create a Java project using Maven or Gradle.

   Add the following dependencies, depending on your package manager:

   ### Maven

   If you are using Maven, add the following dependencies to the `dependencies` array in your project's `pom.xml` file:

   ```xml
   <dependencies>
      <!-- MongoDB Java Sync Driver v5.2.0 or later -->
      <dependency>
         <groupId>org.mongodb</groupId>
         <artifactId>mongodb-driver-sync</artifactId>
         <version>[5.2.0,)</version> </dependency> <!-- Java library for working with Voyage AI models --> <dependency> <groupId>dev.langchain4j</groupId> <artifactId>langchain4j-voyage-ai</artifactId> <version>1.1.0-beta7</version> </dependency> </dependencies> ``` Run your package manager to install the dependencies to your project. 2. Set your environment variables. **Note:** This example sets the variables for the project in the IDE. Production applications might manage environment variables through a deployment configuration, CI/CD pipeline, or secrets manager, but you can adapt the provided code to fit your use case. In your IDE, create a new configuration template and add the following variables to your project: - If you are using IntelliJ IDEA, create a new Application run configuration template, then add your variables as semicolon-separated values in the Environment variables field (for example, `FOO=123;BAR=456`). Apply the changes and click OK. To learn more, see the [Create a run/debug configuration from a template](https://www.jetbrains.com/help/idea/run-debug-configuration.html#createExplicitly) section of the IntelliJ IDEA documentation.

   - If you are using Eclipse, create a new Java Application launch configuration, then add each variable as a new key-value pair in the Environment tab. Apply the changes and click OK.

     To learn more, see the [Creating a Java application launch configuration](https://help.eclipse.org/latest/topic/org.eclipse.jdt.doc.user/tasks/tasks-java-local-configuration.htm) section of the Eclipse IDE documentation.

   ```shell
   VOYAGE_AI_KEY=<api-key>
   MONGODB_URI=<connection-string>
   ```

   Update the placeholders with the following values:

   - Replace the `<api-key>` placeholder value with your Voyage AI API key.

   - Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

     ### Atlas Cluster

     Your connection string should use the following format:

     ```text
     mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
     ```

     To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Define a method to generate vector embeddings.

   Create a file named `EmbeddingProvider.java` and paste the following code.

   This code defines two methods to generate embeddings for a given input using the [voyage-4-large](https://www.mongodb.com/docs/voyageai/models.md#std-label-voyage-models) embedding model from Voyage AI:

   - **Multiple Inputs**: The `getEmbeddings()` method accepts an array of text inputs (`List<String>`), allowing you to create multiple embeddings in a single API call. The method converts the API-provided arrays of floats to BSON arrays of doubles for storing in your Atlas cluster.

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
                       .modelName("voyage-4-large")
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

In this section, you use an embedding model to generate vector embeddings.

1. Initialize your .NET project.

   In a terminal window, run the following commands to initialize your project:

   ```text
   dotnet new console -o MyCompany.Embeddings
   cd MyCompany.Embeddings
   ```

2. Install and import dependencies.

   In a terminal window, run the following command:

   ```text
   dotnet add package MongoDB.Driver
   ```

3. Set your environment variables.

   Export your environment variables, `set` them in PowerShell, or use your IDE's environment variable manager to make the MongoDB connection string and Voyage AI API key available to your project.

   ```text
   export VOYAGE_API_KEY="<api-key>"
   export MONGODB_URI="<connection-string>"
   ```

   Replace the `<api-key>` placeholder value with your Voyage AI API key.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Define a function to generate vector embeddings.

   Create a new class in a same-named file named `AIService.cs` and paste the following code. This code defines an async Task named `GetEmbeddingsAsync()` to generate a array of embeddings for an array of given string inputs. This function uses Voyage AI's `voyage-3-large` model to generate an embedding for a given input.

   ```csharp
   namespace MyCompany.Embeddings;

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

In this section, you use an embedding model to generate vector embeddings.

1. Initialize your .NET project.

   In a terminal window, run the following commands to initialize your project:

   ```text
   dotnet new console -o MyCompany.Embeddings
   cd MyCompany.Embeddings
   ```

2. Install and import dependencies.

   In a terminal window, run the following command:

   ```text
   dotnet add package MongoDB.Driver
   ```

3. Set your environment variables.

   Export your environment variables, `set` them in PowerShell, or use your IDE's environment variable manager to make the MongoDB connection string and Voyage AI API key available to your project.

   ```text
   export VOYAGE_API_KEY="<api-key>"
   export MONGODB_URI="<connection-string>"
   ```

   Replace the `<api-key>` placeholder value with your Voyage AI API key.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Define a function to generate vector embeddings.

   Create a new class in a same-named file named `AIService.cs` and paste the following code. This code defines an async Task named `GetEmbeddingsAsync()` to generate a array of embeddings for an array of given string inputs. This function uses Voyage AI's `voyage-3-large` model to generate an embedding for a given input.

   ```csharp
   namespace MyCompany.Embeddings;

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

In this section, you use an embedding model to generate vector embeddings. This example also includes an optional function that you can use to compress your embeddings for efficient storage and improved query performance. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

1. Set up the environment.

   Create an interactive Python notebook by saving a file with the `.ipynb` extension, and then run the following command in the notebook to install the dependencies:

   ```python
   pip install --quiet --upgrade openai pymongo
   ```

2. Define and test a function to generate vector embeddings.

   Paste and run the following code in your notebook to create a function that generates vector embeddings by using a proprietary embedding model from [OpenAI](http://openai.com). Replace `<api-key>` with your OpenAI API (Application Programming Interface) key. This code does the following:

   - Specifies the `text-embedding-3-small` embedding model.

   - Creates a function named `get_embedding()` that calls the model's API (Application Programming Interface) to generate an embedding for a given text input.

   - Tests the function by generating a single embedding for the string `foo`.

   ```python
   import os
   from openai import OpenAI

   # Specify your OpenAI API key and embedding model
   os.environ["OPENAI_API_KEY"] = "<api-key>"
   model = "text-embedding-3-small"
   openai_client = OpenAI()

   # Define a function to generate embeddings
   def get_embedding(text):
      """Generates vector embeddings for the given text."""

      embedding = openai_client.embeddings.create(input = [text], model=model).data[0].embedding
      return embedding

   # Generate an embedding
   embedding = get_embedding("foo")
   print(embedding)
   ```

   **Output:**

   ```sh
   [-0.005843308754265308, -0.013111298903822899, -0.014585349708795547, 0.03580040484666824, 0.02671629749238491, ... ]
   ```

   **See also:**

   For API (Application Programming Interface) details and a list of available models, refer to the [OpenAI documentation.](https://platform.openai.com/docs/guides/embeddings)

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section to define a function that converts your embeddings to BSON binary format.

   Optionally, you can compress your embeddings by converting them to BSON (Binary Javascript Object Notation) binary format, also called `binData` vectors, for efficient storage and retrieval. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

   This code does the following:

   - Defines a function named `generate_bson_vector` to convert embeddings to `binData` vectors by using binary tools from the [PyMongo driver.](https://www.mongodb.com/docs/drivers/pymongo/)

   - Converts the embeddings you generated for the string `foo` to `binData` vectors. The exact embedding varies depending on the model you use.

   **Note:**

   When you convert your embeddings to `binData` vectors, your embeddings appear in binary format.

   ```python
   from bson.binary import Binary 
   from bson.binary import BinaryVectorDtype

   # Define a function to generate BSON vectors
   def generate_bson_vector(vector, vector_dtype):
      return Binary.from_vector(vector, vector_dtype)

   # Generate BSON vector from the sample float32 embedding
   bson_float32_embedding = generate_bson_vector(embedding, BinaryVectorDtype.FLOAT32)

   # Print the converted embedding
   print(f"The converted BSON embedding is: {bson_float32_embedding}")
   ```

   **Output:**

   ```shell
   The converted BSON embedding is: b'\'\x00:y\xbf\...\xbb\xdaC\x9a\xbc'
   ```

In this section, you use an embedding model to generate vector embeddings. This example also includes an optional function that you can use to compress your embeddings for efficient storage and improved query performance. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

1. Set up the environment.

   Create an interactive Python notebook by saving a file with the `.ipynb` extension, and then run the following command in the notebook to install the dependencies:

   ```python
   pip install --quiet --upgrade openai pymongo
   ```

2. Define and test a function to generate vector embeddings.

   Paste and run the following code in your notebook to create a function that generates vector embeddings by using a proprietary embedding model from [OpenAI](http://openai.com). Replace `<api-key>` with your OpenAI API (Application Programming Interface) key. This code does the following:

   - Specifies the `text-embedding-3-small` embedding model.

   - Creates a function named `get_embedding()` that calls the model's API (Application Programming Interface) to generate an embedding for a given text input.

   - Tests the function by generating a single embedding for the string `foo`.

   ```python
   import os
   from openai import OpenAI

   # Specify your OpenAI API key and embedding model
   os.environ["OPENAI_API_KEY"] = "<api-key>"
   model = "text-embedding-3-small"
   openai_client = OpenAI()

   # Define a function to generate embeddings
   def get_embedding(text):
      """Generates vector embeddings for the given text."""

      embedding = openai_client.embeddings.create(input = [text], model=model).data[0].embedding
      return embedding

   # Generate an embedding
   embedding = get_embedding("foo")
   print(embedding)
   ```

   **Output:**

   ```sh
   [-0.005843308754265308, -0.013111298903822899, -0.014585349708795547, 0.03580040484666824, 0.02671629749238491, ... ]
   ```

   **See also:**

   For API (Application Programming Interface) details and a list of available models, refer to the [OpenAI documentation.](https://platform.openai.com/docs/guides/embeddings)

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section to define a function that converts your embeddings to BSON binary format.

   Optionally, you can compress your embeddings by converting them to BSON (Binary Javascript Object Notation) binary format, also called `binData` vectors, for efficient storage and retrieval. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

   This code does the following:

   - Defines a function named `generate_bson_vector` to convert embeddings to `binData` vectors by using binary tools from the [PyMongo driver.](https://www.mongodb.com/docs/drivers/pymongo/)

   - Converts the embeddings you generated for the string `foo` to `binData` vectors. The exact embedding varies depending on the model you use.

   **Note:**

   When you convert your embeddings to `binData` vectors, your embeddings appear in binary format.

   ```python
   from bson.binary import Binary 
   from bson.binary import BinaryVectorDtype

   # Define a function to generate BSON vectors
   def generate_bson_vector(vector, vector_dtype):
      return Binary.from_vector(vector, vector_dtype)

   # Generate BSON vector from the sample float32 embedding
   bson_float32_embedding = generate_bson_vector(embedding, BinaryVectorDtype.FLOAT32)

   # Print the converted embedding
   print(f"The converted BSON embedding is: {bson_float32_embedding}")
   ```

   **Output:**

   ```shell
   The converted BSON embedding is: b'\'\x00:y\xbf\...\xbb\xdaC\x9a\xbc'
   ```

In this section, you use an embedding model to generate vector embeddings. This example also includes an optional function that you can use to compress your embeddings for efficient storage and improved query performance. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

1. Initialize your Node.js project.

   In a terminal window, run the following commands to create a new directory named `my-embeddings-project` and initialize your project:

   ```text
   mkdir my-embeddings-project
   cd my-embeddings-project
   npm init -y
   ```

2. Update your `package.json` file.

   Configure your project to use [ES modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules) by adding `"type": "module"` to your `package.json` file and then saving it.

   ```javascript
   {
     "type": "module",
     // other fields...
   }
   ```

3. Install and import dependencies.

   In a terminal window, run the following command:

   ```text
   npm install mongodb openai
   ```

4. Create a `.env` file.

   In your project, create a `.env` file to store your MongoDB connection string and OpenAI API key.

   ```text
   OPENAI_API_KEY = "<api-key>"
   MONGODB_URI = "<connection-string>"
   ```

   Replace the `<api-key>` placeholder value with your OpenAI API key.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

   **Note: Minimum Node.js Version Requirements**

   Node.js v20.x introduced the `--env-file` option. If you are using an older version of Node.js, add the `dotenv` package to your project, or use a different method to manage your environment variables.

   Save the file.

5. Define a function to generate vector embeddings.

   Create a file named `get-embeddings.js`.

   Paste the following code. This code defines a function named `getEmbedding()` that uses OpenAI's `text-embedding-3-small` model to generate an embedding for a given input.

   ```js
   import OpenAI from 'openai';

   // Set up OpenAI configuration
   const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

   // Function to generate embeddings using the OpenAI API
   export async function getEmbedding(text) {
       const results = await openai.embeddings.create({
           model: "text-embedding-3-small",
           input: text,
           encoding_format: "float",
       });
       return results.data[0].embedding;
   }

   ```

   Save the file.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section to define a function that converts your embeddings to BSON binary format.

   Optionally, you can compress your embeddings by converting them to BSON (Binary Javascript Object Notation) binary format, also called `binData` vectors, for efficient storage and retrieval. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

   Create a file named `convert-embeddings.js`.

   ```shell
   touch convert-embeddings.js
   ```

   Paste the following code in the file.

   This code defines a function named `convertEmbeddingsToBSON` to convert `float32` embeddings to `binData` vectors by using binary tools from the [Node.js driver.](https://www.mongodb.com/docs/drivers/node/)

   **Note:**

   When you convert your embeddings to `binData` vectors, your embeddings appear in binary format.

   ```js
   import fs from "fs/promises"; 
   import { BSON } from "mongodb"; 
   const { Binary } = BSON; 
     
   async function main() {  
     try {  
       // Read the contents of the original 'embeddings.json' file  
       const fileContent = await fs.readFile("embeddings.json", "utf8");  
       const embeddingsData = JSON.parse(fileContent); // Parse JSON into a JavaScript object  
     
       // Validate the structure of the original input data  
       if (!Array.isArray(embeddingsData)) {  
         throw new Error("'embeddings.json' must contain an array of objects.");  
       }  
     
       // Convert embeddings to BSON-compatible format  
       const convertEmbeddingsData = embeddingsData.map(({ text, embeddings }) => {  
         // Field validation to ensure all required embeddings are present  
         if (  
           !embeddings ||  
           !Array.isArray(embeddings.float) ||  
           !Array.isArray(embeddings.int8) ||  
           !Array.isArray(embeddings.ubinary)  
         ) {  
           throw new Error(`Embeddings are missing or invalid for text: "${text}"`);  
         }  
     
         // Convert embeddings to BSON-compatible binary format  
         const bsonFloat32 = Binary.fromFloat32Array(new Float32Array(embeddings.float));  
         const bsonInt8 = Binary.fromInt8Array(new Int8Array(embeddings.int8));  
         const bsonPackedBits = Binary.fromPackedBits(new Uint8Array(embeddings.ubinary));  
     
         // Return the updated object structure  
         return {  
           text,  
           embeddings: {  // Original embeddings
             float: embeddings.float, 
             int8: embeddings.int8,  
             ubinary: embeddings.ubinary,  
           },  
           bsonEmbeddings: {  // BSON embeddings
             float32: bsonFloat32, 
             int8: bsonInt8,
             packedBits: bsonPackedBits, 
           },  
         };  
       });  
     
       // Serialize the updated data to BSON-compatible JSON using EJSON  
       const ejsonSerializedData = BSON.EJSON.stringify(convertEmbeddingsData, null, 2, { relaxed: false });  
     
       // Write the updated BSON-converted data back to the same 'embeddings.json' file  
       await fs.writeFile("embeddings.json", ejsonSerializedData);  
     
       console.log("Embeddings with BSON vectors have been saved to embeddings.json");  
     } catch (error) {  
       // Print detailed error information  
       console.error("Error processing embeddings:", error);  
     }  
   }  
     
   // Execute the conversion process  
   main();  

   ```

   Save the file.

In this section, you use an embedding model to generate vector embeddings. This example also includes an optional function that you can use to compress your embeddings for efficient storage and improved query performance. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

1. Initialize your Node.js project.

   In a terminal window, run the following commands to create a new directory named `my-embeddings-project` and initialize your project:

   ```text
   mkdir my-embeddings-project
   cd my-embeddings-project
   npm init -y
   ```

2. Update your `package.json` file.

   Configure your project to use [ES modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules) by adding `"type": "module"` to your `package.json` file and then saving it.

   ```javascript
   {
     "type": "module",
     // other fields...
   }
   ```

3. Install and import dependencies.

   In a terminal window, run the following command:

   ```text
   npm install mongodb openai
   ```

4. Create a `.env` file.

   In your project, create a `.env` file to store your MongoDB connection string and OpenAI API key.

   ```text
   OPENAI_API_KEY = "<api-key>"
   MONGODB_URI = "<connection-string>"
   ```

   Replace the `<api-key>` placeholder value with your OpenAI API key.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

   **Note: Minimum Node.js Version Requirements**

   Node.js v20.x introduced the `--env-file` option. If you are using an older version of Node.js, add the `dotenv` package to your project, or use a different method to manage your environment variables.

   Save the file.

5. Define a function to generate vector embeddings.

   Create a file named `get-embeddings.js`.

   Paste the following code. This code defines a function named `getEmbedding()` that uses OpenAI's `text-embedding-3-small` model to generate an embedding for a given input.

   ```js
   import OpenAI from 'openai';

   // Set up OpenAI configuration
   const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

   // Function to generate embeddings using the OpenAI API
   export async function getEmbedding(text) {
       const results = await openai.embeddings.create({
           model: "text-embedding-3-small",
           input: text,
           encoding_format: "float",
       });
       return results.data[0].embedding;
   }

   ```

   Save the file.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section to define a function that converts your embeddings to BSON binary format.

   Optionally, you can compress your embeddings by converting them to BSON (Binary Javascript Object Notation) binary format, also called `binData` vectors, for efficient storage and retrieval. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

   Create a file named `convert-embeddings.js`.

   ```shell
   touch convert-embeddings.js
   ```

   Paste the following code in the file.

   This code defines a function named `convertEmbeddingsToBSON` to convert `float32` embeddings to `binData` vectors by using binary tools from the [Node.js driver.](https://www.mongodb.com/docs/drivers/node/)

   **Note:**

   When you convert your embeddings to `binData` vectors, your embeddings appear in binary format.

   ```js
   import fs from "fs/promises"; 
   import { BSON } from "mongodb"; 
   const { Binary } = BSON; 
     
   async function main() {  
     try {  
       // Read the contents of the original 'embeddings.json' file  
       const fileContent = await fs.readFile("embeddings.json", "utf8");  
       const embeddingsData = JSON.parse(fileContent); // Parse JSON into a JavaScript object  
     
       // Validate the structure of the original input data  
       if (!Array.isArray(embeddingsData)) {  
         throw new Error("'embeddings.json' must contain an array of objects.");  
       }  
     
       // Convert embeddings to BSON-compatible format  
       const convertEmbeddingsData = embeddingsData.map(({ text, embeddings }) => {  
         // Field validation to ensure all required embeddings are present  
         if (  
           !embeddings ||  
           !Array.isArray(embeddings.float) ||  
           !Array.isArray(embeddings.int8) ||  
           !Array.isArray(embeddings.ubinary)  
         ) {  
           throw new Error(`Embeddings are missing or invalid for text: "${text}"`);  
         }  
     
         // Convert embeddings to BSON-compatible binary format  
         const bsonFloat32 = Binary.fromFloat32Array(new Float32Array(embeddings.float));  
         const bsonInt8 = Binary.fromInt8Array(new Int8Array(embeddings.int8));  
         const bsonPackedBits = Binary.fromPackedBits(new Uint8Array(embeddings.ubinary));  
     
         // Return the updated object structure  
         return {  
           text,  
           embeddings: {  // Original embeddings
             float: embeddings.float, 
             int8: embeddings.int8,  
             ubinary: embeddings.ubinary,  
           },  
           bsonEmbeddings: {  // BSON embeddings
             float32: bsonFloat32, 
             int8: bsonInt8,
             packedBits: bsonPackedBits, 
           },  
         };  
       });  
     
       // Serialize the updated data to BSON-compatible JSON using EJSON  
       const ejsonSerializedData = BSON.EJSON.stringify(convertEmbeddingsData, null, 2, { relaxed: false });  
     
       // Write the updated BSON-converted data back to the same 'embeddings.json' file  
       await fs.writeFile("embeddings.json", ejsonSerializedData);  
     
       console.log("Embeddings with BSON vectors have been saved to embeddings.json");  
     } catch (error) {  
       // Print detailed error information  
       console.error("Error processing embeddings:", error);  
     }  
   }  
     
   // Execute the conversion process  
   main();  

   ```

   Save the file.

In this section, you use an embedding model to generate vector embeddings.

1. Initialize your Go project.

   In a terminal window, run the following commands to create a new directory named `my-embeddings-project` and initialize your project:

   ```text
   mkdir my-embeddings-project
   cd my-embeddings-project
   go mod init my-embeddings-project
   ```

2. Create a `.env` file to manage secrets.

   In your project, create a `.env` file to store your MongoDB connection string and OpenAI API token.

   ```text
   OPENAI_API_KEY = "<api-key>"
   MONGODB_URI = "<connection-string>"
   ```

   Replace the `<api-key>` placeholder value with your OpenAI API key.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Define a function to generate vector embeddings.

   Create a directory in your project called `common` to store code you'll use in multiple steps:

   ```text
   mkdir common && cd common
   ```

   Create a file named `get-embeddings.go` and paste the following code. This code defines a function named `GetEmbeddings()` that uses OpenAI's `text-embedding-3-small` model to generate an embedding for a given input.

   ```go
   package common

   import (
   	"context"
   	"fmt"
   	"log"
   	"os"

   	openai "github.com/openai/openai-go/v3"
   	"github.com/openai/openai-go/v3/option"
   )

   func GetEmbeddings(data []string) [][]float64 {
   	ctx := context.Background()

   	c := openai.NewClient(
   		option.WithAPIKey(os.Getenv("OPENAI_API_KEY")),
   	)

   	resp, err := c.Embeddings.New(ctx, openai.EmbeddingNewParams{
   		Model: openai.EmbeddingModelTextEmbedding3Large,
   		Input: openai.EmbeddingNewParamsInputUnion{
   			OfArrayOfStrings: data,
   		},
   	})
   	if err != nil {
   		log.Fatal(err)
   	}

   	embeddings := make([][]float64, len(resp.Data))
   	for i, d := range resp.Data {
   		embeddings[i] = d.Embedding
   	}

   	fmt.Printf("Generated %d embeddings\n", len(embeddings))
   	fmt.Printf("Embedding length: %d\n", len(embeddings[0]))

   	return embeddings
   }

   ```

4. Install and import dependencies.

   ```text
   go mod tidy
   ```

5. Change directories back to your project root.

   ```text
   cd ..
   ```

In this section, you use an embedding model to generate vector embeddings.

1. Initialize your Go project.

   In a terminal window, run the following commands to create a new directory named `my-embeddings-project` and initialize your project:

   ```text
   mkdir my-embeddings-project
   cd my-embeddings-project
   go mod init my-embeddings-project
   ```

2. Create a `.env` file to manage secrets.

   In your project, create a `.env` file to store your MongoDB connection string and OpenAI API token.

   ```text
   OPENAI_API_KEY = "<api-key>"
   MONGODB_URI = "<connection-string>"
   ```

   Replace the `<api-key>` placeholder value with your OpenAI API key.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Define a function to generate vector embeddings.

   Create a directory in your project called `common` to store code you'll use in multiple steps:

   ```text
   mkdir common && cd common
   ```

   Create a file named `get-embeddings.go` and paste the following code. This code defines a function named `GetEmbeddings()` that uses OpenAI's `text-embedding-3-small` model to generate an embedding for a given input.

   ```go
   package common

   import (
   	"context"
   	"fmt"
   	"log"
   	"os"

   	openai "github.com/openai/openai-go/v3"
   	"github.com/openai/openai-go/v3/option"
   )

   func GetEmbeddings(data []string) [][]float64 {
   	ctx := context.Background()

   	c := openai.NewClient(
   		option.WithAPIKey(os.Getenv("OPENAI_API_KEY")),
   	)

   	resp, err := c.Embeddings.New(ctx, openai.EmbeddingNewParams{
   		Model: openai.EmbeddingModelTextEmbedding3Large,
   		Input: openai.EmbeddingNewParamsInputUnion{
   			OfArrayOfStrings: data,
   		},
   	})
   	if err != nil {
   		log.Fatal(err)
   	}

   	embeddings := make([][]float64, len(resp.Data))
   	for i, d := range resp.Data {
   		embeddings[i] = d.Embedding
   	}

   	fmt.Printf("Generated %d embeddings\n", len(embeddings))
   	fmt.Printf("Embedding length: %d\n", len(embeddings[0]))

   	return embeddings
   }

   ```

4. Install and import dependencies.

   ```text
   go mod tidy
   ```

5. Change directories back to your project root.

   ```text
   cd ..
   ```

In this section, you use an embedding model to generate vector embeddings.

1. Create your Java project and install dependencies.

   From your IDE, create a Java project using Maven or Gradle.

   Add the following dependencies, depending on your package manager:

   ### Maven

   If you are using Maven, add the following dependencies to the `dependencies` array in your project's `pom.xml` file:

   ```xml
   <dependencies>
      <!-- MongoDB Java Sync Driver v5.2.0 or later -->
      <dependency>
         <groupId>org.mongodb</groupId>
         <artifactId>mongodb-driver-sync</artifactId>
         <version>[5.2.0,)</version> </dependency> <!-- Java library for working with OpenAI models --> <dependency> <groupId>dev.langchain4j</groupId> <artifactId>langchain4j-open-ai</artifactId> <version>0.35.0</version> </dependency> </dependencies> ``` Run your package manager to install the dependencies to your project. 2. Set your environment variables. **Note:** This example sets the variables for the project in the IDE. Production applications might manage environment variables through a deployment configuration, CI/CD pipeline, or secrets manager, but you can adapt the provided code to fit your use case. In your IDE, create a new configuration template and add the following variables to your project: - If you are using IntelliJ IDEA, create a new Application run configuration template, then add your variables as semicolon-separated values in the Environment variables field (for example, `FOO=123;BAR=456`). Apply the changes and click OK. To learn more, see the [Create a run/debug configuration from a template](https://www.jetbrains.com/help/idea/run-debug-configuration.html#createExplicitly) section of the IntelliJ IDEA documentation.

   - If you are using Eclipse, create a new Java Application launch configuration, then add each variable as a new key-value pair in the Environment tab. Apply the changes and click OK.

     To learn more, see the [Creating a Java application launch configuration](https://help.eclipse.org/latest/topic/org.eclipse.jdt.doc.user/tasks/tasks-java-local-configuration.htm) section of the Eclipse IDE documentation.

   ```shell
   OPEN_AI_API_KEY=<api-key>
   MONGODB_URI=<connection-string>
   ```

   Update the placeholders with the following values:

   - Replace the `<api-key>` placeholder value with your OpenAI API key.

   - Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

     ### Atlas Cluster

     Your connection string should use the following format:

     ```text
     mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
     ```

     To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Define a method to generate vector embeddings.

   Create a file named `EmbeddingProvider.java` and paste the following code.

   This code defines two methods to generate embeddings for a given input using the [text-embedding-3-small](https://platform.openai.com/docs/guides/embeddings/#embedding-models) OpenAI embedding model:

   - **Multiple Inputs**: The `getEmbeddings()` method accepts an array of text inputs (`List<String>`), allowing you to create multiple embeddings in a single API call. The method converts the API-provided arrays of floats to BSON arrays of doubles for storing in your Atlas cluster.

   - **Single Input**: The `getEmbedding()` method accepts a single `String`, which represents a query you want to make against your vector data. The method converts the API-provided array of floats to a BSON array of doubles to use when querying your collection.

   ```java
   import dev.langchain4j.data.embedding.Embedding;
   import dev.langchain4j.data.segment.TextSegment;
   import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
   import dev.langchain4j.model.output.Response;
   import org.bson.BsonArray;
   import org.bson.BsonDouble;

   import java.util.List;

   import static java.time.Duration.ofSeconds;

   public class EmbeddingProvider {

       private static OpenAiEmbeddingModel embeddingModel;

       private static OpenAiEmbeddingModel getEmbeddingModel() {
           if (embeddingModel == null) {
               String apiKey = System.getenv("OPEN_AI_API_KEY");
               if (apiKey == null || apiKey.isEmpty()) {
                   throw new IllegalStateException("OPEN_AI_API_KEY env variable is not set or is empty.");
               }

               return OpenAiEmbeddingModel.builder()
                       .apiKey(apiKey)
                       .modelName("text-embedding-3-small")
                       .timeout(ofSeconds(60))
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

In this section, you use an embedding model to generate vector embeddings.

1. Create your Java project and install dependencies.

   From your IDE, create a Java project using Maven or Gradle.

   Add the following dependencies, depending on your package manager:

   ### Maven

   If you are using Maven, add the following dependencies to the `dependencies` array in your project's `pom.xml` file:

   ```xml
   <dependencies>
      <!-- MongoDB Java Sync Driver v5.2.0 or later -->
      <dependency>
         <groupId>org.mongodb</groupId>
         <artifactId>mongodb-driver-sync</artifactId>
         <version>[5.2.0,)</version> </dependency> <!-- Java library for working with OpenAI models --> <dependency> <groupId>dev.langchain4j</groupId> <artifactId>langchain4j-open-ai</artifactId> <version>0.35.0</version> </dependency> </dependencies> ``` Run your package manager to install the dependencies to your project. 2. Set your environment variables. **Note:** This example sets the variables for the project in the IDE. Production applications might manage environment variables through a deployment configuration, CI/CD pipeline, or secrets manager, but you can adapt the provided code to fit your use case. In your IDE, create a new configuration template and add the following variables to your project: - If you are using IntelliJ IDEA, create a new Application run configuration template, then add your variables as semicolon-separated values in the Environment variables field (for example, `FOO=123;BAR=456`). Apply the changes and click OK. To learn more, see the [Create a run/debug configuration from a template](https://www.jetbrains.com/help/idea/run-debug-configuration.html#createExplicitly) section of the IntelliJ IDEA documentation.

   - If you are using Eclipse, create a new Java Application launch configuration, then add each variable as a new key-value pair in the Environment tab. Apply the changes and click OK.

     To learn more, see the [Creating a Java application launch configuration](https://help.eclipse.org/latest/topic/org.eclipse.jdt.doc.user/tasks/tasks-java-local-configuration.htm) section of the Eclipse IDE documentation.

   ```shell
   OPEN_AI_API_KEY=<api-key>
   MONGODB_URI=<connection-string>
   ```

   Update the placeholders with the following values:

   - Replace the `<api-key>` placeholder value with your OpenAI API key.

   - Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

     ### Atlas Cluster

     Your connection string should use the following format:

     ```text
     mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
     ```

     To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Define a method to generate vector embeddings.

   Create a file named `EmbeddingProvider.java` and paste the following code.

   This code defines two methods to generate embeddings for a given input using the [text-embedding-3-small](https://platform.openai.com/docs/guides/embeddings/#embedding-models) OpenAI embedding model:

   - **Multiple Inputs**: The `getEmbeddings()` method accepts an array of text inputs (`List<String>`), allowing you to create multiple embeddings in a single API call. The method converts the API-provided arrays of floats to BSON arrays of doubles for storing in your Atlas cluster.

   - **Single Input**: The `getEmbedding()` method accepts a single `String`, which represents a query you want to make against your vector data. The method converts the API-provided array of floats to a BSON array of doubles to use when querying your collection.

   ```java
   import dev.langchain4j.data.embedding.Embedding;
   import dev.langchain4j.data.segment.TextSegment;
   import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
   import dev.langchain4j.model.output.Response;
   import org.bson.BsonArray;
   import org.bson.BsonDouble;

   import java.util.List;

   import static java.time.Duration.ofSeconds;

   public class EmbeddingProvider {

       private static OpenAiEmbeddingModel embeddingModel;

       private static OpenAiEmbeddingModel getEmbeddingModel() {
           if (embeddingModel == null) {
               String apiKey = System.getenv("OPEN_AI_API_KEY");
               if (apiKey == null || apiKey.isEmpty()) {
                   throw new IllegalStateException("OPEN_AI_API_KEY env variable is not set or is empty.");
               }

               return OpenAiEmbeddingModel.builder()
                       .apiKey(apiKey)
                       .modelName("text-embedding-3-small")
                       .timeout(ofSeconds(60))
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

1) Initialize your .NET project.

   In a terminal window, run the following commands to initialize your project:

   ```text
   dotnet new console -o MyCompany.Embeddings
   cd MyCompany.Embeddings
   ```

2) Install and import dependencies.

   In a terminal window, run the following commands:

   ```text
   dotnet add package MongoDB.Driver
   dotnet add package OpenAI
   ```

3) Set your environment variables.

   Export your environment variables, `set` them in PowerShell, or use your IDE's environment variable manager to make the MongoDB connection string and OpenAI API key available to your project.

   ```text
   export OPENAI_API_KEY="<api-key>"
   export MONGODB_URI="<connection-string>"
   ```

   Replace the `<api-key>` placeholder value with your OpenAI API key.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4) Define a function to generate vector embeddings.

   Create a new class in a same-named file named `AIService.cs` and paste the following code. This code defines an async Task named `GetEmbeddingsAsync()` to generate a array of embeddings for an array of given string inputs. This function uses OpenAI's `text-embedding-3-small` model to generate an embedding for a given input.

   ```csharp
   namespace MyCompany.Embeddings;

   using OpenAI.Embeddings;
   using System;
   using System.Threading.Tasks;

   public class AIService
   {
       private static readonly string? OpenAIApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
       private static readonly string EmbeddingModelName = "text-embedding-3-small";
       public async Task<Dictionary<string, float[]>> GetEmbeddingsAsync(string[] texts)
       {
           EmbeddingClient embeddingClient = new(model: EmbeddingModelName, apiKey: OpenAIApiKey);
           Dictionary<string, float[]> documentData = new Dictionary<string, float[]>();
           try
           {
               var result = await embeddingClient.GenerateEmbeddingsAsync(texts);
               var embeddingCount = result.Value.Count;
               foreach (var index in Enumerable.Range(0, embeddingCount))
               {
                   // Pair each embedding with the text used to generate it.
                   documentData[texts[index]] = result.Value[index].ToFloats().ToArray();
               }
           }
           catch (Exception e)
           {
               throw new ApplicationException(e.Message);
           }
           return documentData;
       }
   }

   ```

1. Initialize your .NET project.

   In a terminal window, run the following commands to initialize your project:

   ```text
   dotnet new console -o MyCompany.Embeddings
   cd MyCompany.Embeddings
   ```

2. Install and import dependencies.

   In a terminal window, run the following commands:

   ```text
   dotnet add package MongoDB.Driver
   dotnet add package OpenAI
   ```

3. Set your environment variables.

   Export your environment variables, `set` them in PowerShell, or use your IDE's environment variable manager to make the MongoDB connection string and OpenAI API key available to your project.

   ```text
   export OPENAI_API_KEY="<api-key>"
   export MONGODB_URI="<connection-string>"
   ```

   Replace the `<api-key>` placeholder value with your OpenAI API key.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Define a function to generate vector embeddings.

   Create a new class in a same-named file named `AIService.cs` and paste the following code. This code defines an async Task named `GetEmbeddingsAsync()` to generate a array of embeddings for an array of given string inputs. This function uses OpenAI's `text-embedding-3-small` model to generate an embedding for a given input.

   ```csharp
   namespace MyCompany.Embeddings;

   using OpenAI.Embeddings;
   using System;
   using System.Threading.Tasks;

   public class AIService
   {
       private static readonly string? OpenAIApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
       private static readonly string EmbeddingModelName = "text-embedding-3-small";
       public async Task<Dictionary<string, float[]>> GetEmbeddingsAsync(string[] texts)
       {
           EmbeddingClient embeddingClient = new(model: EmbeddingModelName, apiKey: OpenAIApiKey);
           Dictionary<string, float[]> documentData = new Dictionary<string, float[]>();
           try
           {
               var result = await embeddingClient.GenerateEmbeddingsAsync(texts);
               var embeddingCount = result.Value.Count;
               foreach (var index in Enumerable.Range(0, embeddingCount))
               {
                   // Pair each embedding with the text used to generate it.
                   documentData[texts[index]] = result.Value[index].ToFloats().ToArray();
               }
           }
           catch (Exception e)
           {
               throw new ApplicationException(e.Message);
           }
           return documentData;
       }
   }

   ```

In this section, you use an embedding model to generate vector embeddings. This example also includes an optional function that you can use to compress your embeddings for efficient storage and improved query performance. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

1. Set up the environment.

   Create an interactive Python notebook by saving a file with the `.ipynb` extension, and then run the following command in the notebook to install the dependencies:

   ```python
   pip install --quiet --upgrade sentence-transformers pymongo einops
   ```

2. Define and test the function to generate vector embeddings.

   Paste and run the following code in your notebook to create a function that generates vector embeddings by using an open-source embedding model from [Nomic AI](https://www.nomic.ai). This code does the following:

   - Loads the [nomic-embed-text-v1](https://huggingface.co/nomic-ai/nomic-embed-text-v1) embedding model.

   - Creates a function named `get_embedding()` that uses the model to generate embeddings for a given text input. The default precision is `float32`.

   - Generates embeddings for the string, `foo`.

   ```python
   from sentence_transformers import SentenceTransformer

   # Load the embedding model
   model = SentenceTransformer("nomic-ai/nomic-embed-text-v1", trust_remote_code=True)

   # Define a function to generate embeddings
   def get_embedding(data, precision="float32"):
      return model.encode(data, precision=precision).tolist()

   # Generate an embedding
   embedding = get_embedding("foo")
   print(embedding)
   ```

   **Output:**

   ```shell
   [-0.02980827  0.03841474 -0.02561123 ... -0.0532876 -0.0335409 -0.02591543]
   ```

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section to define a function that converts your embeddings to BSON binary format.

   Optionally, you can compress your embeddings by converting them to BSON (Binary Javascript Object Notation) binary format, also called `binData` vectors, for efficient storage and retrieval. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

   This code does the following:

   - Defines a function named `generate_bson_vector` to convert embeddings to `binData` vectors by using binary tools from the [PyMongo driver.](https://www.mongodb.com/docs/drivers/pymongo/)

   - Converts the embeddings you generated for the string `foo` to `binData` vectors. The exact embedding varies depending on the model you use.

   **Note:**

   When you convert your embeddings to `binData` vectors, your embeddings appear in binary format.

   ```python
   from bson.binary import Binary 
   from bson.binary import BinaryVectorDtype

   # Define a function to generate BSON vectors
   def generate_bson_vector(vector, vector_dtype):
      return Binary.from_vector(vector, vector_dtype)

   # Generate BSON vector from the sample float32 embedding
   bson_float32_embedding = generate_bson_vector(embedding, BinaryVectorDtype.FLOAT32)

   # Print the converted embedding
   print(f"The converted BSON embedding is: {bson_float32_embedding}")
   ```

   **Output:**

   ```shell
   The converted BSON embedding is: [Binary(b'\'\x00x0\xf4\ ... x9bL\xd4\xbc', 9), Binary(b'\'\x007 ... \x9e?\xe6<', 9)]
   ```

In this section, you use an embedding model to generate vector embeddings. This example also includes an optional function that you can use to compress your embeddings for efficient storage and improved query performance. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

1. Set up the environment.

   Create an interactive Python notebook by saving a file with the `.ipynb` extension, and then run the following command in the notebook to install the dependencies:

   ```python
   pip install --quiet --upgrade sentence-transformers pymongo einops
   ```

2. Define and test the function to generate vector embeddings.

   Paste and run the following code in your notebook to create a function that generates vector embeddings by using an open-source embedding model from [Nomic AI](https://www.nomic.ai). This code does the following:

   - Loads the [nomic-embed-text-v1](https://huggingface.co/nomic-ai/nomic-embed-text-v1) embedding model.

   - Creates a function named `get_embedding()` that uses the model to generate embeddings for a given text input. The default precision is `float32`.

   - Generates embeddings for the string, `foo`.

   ```python
   from sentence_transformers import SentenceTransformer

   # Load the embedding model
   model = SentenceTransformer("nomic-ai/nomic-embed-text-v1", trust_remote_code=True)

   # Define a function to generate embeddings
   def get_embedding(data, precision="float32"):
      return model.encode(data, precision=precision).tolist()

   # Generate an embedding
   embedding = get_embedding("foo")
   print(embedding)
   ```

   **Output:**

   ```shell
   [-0.02980827  0.03841474 -0.02561123 ... -0.0532876 -0.0335409 -0.02591543]
   ```

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section to define a function that converts your embeddings to BSON binary format.

   Optionally, you can compress your embeddings by converting them to BSON (Binary Javascript Object Notation) binary format, also called `binData` vectors, for efficient storage and retrieval. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

   This code does the following:

   - Defines a function named `generate_bson_vector` to convert embeddings to `binData` vectors by using binary tools from the [PyMongo driver.](https://www.mongodb.com/docs/drivers/pymongo/)

   - Converts the embeddings you generated for the string `foo` to `binData` vectors. The exact embedding varies depending on the model you use.

   **Note:**

   When you convert your embeddings to `binData` vectors, your embeddings appear in binary format.

   ```python
   from bson.binary import Binary 
   from bson.binary import BinaryVectorDtype

   # Define a function to generate BSON vectors
   def generate_bson_vector(vector, vector_dtype):
      return Binary.from_vector(vector, vector_dtype)

   # Generate BSON vector from the sample float32 embedding
   bson_float32_embedding = generate_bson_vector(embedding, BinaryVectorDtype.FLOAT32)

   # Print the converted embedding
   print(f"The converted BSON embedding is: {bson_float32_embedding}")
   ```

   **Output:**

   ```shell
   The converted BSON embedding is: [Binary(b'\'\x00x0\xf4\ ... x9bL\xd4\xbc', 9), Binary(b'\'\x007 ... \x9e?\xe6<', 9)]
   ```

In this section, you use an embedding model to generate vector embeddings. This example also includes an optional function that you can use to compress your embeddings for efficient storage and improved query performance. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

1. Initialize your Node.js project.

   In a terminal window, run the following commands to create a new directory named `my-embeddings-project` and initialize your project:

   ```text
   mkdir my-embeddings-project
   cd my-embeddings-project
   npm init -y
   ```

2. Update your `package.json` file.

   Configure your project to use [ES modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules) by adding `"type": "module"` to your `package.json` file and then saving it.

   ```javascript
   {
     "type": "module",
     // other fields...
   }
   ```

3. Install and import dependencies.

   In a terminal window, run the following command:

   ```text
   npm install mongodb @xenova/transformers
   ```

4. Create a `.env` file.

   In your project, create a `.env` file to store your MongoDB connection string.

   ```text
   MONGODB_URI="<connection-string>"
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

   Save the file.

5. Define a function to generate vector embeddings.

   Create a file named `get-embeddings.js`.

   ```shell
   touch get-embeddings.js
   ```

   Paste the following code in the file.

   This code defines a function named `getEmbedding()` to generate an embedding for a given input. This function specifies:

   - The `feature-extraction` task from Hugging Face's [transformers.js](https://huggingface.co/docs/transformers.js/en/index) library. To learn more, see [Tasks.](https://huggingface.co/docs/transformers.js/en/index#tasks)

   - The [nomic-embed-text-v1](https://huggingface.co/xenova/nomic-embed-text-v1) embedding model.

   ```js
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

   Save the file.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section to define a function that converts your embeddings to BSON binary format.

   Optionally, you can compress your embeddings by converting them to BSON (Binary Javascript Object Notation) binary format, also called `binData` vectors, for efficient storage and retrieval. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

   Create a file named `convert-embeddings.js`.

   ```shell
   touch convert-embeddings.js
   ```

   Paste the following code in the file.

   This code defines a function named `convertEmbeddingsToBSON` to convert `float32` embeddings to `binData` vectors by using binary tools from the [Node.js driver.](https://www.mongodb.com/docs/drivers/node/)

   **Note:**

   When you convert your embeddings to `binData` vectors, your embeddings appear in binary format.

   ```js
   import fs from "fs/promises"; 
   import { BSON } from "mongodb"; 
   const { Binary } = BSON; 
     
   async function main() {  
     try {  
       // Read the contents of the original 'embeddings.json' file  
       const fileContent = await fs.readFile("embeddings.json", "utf8");  
       const embeddingsData = JSON.parse(fileContent); // Parse JSON into a JavaScript object  
     
       // Validate the structure of the original input data  
       if (!Array.isArray(embeddingsData)) {  
         throw new Error("'embeddings.json' must contain an array of objects.");  
       }  
     
       // Convert embeddings to BSON-compatible format  
       const convertEmbeddingsData = embeddingsData.map(({ text, embeddings }) => {  
         // Field validation to ensure all required embeddings are present  
         if (  
           !embeddings ||  
           !Array.isArray(embeddings.float) ||  
           !Array.isArray(embeddings.int8) ||  
           !Array.isArray(embeddings.ubinary)  
         ) {  
           throw new Error(`Embeddings are missing or invalid for text: "${text}"`);  
         }  
     
         // Convert embeddings to BSON-compatible binary format  
         const bsonFloat32 = Binary.fromFloat32Array(new Float32Array(embeddings.float));  
         const bsonInt8 = Binary.fromInt8Array(new Int8Array(embeddings.int8));  
         const bsonPackedBits = Binary.fromPackedBits(new Uint8Array(embeddings.ubinary));  
     
         // Return the updated object structure  
         return {  
           text,  
           embeddings: {  // Original embeddings
             float: embeddings.float, 
             int8: embeddings.int8,  
             ubinary: embeddings.ubinary,  
           },  
           bsonEmbeddings: {  // BSON embeddings
             float32: bsonFloat32, 
             int8: bsonInt8,
             packedBits: bsonPackedBits, 
           },  
         };  
       });  
     
       // Serialize the updated data to BSON-compatible JSON using EJSON  
       const ejsonSerializedData = BSON.EJSON.stringify(convertEmbeddingsData, null, 2, { relaxed: false });  
     
       // Write the updated BSON-converted data back to the same 'embeddings.json' file  
       await fs.writeFile("embeddings.json", ejsonSerializedData);  
     
       console.log("Embeddings with BSON vectors have been saved to embeddings.json");  
     } catch (error) {  
       // Print detailed error information  
       console.error("Error processing embeddings:", error);  
     }  
   }  
     
   // Execute the conversion process  
   main();  

   ```

   Save the file.

In this section, you use an embedding model to generate vector embeddings. This example also includes an optional function that you can use to compress your embeddings for efficient storage and improved query performance. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

1. Initialize your Node.js project.

   In a terminal window, run the following commands to create a new directory named `my-embeddings-project` and initialize your project:

   ```text
   mkdir my-embeddings-project
   cd my-embeddings-project
   npm init -y
   ```

2. Update your `package.json` file.

   Configure your project to use [ES modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules) by adding `"type": "module"` to your `package.json` file and then saving it.

   ```javascript
   {
     "type": "module",
     // other fields...
   }
   ```

3. Install and import dependencies.

   In a terminal window, run the following command:

   ```text
   npm install mongodb @xenova/transformers
   ```

4. Create a `.env` file.

   In your project, create a `.env` file to store your MongoDB connection string.

   ```text
   MONGODB_URI="<connection-string>"
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

   Save the file.

5. Define a function to generate vector embeddings.

   Create a file named `get-embeddings.js`.

   ```shell
   touch get-embeddings.js
   ```

   Paste the following code in the file.

   This code defines a function named `getEmbedding()` to generate an embedding for a given input. This function specifies:

   - The `feature-extraction` task from Hugging Face's [transformers.js](https://huggingface.co/docs/transformers.js/en/index) library. To learn more, see [Tasks.](https://huggingface.co/docs/transformers.js/en/index#tasks)

   - The [nomic-embed-text-v1](https://huggingface.co/xenova/nomic-embed-text-v1) embedding model.

   ```js
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

   Save the file.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section to define a function that converts your embeddings to BSON binary format.

   Optionally, you can compress your embeddings by converting them to BSON (Binary Javascript Object Notation) binary format, also called `binData` vectors, for efficient storage and retrieval. To learn more, see [Vector Compression.](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-avs-vector-compression)

   Create a file named `convert-embeddings.js`.

   ```shell
   touch convert-embeddings.js
   ```

   Paste the following code in the file.

   This code defines a function named `convertEmbeddingsToBSON` to convert `float32` embeddings to `binData` vectors by using binary tools from the [Node.js driver.](https://www.mongodb.com/docs/drivers/node/)

   **Note:**

   When you convert your embeddings to `binData` vectors, your embeddings appear in binary format.

   ```js
   import fs from "fs/promises"; 
   import { BSON } from "mongodb"; 
   const { Binary } = BSON; 
     
   async function main() {  
     try {  
       // Read the contents of the original 'embeddings.json' file  
       const fileContent = await fs.readFile("embeddings.json", "utf8");  
       const embeddingsData = JSON.parse(fileContent); // Parse JSON into a JavaScript object  
     
       // Validate the structure of the original input data  
       if (!Array.isArray(embeddingsData)) {  
         throw new Error("'embeddings.json' must contain an array of objects.");  
       }  
     
       // Convert embeddings to BSON-compatible format  
       const convertEmbeddingsData = embeddingsData.map(({ text, embeddings }) => {  
         // Field validation to ensure all required embeddings are present  
         if (  
           !embeddings ||  
           !Array.isArray(embeddings.float) ||  
           !Array.isArray(embeddings.int8) ||  
           !Array.isArray(embeddings.ubinary)  
         ) {  
           throw new Error(`Embeddings are missing or invalid for text: "${text}"`);  
         }  
     
         // Convert embeddings to BSON-compatible binary format  
         const bsonFloat32 = Binary.fromFloat32Array(new Float32Array(embeddings.float));  
         const bsonInt8 = Binary.fromInt8Array(new Int8Array(embeddings.int8));  
         const bsonPackedBits = Binary.fromPackedBits(new Uint8Array(embeddings.ubinary));  
     
         // Return the updated object structure  
         return {  
           text,  
           embeddings: {  // Original embeddings
             float: embeddings.float, 
             int8: embeddings.int8,  
             ubinary: embeddings.ubinary,  
           },  
           bsonEmbeddings: {  // BSON embeddings
             float32: bsonFloat32, 
             int8: bsonInt8,
             packedBits: bsonPackedBits, 
           },  
         };  
       });  
     
       // Serialize the updated data to BSON-compatible JSON using EJSON  
       const ejsonSerializedData = BSON.EJSON.stringify(convertEmbeddingsData, null, 2, { relaxed: false });  
     
       // Write the updated BSON-converted data back to the same 'embeddings.json' file  
       await fs.writeFile("embeddings.json", ejsonSerializedData);  
     
       console.log("Embeddings with BSON vectors have been saved to embeddings.json");  
     } catch (error) {  
       // Print detailed error information  
       console.error("Error processing embeddings:", error);  
     }  
   }  
     
   // Execute the conversion process  
   main();  

   ```

   Save the file.

In this section, you use an embedding model to generate vector embeddings.

1. Initialize your Go project.

   In a terminal window, run the following commands to create a new directory named `my-embeddings-project` and initialize your project:

   ```text
   mkdir my-embeddings-project
   cd my-embeddings-project
   go mod init my-embeddings-project
   ```

2. Install and import dependencies.

   In a terminal window, run the following commands:

   ```text
   go get github.com/joho/godotenv
   go get go.mongodb.org/mongo-driver/v2/mongo
   go get github.com/tmc/langchaingo/llms
   ```

3. Create a `.env` file to manage secrets.

   In your project, create a `.env` file to store your Atlas connection string and Hugging Face access token.

   ```text
   HUGGINGFACEHUB_API_TOKEN = "<access-token>"
   MONGODB_URI = "<connection-string>"
   ```

   Replace the `<access-token>` placeholder value with your Hugging Face access token.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Define a function to generate vector embeddings.

   Create a directory in your project called `common` to store common code that you'll use in later steps:

   ```text
   mkdir common && cd common
   ```

   Create a file named `get-embeddings.go` and paste the following code. This code defines a function named `GetEmbeddings()` to generate an embedding for a given input. This function specifies:

   - The `feature-extraction` task using the [Go port of the LangChain](https://tmc.github.io/langchaingo/docs/) library. To learn more, see the [Tasks](https://huggingface.co/docs/transformers.js/en/index#tasks) documentation in the LangChain JavaScript documentation.

   - The [mxbai-embed-large-v1](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1) embedding model.

   ```go
   package common

   import (
   	"context"
   	"log"

   	"github.com/tmc/langchaingo/llms/ollama"
   )

   func GetEmbeddings(documents []string) [][]float32 {
   	llm, err := ollama.New(ollama.WithModel("nomic-embed-text"))
   	if err != nil {
   		log.Fatalf("failed to connect to ollama: %v", err)
   	}

   	ctx := context.Background()
   	embs, err := llm.CreateEmbedding(ctx, documents)
   	if err != nil {
   		log.Fatalf("failed to create ollama embedding: %v", err)
   	}

   	return embs
   }

   ```

   **Note: 503 when calling Hugging Face models**

   You may occasionally get 503 errors when calling Hugging Face model hub models. To resolve this issue, retry after a short delay.

   Move back into the main project root directory.

   ```console
   cd ../
   ```

In this section, you use an embedding model to generate vector embeddings.

1. Initialize your Go project.

   In a terminal window, run the following commands to create a new directory named `my-embeddings-project` and initialize your project:

   ```text
   mkdir my-embeddings-project
   cd my-embeddings-project
   go mod init my-embeddings-project
   ```

2. Install and import dependencies.

   In a terminal window, run the following commands:

   ```text
   go get github.com/joho/godotenv
   go get go.mongodb.org/mongo-driver/v2/mongo
   go get github.com/tmc/langchaingo/llms
   ```

3. Create a `.env` file to manage secrets.

   In your project, create a `.env` file to store your Atlas connection string and Hugging Face access token.

   ```text
   HUGGINGFACEHUB_API_TOKEN = "<access-token>"
   MONGODB_URI = "<connection-string>"
   ```

   Replace the `<access-token>` placeholder value with your Hugging Face access token.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Define a function to generate vector embeddings.

   Create a directory in your project called `common` to store common code that you'll use in later steps:

   ```text
   mkdir common && cd common
   ```

   Create a file named `get-embeddings.go` and paste the following code. This code defines a function named `GetEmbeddings()` to generate an embedding for a given input. This function specifies:

   - The `feature-extraction` task using the [Go port of the LangChain](https://tmc.github.io/langchaingo/docs/) library. To learn more, see the [Tasks](https://huggingface.co/docs/transformers.js/en/index#tasks) documentation in the LangChain JavaScript documentation.

   - The [mxbai-embed-large-v1](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1) embedding model.

   ```go
   package common

   import (
   	"context"
   	"log"

   	"github.com/tmc/langchaingo/llms/ollama"
   )

   func GetEmbeddings(documents []string) [][]float32 {
   	llm, err := ollama.New(ollama.WithModel("nomic-embed-text"))
   	if err != nil {
   		log.Fatalf("failed to connect to ollama: %v", err)
   	}

   	ctx := context.Background()
   	embs, err := llm.CreateEmbedding(ctx, documents)
   	if err != nil {
   		log.Fatalf("failed to create ollama embedding: %v", err)
   	}

   	return embs
   }

   ```

   **Note: 503 when calling Hugging Face models**

   You may occasionally get 503 errors when calling Hugging Face model hub models. To resolve this issue, retry after a short delay.

   Move back into the main project root directory.

   ```console
   cd ../
   ```

In this section, you use an embedding model to generate vector embeddings.

1. Create your Java project and install dependencies.

   From your IDE, create a Java project using Maven or Gradle.

   Add the following dependencies, depending on your package manager:

   ### Maven

   If you are using Maven, add the following dependencies to the `dependencies` array in your project's `pom.xml` file:

   ```xml
   <dependencies>
      <!-- MongoDB Java Sync Driver v5.2.0 or later -->
      <dependency>
         <groupId>org.mongodb</groupId>
         <artifactId>mongodb-driver-sync</artifactId>
         <version>[5.2.0,)</version> </dependency> <!-- Java library for working with Hugging Face models --> <dependency> <groupId>dev.langchain4j</groupId> <artifactId>langchain4j-hugging-face</artifactId> <version>1.1.0-beta7</version> </dependency> </dependencies> ``` Run your package manager to install the dependencies to your project. 2. Set your environment variables. **Note:** This example sets the variables for the project in the IDE. Production applications might manage environment variables through a deployment configuration, CI/CD pipeline, or secrets manager, but you can adapt the provided code to fit your use case. In your IDE, create a new configuration template and add the following variables to your project: - If you are using IntelliJ IDEA, create a new Application run configuration template, then add your variables as semicolon-separated values in the Environment variables field (for example, `FOO=123;BAR=456`). Apply the changes and click OK. To learn more, see the [Create a run/debug configuration from a template](https://www.jetbrains.com/help/idea/run-debug-configuration.html#createExplicitly) section of the IntelliJ IDEA documentation.

   - If you are using Eclipse, create a new Java Application launch configuration, then add each variable as a new key-value pair in the Environment tab. Apply the changes and click OK.

     To learn more, see the [Creating a Java application launch configuration](https://help.eclipse.org/latest/topic/org.eclipse.jdt.doc.user/tasks/tasks-java-local-configuration.htm) section of the Eclipse IDE documentation.

   ```shell
   HUGGING_FACE_ACCESS_TOKEN=<access-token>
   MONGODB_URI=<connection-string>
   ```

   Update the placeholders with the following values:

   - Replace the `<access-token>` placeholder value with your Hugging Face access token.

   - Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

     ### Atlas Cluster

     Your connection string should use the following format:

     ```text
     mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
     ```

     To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Define a method to generate vector embeddings.

   Create a file named `EmbeddingProvider.java` and paste the following code.

   This code defines two methods to generate embeddings for a given input using the [mxbai-embed-large-v1](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1) open-source embedding model:

   - **Multiple Inputs**: The `getEmbeddings()` method accepts an array of text inputs (`List<String>`), allowing you to create multiple embeddings in a single API call. The method converts the API-provided arrays of floats to BSON arrays of doubles for storing in your Atlas cluster.

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

In this section, you use an embedding model to generate vector embeddings.

1. Create your Java project and install dependencies.

   From your IDE, create a Java project using Maven or Gradle.

   Add the following dependencies, depending on your package manager:

   ### Maven

   If you are using Maven, add the following dependencies to the `dependencies` array in your project's `pom.xml` file:

   ```xml
   <dependencies>
      <!-- MongoDB Java Sync Driver v5.2.0 or later -->
      <dependency>
         <groupId>org.mongodb</groupId>
         <artifactId>mongodb-driver-sync</artifactId>
         <version>[5.2.0,)</version> </dependency> <!-- Java library for working with Hugging Face models --> <dependency> <groupId>dev.langchain4j</groupId> <artifactId>langchain4j-hugging-face</artifactId> <version>1.1.0-beta7</version> </dependency> </dependencies> ``` Run your package manager to install the dependencies to your project. 2. Set your environment variables. **Note:** This example sets the variables for the project in the IDE. Production applications might manage environment variables through a deployment configuration, CI/CD pipeline, or secrets manager, but you can adapt the provided code to fit your use case. In your IDE, create a new configuration template and add the following variables to your project: - If you are using IntelliJ IDEA, create a new Application run configuration template, then add your variables as semicolon-separated values in the Environment variables field (for example, `FOO=123;BAR=456`). Apply the changes and click OK. To learn more, see the [Create a run/debug configuration from a template](https://www.jetbrains.com/help/idea/run-debug-configuration.html#createExplicitly) section of the IntelliJ IDEA documentation.

   - If you are using Eclipse, create a new Java Application launch configuration, then add each variable as a new key-value pair in the Environment tab. Apply the changes and click OK.

     To learn more, see the [Creating a Java application launch configuration](https://help.eclipse.org/latest/topic/org.eclipse.jdt.doc.user/tasks/tasks-java-local-configuration.htm) section of the Eclipse IDE documentation.

   ```shell
   HUGGING_FACE_ACCESS_TOKEN=<access-token>
   MONGODB_URI=<connection-string>
   ```

   Update the placeholders with the following values:

   - Replace the `<access-token>` placeholder value with your Hugging Face access token.

   - Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

     ### Atlas Cluster

     Your connection string should use the following format:

     ```text
     mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
     ```

     To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

3. Define a method to generate vector embeddings.

   Create a file named `EmbeddingProvider.java` and paste the following code.

   This code defines two methods to generate embeddings for a given input using the [mxbai-embed-large-v1](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1) open-source embedding model:

   - **Multiple Inputs**: The `getEmbeddings()` method accepts an array of text inputs (`List<String>`), allowing you to create multiple embeddings in a single API call. The method converts the API-provided arrays of floats to BSON arrays of doubles for storing in your Atlas cluster.

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

1) Initialize your .NET project.

   In a terminal window, run the following commands to initialize your project:

   ```text
   dotnet new console -o MyCompany.Embeddings
   cd MyCompany.Embeddings
   ```

2) Install and import dependencies.

   In a terminal window, run the following command:

   ```text
   dotnet add package MongoDB.Driver
   ```

3) Set your environment variables.

   Export your environment variables, `set` them in PowerShell, or use your IDE's environment variable manager to make the MongoDB connection and HuggingFace access token available to your project.

   ```text
   export HUGGINGFACE_ACCESS_TOKEN="<access-token>"
   export MONGODB_URI="<connection-string>"
   ```

   Replace the `<access-token>` placeholder value with your Hugging Face access token.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4) Define a function to generate vector embeddings.

   Create a new class in a same-named file named `AIService.cs` and paste the following code. This code defines an async Task named `GetEmbeddingsAsync()` to generate a array of embeddings for an array of given string inputs. This function uses the [mxbai-embed-large-v1](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1) embedding model.

   ```csharp
   namespace MyCompany.Embeddings;
   using System;
   using System.Net.Http;
   using System.Text.Json;
   using System.Threading.Tasks;
   using System.Net.Http.Headers;

   public class AIService
   {
       private static readonly string? HuggingFaceAccessToken = Environment.GetEnvironmentVariable("HUGGINGFACE_ACCESS_TOKEN");
       private static readonly HttpClient Client = new HttpClient();
       public async Task<Dictionary<string, float[]>> GetEmbeddingsAsync(string[] texts)
       {
           const string modelName = "mixedbread-ai/mxbai-embed-large-v1";
           const string url = $"https://api-inference.huggingface.co/models/{modelName}";
           Client.DefaultRequestHeaders.Authorization 
               = new AuthenticationHeaderValue("Bearer", HuggingFaceAccessToken);
           var data = new { inputs = texts };
           var dataJson = JsonSerializer.Serialize(data);
           var content = new StringContent(dataJson,null, "application/json");
           var response = await Client.PostAsync(url, content);
           response.EnsureSuccessStatusCode();
           var responseString = await response.Content.ReadAsStringAsync();
           var embeddings = JsonSerializer.Deserialize<float[][]>(responseString);
           if (embeddings is null)
           {
               throw new ApplicationException("Failed to deserialize embeddings response to an array of floats.");
           }
           Dictionary<string, float[]> documentData = new Dictionary<string, float[]>();
           var embeddingCount = embeddings.Length;
           foreach (var value in Enumerable.Range(0, embeddingCount))
           {
               // Pair each embedding with the text used to generate it.
               documentData[texts[value]] = embeddings[value];
           }
           return documentData;
       }
   }
   ```

   **Note: 503 when calling Hugging Face models**

   You may occasionally get 503 errors when calling Hugging Face model hub models. To resolve this issue, retry after a short delay.

1. Initialize your .NET project.

   In a terminal window, run the following commands to initialize your project:

   ```text
   dotnet new console -o MyCompany.Embeddings
   cd MyCompany.Embeddings
   ```

2. Install and import dependencies.

   In a terminal window, run the following command:

   ```text
   dotnet add package MongoDB.Driver
   ```

3. Set your environment variables.

   Export your environment variables, `set` them in PowerShell, or use your IDE's environment variable manager to make the MongoDB connection and HuggingFace access token available to your project.

   ```text
   export HUGGINGFACE_ACCESS_TOKEN="<access-token>"
   export MONGODB_URI="<connection-string>"
   ```

   Replace the `<access-token>` placeholder value with your Hugging Face access token.

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

4. Define a function to generate vector embeddings.

   Create a new class in a same-named file named `AIService.cs` and paste the following code. This code defines an async Task named `GetEmbeddingsAsync()` to generate a array of embeddings for an array of given string inputs. This function uses the [mxbai-embed-large-v1](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1) embedding model.

   ```csharp
   namespace MyCompany.Embeddings;
   using System;
   using System.Net.Http;
   using System.Text.Json;
   using System.Threading.Tasks;
   using System.Net.Http.Headers;

   public class AIService
   {
       private static readonly string? HuggingFaceAccessToken = Environment.GetEnvironmentVariable("HUGGINGFACE_ACCESS_TOKEN");
       private static readonly HttpClient Client = new HttpClient();
       public async Task<Dictionary<string, float[]>> GetEmbeddingsAsync(string[] texts)
       {
           const string modelName = "mixedbread-ai/mxbai-embed-large-v1";
           const string url = $"https://api-inference.huggingface.co/models/{modelName}";
           Client.DefaultRequestHeaders.Authorization 
               = new AuthenticationHeaderValue("Bearer", HuggingFaceAccessToken);
           var data = new { inputs = texts };
           var dataJson = JsonSerializer.Serialize(data);
           var content = new StringContent(dataJson,null, "application/json");
           var response = await Client.PostAsync(url, content);
           response.EnsureSuccessStatusCode();
           var responseString = await response.Content.ReadAsStringAsync();
           var embeddings = JsonSerializer.Deserialize<float[][]>(responseString);
           if (embeddings is null)
           {
               throw new ApplicationException("Failed to deserialize embeddings response to an array of floats.");
           }
           Dictionary<string, float[]> documentData = new Dictionary<string, float[]>();
           var embeddingCount = embeddings.Length;
           foreach (var value in Enumerable.Range(0, embeddingCount))
           {
               // Pair each embedding with the text used to generate it.
               documentData[texts[value]] = embeddings[value];
           }
           return documentData;
       }
   }
   ```

   **Note: 503 when calling Hugging Face models**

   You may occasionally get 503 errors when calling Hugging Face model hub models. To resolve this issue, retry after a short delay.

### Create Embeddings from Data

In this section, you create vector embeddings from your data using the function that you defined, and then you store these embeddings in a MongoDB collection.

1. Load your data.

   The following code defines an array of sample texts.

   ```python
   # Sample data
   texts = [
     "Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
     "The Lion King: Lion cub and future king Simba searches for his identity",
     "Avatar: A marine is dispatched to the moon Pandora on a unique mission"
   ]
   ```

2. Generate embeddings from your data.

   Use the `get_embedding()` function to generate embeddings from the sample texts. Your embeddings might vary depending on the model you use.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section if you defined the function to convert your embeddings to BSON binary format.

   If you defined the `generate_bson_vector` function, uncomment the line that calls this function to compress your embeddings to `binData` vectors. Your embeddings will appear in binary format.

   ```python
   # Generate embeddings from the sample data
   embeddings = []
   for text in texts:
    embedding = get_embedding(text)

    # Uncomment the following line to convert to BSON
    # embedding = generate_bson_vector(embedding, BinaryVectorDtype.FLOAT32)

    embeddings.append(embedding)

    # Print the embeddings
    print(f"\nText: {text}")
    print(f"Embedding: {embedding[:3]}... (truncated)")
   ```

   **Output:**

   ```shell
   Text: Titanic: The story of the 1912 sinking of the largest luxury liner ever built
   Embedding: [-0.01089042  0.05926645 -0.00291325]... (truncated)

   Text: The Lion King: Lion cub and future king Simba searches for his identity
   Embedding: [-0.05607051 -0.01360618  0.00523855]... (truncated)

   Text: Avatar: A marine is dispatched to the moon Pandora on a unique mission
   Embedding: [-0.0275258   0.01144342 -0.02360895]... (truncated)
   ```

3. Ingest the embeddings into MongoDB.

   Perform the following steps to create documents with the embeddings and ingest them into your MongoDB deployment:

   Define a function to create documents.

   ```python
   def create_docs_with_embeddings(embeddings, data):
      docs = []
      for i, (embedding, text) in enumerate(zip(embeddings, data)):
         doc = {
               "_id": i,
               "text": text,
               "embedding": embedding,
         }
         docs.append(doc)
      return docs
   ```

   Create the documents with your embeddings.

   ```python
   # Create documents with embeddings and sample data
   docs = create_docs_with_embeddings(embeddings, texts)
   ```

   Insert the documents into a MongoDB collection.

   Paste and run the following code in your notebook to connect to your MongoDB deployment and ingest the embeddings into the specified database and collection.

   ```python
   import pymongo

   # Connect to your MongoDB deployment
   mongo_client = pymongo.MongoClient("<connection-string>")
   db = mongo_client["sample_db"]
   collection = db["embeddings"]

   # Ingest data into the collection
   collection.insert_many(docs)
   ```

   **Output:**

   ```text
   InsertManyResult([0, 1, 2], acknowledged=True)
   ```

   **Note:**

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Load your existing data.

   Load data from your MongoDB deployment. The following code gets a subset of `50` documents from the `sample_airbnb.listingAndReviews` collection.

   ```python
   import pymongo

   # Connect to your MongoDB deployment
   mongo_client = pymongo.MongoClient("<connection-string>")
   db = mongo_client["sample_airbnb"]
   collection = db["listingsAndReviews"]

   # Define a filter to exclude documents with null or empty 'summary' fields
   filter = { 'summary': { '$exists': True, "$nin": [ None, "" ] } }

   # Get a subset of documents in the collection
   documents = collection.find(filter, {'_id': 1, 'summary': 1}).limit(50)
   ```

   **Note:**

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

2. Generate the embeddings and update your documents.

   Generate embeddings from the documents you loaded in the previous step. This code does the following:

   - Generates embeddings from each document's `summary` field by using the `get_embedding()` function that you defined.

   - Updates each document with a new `embedding` field that contains the embedding value.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section if you defined the function to convert your embeddings to BSON binary format.

   If you defined the `generate_bson_vector` function to convert your vector embeddings to BSON (Binary Javascript Object Notation) `binData` vectors, uncomment the line that calls this function before running the code.

   **Note:**

   This operation might take a few minutes to complete.

   ```python
   from pymongo import UpdateOne

   # Generate the list of bulk write operations
   operations = []
   for doc in documents:
      summary = doc["summary"]
      # Generate embeddings for this document
      embedding = get_embedding(summary)

      # Uncomment the following line to convert to BSON vectors
      # embedding = generate_bson_vector(embedding, BinaryVectorDtype.FLOAT32)

      # Add the update operation to the list
      operations.append(UpdateOne(
         {"_id": doc["_id"]},
         {"$set": {
            "embedding": embedding
         }}
      ))

   # Execute the bulk write operation
   if operations:
      result = collection.bulk_write(operations)
      updated_doc_count = result.modified_count

   print(f"Updated {updated_doc_count} documents.")
   ```

   **Output:**

   ```shell
   Updated 50 documents.
   ```

1) Create a file named `create-embeddings.js` and paste the following code.

   Use the following code to generate embeddings from an existing collection. This code uses the `getEmbedding()` function that you defined and the [Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/) to generate embeddings from an array of sample texts and ingest them into the `sample_db.embeddings` collection.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section if you defined the function to convert your embeddings to BSON binary format.

   If you defined the `convertEmbeddingsToBSON` function, uncomment lines `3` and `32`-`33`  to convert your embeddings to BSON (Binary Javascript Object Notation) `binData` vectors.

   ```javascript
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';
   // import { convertEmbeddingsToBSON } from './convert-embeddings.js';

   // Data to embed
   const texts = [ 
       "Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
       "The Lion King: Lion cub and future king Simba searches for his identity",
       "Avatar: A marine is dispatched to the moon Pandora on a unique mission"
   ]

   async function run() {

       // Connect to your MongoDB deployment
       const client = new MongoClient(process.env.MONGODB_URI);
       
       try {
           await client.connect();
           const db = client.db("sample_db");
           const collection = db.collection("embeddings");

           console.log("Generating embeddings and inserting documents...");
           const insertDocuments = [];
           await Promise.all(texts.map(async text => {
               // Check if the document already exists
               const existingDoc = await collection.findOne({ text: text });

               // Generate an embedding using the function that you defined
               var embedding = await getEmbedding(text);
               
               // Uncomment the following lines to convert the generated embedding into BSON format
               // const bsonEmbedding = await convertEmbeddingsToBSON([embedding]); // Since convertEmbeddingsToBSON is designed to handle arrays
               // embedding = bsonEmbedding; // Use BSON embedding instead of the original float32 embedding
                         
               // Add the document with the embedding to array of documents for bulk insert
               if (!existingDoc) {
                   insertDocuments.push({
                       text: text,
                       embedding: embedding
                   })
               }
           }));

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

2) Save and run the file.

   ### Open-Source

   ```text
   node --env-file=.env create-embeddings.js
   ```

   **Output:**

   ```sh
   Generating embeddings and inserting documents...
   Count of documents inserted: 3
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Create a file named `create-embeddings.js` and paste the following code.

   Use the following code to generate embeddings from an existing collection. Specifically, this code does the following:

   - Connects to your MongoDB deployment.

   - Gets a subset of documents from the `sample_airbnb.listingsAndReviews` collection that have a non-empty `summary` field.

   - Generates embeddings from each document's `summary` field by using the `getEmbedding()` function that you defined.

   - Updates each document with a new `embedding` field that contains the embedding value by using the MongoDB [Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section if you defined the function to convert your embeddings to BSON binary format.

   If you defined the `convertEmbeddingsToBSON` function, uncomment lines `3` and `29`-`30`  to convert your embeddings to BSON (Binary Javascript Object Notation) `binData` vectors.

   ```javascript
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';
   // import { convertEmbeddingsToBSON } from './convert-embeddings.js';

   async function run() {

       // Connect to your MongoDB deployment
       const client = new MongoClient(process.env.MONGODB_URI);

       try {
           await client.connect();
           const db = client.db("sample_airbnb");
           const collection = db.collection("listingsAndReviews");

           // Filter to exclude null or empty summary fields
           const filter = { "summary": { "$nin": [ null, "" ] } };

           // Get a subset of documents from the collection
           const documents = await collection.find(filter).limit(50).toArray();

           console.log("Generating embeddings and updating documents...");
           const updateDocuments = [];
           await Promise.all(documents.map(async doc => {

               // Generate an embedding using the function that you defined
               var embedding = await getEmbedding(doc.summary);

               // Uncomment the following lines to convert the generated embedding into BSON format
               // const bsonEmbedding = await convertEmbeddingsToBSON([embedding]); // Since convertEmbeddingsToBSON is designed to handle arrays
               // embedding = bsonEmbedding; // Use BSON embedding instead of the original float32 embedding
                
               // Add the embedding to an array of update operations
               updateDocuments.push(
                   {
                       updateOne: { 
                           filter: { "_id": doc._id },
                           update: { $set: { "embedding": embedding } }
                       }
                   }
              )
          }));

          // Continue processing documents if an error occurs during an operation
          const options = { ordered: false };

          // Update documents with the new embedding field
          const result = await collection.bulkWrite(updateDocuments, options); 
          console.log("Count of documents updated: " + result.modifiedCount); 
               
       } catch (err) {
           console.log(err.stack);
       }
       finally {
           await client.close();
       }
   }
   run().catch(console.dir);

   ```

2. Save and run the file.

   ```text
   node --env-file=.env create-embeddings.js
   ```

   **Output:**

   ```sh
   Generating embeddings and updating documents...
   Count of documents updated: 50
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_airbnb.listingsAndReviews` namespace [in the Atlas UI](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections) and expanding the fields in a document.

1) Create a file named `create-embeddings.go` and paste the following code.

   Use the following code to generate embeddings from an existing collection.

   Specifically, this code uses the `GetEmbeddings()` function that you defined and the MongoDB [Go Driver](https://www.mongodb.com/docs/drivers/go/) to generate embeddings from an array of sample texts and ingest them into the `sample_db.embeddings` collection.

   ### Open-Source

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"my-embeddings-project/common"
   	"os"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   var data = []string{
   	"Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
   	"The Lion King: Lion cub and future king Simba searches for his identity",
   	"Avatar: A marine is dispatched to the moon Pandora on a unique mission",
   }

   type TextWithEmbedding struct {
   	Text      string
   	Embedding []float32
   }

   func main() {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
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

   	// Set the namespace
   	coll := client.Database("sample_db").Collection("embeddings")

   	embeddings := common.GetEmbeddings(data)
   	docsToInsert := make([]interface{}, len(embeddings))
   	for i, string := range data {
   		docsToInsert[i] = TextWithEmbedding{
   			Text:      string,
   			Embedding: embeddings[i],
   		}
   	}

   	result, err := coll.InsertMany(ctx, docsToInsert)

   	if err != nil {
   		log.Fatalf("failed to insert documents: %v", err)
   	}
   	fmt.Printf("Successfully inserted %v documents into MongoDB\n", len(result.InsertedIDs))
   }

   ```

2) Save and run the file.

   ### Open-Source

   ```text
   go run create-embeddings.go
   ```

   **Output:**

   ```sh
   Successfully inserted 3 documents
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Create a file named `create-embeddings.go` and paste the following code.

   Use the following code to generate embeddings from an existing collection. Specifically, this code does the following:

   - Connects to your MongoDB deployment.

   - Gets a subset of documents from the `sample_airbnb.listingsAndReviews` collection that have a non-empty `summary` field.

   - Generates embeddings from each document's `summary` field by using the `GetEmbeddings()` function that you defined.

   - Updates each document with a new `embeddings` field that contains the embedding value by using the MongoDB [Go Driver.](https://www.mongodb.com/docs/drivers/go/)

   ```go
   package main

   import (
   	"context"
   	"log"
   	"my-embeddings-project/common"
   	"os"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
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

   	// Set the namespace
   	coll := client.Database("sample_airbnb").Collection("listingsAndReviews")

   	filter := bson.D{
   		{"$and",
   			bson.A{
   				bson.D{
   					{"$and",
   						bson.A{
   							bson.D{{"summary", bson.D{{"$exists", true}}}},
   							bson.D{{"summary", bson.D{{"$ne", ""}}}},
   						},
   					}},
   				bson.D{{"embeddings", bson.D{{"$exists", false}}}},
   			}},
   	}

   	opts := options.Find().SetLimit(50)

   	cursor, err := coll.Find(ctx, filter, opts)
   	if err != nil {
   		log.Fatalf("failed to retrieve documents: %v", err)
   	}

   	var listings []common.Listing
   	if err = cursor.All(ctx, &listings); err != nil {
   		log.Fatalf("failed to unmarshal retrieved documents to Listing object: %v", err)
   	}

   	var summaries []string
   	for _, listing := range listings {
   		summaries = append(summaries, listing.Summary)
   	}

   	log.Println("Generating embeddings.")
   	embeddings := common.GetEmbeddings(summaries)

   	docsToUpdate := make([]mongo.WriteModel, len(listings))
   	for i := range listings {
   		docsToUpdate[i] = mongo.NewUpdateOneModel().
   			SetFilter(bson.D{{"_id", listings[i].ID}}).
   			SetUpdate(bson.D{{"$set", bson.D{{"embeddings", embeddings[i]}}}})
   	}
   	bulkWriteOptions := options.BulkWrite().SetOrdered(false)

   	result, err := coll.BulkWrite(context.Background(), docsToUpdate, bulkWriteOptions)
   	if err != nil {
   		log.Fatalf("failed to write embeddings to existing documents: %v", err)
   	}
   	log.Printf("Successfully added embeddings to %v documents", result.ModifiedCount)
   }

   ```

2. Create a file that contains Go models for the collection.

   To simplify marshalling and unmarshalling Go objects to and from BSON, create a file that contains models for the documents in this collection.

   Move into the `common` directory.

   ```console
   cd common
   ```

   Create a file named `models.go`, and paste the following code into it:

   ### Open-Source

   ```go
   package common

   import (
   	"time"

   	"go.mongodb.org/mongo-driver/v2/bson"
   )

   type Image struct {
   	ThumbnailURL string `bson:"thumbnail_url"`
   	MediumURL    string `bson:"medium_url"`
   	PictureURL   string `bson:"picture_url"`
   	XLPictureURL string `bson:"xl_picture_url"`
   }

   type Host struct {
   	ID                 string   `bson:"host_id"`
   	URL                string   `bson:"host_url"`
   	Name               string   `bson:"host_name"`
   	Location           string   `bson:"host_location"`
   	About              string   `bson:"host_about"`
   	ThumbnailURL       string   `bson:"host_thumbnail_url"`
   	PictureURL         string   `bson:"host_picture_url"`
   	Neighborhood       string   `bson:"host_neighborhood"`
   	IsSuperhost        bool     `bson:"host_is_superhost"`
   	HasProfilePic      bool     `bson:"host_has_profile_pic"`
   	IdentityVerified   bool     `bson:"host_identity_verified"`
   	ListingsCount      int32    `bson:"host_listings_count"`
   	TotalListingsCount int32    `bson:"host_total_listings_count"`
   	Verifications      []string `bson:"host_verifications"`
   }

   type Location struct {
   	Type            string    `bson:"type"`
   	Coordinates     []float64 `bson:"coordinates"`
   	IsLocationExact bool      `bson:"is_location_exact"`
   }

   type Address struct {
   	Street         string   `bson:"street"`
   	Suburb         string   `bson:"suburb"`
   	GovernmentArea string   `bson:"government_area"`
   	Market         string   `bson:"market"`
   	Country        string   `bson:"Country"`
   	CountryCode    string   `bson:"country_code"`
   	Location       Location `bson:"location"`
   }

   type Availability struct {
   	Thirty         int32 `bson:"availability_30"`
   	Sixty          int32 `bson:"availability_60"`
   	Ninety         int32 `bson:"availability_90"`
   	ThreeSixtyFive int32 `bson:"availability_365"`
   }

   type ReviewScores struct {
   	Accuracy      int32 `bson:"review_scores_accuracy"`
   	Cleanliness   int32 `bson:"review_scores_cleanliness"`
   	CheckIn       int32 `bson:"review_scores_checkin"`
   	Communication int32 `bson:"review_scores_communication"`
   	Location      int32 `bson:"review_scores_location"`
   	Value         int32 `bson:"review_scores_value"`
   	Rating        int32 `bson:"review_scores_rating"`
   }

   type Review struct {
   	ID           string    `bson:"_id"`
   	Date         time.Time `bson:"date,omitempty"`
   	ListingId    string    `bson:"listing_id"`
   	ReviewerId   string    `bson:"reviewer_id"`
   	ReviewerName string    `bson:"reviewer_name"`
   	Comments     string    `bson:"comments"`
   }

   type Listing struct {
   	ID                   string          `bson:"_id"`
   	ListingURL           string          `bson:"listing_url"`
   	Name                 string          `bson:"name"`
   	Summary              string          `bson:"summary"`
   	Space                string          `bson:"space"`
   	Description          string          `bson:"description"`
   	NeighborhoodOverview string          `bson:"neighborhood_overview"`
   	Notes                string          `bson:"notes"`
   	Transit              string          `bson:"transit"`
   	Access               string          `bson:"access"`
   	Interaction          string          `bson:"interaction"`
   	HouseRules           string          `bson:"house_rules"`
   	PropertyType         string          `bson:"property_type"`
   	RoomType             string          `bson:"room_type"`
   	BedType              string          `bson:"bed_type"`
   	MinimumNights        string          `bson:"minimum_nights"`
   	MaximumNights        string          `bson:"maximum_nights"`
   	CancellationPolicy   string          `bson:"cancellation_policy"`
   	LastScraped          time.Time       `bson:"last_scraped,omitempty"`
   	CalendarLastScraped  time.Time       `bson:"calendar_last_scraped,omitempty"`
   	FirstReview          time.Time       `bson:"first_review,omitempty"`
   	LastReview           time.Time       `bson:"last_review,omitempty"`
   	Accommodates         int32           `bson:"accommodates"`
   	Bedrooms             int32           `bson:"bedrooms"`
   	Beds                 int32           `bson:"beds"`
   	NumberOfReviews      int32           `bson:"number_of_reviews"`
   	Bathrooms            bson.Decimal128 `bson:"bathrooms"`
   	Amenities            []string        `bson:"amenities"`
   	Price                bson.Decimal128 `bson:"price"`
   	WeeklyPrice          bson.Decimal128 `bson:"weekly_price"`
   	MonthlyPrice         bson.Decimal128 `bson:"monthly_price"`
   	CleaningFee          bson.Decimal128 `bson:"cleaning_fee"`
   	ExtraPeople          bson.Decimal128 `bson:"extra_people"`
   	GuestsIncluded       bson.Decimal128 `bson:"guests_included"`
   	Image                Image           `bson:"images"`
   	Host                 Host            `bson:"host"`
   	Address              Address         `bson:"address"`
   	Availability         Availability    `bson:"availability"`
   	ReviewScores         ReviewScores    `bson:"review_scores"`
   	Reviews              []Review        `bson:"reviews"`
   	Embeddings           []float32       `bson:"embeddings,omitempty"`
   }

   ```

   Move back into the project root directory.

   ```console
   cd ../
   ```

3. Generate embeddings.

   ```text
   go run create-embeddings.go
   ```

   **Output:**

   ```sh
   2024/10/10 09:58:03 Generating embeddings.
   2024/10/10 09:58:12 Successfully added embeddings to 50 documents
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_airbnb.listingsAndReviews` namespace [in the Atlas UI](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections) and expanding the fields in a document.

1) Write a script that generates embeddings from an existing collection.

   Create a file named `CreateEmbeddings.java` and paste the following code.

   This code uses the `getEmbeddings()` method and the MongoDB [Java Sync Driver](https://www.mongodb.com/docs/drivers/java/sync/) to do the following:

   Connect to your MongoDB deployment.

   Get the array of sample texts.

   Generate embeddings from each text using the `getEmbeddings()` method that you defined previously.

   Ingest the embeddings into the `sample_db.embeddings` collection.

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.result.InsertManyResult;
   import org.bson.BsonArray;
   import org.bson.Document;

   import java.util.ArrayList;
   import java.util.Arrays;
   import java.util.List;

   public class CreateEmbeddings {

       static List<String> data = Arrays.asList(
               "Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
               "The Lion King: Lion cub and future king Simba searches for his identity",
               "Avatar: A marine is dispatched to the moon Pandora on a unique mission"
       );

       public static void main(String[] args){
           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new RuntimeException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_db");
               MongoCollection<Document> collection = database.getCollection("embeddings");

               System.out.println("Creating embeddings for " + data.size() + " documents");
               EmbeddingProvider embeddingProvider = new EmbeddingProvider();

               // generate embeddings for new inputted data
               List<BsonArray> embeddings = embeddingProvider.getEmbeddings(data);

               List<Document> documents = new ArrayList<>();
               int i = 0;
               for (String text : data) {
                   Document doc = new Document("text", text).append("embedding", embeddings.get(i));
                   documents.add(doc);
                   i++;
               }

               // insert the embeddings into the MongoDB collection
               List<String> insertedIds = new ArrayList<>();
               try {
                   InsertManyResult result = collection.insertMany(documents);
                   result.getInsertedIds().values()
                           .forEach(doc -> insertedIds.add(doc.toString()));
                   System.out.println("Inserted " + insertedIds.size() + " documents with the following ids to " + collection.getNamespace() + " collection: \n " + insertedIds);
               } catch (MongoException me) {
                   throw new RuntimeException("Failed to insert documents", me);
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

2) Generate the embeddings.

   Save and run the file. The output resembles:

   ```shell
   Creating embeddings for 3 documents
   Inserted 3 documents with the following ids to sample_db.embeddings collection:
    [BsonObjectId{value=6735ff620d88451041f6dd40}, BsonObjectId{value=6735ff620d88451041f6dd41}, BsonObjectId{value=6735ff620d88451041f6dd42}]

   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Write a script that generates embeddings from an existing collection.

   Create a file named `CreateEmbeddings.java` and paste the following code.

   This code uses the `getEmbeddings()` method and the MongoDB [Java Sync Driver](https://www.mongodb.com/docs/drivers/java/sync/) to do the following:

   Connect to your MongoDB deployment.

   Get a subset of documents from the `sample_airbnb.listingsAndReviews` collection that have a non-empty `summary` field.

   Generate embeddings from each document's `summary` field using the `getEmbeddings()` method that you defined previously.

   Update each document with a new `embeddings` field that contains the embedding value.

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.bulk.BulkWriteResult;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoCursor;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.BulkWriteOptions;
   import com.mongodb.client.model.Filters;
   import com.mongodb.client.model.UpdateOneModel;
   import com.mongodb.client.model.Updates;
   import com.mongodb.client.model.WriteModel;
   import org.bson.BsonArray;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.ArrayList;
   import java.util.List;

   public class CreateEmbeddings {

       public static void main(String[] args){

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new RuntimeException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_airbnb");
               MongoCollection<Document> collection = database.getCollection("listingsAndReviews");

               Bson filterCriteria = Filters.and(
                       Filters.and(Filters.exists("summary"),
                               Filters.ne("summary", null),
                               Filters.ne("summary", "")),
                       Filters.exists("embeddings", false));

               try (MongoCursor<Document> cursor = collection.find(filterCriteria).limit(50).iterator()) {
                   List<String> summaries = new ArrayList<>();
                   List<String> documentIds = new ArrayList<>();

                   int i = 0;
                   while (cursor.hasNext()) {
                       Document document = cursor.next();
                       String summary = document.getString("summary");
                       String id = document.get("_id").toString();
                       summaries.add(summary);
                       documentIds.add(id);
                       i++;
                   }

                   System.out.println("Generating embeddings for " + summaries.size() + " documents.");
                   System.out.println("This operation may take up to several minutes.");
                   EmbeddingProvider embeddingProvider = new EmbeddingProvider();
                   List<BsonArray> embeddings = embeddingProvider.getEmbeddings(summaries);

                   List<WriteModel<Document>> updateDocuments = new ArrayList<>();
                   for (int j = 0; j < summaries.size(); j++) {
                       UpdateOneModel<Document> updateDoc = new UpdateOneModel<>(
                               Filters.eq("_id", documentIds.get(j)),
                               Updates.set("embeddings", embeddings.get(j)));
                       updateDocuments.add(updateDoc);
                   }

                   int updatedDocsCount = 0;
                   try {
                       BulkWriteOptions options = new BulkWriteOptions().ordered(false);
                       BulkWriteResult result = collection.bulkWrite(updateDocuments, options);
                       updatedDocsCount = result.getModifiedCount();
                   } catch (MongoException me) {
                       throw new RuntimeException("Failed to insert documents", me);
                   }
                   System.out.println("Added embeddings successfully to " + updatedDocsCount + " documents.");
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

2. Generate the embeddings.

   Save and run the file. The output resembles:

   ```shell
   Generating embeddings for 50 documents.
   This operation may take up to several minutes.
   Added embeddings successfully to 50 documents.

   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_airbnb.listingsAndReviews` namespace [in the Atlas UI](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections) and expanding the fields in a document.

1) Define a `DataService` class.

   Create a new class in a same-named file named `DataService.cs` and paste the following code. This code defines an async Task named `AddDocumentsAsync` add documents to MongoDB. This function uses the [Collection.InsertManyAsync()](https://www.mongodb.com/docs/drivers/csharp/current/crud/insert.md#std-label-csharp-insert-guide) .NET/C# driver method to insert a list of the `BsonDocument` type. Each document contains:

   - A `text` field that contains the movie summary.

   - An `embedding` field that contains the array of floats from generating the vector embeddings.

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_db");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("embeddings");
       
       public async Task AddDocumentsAsync(Dictionary<string, float[]> embeddings)
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
           Console.WriteLine($"Successfully inserted {embeddings.Count} documents");
           documents.Clear();
       }
   }
   ```

2) Update the `Program.cs` in your project.

   Use the following code to generate embeddings from an existing collection.

   Specifically, this code uses the `GetEmbeddingsAsync()` function that you defined to generate embeddings from an array of sample texts and ingest them into the `sample_db.embeddings` collection.

   ```csharp
   using MyCompany.Embeddings;

   var aiService = new AIService();
   var texts = new string[]
   {
       "Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
       "The Lion King: Lion cub and future king Simba searches for his identity",
       "Avatar: A marine is dispatched to the moon Pandora on a unique mission"
   };
   var embeddings = await aiService.GetEmbeddingsAsync(texts);

   var dataService = new DataService();
   await dataService.AddDocumentsAsync(embeddings);

   ```

3) Compile and run your project.

   ```text
   dotnet run MyCompany.Embeddings.csproj
   ```

   **Output:**

   ```sh
   Successfully inserted 3 documents
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Define a `DataService` class.

   Create a new class in a same-named file named `DataService.cs` and paste the following code. This code creates two functions that do the following:

   - Connect to your MongoDB deployment.

   - The `GetDocuments` method gets a subset of documents from the `sample_airbnb.listingsAndReviews` collection that have a non-empty `summary` field.

   - The `AddEmbeddings` async Task creates a new `embeddings` field on documents in the `sample_airbnb.listingsAndReviews` collection whose `_id` matches one of the documents retrieved in the `GetDocuments` method.

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_airbnb");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("listingsAndReviews");
       public List<BsonDocument>? GetDocuments()
       {
           var filter = Builders<BsonDocument>.Filter.And(
               Builders<BsonDocument>.Filter.And(
                   Builders<BsonDocument>.Filter.Exists("summary", true),
                   Builders<BsonDocument>.Filter.Ne("summary", "")
               ),
               Builders<BsonDocument>.Filter.Exists("embeddings", false)
           );
           return Collection.Find(filter).Limit(50).ToList(); 
       }
       public async Task<long> AddEmbeddings(Dictionary<string, float[]> embeddings)
       {
           var listWrites = new List<WriteModel<BsonDocument>>();
           foreach( var kvp in embeddings )
           {
               var filterForUpdate = Builders<BsonDocument>.Filter.Eq("summary", kvp.Key);
               var updateDefinition = Builders<BsonDocument>.Update.Set("embeddings", kvp.Value);
               listWrites.Add(new UpdateOneModel<BsonDocument>(filterForUpdate, updateDefinition));
           }
           var result = await Collection.BulkWriteAsync(listWrites);
           listWrites.Clear();
           return result.ModifiedCount;
       }
   }
   ```

2. Update the `Program.cs` in your project.

   Use the following code to generate embeddings from an existing MongoDB collection.

   Specifically, this code uses the `GetEmbeddingsAsync()` function that you defined to generate embeddings from an array of sample texts and ingest them into the `sample_db.embeddings` collection.

   ```csharp
   using MyCompany.Embeddings;

   var dataService = new DataService();
   var documents = dataService.GetDocuments();

   if (documents != null)
   {
       Console.WriteLine("Generating embeddings.");
       var aiService = new AIService();
       var summaries = new List<string>();
       foreach (var document in documents)
       {
           var summary = document.GetValue("summary").ToString();
           if (summary != null)
           {
               summaries.Add(summary);
           }
       }
       
       try
       {
           if (summaries.Count > 0)
           {
               var embeddings = await aiService.GetEmbeddingsAsync(summaries.ToArray());
           
               try
               {
                   var updatedCount = await dataService.AddEmbeddings(embeddings);
                   Console.WriteLine($"{updatedCount} documents updated successfully.");
               } catch (Exception e)
               {
                   Console.WriteLine($"Error adding embeddings to MongoDB: {e.Message}");
               }
           }
       }
       catch (Exception e)
       {
           Console.WriteLine($"Error creating embeddings for summaries: {e.Message}");
       }
   }
   else
   {
       Console.WriteLine("No documents found");
   }

   ```

3. Compile and run your project.

   ```text
   dotnet run MyCompany.Embeddings.csproj
   ```

   **Output:**

   ```sh
   Generating embeddings.
   50 documents updated successfully.
   ```

1) Load your data.

   The following code defines an array of sample texts.

   ```python
   # Sample data
   texts = [
     "Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
     "The Lion King: Lion cub and future king Simba searches for his identity",
     "Avatar: A marine is dispatched to the moon Pandora on a unique mission"
   ]
   ```

2) Generate embeddings from your data.

   Use the `get_embedding()` function to generate embeddings from the sample texts. Your embeddings might vary depending on the model you use.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section if you defined the function to convert your embeddings to BSON binary format.

   If you defined the `generate_bson_vector` function, uncomment the line that calls this function to compress your embeddings to `binData` vectors. Your embeddings will appear in binary format.

   ```python
   # Generate embeddings from the sample data
   embeddings = []
   for text in texts:
    embedding = get_embedding(text)

    # Uncomment the following line to convert to BSON
    # embedding = generate_bson_vector(embedding, BinaryVectorDtype.FLOAT32)

    embeddings.append(embedding)

    # Print the embeddings
    print(f"\nText: {text}")
    print(f"Embedding: {embedding[:3]}... (truncated)")
   ```

   **Output:**

   ```shell
   Text: Titanic: The story of the 1912 sinking of the largest luxury liner ever built
   Embedding: [-0.01089042  0.05926645 -0.00291325]... (truncated)

   Text: The Lion King: Lion cub and future king Simba searches for his identity
   Embedding: [-0.05607051 -0.01360618  0.00523855]... (truncated)

   Text: Avatar: A marine is dispatched to the moon Pandora on a unique mission
   Embedding: [-0.0275258   0.01144342 -0.02360895]... (truncated)
   ```

3) Ingest the embeddings into MongoDB.

   Perform the following steps to create documents with the embeddings and ingest them into your MongoDB deployment:

   Define a function to create documents.

   ```python
   def create_docs_with_embeddings(embeddings, data):
      docs = []
      for i, (embedding, text) in enumerate(zip(embeddings, data)):
         doc = {
               "_id": i,
               "text": text,
               "embedding": embedding,
         }
         docs.append(doc)
      return docs
   ```

   Create the documents with your embeddings.

   ```python
   # Create documents with embeddings and sample data
   docs = create_docs_with_embeddings(embeddings, texts)
   ```

   Insert the documents into a MongoDB collection.

   Paste and run the following code in your notebook to connect to your MongoDB deployment and ingest the embeddings into the specified database and collection.

   ```python
   import pymongo

   # Connect to your MongoDB deployment
   mongo_client = pymongo.MongoClient("<connection-string>")
   db = mongo_client["sample_db"]
   collection = db["embeddings"]

   # Ingest data into the collection
   collection.insert_many(docs)
   ```

   **Output:**

   ```text
   InsertManyResult([0, 1, 2], acknowledged=True)
   ```

   **Note:**

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Load your existing data.

   Load data from your MongoDB deployment. The following code gets a subset of `50` documents from the `sample_airbnb.listingAndReviews` collection.

   ```python
   import pymongo

   # Connect to your MongoDB deployment
   mongo_client = pymongo.MongoClient("<connection-string>")
   db = mongo_client["sample_airbnb"]
   collection = db["listingsAndReviews"]

   # Define a filter to exclude documents with null or empty 'summary' fields
   filter = { 'summary': { '$exists': True, "$nin": [ None, "" ] } }

   # Get a subset of documents in the collection
   documents = collection.find(filter, {'_id': 1, 'summary': 1}).limit(50)
   ```

   **Note:**

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

2. Generate the embeddings and update your documents.

   Generate embeddings from the documents you loaded in the previous step. This code does the following:

   - Generates embeddings from each document's `summary` field by using the `get_embedding()` function that you defined.

   - Updates each document with a new `embedding` field that contains the embedding value.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section if you defined the function to convert your embeddings to BSON binary format.

   If you defined the `generate_bson_vector` function to convert your vector embeddings to BSON (Binary Javascript Object Notation) `binData` vectors, uncomment the line that calls this function before running the code.

   **Note:**

   This operation might take a few minutes to complete.

   ```python
   from pymongo import UpdateOne

   # Generate the list of bulk write operations
   operations = []
   for doc in documents:
      summary = doc["summary"]
      # Generate embeddings for this document
      embedding = get_embedding(summary)

      # Uncomment the following line to convert to BSON vectors
      # embedding = generate_bson_vector(embedding, BinaryVectorDtype.FLOAT32)

      # Add the update operation to the list
      operations.append(UpdateOne(
         {"_id": doc["_id"]},
         {"$set": {
            "embedding": embedding
         }}
      ))

   # Execute the bulk write operation
   if operations:
      result = collection.bulk_write(operations)
      updated_doc_count = result.modified_count

   print(f"Updated {updated_doc_count} documents.")
   ```

   **Output:**

   ```shell
   Updated 50 documents.
   ```

1) Create a file named `create-embeddings.js` and paste the following code.

   Use the following code to generate embeddings from an existing collection. This code uses the `getEmbedding()` function that you defined and the [Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/) to generate embeddings from an array of sample texts and ingest them into the `sample_db.embeddings` collection.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section if you defined the function to convert your embeddings to BSON binary format.

   If you defined the `convertEmbeddingsToBSON` function, uncomment lines `3` and `32`-`33`  to convert your embeddings to BSON (Binary Javascript Object Notation) `binData` vectors.

   ```javascript
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';
   // import { convertEmbeddingsToBSON } from './convert-embeddings.js';

   // Data to embed
   const texts = [ 
       "Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
       "The Lion King: Lion cub and future king Simba searches for his identity",
       "Avatar: A marine is dispatched to the moon Pandora on a unique mission"
   ]

   async function run() {

       // Connect to your MongoDB deployment
       const client = new MongoClient(process.env.MONGODB_URI);
       
       try {
           await client.connect();
           const db = client.db("sample_db");
           const collection = db.collection("embeddings");

           console.log("Generating embeddings and inserting documents...");
           const insertDocuments = [];
           await Promise.all(texts.map(async text => {
               // Check if the document already exists
               const existingDoc = await collection.findOne({ text: text });

               // Generate an embedding using the function that you defined
               var embedding = await getEmbedding(text);
               
               // Uncomment the following lines to convert the generated embedding into BSON format
               // const bsonEmbedding = await convertEmbeddingsToBSON([embedding]); // Since convertEmbeddingsToBSON is designed to handle arrays
               // embedding = bsonEmbedding; // Use BSON embedding instead of the original float32 embedding
                         
               // Add the document with the embedding to array of documents for bulk insert
               if (!existingDoc) {
                   insertDocuments.push({
                       text: text,
                       embedding: embedding
                   })
               }
           }));

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

2) Save and run the file.

   ### Open-Source

   ```text
   node --env-file=.env create-embeddings.js
   ```

   **Output:**

   ```sh
   Generating embeddings and inserting documents...
   Count of documents inserted: 3
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Create a file named `create-embeddings.js` and paste the following code.

   Use the following code to generate embeddings from an existing collection. Specifically, this code does the following:

   - Connects to your MongoDB deployment.

   - Gets a subset of documents from the `sample_airbnb.listingsAndReviews` collection that have a non-empty `summary` field.

   - Generates embeddings from each document's `summary` field by using the `getEmbedding()` function that you defined.

   - Updates each document with a new `embedding` field that contains the embedding value by using the MongoDB [Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section if you defined the function to convert your embeddings to BSON binary format.

   If you defined the `convertEmbeddingsToBSON` function, uncomment lines `3` and `29`-`30`  to convert your embeddings to BSON (Binary Javascript Object Notation) `binData` vectors.

   ```javascript
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';
   // import { convertEmbeddingsToBSON } from './convert-embeddings.js';

   async function run() {

       // Connect to your MongoDB deployment
       const client = new MongoClient(process.env.MONGODB_URI);

       try {
           await client.connect();
           const db = client.db("sample_airbnb");
           const collection = db.collection("listingsAndReviews");

           // Filter to exclude null or empty summary fields
           const filter = { "summary": { "$nin": [ null, "" ] } };

           // Get a subset of documents from the collection
           const documents = await collection.find(filter).limit(50).toArray();

           console.log("Generating embeddings and updating documents...");
           const updateDocuments = [];
           await Promise.all(documents.map(async doc => {

               // Generate an embedding using the function that you defined
               var embedding = await getEmbedding(doc.summary);

               // Uncomment the following lines to convert the generated embedding into BSON format
               // const bsonEmbedding = await convertEmbeddingsToBSON([embedding]); // Since convertEmbeddingsToBSON is designed to handle arrays
               // embedding = bsonEmbedding; // Use BSON embedding instead of the original float32 embedding
                
               // Add the embedding to an array of update operations
               updateDocuments.push(
                   {
                       updateOne: { 
                           filter: { "_id": doc._id },
                           update: { $set: { "embedding": embedding } }
                       }
                   }
              )
          }));

          // Continue processing documents if an error occurs during an operation
          const options = { ordered: false };

          // Update documents with the new embedding field
          const result = await collection.bulkWrite(updateDocuments, options); 
          console.log("Count of documents updated: " + result.modifiedCount); 
               
       } catch (err) {
           console.log(err.stack);
       }
       finally {
           await client.close();
       }
   }
   run().catch(console.dir);

   ```

2. Save and run the file.

   ```text
   node --env-file=.env create-embeddings.js
   ```

   **Output:**

   ```sh
   Generating embeddings and updating documents...
   Count of documents updated: 50
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_airbnb.listingsAndReviews` namespace [in the Atlas UI](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections) and expanding the fields in a document.

1) Create a file named `create-embeddings.go` and paste the following code.

   Use the following code to generate embeddings from an existing collection.

   Specifically, this code uses the `GetEmbeddings()` function that you defined and the MongoDB [Go Driver](https://www.mongodb.com/docs/drivers/go/) to generate embeddings from an array of sample texts and ingest them into the `sample_db.embeddings` collection.

   ### Open-Source

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"my-embeddings-project/common"
   	"os"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   var data = []string{
   	"Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
   	"The Lion King: Lion cub and future king Simba searches for his identity",
   	"Avatar: A marine is dispatched to the moon Pandora on a unique mission",
   }

   type TextWithEmbedding struct {
   	Text      string
   	Embedding []float32
   }

   func main() {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
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

   	// Set the namespace
   	coll := client.Database("sample_db").Collection("embeddings")

   	embeddings := common.GetEmbeddings(data)
   	docsToInsert := make([]interface{}, len(embeddings))
   	for i, string := range data {
   		docsToInsert[i] = TextWithEmbedding{
   			Text:      string,
   			Embedding: embeddings[i],
   		}
   	}

   	result, err := coll.InsertMany(ctx, docsToInsert)

   	if err != nil {
   		log.Fatalf("failed to insert documents: %v", err)
   	}
   	fmt.Printf("Successfully inserted %v documents into MongoDB\n", len(result.InsertedIDs))
   }

   ```

2) Save and run the file.

   ### Open-Source

   ```text
   go run create-embeddings.go
   ```

   **Output:**

   ```sh
   Successfully inserted 3 documents
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Create a file named `create-embeddings.go` and paste the following code.

   Use the following code to generate embeddings from an existing collection. Specifically, this code does the following:

   - Connects to your MongoDB deployment.

   - Gets a subset of documents from the `sample_airbnb.listingsAndReviews` collection that have a non-empty `summary` field.

   - Generates embeddings from each document's `summary` field by using the `GetEmbeddings()` function that you defined.

   - Updates each document with a new `embeddings` field that contains the embedding value by using the MongoDB [Go Driver.](https://www.mongodb.com/docs/drivers/go/)

   ```go
   package main

   import (
   	"context"
   	"log"
   	"my-embeddings-project/common"
   	"os"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
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

   	// Set the namespace
   	coll := client.Database("sample_airbnb").Collection("listingsAndReviews")

   	filter := bson.D{
   		{"$and",
   			bson.A{
   				bson.D{
   					{"$and",
   						bson.A{
   							bson.D{{"summary", bson.D{{"$exists", true}}}},
   							bson.D{{"summary", bson.D{{"$ne", ""}}}},
   						},
   					}},
   				bson.D{{"embeddings", bson.D{{"$exists", false}}}},
   			}},
   	}

   	opts := options.Find().SetLimit(50)

   	cursor, err := coll.Find(ctx, filter, opts)
   	if err != nil {
   		log.Fatalf("failed to retrieve documents: %v", err)
   	}

   	var listings []common.Listing
   	if err = cursor.All(ctx, &listings); err != nil {
   		log.Fatalf("failed to unmarshal retrieved documents to Listing object: %v", err)
   	}

   	var summaries []string
   	for _, listing := range listings {
   		summaries = append(summaries, listing.Summary)
   	}

   	log.Println("Generating embeddings.")
   	embeddings := common.GetEmbeddings(summaries)

   	docsToUpdate := make([]mongo.WriteModel, len(listings))
   	for i := range listings {
   		docsToUpdate[i] = mongo.NewUpdateOneModel().
   			SetFilter(bson.D{{"_id", listings[i].ID}}).
   			SetUpdate(bson.D{{"$set", bson.D{{"embeddings", embeddings[i]}}}})
   	}
   	bulkWriteOptions := options.BulkWrite().SetOrdered(false)

   	result, err := coll.BulkWrite(context.Background(), docsToUpdate, bulkWriteOptions)
   	if err != nil {
   		log.Fatalf("failed to write embeddings to existing documents: %v", err)
   	}
   	log.Printf("Successfully added embeddings to %v documents", result.ModifiedCount)
   }

   ```

2. Create a file that contains Go models for the collection.

   To simplify marshalling and unmarshalling Go objects to and from BSON, create a file that contains models for the documents in this collection.

   Move into the `common` directory.

   ```console
   cd common
   ```

   Create a file named `models.go`, and paste the following code into it:

   ### Open-Source

   ```go
   package common

   import (
   	"time"

   	"go.mongodb.org/mongo-driver/v2/bson"
   )

   type Image struct {
   	ThumbnailURL string `bson:"thumbnail_url"`
   	MediumURL    string `bson:"medium_url"`
   	PictureURL   string `bson:"picture_url"`
   	XLPictureURL string `bson:"xl_picture_url"`
   }

   type Host struct {
   	ID                 string   `bson:"host_id"`
   	URL                string   `bson:"host_url"`
   	Name               string   `bson:"host_name"`
   	Location           string   `bson:"host_location"`
   	About              string   `bson:"host_about"`
   	ThumbnailURL       string   `bson:"host_thumbnail_url"`
   	PictureURL         string   `bson:"host_picture_url"`
   	Neighborhood       string   `bson:"host_neighborhood"`
   	IsSuperhost        bool     `bson:"host_is_superhost"`
   	HasProfilePic      bool     `bson:"host_has_profile_pic"`
   	IdentityVerified   bool     `bson:"host_identity_verified"`
   	ListingsCount      int32    `bson:"host_listings_count"`
   	TotalListingsCount int32    `bson:"host_total_listings_count"`
   	Verifications      []string `bson:"host_verifications"`
   }

   type Location struct {
   	Type            string    `bson:"type"`
   	Coordinates     []float64 `bson:"coordinates"`
   	IsLocationExact bool      `bson:"is_location_exact"`
   }

   type Address struct {
   	Street         string   `bson:"street"`
   	Suburb         string   `bson:"suburb"`
   	GovernmentArea string   `bson:"government_area"`
   	Market         string   `bson:"market"`
   	Country        string   `bson:"Country"`
   	CountryCode    string   `bson:"country_code"`
   	Location       Location `bson:"location"`
   }

   type Availability struct {
   	Thirty         int32 `bson:"availability_30"`
   	Sixty          int32 `bson:"availability_60"`
   	Ninety         int32 `bson:"availability_90"`
   	ThreeSixtyFive int32 `bson:"availability_365"`
   }

   type ReviewScores struct {
   	Accuracy      int32 `bson:"review_scores_accuracy"`
   	Cleanliness   int32 `bson:"review_scores_cleanliness"`
   	CheckIn       int32 `bson:"review_scores_checkin"`
   	Communication int32 `bson:"review_scores_communication"`
   	Location      int32 `bson:"review_scores_location"`
   	Value         int32 `bson:"review_scores_value"`
   	Rating        int32 `bson:"review_scores_rating"`
   }

   type Review struct {
   	ID           string    `bson:"_id"`
   	Date         time.Time `bson:"date,omitempty"`
   	ListingId    string    `bson:"listing_id"`
   	ReviewerId   string    `bson:"reviewer_id"`
   	ReviewerName string    `bson:"reviewer_name"`
   	Comments     string    `bson:"comments"`
   }

   type Listing struct {
   	ID                   string          `bson:"_id"`
   	ListingURL           string          `bson:"listing_url"`
   	Name                 string          `bson:"name"`
   	Summary              string          `bson:"summary"`
   	Space                string          `bson:"space"`
   	Description          string          `bson:"description"`
   	NeighborhoodOverview string          `bson:"neighborhood_overview"`
   	Notes                string          `bson:"notes"`
   	Transit              string          `bson:"transit"`
   	Access               string          `bson:"access"`
   	Interaction          string          `bson:"interaction"`
   	HouseRules           string          `bson:"house_rules"`
   	PropertyType         string          `bson:"property_type"`
   	RoomType             string          `bson:"room_type"`
   	BedType              string          `bson:"bed_type"`
   	MinimumNights        string          `bson:"minimum_nights"`
   	MaximumNights        string          `bson:"maximum_nights"`
   	CancellationPolicy   string          `bson:"cancellation_policy"`
   	LastScraped          time.Time       `bson:"last_scraped,omitempty"`
   	CalendarLastScraped  time.Time       `bson:"calendar_last_scraped,omitempty"`
   	FirstReview          time.Time       `bson:"first_review,omitempty"`
   	LastReview           time.Time       `bson:"last_review,omitempty"`
   	Accommodates         int32           `bson:"accommodates"`
   	Bedrooms             int32           `bson:"bedrooms"`
   	Beds                 int32           `bson:"beds"`
   	NumberOfReviews      int32           `bson:"number_of_reviews"`
   	Bathrooms            bson.Decimal128 `bson:"bathrooms"`
   	Amenities            []string        `bson:"amenities"`
   	Price                bson.Decimal128 `bson:"price"`
   	WeeklyPrice          bson.Decimal128 `bson:"weekly_price"`
   	MonthlyPrice         bson.Decimal128 `bson:"monthly_price"`
   	CleaningFee          bson.Decimal128 `bson:"cleaning_fee"`
   	ExtraPeople          bson.Decimal128 `bson:"extra_people"`
   	GuestsIncluded       bson.Decimal128 `bson:"guests_included"`
   	Image                Image           `bson:"images"`
   	Host                 Host            `bson:"host"`
   	Address              Address         `bson:"address"`
   	Availability         Availability    `bson:"availability"`
   	ReviewScores         ReviewScores    `bson:"review_scores"`
   	Reviews              []Review        `bson:"reviews"`
   	Embeddings           []float32       `bson:"embeddings,omitempty"`
   }

   ```

   Move back into the project root directory.

   ```console
   cd ../
   ```

3. Generate embeddings.

   ```text
   go run create-embeddings.go
   ```

   **Output:**

   ```sh
   2024/10/10 09:58:03 Generating embeddings.
   2024/10/10 09:58:12 Successfully added embeddings to 50 documents
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_airbnb.listingsAndReviews` namespace [in the Atlas UI](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections) and expanding the fields in a document.

1) Write a script that generates embeddings from an existing collection.

   Create a file named `CreateEmbeddings.java` and paste the following code.

   This code uses the `getEmbeddings()` method and the MongoDB [Java Sync Driver](https://www.mongodb.com/docs/drivers/java/sync/) to do the following:

   Connect to your MongoDB deployment.

   Get the array of sample texts.

   Generate embeddings from each text using the `getEmbeddings()` method that you defined previously.

   Ingest the embeddings into the `sample_db.embeddings` collection.

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.result.InsertManyResult;
   import org.bson.BsonArray;
   import org.bson.Document;

   import java.util.ArrayList;
   import java.util.Arrays;
   import java.util.List;

   public class CreateEmbeddings {

       static List<String> data = Arrays.asList(
               "Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
               "The Lion King: Lion cub and future king Simba searches for his identity",
               "Avatar: A marine is dispatched to the moon Pandora on a unique mission"
       );

       public static void main(String[] args){
           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new RuntimeException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_db");
               MongoCollection<Document> collection = database.getCollection("embeddings");

               System.out.println("Creating embeddings for " + data.size() + " documents");
               EmbeddingProvider embeddingProvider = new EmbeddingProvider();

               // generate embeddings for new inputted data
               List<BsonArray> embeddings = embeddingProvider.getEmbeddings(data);

               List<Document> documents = new ArrayList<>();
               int i = 0;
               for (String text : data) {
                   Document doc = new Document("text", text).append("embedding", embeddings.get(i));
                   documents.add(doc);
                   i++;
               }

               // insert the embeddings into the MongoDB collection
               List<String> insertedIds = new ArrayList<>();
               try {
                   InsertManyResult result = collection.insertMany(documents);
                   result.getInsertedIds().values()
                           .forEach(doc -> insertedIds.add(doc.toString()));
                   System.out.println("Inserted " + insertedIds.size() + " documents with the following ids to " + collection.getNamespace() + " collection: \n " + insertedIds);
               } catch (MongoException me) {
                   throw new RuntimeException("Failed to insert documents", me);
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

2) Generate the embeddings.

   Save and run the file. The output resembles:

   ```shell
   Creating embeddings for 3 documents
   Inserted 3 documents with the following ids to sample_db.embeddings collection:
    [BsonObjectId{value=6735ff620d88451041f6dd40}, BsonObjectId{value=6735ff620d88451041f6dd41}, BsonObjectId{value=6735ff620d88451041f6dd42}]

   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Write a script that generates embeddings from an existing collection.

   Create a file named `CreateEmbeddings.java` and paste the following code.

   This code uses the `getEmbeddings()` method and the MongoDB [Java Sync Driver](https://www.mongodb.com/docs/drivers/java/sync/) to do the following:

   Connect to your MongoDB deployment.

   Get a subset of documents from the `sample_airbnb.listingsAndReviews` collection that have a non-empty `summary` field.

   Generate embeddings from each document's `summary` field using the `getEmbeddings()` method that you defined previously.

   Update each document with a new `embeddings` field that contains the embedding value.

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.bulk.BulkWriteResult;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoCursor;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.BulkWriteOptions;
   import com.mongodb.client.model.Filters;
   import com.mongodb.client.model.UpdateOneModel;
   import com.mongodb.client.model.Updates;
   import com.mongodb.client.model.WriteModel;
   import org.bson.BsonArray;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.ArrayList;
   import java.util.List;

   public class CreateEmbeddings {

       public static void main(String[] args){

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new RuntimeException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_airbnb");
               MongoCollection<Document> collection = database.getCollection("listingsAndReviews");

               Bson filterCriteria = Filters.and(
                       Filters.and(Filters.exists("summary"),
                               Filters.ne("summary", null),
                               Filters.ne("summary", "")),
                       Filters.exists("embeddings", false));

               try (MongoCursor<Document> cursor = collection.find(filterCriteria).limit(50).iterator()) {
                   List<String> summaries = new ArrayList<>();
                   List<String> documentIds = new ArrayList<>();

                   int i = 0;
                   while (cursor.hasNext()) {
                       Document document = cursor.next();
                       String summary = document.getString("summary");
                       String id = document.get("_id").toString();
                       summaries.add(summary);
                       documentIds.add(id);
                       i++;
                   }

                   System.out.println("Generating embeddings for " + summaries.size() + " documents.");
                   System.out.println("This operation may take up to several minutes.");
                   EmbeddingProvider embeddingProvider = new EmbeddingProvider();
                   List<BsonArray> embeddings = embeddingProvider.getEmbeddings(summaries);

                   List<WriteModel<Document>> updateDocuments = new ArrayList<>();
                   for (int j = 0; j < summaries.size(); j++) {
                       UpdateOneModel<Document> updateDoc = new UpdateOneModel<>(
                               Filters.eq("_id", documentIds.get(j)),
                               Updates.set("embeddings", embeddings.get(j)));
                       updateDocuments.add(updateDoc);
                   }

                   int updatedDocsCount = 0;
                   try {
                       BulkWriteOptions options = new BulkWriteOptions().ordered(false);
                       BulkWriteResult result = collection.bulkWrite(updateDocuments, options);
                       updatedDocsCount = result.getModifiedCount();
                   } catch (MongoException me) {
                       throw new RuntimeException("Failed to insert documents", me);
                   }
                   System.out.println("Added embeddings successfully to " + updatedDocsCount + " documents.");
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

2. Generate the embeddings.

   Save and run the file. The output resembles:

   ```shell
   Generating embeddings for 50 documents.
   This operation may take up to several minutes.
   Added embeddings successfully to 50 documents.

   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_airbnb.listingsAndReviews` namespace [in the Atlas UI](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections) and expanding the fields in a document.

1) Define a `DataService` class.

   Create a new class in a same-named file named `DataService.cs` and paste the following code. This code defines an async Task named `AddDocumentsAsync` add documents to MongoDB. This function uses the [Collection.InsertManyAsync()](https://www.mongodb.com/docs/drivers/csharp/current/crud/insert.md#std-label-csharp-insert-guide) .NET/C# driver method to insert a list of the `BsonDocument` type. Each document contains:

   - A `text` field that contains the movie summary.

   - An `embedding` field that contains the array of floats from generating the vector embeddings.

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_db");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("embeddings");
       
       public async Task AddDocumentsAsync(Dictionary<string, float[]> embeddings)
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
           Console.WriteLine($"Successfully inserted {embeddings.Count} documents");
           documents.Clear();
       }
   }
   ```

2) Update the `Program.cs` in your project.

   Use the following code to generate embeddings from an existing collection.

   Specifically, this code uses the `GetEmbeddingsAsync()` function that you defined to generate embeddings from an array of sample texts and ingest them into the `sample_db.embeddings` collection.

   ```csharp
   using MyCompany.Embeddings;

   var aiService = new AIService();
   var texts = new string[]
   {
       "Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
       "The Lion King: Lion cub and future king Simba searches for his identity",
       "Avatar: A marine is dispatched to the moon Pandora on a unique mission"
   };
   var embeddings = await aiService.GetEmbeddingsAsync(texts);

   var dataService = new DataService();
   await dataService.AddDocumentsAsync(embeddings);

   ```

3) Compile and run your project.

   ```text
   dotnet run MyCompany.Embeddings.csproj
   ```

   **Output:**

   ```sh
   Successfully inserted 3 documents
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Define a `DataService` class.

   Create a new class in a same-named file named `DataService.cs` and paste the following code. This code creates two functions that do the following:

   - Connect to your MongoDB deployment.

   - The `GetDocuments` method gets a subset of documents from the `sample_airbnb.listingsAndReviews` collection that have a non-empty `summary` field.

   - The `AddEmbeddings` async Task creates a new `embeddings` field on documents in the `sample_airbnb.listingsAndReviews` collection whose `_id` matches one of the documents retrieved in the `GetDocuments` method.

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_airbnb");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("listingsAndReviews");
       public List<BsonDocument>? GetDocuments()
       {
           var filter = Builders<BsonDocument>.Filter.And(
               Builders<BsonDocument>.Filter.And(
                   Builders<BsonDocument>.Filter.Exists("summary", true),
                   Builders<BsonDocument>.Filter.Ne("summary", "")
               ),
               Builders<BsonDocument>.Filter.Exists("embeddings", false)
           );
           return Collection.Find(filter).Limit(50).ToList(); 
       }
       public async Task<long> AddEmbeddings(Dictionary<string, float[]> embeddings)
       {
           var listWrites = new List<WriteModel<BsonDocument>>();
           foreach( var kvp in embeddings )
           {
               var filterForUpdate = Builders<BsonDocument>.Filter.Eq("summary", kvp.Key);
               var updateDefinition = Builders<BsonDocument>.Update.Set("embeddings", kvp.Value);
               listWrites.Add(new UpdateOneModel<BsonDocument>(filterForUpdate, updateDefinition));
           }
           var result = await Collection.BulkWriteAsync(listWrites);
           listWrites.Clear();
           return result.ModifiedCount;
       }
   }
   ```

2. Update the `Program.cs` in your project.

   Use the following code to generate embeddings from an existing MongoDB collection.

   Specifically, this code uses the `GetEmbeddingsAsync()` function that you defined to generate embeddings from an array of sample texts and ingest them into the `sample_db.embeddings` collection.

   ```csharp
   using MyCompany.Embeddings;

   var dataService = new DataService();
   var documents = dataService.GetDocuments();

   if (documents != null)
   {
       Console.WriteLine("Generating embeddings.");
       var aiService = new AIService();
       var summaries = new List<string>();
       foreach (var document in documents)
       {
           var summary = document.GetValue("summary").ToString();
           if (summary != null)
           {
               summaries.Add(summary);
           }
       }
       
       try
       {
           if (summaries.Count > 0)
           {
               var embeddings = await aiService.GetEmbeddingsAsync(summaries.ToArray());
           
               try
               {
                   var updatedCount = await dataService.AddEmbeddings(embeddings);
                   Console.WriteLine($"{updatedCount} documents updated successfully.");
               } catch (Exception e)
               {
                   Console.WriteLine($"Error adding embeddings to MongoDB: {e.Message}");
               }
           }
       }
       catch (Exception e)
       {
           Console.WriteLine($"Error creating embeddings for summaries: {e.Message}");
       }
   }
   else
   {
       Console.WriteLine("No documents found");
   }

   ```

3. Compile and run your project.

   ```text
   dotnet run MyCompany.Embeddings.csproj
   ```

   **Output:**

   ```sh
   Generating embeddings.
   50 documents updated successfully.
   ```

1) Load your data.

   The following code defines an array of sample texts.

   ```python
   # Sample data
   texts = [
     "Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
     "The Lion King: Lion cub and future king Simba searches for his identity",
     "Avatar: A marine is dispatched to the moon Pandora on a unique mission"
   ]
   ```

2) Generate embeddings from your data.

   Use the `get_embedding()` function to generate embeddings from the sample texts. Your embeddings might vary depending on the model you use.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section if you defined the function to convert your embeddings to BSON binary format.

   If you defined the `generate_bson_vector` function, uncomment the line that calls this function to compress your embeddings to `binData` vectors. Your embeddings will appear in binary format.

   ```python
   # Generate embeddings from the sample data
   embeddings = []
   for text in texts:
    embedding = get_embedding(text)

    # Uncomment the following line to convert to BSON
    # embedding = generate_bson_vector(embedding, BinaryVectorDtype.FLOAT32)

    embeddings.append(embedding)

    # Print the embeddings
    print(f"\nText: {text}")
    print(f"Embedding: {embedding[:3]}... (truncated)")
   ```

   **Output:**

   ```shell
   Text: Titanic: The story of the 1912 sinking of the largest luxury liner ever built
   Embedding: [-0.01089042  0.05926645 -0.00291325]... (truncated)

   Text: The Lion King: Lion cub and future king Simba searches for his identity
   Embedding: [-0.05607051 -0.01360618  0.00523855]... (truncated)

   Text: Avatar: A marine is dispatched to the moon Pandora on a unique mission
   Embedding: [-0.0275258   0.01144342 -0.02360895]... (truncated)
   ```

3) Ingest the embeddings into MongoDB.

   Perform the following steps to create documents with the embeddings and ingest them into your MongoDB deployment:

   Define a function to create documents.

   ```python
   def create_docs_with_embeddings(embeddings, data):
      docs = []
      for i, (embedding, text) in enumerate(zip(embeddings, data)):
         doc = {
               "_id": i,
               "text": text,
               "embedding": embedding,
         }
         docs.append(doc)
      return docs
   ```

   Create the documents with your embeddings.

   ```python
   # Create documents with embeddings and sample data
   docs = create_docs_with_embeddings(embeddings, texts)
   ```

   Insert the documents into a MongoDB collection.

   Paste and run the following code in your notebook to connect to your MongoDB deployment and ingest the embeddings into the specified database and collection.

   ```python
   import pymongo

   # Connect to your MongoDB deployment
   mongo_client = pymongo.MongoClient("<connection-string>")
   db = mongo_client["sample_db"]
   collection = db["embeddings"]

   # Ingest data into the collection
   collection.insert_many(docs)
   ```

   **Output:**

   ```text
   InsertManyResult([0, 1, 2], acknowledged=True)
   ```

   **Note:**

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Load your existing data.

   Load data from your MongoDB deployment. The following code gets a subset of `50` documents from the `sample_airbnb.listingAndReviews` collection.

   ```python
   import pymongo

   # Connect to your MongoDB deployment
   mongo_client = pymongo.MongoClient("<connection-string>")
   db = mongo_client["sample_airbnb"]
   collection = db["listingsAndReviews"]

   # Define a filter to exclude documents with null or empty 'summary' fields
   filter = { 'summary': { '$exists': True, "$nin": [ None, "" ] } }

   # Get a subset of documents in the collection
   documents = collection.find(filter, {'_id': 1, 'summary': 1}).limit(50)
   ```

   **Note:**

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

2. Generate the embeddings and update your documents.

   Generate embeddings from the documents you loaded in the previous step. This code does the following:

   - Generates embeddings from each document's `summary` field by using the `get_embedding()` function that you defined.

   - Updates each document with a new `embedding` field that contains the embedding value.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section if you defined the function to convert your embeddings to BSON binary format.

   If you defined the `generate_bson_vector` function to convert your vector embeddings to BSON (Binary Javascript Object Notation) `binData` vectors, uncomment the line that calls this function before running the code.

   **Note:**

   This operation might take a few minutes to complete.

   ```python
   from pymongo import UpdateOne

   # Generate the list of bulk write operations
   operations = []
   for doc in documents:
      summary = doc["summary"]
      # Generate embeddings for this document
      embedding = get_embedding(summary)

      # Uncomment the following line to convert to BSON vectors
      # embedding = generate_bson_vector(embedding, BinaryVectorDtype.FLOAT32)

      # Add the update operation to the list
      operations.append(UpdateOne(
         {"_id": doc["_id"]},
         {"$set": {
            "embedding": embedding
         }}
      ))

   # Execute the bulk write operation
   if operations:
      result = collection.bulk_write(operations)
      updated_doc_count = result.modified_count

   print(f"Updated {updated_doc_count} documents.")
   ```

   **Output:**

   ```shell
   Updated 50 documents.
   ```

1) Create a file named `create-embeddings.js` and paste the following code.

   Use the following code to generate embeddings from an existing collection. This code uses the `getEmbedding()` function that you defined and the [Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/) to generate embeddings from an array of sample texts and ingest them into the `sample_db.embeddings` collection.

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section if you defined the function to convert your embeddings to BSON binary format.

   If you defined the `convertEmbeddingsToBSON` function, uncomment lines `3` and `32`-`33`  to convert your embeddings to BSON (Binary Javascript Object Notation) `binData` vectors.

   ```javascript
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';
   // import { convertEmbeddingsToBSON } from './convert-embeddings.js';

   // Data to embed
   const texts = [ 
       "Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
       "The Lion King: Lion cub and future king Simba searches for his identity",
       "Avatar: A marine is dispatched to the moon Pandora on a unique mission"
   ]

   async function run() {

       // Connect to your MongoDB deployment
       const client = new MongoClient(process.env.MONGODB_URI);
       
       try {
           await client.connect();
           const db = client.db("sample_db");
           const collection = db.collection("embeddings");

           console.log("Generating embeddings and inserting documents...");
           const insertDocuments = [];
           await Promise.all(texts.map(async text => {
               // Check if the document already exists
               const existingDoc = await collection.findOne({ text: text });

               // Generate an embedding using the function that you defined
               var embedding = await getEmbedding(text);
               
               // Uncomment the following lines to convert the generated embedding into BSON format
               // const bsonEmbedding = await convertEmbeddingsToBSON([embedding]); // Since convertEmbeddingsToBSON is designed to handle arrays
               // embedding = bsonEmbedding; // Use BSON embedding instead of the original float32 embedding
                         
               // Add the document with the embedding to array of documents for bulk insert
               if (!existingDoc) {
                   insertDocuments.push({
                       text: text,
                       embedding: embedding
                   })
               }
           }));

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

2) Save and run the file.

   ### Open-Source

   ```text
   node --env-file=.env create-embeddings.js
   ```

   **Output:**

   ```sh
   Generating embeddings and inserting documents...
   Count of documents inserted: 3
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Create a file named `create-embeddings.js` and paste the following code.

   Use the following code to generate embeddings from an existing collection. Specifically, this code does the following:

   - Connects to your MongoDB deployment.

   - Gets a subset of documents from the `sample_airbnb.listingsAndReviews` collection that have a non-empty `summary` field.

   - Generates embeddings from each document's `summary` field by using the `getEmbedding()` function that you defined.

   - Updates each document with a new `embedding` field that contains the embedding value by using the MongoDB [Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)

   ###### (Advanced) Compress your embeddings.

   ###### Expand this section if you defined the function to convert your embeddings to BSON binary format.

   If you defined the `convertEmbeddingsToBSON` function, uncomment lines `3` and `29`-`30`  to convert your embeddings to BSON (Binary Javascript Object Notation) `binData` vectors.

   ```javascript
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';
   // import { convertEmbeddingsToBSON } from './convert-embeddings.js';

   async function run() {

       // Connect to your MongoDB deployment
       const client = new MongoClient(process.env.MONGODB_URI);

       try {
           await client.connect();
           const db = client.db("sample_airbnb");
           const collection = db.collection("listingsAndReviews");

           // Filter to exclude null or empty summary fields
           const filter = { "summary": { "$nin": [ null, "" ] } };

           // Get a subset of documents from the collection
           const documents = await collection.find(filter).limit(50).toArray();

           console.log("Generating embeddings and updating documents...");
           const updateDocuments = [];
           await Promise.all(documents.map(async doc => {

               // Generate an embedding using the function that you defined
               var embedding = await getEmbedding(doc.summary);

               // Uncomment the following lines to convert the generated embedding into BSON format
               // const bsonEmbedding = await convertEmbeddingsToBSON([embedding]); // Since convertEmbeddingsToBSON is designed to handle arrays
               // embedding = bsonEmbedding; // Use BSON embedding instead of the original float32 embedding
                
               // Add the embedding to an array of update operations
               updateDocuments.push(
                   {
                       updateOne: { 
                           filter: { "_id": doc._id },
                           update: { $set: { "embedding": embedding } }
                       }
                   }
              )
          }));

          // Continue processing documents if an error occurs during an operation
          const options = { ordered: false };

          // Update documents with the new embedding field
          const result = await collection.bulkWrite(updateDocuments, options); 
          console.log("Count of documents updated: " + result.modifiedCount); 
               
       } catch (err) {
           console.log(err.stack);
       }
       finally {
           await client.close();
       }
   }
   run().catch(console.dir);

   ```

2. Save and run the file.

   ```text
   node --env-file=.env create-embeddings.js
   ```

   **Output:**

   ```sh
   Generating embeddings and updating documents...
   Count of documents updated: 50
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_airbnb.listingsAndReviews` namespace [in the Atlas UI](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections) and expanding the fields in a document.

1) Create a file named `create-embeddings.go` and paste the following code.

   Use the following code to generate embeddings from an existing collection.

   Specifically, this code uses the `GetEmbeddings()` function that you defined and the MongoDB [Go Driver](https://www.mongodb.com/docs/drivers/go/) to generate embeddings from an array of sample texts and ingest them into the `sample_db.embeddings` collection.

   ### Open-Source

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"my-embeddings-project/common"
   	"os"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   var data = []string{
   	"Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
   	"The Lion King: Lion cub and future king Simba searches for his identity",
   	"Avatar: A marine is dispatched to the moon Pandora on a unique mission",
   }

   type TextWithEmbedding struct {
   	Text      string
   	Embedding []float32
   }

   func main() {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
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

   	// Set the namespace
   	coll := client.Database("sample_db").Collection("embeddings")

   	embeddings := common.GetEmbeddings(data)
   	docsToInsert := make([]interface{}, len(embeddings))
   	for i, string := range data {
   		docsToInsert[i] = TextWithEmbedding{
   			Text:      string,
   			Embedding: embeddings[i],
   		}
   	}

   	result, err := coll.InsertMany(ctx, docsToInsert)

   	if err != nil {
   		log.Fatalf("failed to insert documents: %v", err)
   	}
   	fmt.Printf("Successfully inserted %v documents into MongoDB\n", len(result.InsertedIDs))
   }

   ```

2) Save and run the file.

   ### Open-Source

   ```text
   go run create-embeddings.go
   ```

   **Output:**

   ```sh
   Successfully inserted 3 documents
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Create a file named `create-embeddings.go` and paste the following code.

   Use the following code to generate embeddings from an existing collection. Specifically, this code does the following:

   - Connects to your MongoDB deployment.

   - Gets a subset of documents from the `sample_airbnb.listingsAndReviews` collection that have a non-empty `summary` field.

   - Generates embeddings from each document's `summary` field by using the `GetEmbeddings()` function that you defined.

   - Updates each document with a new `embeddings` field that contains the embedding value by using the MongoDB [Go Driver.](https://www.mongodb.com/docs/drivers/go/)

   ```go
   package main

   import (
   	"context"
   	"log"
   	"my-embeddings-project/common"
   	"os"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
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

   	// Set the namespace
   	coll := client.Database("sample_airbnb").Collection("listingsAndReviews")

   	filter := bson.D{
   		{"$and",
   			bson.A{
   				bson.D{
   					{"$and",
   						bson.A{
   							bson.D{{"summary", bson.D{{"$exists", true}}}},
   							bson.D{{"summary", bson.D{{"$ne", ""}}}},
   						},
   					}},
   				bson.D{{"embeddings", bson.D{{"$exists", false}}}},
   			}},
   	}

   	opts := options.Find().SetLimit(50)

   	cursor, err := coll.Find(ctx, filter, opts)
   	if err != nil {
   		log.Fatalf("failed to retrieve documents: %v", err)
   	}

   	var listings []common.Listing
   	if err = cursor.All(ctx, &listings); err != nil {
   		log.Fatalf("failed to unmarshal retrieved documents to Listing object: %v", err)
   	}

   	var summaries []string
   	for _, listing := range listings {
   		summaries = append(summaries, listing.Summary)
   	}

   	log.Println("Generating embeddings.")
   	embeddings := common.GetEmbeddings(summaries)

   	docsToUpdate := make([]mongo.WriteModel, len(listings))
   	for i := range listings {
   		docsToUpdate[i] = mongo.NewUpdateOneModel().
   			SetFilter(bson.D{{"_id", listings[i].ID}}).
   			SetUpdate(bson.D{{"$set", bson.D{{"embeddings", embeddings[i]}}}})
   	}
   	bulkWriteOptions := options.BulkWrite().SetOrdered(false)

   	result, err := coll.BulkWrite(context.Background(), docsToUpdate, bulkWriteOptions)
   	if err != nil {
   		log.Fatalf("failed to write embeddings to existing documents: %v", err)
   	}
   	log.Printf("Successfully added embeddings to %v documents", result.ModifiedCount)
   }

   ```

2. Create a file that contains Go models for the collection.

   To simplify marshalling and unmarshalling Go objects to and from BSON, create a file that contains models for the documents in this collection.

   Move into the `common` directory.

   ```console
   cd common
   ```

   Create a file named `models.go`, and paste the following code into it:

   ### Open-Source

   ```go
   package common

   import (
   	"time"

   	"go.mongodb.org/mongo-driver/v2/bson"
   )

   type Image struct {
   	ThumbnailURL string `bson:"thumbnail_url"`
   	MediumURL    string `bson:"medium_url"`
   	PictureURL   string `bson:"picture_url"`
   	XLPictureURL string `bson:"xl_picture_url"`
   }

   type Host struct {
   	ID                 string   `bson:"host_id"`
   	URL                string   `bson:"host_url"`
   	Name               string   `bson:"host_name"`
   	Location           string   `bson:"host_location"`
   	About              string   `bson:"host_about"`
   	ThumbnailURL       string   `bson:"host_thumbnail_url"`
   	PictureURL         string   `bson:"host_picture_url"`
   	Neighborhood       string   `bson:"host_neighborhood"`
   	IsSuperhost        bool     `bson:"host_is_superhost"`
   	HasProfilePic      bool     `bson:"host_has_profile_pic"`
   	IdentityVerified   bool     `bson:"host_identity_verified"`
   	ListingsCount      int32    `bson:"host_listings_count"`
   	TotalListingsCount int32    `bson:"host_total_listings_count"`
   	Verifications      []string `bson:"host_verifications"`
   }

   type Location struct {
   	Type            string    `bson:"type"`
   	Coordinates     []float64 `bson:"coordinates"`
   	IsLocationExact bool      `bson:"is_location_exact"`
   }

   type Address struct {
   	Street         string   `bson:"street"`
   	Suburb         string   `bson:"suburb"`
   	GovernmentArea string   `bson:"government_area"`
   	Market         string   `bson:"market"`
   	Country        string   `bson:"Country"`
   	CountryCode    string   `bson:"country_code"`
   	Location       Location `bson:"location"`
   }

   type Availability struct {
   	Thirty         int32 `bson:"availability_30"`
   	Sixty          int32 `bson:"availability_60"`
   	Ninety         int32 `bson:"availability_90"`
   	ThreeSixtyFive int32 `bson:"availability_365"`
   }

   type ReviewScores struct {
   	Accuracy      int32 `bson:"review_scores_accuracy"`
   	Cleanliness   int32 `bson:"review_scores_cleanliness"`
   	CheckIn       int32 `bson:"review_scores_checkin"`
   	Communication int32 `bson:"review_scores_communication"`
   	Location      int32 `bson:"review_scores_location"`
   	Value         int32 `bson:"review_scores_value"`
   	Rating        int32 `bson:"review_scores_rating"`
   }

   type Review struct {
   	ID           string    `bson:"_id"`
   	Date         time.Time `bson:"date,omitempty"`
   	ListingId    string    `bson:"listing_id"`
   	ReviewerId   string    `bson:"reviewer_id"`
   	ReviewerName string    `bson:"reviewer_name"`
   	Comments     string    `bson:"comments"`
   }

   type Listing struct {
   	ID                   string          `bson:"_id"`
   	ListingURL           string          `bson:"listing_url"`
   	Name                 string          `bson:"name"`
   	Summary              string          `bson:"summary"`
   	Space                string          `bson:"space"`
   	Description          string          `bson:"description"`
   	NeighborhoodOverview string          `bson:"neighborhood_overview"`
   	Notes                string          `bson:"notes"`
   	Transit              string          `bson:"transit"`
   	Access               string          `bson:"access"`
   	Interaction          string          `bson:"interaction"`
   	HouseRules           string          `bson:"house_rules"`
   	PropertyType         string          `bson:"property_type"`
   	RoomType             string          `bson:"room_type"`
   	BedType              string          `bson:"bed_type"`
   	MinimumNights        string          `bson:"minimum_nights"`
   	MaximumNights        string          `bson:"maximum_nights"`
   	CancellationPolicy   string          `bson:"cancellation_policy"`
   	LastScraped          time.Time       `bson:"last_scraped,omitempty"`
   	CalendarLastScraped  time.Time       `bson:"calendar_last_scraped,omitempty"`
   	FirstReview          time.Time       `bson:"first_review,omitempty"`
   	LastReview           time.Time       `bson:"last_review,omitempty"`
   	Accommodates         int32           `bson:"accommodates"`
   	Bedrooms             int32           `bson:"bedrooms"`
   	Beds                 int32           `bson:"beds"`
   	NumberOfReviews      int32           `bson:"number_of_reviews"`
   	Bathrooms            bson.Decimal128 `bson:"bathrooms"`
   	Amenities            []string        `bson:"amenities"`
   	Price                bson.Decimal128 `bson:"price"`
   	WeeklyPrice          bson.Decimal128 `bson:"weekly_price"`
   	MonthlyPrice         bson.Decimal128 `bson:"monthly_price"`
   	CleaningFee          bson.Decimal128 `bson:"cleaning_fee"`
   	ExtraPeople          bson.Decimal128 `bson:"extra_people"`
   	GuestsIncluded       bson.Decimal128 `bson:"guests_included"`
   	Image                Image           `bson:"images"`
   	Host                 Host            `bson:"host"`
   	Address              Address         `bson:"address"`
   	Availability         Availability    `bson:"availability"`
   	ReviewScores         ReviewScores    `bson:"review_scores"`
   	Reviews              []Review        `bson:"reviews"`
   	Embeddings           []float32       `bson:"embeddings,omitempty"`
   }

   ```

   Move back into the project root directory.

   ```console
   cd ../
   ```

3. Generate embeddings.

   ```text
   go run create-embeddings.go
   ```

   **Output:**

   ```sh
   2024/10/10 09:58:03 Generating embeddings.
   2024/10/10 09:58:12 Successfully added embeddings to 50 documents
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_airbnb.listingsAndReviews` namespace [in the Atlas UI](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections) and expanding the fields in a document.

1) Write a script that generates embeddings from an existing collection.

   Create a file named `CreateEmbeddings.java` and paste the following code.

   This code uses the `getEmbeddings()` method and the MongoDB [Java Sync Driver](https://www.mongodb.com/docs/drivers/java/sync/) to do the following:

   Connect to your MongoDB deployment.

   Get the array of sample texts.

   Generate embeddings from each text using the `getEmbeddings()` method that you defined previously.

   Ingest the embeddings into the `sample_db.embeddings` collection.

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.result.InsertManyResult;
   import org.bson.BsonArray;
   import org.bson.Document;

   import java.util.ArrayList;
   import java.util.Arrays;
   import java.util.List;

   public class CreateEmbeddings {

       static List<String> data = Arrays.asList(
               "Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
               "The Lion King: Lion cub and future king Simba searches for his identity",
               "Avatar: A marine is dispatched to the moon Pandora on a unique mission"
       );

       public static void main(String[] args){
           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new RuntimeException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_db");
               MongoCollection<Document> collection = database.getCollection("embeddings");

               System.out.println("Creating embeddings for " + data.size() + " documents");
               EmbeddingProvider embeddingProvider = new EmbeddingProvider();

               // generate embeddings for new inputted data
               List<BsonArray> embeddings = embeddingProvider.getEmbeddings(data);

               List<Document> documents = new ArrayList<>();
               int i = 0;
               for (String text : data) {
                   Document doc = new Document("text", text).append("embedding", embeddings.get(i));
                   documents.add(doc);
                   i++;
               }

               // insert the embeddings into the MongoDB collection
               List<String> insertedIds = new ArrayList<>();
               try {
                   InsertManyResult result = collection.insertMany(documents);
                   result.getInsertedIds().values()
                           .forEach(doc -> insertedIds.add(doc.toString()));
                   System.out.println("Inserted " + insertedIds.size() + " documents with the following ids to " + collection.getNamespace() + " collection: \n " + insertedIds);
               } catch (MongoException me) {
                   throw new RuntimeException("Failed to insert documents", me);
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

2) Generate the embeddings.

   Save and run the file. The output resembles:

   ```shell
   Creating embeddings for 3 documents
   Inserted 3 documents with the following ids to sample_db.embeddings collection:
    [BsonObjectId{value=6735ff620d88451041f6dd40}, BsonObjectId{value=6735ff620d88451041f6dd41}, BsonObjectId{value=6735ff620d88451041f6dd42}]

   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Write a script that generates embeddings from an existing collection.

   Create a file named `CreateEmbeddings.java` and paste the following code.

   This code uses the `getEmbeddings()` method and the MongoDB [Java Sync Driver](https://www.mongodb.com/docs/drivers/java/sync/) to do the following:

   Connect to your MongoDB deployment.

   Get a subset of documents from the `sample_airbnb.listingsAndReviews` collection that have a non-empty `summary` field.

   Generate embeddings from each document's `summary` field using the `getEmbeddings()` method that you defined previously.

   Update each document with a new `embeddings` field that contains the embedding value.

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.bulk.BulkWriteResult;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoCursor;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.BulkWriteOptions;
   import com.mongodb.client.model.Filters;
   import com.mongodb.client.model.UpdateOneModel;
   import com.mongodb.client.model.Updates;
   import com.mongodb.client.model.WriteModel;
   import org.bson.BsonArray;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.ArrayList;
   import java.util.List;

   public class CreateEmbeddings {

       public static void main(String[] args){

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new RuntimeException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_airbnb");
               MongoCollection<Document> collection = database.getCollection("listingsAndReviews");

               Bson filterCriteria = Filters.and(
                       Filters.and(Filters.exists("summary"),
                               Filters.ne("summary", null),
                               Filters.ne("summary", "")),
                       Filters.exists("embeddings", false));

               try (MongoCursor<Document> cursor = collection.find(filterCriteria).limit(50).iterator()) {
                   List<String> summaries = new ArrayList<>();
                   List<String> documentIds = new ArrayList<>();

                   int i = 0;
                   while (cursor.hasNext()) {
                       Document document = cursor.next();
                       String summary = document.getString("summary");
                       String id = document.get("_id").toString();
                       summaries.add(summary);
                       documentIds.add(id);
                       i++;
                   }

                   System.out.println("Generating embeddings for " + summaries.size() + " documents.");
                   System.out.println("This operation may take up to several minutes.");
                   EmbeddingProvider embeddingProvider = new EmbeddingProvider();
                   List<BsonArray> embeddings = embeddingProvider.getEmbeddings(summaries);

                   List<WriteModel<Document>> updateDocuments = new ArrayList<>();
                   for (int j = 0; j < summaries.size(); j++) {
                       UpdateOneModel<Document> updateDoc = new UpdateOneModel<>(
                               Filters.eq("_id", documentIds.get(j)),
                               Updates.set("embeddings", embeddings.get(j)));
                       updateDocuments.add(updateDoc);
                   }

                   int updatedDocsCount = 0;
                   try {
                       BulkWriteOptions options = new BulkWriteOptions().ordered(false);
                       BulkWriteResult result = collection.bulkWrite(updateDocuments, options);
                       updatedDocsCount = result.getModifiedCount();
                   } catch (MongoException me) {
                       throw new RuntimeException("Failed to insert documents", me);
                   }
                   System.out.println("Added embeddings successfully to " + updatedDocsCount + " documents.");
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

2. Generate the embeddings.

   Save and run the file. The output resembles:

   ```shell
   Generating embeddings for 50 documents.
   This operation may take up to several minutes.
   Added embeddings successfully to 50 documents.

   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_airbnb.listingsAndReviews` namespace [in the Atlas UI](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections) and expanding the fields in a document.

1) Define a `DataService` class.

   Create a new class in a same-named file named `DataService.cs` and paste the following code. This code defines an async Task named `AddDocumentsAsync` add documents to MongoDB. This function uses the [Collection.InsertManyAsync()](https://www.mongodb.com/docs/drivers/csharp/current/crud/insert.md#std-label-csharp-insert-guide) .NET/C# driver method to insert a list of the `BsonDocument` type. Each document contains:

   - A `text` field that contains the movie summary.

   - An `embedding` field that contains the array of floats from generating the vector embeddings.

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_db");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("embeddings");
       
       public async Task AddDocumentsAsync(Dictionary<string, float[]> embeddings)
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
           Console.WriteLine($"Successfully inserted {embeddings.Count} documents");
           documents.Clear();
       }
   }
   ```

2) Update the `Program.cs` in your project.

   Use the following code to generate embeddings from an existing collection.

   Specifically, this code uses the `GetEmbeddingsAsync()` function that you defined to generate embeddings from an array of sample texts and ingest them into the `sample_db.embeddings` collection.

   ```csharp
   using MyCompany.Embeddings;

   var aiService = new AIService();
   var texts = new string[]
   {
       "Titanic: The story of the 1912 sinking of the largest luxury liner ever built",
       "The Lion King: Lion cub and future king Simba searches for his identity",
       "Avatar: A marine is dispatched to the moon Pandora on a unique mission"
   };
   var embeddings = await aiService.GetEmbeddingsAsync(texts);

   var dataService = new DataService();
   await dataService.AddDocumentsAsync(embeddings);

   ```

3) Compile and run your project.

   ```text
   dotnet run MyCompany.Embeddings.csproj
   ```

   **Output:**

   ```sh
   Successfully inserted 3 documents
   ```

   If you're using Atlas, you can verify your vector embeddings by navigating to the `sample_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

**Note:**

This example uses the `sample_airbnb.listingsAndReviews` collection from our [sample data](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-sample-data), but you can adapt the code to work with any collection in your cluster.

1. Define a `DataService` class.

   Create a new class in a same-named file named `DataService.cs` and paste the following code. This code creates two functions that do the following:

   - Connect to your MongoDB deployment.

   - The `GetDocuments` method gets a subset of documents from the `sample_airbnb.listingsAndReviews` collection that have a non-empty `summary` field.

   - The `AddEmbeddings` async Task creates a new `embeddings` field on documents in the `sample_airbnb.listingsAndReviews` collection whose `_id` matches one of the documents retrieved in the `GetDocuments` method.

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_airbnb");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("listingsAndReviews");
       public List<BsonDocument>? GetDocuments()
       {
           var filter = Builders<BsonDocument>.Filter.And(
               Builders<BsonDocument>.Filter.And(
                   Builders<BsonDocument>.Filter.Exists("summary", true),
                   Builders<BsonDocument>.Filter.Ne("summary", "")
               ),
               Builders<BsonDocument>.Filter.Exists("embeddings", false)
           );
           return Collection.Find(filter).Limit(50).ToList(); 
       }
       public async Task<long> AddEmbeddings(Dictionary<string, float[]> embeddings)
       {
           var listWrites = new List<WriteModel<BsonDocument>>();
           foreach( var kvp in embeddings )
           {
               var filterForUpdate = Builders<BsonDocument>.Filter.Eq("summary", kvp.Key);
               var updateDefinition = Builders<BsonDocument>.Update.Set("embeddings", kvp.Value);
               listWrites.Add(new UpdateOneModel<BsonDocument>(filterForUpdate, updateDefinition));
           }
           var result = await Collection.BulkWriteAsync(listWrites);
           listWrites.Clear();
           return result.ModifiedCount;
       }
   }
   ```

2. Update the `Program.cs` in your project.

   Use the following code to generate embeddings from an existing MongoDB collection.

   Specifically, this code uses the `GetEmbeddingsAsync()` function that you defined to generate embeddings from an array of sample texts and ingest them into the `sample_db.embeddings` collection.

   ```csharp
   using MyCompany.Embeddings;

   var dataService = new DataService();
   var documents = dataService.GetDocuments();

   if (documents != null)
   {
       Console.WriteLine("Generating embeddings.");
       var aiService = new AIService();
       var summaries = new List<string>();
       foreach (var document in documents)
       {
           var summary = document.GetValue("summary").ToString();
           if (summary != null)
           {
               summaries.Add(summary);
           }
       }
       
       try
       {
           if (summaries.Count > 0)
           {
               var embeddings = await aiService.GetEmbeddingsAsync(summaries.ToArray());
           
               try
               {
                   var updatedCount = await dataService.AddEmbeddings(embeddings);
                   Console.WriteLine($"{updatedCount} documents updated successfully.");
               } catch (Exception e)
               {
                   Console.WriteLine($"Error adding embeddings to MongoDB: {e.Message}");
               }
           }
       }
       catch (Exception e)
       {
           Console.WriteLine($"Error creating embeddings for summaries: {e.Message}");
       }
   }
   else
   {
       Console.WriteLine("No documents found");
   }

   ```

3. Compile and run your project.

   ```text
   dotnet run MyCompany.Embeddings.csproj
   ```

   **Output:**

   ```sh
   Generating embeddings.
   50 documents updated successfully.
   ```

### Create Embeddings for Queries

In this section, you index the vector embeddings in your collection and create an embedding that you use to run a sample vector search query.

The vector search returns documents whose embeddings are closest in distance to the embedding from your query. This indicates that they are similar in meaning.

1. Create the vector search index.

   To enable vector search queries on your data, you must create a MongoDB Vector Search index on your collection.

   Paste the following code in your notebook.

   ```python
   from pymongo.operations import SearchIndexModel

   # Create your index model, then create the search index
   search_index_model = SearchIndexModel(
     definition = {
       "fields": [
         {
           "type": "vector",
           "path": "embedding",
           "similarity": "dotProduct",
           "numDimensions": <dimensions>
         }
       ]
     },
     name="vector_index",
     type="vectorSearch"
   )
   collection.create_search_index(model=search_index_model)
   ```

   Replace the `<dimensions>` placeholder with one of the following values:

   - `768` if you used `nomic-embed-text-v1`

   - `1024` if you used `voyage-4-large`

   - `1536` if you used `text-embedding-3-small`

   Run the code.

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for a vector search query, then run the query.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   **Note:**

   The query might take some time to complete. Your results might vary depending on the embedding model and whether you compressed your embeddings.

   ### Open-Source

   ```python
   # Generate embedding for the search query
   query_embedding = get_embedding("ocean tragedy")

   # Sample vector search pipeline
   pipeline = [
      {
         "$vectorSearch": {
               "index": "vector_index",
               "queryVector": query_embedding,
               "path": "embedding",
               "exact": True,
               "limit": 5
         }
      }, 
      {
         "$project": {
            "_id": 0, 
            "text": 1,
            "score": {
               "$meta": "vectorSearchScore"
            }
         }
      }
   ]

   # Execute the search
   results = collection.aggregate(pipeline)

   # Print results
   for i in results:
      print(i)

   ```

   **Output:**

   ```shell
   {'data': 'Titanic: The story of the 1912 sinking of the largest luxury liner ever built', 'score': 0.7661112546920776}
   {'data': 'Avatar: A marine is dispatched to the moon Pandora on a unique mission', 'score': 0.7050272822380066}
   {'data': 'The Shawshank Redemption: A banker is sentenced to life in Shawshank State Penitentiary for the murders of his wife and her lover.', 'score': 0.7024770379066467}
   {'data': 'Jurassic Park: Scientists clone dinosaurs to populate an island theme park, which soon goes awry.', 'score': 0.7011005282402039}
   {'data': 'E.T. the Extra-Terrestrial: A young boy befriends an alien stranded on Earth and helps him return home.', 'score': 0.6877288222312927}
   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a MongoDB Vector Search index on your collection.

   Paste the following code in your notebook.

   ```python
   from pymongo.operations import SearchIndexModel

   # Create your index model, then create the search index
   search_index_model = SearchIndexModel(
     definition = {
       "fields": [
         {
           "type": "vector",
           "path": "embedding",
           "similarity": "dotProduct",
           "numDimensions": <dimensions>
         }
       ]
     },
     name="vector_index",
     type="vectorSearch"
   )
   collection.create_search_index(model=search_index_model)
   ```

   Replace the `<dimensions>` placeholder with one of the following values:

   - `768` if you used `nomic-embed-text-v1`

   - `1024` if you used `voyage-4-large`

   - `1536` if you used `text-embedding-3-small`

   Run the code.

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   **Note:**

   The query might take some time to complete. Your results might vary depending on the embedding model and whether you compressed your embeddings.

   ### Open-Source

   ```python
   # Generate embedding for the search query
   query_embedding = get_embedding("beach house")

   # Sample vector search pipeline
   pipeline = [
      {
         "$vectorSearch": {
               "index": "vector_index",
               "queryVector": query_embedding,
               "path": "embedding",
               "exact": True,
               "limit": 5
         }
      }, 
      {
         "$project": {
            "_id": 0, 
            "summary": 1,
            "score": {
               "$meta": "vectorSearchScore"
            }
         }
      }
   ]

   # Execute the search
   results = collection.aggregate(pipeline)

   # Print results
   for i in results:
      print(i)

   ```

   **Output:**

   ```shell
   {'summary': 'Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.', 'score': 0.7847104072570801}
   {'summary': 'The Apartment has a living room, toilet, bedroom (suite) and American kitchen. Well located, on the Copacabana beach block a 05 Min. walk from Ipanema beach (Arpoador). Internet wifi, cable tv, air conditioning in the bedroom, ceiling fans in the bedroom and living room, kitchen with microwave, cooker, Blender, dishes, cutlery and service area with fridge, washing machine, clothesline for drying clothes and closet with several utensils for use.  The property boasts 45 m2.', 'score': 0.7780507802963257}
   {'summary': "A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.", 'score': 0.7723637223243713}
   {'summary': 'Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.', 'score': 0.7665778398513794}
   {'summary': 'A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.', 'score': 0.7593404650688171}

   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_db.embeddings` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Create a file named named `create-index.js` and paste the following code.

   ```js
   import { MongoClient } from 'mongodb';

   // connect to your MongoDB deployment
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
      try {
        const database = client.db("sample_db");
        const collection = database.collection("embeddings");
       
        // define your MongoDB Vector Search index
        const index = {
            name: "vector_index",
            type: "vectorSearch",
            definition: {
              "fields": [
                {
                  "type": "vector",
                  "path": "embedding",
                  "similarity": "dotProduct",
                  "numDimensions": <dimensions>
                }
              ]
            }
        }
        // run the helper method
        const result = await collection.createSearchIndex(index);
        console.log(result);
      } finally {
        await client.close();
      }
   }
   run().catch(console.dir);
   ```

   Replace the `<dimensions>` placeholder with one of the following values:

   - `768` if you used `nomic-embed-text-v1`

   - `1024` if you used `voyage-3-large`

   - `1536` if you used `text-embedding-3-small`

   Save the file, then run the following command:

   ```text
   node --env-file=.env create-index.js
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for vector search queries and run a query.

   Create a file named named `vector-query.js` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```js
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';

   // MongoDB connection URI and options
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
       try {
           // Connect to the MongoDB client
           await client.connect();

           // Specify the database and collection
           const database = client.db("sample_db"); 
           const collection = database.collection("embeddings"); 

           // Generate embedding for the search query
           const queryEmbedding = await getEmbedding("ocean tragedy");

           // Define the sample vector search pipeline
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
                       text: 1,
                       score: {
                           $meta: "vectorSearchScore"
                       }
                   }
               }
           ];

           // run pipeline
           const result = collection.aggregate(pipeline);

           // print results
           for await (const doc of result) {
               console.dir(JSON.stringify(doc));
           }
           } finally {
           await client.close();
       }
   }
   run().catch(console.dir);
   ```

   Save the file, then run the following command:

   **Note:**

   The query might take some time to complete. Your results might vary depending on the embedding model and whether you compressed your embeddings.

   ### Open-Source

   ```text
   node --env-file=.env vector-query.js
   ```

   **Output:**

   ```shell
   '{"text":"Titanic: The story of the 1912 sinking of the largest luxury liner ever built","score":0.5103757977485657}'
   '{"text":"Avatar: A marine is dispatched to the moon Pandora on a unique mission","score":0.4616812467575073}'
   '{"text":"The Lion King: Lion cub and future king Simba searches for his identity","score":0.4115804433822632}'
   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_airbnb.listingsAndReviews` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Create a file named named `create-index.js` and paste the following code.

   ```js
   import { MongoClient } from 'mongodb';

   // connect to your MongoDB deployment
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
     try {
       const database = client.db("sample_airbnb");
       const collection = database.collection("listingsAndReviews");
      
       // Define your MongoDB Vector Search index
       const index = {
           name: "vector_index",
           type: "vectorSearch",
           definition: {
             "fields": [
               {
                 "type": "vector",
                 "path": "embedding",
                 "similarity": "dotProduct",
                 "numDimensions": <dimensions>
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

   Replace the `<dimensions>` placeholder with one of the following values:

   - `768` if you used `nomic-embed-text-v1`

   - `1024` if you used `voyage-3-large`

   - `1536` if you used `text-embedding-3-small`

   Save the file, then run the following command:

   ```text
   node --env-file=.env create-index.js
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   Create a file named named `vector-query.js` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```js
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';

   // MongoDB connection URI and options
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
       try {
           // Connect to the MongoDB client
           await client.connect();

           // Specify the database and collection
           const database = client.db("sample_airbnb"); 
           const collection = database.collection("listingsAndReviews"); 

           // Generate embedding for the search query
           const queryEmbedding = await getEmbedding("beach house");

           // Define the sample vector search pipeline
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
                       summary: 1,
                       score: {
                           $meta: "vectorSearchScore"
                       }
                   }
               }
           ];

           // run pipeline
           const result = collection.aggregate(pipeline);

           // print results
           for await (const doc of result) {
               console.dir(JSON.stringify(doc));
           }
           } finally {
           await client.close();
       }
   }
   run().catch(console.dir);
   ```

   Save the file, then run the following command:

   **Note:**

   The query might take some time to complete. Your results might vary depending on the embedding model and whether you compressed your embeddings.

   ### Open-Source

   ```text
   node --env-file=.env vector-query.js
   ```

   **Output:**

   ```shell
   '{"summary":"Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.","score":0.5334879159927368}'
   '{"summary":"A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.","score":0.5240535736083984}'
   '{"summary":"The Apartment has a living room, toilet, bedroom (suite) and American kitchen. Well located, on the Copacabana beach block a 05 Min. walk from Ipanema beach (Arpoador). Internet wifi, cable tv, air conditioning in the bedroom, ceiling fans in the bedroom and living room, kitchen with microwave, cooker, Blender, dishes, cutlery and service area with fridge, washing machine, clothesline for drying clothes and closet with several utensils for use.  The property boasts 45 m2.","score":0.5232879519462585}'
   '{"summary":"Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.","score":0.5186381340026855}'
   '{"summary":"A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.","score":0.5078228116035461}'

   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_db.embeddings` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Create a file named named `create-index.go` and paste the following code.

   ```go
   package main
   import (
   	"context"
   	"fmt"
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
   		log.Println("no .env file found")
   	}
   	// Connect to your MongoDB deployment
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
   	// Set the namespace
   	coll := client.Database("sample_db").Collection("embeddings")
   	indexName := "vector_index"
   	opts := options.SearchIndexes().SetName(indexName).SetType("vectorSearch")
   	type vectorDefinitionField struct {
   		Type          string `bson:"type"`
   		Path          string `bson:"path"`
   		NumDimensions int    `bson:"numDimensions"`
   		Similarity    string `bson:"similarity"`
   	}
   	type vectorDefinition struct {
   		Fields []vectorDefinitionField `bson:"fields"`
   	}
   	indexModel := mongo.SearchIndexModel{
   		Definition: vectorDefinition{
   			Fields: []vectorDefinitionField{{
   				Type:          "vector",
   				Path:          "embedding",
   				NumDimensions: 3072,
   				Similarity:    "dotProduct"}},
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
   	searchIndexes := coll.SearchIndexes()
   	var doc bson.Raw
   	for doc == nil {
   		cursor, err := searchIndexes.List(ctx, options.SearchIndexes().SetName(searchIndexName))
   		if err != nil {
   			fmt.Errorf("failed to list search indexes: %w", err)
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

   Replace the `<dimensions>` placeholder value with `1024` if you used Voyage AI or the open-source model and `1536` if you used the model from OpenAI.

   Save the file, then run the following command:

   ```text
   go run create-index.go
   ```

   **Output:**

   ```text
   2024/10/09 17:38:51 Creating the index.
   2024/10/09 17:38:52 Polling to confirm successful index creation.
   2024/10/09 17:39:22 Name of Index Created: vector_index
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for vector search queries and run a query.

   Create a file named named `vector-query.go` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ### Open-Source

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"my-embeddings-project/common"
   	"os"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   type TextAndScore struct {
   	Text  string  `bson:"text"`
   	Score float32 `bson:"score"`
   }

   func main() {
   	ctx := context.Background()

   	// Connect to your MongoDB deployment
   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
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

   	// Set the namespace
   	coll := client.Database("sample_db").Collection("embeddings")

   	query := "ocean tragedy"
   	queryEmbedding := common.GetEmbeddings([]string{query})

   	pipeline := mongo.Pipeline{
   		bson.D{
   			{"$vectorSearch", bson.D{
   				{"queryVector", queryEmbedding[0]},
   				{"index", "vector_index"},
   				{"path", "embedding"},
   				{"exact", true},
   				{"limit", 5},
   			}},
   		},
   		bson.D{
   			{"$project", bson.D{
   				{"_id", 0},
   				{"text", 1},
   				{"score", bson.D{
   					{"$meta", "vectorSearchScore"},
   				}},
   			}},
   		},
   	}

   	// Run the pipeline
   	cursor, err := coll.Aggregate(ctx, pipeline)
   	if err != nil {
   		log.Fatalf("failed to run aggregation: %v", err)
   	}
   	defer func() { _ = cursor.Close(ctx) }()

   	var matchingDocs []TextAndScore
   	if err = cursor.All(ctx, &matchingDocs); err != nil {
   		log.Fatalf("failed to unmarshal results to TextAndScore objects: %v", err)
   	}
   	for _, doc := range matchingDocs {
   		fmt.Printf("Text: %v\nScore: %v\n", doc.Text, doc.Score)
   	}
   }

   ```

   Save the file, then run the following command:

   ### Open-Source

   ```text
   go run vector-query.go
   ```

   **Output:**

   ```shell
   Text: Titanic: The story of the 1912 sinking of the largest luxury liner ever built
   Score: 0.0042472864
   Text: Avatar: A marine is dispatched to the moon Pandora on a unique mission
   Score: 0.0031167597
   Text: The Lion King: Lion cub and future king Simba searches for his identity
   Score: 0.0024476869

   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_airbnb.listingsAndReviews` collection that specifies the `embeddings` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `euclidean`.

   Create a file named named `create-index.go` and paste the following code.

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"os"
   	"time"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/bson"
   	"go.mongodb.org/mongo-driver/mongo"
   	"go.mongodb.org/mongo-driver/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
   	uri := os.Getenv("MONGODB_URI")
   	if uri == "" {
   		log.Fatal("set your 'MONGODB_URI' environment variable.")
   	}
   	clientOptions := options.Client().ApplyURI(uri)
   	client, err := mongo.Connect(ctx, clientOptions)
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	// Set the namespace
   	coll := client.Database("sample_airbnb").Collection("listingsAndReviews")
   	indexName := "vector_index"
   	opts := options.SearchIndexes().SetName(indexName).SetType("vectorSearch")

   	type vectorDefinitionField struct {
   		Type          string `bson:"type"`
   		Path          string `bson:"path"`
   		NumDimensions int    `bson:"numDimensions"`
   		Similarity    string `bson:"similarity"`
   	}

   	type vectorDefinition struct {
   		Fields []vectorDefinitionField `bson:"fields"`
   	}

   	indexModel := mongo.SearchIndexModel{
   		Definition: vectorDefinition{
   			Fields: []vectorDefinitionField{{
   				Type:          "vector",
   				Path:          "embeddings",
   				NumDimensions: <dimensions>,
   				Similarity:    "dotProduct"}},
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
   	searchIndexes := coll.SearchIndexes()
   	var doc bson.Raw
   	for doc == nil {
   		cursor, err := searchIndexes.List(ctx, options.SearchIndexes().SetName(searchIndexName))
   		if err != nil {
   			fmt.Errorf("failed to list search indexes: %w", err)
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

   Replace the `<dimensions>` placeholder value with `1024` if you used Voyage AI or the open-source model and `1536` if you used the model from OpenAI.

   Save the file, then run the following command:

   ```text
   go run create-index.go
   ```

   **Output:**

   ```text
   2024/10/10 10:03:12 Creating the index.
   2024/10/10 10:03:13 Polling to confirm successful index creation.
   2024/10/10 10:03:44 Name of Index Created: vector_index
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   Create a file named named `vector-query.go` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ### Open-Source

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"my-embeddings-project/common"
   	"os"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/bson"
   	"go.mongodb.org/mongo-driver/mongo"
   	"go.mongodb.org/mongo-driver/mongo/options"
   )

   type SummaryAndScore struct {
   	Summary string  `bson:"summary"`
   	Score   float32 `bson:"score"`
   }

   func main() {
   	ctx := context.Background()

   	// Connect to your MongoDB deployment
   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
   	uri := os.Getenv("MONGODB_URI")
   	if uri == "" {
   		log.Fatal("set your 'MONGODB_URI' environment variable.")
   	}
   	clientOptions := options.Client().ApplyURI(uri)
   	client, err := mongo.Connect(ctx, clientOptions)
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	// Set the namespace
   	coll := client.Database("sample_airbnb").Collection("listingsAndReviews")

   	query := "beach house"
   	queryEmbedding := common.GetEmbeddings([]string{query})

   	pipeline := mongo.Pipeline{
   		bson.D{
   			{"$vectorSearch", bson.D{
   				{"queryVector", queryEmbedding[0]},
   				{"index", "vector_index"},
   				{"path", "embeddings"},
   				{"exact", true},
   				{"limit", 5},
   			}},
   		},
   		bson.D{
   			{"$project", bson.D{
   				{"_id", 0},
   				{"summary", 1},
   				{"score", bson.D{
   					{"$meta", "vectorSearchScore"},
   				}},
   			}},
   		},
   	}

   	// Run the pipeline
   	cursor, err := coll.Aggregate(ctx, pipeline)
   	if err != nil {
   		log.Fatalf("failed to run aggregation: %v", err)
   	}
   	defer func() { _ = cursor.Close(ctx) }()

   	var matchingDocs []SummaryAndScore
   	if err = cursor.All(ctx, &matchingDocs); err != nil {
   		log.Fatalf("failed to unmarshal results to SummaryAndScore objects: %v", err)
   	}
   	for _, doc := range matchingDocs {
   		fmt.Printf("Summary: %v\nScore: %v\n", doc.Summary, doc.Score)
   	}
   }

   ```

   Save the file, then run the following command:

   ### Open-Source

   ```text
   go run vector-query.go
   ```

   **Output:**

   ```shell
   Summary: Near to underground metro station. Walking distance to seaside. 2 floors 1 entry. Husband, wife, girl and boy is living.
   Score: 0.0045180833
   Summary: A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.
   Score: 0.004480799
   Summary: Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.
   Score: 0.0042421296
   Summary: Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.
   Score: 0.004227752
   Summary: A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.
   Score: 0.0042201905

   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_db.embeddings` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Create a file named `CreateIndex.java` and paste the following code:

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

   public class CreateIndex {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_db");
               MongoCollection<Document> collection = database.getCollection("embeddings");

               // define the index details
               String indexName = "vector_index";
               int dimensionsHuggingFaceModel = 1024;
               int dimensionsOpenAiModel = 1536;

               Bson definition = new Document(
                       "fields",
                       Collections.singletonList(
                                       new Document("type", "vector")
                                               .append("path", "embedding")
                                               .append("numDimensions", <dimensions>) // replace with var for the model used
                               .append("similarity", "dotProduct")));

               // define the index model using the specified details
               SearchIndexModel indexModel = new SearchIndexModel(
                       indexName,
                       definition,
                       SearchIndexType.vectorSearch());

               // Create the index using the model
               try {
                   List<String> result = collection.createSearchIndexes(Collections.singletonList(indexModel));
                   System.out.println("Successfully created a vector index named: " + result);
               } catch (Exception e) {
                   throw new RuntimeException(e);
               }

               // wait for index to build and become queryable
               System.out.println("Polling to confirm the index has completed building.");
               System.out.println("It may take up to a minute for the index to build before you can query using it.");

               ListSearchIndexesIterable<Document> searchIndexes = collection.listSearchIndexes();
               Document doc = null;
               while (doc == null) {
                   try (MongoCursor<Document> cursor = searchIndexes.iterator()) {
                       if (!cursor.hasNext()) {
                           break;
                       }
                       Document current = cursor.next();
                       String name = current.getString("name");
                       boolean queryable = current.getBoolean("queryable");
                       if (name.equals(indexName) && queryable) {
                           doc = current;
                       } else {
                           Thread.sleep(500);
                       }
                   }  catch (Exception e) {
                       throw new RuntimeException(e);
                   }
               }
               System.out.println(indexName + " index is ready to query");

           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

   Replace the `<dimensions>` placeholder value with the appropriate variable for the model you used:

   - `dimensionsHuggingFaceModel`: `1024` dimensions ("mixedbread-ai/mxbai-embed-large-v1" model)

   - `dimensionsVoyageAiModel`: `1024` dimensions ("voyage-4-large" model)

   - `dimensionsOpenAiModel`: `1536` dimensions ("text-embedding-3-small" model)

   **Note:**

   The number of dimensions is determined by the model used to generate the embeddings. If you adapt this code to use a different model, ensure that you pass the correct value to `numDimensions`. See also the [Choosing an Embedding Model](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-choose-embedding-model) section.

   Save and run the file. The output resembles:

   ```shell
   Successfully created a vector index named: [vector_index]
   Polling to confirm the index has completed building.
   It may take up to a minute for the index to build before you can query using it.
   vector_index index is ready to query

   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for vector search queries and run a query.

   Create a file named named `VectorQuery.java` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.search.FieldSearchPath;
   import org.bson.BsonArray;
   import org.bson.BsonValue;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.ArrayList;
   import java.util.List;

   import static com.mongodb.client.model.Aggregates.project;
   import static com.mongodb.client.model.Aggregates.vectorSearch;
   import static com.mongodb.client.model.Projections.exclude;
   import static com.mongodb.client.model.Projections.fields;
   import static com.mongodb.client.model.Projections.include;
   import static com.mongodb.client.model.Projections.metaVectorSearchScore;
   import static com.mongodb.client.model.search.SearchPath.fieldPath;
   import static com.mongodb.client.model.search.VectorSearchOptions.exactVectorSearchOptions;
   import static java.util.Arrays.asList;

   public class VectorQuery {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_db");
               MongoCollection<Document> collection = database.getCollection("embeddings");

               // define $vectorSearch query options
               String query = "ocean tragedy";
               EmbeddingProvider embeddingProvider = new EmbeddingProvider();
               BsonArray embeddingBsonArray = embeddingProvider.getEmbedding(query);

               List<Double> embedding = new ArrayList<>();
               for (BsonValue value : embeddingBsonArray.stream().toList()) {
                   embedding.add(value.asDouble().getValue());
               }

               // define $vectorSearch pipeline
               String indexName = "vector_index";
               FieldSearchPath fieldSearchPath = fieldPath("embedding");
               int limit = 5;

               List<Bson> pipeline = asList(
                       vectorSearch(
                               fieldSearchPath,
                               embedding,
                               indexName,
                               limit,
                               exactVectorSearchOptions()
                       ),
                       project(
                               fields(exclude("_id"), include("text"),
                                       metaVectorSearchScore("score"))));

               // run query and print results
               List<Document> results = collection.aggregate(pipeline).into(new ArrayList<>());

               if (results.isEmpty()) {
                   System.out.println("No results found.");
               } else {
                   results.forEach(doc -> {
                       System.out.println("Text: " + doc.getString("text"));
                       System.out.println("Score: " + doc.getDouble("score"));
                   });
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }


   ```

   Save and run the file. The output resembles one of the following, depending on the model you used:

   ### Open-Source

   ```shell
   Text: Titanic: The story of the 1912 sinking of the largest luxury liner ever built
   Score: 0.004247286356985569
   Text: Avatar: A marine is dispatched to the moon Pandora on a unique mission
   Score: 0.003116759704425931
   Text: The Lion King: Lion cub and future king Simba searches for his identity
   Score: 0.002447686856612563

   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_airbnb.listingsAndReviews` collection that specifies the `embeddings` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `euclidean`.

   Create a file named `CreateIndex.java` and paste the following code:

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.ListSearchIndexesIterable;
   import com.mongodb.client.MongoCursor;
   import com.mongodb.client.model.SearchIndexModel;
   import com.mongodb.client.model.SearchIndexType;
   import org.bson.Document;
   import org.bson.conversions.Bson;
   import java.util.Collections;
   import java.util.List;

   public class CreateIndex {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");

           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_airbnb");
               MongoCollection<Document> collection = database.getCollection("listingsAndReviews");

               // define the index details
               String indexName = "vector_index";
               int dimensionsHuggingFaceModel = 1024;
               int dimensionsOpenAiModel = 1536;

               Bson definition = new Document(
                       "fields",
                       Collections.singletonList(
                               new Document("type", "vector")
                                       .append("path", "embeddings")
                                       .append("numDimensions", <dimensions>) // replace with var for the model used
                                       .append("similarity", "dotProduct")));

               // define the index model using the specified details
               SearchIndexModel indexModel = new SearchIndexModel(
                       indexName,
                       definition,
                       SearchIndexType.vectorSearch());

               // create the index using the model
               try {
                   List<String> result = collection.createSearchIndexes(Collections.singletonList(indexModel));
                   System.out.println("Successfully created a vector index named: " + result);
                   System.out.println("It may take up to a minute for the index to build before you can query using it.");
               } catch (Exception e) {
                   throw new RuntimeException(e);
               }

               // wait for index to build and become queryable
               System.out.println("Polling to confirm the index has completed building.");

               ListSearchIndexesIterable<Document> searchIndexes = collection.listSearchIndexes();
               Document doc = null;
               while (doc == null) {
                   try (MongoCursor<Document> cursor = searchIndexes.iterator()) {
                       if (!cursor.hasNext()) {
                           break;
                       }
                       Document current = cursor.next();
                       String name = current.getString("name");
                       boolean queryable = current.getBoolean("queryable");
                       if (name.equals(indexName) && queryable) {
                           doc = current;
                       } else {
                           Thread.sleep(500);
                       }
                   }  catch (Exception e) {
                       throw new RuntimeException(e);
                   }
               }
               System.out.println(indexName + " index is ready to query");

           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

   Replace the `<dimensions>` placeholder value with the appropriate variable for the model you used:

   - `dimensionsHuggingFaceModel`: `1024` dimensions (open-source)

   - `dimensionsVoyageAiModel`: `1024` dimensions (Voyage AI)

   - `dimensionsOpenAiModel`: `1536` dimensions

   **Note:**

   The number of dimensions is determined by the model used to generate the embeddings. If you are using a different model, ensure that you pass the correct value to `numDimensions`. See also the [Choosing an Embedding Model](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-choose-embedding-model) section.

   Save and run the file. The output resembles:

   ```shell
   Successfully created a vector index named: [vector_index]
   Polling to confirm the index has completed building.
   It may take up to a minute for the index to build before you can query using it.
   vector_index index is ready to query

   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   Create a file named named `VectorQuery.java` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.search.FieldSearchPath;
   import org.bson.BsonArray;
   import org.bson.BsonValue;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.ArrayList;
   import java.util.List;

   import static com.mongodb.client.model.Aggregates.project;
   import static com.mongodb.client.model.Aggregates.vectorSearch;
   import static com.mongodb.client.model.Projections.exclude;
   import static com.mongodb.client.model.Projections.fields;
   import static com.mongodb.client.model.Projections.include;
   import static com.mongodb.client.model.Projections.metaVectorSearchScore;
   import static com.mongodb.client.model.search.SearchPath.fieldPath;
   import static com.mongodb.client.model.search.VectorSearchOptions.exactVectorSearchOptions;
   import static java.util.Arrays.asList;

   public class VectorQuery {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_airbnb");
               MongoCollection<Document> collection = database.getCollection("listingsAndReviews");

               // define the query and get the embedding
               String query = "beach house";
               EmbeddingProvider embeddingProvider = new EmbeddingProvider();
               BsonArray embeddingBsonArray = embeddingProvider.getEmbedding(query);

               List<Double> embedding = new ArrayList<>();
               for (BsonValue value : embeddingBsonArray.stream().toList()) {
                   embedding.add(value.asDouble().getValue());
               }

               // define $vectorSearch pipeline
               String indexName = "vector_index";
               FieldSearchPath fieldSearchPath = fieldPath("embeddings");
               int limit = 5;

               List<Bson> pipeline = asList(
                       vectorSearch(
                               fieldSearchPath,
                               embedding,
                               indexName,
                               limit,
                               exactVectorSearchOptions()),
                       project(
                               fields(exclude("_id"), include("summary"),
                                       metaVectorSearchScore("score"))));

               // run query and print results
               List<Document> results = collection.aggregate(pipeline).into(new ArrayList<>());

               if (results.isEmpty()) {
                   System.out.println("No results found.");
               } else {
                   results.forEach(doc -> {
                       System.out.println("Summary: " + doc.getString("summary"));
                       System.out.println("Score: " + doc.getDouble("score"));
                   });
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

   Save and run the file. The output resembles one of the following, depending on the model you used:

   ### Open-Source

   ```shell
   Summary: Near to underground metro station. Walking distance to seaside. 2 floors 1 entry. Husband, wife, girl and boy is living.
   Score: 0.004518083296716213
   Summary: A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.
   Score: 0.0044807991944253445
   Summary: Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.
   Score: 0.004242129623889923
   Summary: Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.
   Score: 0.004227751865983009
   Summary: A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.
   Score: 0.004220190457999706

   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_db.embeddings` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Paste the following code to add a `CreateVectorIndex` function to your `DataService` class in `DataService.cs`.

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_db");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("embeddings");
       
       public async Task AddDocumentsAsync(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }
       
       public void CreateVectorIndex()
       {
           try
           {
               var searchIndexView = Collection.SearchIndexes;
               var name = "vector_index";

               var model = new CreateVectorSearchIndexModel<Document>(
                   d => d.Embedding,
                   name,
                   VectorSimilarity.DotProduct,
                   <dimensions>);

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
               Console.WriteLine($"{name} is ready for querying.");
           }
           catch (Exception e)
           {
               Console.WriteLine($"Exception: {e.Message}");
           }
       }
   }
   ```

   Replace the `<dimensions>` placeholder value with `1024` if you used Voyage AI or the open-source model and `1536` if you used the model from OpenAI.

   Update the code in your `Program.cs`.

   Remove the code that populated the initial documents, and replace it with the following code to create the index:

   ```csharp
   using MyCompany.Embeddings;

   var dataService = new DataService();
   dataService.CreateVectorIndex();

   ```

   Save the file, and then compile and run your project to create the index:

   ```text
   dotnet run MyCompany.Embeddings
   ```

   **Output:**

   ```text
   New search index named vector_index is building.
   Polling to check if the index is ready. This may take up to a minute.
   vector_index is ready for querying.
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for vector search queries and run a query.

   Paste the following code to add a `PerformVectorQuery` function to your `DataService` class in `DataService.cs`.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_db");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("embeddings");
       
       public async Task AddDocumentsAsync(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }
       
       public void CreateVectorIndex()
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

   Update the code in your `Program.cs`.

   Remove the code that created the vector index, and add code to perform a query:

   ```csharp
   using MongoDB.Bson;
   using MyCompany.Embeddings;

   var aiService = new AIService();
   var queryString = "ocean tragedy";
   var queryEmbedding = await aiService.GetEmbeddingsAsync([queryString]);

   if (!queryEmbedding.Any())
   {
       Console.WriteLine("No embeddings found.");
   }
   else
   {
       var dataService = new DataService();
       var matchingDocuments = dataService.PerformVectorQuery(queryEmbedding[queryString]);
       if (matchingDocuments == null)
       {
           Console.WriteLine("No documents matched the query.");
       }
       else
       {
           foreach (var document in matchingDocuments)
           {
               Console.WriteLine(document.ToJson());
           }
       }
   }

   ```

   Save the file, and then compile and run your project to perform the query:

   ```text
   dotnet run MyCompany.Embeddings.csproj
   ```

   **Output:**

   ```shell
   { "text" : "Titanic: The story of the 1912 sinking of the largest luxury liner ever built", "score" : 100.17414855957031 }
   { "text" : "Avatar: A marine is dispatched to the moon Pandora on a unique mission", "score" : 65.705635070800781 }
   { "text" : "The Lion King: Lion cub and future king Simba searches for his identity", "score" : 52.486415863037109 }

   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_airbnb.listingsAndReviews` collection that specifies the `embeddings` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `euclidean`.

   Paste the following code to add the `CreateVectorIndex` function to your `DataService` class in `DataService.cs`.

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_airbnb");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("listingsAndReviews");
       public List<BsonDocument>? GetDocuments()
       {
           // Method details...
       }
       public async Task<long> AddEmbeddings(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }

       public void CreateVectorIndex()
       {
           try
           {
               var searchIndexView = Collection.SearchIndexes;
               var name = "vector_index";

               var model = new CreateVectorSearchIndexModel<Listing>(
                   l => l.Embeddings,
                   name,
                   VectorSimilarity.DotProduct,
                   <dimensions>);

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
               Console.WriteLine($"{name} is ready for querying.");
           }
           catch (Exception e)
           {
               Console.WriteLine($"Exception: {e.Message}");
           }
       }
   }
   ```

   Replace the `<dimensions>` placeholder value with `1024` if you used Voyage AI or the open-source model and `1536` if you used the model from OpenAI.

   Update the code in your `Program.cs`.

   Remove the code that added embeddings to the existing documents, and replace it with the following code to create the index:

   ```csharp
   using MyCompany.Embeddings;

   var dataService = new DataService();
   dataService.CreateVectorIndex();

   ```

   Save the file, and then compile and run your project to create the index:

   ```text
   dotnet run MyCompany.Embeddings
   ```

   **Output:**

   ```text
   New search index named vector_index is building.
   Polling to check if the index is ready. This may take up to a minute.
   vector_index is ready for querying.
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   Paste the following code to add a `PerformVectorQuery` function to your `DataService` class in `DataService.cs`.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_airbnb");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("listingsAndReviews");
       public List<BsonDocument>? GetDocuments()
       {
           // Method details...
       }
       public async Task<long> AddEmbeddings(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }

       public void CreateVectorIndex()
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
                       { "path", "embeddings" },
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
                       { "summary", 1 },
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

   Update the code in your `Program.cs`.

   Remove the code that created the vector index, and add code to perform a query:

   ```csharp
   using MongoDB.Bson;
   using MyCompany.Embeddings;

   var aiService = new AIService();
   var queryString = "beach house";
   var queryEmbedding = await aiService.GetEmbeddingsAsync([queryString]);

   if (!queryEmbedding.Any())
   {
       Console.WriteLine("No embeddings found.");
   }
   else
   {
       var dataService = new DataService();
       var matchingDocuments = dataService.PerformVectorQuery(queryEmbedding[queryString]);
       if (matchingDocuments == null)
       {
           Console.WriteLine("No documents matched the query.");
       }
       else
       {
           foreach (var document in matchingDocuments)
           {
               Console.WriteLine(document.ToJson());
           }
       }
   }

   ```

   Save the file, and then compile and run your project to perform the query:

   ```text
   dotnet run MyCompany.Embeddings.csproj
   ```

   **Output:**

   ```shell
   { "summary" : "Near to underground metro station. Walking distance to seaside. 2 floors 1 entry. Husband, wife, girl and boy is living.", "score" : 88.884147644042969 }
   { "summary" : "A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.", "score" : 86.136398315429688 }
   { "summary" : "Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.", "score" : 86.087783813476562 }
   { "summary" : "Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.", "score" : 85.689559936523438 }
   { "summary" : "Fully furnished 3+1 flat decorated with vintage style.  Located at the heart of Moda/Kadıköy, close to seaside and also to the public transportation (tram, metro, ferry, bus stations) 10 minutes walk.", "score" : 85.614166259765625 }
   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a MongoDB Vector Search index on your collection.

   Paste the following code in your notebook.

   ```python
   from pymongo.operations import SearchIndexModel

   # Create your index model, then create the search index
   search_index_model = SearchIndexModel(
     definition = {
       "fields": [
         {
           "type": "vector",
           "path": "embedding",
           "similarity": "dotProduct",
           "numDimensions": <dimensions>
         }
       ]
     },
     name="vector_index",
     type="vectorSearch"
   )
   collection.create_search_index(model=search_index_model)
   ```

   Replace the `<dimensions>` placeholder with one of the following values:

   - `768` if you used `nomic-embed-text-v1`

   - `1024` if you used `voyage-4-large`

   - `1536` if you used `text-embedding-3-small`

   Run the code.

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for a vector search query, then run the query.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   **Note:**

   The query might take some time to complete. Your results might vary depending on the embedding model and whether you compressed your embeddings.

   ### Open-Source

   ```python
   # Generate embedding for the search query
   query_embedding = get_embedding("ocean tragedy")

   # Sample vector search pipeline
   pipeline = [
      {
         "$vectorSearch": {
               "index": "vector_index",
               "queryVector": query_embedding,
               "path": "embedding",
               "exact": True,
               "limit": 5
         }
      }, 
      {
         "$project": {
            "_id": 0, 
            "text": 1,
            "score": {
               "$meta": "vectorSearchScore"
            }
         }
      }
   ]

   # Execute the search
   results = collection.aggregate(pipeline)

   # Print results
   for i in results:
      print(i)

   ```

   **Output:**

   ```shell
   {'data': 'Titanic: The story of the 1912 sinking of the largest luxury liner ever built', 'score': 0.7661112546920776}
   {'data': 'Avatar: A marine is dispatched to the moon Pandora on a unique mission', 'score': 0.7050272822380066}
   {'data': 'The Shawshank Redemption: A banker is sentenced to life in Shawshank State Penitentiary for the murders of his wife and her lover.', 'score': 0.7024770379066467}
   {'data': 'Jurassic Park: Scientists clone dinosaurs to populate an island theme park, which soon goes awry.', 'score': 0.7011005282402039}
   {'data': 'E.T. the Extra-Terrestrial: A young boy befriends an alien stranded on Earth and helps him return home.', 'score': 0.6877288222312927}
   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a MongoDB Vector Search index on your collection.

   Paste the following code in your notebook.

   ```python
   from pymongo.operations import SearchIndexModel

   # Create your index model, then create the search index
   search_index_model = SearchIndexModel(
     definition = {
       "fields": [
         {
           "type": "vector",
           "path": "embedding",
           "similarity": "dotProduct",
           "numDimensions": <dimensions>
         }
       ]
     },
     name="vector_index",
     type="vectorSearch"
   )
   collection.create_search_index(model=search_index_model)
   ```

   Replace the `<dimensions>` placeholder with one of the following values:

   - `768` if you used `nomic-embed-text-v1`

   - `1024` if you used `voyage-4-large`

   - `1536` if you used `text-embedding-3-small`

   Run the code.

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   **Note:**

   The query might take some time to complete. Your results might vary depending on the embedding model and whether you compressed your embeddings.

   ### Open-Source

   ```python
   # Generate embedding for the search query
   query_embedding = get_embedding("beach house")

   # Sample vector search pipeline
   pipeline = [
      {
         "$vectorSearch": {
               "index": "vector_index",
               "queryVector": query_embedding,
               "path": "embedding",
               "exact": True,
               "limit": 5
         }
      }, 
      {
         "$project": {
            "_id": 0, 
            "summary": 1,
            "score": {
               "$meta": "vectorSearchScore"
            }
         }
      }
   ]

   # Execute the search
   results = collection.aggregate(pipeline)

   # Print results
   for i in results:
      print(i)

   ```

   **Output:**

   ```shell
   {'summary': 'Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.', 'score': 0.7847104072570801}
   {'summary': 'The Apartment has a living room, toilet, bedroom (suite) and American kitchen. Well located, on the Copacabana beach block a 05 Min. walk from Ipanema beach (Arpoador). Internet wifi, cable tv, air conditioning in the bedroom, ceiling fans in the bedroom and living room, kitchen with microwave, cooker, Blender, dishes, cutlery and service area with fridge, washing machine, clothesline for drying clothes and closet with several utensils for use.  The property boasts 45 m2.', 'score': 0.7780507802963257}
   {'summary': "A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.", 'score': 0.7723637223243713}
   {'summary': 'Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.', 'score': 0.7665778398513794}
   {'summary': 'A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.', 'score': 0.7593404650688171}

   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_db.embeddings` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Create a file named named `create-index.js` and paste the following code.

   ```js
   import { MongoClient } from 'mongodb';

   // connect to your MongoDB deployment
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
      try {
        const database = client.db("sample_db");
        const collection = database.collection("embeddings");
       
        // define your MongoDB Vector Search index
        const index = {
            name: "vector_index",
            type: "vectorSearch",
            definition: {
              "fields": [
                {
                  "type": "vector",
                  "path": "embedding",
                  "similarity": "dotProduct",
                  "numDimensions": <dimensions>
                }
              ]
            }
        }
        // run the helper method
        const result = await collection.createSearchIndex(index);
        console.log(result);
      } finally {
        await client.close();
      }
   }
   run().catch(console.dir);
   ```

   Replace the `<dimensions>` placeholder with one of the following values:

   - `768` if you used `nomic-embed-text-v1`

   - `1024` if you used `voyage-3-large`

   - `1536` if you used `text-embedding-3-small`

   Save the file, then run the following command:

   ```text
   node --env-file=.env create-index.js
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for vector search queries and run a query.

   Create a file named named `vector-query.js` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```js
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';

   // MongoDB connection URI and options
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
       try {
           // Connect to the MongoDB client
           await client.connect();

           // Specify the database and collection
           const database = client.db("sample_db"); 
           const collection = database.collection("embeddings"); 

           // Generate embedding for the search query
           const queryEmbedding = await getEmbedding("ocean tragedy");

           // Define the sample vector search pipeline
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
                       text: 1,
                       score: {
                           $meta: "vectorSearchScore"
                       }
                   }
               }
           ];

           // run pipeline
           const result = collection.aggregate(pipeline);

           // print results
           for await (const doc of result) {
               console.dir(JSON.stringify(doc));
           }
           } finally {
           await client.close();
       }
   }
   run().catch(console.dir);
   ```

   Save the file, then run the following command:

   **Note:**

   The query might take some time to complete. Your results might vary depending on the embedding model and whether you compressed your embeddings.

   ### Open-Source

   ```text
   node --env-file=.env vector-query.js
   ```

   **Output:**

   ```shell
   '{"text":"Titanic: The story of the 1912 sinking of the largest luxury liner ever built","score":0.5103757977485657}'
   '{"text":"Avatar: A marine is dispatched to the moon Pandora on a unique mission","score":0.4616812467575073}'
   '{"text":"The Lion King: Lion cub and future king Simba searches for his identity","score":0.4115804433822632}'
   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_airbnb.listingsAndReviews` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Create a file named named `create-index.js` and paste the following code.

   ```js
   import { MongoClient } from 'mongodb';

   // connect to your MongoDB deployment
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
     try {
       const database = client.db("sample_airbnb");
       const collection = database.collection("listingsAndReviews");
      
       // Define your MongoDB Vector Search index
       const index = {
           name: "vector_index",
           type: "vectorSearch",
           definition: {
             "fields": [
               {
                 "type": "vector",
                 "path": "embedding",
                 "similarity": "dotProduct",
                 "numDimensions": <dimensions>
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

   Replace the `<dimensions>` placeholder with one of the following values:

   - `768` if you used `nomic-embed-text-v1`

   - `1024` if you used `voyage-3-large`

   - `1536` if you used `text-embedding-3-small`

   Save the file, then run the following command:

   ```text
   node --env-file=.env create-index.js
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   Create a file named named `vector-query.js` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```js
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';

   // MongoDB connection URI and options
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
       try {
           // Connect to the MongoDB client
           await client.connect();

           // Specify the database and collection
           const database = client.db("sample_airbnb"); 
           const collection = database.collection("listingsAndReviews"); 

           // Generate embedding for the search query
           const queryEmbedding = await getEmbedding("beach house");

           // Define the sample vector search pipeline
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
                       summary: 1,
                       score: {
                           $meta: "vectorSearchScore"
                       }
                   }
               }
           ];

           // run pipeline
           const result = collection.aggregate(pipeline);

           // print results
           for await (const doc of result) {
               console.dir(JSON.stringify(doc));
           }
           } finally {
           await client.close();
       }
   }
   run().catch(console.dir);
   ```

   Save the file, then run the following command:

   **Note:**

   The query might take some time to complete. Your results might vary depending on the embedding model and whether you compressed your embeddings.

   ### Open-Source

   ```text
   node --env-file=.env vector-query.js
   ```

   **Output:**

   ```shell
   '{"summary":"Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.","score":0.5334879159927368}'
   '{"summary":"A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.","score":0.5240535736083984}'
   '{"summary":"The Apartment has a living room, toilet, bedroom (suite) and American kitchen. Well located, on the Copacabana beach block a 05 Min. walk from Ipanema beach (Arpoador). Internet wifi, cable tv, air conditioning in the bedroom, ceiling fans in the bedroom and living room, kitchen with microwave, cooker, Blender, dishes, cutlery and service area with fridge, washing machine, clothesline for drying clothes and closet with several utensils for use.  The property boasts 45 m2.","score":0.5232879519462585}'
   '{"summary":"Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.","score":0.5186381340026855}'
   '{"summary":"A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.","score":0.5078228116035461}'

   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_db.embeddings` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Create a file named named `create-index.go` and paste the following code.

   ```go
   package main
   import (
   	"context"
   	"fmt"
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
   		log.Println("no .env file found")
   	}
   	// Connect to your MongoDB deployment
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
   	// Set the namespace
   	coll := client.Database("sample_db").Collection("embeddings")
   	indexName := "vector_index"
   	opts := options.SearchIndexes().SetName(indexName).SetType("vectorSearch")
   	type vectorDefinitionField struct {
   		Type          string `bson:"type"`
   		Path          string `bson:"path"`
   		NumDimensions int    `bson:"numDimensions"`
   		Similarity    string `bson:"similarity"`
   	}
   	type vectorDefinition struct {
   		Fields []vectorDefinitionField `bson:"fields"`
   	}
   	indexModel := mongo.SearchIndexModel{
   		Definition: vectorDefinition{
   			Fields: []vectorDefinitionField{{
   				Type:          "vector",
   				Path:          "embedding",
   				NumDimensions: 3072,
   				Similarity:    "dotProduct"}},
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
   	searchIndexes := coll.SearchIndexes()
   	var doc bson.Raw
   	for doc == nil {
   		cursor, err := searchIndexes.List(ctx, options.SearchIndexes().SetName(searchIndexName))
   		if err != nil {
   			fmt.Errorf("failed to list search indexes: %w", err)
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

   Replace the `<dimensions>` placeholder value with `1024` if you used Voyage AI or the open-source model and `1536` if you used the model from OpenAI.

   Save the file, then run the following command:

   ```text
   go run create-index.go
   ```

   **Output:**

   ```text
   2024/10/09 17:38:51 Creating the index.
   2024/10/09 17:38:52 Polling to confirm successful index creation.
   2024/10/09 17:39:22 Name of Index Created: vector_index
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for vector search queries and run a query.

   Create a file named named `vector-query.go` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ### Open-Source

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"my-embeddings-project/common"
   	"os"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   type TextAndScore struct {
   	Text  string  `bson:"text"`
   	Score float32 `bson:"score"`
   }

   func main() {
   	ctx := context.Background()

   	// Connect to your MongoDB deployment
   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
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

   	// Set the namespace
   	coll := client.Database("sample_db").Collection("embeddings")

   	query := "ocean tragedy"
   	queryEmbedding := common.GetEmbeddings([]string{query})

   	pipeline := mongo.Pipeline{
   		bson.D{
   			{"$vectorSearch", bson.D{
   				{"queryVector", queryEmbedding[0]},
   				{"index", "vector_index"},
   				{"path", "embedding"},
   				{"exact", true},
   				{"limit", 5},
   			}},
   		},
   		bson.D{
   			{"$project", bson.D{
   				{"_id", 0},
   				{"text", 1},
   				{"score", bson.D{
   					{"$meta", "vectorSearchScore"},
   				}},
   			}},
   		},
   	}

   	// Run the pipeline
   	cursor, err := coll.Aggregate(ctx, pipeline)
   	if err != nil {
   		log.Fatalf("failed to run aggregation: %v", err)
   	}
   	defer func() { _ = cursor.Close(ctx) }()

   	var matchingDocs []TextAndScore
   	if err = cursor.All(ctx, &matchingDocs); err != nil {
   		log.Fatalf("failed to unmarshal results to TextAndScore objects: %v", err)
   	}
   	for _, doc := range matchingDocs {
   		fmt.Printf("Text: %v\nScore: %v\n", doc.Text, doc.Score)
   	}
   }

   ```

   Save the file, then run the following command:

   ### Open-Source

   ```text
   go run vector-query.go
   ```

   **Output:**

   ```shell
   Text: Titanic: The story of the 1912 sinking of the largest luxury liner ever built
   Score: 0.0042472864
   Text: Avatar: A marine is dispatched to the moon Pandora on a unique mission
   Score: 0.0031167597
   Text: The Lion King: Lion cub and future king Simba searches for his identity
   Score: 0.0024476869

   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_airbnb.listingsAndReviews` collection that specifies the `embeddings` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `euclidean`.

   Create a file named named `create-index.go` and paste the following code.

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"os"
   	"time"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/bson"
   	"go.mongodb.org/mongo-driver/mongo"
   	"go.mongodb.org/mongo-driver/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
   	uri := os.Getenv("MONGODB_URI")
   	if uri == "" {
   		log.Fatal("set your 'MONGODB_URI' environment variable.")
   	}
   	clientOptions := options.Client().ApplyURI(uri)
   	client, err := mongo.Connect(ctx, clientOptions)
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	// Set the namespace
   	coll := client.Database("sample_airbnb").Collection("listingsAndReviews")
   	indexName := "vector_index"
   	opts := options.SearchIndexes().SetName(indexName).SetType("vectorSearch")

   	type vectorDefinitionField struct {
   		Type          string `bson:"type"`
   		Path          string `bson:"path"`
   		NumDimensions int    `bson:"numDimensions"`
   		Similarity    string `bson:"similarity"`
   	}

   	type vectorDefinition struct {
   		Fields []vectorDefinitionField `bson:"fields"`
   	}

   	indexModel := mongo.SearchIndexModel{
   		Definition: vectorDefinition{
   			Fields: []vectorDefinitionField{{
   				Type:          "vector",
   				Path:          "embeddings",
   				NumDimensions: <dimensions>,
   				Similarity:    "dotProduct"}},
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
   	searchIndexes := coll.SearchIndexes()
   	var doc bson.Raw
   	for doc == nil {
   		cursor, err := searchIndexes.List(ctx, options.SearchIndexes().SetName(searchIndexName))
   		if err != nil {
   			fmt.Errorf("failed to list search indexes: %w", err)
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

   Replace the `<dimensions>` placeholder value with `1024` if you used Voyage AI or the open-source model and `1536` if you used the model from OpenAI.

   Save the file, then run the following command:

   ```text
   go run create-index.go
   ```

   **Output:**

   ```text
   2024/10/10 10:03:12 Creating the index.
   2024/10/10 10:03:13 Polling to confirm successful index creation.
   2024/10/10 10:03:44 Name of Index Created: vector_index
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   Create a file named named `vector-query.go` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ### Open-Source

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"my-embeddings-project/common"
   	"os"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/bson"
   	"go.mongodb.org/mongo-driver/mongo"
   	"go.mongodb.org/mongo-driver/mongo/options"
   )

   type SummaryAndScore struct {
   	Summary string  `bson:"summary"`
   	Score   float32 `bson:"score"`
   }

   func main() {
   	ctx := context.Background()

   	// Connect to your MongoDB deployment
   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
   	uri := os.Getenv("MONGODB_URI")
   	if uri == "" {
   		log.Fatal("set your 'MONGODB_URI' environment variable.")
   	}
   	clientOptions := options.Client().ApplyURI(uri)
   	client, err := mongo.Connect(ctx, clientOptions)
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	// Set the namespace
   	coll := client.Database("sample_airbnb").Collection("listingsAndReviews")

   	query := "beach house"
   	queryEmbedding := common.GetEmbeddings([]string{query})

   	pipeline := mongo.Pipeline{
   		bson.D{
   			{"$vectorSearch", bson.D{
   				{"queryVector", queryEmbedding[0]},
   				{"index", "vector_index"},
   				{"path", "embeddings"},
   				{"exact", true},
   				{"limit", 5},
   			}},
   		},
   		bson.D{
   			{"$project", bson.D{
   				{"_id", 0},
   				{"summary", 1},
   				{"score", bson.D{
   					{"$meta", "vectorSearchScore"},
   				}},
   			}},
   		},
   	}

   	// Run the pipeline
   	cursor, err := coll.Aggregate(ctx, pipeline)
   	if err != nil {
   		log.Fatalf("failed to run aggregation: %v", err)
   	}
   	defer func() { _ = cursor.Close(ctx) }()

   	var matchingDocs []SummaryAndScore
   	if err = cursor.All(ctx, &matchingDocs); err != nil {
   		log.Fatalf("failed to unmarshal results to SummaryAndScore objects: %v", err)
   	}
   	for _, doc := range matchingDocs {
   		fmt.Printf("Summary: %v\nScore: %v\n", doc.Summary, doc.Score)
   	}
   }

   ```

   Save the file, then run the following command:

   ### Open-Source

   ```text
   go run vector-query.go
   ```

   **Output:**

   ```shell
   Summary: Near to underground metro station. Walking distance to seaside. 2 floors 1 entry. Husband, wife, girl and boy is living.
   Score: 0.0045180833
   Summary: A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.
   Score: 0.004480799
   Summary: Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.
   Score: 0.0042421296
   Summary: Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.
   Score: 0.004227752
   Summary: A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.
   Score: 0.0042201905

   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_db.embeddings` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Create a file named `CreateIndex.java` and paste the following code:

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

   public class CreateIndex {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_db");
               MongoCollection<Document> collection = database.getCollection("embeddings");

               // define the index details
               String indexName = "vector_index";
               int dimensionsHuggingFaceModel = 1024;
               int dimensionsOpenAiModel = 1536;

               Bson definition = new Document(
                       "fields",
                       Collections.singletonList(
                                       new Document("type", "vector")
                                               .append("path", "embedding")
                                               .append("numDimensions", <dimensions>) // replace with var for the model used
                               .append("similarity", "dotProduct")));

               // define the index model using the specified details
               SearchIndexModel indexModel = new SearchIndexModel(
                       indexName,
                       definition,
                       SearchIndexType.vectorSearch());

               // Create the index using the model
               try {
                   List<String> result = collection.createSearchIndexes(Collections.singletonList(indexModel));
                   System.out.println("Successfully created a vector index named: " + result);
               } catch (Exception e) {
                   throw new RuntimeException(e);
               }

               // wait for index to build and become queryable
               System.out.println("Polling to confirm the index has completed building.");
               System.out.println("It may take up to a minute for the index to build before you can query using it.");

               ListSearchIndexesIterable<Document> searchIndexes = collection.listSearchIndexes();
               Document doc = null;
               while (doc == null) {
                   try (MongoCursor<Document> cursor = searchIndexes.iterator()) {
                       if (!cursor.hasNext()) {
                           break;
                       }
                       Document current = cursor.next();
                       String name = current.getString("name");
                       boolean queryable = current.getBoolean("queryable");
                       if (name.equals(indexName) && queryable) {
                           doc = current;
                       } else {
                           Thread.sleep(500);
                       }
                   }  catch (Exception e) {
                       throw new RuntimeException(e);
                   }
               }
               System.out.println(indexName + " index is ready to query");

           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

   Replace the `<dimensions>` placeholder value with the appropriate variable for the model you used:

   - `dimensionsHuggingFaceModel`: `1024` dimensions ("mixedbread-ai/mxbai-embed-large-v1" model)

   - `dimensionsVoyageAiModel`: `1024` dimensions ("voyage-4-large" model)

   - `dimensionsOpenAiModel`: `1536` dimensions ("text-embedding-3-small" model)

   **Note:**

   The number of dimensions is determined by the model used to generate the embeddings. If you adapt this code to use a different model, ensure that you pass the correct value to `numDimensions`. See also the [Choosing an Embedding Model](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-choose-embedding-model) section.

   Save and run the file. The output resembles:

   ```shell
   Successfully created a vector index named: [vector_index]
   Polling to confirm the index has completed building.
   It may take up to a minute for the index to build before you can query using it.
   vector_index index is ready to query

   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for vector search queries and run a query.

   Create a file named named `VectorQuery.java` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.search.FieldSearchPath;
   import org.bson.BsonArray;
   import org.bson.BsonValue;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.ArrayList;
   import java.util.List;

   import static com.mongodb.client.model.Aggregates.project;
   import static com.mongodb.client.model.Aggregates.vectorSearch;
   import static com.mongodb.client.model.Projections.exclude;
   import static com.mongodb.client.model.Projections.fields;
   import static com.mongodb.client.model.Projections.include;
   import static com.mongodb.client.model.Projections.metaVectorSearchScore;
   import static com.mongodb.client.model.search.SearchPath.fieldPath;
   import static com.mongodb.client.model.search.VectorSearchOptions.exactVectorSearchOptions;
   import static java.util.Arrays.asList;

   public class VectorQuery {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_db");
               MongoCollection<Document> collection = database.getCollection("embeddings");

               // define $vectorSearch query options
               String query = "ocean tragedy";
               EmbeddingProvider embeddingProvider = new EmbeddingProvider();
               BsonArray embeddingBsonArray = embeddingProvider.getEmbedding(query);

               List<Double> embedding = new ArrayList<>();
               for (BsonValue value : embeddingBsonArray.stream().toList()) {
                   embedding.add(value.asDouble().getValue());
               }

               // define $vectorSearch pipeline
               String indexName = "vector_index";
               FieldSearchPath fieldSearchPath = fieldPath("embedding");
               int limit = 5;

               List<Bson> pipeline = asList(
                       vectorSearch(
                               fieldSearchPath,
                               embedding,
                               indexName,
                               limit,
                               exactVectorSearchOptions()
                       ),
                       project(
                               fields(exclude("_id"), include("text"),
                                       metaVectorSearchScore("score"))));

               // run query and print results
               List<Document> results = collection.aggregate(pipeline).into(new ArrayList<>());

               if (results.isEmpty()) {
                   System.out.println("No results found.");
               } else {
                   results.forEach(doc -> {
                       System.out.println("Text: " + doc.getString("text"));
                       System.out.println("Score: " + doc.getDouble("score"));
                   });
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }


   ```

   Save and run the file. The output resembles one of the following, depending on the model you used:

   ### Open-Source

   ```shell
   Text: Titanic: The story of the 1912 sinking of the largest luxury liner ever built
   Score: 0.004247286356985569
   Text: Avatar: A marine is dispatched to the moon Pandora on a unique mission
   Score: 0.003116759704425931
   Text: The Lion King: Lion cub and future king Simba searches for his identity
   Score: 0.002447686856612563

   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_airbnb.listingsAndReviews` collection that specifies the `embeddings` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `euclidean`.

   Create a file named `CreateIndex.java` and paste the following code:

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.ListSearchIndexesIterable;
   import com.mongodb.client.MongoCursor;
   import com.mongodb.client.model.SearchIndexModel;
   import com.mongodb.client.model.SearchIndexType;
   import org.bson.Document;
   import org.bson.conversions.Bson;
   import java.util.Collections;
   import java.util.List;

   public class CreateIndex {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");

           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_airbnb");
               MongoCollection<Document> collection = database.getCollection("listingsAndReviews");

               // define the index details
               String indexName = "vector_index";
               int dimensionsHuggingFaceModel = 1024;
               int dimensionsOpenAiModel = 1536;

               Bson definition = new Document(
                       "fields",
                       Collections.singletonList(
                               new Document("type", "vector")
                                       .append("path", "embeddings")
                                       .append("numDimensions", <dimensions>) // replace with var for the model used
                                       .append("similarity", "dotProduct")));

               // define the index model using the specified details
               SearchIndexModel indexModel = new SearchIndexModel(
                       indexName,
                       definition,
                       SearchIndexType.vectorSearch());

               // create the index using the model
               try {
                   List<String> result = collection.createSearchIndexes(Collections.singletonList(indexModel));
                   System.out.println("Successfully created a vector index named: " + result);
                   System.out.println("It may take up to a minute for the index to build before you can query using it.");
               } catch (Exception e) {
                   throw new RuntimeException(e);
               }

               // wait for index to build and become queryable
               System.out.println("Polling to confirm the index has completed building.");

               ListSearchIndexesIterable<Document> searchIndexes = collection.listSearchIndexes();
               Document doc = null;
               while (doc == null) {
                   try (MongoCursor<Document> cursor = searchIndexes.iterator()) {
                       if (!cursor.hasNext()) {
                           break;
                       }
                       Document current = cursor.next();
                       String name = current.getString("name");
                       boolean queryable = current.getBoolean("queryable");
                       if (name.equals(indexName) && queryable) {
                           doc = current;
                       } else {
                           Thread.sleep(500);
                       }
                   }  catch (Exception e) {
                       throw new RuntimeException(e);
                   }
               }
               System.out.println(indexName + " index is ready to query");

           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

   Replace the `<dimensions>` placeholder value with the appropriate variable for the model you used:

   - `dimensionsHuggingFaceModel`: `1024` dimensions (open-source)

   - `dimensionsVoyageAiModel`: `1024` dimensions (Voyage AI)

   - `dimensionsOpenAiModel`: `1536` dimensions

   **Note:**

   The number of dimensions is determined by the model used to generate the embeddings. If you are using a different model, ensure that you pass the correct value to `numDimensions`. See also the [Choosing an Embedding Model](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-choose-embedding-model) section.

   Save and run the file. The output resembles:

   ```shell
   Successfully created a vector index named: [vector_index]
   Polling to confirm the index has completed building.
   It may take up to a minute for the index to build before you can query using it.
   vector_index index is ready to query

   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   Create a file named named `VectorQuery.java` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.search.FieldSearchPath;
   import org.bson.BsonArray;
   import org.bson.BsonValue;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.ArrayList;
   import java.util.List;

   import static com.mongodb.client.model.Aggregates.project;
   import static com.mongodb.client.model.Aggregates.vectorSearch;
   import static com.mongodb.client.model.Projections.exclude;
   import static com.mongodb.client.model.Projections.fields;
   import static com.mongodb.client.model.Projections.include;
   import static com.mongodb.client.model.Projections.metaVectorSearchScore;
   import static com.mongodb.client.model.search.SearchPath.fieldPath;
   import static com.mongodb.client.model.search.VectorSearchOptions.exactVectorSearchOptions;
   import static java.util.Arrays.asList;

   public class VectorQuery {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_airbnb");
               MongoCollection<Document> collection = database.getCollection("listingsAndReviews");

               // define the query and get the embedding
               String query = "beach house";
               EmbeddingProvider embeddingProvider = new EmbeddingProvider();
               BsonArray embeddingBsonArray = embeddingProvider.getEmbedding(query);

               List<Double> embedding = new ArrayList<>();
               for (BsonValue value : embeddingBsonArray.stream().toList()) {
                   embedding.add(value.asDouble().getValue());
               }

               // define $vectorSearch pipeline
               String indexName = "vector_index";
               FieldSearchPath fieldSearchPath = fieldPath("embeddings");
               int limit = 5;

               List<Bson> pipeline = asList(
                       vectorSearch(
                               fieldSearchPath,
                               embedding,
                               indexName,
                               limit,
                               exactVectorSearchOptions()),
                       project(
                               fields(exclude("_id"), include("summary"),
                                       metaVectorSearchScore("score"))));

               // run query and print results
               List<Document> results = collection.aggregate(pipeline).into(new ArrayList<>());

               if (results.isEmpty()) {
                   System.out.println("No results found.");
               } else {
                   results.forEach(doc -> {
                       System.out.println("Summary: " + doc.getString("summary"));
                       System.out.println("Score: " + doc.getDouble("score"));
                   });
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

   Save and run the file. The output resembles one of the following, depending on the model you used:

   ### Open-Source

   ```shell
   Summary: Near to underground metro station. Walking distance to seaside. 2 floors 1 entry. Husband, wife, girl and boy is living.
   Score: 0.004518083296716213
   Summary: A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.
   Score: 0.0044807991944253445
   Summary: Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.
   Score: 0.004242129623889923
   Summary: Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.
   Score: 0.004227751865983009
   Summary: A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.
   Score: 0.004220190457999706

   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_db.embeddings` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Paste the following code to add a `CreateVectorIndex` function to your `DataService` class in `DataService.cs`.

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_db");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("embeddings");
       
       public async Task AddDocumentsAsync(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }
       
       public void CreateVectorIndex()
       {
           try
           {
               var searchIndexView = Collection.SearchIndexes;
               var name = "vector_index";

               var model = new CreateVectorSearchIndexModel<Document>(
                   d => d.Embedding,
                   name,
                   VectorSimilarity.DotProduct,
                   <dimensions>);

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
               Console.WriteLine($"{name} is ready for querying.");
           }
           catch (Exception e)
           {
               Console.WriteLine($"Exception: {e.Message}");
           }
       }
   }
   ```

   Replace the `<dimensions>` placeholder value with `1024` if you used Voyage AI or the open-source model and `1536` if you used the model from OpenAI.

   Update the code in your `Program.cs`.

   Remove the code that populated the initial documents, and replace it with the following code to create the index:

   ```csharp
   using MyCompany.Embeddings;

   var dataService = new DataService();
   dataService.CreateVectorIndex();

   ```

   Save the file, and then compile and run your project to create the index:

   ```text
   dotnet run MyCompany.Embeddings
   ```

   **Output:**

   ```text
   New search index named vector_index is building.
   Polling to check if the index is ready. This may take up to a minute.
   vector_index is ready for querying.
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for vector search queries and run a query.

   Paste the following code to add a `PerformVectorQuery` function to your `DataService` class in `DataService.cs`.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_db");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("embeddings");
       
       public async Task AddDocumentsAsync(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }
       
       public void CreateVectorIndex()
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

   Update the code in your `Program.cs`.

   Remove the code that created the vector index, and add code to perform a query:

   ```csharp
   using MongoDB.Bson;
   using MyCompany.Embeddings;

   var aiService = new AIService();
   var queryString = "ocean tragedy";
   var queryEmbedding = await aiService.GetEmbeddingsAsync([queryString]);

   if (!queryEmbedding.Any())
   {
       Console.WriteLine("No embeddings found.");
   }
   else
   {
       var dataService = new DataService();
       var matchingDocuments = dataService.PerformVectorQuery(queryEmbedding[queryString]);
       if (matchingDocuments == null)
       {
           Console.WriteLine("No documents matched the query.");
       }
       else
       {
           foreach (var document in matchingDocuments)
           {
               Console.WriteLine(document.ToJson());
           }
       }
   }

   ```

   Save the file, and then compile and run your project to perform the query:

   ```text
   dotnet run MyCompany.Embeddings.csproj
   ```

   **Output:**

   ```shell
   { "text" : "Titanic: The story of the 1912 sinking of the largest luxury liner ever built", "score" : 100.17414855957031 }
   { "text" : "Avatar: A marine is dispatched to the moon Pandora on a unique mission", "score" : 65.705635070800781 }
   { "text" : "The Lion King: Lion cub and future king Simba searches for his identity", "score" : 52.486415863037109 }

   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_airbnb.listingsAndReviews` collection that specifies the `embeddings` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `euclidean`.

   Paste the following code to add the `CreateVectorIndex` function to your `DataService` class in `DataService.cs`.

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_airbnb");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("listingsAndReviews");
       public List<BsonDocument>? GetDocuments()
       {
           // Method details...
       }
       public async Task<long> AddEmbeddings(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }

       public void CreateVectorIndex()
       {
           try
           {
               var searchIndexView = Collection.SearchIndexes;
               var name = "vector_index";

               var model = new CreateVectorSearchIndexModel<Listing>(
                   l => l.Embeddings,
                   name,
                   VectorSimilarity.DotProduct,
                   <dimensions>);

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
               Console.WriteLine($"{name} is ready for querying.");
           }
           catch (Exception e)
           {
               Console.WriteLine($"Exception: {e.Message}");
           }
       }
   }
   ```

   Replace the `<dimensions>` placeholder value with `1024` if you used Voyage AI or the open-source model and `1536` if you used the model from OpenAI.

   Update the code in your `Program.cs`.

   Remove the code that added embeddings to the existing documents, and replace it with the following code to create the index:

   ```csharp
   using MyCompany.Embeddings;

   var dataService = new DataService();
   dataService.CreateVectorIndex();

   ```

   Save the file, and then compile and run your project to create the index:

   ```text
   dotnet run MyCompany.Embeddings
   ```

   **Output:**

   ```text
   New search index named vector_index is building.
   Polling to check if the index is ready. This may take up to a minute.
   vector_index is ready for querying.
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   Paste the following code to add a `PerformVectorQuery` function to your `DataService` class in `DataService.cs`.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_airbnb");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("listingsAndReviews");
       public List<BsonDocument>? GetDocuments()
       {
           // Method details...
       }
       public async Task<long> AddEmbeddings(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }

       public void CreateVectorIndex()
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
                       { "path", "embeddings" },
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
                       { "summary", 1 },
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

   Update the code in your `Program.cs`.

   Remove the code that created the vector index, and add code to perform a query:

   ```csharp
   using MongoDB.Bson;
   using MyCompany.Embeddings;

   var aiService = new AIService();
   var queryString = "beach house";
   var queryEmbedding = await aiService.GetEmbeddingsAsync([queryString]);

   if (!queryEmbedding.Any())
   {
       Console.WriteLine("No embeddings found.");
   }
   else
   {
       var dataService = new DataService();
       var matchingDocuments = dataService.PerformVectorQuery(queryEmbedding[queryString]);
       if (matchingDocuments == null)
       {
           Console.WriteLine("No documents matched the query.");
       }
       else
       {
           foreach (var document in matchingDocuments)
           {
               Console.WriteLine(document.ToJson());
           }
       }
   }

   ```

   Save the file, and then compile and run your project to perform the query:

   ```text
   dotnet run MyCompany.Embeddings.csproj
   ```

   **Output:**

   ```shell
   { "summary" : "Near to underground metro station. Walking distance to seaside. 2 floors 1 entry. Husband, wife, girl and boy is living.", "score" : 88.884147644042969 }
   { "summary" : "A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.", "score" : 86.136398315429688 }
   { "summary" : "Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.", "score" : 86.087783813476562 }
   { "summary" : "Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.", "score" : 85.689559936523438 }
   { "summary" : "Fully furnished 3+1 flat decorated with vintage style.  Located at the heart of Moda/Kadıköy, close to seaside and also to the public transportation (tram, metro, ferry, bus stations) 10 minutes walk.", "score" : 85.614166259765625 }
   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a MongoDB Vector Search index on your collection.

   Paste the following code in your notebook.

   ```python
   from pymongo.operations import SearchIndexModel

   # Create your index model, then create the search index
   search_index_model = SearchIndexModel(
     definition = {
       "fields": [
         {
           "type": "vector",
           "path": "embedding",
           "similarity": "dotProduct",
           "numDimensions": <dimensions>
         }
       ]
     },
     name="vector_index",
     type="vectorSearch"
   )
   collection.create_search_index(model=search_index_model)
   ```

   Replace the `<dimensions>` placeholder with one of the following values:

   - `768` if you used `nomic-embed-text-v1`

   - `1024` if you used `voyage-4-large`

   - `1536` if you used `text-embedding-3-small`

   Run the code.

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for a vector search query, then run the query.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   **Note:**

   The query might take some time to complete. Your results might vary depending on the embedding model and whether you compressed your embeddings.

   ### Open-Source

   ```python
   # Generate embedding for the search query
   query_embedding = get_embedding("ocean tragedy")

   # Sample vector search pipeline
   pipeline = [
      {
         "$vectorSearch": {
               "index": "vector_index",
               "queryVector": query_embedding,
               "path": "embedding",
               "exact": True,
               "limit": 5
         }
      }, 
      {
         "$project": {
            "_id": 0, 
            "text": 1,
            "score": {
               "$meta": "vectorSearchScore"
            }
         }
      }
   ]

   # Execute the search
   results = collection.aggregate(pipeline)

   # Print results
   for i in results:
      print(i)

   ```

   **Output:**

   ```shell
   {'data': 'Titanic: The story of the 1912 sinking of the largest luxury liner ever built', 'score': 0.7661112546920776}
   {'data': 'Avatar: A marine is dispatched to the moon Pandora on a unique mission', 'score': 0.7050272822380066}
   {'data': 'The Shawshank Redemption: A banker is sentenced to life in Shawshank State Penitentiary for the murders of his wife and her lover.', 'score': 0.7024770379066467}
   {'data': 'Jurassic Park: Scientists clone dinosaurs to populate an island theme park, which soon goes awry.', 'score': 0.7011005282402039}
   {'data': 'E.T. the Extra-Terrestrial: A young boy befriends an alien stranded on Earth and helps him return home.', 'score': 0.6877288222312927}
   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a MongoDB Vector Search index on your collection.

   Paste the following code in your notebook.

   ```python
   from pymongo.operations import SearchIndexModel

   # Create your index model, then create the search index
   search_index_model = SearchIndexModel(
     definition = {
       "fields": [
         {
           "type": "vector",
           "path": "embedding",
           "similarity": "dotProduct",
           "numDimensions": <dimensions>
         }
       ]
     },
     name="vector_index",
     type="vectorSearch"
   )
   collection.create_search_index(model=search_index_model)
   ```

   Replace the `<dimensions>` placeholder with one of the following values:

   - `768` if you used `nomic-embed-text-v1`

   - `1024` if you used `voyage-4-large`

   - `1536` if you used `text-embedding-3-small`

   Run the code.

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   **Note:**

   The query might take some time to complete. Your results might vary depending on the embedding model and whether you compressed your embeddings.

   ### Open-Source

   ```python
   # Generate embedding for the search query
   query_embedding = get_embedding("beach house")

   # Sample vector search pipeline
   pipeline = [
      {
         "$vectorSearch": {
               "index": "vector_index",
               "queryVector": query_embedding,
               "path": "embedding",
               "exact": True,
               "limit": 5
         }
      }, 
      {
         "$project": {
            "_id": 0, 
            "summary": 1,
            "score": {
               "$meta": "vectorSearchScore"
            }
         }
      }
   ]

   # Execute the search
   results = collection.aggregate(pipeline)

   # Print results
   for i in results:
      print(i)

   ```

   **Output:**

   ```shell
   {'summary': 'Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.', 'score': 0.7847104072570801}
   {'summary': 'The Apartment has a living room, toilet, bedroom (suite) and American kitchen. Well located, on the Copacabana beach block a 05 Min. walk from Ipanema beach (Arpoador). Internet wifi, cable tv, air conditioning in the bedroom, ceiling fans in the bedroom and living room, kitchen with microwave, cooker, Blender, dishes, cutlery and service area with fridge, washing machine, clothesline for drying clothes and closet with several utensils for use.  The property boasts 45 m2.', 'score': 0.7780507802963257}
   {'summary': "A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.", 'score': 0.7723637223243713}
   {'summary': 'Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.', 'score': 0.7665778398513794}
   {'summary': 'A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.', 'score': 0.7593404650688171}

   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_db.embeddings` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Create a file named named `create-index.js` and paste the following code.

   ```js
   import { MongoClient } from 'mongodb';

   // connect to your MongoDB deployment
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
      try {
        const database = client.db("sample_db");
        const collection = database.collection("embeddings");
       
        // define your MongoDB Vector Search index
        const index = {
            name: "vector_index",
            type: "vectorSearch",
            definition: {
              "fields": [
                {
                  "type": "vector",
                  "path": "embedding",
                  "similarity": "dotProduct",
                  "numDimensions": <dimensions>
                }
              ]
            }
        }
        // run the helper method
        const result = await collection.createSearchIndex(index);
        console.log(result);
      } finally {
        await client.close();
      }
   }
   run().catch(console.dir);
   ```

   Replace the `<dimensions>` placeholder with one of the following values:

   - `768` if you used `nomic-embed-text-v1`

   - `1024` if you used `voyage-3-large`

   - `1536` if you used `text-embedding-3-small`

   Save the file, then run the following command:

   ```text
   node --env-file=.env create-index.js
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for vector search queries and run a query.

   Create a file named named `vector-query.js` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```js
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';

   // MongoDB connection URI and options
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
       try {
           // Connect to the MongoDB client
           await client.connect();

           // Specify the database and collection
           const database = client.db("sample_db"); 
           const collection = database.collection("embeddings"); 

           // Generate embedding for the search query
           const queryEmbedding = await getEmbedding("ocean tragedy");

           // Define the sample vector search pipeline
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
                       text: 1,
                       score: {
                           $meta: "vectorSearchScore"
                       }
                   }
               }
           ];

           // run pipeline
           const result = collection.aggregate(pipeline);

           // print results
           for await (const doc of result) {
               console.dir(JSON.stringify(doc));
           }
           } finally {
           await client.close();
       }
   }
   run().catch(console.dir);
   ```

   Save the file, then run the following command:

   **Note:**

   The query might take some time to complete. Your results might vary depending on the embedding model and whether you compressed your embeddings.

   ### Open-Source

   ```text
   node --env-file=.env vector-query.js
   ```

   **Output:**

   ```shell
   '{"text":"Titanic: The story of the 1912 sinking of the largest luxury liner ever built","score":0.5103757977485657}'
   '{"text":"Avatar: A marine is dispatched to the moon Pandora on a unique mission","score":0.4616812467575073}'
   '{"text":"The Lion King: Lion cub and future king Simba searches for his identity","score":0.4115804433822632}'
   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_airbnb.listingsAndReviews` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Create a file named named `create-index.js` and paste the following code.

   ```js
   import { MongoClient } from 'mongodb';

   // connect to your MongoDB deployment
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
     try {
       const database = client.db("sample_airbnb");
       const collection = database.collection("listingsAndReviews");
      
       // Define your MongoDB Vector Search index
       const index = {
           name: "vector_index",
           type: "vectorSearch",
           definition: {
             "fields": [
               {
                 "type": "vector",
                 "path": "embedding",
                 "similarity": "dotProduct",
                 "numDimensions": <dimensions>
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

   Replace the `<dimensions>` placeholder with one of the following values:

   - `768` if you used `nomic-embed-text-v1`

   - `1024` if you used `voyage-3-large`

   - `1536` if you used `text-embedding-3-small`

   Save the file, then run the following command:

   ```text
   node --env-file=.env create-index.js
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   Create a file named named `vector-query.js` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```js
   import { MongoClient } from 'mongodb';
   import { getEmbedding } from './get-embeddings.js';

   // MongoDB connection URI and options
   const client = new MongoClient(process.env.MONGODB_URI);

   async function run() {
       try {
           // Connect to the MongoDB client
           await client.connect();

           // Specify the database and collection
           const database = client.db("sample_airbnb"); 
           const collection = database.collection("listingsAndReviews"); 

           // Generate embedding for the search query
           const queryEmbedding = await getEmbedding("beach house");

           // Define the sample vector search pipeline
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
                       summary: 1,
                       score: {
                           $meta: "vectorSearchScore"
                       }
                   }
               }
           ];

           // run pipeline
           const result = collection.aggregate(pipeline);

           // print results
           for await (const doc of result) {
               console.dir(JSON.stringify(doc));
           }
           } finally {
           await client.close();
       }
   }
   run().catch(console.dir);
   ```

   Save the file, then run the following command:

   **Note:**

   The query might take some time to complete. Your results might vary depending on the embedding model and whether you compressed your embeddings.

   ### Open-Source

   ```text
   node --env-file=.env vector-query.js
   ```

   **Output:**

   ```shell
   '{"summary":"Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.","score":0.5334879159927368}'
   '{"summary":"A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.","score":0.5240535736083984}'
   '{"summary":"The Apartment has a living room, toilet, bedroom (suite) and American kitchen. Well located, on the Copacabana beach block a 05 Min. walk from Ipanema beach (Arpoador). Internet wifi, cable tv, air conditioning in the bedroom, ceiling fans in the bedroom and living room, kitchen with microwave, cooker, Blender, dishes, cutlery and service area with fridge, washing machine, clothesline for drying clothes and closet with several utensils for use.  The property boasts 45 m2.","score":0.5232879519462585}'
   '{"summary":"Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.","score":0.5186381340026855}'
   '{"summary":"A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.","score":0.5078228116035461}'

   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_db.embeddings` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Create a file named named `create-index.go` and paste the following code.

   ```go
   package main
   import (
   	"context"
   	"fmt"
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
   		log.Println("no .env file found")
   	}
   	// Connect to your MongoDB deployment
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
   	// Set the namespace
   	coll := client.Database("sample_db").Collection("embeddings")
   	indexName := "vector_index"
   	opts := options.SearchIndexes().SetName(indexName).SetType("vectorSearch")
   	type vectorDefinitionField struct {
   		Type          string `bson:"type"`
   		Path          string `bson:"path"`
   		NumDimensions int    `bson:"numDimensions"`
   		Similarity    string `bson:"similarity"`
   	}
   	type vectorDefinition struct {
   		Fields []vectorDefinitionField `bson:"fields"`
   	}
   	indexModel := mongo.SearchIndexModel{
   		Definition: vectorDefinition{
   			Fields: []vectorDefinitionField{{
   				Type:          "vector",
   				Path:          "embedding",
   				NumDimensions: 3072,
   				Similarity:    "dotProduct"}},
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
   	searchIndexes := coll.SearchIndexes()
   	var doc bson.Raw
   	for doc == nil {
   		cursor, err := searchIndexes.List(ctx, options.SearchIndexes().SetName(searchIndexName))
   		if err != nil {
   			fmt.Errorf("failed to list search indexes: %w", err)
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

   Replace the `<dimensions>` placeholder value with `1024` if you used Voyage AI or the open-source model and `1536` if you used the model from OpenAI.

   Save the file, then run the following command:

   ```text
   go run create-index.go
   ```

   **Output:**

   ```text
   2024/10/09 17:38:51 Creating the index.
   2024/10/09 17:38:52 Polling to confirm successful index creation.
   2024/10/09 17:39:22 Name of Index Created: vector_index
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for vector search queries and run a query.

   Create a file named named `vector-query.go` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ### Open-Source

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"my-embeddings-project/common"
   	"os"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/v2/bson"
   	"go.mongodb.org/mongo-driver/v2/mongo"
   	"go.mongodb.org/mongo-driver/v2/mongo/options"
   )

   type TextAndScore struct {
   	Text  string  `bson:"text"`
   	Score float32 `bson:"score"`
   }

   func main() {
   	ctx := context.Background()

   	// Connect to your MongoDB deployment
   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
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

   	// Set the namespace
   	coll := client.Database("sample_db").Collection("embeddings")

   	query := "ocean tragedy"
   	queryEmbedding := common.GetEmbeddings([]string{query})

   	pipeline := mongo.Pipeline{
   		bson.D{
   			{"$vectorSearch", bson.D{
   				{"queryVector", queryEmbedding[0]},
   				{"index", "vector_index"},
   				{"path", "embedding"},
   				{"exact", true},
   				{"limit", 5},
   			}},
   		},
   		bson.D{
   			{"$project", bson.D{
   				{"_id", 0},
   				{"text", 1},
   				{"score", bson.D{
   					{"$meta", "vectorSearchScore"},
   				}},
   			}},
   		},
   	}

   	// Run the pipeline
   	cursor, err := coll.Aggregate(ctx, pipeline)
   	if err != nil {
   		log.Fatalf("failed to run aggregation: %v", err)
   	}
   	defer func() { _ = cursor.Close(ctx) }()

   	var matchingDocs []TextAndScore
   	if err = cursor.All(ctx, &matchingDocs); err != nil {
   		log.Fatalf("failed to unmarshal results to TextAndScore objects: %v", err)
   	}
   	for _, doc := range matchingDocs {
   		fmt.Printf("Text: %v\nScore: %v\n", doc.Text, doc.Score)
   	}
   }

   ```

   Save the file, then run the following command:

   ### Open-Source

   ```text
   go run vector-query.go
   ```

   **Output:**

   ```shell
   Text: Titanic: The story of the 1912 sinking of the largest luxury liner ever built
   Score: 0.0042472864
   Text: Avatar: A marine is dispatched to the moon Pandora on a unique mission
   Score: 0.0031167597
   Text: The Lion King: Lion cub and future king Simba searches for his identity
   Score: 0.0024476869

   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_airbnb.listingsAndReviews` collection that specifies the `embeddings` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `euclidean`.

   Create a file named named `create-index.go` and paste the following code.

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"os"
   	"time"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/bson"
   	"go.mongodb.org/mongo-driver/mongo"
   	"go.mongodb.org/mongo-driver/mongo/options"
   )

   func main() {
   	ctx := context.Background()

   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
   	uri := os.Getenv("MONGODB_URI")
   	if uri == "" {
   		log.Fatal("set your 'MONGODB_URI' environment variable.")
   	}
   	clientOptions := options.Client().ApplyURI(uri)
   	client, err := mongo.Connect(ctx, clientOptions)
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	// Set the namespace
   	coll := client.Database("sample_airbnb").Collection("listingsAndReviews")
   	indexName := "vector_index"
   	opts := options.SearchIndexes().SetName(indexName).SetType("vectorSearch")

   	type vectorDefinitionField struct {
   		Type          string `bson:"type"`
   		Path          string `bson:"path"`
   		NumDimensions int    `bson:"numDimensions"`
   		Similarity    string `bson:"similarity"`
   	}

   	type vectorDefinition struct {
   		Fields []vectorDefinitionField `bson:"fields"`
   	}

   	indexModel := mongo.SearchIndexModel{
   		Definition: vectorDefinition{
   			Fields: []vectorDefinitionField{{
   				Type:          "vector",
   				Path:          "embeddings",
   				NumDimensions: <dimensions>,
   				Similarity:    "dotProduct"}},
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
   	searchIndexes := coll.SearchIndexes()
   	var doc bson.Raw
   	for doc == nil {
   		cursor, err := searchIndexes.List(ctx, options.SearchIndexes().SetName(searchIndexName))
   		if err != nil {
   			fmt.Errorf("failed to list search indexes: %w", err)
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

   Replace the `<dimensions>` placeholder value with `1024` if you used Voyage AI or the open-source model and `1536` if you used the model from OpenAI.

   Save the file, then run the following command:

   ```text
   go run create-index.go
   ```

   **Output:**

   ```text
   2024/10/10 10:03:12 Creating the index.
   2024/10/10 10:03:13 Polling to confirm successful index creation.
   2024/10/10 10:03:44 Name of Index Created: vector_index
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   Create a file named named `vector-query.go` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ### Open-Source

   ```go
   package main

   import (
   	"context"
   	"fmt"
   	"log"
   	"my-embeddings-project/common"
   	"os"

   	"github.com/joho/godotenv"
   	"go.mongodb.org/mongo-driver/bson"
   	"go.mongodb.org/mongo-driver/mongo"
   	"go.mongodb.org/mongo-driver/mongo/options"
   )

   type SummaryAndScore struct {
   	Summary string  `bson:"summary"`
   	Score   float32 `bson:"score"`
   }

   func main() {
   	ctx := context.Background()

   	// Connect to your MongoDB deployment
   	if err := godotenv.Load(); err != nil {
   		log.Println("no .env file found")
   	}

   	// Connect to your MongoDB deployment
   	uri := os.Getenv("MONGODB_URI")
   	if uri == "" {
   		log.Fatal("set your 'MONGODB_URI' environment variable.")
   	}
   	clientOptions := options.Client().ApplyURI(uri)
   	client, err := mongo.Connect(ctx, clientOptions)
   	if err != nil {
   		log.Fatalf("failed to connect to the server: %v", err)
   	}
   	defer func() { _ = client.Disconnect(ctx) }()

   	// Set the namespace
   	coll := client.Database("sample_airbnb").Collection("listingsAndReviews")

   	query := "beach house"
   	queryEmbedding := common.GetEmbeddings([]string{query})

   	pipeline := mongo.Pipeline{
   		bson.D{
   			{"$vectorSearch", bson.D{
   				{"queryVector", queryEmbedding[0]},
   				{"index", "vector_index"},
   				{"path", "embeddings"},
   				{"exact", true},
   				{"limit", 5},
   			}},
   		},
   		bson.D{
   			{"$project", bson.D{
   				{"_id", 0},
   				{"summary", 1},
   				{"score", bson.D{
   					{"$meta", "vectorSearchScore"},
   				}},
   			}},
   		},
   	}

   	// Run the pipeline
   	cursor, err := coll.Aggregate(ctx, pipeline)
   	if err != nil {
   		log.Fatalf("failed to run aggregation: %v", err)
   	}
   	defer func() { _ = cursor.Close(ctx) }()

   	var matchingDocs []SummaryAndScore
   	if err = cursor.All(ctx, &matchingDocs); err != nil {
   		log.Fatalf("failed to unmarshal results to SummaryAndScore objects: %v", err)
   	}
   	for _, doc := range matchingDocs {
   		fmt.Printf("Summary: %v\nScore: %v\n", doc.Summary, doc.Score)
   	}
   }

   ```

   Save the file, then run the following command:

   ### Open-Source

   ```text
   go run vector-query.go
   ```

   **Output:**

   ```shell
   Summary: Near to underground metro station. Walking distance to seaside. 2 floors 1 entry. Husband, wife, girl and boy is living.
   Score: 0.0045180833
   Summary: A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.
   Score: 0.004480799
   Summary: Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.
   Score: 0.0042421296
   Summary: Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.
   Score: 0.004227752
   Summary: A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.
   Score: 0.0042201905

   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_db.embeddings` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Create a file named `CreateIndex.java` and paste the following code:

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

   public class CreateIndex {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_db");
               MongoCollection<Document> collection = database.getCollection("embeddings");

               // define the index details
               String indexName = "vector_index";
               int dimensionsHuggingFaceModel = 1024;
               int dimensionsOpenAiModel = 1536;

               Bson definition = new Document(
                       "fields",
                       Collections.singletonList(
                                       new Document("type", "vector")
                                               .append("path", "embedding")
                                               .append("numDimensions", <dimensions>) // replace with var for the model used
                               .append("similarity", "dotProduct")));

               // define the index model using the specified details
               SearchIndexModel indexModel = new SearchIndexModel(
                       indexName,
                       definition,
                       SearchIndexType.vectorSearch());

               // Create the index using the model
               try {
                   List<String> result = collection.createSearchIndexes(Collections.singletonList(indexModel));
                   System.out.println("Successfully created a vector index named: " + result);
               } catch (Exception e) {
                   throw new RuntimeException(e);
               }

               // wait for index to build and become queryable
               System.out.println("Polling to confirm the index has completed building.");
               System.out.println("It may take up to a minute for the index to build before you can query using it.");

               ListSearchIndexesIterable<Document> searchIndexes = collection.listSearchIndexes();
               Document doc = null;
               while (doc == null) {
                   try (MongoCursor<Document> cursor = searchIndexes.iterator()) {
                       if (!cursor.hasNext()) {
                           break;
                       }
                       Document current = cursor.next();
                       String name = current.getString("name");
                       boolean queryable = current.getBoolean("queryable");
                       if (name.equals(indexName) && queryable) {
                           doc = current;
                       } else {
                           Thread.sleep(500);
                       }
                   }  catch (Exception e) {
                       throw new RuntimeException(e);
                   }
               }
               System.out.println(indexName + " index is ready to query");

           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

   Replace the `<dimensions>` placeholder value with the appropriate variable for the model you used:

   - `dimensionsHuggingFaceModel`: `1024` dimensions ("mixedbread-ai/mxbai-embed-large-v1" model)

   - `dimensionsVoyageAiModel`: `1024` dimensions ("voyage-4-large" model)

   - `dimensionsOpenAiModel`: `1536` dimensions ("text-embedding-3-small" model)

   **Note:**

   The number of dimensions is determined by the model used to generate the embeddings. If you adapt this code to use a different model, ensure that you pass the correct value to `numDimensions`. See also the [Choosing an Embedding Model](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-choose-embedding-model) section.

   Save and run the file. The output resembles:

   ```shell
   Successfully created a vector index named: [vector_index]
   Polling to confirm the index has completed building.
   It may take up to a minute for the index to build before you can query using it.
   vector_index index is ready to query

   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for vector search queries and run a query.

   Create a file named named `VectorQuery.java` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.search.FieldSearchPath;
   import org.bson.BsonArray;
   import org.bson.BsonValue;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.ArrayList;
   import java.util.List;

   import static com.mongodb.client.model.Aggregates.project;
   import static com.mongodb.client.model.Aggregates.vectorSearch;
   import static com.mongodb.client.model.Projections.exclude;
   import static com.mongodb.client.model.Projections.fields;
   import static com.mongodb.client.model.Projections.include;
   import static com.mongodb.client.model.Projections.metaVectorSearchScore;
   import static com.mongodb.client.model.search.SearchPath.fieldPath;
   import static com.mongodb.client.model.search.VectorSearchOptions.exactVectorSearchOptions;
   import static java.util.Arrays.asList;

   public class VectorQuery {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_db");
               MongoCollection<Document> collection = database.getCollection("embeddings");

               // define $vectorSearch query options
               String query = "ocean tragedy";
               EmbeddingProvider embeddingProvider = new EmbeddingProvider();
               BsonArray embeddingBsonArray = embeddingProvider.getEmbedding(query);

               List<Double> embedding = new ArrayList<>();
               for (BsonValue value : embeddingBsonArray.stream().toList()) {
                   embedding.add(value.asDouble().getValue());
               }

               // define $vectorSearch pipeline
               String indexName = "vector_index";
               FieldSearchPath fieldSearchPath = fieldPath("embedding");
               int limit = 5;

               List<Bson> pipeline = asList(
                       vectorSearch(
                               fieldSearchPath,
                               embedding,
                               indexName,
                               limit,
                               exactVectorSearchOptions()
                       ),
                       project(
                               fields(exclude("_id"), include("text"),
                                       metaVectorSearchScore("score"))));

               // run query and print results
               List<Document> results = collection.aggregate(pipeline).into(new ArrayList<>());

               if (results.isEmpty()) {
                   System.out.println("No results found.");
               } else {
                   results.forEach(doc -> {
                       System.out.println("Text: " + doc.getString("text"));
                       System.out.println("Score: " + doc.getDouble("score"));
                   });
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }


   ```

   Save and run the file. The output resembles one of the following, depending on the model you used:

   ### Open-Source

   ```shell
   Text: Titanic: The story of the 1912 sinking of the largest luxury liner ever built
   Score: 0.004247286356985569
   Text: Avatar: A marine is dispatched to the moon Pandora on a unique mission
   Score: 0.003116759704425931
   Text: The Lion King: Lion cub and future king Simba searches for his identity
   Score: 0.002447686856612563

   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_airbnb.listingsAndReviews` collection that specifies the `embeddings` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `euclidean`.

   Create a file named `CreateIndex.java` and paste the following code:

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.ListSearchIndexesIterable;
   import com.mongodb.client.MongoCursor;
   import com.mongodb.client.model.SearchIndexModel;
   import com.mongodb.client.model.SearchIndexType;
   import org.bson.Document;
   import org.bson.conversions.Bson;
   import java.util.Collections;
   import java.util.List;

   public class CreateIndex {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");

           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_airbnb");
               MongoCollection<Document> collection = database.getCollection("listingsAndReviews");

               // define the index details
               String indexName = "vector_index";
               int dimensionsHuggingFaceModel = 1024;
               int dimensionsOpenAiModel = 1536;

               Bson definition = new Document(
                       "fields",
                       Collections.singletonList(
                               new Document("type", "vector")
                                       .append("path", "embeddings")
                                       .append("numDimensions", <dimensions>) // replace with var for the model used
                                       .append("similarity", "dotProduct")));

               // define the index model using the specified details
               SearchIndexModel indexModel = new SearchIndexModel(
                       indexName,
                       definition,
                       SearchIndexType.vectorSearch());

               // create the index using the model
               try {
                   List<String> result = collection.createSearchIndexes(Collections.singletonList(indexModel));
                   System.out.println("Successfully created a vector index named: " + result);
                   System.out.println("It may take up to a minute for the index to build before you can query using it.");
               } catch (Exception e) {
                   throw new RuntimeException(e);
               }

               // wait for index to build and become queryable
               System.out.println("Polling to confirm the index has completed building.");

               ListSearchIndexesIterable<Document> searchIndexes = collection.listSearchIndexes();
               Document doc = null;
               while (doc == null) {
                   try (MongoCursor<Document> cursor = searchIndexes.iterator()) {
                       if (!cursor.hasNext()) {
                           break;
                       }
                       Document current = cursor.next();
                       String name = current.getString("name");
                       boolean queryable = current.getBoolean("queryable");
                       if (name.equals(indexName) && queryable) {
                           doc = current;
                       } else {
                           Thread.sleep(500);
                       }
                   }  catch (Exception e) {
                       throw new RuntimeException(e);
                   }
               }
               System.out.println(indexName + " index is ready to query");

           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

   Replace the `<dimensions>` placeholder value with the appropriate variable for the model you used:

   - `dimensionsHuggingFaceModel`: `1024` dimensions (open-source)

   - `dimensionsVoyageAiModel`: `1024` dimensions (Voyage AI)

   - `dimensionsOpenAiModel`: `1536` dimensions

   **Note:**

   The number of dimensions is determined by the model used to generate the embeddings. If you are using a different model, ensure that you pass the correct value to `numDimensions`. See also the [Choosing an Embedding Model](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-choose-embedding-model) section.

   Save and run the file. The output resembles:

   ```shell
   Successfully created a vector index named: [vector_index]
   Polling to confirm the index has completed building.
   It may take up to a minute for the index to build before you can query using it.
   vector_index index is ready to query

   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   Create a file named named `VectorQuery.java` and paste the following code.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```java
   import com.mongodb.MongoException;
   import com.mongodb.client.MongoClient;
   import com.mongodb.client.MongoClients;
   import com.mongodb.client.MongoCollection;
   import com.mongodb.client.MongoDatabase;
   import com.mongodb.client.model.search.FieldSearchPath;
   import org.bson.BsonArray;
   import org.bson.BsonValue;
   import org.bson.Document;
   import org.bson.conversions.Bson;

   import java.util.ArrayList;
   import java.util.List;

   import static com.mongodb.client.model.Aggregates.project;
   import static com.mongodb.client.model.Aggregates.vectorSearch;
   import static com.mongodb.client.model.Projections.exclude;
   import static com.mongodb.client.model.Projections.fields;
   import static com.mongodb.client.model.Projections.include;
   import static com.mongodb.client.model.Projections.metaVectorSearchScore;
   import static com.mongodb.client.model.search.SearchPath.fieldPath;
   import static com.mongodb.client.model.search.VectorSearchOptions.exactVectorSearchOptions;
   import static java.util.Arrays.asList;

   public class VectorQuery {

       public static void main(String[] args) {

           String uri = System.getenv("MONGODB_URI");
           if (uri == null || uri.isEmpty()) {
               throw new IllegalStateException("MONGODB_URI env variable is not set or is empty.");
           }

           // establish connection and set namespace
           try (MongoClient mongoClient = MongoClients.create(uri)) {
               MongoDatabase database = mongoClient.getDatabase("sample_airbnb");
               MongoCollection<Document> collection = database.getCollection("listingsAndReviews");

               // define the query and get the embedding
               String query = "beach house";
               EmbeddingProvider embeddingProvider = new EmbeddingProvider();
               BsonArray embeddingBsonArray = embeddingProvider.getEmbedding(query);

               List<Double> embedding = new ArrayList<>();
               for (BsonValue value : embeddingBsonArray.stream().toList()) {
                   embedding.add(value.asDouble().getValue());
               }

               // define $vectorSearch pipeline
               String indexName = "vector_index";
               FieldSearchPath fieldSearchPath = fieldPath("embeddings");
               int limit = 5;

               List<Bson> pipeline = asList(
                       vectorSearch(
                               fieldSearchPath,
                               embedding,
                               indexName,
                               limit,
                               exactVectorSearchOptions()),
                       project(
                               fields(exclude("_id"), include("summary"),
                                       metaVectorSearchScore("score"))));

               // run query and print results
               List<Document> results = collection.aggregate(pipeline).into(new ArrayList<>());

               if (results.isEmpty()) {
                   System.out.println("No results found.");
               } else {
                   results.forEach(doc -> {
                       System.out.println("Summary: " + doc.getString("summary"));
                       System.out.println("Score: " + doc.getDouble("score"));
                   });
               }
           } catch (MongoException me) {
               throw new RuntimeException("Failed to connect to MongoDB ", me);
           } catch (Exception e) {
               throw new RuntimeException("Operation failed: ", e);
           }
       }
   }

   ```

   Save and run the file. The output resembles one of the following, depending on the model you used:

   ### Open-Source

   ```shell
   Summary: Near to underground metro station. Walking distance to seaside. 2 floors 1 entry. Husband, wife, girl and boy is living.
   Score: 0.004518083296716213
   Summary: A beautiful and comfortable 1 Bedroom Air Conditioned Condo in Makaha Valley - stunning Ocean & Mountain views All the amenities of home, suited for longer stays. Full kitchen & large bathroom.  Several gas BBQ's for all guests to use & a large heated pool surrounded by reclining chairs to sunbathe.  The Ocean you see in the pictures is not even a mile away, known as the famous Makaha Surfing Beach. Golfing, hiking,snorkeling  paddle boarding, surfing are all just minutes from the front door.
   Score: 0.0044807991944253445
   Summary: Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.
   Score: 0.004242129623889923
   Summary: Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.
   Score: 0.004227751865983009
   Summary: A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.
   Score: 0.004220190457999706

   ```

1. Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_db.embeddings` collection that specifies the `embedding` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `dotProduct`.

   Paste the following code to add a `CreateVectorIndex` function to your `DataService` class in `DataService.cs`.

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_db");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("embeddings");
       
       public async Task AddDocumentsAsync(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }
       
       public void CreateVectorIndex()
       {
           try
           {
               var searchIndexView = Collection.SearchIndexes;
               var name = "vector_index";

               var model = new CreateVectorSearchIndexModel<Document>(
                   d => d.Embedding,
                   name,
                   VectorSimilarity.DotProduct,
                   <dimensions>);

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
               Console.WriteLine($"{name} is ready for querying.");
           }
           catch (Exception e)
           {
               Console.WriteLine($"Exception: {e.Message}");
           }
       }
   }
   ```

   Replace the `<dimensions>` placeholder value with `1024` if you used Voyage AI or the open-source model and `1536` if you used the model from OpenAI.

   Update the code in your `Program.cs`.

   Remove the code that populated the initial documents, and replace it with the following code to create the index:

   ```csharp
   using MyCompany.Embeddings;

   var dataService = new DataService();
   dataService.CreateVectorIndex();

   ```

   Save the file, and then compile and run your project to create the index:

   ```text
   dotnet run MyCompany.Embeddings
   ```

   **Output:**

   ```text
   New search index named vector_index is building.
   Polling to check if the index is ready. This may take up to a minute.
   vector_index is ready for querying.
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2. Create embeddings for vector search queries and run a query.

   Paste the following code to add a `PerformVectorQuery` function to your `DataService` class in `DataService.cs`.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_db");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("embeddings");
       
       public async Task AddDocumentsAsync(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }
       
       public void CreateVectorIndex()
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

   Update the code in your `Program.cs`.

   Remove the code that created the vector index, and add code to perform a query:

   ```csharp
   using MongoDB.Bson;
   using MyCompany.Embeddings;

   var aiService = new AIService();
   var queryString = "ocean tragedy";
   var queryEmbedding = await aiService.GetEmbeddingsAsync([queryString]);

   if (!queryEmbedding.Any())
   {
       Console.WriteLine("No embeddings found.");
   }
   else
   {
       var dataService = new DataService();
       var matchingDocuments = dataService.PerformVectorQuery(queryEmbedding[queryString]);
       if (matchingDocuments == null)
       {
           Console.WriteLine("No documents matched the query.");
       }
       else
       {
           foreach (var document in matchingDocuments)
           {
               Console.WriteLine(document.ToJson());
           }
       }
   }

   ```

   Save the file, and then compile and run your project to perform the query:

   ```text
   dotnet run MyCompany.Embeddings.csproj
   ```

   **Output:**

   ```shell
   { "text" : "Titanic: The story of the 1912 sinking of the largest luxury liner ever built", "score" : 100.17414855957031 }
   { "text" : "Avatar: A marine is dispatched to the moon Pandora on a unique mission", "score" : 65.705635070800781 }
   { "text" : "The Lion King: Lion cub and future king Simba searches for his identity", "score" : 52.486415863037109 }

   ```

1) Create the vector search index.

   To enable vector search queries on your data, you must create a vector search index on your collection.

   Complete the following steps to create an index on the `sample_airbnb.listingsAndReviews` collection that specifies the `embeddings` field as the [vector](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-types-vector-search) type and the similarity measure as `euclidean`.

   Paste the following code to add the `CreateVectorIndex` function to your `DataService` class in `DataService.cs`.

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_airbnb");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("listingsAndReviews");
       public List<BsonDocument>? GetDocuments()
       {
           // Method details...
       }
       public async Task<long> AddEmbeddings(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }

       public void CreateVectorIndex()
       {
           try
           {
               var searchIndexView = Collection.SearchIndexes;
               var name = "vector_index";

               var model = new CreateVectorSearchIndexModel<Listing>(
                   l => l.Embeddings,
                   name,
                   VectorSimilarity.DotProduct,
                   <dimensions>);

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
               Console.WriteLine($"{name} is ready for querying.");
           }
           catch (Exception e)
           {
               Console.WriteLine($"Exception: {e.Message}");
           }
       }
   }
   ```

   Replace the `<dimensions>` placeholder value with `1024` if you used Voyage AI or the open-source model and `1536` if you used the model from OpenAI.

   Update the code in your `Program.cs`.

   Remove the code that added embeddings to the existing documents, and replace it with the following code to create the index:

   ```csharp
   using MyCompany.Embeddings;

   var dataService = new DataService();
   dataService.CreateVectorIndex();

   ```

   Save the file, and then compile and run your project to create the index:

   ```text
   dotnet run MyCompany.Embeddings
   ```

   **Output:**

   ```text
   New search index named vector_index is building.
   Polling to check if the index is ready. This may take up to a minute.
   vector_index is ready for querying.
   ```

   **Note:**

   The index should take about one minute to build. While it builds, the index is in an [initial sync](https://www.mongodb.com/docs/search/performance/index-performance.md#std-label-troubleshoot-initial-sync) state. When it finishes building, you can start querying the data in your collection.

   To learn more, see [Create a MongoDB Vector Search Index.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-create-index)

2) Create embeddings for vector search queries and run a query.

   Paste the following code to add a `PerformVectorQuery` function to your `DataService` class in `DataService.cs`.

   To run a vector search query, generate a [query vector](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-options) to pass into your aggregation pipeline.

   For example, this code does the following:

   - Creates a query embedding using your defined embedding function.

   - Uses this embedding in the `queryVector` field and specifies the path to query.

   - Uses [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) to perform an [ENN](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-enn) search.

   - Returns semantically similar documents ranked by relevance with their [search scores.](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-vectorSearch-agg-pipeline-score)

   ```csharp
   namespace MyCompany.Embeddings;

   using MongoDB.Driver;
   using MongoDB.Bson;

   public class DataService
   {
       private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
       private static readonly MongoClient Client = new MongoClient(ConnectionString);
       private static readonly IMongoDatabase Database = Client.GetDatabase("sample_airbnb");
       private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("listingsAndReviews");
       public List<BsonDocument>? GetDocuments()
       {
           // Method details...
       }
       public async Task<long> AddEmbeddings(Dictionary<string, float[]> embeddings)
       {
           // Method details...
       }

       public void CreateVectorIndex()
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
                       { "path", "embeddings" },
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
                       { "summary", 1 },
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

   Update the code in your `Program.cs`.

   Remove the code that created the vector index, and add code to perform a query:

   ```csharp
   using MongoDB.Bson;
   using MyCompany.Embeddings;

   var aiService = new AIService();
   var queryString = "beach house";
   var queryEmbedding = await aiService.GetEmbeddingsAsync([queryString]);

   if (!queryEmbedding.Any())
   {
       Console.WriteLine("No embeddings found.");
   }
   else
   {
       var dataService = new DataService();
       var matchingDocuments = dataService.PerformVectorQuery(queryEmbedding[queryString]);
       if (matchingDocuments == null)
       {
           Console.WriteLine("No documents matched the query.");
       }
       else
       {
           foreach (var document in matchingDocuments)
           {
               Console.WriteLine(document.ToJson());
           }
       }
   }

   ```

   Save the file, and then compile and run your project to perform the query:

   ```text
   dotnet run MyCompany.Embeddings.csproj
   ```

   **Output:**

   ```shell
   { "summary" : "Near to underground metro station. Walking distance to seaside. 2 floors 1 entry. Husband, wife, girl and boy is living.", "score" : 88.884147644042969 }
   { "summary" : "A friendly apartment block where everyone knows each other and there is a strong communal vibe. Property has a huge backyard with vege garden and skate ramp. 7min walk to the beach and 2min to buses.", "score" : 86.136398315429688 }
   { "summary" : "Having a large airy living room. The apartment is well divided. Fully furnished and cozy. The building has a 24h doorman and camera services in the corridors. It is very well located, close to the beach, restaurants, pubs and several shops and supermarkets. And it offers a good mobility being close to the subway.", "score" : 86.087783813476562 }
   { "summary" : "Room 2  Private room in charming recently renovated federation guest house at Coogee Beach. Prices are per room for 2 People only. A queen  and a single bed. Not suitable for group booking All rooms have  TV, desk, wardrobe, beds, unlimited wifi 2 mins from the beach, cafes and transport. This is not a party house but a safe and clean place to stay. Share bathrooms and kitchen... All common areas are cleaned daily.", "score" : 85.689559936523438 }
   { "summary" : "Fully furnished 3+1 flat decorated with vintage style.  Located at the heart of Moda/Kadıköy, close to seaside and also to the public transportation (tram, metro, ferry, bus stations) 10 minutes walk.", "score" : 85.614166259765625 }
   ```

## Considerations

Consider the following factors when creating vector embeddings:

### Choosing a Method to Create Embeddings

In order to create vector embeddings, you must use an [embedding model](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-choose-embedding-model). Embedding models are algorithms that you use to generate numerical representations of your data. Choose one of the following ways to access an embedding model:

| Method | Description |
| --- | --- |
| Load an open-source model | If you don't have an API (Application Programming Interface) key for a proprietary embedding model, load an open-source embedding model locally from your application. |
| Use a proprietary model | Most AI providers offer API (Application Programming Interface)s for their proprietary embedding models that you can use to create vector embeddings. For state-of-the-art embeddings, use [Voyage AI.](https://docs.voyageai.com/docs/introduction) |
| Leverage an integration | You can [integrate](https://www.mongodb.com/docs/atlas/ai-integrations.md#std-label-vector-search-integrations) MongoDB Vector Search with open-source frameworks and AI services to quickly connect to both open-source and proprietary embedding models and generate vector embeddings for MongoDB Vector Search. To learn more, see [MongoDB AI Integrations and Partners.](https://www.mongodb.com/docs/atlas/ai-integrations.md#std-label-vector-search-integrations) |

### Choosing an Embedding Model

The embedding model you choose affects your query results and determines the number of dimensions you specify in your MongoDB Vector Search index. Each model offers different advantages depending on your data and use case. For state-of-the-art embeddings, including multi-modal and domain-specific embedding models, use [Voyage AI.](https://docs.voyageai.com/docs/introduction)

When choosing an embedding model for MongoDB Vector Search, consider the following metrics:

- **Embedding Dimensions**: The length of the vector embedding.

  Smaller embeddings are more storage efficient, while larger embeddings can capture more nuanced relationships in your data. The model you choose should strike a balance between efficiency and complexity.

- **Max Tokens**: The number of [tokens](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them) that can be compressed in a single embedding.

- **Model Size**: The size of the model in gigabytes.

  While larger models perform better, they require more computational resources as you scale MongoDB Vector Search to production.

- **Retrieval Average**: A score that measures the performance of retrieval systems.

  A higher score indicates that the model is better at ranking relevant documents higher in the list of retrieved results. This score is important when choosing a model for [RAG](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-avs-rag) applications.

### Vector Compression

If you have a large number of float vectors and want to reduce the storage and [WiredTiger](https://www.mongodb.com/docs/manual/core/wiredtiger.md#std-label-storage-wiredtiger) footprint (such as disk and memory usage) in `mongod`, compress your embeddings by converting them to `binData` vectors.

[BinData](https://www.mongodb.com/docs/manual/reference/method/BinData.md#std-label-server-binData-method) is a BSON (Binary Javascript Object Notation) data type that stores binary data. The default type for vector embeddings is an array of 32-bit floats (`float32`). Binary data is more storage efficient than the default array format, and therefore requires three times less disk space.

Storing `binData` vectors improves query performance since less resources are needed to load a document into the working set. This can significantly improve query speed for vector queries where you are returning over 20 documents. If you compress your `float32` embeddings, you can query them with either `float32` or `binData` vectors.

The tutorial on this page includes an [example function](https://www.mongodb.com/docs/vector-search/crud-embeddings/create-embeddings-manual.md#std-label-define-embedding-functions) that you can use to convert your `float32` vectors to `binData` vectors.

#### Supported Drivers

BSON (Binary Javascript Object Notation) [BinData](https://www.mongodb.com/docs/manual/reference/method/BinData.md#std-label-server-binData-method) vectors are supported by the following drivers:

- [C++ Driver](https://www.mongodb.com/docs/languages/cpp/cpp-driver/current/) v4.1.0 or later

- [C#/.NET Driver](https://www.mongodb.com/docs/drivers/csharp/current/) v3.2.0 or later

- [Go Driver](https://www.mongodb.com/docs/drivers/go/current/) v2.1.0 or later

- [PyMongo Driver](https://www.mongodb.com/docs/drivers/pymongo/) v4.10 or later

- [Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/) v6.11 or later

- [Java Driver](https://www.mongodb.com/docs/drivers/java/sync/current/) v5.3.1 or later

#### Background

Float vectors are typically difficult to compress because each element in the array has its own type (despite most vectors being uniformly typed). For this reason, converting the float vector output of an embedding model to a `binData` vector with subtype `float32` is a more efficient serialization scheme. `binData` vectors store a single type descriptor for the entire vector, which reduces storage overhead.

### Validating Your Embeddings

Consider the following strategies to ensure that your embeddings are correct and optimal:

#### Best Practices

##### Learn best practices when creating embeddings.

Consider the following best practices when generating and querying your embeddings:

- **Test your functions and scripts**.

  Generating embeddings takes time and computational resources. Before you create embeddings from large datasets or collections, test that your embedding functions or scripts work as expected on a small subset of your data.

- **Create embeddings in batches**.

  If you want to generate embeddings from a large dataset or a collection with many documents, create them in batches to avoid memory issues and optimize performance.

- **Evaluate performance**.

  Run test queries to check if your search results are relevant and accurately ranked.

  To learn more about how to evaluate your results and fine-tune the performance of your indexes and queries, see [How to Measure the Accuracy of Your Query Results](https://www.mongodb.com/docs/vector-search/query/improve-accuracy.md#std-label-avs-improve-results) and [Benchmark for MongoDB Vector Search.](https://www.mongodb.com/docs/vector-search/benchmark/benchmark-tests.md#std-label-avs-performance-tuning)

#### Troubleshooting

##### Learn strategies to troubleshoot issues with your embeddings.

Consider the following strategies if you encounter issues with your embeddings:

- **Verify your environment**.

  Check that the necessary dependencies are installed and up-to-date. Conflicting library versions can cause unexpected behavior. Ensure that no conflicts exist by creating a new environment and installing only the required packages.

  **Note:**

  If you're using Colab, ensure that your notebook session's IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

- **Monitor memory usage**.

  If you experience performance issues, check your RAM, CPU, and disk usage to identify any potential bottlenecks. For hosted environments like Colab or Jupyter Notebooks, ensure that your instance is provisioned with sufficient resources and upgrade the instance if necessary.

- **Ensure consistent dimensions**.

  Verify that the MongoDB Vector Search index definition matches the dimensions of the embeddings stored in MongoDB and your query embeddings match the dimensions of the indexed embeddings. Otherwise, you might encounter errors when running vector search queries.

To troubleshoot specific problems, see [Troubleshooting.](https://www.mongodb.com/docs/vector-search/troubleshooting.md#std-label-vector-search-troubleshooting)

## Next Steps

Once you've learned how to create embeddings and query your embeddings with MongoDB Vector Search, start building generative AI applications by implementing retrieval-augmented generation (RAG):

- [Retrieval-Augmented Generation (RAG) with MongoDB](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-avs-rag)

- [Build a Local RAG Implementation with MongoDB Vector Search](https://www.mongodb.com/docs/vector-search/tutorials/local-rag.md#std-label-local-rag)

You can also quantize your 32-bit float vector embeddings into fewer bits to further reduce resource consumption and improve query speed. To learn more, see [About Quantization.](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type.md#std-label-avs-quantization)
