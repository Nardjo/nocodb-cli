import { homedir } from "os";
import { join } from "path";

/** Application name (replaced during api2cli create) */
export const APP_NAME = "nocodb";

/** CLI binary name (replaced during api2cli create) */
export const APP_CLI = "nocodb-cli";

/** API base URL. Defaults to NocoDB Cloud; override per-instance with NOCODB_BASE_URL (self-hosted, e.g. https://nocodb.example.com). */
export const BASE_URL = (process.env.NOCODB_BASE_URL || "https://app.nocodb.com").replace(/\/+$/, "");

/** Auth type: bearer | api-key | basic | custom */
export const AUTH_TYPE = "api-key";

/** Auth header name (e.g. Authorization, X-Api-Key) */
export const AUTH_HEADER = "xc-token";

/** Path to the token file for this CLI */
export const TOKEN_PATH = join(homedir(), ".config", "tokens", `${APP_NAME}-cli.txt`);

/** Global state for output flags (set by root command) */
export const globalFlags = {
  json: false,
  format: "text" as "text" | "json" | "csv" | "yaml",
  verbose: false,
  noColor: false,
  noHeader: false,
};
