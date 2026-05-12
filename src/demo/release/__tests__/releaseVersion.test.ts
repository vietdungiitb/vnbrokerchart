import { describe, expect, it } from "vitest";

import { compareReleaseVersions, normalizeReleaseTag } from "../releaseVersion";

describe("releaseVersion", () => {
	it("normalizes GitHub release tags", () => {
		expect(normalizeReleaseTag("v1.2.3")).toBe("1.2.3");
		expect(normalizeReleaseTag("refs/tags/v1.2.3")).toBe("1.2.3");
		expect(normalizeReleaseTag("1.2.3")).toBe("1.2.3");
	});

	it("compares semantic versions numerically", () => {
		expect(compareReleaseVersions("1.2.3", "1.2.4")).toBeLessThan(0);
		expect(compareReleaseVersions("1.2.4", "1.2.3")).toBeGreaterThan(0);
		expect(compareReleaseVersions("v1.2.3", "1.2.3")).toBe(0);
	});

	it("treats prerelease builds as lower precedence than stable releases", () => {
		expect(compareReleaseVersions("1.2.3", "1.2.3-rc.1")).toBeGreaterThan(0);
		expect(compareReleaseVersions("1.2.3-rc.1", "1.2.3")).toBeLessThan(0);
	});
});