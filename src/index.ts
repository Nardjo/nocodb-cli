#!/usr/bin/env bun
import { Command } from "commander";
import { globalFlags } from "./lib/config.js";
import { authCommand } from "./commands/auth.js";
import { basesResource } from "./resources/bases.js";
import { tablesResource } from "./resources/tables.js";
import { columnsResource } from "./resources/columns.js";
import { recordsResource } from "./resources/records.js";
import { viewsResource } from "./resources/views.js";
import { hooksResource } from "./resources/hooks.js";
import { commentsResource } from "./resources/comments.js";
import { storageResource } from "./resources/storage.js";

const program = new Command();

program
  .name("nocodb-cli")
  .description("CLI for the NocoDB REST API (v2): bases, tables, columns, records, views, webhooks, comments, storage")
  .version("0.1.0")
  .option("--json", "Output as JSON", false)
  .option("--format <fmt>", "Output format: text, json, csv, yaml", "text")
  .option("--verbose", "Enable debug logging", false)
  .option("--no-color", "Disable colored output")
  .option("--no-header", "Omit table/csv headers (for piping)")
  .hook("preAction", (_thisCmd, actionCmd) => {
    const root = actionCmd.optsWithGlobals();
    globalFlags.json = root.json ?? false;
    globalFlags.format = root.format ?? "text";
    globalFlags.verbose = root.verbose ?? false;
    globalFlags.noColor = root.color === false;
    globalFlags.noHeader = root.header === false;
  });

// Built-in commands
program.addCommand(authCommand);

// Resources
program.addCommand(basesResource);
program.addCommand(tablesResource);
program.addCommand(columnsResource);
program.addCommand(recordsResource);
program.addCommand(viewsResource);
program.addCommand(hooksResource);
program.addCommand(commentsResource);
program.addCommand(storageResource);

program.parse();
