import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { App } from "./App";

const emotionCache = createCache({
  key: 'maptech',
  nonce: 'maptech-csp-v1',
});

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <CacheProvider value={emotionCache}>
      <App />
    </CacheProvider>,
  );
}