'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import { marked } from 'marked';
import { ProductGrid, Product } from './components/ProductTile';

// Configure marked for safe HTML rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

function formatMarkdown(text: string): string {
  return marked(text) as string;
}

// Helper to extract products from assistant message
function extractProducts(text: string): Product[] {
  try {
    // Look for JSON product data in the message
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      if (data.products && Array.isArray(data.products)) {
        return data.products;
      }
    }
  } catch (e) {
    console.error('Failed to parse products:', e);
  }
  return [];
}

// Helper to remove JSON code blocks from message text
function removeJsonCodeBlocks(text: string): string {
  // Remove JSON code blocks
  return text.replace(/```json\n[\s\S]*?\n```/g, '').trim();
}

export default function Page() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });
  const [input, setInput] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);

  const handleBuyProduct = async (product: Product) => {
    try {
      setCheckoutStatus('Initializing checkout...');

      // Step 1: Initialize checkout session
      const initResponse = await fetch('/api/checkout/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          sku: product.sku,
          quantity: 1,
        }),
      });

      if (!initResponse.ok) {
        const error = await initResponse.json();
        throw new Error(error.details || error.error || 'Failed to initialize checkout');
      }

      const { sessionId } = await initResponse.json();
      setCheckoutStatus('Processing payment...');

      // Step 2: Complete checkout with payment token
      const completeResponse = await fetch('/api/checkout/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
        }),
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        throw new Error(error.details || error.error || 'Failed to complete checkout');
      }

      const { sessionId: completedSessionId } = await completeResponse.json();
      setCheckoutStatus(`✅ Order placed successfully! Session ID: ${completedSessionId}`);

      // Clear status after 5 seconds
      setTimeout(() => setCheckoutStatus(null), 5000);
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutStatus(`❌ Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setCheckoutStatus(null), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex flex-col">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">commercetools Chat Assistant</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Ask me anything about commerce! Try "Show me products"</p>
            {checkoutStatus && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg text-sm">
                {checkoutStatus}
              </div>
            )}
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <div className="text-4xl mb-4">💬</div>
                <p>Start a conversation by typing a message below</p>
                <p className="text-sm mt-2">Try: "Show me all products" or "Search for laptops"</p>
              </div>
            ) : (
              messages.map(message => {
                const messageText = message.parts
                  .filter((part) => part.type === 'text')
                  .map((part) => part.type === 'text' ? part.text : '')
                  .join('');
                const products = message.role === 'assistant' ? extractProducts(messageText) : [];

                return (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className={`${
                      message.role === 'user'
                        ? 'max-w-xs lg:max-w-md px-4 py-3 bg-blue-500 text-white rounded-lg rounded-br-none'
                        : 'max-w-full w-full px-6 py-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg rounded-bl-none shadow-sm border border-gray-200 dark:border-gray-600'
                    }`}>
                      <div className="text-sm font-medium mb-2 opacity-75">
                        {message.role === 'user' ? 'You' : 'Commerce Assistant'}
                      </div>
                      {message.role === 'user' ? (
                        <div className="whitespace-pre-wrap">
                          {messageText}
                        </div>
                      ) : (
                        <>
                          {products.length > 0 ? (
                            <>
                              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-800 dark:prose-headings:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 mb-4">
                                <p>Here {products.length === 1 ? 'is the product' : `are ${products.length} products`} you can buy:</p>
                              </div>
                              <ProductGrid products={products} onBuy={handleBuyProduct} />
                            </>
                          ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-800 dark:prose-headings:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300">
                              {message.parts.map((part, index) => {
                                if (part.type === 'text') {
                                  // Remove JSON code blocks from the displayed text
                                  const cleanText = removeJsonCodeBlocks(part.text);
                                  return cleanText ? (
                                    <div
                                      key={index}
                                      dangerouslySetInnerHTML={{
                                        __html: formatMarkdown(cleanText)
                                      }}
                                    />
                                  ) : null;
                                }
                                return null;
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
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