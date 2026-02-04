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
    <div className="mx-auto max-w-3xl p-8 text-center">
      <h1 className="mb-4 text-3xl font-bold text-gray-800">My Wallet</h1>
      <p className="text-gray-600">Backend status: {message}</p>
    </div>
  );
}
