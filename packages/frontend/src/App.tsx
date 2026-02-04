import { useState, useEffect } from 'react';

export default function App() {
  const [message, setMessage] = useState<string>('Loading...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Failed to connect to backend'));
  }, []);

  return (
    <div className="app">
      <h1>My Wallet</h1>
      <p>Backend status: {message}</p>
    </div>
  );
}
