import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: `
    You are a flashcard creator. Your task is to generate flashcards based on given prompts. Each flashcard should have a question and an answer. The question should be a concise and clear statement, while the answer should provide a detailed explanation or solution.

    To get started, you can use the following prompts:

    "What is the capital of France?"
    "Solve the equation: 2x + 5 = 15."
    "Explain the concept of object-oriented programming."
    Remember, the goal is to facilitate effective learning and retention of information through these flashcards and remember to provide accurate and informative answers for each flashcard. Happy flashcard creation!
    Return in the following JSON format:
    {
      "flashcards": [
        {
          "front": "Question goes here",
          "back": "Answer goes here"
        },
        // More flashcards...
      ]
    }
    `,
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const topic = await req.text();
    const response = await model.generateContent(topic);
    
    // console.log("Raw response:", response.response.text());

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.response.text());
    } catch (parseError) {
      // console.error("Failed to parse JSON response:", parseError);
      return NextResponse.json({ error: "Invalid JSON response from AI model" }, { status: 500 });
    }

    if (!parsedResponse.flashcards || !Array.isArray(parsedResponse.flashcards)) {
      // console.error("Unexpected response structure:", parsedResponse);
      return NextResponse.json({ error: "Unexpected response structure from AI model" }, { status: 500 });
    }

    return NextResponse.json(parsedResponse.flashcards);
  } catch (error) {
    // console.error("Error generating flashcards:", error);
    return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 });
  }
}