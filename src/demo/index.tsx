import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LibraryShowcaseDemo from "./LibraryShowcaseDemo";

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(
        <StrictMode>
            <LibraryShowcaseDemo />
        </StrictMode>
    );
}
