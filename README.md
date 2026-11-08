<img width="2880" height="1603" alt="image" src="https://github.com/user-attachments/assets/090b0ee5-f673-4902-94e7-5b89ecf48320" />

<img width="2880" height="2063" alt="image" src="https://github.com/user-attachments/assets/857658b8-3427-4e32-91a6-46a20bf3e4d3" />


## Project overview

This project is **F1GPT**, a Formula 1 question-and-answer chatbot. It uses **RAG** (Retrieval-Augmented Generation): before answering, it searches stored reference material for relevant information and gives that context to an AI model.

- **Chat interface:** Users can ask questions, choose suggested prompts, and start a new conversation. The interface is built in `app/page.tsx`.
- **Chat API:** A Next.js API route receives messages, searches for relevant information, and streams the AI’s response. See `app/api/chat/route.ts`.
- **Reference data:** A setup script collects web pages, splits their text into smaller chunks, creates embeddings, and stores them in Astra DB. See `scripts/loadDb.ts`.
- **AI answers:** OpenAI creates embeddings for search and generates responses with GPT-4o-mini.
- **Important:** The configured source list includes some pages that are not about F1, so you may want to replace those with Formula 1 sources for more reliable answers.

## How the technologies connect

**To prepare the knowledge base:**

`Web pages → Puppeteer collects page content → LangChain splits text into chunks → OpenAI creates embeddings → Astra DB stores the text and vectors`

**When someone asks a question:**

`Chat UI → Next.js API route → OpenAI creates a question embedding → Astra DB finds the 10 closest text chunks → GPT-4o-mini answers using those chunks → AI SDK streams the response to the UI`

The UI and project setup are in `app/page.tsx` and `package.json`.

## How many technologies are needed?

A practical count is **10 main technologies or tool groups**, counting the runtime:

1. **TypeScript** — application code.
2. **Node.js** — runs the server-side application and setup script.
3. **Next.js** — web framework, pages, and API route.
4. **React** — interactive chat interface.
5. **CSS / Tailwind CSS** — styling.
6. **Vercel AI SDK** — connects the chat interface and server to streamed AI responses.
7. **OpenAI** — embeddings and GPT-4o-mini answers.
8. **Astra DB** — stores and searches vectorized reference content.
9. **LangChain** — loads web content and splits it into chunks.
10. **Puppeteer** — fetches web-page content for the knowledge base.

They’re grouped this way because some work together: for example, Next.js uses React for the interface, while LangChain uses Puppeteer for collecting web content. **This is not a traditional MERN project**: it uses Next.js and Astra DB rather than Express and MongoDB.
## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
