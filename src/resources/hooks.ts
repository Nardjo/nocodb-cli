import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  fields?: string;
  table?: string;
  data?: string;
}

export const hooksResource = new Command("hooks").description("Manage NocoDB table webhooks");

// ── LIST ──────────────────────────────────────────────
hooksResource
  .command("list")
  .description("List webhooks of a table")
  .requiredOption("--table <tableId>", "Table ID")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const res: any = await client.get(`/api/v2/meta/tables/${opts.table}/hooks`);
      output(res?.list ?? res, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ────────────────────────────────────────────
hooksResource
  .command("create")
  .description("Create a webhook (pass the full config as JSON)")
  .requiredOption("--table <tableId>", "Table ID")
  .requiredOption("--data <json>", "Webhook config as JSON")
  .option("--json", "Output as JSON")
  .addHelpText(
    "after",
    '\nExample:\n  nocodb-cli hooks create --table m_xxx --data \'{"title":"notify","event":"after","operation":"insert","notification":{"type":"URL","payload":{"method":"POST","path":"https://example.com/hook"}}}\'',
  )
  .action(async (opts: Opts) => {
    try {
      const body = JSON.parse(opts.data!);
      const data = await client.post(`/api/v2/meta/tables/${opts.table}/hooks`, body as Record<string, unknown>);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ────────────────────────────────────────────
hooksResource
  .command("update")
  .description("Update a webhook")
  .argument("<hookId>", "Hook ID")
  .requiredOption("--data <json>", "Updated config as JSON")
  .option("--json", "Output as JSON")
  .action(async (hookId: string, opts: Opts) => {
    try {
      const body = JSON.parse(opts.data!);
      const data = await client.patch(`/api/v2/meta/hooks/${hookId}`, body as Record<string, unknown>);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
hooksResource
  .command("delete")
  .description("Delete a webhook")
  .argument("<hookId>", "Hook ID")
  .option("--json", "Output as JSON")
  .action(async (hookId: string, opts: Opts) => {
    try {
      await client.delete(`/api/v2/meta/hooks/${hookId}`);
      output({ deleted: true, hookId }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
