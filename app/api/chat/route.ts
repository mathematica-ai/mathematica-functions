import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { OpenAI } from 'openai';
import type { Message, ChatRequest } from "@/types/chat";
import type { ChatCompletionMessageParam } from 'openai/resources/chat';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { message, history = [] } = (await req.json()) as ChatRequest;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Convert our message format to OpenAI's format
    const messages: ChatCompletionMessageParam[] = [
      ...history.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    // Create a new ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages,
            stream: true,
          });

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              const message = {
                type: 'chunk',
                data: { content }
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
            }
          }

          // Send end message
          const endMessage = {
            type: 'done',
            data: { content: '' }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(endMessage)}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          // Send error as a properly formatted SSE message
          const errorEvent = {
            type: 'error',
            message: error instanceof Error ? error.message : 'Failed to stream response',
            data: { error: error instanceof Error ? error.message : 'Unknown error' }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 