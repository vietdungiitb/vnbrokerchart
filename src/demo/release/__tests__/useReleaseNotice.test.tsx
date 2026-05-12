// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const reactActEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

const originalConsoleError = console.error;
console.error = (..._args: unknown[]) => {};

let act: typeof import("react").act;
let createRoot: typeof import("react-dom/client").createRoot;
let useReleaseNotice: typeof import("../useReleaseNotice").useReleaseNotice;

beforeEach(async () => {
	({ act } = await import("react"));
	({ createRoot } = await import("react-dom/client"));
	({ useReleaseNotice } = await import("../useReleaseNotice"));
	window.localStorage.clear();
	vi.restoreAllMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
	window.localStorage.clear();
	console.error = originalConsoleError;
});

function ReleaseNoticeProbe() {
	const { status, hasUpdate, currentVersion, latestRelease, dismissCurrentRelease } = useReleaseNotice();
	return (
		<div
			data-status={status}
			data-has-update={String(hasUpdate)}
			data-current-version={currentVersion}
			data-remote-version={latestRelease?.remoteVersion ?? ""}
			data-dismiss="probe"
		>
			<button type="button" data-testid="dismiss" onClick={dismissCurrentRelease}>dismiss</button>
		</div>
	);
}

describe("useReleaseNotice", () => {
	it("detects a newer release and supports dismissal by version", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({
				tag_name: "v1.0.1",
				name: "Release 1.0.1",
				html_url: "https://github.com/vietdungiitb/vnbrokercharts/releases/tag/v1.0.1",
				published_at: "2026-05-12T00:00:00.000Z",
				body: "Notes",
			}), {
				status: 200,
				headers: { ETag: "etag-789" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);

		await act(async () => {
			root.render(<ReleaseNoticeProbe />);
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(container.querySelector("div")?.getAttribute("data-status")).toBe("update-available");
		expect(container.querySelector("div")?.getAttribute("data-has-update")).toBe("true");
		expect(container.querySelector("div")?.getAttribute("data-remote-version")).toBe("1.0.1");

		await act(async () => {
			container.querySelector<HTMLButtonElement>("button[data-testid='dismiss']")?.click();
			await Promise.resolve();
		});

		expect(window.localStorage.getItem("vnbrokercharts-release-dismissed-version-v1")).toBe("1.0.1");
		expect(container.querySelector("div")?.getAttribute("data-status")).toBe("up-to-date");

		root.unmount();
		container.remove();
	});
});