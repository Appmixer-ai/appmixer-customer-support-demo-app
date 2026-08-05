import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./lib/appmixer/appmixer.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
