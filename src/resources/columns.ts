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
  type?: string;
  options?: string;
}

export const columnsResource = new Command("columns").description("Manage NocoDB table columns (fields)");

// ── LIST ──────────────────────────────────────────────
columnsResource
  .command("list")
  .description("List columns of a table")
  .requiredOption("--table <tableId>", "Table ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const res: any = await client.get(`/api/v2/meta/tables/${opts.table}`);
      output(res?.columns ?? res, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ───────────────────────────────────────────────
columnsResource
  .command("get")
  .description("Get column metadata by ID")
  .argument("<columnId>", "Column ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (columnId: string, opts: Opts) => {
    try {
      const data = await client.get(`/api/v2/meta/columns/${columnId}`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ────────────────────────────────────────────
columnsResource
  .command("create")
  .description("Create a column in a table")
  .requiredOption("--table <tableId>", "Table ID")
  .requiredOption("--title <title>", "Column title")
  .option("--type <uidt>", "UI data type (SingleLineText, Email, URL, Number, Checkbox, ...)", "SingleLineText")
  .option("--options <json>", "Extra column properties as JSON (merged into body)")
  .option("--json", "Output as JSON")
  .addHelpText(
    "after",
    "\nExamples:\n  nocodb-cli columns create --table m_xxx --title Email --type Email\n  nocodb-cli columns create --table m_xxx --title Score --type Number",
  )
  .action(async (opts: Opts) => {
    try {
      const body: Record<string, unknown> = { title: opts.title, uidt: opts.type ?? "SingleLineText" };
      if (opts.options) Object.assign(body, JSON.parse(opts.options));
      const data = await client.post(`/api/v2/meta/tables/${opts.table}/columns`, body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ────────────────────────────────────────────
columnsResource
  .command("update")
  .description("Update a column")
  .argument("<columnId>", "Column ID")
  .option("--title <title>", "New title")
  .option("--type <uidt>", "New UI data type")
  .option("--options <json>", "Extra properties as JSON (merged)")
  .option("--json", "Output as JSON")
  .action(async (columnId: string, opts: Opts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.title) body.title = opts.title;
      if (opts.type) body.uidt = opts.type;
      if (opts.options) Object.assign(body, JSON.parse(opts.options));
      const data = await client.patch(`/api/v2/meta/columns/${columnId}`, body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
columnsResource
  .command("delete")
  .description("Delete a column")
  .argument("<columnId>", "Column ID")
  .option("--json", "Output as JSON")
  .action(async (columnId: string, opts: Opts) => {
    try {
      await client.delete(`/api/v2/meta/columns/${columnId}`);
      output({ deleted: true, columnId }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
