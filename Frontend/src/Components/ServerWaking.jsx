import { useState, useEffect } from 'react';

const ServerWaking = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    const checkServer = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/health`);
        if (res.ok) {
          clearInterval(dotInterval);
          setReady(true);
        }
      } catch {
        // server still sleeping, retry
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(dotInterval);
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="border-4 border-black p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-yellow-50 text-center">
          <div className="w-16 h-16 border-4 border-black bg-yellow-400 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="font-black text-2xl uppercase mb-2">ExpenseFlow</h1>
          <p className="font-bold text-lg">Waking up server{dots}</p>
          <p className="text-sm text-gray-500 mt-3 font-medium">Free tier hosting takes a moment to start</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ServerWaking;
