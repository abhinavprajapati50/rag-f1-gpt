import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPEN_AI_API_KEY,
} = process.env;

const openai = new OpenAI({
  apiKey: OPEN_AI_API_KEY,
});
const ai = createOpenAI({ apiKey: OPEN_AI_API_KEY });

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(ASTRA_DB_API_ENDPOINT!, {
  keyspace: ASTRA_DB_NAMESPACE!,
});

export async function POST(req: Request) {
  const body: { messages?: UIMessage[] } = await req.json();
  if (!Array.isArray(body.messages)) {
    return Response.json({ error: "Expected a messages array." }, { status: 400 });
  }

  const latestUserMessage = [...body.messages]
    .reverse()
    .find((message) => message.role === "user");
  const latestText = latestUserMessage?.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

  if (!latestText) {
    return Response.json({ error: "Expected a non-empty user message." }, { status: 400 });
  }

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: latestText,
    encoding_format: "float",
  });

  const collection = db.collection<{ text: string }>(ASTRA_DB_COLLECTION!);
  const documents = await collection.find(
    {},
    {
      sort: { $vector: embedding.data[0].embedding },
      limit: 10,
    },
  ).toArray();
  const context = documents.map((document) => document.text).join("\n\n");

  const result = streamText({
    model: ai("gpt-4o-mini"),
    system: `You are a helpful assistant that answers questions about Formula 1. Use the following context to answer the question. If the answer is not in the context, say "I don't know".\n\nContext:\n${context}`,
    messages: await convertToModelMessages(body.messages),
  });

  return result.toUIMessageStreamResponse();
}