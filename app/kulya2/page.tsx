'use client';
export default function Test() {
  // CloudFlare Pages использует Vite, поэтому import.meta.env
  const API_URL = import.meta.env.PUBLIC_BACKEND_API;
  
  return (
    <div>
      <div>API URL: {API_URL || 'NOT FOUND'}</div>
      <button onClick={() => console.log('Full env:', import.meta.env)}>
        Log Full Env
      </button>
    </div>
  );
}
