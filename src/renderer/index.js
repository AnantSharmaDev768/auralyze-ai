import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// import "../index.css";  // KEEP COMMENTED - we'll use inline styles

const container = document.getElementById("root");

if (!container) {
  console.error("CRITICAL: #root element not found");
} else {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}