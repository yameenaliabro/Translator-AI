import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";


interface TranslationSuccessResponse {
    translation: string;
}

interface TranslationErrorResponse {
    error: string;
}

interface TranslationInternalErrorResponse {
    message: string;
}

// Initialize the LLM instance outside the handler to reuse across invocations
const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro",
    temperature: 0,
    maxRetries: 2,
    // It's recommended to include the API key here securely
    apiKey: process.env.NEXT_PUBLIC_LANGCHAIN_API_KEY, // Ensure this is set in .env.local
});

export async function POST(request: Request): Promise<NextResponse> {
    try {
        // Extract form data
        const body = await request.json();

        // Retrieve and validate form fields
        const input_language = body.input_language;
        const output_language = body.output_language;
        const input = body.input;


        // Validate 'input_language'
        if (!input_language || typeof input_language !== "string") {
            const errorResponse: TranslationErrorResponse = { error: "Invalid or missing 'input_language' parameter." };
            return NextResponse.json(errorResponse, { status: 400 });
        }

        // Validate 'output_language'
        if (!output_language || typeof output_language !== "string") {
            const errorResponse: TranslationErrorResponse = { error: "Invalid or missing 'output_language' parameter." };
            return NextResponse.json(errorResponse, { status: 400 });
        }

        // Validate 'input'
        if (!input || typeof input !== "string") {
            const errorResponse: TranslationErrorResponse = { error: "Invalid or missing 'input' text to translate." };
            return NextResponse.json(errorResponse, { status: 400 });
        }

        // Create the prompt
        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                "You are an assistant that translates text from {input_language} to {output_language}. Provide only the translated text without any additional explanations, comments, or context.",
            ],
            ["human", "{input}"],
        ]);

        // Pipe the prompt through the LLM
        const chain = prompt.pipe(llm);

        // Invoke the chain with the provided data
        const response = await chain.invoke({
            input_language: input_language.trim(),
            output_language: output_language.trim(),
            input: input.trim(),
        });

        // Check if response contains the translated content
        if (response && typeof response.content === "string") {
            const successResponse: TranslationSuccessResponse = { translation: response.content.trim() };
            return NextResponse.json(successResponse, { status: 200 });
        } else {
            // Handle unexpected response format
            const errorResponse: TranslationErrorResponse = { error: "Failed to retrieve a valid translation." };
            return NextResponse.json(errorResponse, { status: 500 });
        }
    } catch (err) {
        console.error("Translation error:", err);
        const internalErrorResponse: TranslationInternalErrorResponse = { message: "Could not process the translation request." };
        return NextResponse.json(internalErrorResponse, { status: 500 });
    }
}
