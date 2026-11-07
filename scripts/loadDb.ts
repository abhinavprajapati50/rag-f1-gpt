// import {DataAPIClient} from '@datastax/astra-db-ts';
// import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
// import OpenAi from 'openai'
// import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import OpenAI from "openai";

import 'dotenv/config'

type similarityMetric = "cosine" | "euclidean" | "dot_product";

const { ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPEN_AI_API_KEY } = process.env;

const openai = new OpenAI({
    apiKey: OPEN_AI_API_KEY,
});

const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://www.skysports.com/f1/drivers/lewis-hamilton',
    'https://www.formula1.com/en/latest',
    'https://en.wikipedia.org/wiki/World_championship',
    'https://en.wikipedia.org/wiki/World_Athletics_Championships',
    'https://en.wikipedia.org/wiki/2024_elections_in_India'
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { keyspace: ASTRA_DB_NAMESPACE! });

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
})

const createCollection = async (similarityMetric: similarityMetric = 'dot_product') => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 1536,
            metric: similarityMetric,
        }
    });

    console.log("=========res", res)
}

const loadSampleData = async () => {
    const collection = db.collection(ASTRA_DB_COLLECTION);
    for await (const url of f1Data){
        const content = await scrapePage(url);

        const chunks = await splitter.splitText(content);
        for await (const chunk of chunks) {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float",
            })

            const vector = embedding.data[0].embedding;

            const res = await collection.insertOne({
                $vector: vector,
                text: chunk,
            })

            console.log("=========res", res)
        }
        
    }
}

const scrapePage = async (url: string) => {
    return `Sample content for ${url}`;
}