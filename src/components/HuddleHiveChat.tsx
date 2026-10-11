import React, { useEffect, useRef, useState } from 'react';

type ChatRole = 'user' | 'assistant' | 'system';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const systemPrompt: ChatMessage = {
  role: 'system',
  content:
    'You are a helpful AI assistant for HuddleHive. You help users with questions about the application and provide friendly, concise assistance.',
};

export const HuddleHiveChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your HuddleHive assistant. How can I help you today?",
    },
  ]);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const trimmed = input.trim();

    if (!trimmed || isLoading) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: trimmed },
    ];

    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content:
            'Please add your OpenAI key in the environment as VITE_OPENAI_API_KEY to enable the AI assistant.',
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [systemPrompt, ...nextMessages],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content?.trim();

      if (!aiResponse) {
        throw new Error('No response returned by the model');
      }

      setMessages([
        ...nextMessages,
        { role: 'assistant', content: aiResponse },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error. Please try again. Error: ${message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="huddle-chat-widget">
      <button
        type="button"
        className="huddle-chat-toggle"
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Toggle AI assistant"
      >
        <img src="/nest-bird.png" alt="" />
      </button>

      <div className={`huddle-chat-window ${isOpen ? 'open' : 'hidden'}`}>
        <div className="huddle-chat-header">
          <h3>AI Assistant</h3>
          <button
            type="button"
            className="huddle-chat-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close AI assistant"
          >
            &times;
          </button>
        </div>

        <div ref={messagesRef} className="huddle-chat-messages">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`huddle-chat-message ${
                message.role === 'user' ? 'user-message' : 'bot-message'
              }`}
            >
              <p>{message.content}</p>
            </div>
          ))}

          {isLoading && (
            <div className="huddle-chat-typing-indicator" aria-live="polite">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        <div className="huddle-chat-input-row">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask me anything..."
            aria-label="Ask the AI assistant a question"
            disabled={isLoading}
          />
          <button
            type="button"
            className="huddle-chat-send"
            onClick={() => void sendMessage()}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
