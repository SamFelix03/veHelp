import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { VeChainWalletProvider } from "./components/VeChainWalletContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <VeChainWalletProvider>
        <App />
      </VeChainWalletProvider>
    </BrowserRouter>
  </React.StrictMode>
);
