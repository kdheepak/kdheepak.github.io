import { execFileSync } from "node:child_process";

const commitCache = new Map<string, string | undefined>();
let headCommitHash: string | undefined | null = null;

export const getLatestCommitHash = (
  filePath: string | undefined
): string | undefined => {
  const normalizedPath = filePath?.trim() ?? "";
  if (normalizedPath === "") return undefined;

  if (commitCache.has(normalizedPath)) {
    return commitCache.get(normalizedPath);
  }

  try {
    const commitHash = execFileSync(
      "git",
      ["log", "-n", "1", "--pretty=format:%H", "--", normalizedPath],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }
    ).trim();

    const value = commitHash === "" ? undefined : commitHash;
    commitCache.set(normalizedPath, value);
    return value;
  } catch {
    commitCache.set(normalizedPath, undefined);
    return undefined;
  }
};

export const getRepositoryHeadCommitHash = (): string | undefined => {
  if (headCommitHash !== null) {
    return headCommitHash;
  }

  try {
    const commitHash = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    headCommitHash = commitHash === "" ? undefined : commitHash;
    return headCommitHash;
  } catch {
    headCommitHash = undefined;
    return undefined;
  }
};
