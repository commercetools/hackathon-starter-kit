'use client';

export default function TestPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test Page</h1>
      <p>If you can see this, Next.js is working!</p>
      <button
        onClick={() => {
          fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }] })
          })
            .then(r => r.text())
            .then(data => alert('API Response received! Check console.'))
            .catch(e => alert('Error: ' + e.message));
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test API
      </button>
    </div>
  );
}
