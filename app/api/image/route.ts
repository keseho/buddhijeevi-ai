import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ClientOptions } from "openai";
import Configuration from "openai";
import OpenAIApi from "openai";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";

const configuration: ClientOptions = {
  apiKey: process.env.OPENAI_API_KEY || "", // Use your actual API key or provide a default value
  organization: process.env.OPENAI_ORG_ID || null, // Use your actual organization ID or provide a default value
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  timeout: 60000, // 1 minute timeout
  maxRetries: 2, // Retry up to 2 times
  defaultHeaders: {}, // Default headers
  defaultQuery: {}, // Default query parameters
  dangerouslyAllowBrowser: false, // Be careful with this option
};
const openai = new OpenAIApi(configuration);

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!configuration.apiKey) {
      return new NextResponse("OpenAI API Key not configured.", {
        status: 500,
      });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();

    if (!freeTrial) {
      return new NextResponse("Free trial has expired.", { status: 403 });
    }

    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt,
      n: parseInt(amount, 10),
      size: resolution,
      quality: "hd",
    });

    await increaseApiLimit();

    return new NextResponse(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
