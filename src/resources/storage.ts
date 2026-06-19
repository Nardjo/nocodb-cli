import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  url?: string;
  filename?: string;
  path?: string;
}

export const storageResource = new Command("storage").description("Upload attachments to NocoDB storage");

// ── UPLOAD BY URL ─────────────────────────────────────
storageResource
  .command("upload-url")
  .description("Upload an attachment from a public URL")
  .requiredOption("--url <fileUrl>", "Public URL of the file to upload")
  .option("--filename <name>", "Target file name")
  .option("--path <storagePath>", "Storage path", "noco/uploads")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  nocodb-cli storage upload-url --url https://example.com/logo.png --filename logo.png")
  .action(async (opts: Opts) => {
    try {
      const item: Record<string, unknown> = { url: opts.url };
      if (opts.filename) item.fileName = opts.filename;
      const data = await client.post(
        `/api/v2/storage/upload-by-url?path=${encodeURIComponent(opts.path ?? "noco/uploads")}`,
        [item] as unknown as Record<string, unknown>,
      );
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
