import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { SWRConfig } from "swr"
import { CssBaseline } from '@mui/material'

const defaultFetcher = async function (resource: string) {
  const response = await fetch(resource, { method: 'GET' });
  if (response.status !== 200) {
    return response.text();
  }
  return response.json() as unknown;
};

const root = document.getElementById('root');

if (root === null) {
  throw new Error('Missing root element');
}

createRoot(root).render(
  <StrictMode>
    <SWRConfig
      value={{ fetcher: defaultFetcher, keepPreviousData: true }}
    >
      <CssBaseline enableColorScheme />
      <App />
    </SWRConfig>
  </StrictMode>,
)
