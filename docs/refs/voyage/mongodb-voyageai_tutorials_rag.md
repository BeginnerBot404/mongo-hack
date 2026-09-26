> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Retrieval-Augmented Generation (RAG) with Voyage AI

Retrieval-augmented generation (RAG) is an architecture that uses [semantic search](https://www.mongodb.com/docs/voyageai/tutorials/semantic-search.md#std-label-voyage-semantic-search) to augment large language models (LLMs) with additional data, enabling them to generate more accurate responses.

While semantic search retrieves relevant documents based on meaning, RAG takes this a step further by providing those retrieved documents as context to an LLM. This additional context helps the LLM generate a more accurate response to a user's query, reducing hallucinations. Voyage AI provides best-in-class embedding and reranking models to power retrieval for your RAG applications.

To try RAG without writing any code, use the [Playground](https://search-playground.mongodb.com/tools/chatbot-demo-builder/snapshots/new) to build an AI chatbot powered by Voyage AI. To learn more, see [Chatbot Demo Builder.](https://www.mongodb.com/docs/vector-search/query/vector-search-playground.md#std-label-avs-playground)

![Diagram of RAG architecture](/images/rag-diagram.png)

## Tutorial

The following tutorial demonstrates how to implement RAG with Voyage embeddings.

You can also work with the code for this tutorial by cloning the [GitHub repository.](https://github.com/mongodb/docs-notebooks/blob/main/voyageai/)

### Prerequisites

To complete this tutorial, you must have the following:

- A model API key to access Voyage AI. For instructions, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-manage-api-keys)

- An LLM API key. This tutorial provides examples using [OpenAI](https://platform.openai.com/docs/api-keys) or [Anthropic](https://console.anthropic.com/), but you can use any LLM provider.

- Python 3.8 or later installed.

### Procedure

Complete the following steps to implement RAG with Voyage AI embeddings and in-memory vector storage.

**Note:**

Storing vector embeddings in memory is suitable for smaller datasets that fit in RAM. For larger datasets or persistent storage, use a database that supports vector storage and retrieval like MongoDB.

1. Set up the environment.

   Initialize the project and install dependencies.

   Run the following commands in your terminal to create a new project directory and install the required dependencies:

   ```bash
   mkdir voyage-rag
   cd voyage-rag
   pip install --quiet --upgrade numpy voyageai openai langchain langchain_community langchain-text-splitters pypdf python-dotenv
   ```

   Configure the environment.

   Create a `.env` file in your project directory with your API keys:

   ```none
   VOYAGE_API_KEY="<your_voyage_api_key>"
   OPENAI_API_KEY="<your_openai_api_key>"
   ```

2. Create the RAG application.

   Create a file named `rag.py` and copy the following code.

   This code loads a MongoDB earnings report PDF, splits it into chunks, generates embeddings using Voyage AI's `voyage-4-large` model, stores them in memory, and uses an LLM to answer questions about the content. You can replace the PDF with your own data.

   ```python
   import os
   import numpy as np
   from openai import OpenAI
   from voyageai import Client as VoyageClient
   from langchain_community.document_loaders import PyPDFLoader
   from langchain_text_splitters import RecursiveCharacterTextSplitter
   from dotenv import load_dotenv

   load_dotenv()

   # Initialize clients
   voyage_client = VoyageClient(api_key=os.getenv("VOYAGE_API_KEY"))
   openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

   # Configuration
   VOYAGE_MODEL = "voyage-4-large"
   OPENAI_MODEL = "gpt-4o"

   # In-memory storage
   documents = []
   embeddings = []

   # Generate embedding for a single text using Voyage AI
   def get_embedding(text, input_type="document"):
       result = voyage_client.embed(
           [text],
           model=VOYAGE_MODEL,
           input_type=input_type
       )
       return np.array(result.embeddings[0], dtype=np.float32)

   # Load PDF, split into chunks, and generate embeddings
   def ingest_data():
       # Load the PDF
       loader = PyPDFLoader("https://investors.mongodb.com/node/13576/pdf")
       data = loader.load()

       # Split into chunks
       text_splitter = RecursiveCharacterTextSplitter(
           chunk_size=400,
           chunk_overlap=20
       )
       chunks = text_splitter.split_documents(data)

       # Generate embeddings and store in memory
       for chunk in chunks:
           embedding = get_embedding(chunk.page_content)
           documents.append(chunk.page_content)
           embeddings.append(embedding)

   # Retrieve top-k most relevant documents
   def retrieve_documents(query, top_k=5):
       # Generate query embedding
       query_embedding = get_embedding(query, input_type="query")

       # Calculate similarity scores using dot product
       embeddings_array = np.array(embeddings)
       similarities = np.dot(embeddings_array, query_embedding)

       # Get top-k most similar documents
       top_indices = np.argsort(similarities)[::-1][:top_k]

       results = []
       for idx in top_indices:
           results.append({
               "text": documents[idx],
               "score": float(similarities[idx])
           })

       return results

   # Generate response using retrieved documents and OpenAI
   def generate_response(query):
       # Retrieve relevant documents
       retrieved_docs = retrieve_documents(query)

       # Combine retrieved documents into context
       context = "\n\n".join([doc["text"] for doc in retrieved_docs])

       # Create prompt with context
       prompt = f"""Based on the following information, answer the question.

   Context:
   {context}

   Question: {query}

   Answer:"""

       # Generate response with OpenAI
       response = openai_client.chat.completions.create(
           model=OPENAI_MODEL,
           messages=[
               {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided context."},
               {"role": "user", "content": prompt}
           ]
       )

       return response.choices[0].message.content

   if __name__ == "__main__":
       # Ingest data
       ingest_data()
       
       # Example query
       query = "What are MongoDB's latest AI announcements?"
       print(f"\nQuery: {query}\n")
       
       # Generate and print response
       response = generate_response(query)
       print(f"Response:\n{response}")

   ```

3. Run the application.

   Run the following command in your terminal:

   ```bash
   python rag.py
   ```

   **Output:**

   ```markdown
   Query: What are MongoDB's latest AI announcements?

   Response:
   MongoDB's latest AI announcements include the launch of several new Voyage AI models, such as voyage-context-3 and rerank-2.5. Additionally, MongoDB expanded its AI partner ecosystem with major providers, including LangChain, and added new members like Temporal and Galileo. These innovations aim to make it faster and easier for customers to build accurate, trustworthy, and reliable AI applications at scale.

   ```

   The application retrieves relevant documents from the provided PDF and generates an accurate response based on the context.

### Prerequisites

To complete this tutorial, you must have the following:

- A model API key to access Voyage AI. For instructions, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-manage-api-keys)

- An LLM API key. This tutorial provides examples using [OpenAI](https://platform.openai.com/docs/api-keys) or [Anthropic](https://console.anthropic.com/), but you can use any LLM provider.

- Python 3.8 or later installed.

### Procedure

Complete the following steps to implement RAG with Voyage AI embeddings and in-memory vector storage.

**Note:**

Storing vector embeddings in memory is suitable for smaller datasets that fit in RAM. For larger datasets or persistent storage, use a database that supports vector storage and retrieval like MongoDB.

1. Set up the environment.

   Initialize the project and install dependencies.

   Run the following commands in your terminal to create a new project directory and install the required dependencies:

   ```bash
   mkdir voyage-rag
   cd voyage-rag
   pip install --quiet --upgrade numpy voyageai anthropic langchain langchain_community langchain-text-splitters pypdf python-dotenv
   ```

   Configure the environment.

   Create a `.env` file in your project directory with your API keys:

   ```none
   VOYAGE_API_KEY="<your_voyage_api_key>"
   ANTHROPIC_API_KEY="<your_anthropic_api_key>"
   ```

2. Create the RAG application.

   Create a file named `rag.py` and copy the following code.

   This code loads a MongoDB earnings report PDF, splits it into chunks, generates embeddings using Voyage AI's `voyage-4-large` model, stores them in memory, and uses an LLM to answer questions about the content. You can replace the PDF with your own data.

   ```python
   import os
   import numpy as np
   from anthropic import Anthropic
   from voyageai import Client as VoyageClient
   from langchain_community.document_loaders import PyPDFLoader
   from langchain_text_splitters import RecursiveCharacterTextSplitter
   from dotenv import load_dotenv

   load_dotenv()

   # Initialize clients
   voyage_client = VoyageClient(api_key=os.getenv("VOYAGE_API_KEY"))
   anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

   # Configuration
   VOYAGE_MODEL = "voyage-4-large"
   ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929"

   # In-memory storage
   documents = []
   embeddings = []

   # Generate embedding for a single text using Voyage AI
   def get_embedding(text, input_type="document"):
       result = voyage_client.embed(
           [text],
           model=VOYAGE_MODEL,
           input_type=input_type
       )
       return np.array(result.embeddings[0], dtype=np.float32)

   # Load PDF, split into chunks, and generate embeddings
   def ingest_data():
       # Load the PDF
       loader = PyPDFLoader("https://investors.mongodb.com/node/13576/pdf")
       data = loader.load()

       # Split into chunks
       text_splitter = RecursiveCharacterTextSplitter(
           chunk_size=400,
           chunk_overlap=20
       )
       chunks = text_splitter.split_documents(data)

       # Generate embeddings and store in memory
       for chunk in chunks:
           embedding = get_embedding(chunk.page_content)
           documents.append(chunk.page_content)
           embeddings.append(embedding)

   # Retrieve top-k most relevant documents
   def retrieve_documents(query, top_k=5):
       # Generate query embedding
       query_embedding = get_embedding(query, input_type="query")

       # Calculate similarity scores using dot product
       embeddings_array = np.array(embeddings)
       similarities = np.dot(embeddings_array, query_embedding)

       # Get top-k most similar documents
       top_indices = np.argsort(similarities)[::-1][:top_k]

       results = []
       for idx in top_indices:
           results.append({
               "text": documents[idx],
               "score": float(similarities[idx])
           })

       return results

   # Generate response using retrieved documents and Anthropic
   def generate_response(query):
       # Retrieve relevant documents
       retrieved_docs = retrieve_documents(query)

       # Combine retrieved documents into context
       context = "\n\n".join([doc["text"] for doc in retrieved_docs])

       # Create prompt with context
       prompt = f"""Based on the following information, answer the question.

   Context:
   {context}

   Question: {query}

   Answer:"""

       # Generate response with Anthropic
       response = anthropic_client.messages.create(
           model=ANTHROPIC_MODEL,
           max_tokens=1024,
           system="You are a helpful assistant that answers questions based on the provided context.",
           messages=[
               {"role": "user", "content": prompt}
           ]
       )

       return response.content[0].text

   if __name__ == "__main__":
       # Ingest data
       ingest_data()
       
       # Example query
       query = "What were MongoDB's latest AI announcements?"
       print(f"\nQuery: {query}\n")
       
       # Generate and print response
       response = generate_response(query)
       print(f"Response:\n{response}")


   ```

3. Run the application.

   Run the following command in your terminal:

   ```bash
   python rag.py
   ```

   **Output:**

   ```markdown
   Query: What are MongoDB's latest AI announcements?

   Response:
   MongoDB's latest AI announcements include the launch of several new Voyage AI models, such as voyage-context-3 and rerank-2.5. Additionally, MongoDB expanded its AI partner ecosystem with major providers, including LangChain, and added new members like Temporal and Galileo. These innovations aim to make it faster and easier for customers to build accurate, trustworthy, and reliable AI applications at scale.

   ```

   The application retrieves relevant documents from the provided PDF and generates an accurate response based on the context.

### Prerequisites

To complete this tutorial, you must have the following:

- A model API key to access Voyage AI. For instructions, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-manage-api-keys)

- An LLM API key. This tutorial provides examples using [OpenAI](https://platform.openai.com/docs/api-keys) or [Anthropic](https://console.anthropic.com/), but you can use any LLM provider.

- Python 3.8 or later installed.

* A MongoDB cluster. You can use a free tier cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) or a local MongoDB deployment.

  **Note:**

  While this tutorial uses MongoDB for vector storage and retrieval, you can use any vector database or search solution that supports vector similarity search.

### Procedure

Complete the following steps to implement RAG with Voyage AI embeddings and MongoDB.

1. Set up the environment.

   Initialize the project and install dependencies.

   Run the following commands in your terminal to create a new project directory and install the required dependencies:

   ```bash
   mkdir voyage-rag
   cd voyage-rag
   pip install --quiet --upgrade pymongo voyageai openai langchain langchain_community langchain-text-splitters pypdf python-dotenv
   ```

   **Note:**

   Your project will use the following structure:

   ```text
   voyage-rag
   ├── .env
   ├── config.py
   ├── ingest_data.py
   ├── retrieve_data.py
   ├── generate_response.py
   ├── main.py
   ```

   Configure the environment.

   Create a `.env` file in your project directory and paste the following into it. Replace the placeholder values with your actual credentials. To learn how to find your MongoDB connection strings, see [Connection Strings.](https://www.mongodb.com/docs/manual/reference/connection-string.md#std-label-mongodb-uri)

   ```none
   MONGODB_URI="<your-mongodb-connection-string>"
   VOYAGE_API_KEY="<your-model-api-key>"
   OPENAI_API_KEY="<your-openai-api-key>"


   ```

2. Configure the application.

   Create a file named `config.py` in your project and paste the code below into it. This file reads in your environment variables and connects the application to MongoDB and the AI services.

   ###### config.py

   ###### Copy and paste the following code into your config.py file.

   ```python
   from pymongo import MongoClient
   from openai import OpenAI
   import voyageai
   from dotenv import load_dotenv
   import os

   # Load environment variables from .env file
   load_dotenv()

   # Environment variables (private)
   MONGODB_URI = os.getenv("MONGODB_URI")
   VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY")
   OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
     
   # MongoDB cluster configuration
   mongo_client = MongoClient(MONGODB_URI)
   rag_db = mongo_client["rag_db"]
   collection = rag_db["test"]

   # Model configuration
   voyage_client = voyageai.Client(api_key=VOYAGE_API_KEY)
   openai_client = OpenAI(api_key=OPENAI_API_KEY)
   VOYAGE_MODEL = "voyage-4-large"
   OPENAI_MODEL = "gpt-4o"


   ```

3. Ingest data into MongoDB.

   Create a file named `ingest_data.py` in your project. This file ingests sample data into MongoDB that LLMs don't have access to. This code does the following:

   - Defines a function named `get_embedding()` that generates vector embeddings by using the `voyage-4-large` embedding model from Voyage AI. The function specifies the `input_type` parameter to optimize your embeddings for retrieval.

   - Loads a PDF that contains a recent [MongoDB earnings report.](https://investors.mongodb.com/node/13576/pdf)

   - Splits the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   - Prepares the chunked documents and inserts them into a MongoDB collection named `rag_db.test`.

   - Creates a MongoDB vector search index to enable vector search on the `embedding` field.

   ###### ingest\_data.py

   ###### Copy and paste the following code into your ingest\_data.py file.

   ```python
   from config import collection, voyage_client, VOYAGE_MODEL
   from pymongo.operations import SearchIndexModel
   from langchain_community.document_loaders import PyPDFLoader
   from langchain_text_splitters import RecursiveCharacterTextSplitter

   import time

   def get_embedding(data, input_type = "document"):
     embeddings = voyage_client.embed(
         data, model = VOYAGE_MODEL, input_type = input_type
     ).embeddings
     return embeddings[0]

   def ingest_data():
       # Load the PDF
       loader = PyPDFLoader("https://investors.mongodb.com/node/13576/pdf")
       data = loader.load()

       # Split the data into chunks
       text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=20)
       documents = text_splitter.split_documents(data)

       # Generate embeddings and prepare documents
       docs_to_insert = []
       for doc in documents:
           embedding = get_embedding(doc.page_content)
           if embedding:
               docs_to_insert.append({
                   "text": doc.page_content,
                   "embedding": embedding
               })

       # Insert documents into the collection
       if docs_to_insert:
           collection.insert_many(docs_to_insert)

   def create_vector_index():
       index_name = "vector_index"

       # Check if index already exists
       existing_indexes = list(collection.list_search_indexes(index_name))
       if existing_indexes:
           if existing_indexes[0].get("queryable"):
               return
       else:
           # Create the search index
           print("Creating vector search index...")
           search_index_model = SearchIndexModel(
               definition = {
                   "fields": [
                       {
                           "type": "vector",
                           "numDimensions": 1024,
                           "path": "embedding",
                           "similarity": "dotProduct"
                       }
                   ]
               },
               name=index_name,
               type="vectorSearch"
           )

           collection.create_search_index(model=search_index_model)

       # Wait for index to become queryable
       predicate = lambda index: index.get("queryable") is True

       while True:
           indices = list(collection.list_search_indexes(index_name))
           if len(indices) and predicate(indices[0]):
               break
           time.sleep(5)

   if __name__ == "__main__":
       ingest_data()
       create_vector_index()


   ```

4. Retrieve documents with Voyage AI and vector search.

   Create a file named `retrieve_data.py` in your project and paste the code below into it. This file defines a function that uses MongoDB Vector Search to get relevant documents from your vector database. This code does the following:

   - Uses the `get_embedding()` function to create embeddings from the search query. The `input_type` parameter is set to `query` to optimize Voyage AI embeddings for retrieval.

   - Runs a MongoDB [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) aggregation pipeline to return the top 5 semantically similar documents.

   - Projects only the `text` field from the results.

   ###### retrieve\_data.py

   ###### Copy and paste the following code into your retrieve\_data.py file.

   ```python
   from config import collection
   from ingest_data import get_embedding

   def get_query_results(query):
       # Generate query embedding
       query_embedding = get_embedding(query, input_type="query")

       # Define the aggregation pipeline
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
                   "text": 1
               }
           }
       ]

       # Execute the query
       results = collection.aggregate(pipeline)

       # Convert results to array
       array_of_results = []
       for doc in results:
           array_of_results.append(doc)

       return array_of_results

   if __name__ == "__main__":
       import pprint
       query = input("Enter your query: ").strip()
       results = get_query_results(query)
       pprint.pprint(results)


   ```

5. Generate responses with the LLM.

   Create a file named `generate_response.py` in your project and paste the code below into it. This code retrieves relevant documents using Voyage AI embeddings and MongoDB Vector Search, and then provides the LLM with these documents as context to generate a response.

   ###### generate\_response.py

   ###### Copy and paste the following code into your generate\_response.py file.

   ```python
   from config import openai_client, OPENAI_MODEL
   from retrieve_data import get_query_results

   def generate_response(query):
       # Retrieve relevant documents
       context_docs = get_query_results(query)

       # Convert documents to string
       context_string = " ".join([doc["text"] for doc in context_docs])

       # Construct prompt for the LLM
       prompt = f"""Use the following pieces of context to answer the question at the end.
           {context_string}
           Question: {query}
       """

       # Call the LLM
       completion = openai_client.chat.completions.create(
           model=OPENAI_MODEL,
           messages=[{
               "role": "user",
               "content": prompt
           }]
       )

       return completion.choices[0].message.content

   if __name__ == "__main__":
       query = "What are MongoDB's latest AI announcements?"
       response = generate_response(query)
       print(response)


   ```

6. Run the application.

   Create a file named `main.py` in your project and paste the code below into it. This file orchestrates the complete RAG pipeline by calling the functions you defined in the previous steps.

   ###### main.py

   ###### Copy and paste the following code into your main.py file.

   ```python
   from ingest_data import ingest_data, create_vector_index
   from generate_response import generate_response

   def main():
       # Ask if user wants to ingest data
       ingest_choice = input("Do you want to ingest data into MongoDB? (Y/N): ").strip().upper()

       if ingest_choice == 'Y':
           ingest_data()

       # Create vector search index (checks if exists)
       create_vector_index()

       # Get user's question
       query = input("\nEnter your question: ").strip()

       # Generate response
       response = generate_response(query)
       print(f"\nAnswer: {response}")

   if __name__ == "__main__":
       main()


   ```

   Run the following command in your terminal to run the application. It will perform the following steps:

   1. Prompt you to ingest data into the vector database.

      Enter `Y` on first run and `N` on subsequent runs.

   2. Create a vector search index, if it does not already exist.

   3. Prompt you to enter a question.

   4. Generate a response to your question using RAG.

   The generated response might vary.

   ```bash
   python main.py
   ```

   **Output:**

   ```none
   Do you want to ingest data into MongoDB? (Y/N): 
   Enter your question: 
   Answer: ## Latest Voyage AI Announcements

   Based on the provided context, MongoDB announced several new **Voyage AI models** as part of their broader product innovations and AI partner ecosystem expansions. The key announcements include:

   1. **voyage-context-3** - A newly launched Voyage AI model
   2. **rerank-2.5** - Another newly launched Voyage AI model

   These launches are part of MongoDB's initiative to make it **faster and easier** for customers to build:
   - ✅ Accurate AI applications
   - ✅ Trustworthy AI applications
   - ✅ Reliable AI applications at scale

   Additionally, MongoDB also announced the **expansion of partnerships with major AI** providers (though the full details of those partners appear to be cut off in the provided context).

   > **Note:** The context provided is repetitive and may be incomplete, so there could be additional details about these announcements not captured in the available information.

   ```

### Prerequisites

To complete this tutorial, you must have the following:

- A model API key to access Voyage AI. For instructions, see [Manage Voyage AI Model API Keys.](https://www.mongodb.com/docs/voyageai/management/api-keys.md#std-label-voyage-manage-api-keys)

- An LLM API key. This tutorial provides examples using [OpenAI](https://platform.openai.com/docs/api-keys) or [Anthropic](https://console.anthropic.com/), but you can use any LLM provider.

- Python 3.8 or later installed.

* A MongoDB cluster. You can use a free tier cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) or a local MongoDB deployment.

  **Note:**

  While this tutorial uses MongoDB for vector storage and retrieval, you can use any vector database or search solution that supports vector similarity search.

### Procedure

Complete the following steps to implement RAG with Voyage AI embeddings and MongoDB.

1. Set up the environment.

   Initialize the project and install dependencies.

   Run the following commands in your terminal to create a new project directory and install the required dependencies:

   ```bash
   mkdir voyage-rag
   cd voyage-rag
   pip install --quiet --upgrade pymongo voyageai anthropic langchain langchain_community langchain-text-splitters pypdf python-dotenv
   ```

   **Note:**

   Your project will use the following structure:

   ```text
   voyage-rag
   ├── .env
   ├── config.py
   ├── ingest_data.py
   ├── retrieve_data.py
   ├── generate_response.py
   ├── main.py
   ```

   Configure the environment.

   Create a `.env` file in your project directory and paste the following into it. Replace the placeholder values with your actual credentials. To learn how to find your MongoDB connection strings, see [Connection Strings.](https://www.mongodb.com/docs/manual/reference/connection-string.md#std-label-mongodb-uri)

   ```none
   MONGODB_URI="<your-mongodb-connection-string>"
   VOYAGE_API_KEY="<your-model-api-key>"
   ANTHROPIC_API_KEY="<your-anthropic-api-key>"
   ```

2. Configure the application.

   Create a file named `config.py` in your project and paste the code below into it. This file reads in your environment variables and connects the application to MongoDB and the AI services.

   ###### config.py

   ###### Copy and paste the following code into your config.py file.

   ```python
   from pymongo import MongoClient
   from anthropic import Anthropic
   import voyageai
   from dotenv import load_dotenv
   import os

   # Load environment variables from .env file
   load_dotenv()

   # Environment variables (private)
   MONGODB_URI = os.getenv("MONGODB_URI")
   VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY")
   ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
     
   # MongoDB cluster configuration
   mongo_client = MongoClient(MONGODB_URI)
   rag_db = mongo_client["rag_db"]
   collection = rag_db["test"]

   # Model configuration
   voyage_client = voyageai.Client(api_key=VOYAGE_API_KEY)
   anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY)
   VOYAGE_MODEL = "voyage-4-large"
   ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929"

   ```

3. Ingest data into MongoDB.

   Create a file named `ingest_data.py` in your project. This file ingests sample data into MongoDB that LLMs don't have access to. This code does the following:

   - Defines a function named `get_embedding()` that generates vector embeddings by using the `voyage-4-large` embedding model from Voyage AI. The function specifies the `input_type` parameter to optimize your embeddings for retrieval.

   - Loads a PDF that contains a recent [MongoDB earnings report.](https://investors.mongodb.com/node/13576/pdf)

   - Splits the data into chunks, specifying the *chunk size* (number of characters) and *chunk overlap* (number of overlapping characters between consecutive chunks).

   - Prepares the chunked documents and inserts them into a MongoDB collection named `rag_db.test`.

   - Creates a MongoDB vector search index to enable vector search on the `embedding` field.

   ###### ingest\_data.py

   ###### Copy and paste the following code into your ingest\_data.py file.

   ```python
   from config import collection, voyage_client, VOYAGE_MODEL
   from pymongo.operations import SearchIndexModel
   from langchain_community.document_loaders import PyPDFLoader
   from langchain_text_splitters import RecursiveCharacterTextSplitter

   import time

   def get_embedding(data, input_type = "document"):
     embeddings = voyage_client.embed(
         data, model = VOYAGE_MODEL, input_type = input_type
     ).embeddings
     return embeddings[0]

   def ingest_data():
       # Load the PDF
       loader = PyPDFLoader("https://investors.mongodb.com/node/13576/pdf")
       data = loader.load()

       # Split the data into chunks
       text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=20)
       documents = text_splitter.split_documents(data)

       # Generate embeddings and prepare documents
       docs_to_insert = []
       for doc in documents:
           embedding = get_embedding(doc.page_content)
           if embedding:
               docs_to_insert.append({
                   "text": doc.page_content,
                   "embedding": embedding
               })

       # Insert documents into the collection
       if docs_to_insert:
           collection.insert_many(docs_to_insert)

   def create_vector_index():
       index_name = "vector_index"

       # Check if index already exists
       existing_indexes = list(collection.list_search_indexes(index_name))
       if existing_indexes:
           if existing_indexes[0].get("queryable"):
               return
       else:
           # Create the search index
           print("Creating vector search index...")
           search_index_model = SearchIndexModel(
               definition = {
                   "fields": [
                       {
                           "type": "vector",
                           "numDimensions": 1024,
                           "path": "embedding",
                           "similarity": "dotProduct"
                       }
                   ]
               },
               name=index_name,
               type="vectorSearch"
           )

           collection.create_search_index(model=search_index_model)

       # Wait for index to become queryable
       predicate = lambda index: index.get("queryable") is True

       while True:
           indices = list(collection.list_search_indexes(index_name))
           if len(indices) and predicate(indices[0]):
               break
           time.sleep(5)

   if __name__ == "__main__":
       ingest_data()
       create_vector_index()


   ```

4. Retrieve documents with Voyage AI and vector search.

   Create a file named `retrieve_data.py` in your project and paste the code below into it. This file defines a function that uses MongoDB Vector Search to get relevant documents from your vector database. This code does the following:

   - Uses the `get_embedding()` function to create embeddings from the search query. The `input_type` parameter is set to `query` to optimize Voyage AI embeddings for retrieval.

   - Runs a MongoDB [`$vectorSearch`](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#mongodb-pipeline-pipe.-vectorSearch) aggregation pipeline to return the top 5 semantically similar documents.

   - Projects only the `text` field from the results.

   ###### retrieve\_data.py

   ###### Copy and paste the following code into your retrieve\_data.py file.

   ```python
   from config import collection
   from ingest_data import get_embedding

   def get_query_results(query):
       # Generate query embedding
       query_embedding = get_embedding(query, input_type="query")

       # Define the aggregation pipeline
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
                   "text": 1
               }
           }
       ]

       # Execute the query
       results = collection.aggregate(pipeline)

       # Convert results to array
       array_of_results = []
       for doc in results:
           array_of_results.append(doc)

       return array_of_results

   if __name__ == "__main__":
       import pprint
       query = input("Enter your query: ").strip()
       results = get_query_results(query)
       pprint.pprint(results)


   ```

5. Generate responses with the LLM.

   Create a file named `generate_response.py` in your project and paste the code below into it. This code retrieves relevant documents using Voyage AI embeddings and MongoDB Vector Search, and then provides the LLM with these documents as context to generate a response.

   ###### generate\_response.py

   ###### Copy and paste the following code into your generate\_response.py file.

   ```python
   from config import anthropic_client, ANTHROPIC_MODEL
   from retrieve_data import get_query_results

   def generate_response(query):
       # Retrieve relevant documents
       context_docs = get_query_results(query)

       # Convert documents to string
       context_string = " ".join([doc["text"] for doc in context_docs])

       # Construct prompt for the LLM
       prompt = f"""Use the following pieces of context to answer the question at the end.
           {context_string}
           Question: {query}
       """

       # Call the LLM
       message = anthropic_client.messages.create(
           model=ANTHROPIC_MODEL,
           max_tokens=1024,
           messages=[{
               "role": "user",
               "content": prompt
           }]
       )

       return message.content[0].text

   if __name__ == "__main__":
       query = "What are MongoDB's latest AI announcements?"
       response = generate_response(query)
       print(response)


   ```

6. Run the application.

   Create a file named `main.py` in your project and paste the code below into it. This file orchestrates the complete RAG pipeline by calling the functions you defined in the previous steps.

   ###### main.py

   ###### Copy and paste the following code into your main.py file.

   ```python
   from ingest_data import ingest_data, create_vector_index
   from generate_response import generate_response

   def main():
       # Ask if user wants to ingest data
       ingest_choice = input("Do you want to ingest data into MongoDB? (Y/N): ").strip().upper()

       if ingest_choice == 'Y':
           ingest_data()

       # Create vector search index (checks if exists)
       create_vector_index()

       # Get user's question
       query = input("\nEnter your question: ").strip()

       # Generate response
       response = generate_response(query)
       print(f"\nAnswer: {response}")

   if __name__ == "__main__":
       main()


   ```

   Run the following command in your terminal to run the application. It will perform the following steps:

   1. Prompt you to ingest data into the vector database.

      Enter `Y` on first run and `N` on subsequent runs.

   2. Create a vector search index, if it does not already exist.

   3. Prompt you to enter a question.

   4. Generate a response to your question using RAG.

   The generated response might vary.

   ```bash
   python main.py
   ```

   **Output:**

   ```none
   Do you want to ingest data into MongoDB? (Y/N): 
   Enter your question: 
   Answer: ## Latest Voyage AI Announcements

   Based on the provided context, MongoDB announced several new **Voyage AI models** as part of their broader product innovations and AI partner ecosystem expansions. The key announcements include:

   1. **voyage-context-3** - A newly launched Voyage AI model
   2. **rerank-2.5** - Another newly launched Voyage AI model

   These launches are part of MongoDB's initiative to make it **faster and easier** for customers to build:
   - ✅ Accurate AI applications
   - ✅ Trustworthy AI applications
   - ✅ Reliable AI applications at scale

   Additionally, MongoDB also announced the **expansion of partnerships with major AI** providers (though the full details of those partners appear to be cut off in the provided context).

   > **Note:** The context provided is repetitive and may be incomplete, so there could be additional details about these announcements not captured in the available information.

   ```

## Why use RAG?

When working with LLMs, you might encounter the following limitations:

- **Stale data**: LLMs are trained on a static dataset up to a certain point in time. This means that they have a limited knowledge base and might use outdated data.

- **No access to additional data**: LLMs don't have access to local, personalized, or domain-specific data. Therefore, they can lack knowledge about specific domains.

- **Hallucinations**: When using incomplete or outdated data, LLMs can generate inaccurate responses.

RAG addresses these limitations by adding a retrieval step, typically powered by [semantic search](https://www.mongodb.com/docs/voyageai/tutorials/semantic-search.md#std-label-voyage-semantic-search), to get relevant documents in real time. Providing additional context helps LLMs generate more accurate responses. This makes RAG an effective architecture for building AI chatbots that deliver personalized, domain-specific question answering and text generation.

### What are Vector Databases?

Vector databases are specialized databases designed to store and efficiently retrieve vector embeddings. While storing vectors in memory is suitable for prototyping and experimentation, production RAG applications typically require a vector database to perform efficient retrieval from a larger corpus.

MongoDB has native support for vector storage and retrieval, making it a convenient choice for storing and searching vector embeddings alongside your other data. To learn more, see [MongoDB Vector Search Overview.](https://www.mongodb.com/docs/vector-search.md#std-label-avs-overview)

## Next Steps

For additional tutorials, see the following resources:

- To learn how to implement RAG with popular LLM frameworks and AI services, see [MongoDB AI Integrations and Partners.](https://www.mongodb.com/docs/atlas/ai-integrations.md#std-label-ai-integrations)

- To build AI agents and implement agentic RAG, see [Build AI Agents with MongoDB.](https://www.mongodb.com/docs/vector-search/about/ai-agents.md#std-label-ai-agents)
