import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./registerSW";

// Prevent right-click "Save As" on images
document.addEventListener("contextmenu", (e) => {
  if (e.target instanceof HTMLImageElement) {
    e.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
