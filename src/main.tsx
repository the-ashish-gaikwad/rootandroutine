import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { logError } from "./lib/errorLogger";

window.addEventListener('error', (event) => {
  logError(event.error ?? event.message, 'global:uncaught');
});

window.addEventListener('unhandledrejection', (event) => {
  logError(event.reason, 'global:unhandledrejection');
});

createRoot(document.getElementById("root")!).render(<App />);
