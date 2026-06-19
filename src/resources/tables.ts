import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  fields?: string;
  base?: string;
  title?: string;
  tableName?: string;
  columns?: string;
}

export const tablesResource = new Command("tables").description("Manage NocoDB tables");

// ── LIST ──────────────────────────────────────────────
tablesResource
  .command("list")
  .description("List tables in a base")
  .requiredOption("--base <baseId>", "Base ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  nocodb-cli tables list --base p_xxxxxxxx")
  .action(async (opts: Opts) => {
    try {
      const res: any = await client.get(`/api/v2/meta/bases/${opts.base}/tables`);
      output(res?.list ?? res, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ───────────────────────────────────────────────
tablesResource
  .command("get")
  .description("Get table metadata (incl. columns) by ID")
  .argument("<tableId>", "Table ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (tableId: string, opts: Opts) => {
    try {
      const data = await client.get(`/api/v2/meta/tables/${tableId}`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ────────────────────────────────────────────
tablesResource
  .command("create")
  .description("Create a table in a base")
  .requiredOption("--base <baseId>", "Base ID")
  .requiredOption("--title <title>", "Table title")
  .option("--table-name <name>", "Underlying table name (defaults to title)")
  .option("--columns <json>", "JSON array of column definitions")
  .option("--json", "Output as JSON")
  .addHelpText(
    "after",
    '\nExamples:\n  nocodb-cli tables create --base p_xxx --title Leads\n  nocodb-cli tables create --base p_xxx --title Leads --columns \'[{"title":"Email","uidt":"Email"}]\'',
  )
  .action(async (opts: Opts) => {
    try {
      const body: Record<string, unknown> = {
        title: opts.title,
        table_name: opts.tableName ?? opts.title,
      };
      if (opts.columns) body.columns = JSON.parse(opts.columns);
      const data = await client.post(`/api/v2/meta/bases/${opts.base}/tables`, body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ────────────────────────────────────────────
tablesResource
  .command("update")
  .description("Update a table")
  .argument("<tableId>", "Table ID")
  .option("--title <title>", "New title")
  .option("--table-name <name>", "New underlying table name")
  .option("--json", "Output as JSON")
  .action(async (tableId: string, opts: Opts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.title) body.title = opts.title;
      if (opts.tableName) body.table_name = opts.tableName;
      const data = await client.patch(`/api/v2/meta/tables/${tableId}`, body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
tablesResource
  .command("delete")
  .description("Delete a table")
  .argument("<tableId>", "Table ID")
  .option("--json", "Output as JSON")
  .action(async (tableId: string, opts: Opts) => {
    try {
      await client.delete(`/api/v2/meta/tables/${tableId}`);
      output({ deleted: true, tableId }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
