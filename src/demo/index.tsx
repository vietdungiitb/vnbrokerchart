import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import OriginalLikeDemo from "./OriginalLikeDemo";

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(
        <StrictMode>
            <OriginalLikeDemo />
        </StrictMode>
    );
}
