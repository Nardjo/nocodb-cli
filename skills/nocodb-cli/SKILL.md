---
name: nocodb
description: "Manage NocoDB via CLI - bases, tables, columns, records, views, hooks (webhooks), comments, storage. Use when user mentions 'nocodb', 'no-code database', 'airtable alternative', wants to read/write records or rows, create tables or fields, set up NocoDB webhooks, or interact with a self-hosted/cloud NocoDB instance from the terminal."
category: database
---

# nocodb-cli

A standardized CLI for the [NocoDB](https://nocodb.com) REST API (v2). Works with NocoDB Cloud and any self-hosted instance.

## When To Use This Skill

Use the `nocodb-cli` skill when you need to:

- Read, create, update, or delete **records** (rows) in a NocoDB table from scripts or agents
- Bulk-insert data into NocoDB (e.g. an automation pipeline writing leads, logs, or scraped data)
- Create or inspect **bases** (projects), **tables**, and **columns** (fields) programmatically
- List or manage **views**, set up **webhooks** (hooks) on a table, add **comments** to records
- Upload attachments by URL to NocoDB storage
- Drive a NocoDB instance as the database/CRM backend of an n8n or cron-based workflow

## Capabilities

- Full CRUD on table records, plus `count` and rich filtering (`--where`), sorting (`--sort`), pagination (`--limit`/`--offset`), field selection (`--fields`), and view scoping (`--view`)
- Meta operations: create/list/get/update/delete bases, tables, and columns (typed fields via `--type`)
- List/update/delete views; create/update/delete webhooks; manage record comments
- Upload attachments from a public URL
- Multi-format output (`--json`, `--format text|csv|yaml`) for piping into other tools
- Self-hosted friendly: point at any instance with the `NOCODB_BASE_URL` env var

## Common Use Cases

- "Add these 30 leads to my NocoDB Leads table" → `records create --table <id> --data '[...]'`
- "How many records have no email?" → `records count --table <id> --where '(Email,is,null)'`
- "Mark record 12 as contacted" → `records update --table <id> --data '{"Id":12,"Status":"contacted"}'`
- "Create a Leads table with Email and Score columns" → `tables create` then `columns create`
- "Export all rows of a view as CSV" → `records list --table <id> --view <viewId> --format csv`
- "Set up a webhook that fires after insert" → `hooks create --table <id> --data '{...}'`

## Setup

If `nocodb-cli` is not found, install and build it:
```bash
bun --version || curl -fsSL https://bun.sh/install | bash
npx api2cli bundle nocodb
npx api2cli link nocodb
```

`api2cli link` adds `~/.local/bin` to PATH automatically. The CLI is available in the next command.

Always use `--json` when calling commands programmatically.

## Authentication

NocoDB authenticates API calls with an **API token** sent in the `xc-token` header. Create one in the NocoDB UI: top-right user menu → **Account Settings → Tokens → Create new token**.

```bash
nocodb-cli auth set "your-xc-token"   # stored in ~/.config/tokens/nocodb-cli.txt (chmod 600)
nocodb-cli auth test                  # verify the token works
nocodb-cli auth show                  # display masked token
nocodb-cli auth remove                # delete stored token
```

### Pointing at your instance (IMPORTANT for self-hosted)

The CLI defaults to NocoDB Cloud (`https://app.nocodb.com`). For a self-hosted instance, set the **root URL** of your instance (no `/api/v2` suffix) via `NOCODB_BASE_URL`:

```bash
export NOCODB_BASE_URL="https://nocodb.example.com"
# then
nocodb-cli bases list --json
```

Add the export to your shell profile to make it permanent.

## Resources

### bases — projects

| Command | Description |
|---------|-------------|
| `bases list [--fields] [--json]` | List all bases |
| `bases get <baseId>` | Get a base schema |
| `bases create --title <title>` | Create a base |
| `bases update <baseId> [--title]` | Update a base |
| `bases delete <baseId>` | Delete a base |

### tables

| Command | Description |
|---------|-------------|
| `tables list --base <baseId> [--fields]` | List tables in a base |
| `tables get <tableId>` | Get table metadata (incl. columns) |
| `tables create --base <baseId> --title <title> [--table-name <name>] [--columns <json>]` | Create a table |
| `tables update <tableId> [--title] [--table-name]` | Update a table |
| `tables delete <tableId>` | Delete a table |

### columns — fields

| Command | Description |
|---------|-------------|
| `columns list --table <tableId>` | List a table's columns |
| `columns get <columnId>` | Get column metadata |
| `columns create --table <tableId> --title <title> [--type <uidt>] [--options <json>]` | Create a column. `--type` is a NocoDB UI data type: `SingleLineText`, `LongText`, `Email`, `URL`, `PhoneNumber`, `Number`, `Decimal`, `Checkbox`, `Date`, `DateTime`, `SingleSelect`, `MultiSelect`, etc. (default `SingleLineText`) |
| `columns update <columnId> [--title] [--type] [--options]` | Update a column |
| `columns delete <columnId>` | Delete a column |

### records — the data (rows)

| Command | Description |
|---------|-------------|
| `records list --table <tableId> [--view] [--where] [--sort] [--limit] [--offset] [--fields]` | List records |
| `records get <recordId> --table <tableId> [--fields]` | Read one record |
| `records count --table <tableId> [--view] [--where]` | Count records |
| `records create --table <tableId> --data <json>` | Create one (object) or many (array) |
| `records update --table <tableId> --data <json>` | Update one/many (JSON must include the primary key `Id`) |
| `records delete --table <tableId> (--id <recordId> \| --data <json>)` | Delete by id or JSON |

**Filter syntax** (`--where`): `(field,op,value)`, e.g. `(Status,eq,active)`, `(Email,is,null)`, `(Score,gt,5)`. Combine with `~and`/`~or`: `(Status,eq,active)~and(Score,gt,5)`.
**Sort** (`--sort`): `Field` (asc) or `-Field` (desc).

### views

| Command | Description |
|---------|-------------|
| `views list --table <tableId>` | List a table's views |
| `views update <viewId> [--title]` | Update/rename a view |
| `views delete <viewId>` | Delete a view |

### hooks — webhooks

| Command | Description |
|---------|-------------|
| `hooks list --table <tableId>` | List a table's webhooks |
| `hooks create --table <tableId> --data <json>` | Create a webhook (full config as JSON) |
| `hooks update <hookId> --data <json>` | Update a webhook |
| `hooks delete <hookId>` | Delete a webhook |

### comments

| Command | Description |
|---------|-------------|
| `comments list --table <modelId> --row <rowId>` | List comments on a record |
| `comments add --table <modelId> --row <rowId> --comment <text>` | Add a comment |
| `comments update <commentId> --comment <text>` | Update a comment |
| `comments delete <commentId>` | Delete a comment |

### storage

| Command | Description |
|---------|-------------|
| `storage upload-url --url <fileUrl> [--filename <name>] [--path <storagePath>]` | Upload an attachment from a public URL |

## Working Rules

- Always use `--json` for agent-driven calls so downstream steps can parse the result.
- Most data commands need a **table ID** (`m_...`) via `--table`; get it from `tables list --base <baseId>`.
- For self-hosted, set `NOCODB_BASE_URL` first or every call hits NocoDB Cloud.
- Prefer read commands (`list`, `get`, `count`) before mutating data.
- Start with `--help` if a flag is unclear instead of guessing.

## Output Format

`--json` returns a standardized envelope:
```json
{ "ok": true, "data": { ... }, "meta": { "total": 42 } }
```

On error: `{ "ok": false, "error": { "message": "...", "status": 401 } }`

List commands unwrap NocoDB's `{ list, pageInfo }` shape to the array of items for clean table/CSV output.

## Quick Reference

```bash
nocodb-cli --help                      # List all resources and global flags
nocodb-cli <resource> --help           # List all actions for a resource
nocodb-cli <resource> <action> --help  # Show flags for a specific action
```

## Global Flags

All commands support: `--json`, `--format <text|json|csv|yaml>`, `--verbose`, `--no-color`, `--no-header`

Exit codes: 0 = success, 1 = API error, 2 = usage error
