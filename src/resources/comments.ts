import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  fields?: string;
  table?: string;
  row?: string;
  comment?: string;
}

export const commentsResource = new Command("comments").description("Manage NocoDB record comments");

// ── LIST ──────────────────────────────────────────────
commentsResource
  .command("list")
  .description("List comments for a record")
  .requiredOption("--table <modelId>", "Table (model) ID")
  .requiredOption("--row <rowId>", "Record/row ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const res: any = await client.get("/api/v2/meta/comments", {
        fk_model_id: opts.table!,
        row_id: opts.row!,
      });
      output(res?.list ?? res, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── ADD ───────────────────────────────────────────────
commentsResource
  .command("add")
  .description("Add a comment to a record")
  .requiredOption("--table <modelId>", "Table (model) ID")
  .requiredOption("--row <rowId>", "Record/row ID")
  .requiredOption("--comment <text>", "Comment text")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const data = await client.post("/api/v2/meta/comments", {
        fk_model_id: opts.table,
        row_id: opts.row,
        comment: opts.comment,
      });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ────────────────────────────────────────────
commentsResource
  .command("update")
  .description("Update a comment")
  .argument("<commentId>", "Comment ID")
  .requiredOption("--comment <text>", "New comment text")
  .option("--json", "Output as JSON")
  .action(async (commentId: string, opts: Opts) => {
    try {
      const data = await client.patch(`/api/v2/meta/comment/${commentId}`, { comment: opts.comment });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
commentsResource
  .command("delete")
  .description("Delete a comment")
  .argument("<commentId>", "Comment ID")
  .option("--json", "Output as JSON")
  .action(async (commentId: string, opts: Opts) => {
    try {
      await client.delete(`/api/v2/meta/comment/${commentId}`);
      output({ deleted: true, commentId }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
