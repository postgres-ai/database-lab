# Database Lab Engine and Database Lab Engine UI

## Database Lab - thin database clones for faster development
_Proceed to [Database Lab Engine repository](https://gitlab.com/postgres-ai/database-lab) for more information about technology itself._
Database Lab Engine (DLE) is an open-source (AGPLv3) technology that allows blazing-fast cloning of Postgres databases of any size in seconds. This helps solve many problems such as:
- build dev/QA/staging environments involving full-size production-like databases,
- provide temporary full-size database clones for SQL query analysis optimization,
- automatically verify database migrations (DB schema changes) and massive data operations in CI/CD pipelines to minimize risks of downtime and performance degradation.

As an example, cloning a 10 TiB PostgreSQL database can take less than 2 seconds.

## Development
### List packages:
- `@postgres.ai/platform` - platform version of UI
- `@postgres.ai/ce` - community edition version of UI
- `@postgres.ai/shared` - common modules

### How to operate
At the root:
- `<npm command> -ws` - for all packages
- `<npm command> -w <package-name>` - for specific package

#### Examples
- `npm ci -ws` - install deps of all packages
- `npm build -ws` - build all packages
- `npm start -w @postgres.ai/platform` - run platform UI locally in dev mode
- `npm start -w @postgres.ai/ce` - run community edition UI locally in dev mode

_Important note: don't use commands for `@postgres.ai/shared` - it's dependent package, which can't be running or built_

### How to start
- `npm ci -ws`
- `npm start -w @postgres.ai/platform` or `npm start -w @postgres.ai/ce`

### How to build
- `npm ci -ws`
- `npm build -ws`

### CI pipelines for UI code
To deploy UI changes, tag the commit with `ui/` prefix and push it. For example:
```shell
git tag ui/1.0.12
git push origin ui/1.0.12
```

<!-- TODO: move this ^ to the main README.md and CONTRIBUTING.md -->

## Moving to Typescript
- `@postgres.ai/shared` is written on Typescript
- `@postgres.ai/ce` is written on Typescript
- `@postgres.ai/platform` is written on JavaScript and patially on Typescript. The target - is moving `@postgres.ai/platform` to Typescript fully. It should takes approximately 120-160 hours.
- There are potential problems with typing - old versions of packages may don't have their typings. Recommended to update them or replace. If it's impossible you can write your own typing in file named like `<package-name>.d.ts` inside `src` directory of the selected package.
