> ## Documentation Index
> Fetch the complete documentation index at: https://docs.langchain.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Tracing quickstart

> Add LangSmith tracing to an LLM application in minutes.

export const protocol_0 = undefined

export const prefix_0 = "api.smith"

export const suffix_0 = undefined

LangSmith gives you end-to-end visibility into your LLM application by capturing [*traces*](/langsmith/observability-concepts#traces); a complete record of every step that ran during a request, from the inputs passed in to the final output returned.

In this quickstart, you will add tracing to an AI assistant and view the results in LangSmith.

<Tip>
  If you're building with [LangChain](https://docs.langchain.com/oss/python/langchain/overview) or [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview), you can enable LangSmith tracing with a single environment variable. Refer to [trace with LangChain](/langsmith/trace-with-langchain) or [trace with LangGraph](/langsmith/trace-with-langgraph).
</Tip>

## Prerequisites

Before you begin, make sure you have:

* **A LangSmith account**: Sign up or log in at [smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-observability-quickstart).
* **A LangSmith API key**: Follow the [Create an API key](/langsmith/create-account-api-key) guide.
* **An OpenAI API key**: Generate this from the [OpenAI dashboard](https://platform.openai.com/account/api-keys).

This example uses OpenAI as the LLM provider. You can adapt it for your own provider.

## 1. Set up your environment

1. Create a project directory, install the dependencies, and configure the required environment variables:

   <CodeGroup>
     ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     mkdir ls-quickstart && cd ls-quickstart
     python -m venv .venv && source .venv/bin/activate
     pip install -U langsmith openai
     ```

     ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     mkdir ls-quickstart-ts && cd ls-quickstart-ts
     npm init -y
     npm install langsmith openai
     npm install -D typescript tsx
     ```

     ```kotlin Java/Kotlin (Gradle) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     implementation("com.langchain.smith:langsmith-java:0.1.0-alpha.28")
     ```
   </CodeGroup>

2. Export your environment variables in your shell:

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_TRACING=true
   export LANGSMITH_API_KEY="<your-langsmith-api-key>"
   export OPENAI_API_KEY="<your-openai-api-key>"
   ```

   To send traces to a specific project, use the [`LANGSMITH_PROJECT` environment variable](/langsmith/log-traces-to-project). If this is not set, LangSmith will create a default tracing project automatically on trace ingestion.

   <Note>
     If your account is in a region other than US (the default), also set `LANGSMITH_ENDPOINT` to the API URL for your region. Without this, your API key won't be recognized and requests will fail to authenticate.

     <table>
       <thead>
         <tr>
           <th>Region</th>

           <th>
             {protocol_0 === false ? "Host" : "URL"}
           </th>
         </tr>
       </thead>

       <tbody>
         <tr>
           <td>GCP US</td>

           <td>
             <code>
               {`${protocol_0 === false ? "" : "https://"}${prefix_0 || "api.smith"}.langchain.com${suffix_0 || ""}`}
             </code>
           </td>
         </tr>

         <tr>
           <td>GCP EU</td>

           <td>
             <code>
               {`${protocol_0 === false ? "" : "https://"}eu.${prefix_0 || "api.smith"}.langchain.com${suffix_0 || ""}`}
             </code>
           </td>
         </tr>

         <tr>
           <td>GCP APAC</td>

           <td>
             <code>
               {`${protocol_0 === false ? "" : "https://"}apac.${prefix_0 || "api.smith"}.langchain.com${suffix_0 || ""}`}
             </code>
           </td>
         </tr>

         <tr>
           <td>AWS US</td>

           <td>
             <code>
               {`${protocol_0 === false ? "" : "https://"}aws.${prefix_0 || "api.smith"}.langchain.com${suffix_0 || ""}`}
             </code>
           </td>
         </tr>
       </tbody>
     </table>

     For example, EU accounts: `export LANGSMITH_ENDPOINT="https://eu.api.smith.langchain.com"`. Do not add a trailing slash to the URL, as this can cause authentication errors.
   </Note>

   If you are using Anthropic, use the [Anthropic wrapper](/langsmith/trace-anthropic). If you are using Google Gemini, use the [Gemini wrapper](/langsmith/trace-with-google-gemini). For other providers, use the [`@traceable` decorator](/langsmith/annotate-code#use-%40traceable-%2F-traceable) to trace calls manually.

## 2. Build the app

The following app uses two LangSmith tools to add tracing:

* **OpenAI wrapper**: wraps the OpenAI client so every LLM call is automatically logged as a nested span.
* **Traceable wrapper**: wraps a function so its inputs, outputs, and any nested spans appear as a single trace in LangSmith. Use `@traceable` in Python, `traceable` in TypeScript and Kotlin, and `Tracing.traceFunction` in Java.

The `assistant` function calls a tool (`get_context`) to retrieve relevant context, then passes that context to the model. Using the traceable wrapper on both functions captures the full pipeline in one trace, with the tool call and LLM call as nested spans.

Create a file called `app.py`, `index.ts`, `App.java`, or `App.kt` with the following code:

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from openai import OpenAI
  from langsmith.wrappers import wrap_openai
  from langsmith import traceable

  client = wrap_openai(OpenAI())  # log every OpenAI call automatically

  @traceable(run_type="tool")  # trace this as a tool span
  def get_context(question: str) -> str:
      # In a real app, this would query a knowledge base or vector store
      return "LangSmith traces are stored for 14 days on the Developer plan."

  @traceable  # capture the full pipeline as a single trace
  def assistant(question: str) -> str:
      context = get_context(question)
      response = client.chat.completions.create(
          model="gpt-5.4-mini",
          messages=[
              {
                  "role": "system",
                  "content": f"Answer using the context below.\n\nContext: {context}",
              },
              {"role": "user", "content": question},
          ],
      )
      return response.choices[0].message.content

  if __name__ == "__main__":
      print(assistant("How long are LangSmith traces stored?"))
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import OpenAI from "openai";
  import { wrapOpenAI } from "langsmith/wrappers";
  import { traceable } from "langsmith/traceable";

  const client = wrapOpenAI(new OpenAI()); // log every OpenAI call automatically

  const getContext = traceable(
      async function getContext(question: string): Promise<string> { // trace this as a tool span
          // In a real app, this would query a knowledge base or vector store
          return "LangSmith traces are stored for 14 days on the Developer plan.";
      },
      { run_type: "tool" }
  );

  const assistant = traceable(async function assistant(question: string) { // capture the full pipeline as a single trace
      const context = await getContext(question);
      const response = await client.chat.completions.create({
          model: "gpt-5.4-mini",
          messages: [
              {
                  role: "system",
                  content: `Answer using the context below.\n\nContext: ${context}`,
              },
              { role: "user", content: question },
          ],
      });
      return response.choices[0]?.message?.content ?? null;
  });

  (async () => {
      console.log(await assistant("How long are LangSmith traces stored?"));
  })();
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.tracing.RunType;
  import com.langchain.smith.tracing.TraceConfig;
  import com.langchain.smith.tracing.Tracing;
  import com.langchain.smith.wrappers.openai.OpenAITracing;
  import com.openai.client.OpenAIClient;
  import com.openai.client.okhttp.OpenAIOkHttpClient;
  import com.openai.models.ChatModel;
  import com.openai.models.chat.completions.ChatCompletion;
  import com.openai.models.chat.completions.ChatCompletionCreateParams;
  import com.openai.models.chat.completions.ChatCompletionMessageParam;
  import com.openai.models.chat.completions.ChatCompletionSystemMessageParam;
  import com.openai.models.chat.completions.ChatCompletionUserMessageParam;
  import java.util.function.Function;

  class ObservabilityQuickstartApp {
    public static void main(String[] args) {
      new ObservabilityQuickstartRunner().run();
    }

    private static final class ObservabilityQuickstartRunner {
      private final OpenAIClient client =
          OpenAITracing.wrapOpenAI(OpenAIOkHttpClient.fromEnv());

      private final Function<String, String> getContext =
          Tracing.traceFunction(
              question -> "LangSmith traces are stored for 14 days on the Developer plan.",
              TraceConfig.builder().name("get_context").runType(RunType.TOOL).build());

      private final Function<String, String> assistant =
          Tracing.traceFunction(
              question -> {
                String context = getContext.apply(question);
                ChatCompletion response =
                    client.chat()
                        .completions()
                        .create(
                            ChatCompletionCreateParams.builder()
                                .model(ChatModel.GPT_5_5)
                                .addMessage(
                                    ChatCompletionMessageParam.ofSystem(
                                        ChatCompletionSystemMessageParam.builder()
                                            .content(
                                                "Answer using the context below.\n\nContext: " + context)
                                            .build()))
                                .addMessage(
                                    ChatCompletionMessageParam.ofUser(
                                        ChatCompletionUserMessageParam.builder()
                                            .content(question)
                                            .build()))
                                .build());
                return response.choices().get(0).message().content().orElse("");
              },
              TraceConfig.builder().name("assistant").build());

      void run() {
        System.out.println(assistant.apply("How long are LangSmith traces stored?"));
      }
    }
  }
  ```

  <Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/e2529a15-5c87-4c29-9c34-9aa9a899bcf1/r" arrow horizontal>
    Open a public LangSmith run for this example.
  </Card>

  ```kotlin Kotlin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.tracing.RunType
  import com.langchain.smith.tracing.TraceConfig
  import com.langchain.smith.tracing.traceable
  import com.langchain.smith.wrappers.openai.wrapOpenAI
  import com.openai.client.okhttp.OpenAIOkHttpClient
  import com.openai.models.ChatModel
  import com.openai.models.chat.completions.ChatCompletionCreateParams
  import com.openai.models.chat.completions.ChatCompletionMessageParam
  import com.openai.models.chat.completions.ChatCompletionSystemMessageParam
  import com.openai.models.chat.completions.ChatCompletionUserMessageParam
  import kotlin.jvm.optionals.getOrNull

  val client = wrapOpenAI(OpenAIOkHttpClient.fromEnv())

  val getContext =
      traceable(
          { _: String -> "LangSmith traces are stored for 14 days on the Developer plan." },
          TraceConfig.builder().name("get_context").runType(RunType.TOOL).build(),
      )

  val assistant =
      traceable(
          { question: String ->
              val context = getContext(question)
              val response =
                  client.chat().completions().create(
                      ChatCompletionCreateParams.builder()
                          .model(ChatModel.GPT_5_5)
                          .addMessage(
                              ChatCompletionMessageParam.ofSystem(
                                  ChatCompletionSystemMessageParam.builder()
                                      .content("Answer using the context below.\n\nContext: $context")
                                      .build(),
                              ),
                          )
                          .addMessage(
                              ChatCompletionMessageParam.ofUser(
                                  ChatCompletionUserMessageParam.builder()
                                      .content(question)
                                      .build(),
                              ),
                          )
                          .build(),
                  )
              response.choices()[0].message().content().getOrNull().orEmpty()
          },
          TraceConfig.builder().name("assistant").build(),
      )

  println(assistant("How long are LangSmith traces stored?"))
  ```

  <Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/95567c68-5e7b-44f2-9355-7705ac00de5a/r" arrow horizontal>
    Open a public LangSmith run for this example.
  </Card>
</CodeGroup>

## 3. Run the app

<CodeGroup>
  ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  python app.py
  ```

  ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npx tsx index.ts
  ```

  ```bash Java/Kotlin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  ./gradlew run
  ```
</CodeGroup>

## 4. View your trace

In the [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-observability-quickstart), go to **Tracing** and select your **default** project. Click the `assistant` row to open the trace. The **Trajectory** tab shows the conversation as it was sent to the model. Select the **Details** tab to see the full run tree, including the `assistant` function with the `get_context` tool call and the OpenAI call nested inside it.

<img className="block dark:hidden" src="https://mintcdn.com/langchain-5e9cc07a/EKYgNtnIIDPnseTv/langsmith/images/trace-quickstart-app.png?fit=max&auto=format&n=EKYgNtnIIDPnseTv&q=85&s=35b19b5e1e978d13cdbb61058334eeb4" alt="LangSmith UI showing a trace with an outer application span and a nested LLM call span." width="2504" height="1266" data-path="langsmith/images/trace-quickstart-app.png" />

<img className="hidden dark:block" src="https://mintcdn.com/langchain-5e9cc07a/EKYgNtnIIDPnseTv/langsmith/images/trace-quickstart-app-dark.png?fit=max&auto=format&n=EKYgNtnIIDPnseTv&q=85&s=51b7b64a9ecd3eb701122b9b203b713c" alt="LangSmith UI showing a trace with an outer application span and a nested LLM call span." width="2514" height="1260" data-path="langsmith/images/trace-quickstart-app-dark.png" />

The outer span captures your `assistant` function's inputs and outputs. The nested **get\_context** span records the tool call, and the **ChatOpenAI** span records the exact prompt sent to the model and the response returned.

<Tip>
  You can also inspect traces from the terminal using the [LangSmith CLI](/langsmith/langsmith-cli).
</Tip>

## Next steps

* [Tracing integrations](/langsmith/integrations): LangChain, LangGraph, Anthropic, and other providers.
* [Trace an LLM application](/langsmith/observability-llm-tutorial): a full lifecycle tutorial, from prototyping through production.
* [Filter traces](/langsmith/filter-traces): search and navigate large tracing projects.
* [Log to a specific project](/langsmith/log-traces-to-project): send traces to a named project instead of **default**.

<Callout type="info" icon="feather">
  After logging traces, use **[Chat](/langsmith/chat)** to analyze them and get AI-powered insights into your application's performance.
</Callout>

***

<div className="source-links">
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/observability-quickstart.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>
