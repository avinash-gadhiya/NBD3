import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/base.css';
import './styles/controls.css';
import './styles/button-birds.css';
import './styles/music.css';
import './styles/book.css';
import './styles/butterflies.css';
import './styles/pixel-cat.css';
import './styles/stickers.css';
import './styles/responsive.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
