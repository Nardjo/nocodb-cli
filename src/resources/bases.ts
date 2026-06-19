import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  fields?: string;
  title?: string;
}

export const basesResource = new Command("bases").description("Manage NocoDB bases (projects)");

// ── LIST ──────────────────────────────────────────────
basesResource
  .command("list")
  .description("List all bases")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExamples:\n  nocodb-cli bases list\n  nocodb-cli bases list --json")
  .action(async (opts: Opts) => {
    try {
      const res: any = await client.get("/api/v2/meta/bases/");
      output(res?.list ?? res, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ───────────────────────────────────────────────
basesResource
  .command("get")
  .description("Get a base schema by ID")
  .argument("<baseId>", "Base ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (baseId: string, opts: Opts) => {
    try {
      const data = await client.get(`/api/v2/meta/bases/${baseId}`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ────────────────────────────────────────────
basesResource
  .command("create")
  .description("Create a new base")
  .requiredOption("--title <title>", "Base title")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExample:\n  nocodb-cli bases create --title "Prospection"')
  .action(async (opts: Opts) => {
    try {
      const data = await client.post("/api/v2/meta/bases/", { title: opts.title });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ────────────────────────────────────────────
basesResource
  .command("update")
  .description("Update a base")
  .argument("<baseId>", "Base ID")
  .option("--title <title>", "New title")
  .option("--json", "Output as JSON")
  .action(async (baseId: string, opts: Opts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.title) body.title = opts.title;
      const data = await client.patch(`/api/v2/meta/bases/${baseId}`, body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
basesResource
  .command("delete")
  .description("Delete a base")
  .argument("<baseId>", "Base ID")
  .option("--json", "Output as JSON")
  .action(async (baseId: string, opts: Opts) => {
    try {
      await client.delete(`/api/v2/meta/bases/${baseId}`);
      output({ deleted: true, baseId }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
