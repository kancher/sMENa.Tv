'use client';
export default function Test() {
  const envVars = {
    processEnv: process.env.PUBLIC_BACKEND_API,
    importMetaEnv: import.meta.env?.PUBLIC_BACKEND_API,
    allProcessEnv: process.env,
    allImportMetaEnv: import.meta.env
  };
  
  console.log('🔧 ENV Debug:', envVars);
  
  return (
    <div>
      <div>Process.env: {envVars.processEnv || 'NOT FOUND'}</div>
      <div>Import.meta.env: {envVars.importMetaEnv || 'NOT FOUND'}</div>
    </div>
  );
}
