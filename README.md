# nocodb-cli

A standardized, agent-ready CLI for the [NocoDB](https://nocodb.com) REST API (v2). Works with **NocoDB Cloud** and any **self-hosted** instance.

Built with [api2cli](https://api2cli.dev).

```bash
nocodb-cli records create --table m_xxxx --data '{"Email":"hi@acme.com","Company":"ACME"}'
nocodb-cli records list   --table m_xxxx --where '(Status,eq,new)' --limit 50 --json
```

## Install

With api2cli (clones, builds, links to PATH, installs the AgentSkill):
```bash
npx api2cli install Nardjo/nocodb-cli
```

Or build from source:
```bash
bun --version || curl -fsSL https://bun.sh/install | bash
git clone https://github.com/Nardjo/nocodb-cli.git
cd nocodb-cli
npx api2cli bundle nocodb
npx api2cli link nocodb
```

Install the AgentSkill only:
```bash
npx skills add Nardjo/nocodb-cli
```

## Authentication

NocoDB uses an **API token** sent in the `xc-token` header. Create one in the NocoDB UI: top-right user menu → **Account Settings → Tokens → Create new token**.

```bash
nocodb-cli auth set "your-xc-token"   # saved to ~/.config/tokens/nocodb-cli.txt (chmod 600)
nocodb-cli auth test                  # verify it works
```

### Self-hosted instances

The CLI defaults to NocoDB Cloud (`https://app.nocodb.com`). Point it at your own instance with `NOCODB_BASE_URL` (the **root URL**, no `/api/v2` suffix):

```bash
export NOCODB_BASE_URL="https://nocodb.example.com"
nocodb-cli bases list
```

## Usage

```
nocodb-cli <resource> <action> [flags]
```

| Resource | Actions |
|----------|---------|
| `bases` | `list`, `get`, `create`, `update`, `delete` |
| `tables` | `list`, `get`, `create`, `update`, `delete` |
| `columns` | `list`, `get`, `create`, `update`, `delete` |
| `records` | `list`, `get`, `count`, `create`, `update`, `delete` |
| `views` | `list`, `update`, `delete` |
| `hooks` | `list`, `create`, `update`, `delete` |
| `comments` | `list`, `add`, `update`, `delete` |
| `storage` | `upload-url` |
| `auth` | `set`, `show`, `test`, `remove` |

Discover everything with `--help`:
```bash
nocodb-cli --help
nocodb-cli records --help
nocodb-cli records list --help
```

## Examples

```bash
# Find your IDs
nocodb-cli bases list
nocodb-cli tables list --base p_xxxxxxxx

# Create a table and columns
nocodb-cli tables create  --base p_xxxxxxxx --title Leads
nocodb-cli columns create --table m_xxxxxxxx --title Email --type Email
nocodb-cli columns create --table m_xxxxxxxx --title Score --type Number

# Work with records (the data)
nocodb-cli records create --table m_xxxxxxxx --data '[{"Email":"a@b.com"},{"Email":"c@d.com"}]'
nocodb-cli records list   --table m_xxxxxxxx --where '(Email,isnot,null)' --sort -CreatedAt --json
nocodb-cli records count  --table m_xxxxxxxx --where '(Status,eq,new)'
nocodb-cli records update --table m_xxxxxxxx --data '{"Id":12,"Status":"contacted"}'
nocodb-cli records delete --table m_xxxxxxxx --id 12

# Export a view as CSV
nocodb-cli records list --table m_xxxxxxxx --view vw_xxxx --format csv
```

### Filter & sort syntax

- `--where` uses NocoDB's comparison syntax: `(field,op,value)`, e.g. `(Status,eq,active)`, `(Email,is,null)`, `(Score,gt,5)`. Combine with `~and` / `~or`.
- `--sort` takes `Field` (ascending) or `-Field` (descending).

## Output

By default output is a human-readable table. Use `--json` for scripting:

```json
{ "ok": true, "data": [ ... ], "meta": { "total": 42 } }
```

Other formats: `--format csv`, `--format yaml`. Global flags: `--verbose`, `--no-color`, `--no-header`.

Exit codes: `0` success, `1` API error, `2` usage error.

## License

MIT
