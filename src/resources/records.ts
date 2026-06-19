import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  fields?: string;
  table?: string;
  view?: string;
  where?: string;
  sort?: string;
  limit?: string;
  offset?: string;
  data?: string;
  id?: string;
}

export const recordsResource = new Command("records").description("Manage NocoDB table records (the data itself)");

// ── LIST ──────────────────────────────────────────────
recordsResource
  .command("list")
  .description("List records in a table")
  .requiredOption("--table <tableId>", "Table ID")
  .option("--view <viewId>", "Restrict to a view")
  .option("--where <expr>", "Filter, e.g. (Status,eq,active)")
  .option("--sort <field>", "Sort field, e.g. -CreatedAt (desc) or Name (asc)")
  .option("--limit <n>", "Max records", "25")
  .option("--offset <n>", "Offset for pagination")
  .option("--fields <cols>", "Comma-separated fields to return/display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText(
    "after",
    "\nExamples:\n  nocodb-cli records list --table m_xxx\n  nocodb-cli records list --table m_xxx --where '(Email,isnot,null)' --limit 50 --json",
  )
  .action(async (opts: Opts) => {
    try {
      const params: Record<string, string> = {};
      if (opts.view) params.viewId = opts.view;
      if (opts.where) params.where = opts.where;
      if (opts.sort) params.sort = opts.sort;
      if (opts.limit) params.limit = opts.limit;
      if (opts.offset) params.offset = opts.offset;
      if (opts.fields) params.fields = opts.fields;
      const res: any = await client.get(`/api/v2/tables/${opts.table}/records`, params);
      output(res?.list ?? res, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ───────────────────────────────────────────────
recordsResource
  .command("get")
  .description("Read a single record by ID")
  .argument("<recordId>", "Record ID")
  .requiredOption("--table <tableId>", "Table ID")
  .option("--fields <cols>", "Comma-separated fields to return")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (recordId: string, opts: Opts) => {
    try {
      const params: Record<string, string> = {};
      if (opts.fields) params.fields = opts.fields;
      const data = await client.get(`/api/v2/tables/${opts.table}/records/${recordId}`, params);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── COUNT ─────────────────────────────────────────────
recordsResource
  .command("count")
  .description("Count records in a table")
  .requiredOption("--table <tableId>", "Table ID")
  .option("--view <viewId>", "Restrict to a view")
  .option("--where <expr>", "Filter expression")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const params: Record<string, string> = {};
      if (opts.view) params.viewId = opts.view;
      if (opts.where) params.where = opts.where;
      const data = await client.get(`/api/v2/tables/${opts.table}/records/count`, params);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ────────────────────────────────────────────
recordsResource
  .command("create")
  .description("Create one or more records (JSON object or array)")
  .requiredOption("--table <tableId>", "Table ID")
  .requiredOption("--data <json>", "Record(s) as JSON object or array")
  .option("--json", "Output as JSON")
  .addHelpText(
    "after",
    '\nExamples:\n  nocodb-cli records create --table m_xxx --data \'{"Email":"a@b.com","Company":"ACME"}\'\n  nocodb-cli records create --table m_xxx --data \'[{"Email":"a@b.com"},{"Email":"c@d.com"}]\'',
  )
  .action(async (opts: Opts) => {
    try {
      const body = JSON.parse(opts.data!);
      const data = await client.post(`/api/v2/tables/${opts.table}/records`, body as Record<string, unknown>);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ────────────────────────────────────────────
recordsResource
  .command("update")
  .description("Update one or more records (JSON must include the primary key, e.g. Id)")
  .requiredOption("--table <tableId>", "Table ID")
  .requiredOption("--data <json>", "Record(s) as JSON incl. Id")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  nocodb-cli records update --table m_xxx --data \'{"Id":12,"Status":"contacted"}\'')
  .action(async (opts: Opts) => {
    try {
      const body = JSON.parse(opts.data!);
      const data = await client.patch(`/api/v2/tables/${opts.table}/records`, body as Record<string, unknown>);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
recordsResource
  .command("delete")
  .description("Delete records by ID or JSON")
  .requiredOption("--table <tableId>", "Table ID")
  .option("--id <recordId>", "Single record ID to delete")
  .option("--data <json>", 'Record(s) to delete as JSON ({"Id":..} or array)')
  .option("--json", "Output as JSON")
  .addHelpText(
    "after",
    '\nExamples:\n  nocodb-cli records delete --table m_xxx --id 12\n  nocodb-cli records delete --table m_xxx --data \'[{"Id":12},{"Id":13}]\'',
  )
  .action(async (opts: Opts) => {
    try {
      let body: unknown;
      if (opts.data) body = JSON.parse(opts.data);
      else if (opts.id) body = { Id: opts.id };
      else throw new Error("Provide --id or --data");
      const data = await client.delete(`/api/v2/tables/${opts.table}/records`, body as Record<string, unknown>);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
