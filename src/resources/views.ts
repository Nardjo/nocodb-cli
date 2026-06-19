import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  fields?: string;
  table?: string;
  title?: string;
}

export const viewsResource = new Command("views").description("Manage NocoDB table views");

// ── LIST ──────────────────────────────────────────────
viewsResource
  .command("list")
  .description("List views of a table")
  .requiredOption("--table <tableId>", "Table ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const res: any = await client.get(`/api/v2/meta/tables/${opts.table}/views`);
      output(res?.list ?? res, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ────────────────────────────────────────────
viewsResource
  .command("update")
  .description("Update a view (e.g. rename)")
  .argument("<viewId>", "View ID")
  .option("--title <title>", "New title")
  .option("--json", "Output as JSON")
  .action(async (viewId: string, opts: Opts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.title) body.title = opts.title;
      const data = await client.patch(`/api/v2/meta/views/${viewId}`, body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
viewsResource
  .command("delete")
  .description("Delete a view")
  .argument("<viewId>", "View ID")
  .option("--json", "Output as JSON")
  .action(async (viewId: string, opts: Opts) => {
    try {
      await client.delete(`/api/v2/meta/views/${viewId}`);
      output({ deleted: true, viewId }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
