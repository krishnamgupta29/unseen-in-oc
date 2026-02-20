import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const tokenData = await getUserFromToken();

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // TODO: Integrate with AI service (OpenAI, Anthropic, or Gemini)
    // For now, return a placeholder response
    
    const AI_API_KEY = process.env.AI_API_KEY;

    if (!AI_API_KEY) {
      // Return a friendly fallback response
      const fallbackResponses = [
        "I'm here to listen. Tell me more about what's on your mind.",
        "That sounds like a lot to carry. How are you feeling about it?",
        "I understand. Sometimes it helps just to express these thoughts.",
        "Thank you for sharing that with me. What would help you most right now?",
        "It's okay to feel this way. You're not alone in this.",
      ];

      const response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      return NextResponse.json({
        success: true,
        response,
        type: 'text',
      });
    }

    // Example OpenAI integration (uncomment and configure when ready)
    /*
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate AI companion for UNSEEN, an anonymous social platform. Be empathetic, supportive, and understanding. Keep responses concise and warm.',
          },
          ...(conversationHistory || []),
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await openaiResponse.json();
    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      response: aiResponse,
      type: 'text',
    });
    */

    // Placeholder response
    return NextResponse.json({
      success: true,
      response: "I'm here to listen. Tell me more about what's on your mind.",
      type: 'text',
      note: 'AI integration pending - configure AI_API_KEY in environment variables',
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
