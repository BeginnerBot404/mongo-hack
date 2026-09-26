> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: macos-linux, windows
-->

# Voyage AI Quick Start

In this guide, you learn how to generate your first vector embeddings with Voyage AI and build a basic application.

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/blob/main/voyageai/notebooks/quickstart.ipynb)

## Create a Model API Key

To access Voyage AI models, create a model API key in the MongoDB Atlas UI.

1. [Sign up for a free Atlas account or log in.](https://www.mongodb.com/cloud/atlas/register?onboardingScenario=voyage)

   If you're new to Atlas, it creates an organization and project for you.

   To learn more, see [Create an Atlas Account.](https://www.mongodb.com/docs/atlas/tutorial/create-atlas-account.md#std-label-create-atlas-account)

2. Create a model API key for your project.

   In your Atlas project, select AI Model APIs from the navigation bar.

   Click Create model API key.

   Give the API key a name and then click Create.

   To learn more, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-manage-api-keys)

3. Set the API key in your environment.

   Copy the API key and store it in a safe location. Then, export the API key as an environment variable in your terminal so the Voyage client can access it.

   ### macOS / Linux

   ```bash
   export VOYAGE_API_KEY="<your-model-api-key>"
   ```

## Generate Your First Embeddings

In this section, you generate vector embeddings using a Voyage AI embedding model and the Python client.

![Voyage AI embedding diagram](/images/embedding-diagram.png)

1. Install the client.

   Run the following commands in your terminal to create your project and install the Voyage AI Python client.

   ```bash
   mkdir mongodb-voyage-quickstart
   cd mongodb-voyage-quickstart
   pip install --upgrade voyageai
   ```

2. Create your script.

   Create a file named `quickstart.py` in your project and paste the following code into it. This code initializes the Voyage AI client, defines sample texts, and uses the client to access the Voyage API to generate vector embeddings with the `voyage-4-large` model.

   For details, see [Python Client](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-python-client) or explore the [full API specification.](https://www.mongodb.com/docs/api/doc/atlas-embedding-and-reranking-api/)

   ```python
   import voyageai

   # Initialize Voyage client
   vo = voyageai.Client()

   # Sample texts
   texts = [
       "hello, world",
       "welcome to voyage ai!"
   ]

   # Generate embeddings
   result = vo.embed(
       texts,
       model="voyage-4-large"
   )

   print(f"Generated {len(result.embeddings)} embeddings")
   print(f"Each embedding has {len(result.embeddings[0])} dimensions")
   print(f"First embedding (truncated): {result.embeddings[0][:5]}...")
   ```

3. Run the script.

   Run the following command in your terminal to generate the embeddings.

   ```bash
   python quickstart.py
   ```

   **Output:**

   ```text
   Generated 2 embeddings
   Each embedding has 1024 dimensions
   First embedding (truncated): [0.05843968689441681, -0.035438042134046555, -0.059422507882118225, -0.018386829644441605, -0.04523468762636185]...

   ```

## Build a Basic RAG Application

Now that you know how to generate vector embeddings, build a basic [RAG](https://www.mongodb.com/docs/voyageai/index.md#std-term-RAG) application to learn how to use Voyage AI models to implement AI search and retrieval. RAG enables LLMs to generate context-aware responses by retrieving relevant information from your data before generating answers.

**Note:**

RAG applications require access to an LLM. This tutorial provides examples using Anthropic or OpenAI, but you can use any LLM provider of your choice.

![Basic Voyage AI RAG diagram](/images/quickstart-rag-diagram.png)

1. Install required packages.

   Run the following command in your terminal to install the required packages for the application:

   ```bash
   pip install numpy anthropic
   ```

   Export the API key as an environment variable in your terminal so the Anthropic client can access it.

   ### macOS / Linux

   ```bash
   export ANTHROPIC_API_KEY="<your-api-key>"
   ```

2. Build your application.

   Replace the contents of `quickstart.py` with the following code. This code does the following:

   - Uses **semantic search** to retrieve relevant texts based on their embeddings.

   - Adds **reranking** to refine search results by using a reranking model.

   - Implements **RAG** by giving an LLM the retrieved context to answer a question more accurately.

   ```python
   import voyageai
   import numpy as np
   import anthropic

   # Initialize clients (requires VOYAGE_API_KEY and ANTHROPIC_API_KEY environment variables)
   vo = voyageai.Client()
   claude = anthropic.Anthropic()

   # Sample documents
   documents = [
       "This quarter, our company is focused on building new products, increasing market share, and cutting costs.",
       "20th-century innovations, from radios to smartphones, centered on electronic advancements.",
       "Photosynthesis in plants converts light energy into glucose and produces essential oxygen."
   ]

   query = "What are my company's goals this quarter?"

   # Generate embeddings for documents
   doc_embeddings = vo.embed(
       texts=documents,
       model="voyage-4-large",
       input_type="document"
   ).embeddings

   # Generate embedding for query
   query_embedding = vo.embed(
       texts=[query],
       model="voyage-4-large",
       input_type="query"
   ).embeddings[0]

   # Calculate similarity scores using dot product
   similarities = np.dot(doc_embeddings, query_embedding)

   # Sort by similarity (np.argsort with negative sign sorts high to low)
   ranked_indices = np.argsort(-similarities)

   print(f"Semantic search result: {documents[ranked_indices[0]][:50]}...")
   print(f"Similarity score: {similarities[ranked_indices[0]]:.4f}\n")

   # Refine results with reranking model
   reranked = vo.rerank(query, documents, model="rerank-3", top_k=3)

   print("Reranked results:")
   for i, result in enumerate(reranked.results, 1):
       print(f"{i}. Score: {result.relevance_score:.4f} - {result.document[:50]}...")

   # Get the most relevant document as context
   context = reranked.results[0].document

   # Generate answer using retrieved context
   prompt = f"Based on this information: '{context}', answer: {query}"
   response = claude.messages.create(
       model="claude-sonnet-4-5-20250929",
       max_tokens=1024,
       messages=[{"role": "user", "content": prompt}]
   )

   print(f"\nQuestion: {query}")
   print(f"Answer: {response.content[0].text}")
   ```

3. Run the application.

   Run the following command in your terminal. Your output will vary depending on the LLM used.

   ```bash
   python quickstart.py
   ```

   **Output:**

   ```text
   Semantic search result: This quarter, our company is focused on building n...
   Similarity score: 0.5728

   Reranked results:
   1. Score: 0.8359 - This quarter, our company is focused on building n...
   2. Score: 0.2490 - 20th-century innovations, from radios to smartphon...
   3. Score: 0.2451 - Photosynthesis in plants converts light energy int...

   Question: What are my company's goals this quarter?
   Answer: ## Your Company's Goals This Quarter

   Based on the provided information, your company has **3 main goals** this quarter:

   1. 🛠️ **Building New Products** - Developing and launching new offerings
   2. 📈 **Increasing Market Share** - Growing the company's presence and position in the market
   3. ✂️ **Cutting Costs** - Reducing expenses to improve efficiency and profitability

   ```

   By using semantic search and reranking, you provide the LLM with relevant context that it otherwise would not have access to. As a result, the LLM generates a more grounded response, correctly responding to the user query.

1) Install required packages.

   Run the following command in your terminal to install the required packages for the application:

   ```bash
   pip install numpy openai
   ```

   Export the API key as an environment variable in your terminal so the OpenAI client can access it.

   ### macOS / Linux

   ```bash
   export OPENAI_API_KEY="<your-api-key>"
   ```

2) Build your application.

   Replace the contents of `quickstart.py` with the following code. This code does the following:

   - Uses **semantic search** to retrieve relevant texts based on their embeddings.

   - Adds **reranking** to refine search results by using a reranking model.

   - Implements **RAG** by giving an LLM the retrieved context to answer a question more accurately.

   ```python
   import voyageai
   import numpy as np
   from openai import OpenAI

   # Initialize clients (requires VOYAGE_API_KEY and OPENAI_API_KEY environment variables)
   vo = voyageai.Client()
   openai_client = OpenAI()

   # Sample documents
   documents = [
       "This quarter, our company is focused on building new products, increasing market share, and cutting costs.",
       "20th-century innovations, from radios to smartphones, centered on electronic advancements.",
       "Photosynthesis in plants converts light energy into glucose and produces essential oxygen."
   ]

   query = "What are my company's goals this quarter?"

   # Generate embeddings for documents
   doc_embeddings = vo.embed(
       texts=documents,
       model="voyage-4-large",
       input_type="document"
   ).embeddings

   # Generate embedding for query
   query_embedding = vo.embed(
       texts=[query],
       model="voyage-4-large",
       input_type="query"
   ).embeddings[0]

   # Calculate similarity scores using dot product
   similarities = np.dot(doc_embeddings, query_embedding)

   # Sort by similarity (np.argsort with negative sign sorts high to low)
   ranked_indices = np.argsort(-similarities)

   print(f"Semantic search result: {documents[ranked_indices[0]][:50]}...")
   print(f"Similarity score: {similarities[ranked_indices[0]]:.4f}\n")

   # Refine results with reranking model
   reranked = vo.rerank(query, documents, model="rerank-3", top_k=3)

   print("Reranked results:")
   for i, result in enumerate(reranked.results, 1):
       print(f"{i}. Score: {result.relevance_score:.4f} - {result.document[:50]}...")

   # Get the most relevant document as context
   context = reranked.results[0].document

   # Generate answer using retrieved context
   prompt = f"Based on this information: '{context}', answer: {query}"
   response = openai_client.chat.completions.create(
       model="gpt-4o",
       messages=[
           {"role": "system", "content": "You are a helpful assistant."},
           {"role": "user", "content": prompt}
       ]
   )

   print(f"\nQuestion: {query}")
   print(f"Answer: {response.choices[0].message.content}")
   ```

3) Run the application.

   Run the following command in your terminal. Your output will vary depending on the LLM used.

   ```bash
   python quickstart.py
   ```

   **Output:**

   ```text
   Semantic search result: This quarter, our company is focused on building n...
   Similarity score: 0.5728

   Reranked results:
   1. Score: 0.8359 - This quarter, our company is focused on building n...
   2. Score: 0.2490 - 20th-century innovations, from radios to smartphon...
   3. Score: 0.2451 - Photosynthesis in plants converts light energy int...

   Question: What are my company's goals this quarter?
   Answer: Your company's goals this quarter are:

   1. Building new products.
   2. Increasing market share.
   3. Cutting costs.

   ```

   By using semantic search and reranking, you provide the LLM with relevant context that it otherwise would not have access to. As a result, the LLM generates a more grounded response, correctly responding to the user query.

## Learning Summary

Now that you've created your first application with Voyage AI, expand the following sections to learn more about the concepts covered in this quick start:

### Models Used

You used the `voyage-4-large` embedding model to convert text into 1024-dimensional vectors. Each dimension represents a learned feature that captures aspects of the text's meaning.

You also used the `rerank-3` reranking model to refine your search results against the query. Higher scores indicate stronger similarity between the query and document content.

To learn more, see [Voyage AI Embedding and Reranking Models Overview.](https://www.mongodb.com/docs/voyageai/models.md#std-label-voyage-models)

### API and Client

You used the `voyageai` Python SDK to access the [Embedding and Reranking API](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-api-and-clients). When calling the models using the SDK, you specified the `input_type` parameter to improve search accuracy:

- `document`: To optimize the embeddings that represent your data.

- `query`: To optimize your query embeddings.

To learn more, see [Text Embeddings Usage](https://www.mongodb.com/docs/voyageai/models/text-embeddings.md#std-label-voyage-text-embeddings-usage) and [Specifying Input Type.](https://www.mongodb.com/docs/voyageai/api-reference/overview.md#std-label-voyage-input-type)

### Semantic Search

You used the dot product similarity function to find semantically similar documents. Numpy is an open-source library that provides built-in functions for vector operations, and this application uses the `dot()` and `argsort()` functions to compute the dot product similarity between the query and document embeddings, and then sort the documents by their similarity scores.

To learn more about semantic search, see [Semantic Search with Voyage AI Embeddings](https://www.mongodb.com/docs/voyageai/tutorials/semantic-search.md#std-label-voyage-semantic-search). For more details on text embeddings usage and the `input_type` parameter, see [Usage.](https://www.mongodb.com/docs/voyageai/models/text-embeddings.md#std-label-voyage-text-embeddings-usage)

### RAG

You combined semantic search and reranking with an LLM to create a basic RAG system. The system retrieves relevant documents using semantic search, reranks them, and then provides the most relevant document to an LLM to generate accurate, grounded responses to your queries.

To learn more about RAG, see [Retrieval-Augmented Generation (RAG) with Voyage AI.](https://www.mongodb.com/docs/voyageai/tutorials/rag.md#std-label-voyage-rag)

## Next Steps

To continue learning, see the following resources:

| Skill Level | Documentation Resources |
| --- | --- |
| Basic | [See all available models](https://www.mongodb.com/docs/voyageai/models.md#std-label-voyage-models)[Learn about the ways to access the API](https://www.mongodb.com/docs/voyageai/api-and-clients.md#std-label-voyage-api-client) |
| Intermediate | [Build a Semantic Search Application](https://www.mongodb.com/docs/voyageai/tutorials/semantic-search.md#std-label-voyage-semantic-search)[Build a RAG Application with Voyage AI](https://www.mongodb.com/docs/voyageai/tutorials/rag.md#std-label-voyage-rag)[Get Started with MongoDB Vector Search](https://www.mongodb.com/docs/vector-search/tutorials/quick-start.md#std-label-vector-search-quick-start) |
