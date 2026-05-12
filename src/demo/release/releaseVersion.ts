function splitPrerelease(version: string): { core: string; prerelease: string[] } {
	const [corePart, prereleasePart] = version.split("-");
	if (!prereleasePart) {
		return { core: version, prerelease: [] };
	}
	return {
		core: corePart,
		prerelease: prereleasePart.split("."),
	};
}

function parseNumericVersion(version: string): { major: number; minor: number; patch: number; prerelease: string[] } | null {
	const normalized = normalizeReleaseTag(version).split("+")[0].trim();
	if (!normalized) {
		return null;
	}
	const { core, prerelease } = splitPrerelease(normalized);
	const segments = core.split(".");
	if (segments.length !== 3 || segments.some((segment) => !/^\d+$/.test(segment))) {
		return null;
	}
	const [major, minor, patch] = segments.map((segment) => Number.parseInt(segment, 10));
	return { major, minor, patch, prerelease };
}

function comparePrereleaseIdentifier(left: string, right: string): number {
	const leftIsNumeric = /^\d+$/.test(left);
	const rightIsNumeric = /^\d+$/.test(right);
	if (leftIsNumeric && rightIsNumeric) {
		return Number.parseInt(left, 10) - Number.parseInt(right, 10);
	}
	if (leftIsNumeric) {
		return -1;
	}
	if (rightIsNumeric) {
		return 1;
	}
	return left.localeCompare(right);
}

export function normalizeReleaseTag(tag: string): string {
	return tag.trim().replace(/^refs\/tags\//i, "").replace(/^v/i, "");
}

export function compareReleaseVersions(localVersion: string, remoteVersion: string): number {
	const local = parseNumericVersion(localVersion);
	const remote = parseNumericVersion(remoteVersion);
	if (!local || !remote) {
		return 0;
	}

	if (local.major !== remote.major) {
		return local.major - remote.major;
	}
	if (local.minor !== remote.minor) {
		return local.minor - remote.minor;
	}
	if (local.patch !== remote.patch) {
		return local.patch - remote.patch;
	}

	if (local.prerelease.length === 0 && remote.prerelease.length === 0) {
		return 0;
	}
	if (local.prerelease.length === 0) {
		return 1;
	}
	if (remote.prerelease.length === 0) {
		return -1;
	}

	const maxLength = Math.max(local.prerelease.length, remote.prerelease.length);
	for (let index = 0; index < maxLength; index += 1) {
		const left = local.prerelease[index];
		const right = remote.prerelease[index];
		if (left === undefined && right === undefined) {
			return 0;
		}
		if (left === undefined) {
			return -1;
		}
		if (right === undefined) {
			return 1;
		}
		const comparison = comparePrereleaseIdentifier(left, right);
		if (comparison !== 0) {
			return comparison;
		}
	}

	return 0;
}

export function isStableReleaseVersion(version: string): boolean {
	const parsedVersion = parseNumericVersion(version);
	return parsedVersion ? parsedVersion.prerelease.length === 0 : false;
}