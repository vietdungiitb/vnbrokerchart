import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SimpleDemo from "./SimpleDemo";

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(
        <StrictMode>
            <SimpleDemo />
        </StrictMode>
    );
}
