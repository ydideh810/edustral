import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import MistralClient from '@mistralai/mistralai';

const mistral = new MistralClient(process.env.MISTRAL_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message, noAuth } = await req.json();

    // Only check authentication if not in noAuth mode
    if (!noAuth) {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const response = await mistral.chat({
      model: "mistral-tiny",
      messages: [
        {
          role: "system",
          content: "You are a helpful academic research assistant. Provide accurate, well-researched responses with citations where appropriate."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    return NextResponse.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error('Chat API Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}