import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
const theme = createTheme({
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <MantineProvider theme={theme}>
    <App />
    </MantineProvider>
    </BrowserRouter>
  </StrictMode>,
)
