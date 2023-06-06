import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import App2 from "./App1";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App2 />
  </StrictMode>
);
