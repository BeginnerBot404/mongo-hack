> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

<!--
Tab options on this page. Append to the .md URL to filter:
  ?tabs=<id,...>   select specific tabs (e.g. ?tabs=nodejs,shell)
  ?allTabs=true    include every tab
  (no param)       default: one tab per tabset

Available tabs:
  other tabs: tool-def, tool-call, short-term, long-term, cloud, local
  drivers: nodejs, python
-->

# Build AI Agents with MongoDB

MongoDB provides several features for building AI agents. As both a vector and document database, MongoDB supports various search methods for agentic RAG, as well as storing agent interactions in the same database for short and long-term agent memory.

Get Started

## What is an AI agent?

In the context of generative AI, an AI agent typically refers to a system that can complete a task autonomously or semi-autonomously by combining AI models such as LLM (Large Language Model)s with a set of pre-defined tools.

AI agents can use tools to gather context, interact with external systems, and perform actions. They can define their own execution flow (planning) and remember previous interactions to inform their responses (memory). Therefore, AI agents are best suited for complex tasks that require reasoning, planning, and decision-making.

![Diagram showing a single-agent architecture with MongoDB](/images/ai-agents/ai-agent-diagram.svg)

### Architecture

An AI agent typically includes a combination of the following components:

| **Perception** | Your input for the agent. Text inputs are the most common perception mechanism for AI agents, but inputs can also be audio, images, or multimodal data. |
| --- | --- |
| **Planning** | How the agent determines what to do next. This component typically includes LLMs and prompts, using feedback loops and various [prompt engineering techniques](https://www.promptingguide.ai/techniques) such as chain-of-thought and reAct, to help the LLM reason through complex tasks. AI agents can consist of a single LLM as the decision maker, LLM with multiple prompts, multiple LLMs working together, or any combination of these approaches. |
| **Tools** | How the agent gathers context for a task. Tools allow agents to interact with external systems and perform actions such as vector search, web search, or calling APIs from other services. |
| **Memory** | A system for storing agent interactions, so the agent can learn from past experiences to inform its responses. Memory can be *short-term* (for the current session) or *long-term* (persisted across sessions). |

**Note:**

AI agents vary in design pattern, function, and complexity. To learn about other agent architectures, including multi-agent systems, see [Agentic Design Patterns.](https://www.mongodb.com/resources/basics/artificial-intelligence/agentic-systems?tck=docs)

## Build AI Agents with MongoDB

MongoDB supports the following components for building AI agents:

- [Tools](https://www.mongodb.com/docs/vector-search/about/ai-agents.md#std-label-avs-agent-tools): Leverage MongoDB search features as tools for your agent to retrieve relevant information and implement agentic RAG.

- [Memory](https://www.mongodb.com/docs/vector-search/about/ai-agents.md#std-label-avs-agent-memory): Store agent interactions in MongoDB collections for both short and long-term memory.

### Agent Tools

#### What is a tool?

In the context of AI agents, a tool is anything that can be programmatically defined and invoked by the agent. Tools extend the agent's capabilities beyond generating text, allowing it to interact with external systems, retrieve information, and take actions. Tools are typically defined with a specific interface that includes:

- A name and description that help the agent understand when to use the tool.

- Required parameters and their expected formats.

- A function that performs the actual operation when invoked.

The agent uses its reasoning capabilities to determine which tool to use, when to use it, and what parameters to provide, based on the user's input and the task at hand.

In addition to standard MongoDB queries, MongoDB provides several search capabilities that you can implement as tools for your agent.

- **MongoDB Vector Search**: Perform vector search to retrieve relevant context based on semantic meaning and similarity. To learn more, see [MongoDB Vector Search Overview.](https://www.mongodb.com/docs/vector-search/index.md#std-label-avs-overview)

- **MongoDB Search**: Perform full-text search to retrieve relevant context based on keyword matching and relevance scoring. To learn more, see [MongoDB Search Overview.](https://www.mongodb.com/docs/search.md#std-label-atlas-search)

- **Hybrid Search**: Combine MongoDB Vector Search with MongoDB Search to leverage the strengths of both approaches. To learn more, see [How to Perform Hybrid Search.](https://www.mongodb.com/docs/search/tutorial/hybrid-search.md#std-label-as_hybrid-search)

You can define tools manually or by using [frameworks](https://www.mongodb.com/docs/atlas/ai-integrations.md#std-label-ai-integrations) such as LangChain and LangGraph, which provide built-in abstractions for tool creation and calling.

### Tool definition

Tools are defined as functions that the agent can call to perform specific tasks. For example, the following syntax illustrates how you might define a tool that runs a [vector search query:](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results)

### Python

```python
def vector_search_tool(query: str) -> str:
   pipeline = [
       {
           "$vectorSearch": {
               # Vector search query pipeline...
           }
       }
   ]
   results = collection.aggregate(pipeline)

   array_of_results = []
   for doc in results:
       array_of_results.append(doc)
   return array_of_results
```

#### Agentic RAG

By using MongoDB as a vector database, you can create retrieval tools that implement agentic RAG, which is an advanced form of [RAG](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-avs-rag) that allows you to dynamically orchestrate the retrieval and generation process through an AI agent.

![Diagram showing an agentic RAG architecture with MongoDB](/images/ai-agents/agentic-rag-diagram.svg)

This approach enables more complex workflows and user interactions. For example, you can configure your AI agent to determine the optimal retrieval tool based on the task, such as using MongoDB Vector Search for semantic search and MongoDB Search for full-text search. You can also define different retrieval tools for different collections to further customize the agent's retrieval capabilities.

### Agent Memory

#### What is memory?

Memory for agents involves storing information about previous interactions, so that the agent can learn from past experiences and provide more relevant and personalized responses. This is particularly important for tasks that require context, such as conversational agents, where the agent needs to remember previous turns in the conversation to provide coherent and contextually relevant responses. There are two primary types of agent memory:

- **Short-term Memory**: Stores information for the current session, like recent conversation turns and active task context.

- **Long-term Memory**: Persists information across sessions, which can include past conversations and personalized preferences over time.

Since MongoDB is also a document database, you can implement memory for agents by storing its interactions in a MongoDB collection. The agent can then query or update this collection as needed. There are several ways to implement agent memory with MongoDB:

- For short-term memory, you might include a `session_id` field to identify a specific session when storing interactions, and then query for interactions with the same ID to pass to the agent as context.

- For long-term memory, you might process several interactions with an LLM to extract relevant information such as user preferences or important context, and then store this information in a separate collection that the agent can query when needed.

- To build robust memory management systems that enable more efficient and complex retrieval of conversation histories, leverage [MongoDB Search](https://www.mongodb.com/docs/search.md#std-label-atlas-search) or [MongoDB Vector Search](https://www.mongodb.com/docs/vector-search/index.md#std-label-avs-overview) to store, index, and query important interactions across sessions.

### Short-term memory

A document in a collection that stores short-term memory might resemble the following:

```none
{
  "session_id": "123",
  "user_id": "jane_doe",
  "interactions":
  [
    {
      "role": "user",
      "content": "What is MongoDB?",
      "timestamp": "2025-01-01T12:00:00Z"
    },
    {
      "role": "assistant",
      "content": "MongoDB is the world's leading modern database.",
      "timestamp": "2025-01-01T12:00:05Z"
    }
  ]
}
```

The following [frameworks](https://www.mongodb.com/docs/atlas/ai-integrations.md#std-label-ai-integrations) also provide direct abstractions for agent memory with MongoDB:

| Framework | Features |
| --- | --- |
| LangChain | `MongoDBChatMessageHistory`: chat message history component; `MongoDBAtlasSemanticCache`: semantic cache component To learn more, see the [tutorial.](https://www.mongodb.com/docs/atlas/ai-integrations/langchain/memory-semantic-cache.md#std-label-langchain-memory) |
| LangGraph | `MongoDBSaver`: short-term memory checkpointer that can be used for persistence; `MongoDBStore`: long-term document store for storing memories in MongoDB (available in Python integration only) To learn more, see [LangGraph](https://www.mongodb.com/docs/atlas/ai-integrations/langgraph.md#std-label-langgraph) and [LangGraph.js.](https://www.mongodb.com/docs/atlas/ai-integrations/langgraph-js.md#std-label-langgraph-js) |

## Get Started

The following tutorial demonstrates how to build an AI agent using MongoDB for agentic RAG and memory, without an agent framework.

***

➤ Use the **Select your language** drop-down menu to set the language for this tutorial.

***

### Python

Work with a runnable version of this tutorial as a [Python notebook.](https://github.com/mongodb/docs-notebooks/blob/main/use-cases/ai-agent.ipynb)

### Prerequisites

To complete this tutorial, you must have the following:

- One of the following MongoDB cluster types:
  - An [Atlas cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster.md#std-label-create-new-cluster) running MongoDB version 6.0.11, 7.0.2, or later. Ensure that your IP address (Internet Protocol address) is included in your Atlas project's [access list.](https://www.mongodb.com/docs/atlas/security/ip-access-list.md#std-label-access-list)

  - A local Atlas deployment created using Python and Docker. Install `atlas-local-lib-py` (`pip install atlas-local-lib-py`) to programmatically create and manage local deployments. To learn more, see the [atlas-local-lib-py repository.](https://github.com/mongodb/atlas-local-lib-py)

  - A MongoDB Community or Enterprise cluster with [Search and Vector Search](https://www.mongodb.com/docs/search/self-managed/current/installation/linux.md#std-label-community-search-deploy) installed.

- A Voyage AI API key.

- An OpenAI API key.

**Note:**

This tutorial uses models from Voyage AI and OpenAI, but you can modify the code to use your models of choice.

### Procedure

This AI agent can be used to answer questions about a custom data source and perform calculations. It can also remember previous interactions to inform its responses. It uses the following components:

- **Perception**: Text inputs.

- **Planning**: An LLM and various prompts to reason through the task.

- **Tools**: A vector search tool and calculator tool.

- **Memory**: Stores the interactions in a MongoDB collection.

### Python

1. Set up the environment.

   Initialize the project and install dependencies.

   Create a new project directory, then install the required dependencies:

   ```none
   mkdir mongodb-ai-agent
   cd mongodb-ai-agent
   pip install --quiet --upgrade pymongo voyageai openai langchain langchain-mongodb
   langchain-community langchain-text-splitters python-dotenv
   ```

   **Note:**

   Your project will use the following structure:

   ```text
   mongodb-ai-agent
   ├── .env
   ├── config.py
   ├── ingest_data.py
   ├── tools.py
   ├── memory.py
   ├── planning.py
   ├── main.py
   ```

   Configure the environment.

   Create an environment file named `.env` in your project. This file will contain your API keys for the agent, the MongoDB connection string, and MongoDB database and collection names.

   ###### .env

   ###### Copy and paste the following code into your .env file.

   Replace the placeholder values with your MongoDB connection string and your Voyage AI and OpenAI API keys.

   ```none
   MONGODB_URI="<mongodb-connection-string>"
   VOYAGE_API_KEY="<voyage-api-key>"
   OPENAI_API_KEY= "<openai-api-key>"
   ```

   **Note:**

   Replace `<connection-string>` with the connection string for your Atlas cluster or local Atlas deployment.

   ### Atlas Cluster

   Your connection string should use the following format:

   ```text
   mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net
   ```

   To learn more, see [Connect to a Cluster via Client Libraries.](https://www.mongodb.com/docs/atlas/driver-connection.md#std-label-connect-via-driver)

2. Configure the agent.

   Create a file named `config.py` in your project. This file will read in your environment variables and connect the application to services like the MongoDB database and OpenAI.

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
   agent_db = mongo_client["ai_agent_db"]
   vector_collection = agent_db["embeddings"]
   memory_collection = agent_db["chat_history"]

   # Model configuration
   voyage_client = voyageai.Client(api_key=VOYAGE_API_KEY)
   openai_client = OpenAI(api_key=OPENAI_API_KEY)
   VOYAGE_MODEL = "voyage-4-large"
   OPENAI_MODEL = "gpt-4o"

   ```

3. Use MongoDB as a vector database.

   Create a file named `ingest_data.py` in your project. This script ingests a sample PDF that contains a recent [MongoDB earnings report](https://investors.mongodb.com/node/13176/pdf) into a collection in MongoDB by using the `voyage-4-large` embedding model. This code also includes a function to create a vector search index on your data if it doesn't already exist.

   To learn more, see [Ingestion.](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-ingestion)

   ###### ingest\_data.py

   ###### Copy and paste the following code into your ingest\_data.py file.

   ```python
   from config import vector_collection, voyage_client, VOYAGE_MODEL
   from pymongo.operations import SearchIndexModel
   from langchain_community.document_loaders import PyPDFLoader
   from langchain_text_splitters import RecursiveCharacterTextSplitter
   import time


   # Define a function to generate embeddings
   def get_embedding(data, input_type="document"):
       embeddings = voyage_client.embed(
           data, model=VOYAGE_MODEL, input_type=input_type
       ).embeddings
       return embeddings[0]


   # --- Ingest embeddings into MongoDB ---
   def ingest_data():
       # Chunk PDF data
       loader = PyPDFLoader("https://investors.mongodb.com/node/13176/pdf")
       data = loader.load()
       text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=20)
       documents = text_splitter.split_documents(data)
       print(f"Successfully split PDF into {len(documents)} chunks.")

       # Ingest chunked documents into collection
       print("Generating embeddings and ingesting documents...")
       docs_to_insert = []
       for i, doc in enumerate(documents):
           embedding = get_embedding(doc.page_content)
           if embedding:
               docs_to_insert.append({"text": doc.page_content, "embedding": embedding})

       if docs_to_insert:
           result = vector_collection.insert_many(docs_to_insert)
           print(f"Inserted {len(result.inserted_ids)} documents into the collection.")
       else:
           print("No documents were inserted. Check embedding generation process.")

       # --- Create the vector search index ---
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
       try:
           vector_collection.create_search_index(model=search_index_model)
           print(f"Search index '{index_name}' creation initiated.")
       except Exception as e:
           print(f"Error creating search index: {e}")
           return

       # Wait for initial sync to complete
       print("Polling to check if the index is ready. This may take up to a minute.")
       predicate = lambda index: index.get("queryable") is True

       max_retries = 24  # ~2 minutes at 5s intervals
       for _ in range(max_retries):
           indices = list(vector_collection.list_search_indexes(index_name))
           if len(indices) and predicate(indices[0]):
               break
           time.sleep(5)
       else:
           raise TimeoutError(f"Index '{index_name}' did not become queryable in time.")
       print(index_name + " is ready for querying.")

   ```

4. Define tools for the agent.

   Create a file named `tools.py` in your project. This file defines the tools that the agent can use to answer questions. In this example, you define the following tools:

   - `vector_search_tool`: Runs a [vector search query](https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage.md#std-label-return-vector-search-results) to retrieve relevant documents from your collection.

   - `calculator_tool`: Uses the `eval()` function for basic math operations.

   ###### tools.py

   ###### Copy and paste the following code into your tools.py file.

   ```python
   from config import vector_collection
   from ingest_data import get_embedding


   # Define a vector search tool
   def vector_search_tool(user_input: str) -> list:
       query_embedding = get_embedding(user_input, input_type="query")
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
       results = vector_collection.aggregate(pipeline)

       array_of_results = []
       for doc in results:
           array_of_results.append(doc)
       return array_of_results


   # Define a simple calculator tool
   def calculator_tool(user_input: str) -> str:
       try:
           result = eval(user_input)
           return str(result)
       except Exception as e:
           return f"Error: {str(e)}"

   ```

5. Add memory to the agent.

   Create a file named `memory.py` in your project. This file defines the system that the agent uses to store its interactions. In this example, you implement short-term memory by defining the following functions:

   - `store_chat_message`: to store information about an interaction in a MongoDB collection.

   - `retrieve_session_history`: to get all interactions for a specific session by using the `session_id` field.

   ###### memory.py

   ###### Copy and paste the following code into your memory.py file.

   ```python
   from config import memory_collection
   from datetime import datetime
   from typing import List


   def store_chat_message(session_id: str, role: str, content: str) -> None:
       message = {
           "session_id": session_id,  # Unique identifier for the chat session
           "role": role,  # Role of the sender (user or system)
           "content": content,  # Content of the message
           "timestamp": datetime.now(),  # Timestamp of when the message was sent
       }
       memory_collection.insert_one(message)


   def retrieve_session_history(session_id: str) -> List:
       # Query the collection for messages with a specific "session_id" in ascending order
       cursor = memory_collection.find({"session_id": session_id}).sort("timestamp", 1)

       # Iterate through the cursor and return a JSON object with the message role and content
       if cursor:
           messages = [{"role": msg["role"], "content": msg["content"]} for msg in cursor]
       else:
           messages = []
       return messages

   ```

6. Define the agent's planning.

   Create a file named `planning.py` in your project. This file will include various prompts and LLM calls to determine the agent's execution flow. In this example, you define the following functions:

   - `tool_selector`: Determines how the LLM selects the appropriate tool for a task.

   - `generate_response`: Orchestrates the agent's execution flow by using tools, calling the LLM, and processing the results.

   - `get_llm_response`: Helper function for LLM response generation.

   ###### planning.py

   ###### Copy and paste the following code into your planning.py file.

   ```python
   from config import openai_client, OPENAI_MODEL
   from tools import vector_search_tool, calculator_tool
   from memory import (
       store_chat_message,
       retrieve_session_history,
   )


   # Define a tool selector function that decides which tool to use based on user input and message history
   def tool_selector(user_input, session_history=None):
       messages = [
           {
               "role": "system",
               "content": (
                   "Select the appropriate tool from the options below. Consider the full context of the conversation before deciding.\n\n"
                   "Tools available:\n"
                   "- vector_search_tool: Retrieve specific context about recent MongoDB earnings and announcements\n"
                   "- calculator_tool: For mathematical operations\n"
                   "- none: For general questions without additional context\n"
                   "Process for making your decision:\n"
                   "1. Analyze if the current question relates to or follows up on a previous vector search query\n"
                   "2. For follow-up questions, incorporate context from previous exchanges to create a comprehensive search query\n"
                   "3. Only use calculator_tool for explicit mathematical operations\n"
                   "4. Default to none only when certain the other tools won't help\n\n"
                   "When continuing a conversation:\n"
                   "- Identify the specific topic being discussed\n"
                   "- Include relevant details from previous exchanges\n"
                   "- Formulate a query that stands alone but preserves conversation context\n\n"
                   'Return a JSON object only: {"tool": "selected_tool", "input": "your_query"}'
               ),
           }
       ]
       if session_history:
           messages.extend(session_history)
       messages.append({"role": "user", "content": user_input})

       response = (
           openai_client.chat.completions.create(model=OPENAI_MODEL, messages=messages)
           .choices[0]
           .message.content
       )
       try:
           tool_call = eval(response)
           return tool_call.get("tool"), tool_call.get("input")
       except:
           return "none", user_input


   # Define the agent workflow
   def generate_response(session_id: str, user_input: str) -> str:

       # Store the user input in the chat history collection
       store_chat_message(session_id, "user", user_input)

       # Initialize a list of inputs to pass to the LLM
       llm_input = []

       # Retrieve the session history for the current session and add it to the LLM input
       session_history = retrieve_session_history(session_id)
       llm_input.extend(session_history)

       # Append the user message in the correct format
       user_message = {"role": "user", "content": user_input}
       llm_input.append(user_message)

       # Call the tool_selector function to determine which tool to use
       tool, tool_input = tool_selector(user_input, session_history)
       print("Tool selected: ", tool)

       # Process based on selected tool
       if tool == "vector_search_tool":
           context = vector_search_tool(tool_input)
           # Construct the system prompt using the retrieved context and append it to the LLM input
           system_message_content = (
               f"Answer the user's question based on the retrieved context and conversation history.\n"
               f"1. First, understand what specific information the user is requesting\n"
               f"2. Then, locate the most relevant details in the context provided\n"
               f"3. Finally, provide a clear, accurate response that directly addresses the question\n\n"
               f"If the current question builds on previous exchanges, maintain continuity in your answer.\n"
               f"Only state facts clearly supported by the provided context. If information is not available, say 'I DON'T KNOW'.\n\n"
               f"Context:\n{context}"
           )
           response = get_llm_response(llm_input, system_message_content)
       elif tool == "calculator_tool":
           # Perform the calculation using the calculator tool
           response = calculator_tool(tool_input)
       else:
           system_message_content = "You are a helpful assistant. Respond to the user's prompt as best as you can based on the conversation history."
           response = get_llm_response(llm_input, system_message_content)

       # Store the system response in the chat history collection
       store_chat_message(session_id, "system", response)
       return response


   # Helper function to get the LLM response
   def get_llm_response(messages, system_message_content):
       # Add the system message to the messages list
       system_message = {
           "role": "system",
           "content": system_message_content,
       }

       # If the system message should go at the end (for context-based queries)
       if any(msg.get("role") == "system" for msg in messages):
           messages.append(system_message)
       else:
           # For general queries, put system message at beginning
           messages = [system_message] + messages

       # Get response from LLM
       response = (
           openai_client.chat.completions.create(model=OPENAI_MODEL, messages=messages)
           .choices[0]
           .message.content
       )

       return response

   ```

7. Test the agent.

   Finally, create a file named `main.py` in your project. This file runs the agent and allows you to interact with it.

   ###### main.py

   ###### Copy and paste the following code into your main.py file.

   ```python
   from config import mongo_client
   from ingest_data import ingest_data
   from planning import generate_response

   if __name__ == "__main__":
       try:
           run_ingest = input("Ingest sample data? (y/n): ")
           if run_ingest.lower() == "y":
               ingest_data()

           session_id = input("Enter a session ID: ")

           while True:
               user_query = input("\nEnter your query (or type 'quit' to exit): ")
               if user_query.lower() == "quit":
                   break

               if not user_query.strip():
                   print("Query cannot be empty. Please try again.")
                   continue

               answer = generate_response(session_id, user_query)
               print("\nAnswer:")
               print(answer)
       finally:
           mongo_client.close()

   ```

   Save your project, then run the following command. When you run the agent:

   - If you haven't already, instruct the agent to ingest the sample data.

   - Enter a session ID to start a new session or continue an existing session.

   - Ask questions. The agent generates a response based on your tools, the previous interactions, and the prompts defined in the planning phase.

   Refer to the example output for a sample interaction:

   ```none
   python main.py
   ```

   **Output:**

   ```none
   Ingest sample data? (y/n): y
   Successfully split PDF into 104 chunks.
   Generating embeddings and ingesting documents...
   Inserted 104 documents into the collection.
   Search index 'vector_index' creation initiated.
   Polling to check if the index is ready. This may take up to a minute.
   vector_index is ready for querying.
   Enter a session ID: 123

   Enter your query (or type 'quit' to exit): What was MongoDB's latest acquisition?
   Tool selected:  vector_search_tool

   Answer:
   MongoDB's latest acquisition was Voyage AI.

   Enter your query (or type 'quit' to exit): What do they do?
   Tool selected:  vector_search_tool

   Answer:
   Voyage AI is a company that specializes in state-of-the-art embedding and reranking models designed to power next-generation AI applications. These technologies help organizations build more advanced and trustworthy AI capabilities.

   Enter your query (or type 'quit' to exit): What is 123+456?
   Tool selected:  calculator_tool

   Answer:
   579
   ```

   **Tip:**

   If you're using Atlas, you can verify your embeddings and interactions by navigating to the `ai_agent_db.embeddings` namespace [in the Atlas UI.](https://www.mongodb.com/docs/atlas/atlas-ui/collections.md#std-label-atlas-ui-view-collections)

8. Continue building.

   Now that you have a basic AI agent, you can continue developing it by:

   - Improving the [performance](https://www.mongodb.com/docs/vector-search/benchmark/benchmark-tests.md#std-label-avs-performance-tuning) of your vector search tools and [fine tuning](https://www.mongodb.com/docs/vector-search/tutorials/rag.md#std-label-rag-fine-tuning) your RAG pipelines.

   - Adding more tools to the agent, such as [hybrid](https://www.mongodb.com/docs/search/tutorial/hybrid-search.md#std-label-as_hybrid-search) or [full-text search](https://www.mongodb.com/docs/search.md#std-label-atlas-search) tools.

   - Refining the planning phase by using more advanced prompts and LLM calls.

   - Implementing long-term memory and more advanced memory systems by using [MongoDB Search](https://www.mongodb.com/docs/search.md#std-label-atlas-search) and [MongoDB Vector Search](https://www.mongodb.com/docs/vector-search/index.md#std-label-avs-overview) to store and retrieve important interactions across sessions.

## Tutorials

For more tutorials on building AI agents with MongoDB, refer to the following table:

| Frameworks | [Build an AI Agent with LangGraph and MongoDB Atlas](https://www.mongodb.com/docs/atlas/ai-integrations/langgraph/build-agents.md#std-label-langgraph-build-agents); [Build an AI Agent with LangGraph.js and MongoDB Atlas](https://www.mongodb.com/docs/atlas/ai-integrations/langgraph-js/build-agents.md#std-label-langgraph-js-build-agents); [Natural Language to MQL Agent with LangChain and LangGraph](https://www.mongodb.com/docs/atlas/ai-integrations/langchain/natural-language-to-mql.md#std-label-langchain-natural-language-to-mql); [Build an Agentic RAG Application with CrewAI and MongoDB](https://www.mongodb.com/docs/atlas/ai-integrations/crewai/build-agents.md#std-label-crewai-tutorial); [Integrate MongoDB with Mastra](https://www.mongodb.com/docs/atlas/ai-integrations/mastra.md#std-label-mastra); [Other AI framework integrations](https://www.mongodb.com/docs/atlas/ai-integrations.md#std-label-ai-integrations) |
| --- | --- |
| Enterprise platforms | [Get Started with the Amazon Bedrock Knowledge Base Integration](https://www.mongodb.com/docs/atlas/ai-integrations/amazon-bedrock.md#std-label-amazon-bedrock); [Build AI Agents with Vertex AI Agent Engine and Atlas](https://www.mongodb.com/docs/atlas/ai-integrations/google-vertex-ai/agent-engine.md#std-label-vertex-ai-agent-engine); [Azure AI Foundry](https://www.mongodb.com/company/blog/innovation/building-next-gen-ai-agents-mongodb-atlas-integration-microsoft-foundry) |
| Tools | [Build an AI Agent with MongoDB and n8n](https://www.mongodb.com/docs/atlas/ai-integrations/n8n/build-ai-agent.md#std-label-n8n-get-started) |
| Additional resources | [Docs Notebooks Repository](https://github.com//mongodb/docs-notebooks); [GenAI Showcase Repository](https://github.com//mongodb-developer/GenAI-Showcase) |
