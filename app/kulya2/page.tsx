'use client';
export default function Test() {
  const API_URL = import.meta.env.PUBLIC_BACKEND_API;
  return <div>API: {API_URL || 'NOT FOUND'}</div>;
}
