// Import polyfills first
import "./polyfills";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { VeChainWalletProvider } from "./components/VeChainWalletContext";
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <VeChainWalletProvider>
          <App />
        </VeChainWalletProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
