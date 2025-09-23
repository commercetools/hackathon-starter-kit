'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import { marked } from 'marked';

// Configure marked for safe HTML rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

function formatMarkdown(text: string): string {
  return marked(text) as string;
}

export default function Page() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });
  const [input, setInput] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex flex-col">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">commercetools Chat Assistant</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Ask me anything about commerce!</p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <div className="text-4xl mb-4">💬</div>
                <p>Start a conversation by typing a message below</p>
              </div>
            ) : (
              messages.map(message => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`${
                    message.role === 'user'
                      ? 'max-w-xs lg:max-w-md px-4 py-3 bg-blue-500 text-white rounded-lg rounded-br-none'
                      : 'max-w-full lg:max-w-3xl px-6 py-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg rounded-bl-none shadow-sm border border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="text-sm font-medium mb-2 opacity-75">
                      {message.role === 'user' ? 'You' : 'Commerce Assistant'}
                    </div>
                    {message.role === 'user' ? (
                      <div className="whitespace-pre-wrap">
                        {message.parts.map((part) =>
                          part.type === 'text' ? part.text : null
                        )}
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-800 dark:prose-headings:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300">
                        {message.parts.map((part, index) =>
                          part.type === 'text' ? (
                            <div
                              key={index}
                              dangerouslySetInnerHTML={{
                                __html: formatMarkdown(part.text)
                              }}
                            />
                          ) : null,
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="container mx-auto max-w-4xl">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage({ text: input });
                setInput('');
              }
            }}
            className="flex gap-3"
          >
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={status !== 'ready'}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={status !== 'ready' || !input.trim()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {status === 'ready' ? 'Send' : 'Sending...'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}