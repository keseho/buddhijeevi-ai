"use client";

import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAIApi, { ClientOptions } from "openai";
import Configuration from "openai";
import {
  ChatCompletion,
  CreateChatCompletionRequestMessage,
} from "openai/resources/index.mjs";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";

const configuration: ClientOptions = {
  apiKey: process.env.OPENAI_API_KEY,
  organization: "your-organization",
  baseURL: "https://api.openai.com/v1",
  timeout: 60000, // 1 minute timeout
  maxRetries: 2, // Retry up to 2 times
  defaultHeaders: {}, // Default headers
  defaultQuery: {}, // Default query parameters
  dangerouslyAllowBrowser: false, // Be careful with this option
};

const openai = new OpenAIApi(configuration);

const instructionMessage: CreateChatCompletionRequestMessage = {
  role: "system",
  content:
    "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations.",
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();

    if (!freeTrial) {
      return new NextResponse("Free trial has expired.", { status: 403 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [instructionMessage, ...messages],
    });

    await increaseApiLimit();
    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
