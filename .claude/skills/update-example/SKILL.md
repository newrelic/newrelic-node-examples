---
name: update-example
description: Update one example app in this repo to the latest New Relic Node.js agent and dependencies, smoke-test it, and open a PR with the upgrade or an issue if the upgrade breaks it. Use when asked to update, upgrade, or review an example app.
argument-hint: <app-dir>
allowed-tools: Read, Grep, Glob, Bash(npm install:*), Bash(npm audit:*), Bash(npm outdated:*), Bash(npm view:*), Bash(git fetch:*), Bash(git switch:*), Bash(git status:*), Bash(git diff:*), Bash(git restore:*), Bash(git commit:*), Bash(git push:*), Bash(gh pr list:*), Bash(gh pr create:*), Bash(gh pr edit:*), Bash(gh issue list:*), Bash(gh issue create:*), Bash(gh issue comment:*), Bash(.claude/skills/update-example/smoke-test.sh:*)
---

# Update an example app

Update the example app at `$ARGUMENTS` (a directory relative to the repo root, e.g. `simple-express-app`) to the latest `newrelic` agent and dependencies, and check it still works.

Only change the app's `package.json` (and its installed `node_modules`). Don't edit app code, scripts, the README, or config files. Report anything that needs those changes in the PR or issue instead (step 5).

The skill runs without permission prompts, so the commands it uses are pre-approved in `allowed-tools` above. To stay inside that list:

- Run every command from the repo root, one command per Bash call. Don't chain commands with `&&`, `;`, or pipes, and don't `cd`.
- Point npm at the app with `--prefix`, e.g. `npm install --prefix $ARGUMENTS`, `npm audit --prefix $ARGUMENTS`, `npm outdated --prefix $ARGUMENTS`.
- Don't stop to ask questions. If something blocks the run, stop and report it.

## 1. Check before you start

1. Run `git status --short -- $ARGUMENTS/package.json`. If it shows changes, stop and report that the app's `package.json` has uncommitted changes, probably left over from an earlier run. The baseline has to run on the committed dependencies.
2. Read the app's `smoke-test.json`. If it doesn't exist, stop and report that the app needs a `smoke-test.json` before it can be updated. Don't create one; they're written by hand (format below).
3. If the recipe lists `services` (Mongo, Kafka, etc.), start them the way the app's README says. Don't use services that were already running. If a port the app or its services need is already in use, stop and report which port and what's using it.

## 2. Baseline on the current dependencies

1. In the app directory, run `npm install` and note the `npm audit` vulnerability count.
2. Run the smoke test:

   ```sh
   .claude/skills/update-example/smoke-test.sh $ARGUMENTS
   ```

3. Save the output. You need it to tell whether a later failure was caused by the upgrade or was already there.

## 3. Upgrade

1. Run `npm outdated` and list every outdated package with its current and latest version.
2. For each package you plan to move up a major version, run `npm view <pkg>@<latest> peerDependencies engines`. Check that:
   - each package's peer dependencies will be satisfied by the versions you're installing, and
   - the Node engine range includes the current Node LTS.

   If a package can't go to its latest version because of a peer dependency, hold it back at the newest version that fits and write down why (e.g. "graphql held at 16: @apollo/server 5 requires ^16").
3. Upgrade `newrelic` to the latest version and the other dependencies to the versions you chose, with `npm install <pkg>@^<version> ...`. Leave `devDependencies` that are only used for linting alone and note them instead.
4. Note the new `npm audit` count.

## 4. Test the upgrade

1. Run the smoke test again.
2. If it fails and the baseline passed, the upgrade caused it. Find the cause (read the error and the package's changelog or migration guide) and record it. Don't change app code to fix it.
3. If it fails the same way the baseline did, it was already broken. Record it.

## 5. Open a PR or an issue

Don't leave the app running. Pick one outcome:

| Upgrade smoke test | Do this |
| --- | --- |
| Passes | Open a PR with the upgrade |
| Fails | Open an issue, and don't push the upgrade |
| Nothing was outdated in step 3 | Don't open anything; end with a one-line summary |

If you open an issue or open nothing, finish by running `git restore $ARGUMENTS/package.json`, so the upgrade isn't left in the working tree for the next run. On the PR path the upgrade is committed on the PR branch, so there's nothing to restore.

Before opening anything, check for an open PR or issue for this app (`gh pr list --state open --search "$ARGUMENTS in:title"`, and the same with `gh issue list`). If one exists, update it instead of opening another: push to the PR's branch and edit its description, or add a comment to the issue.

### PR

1. Branch from the latest `main`, not from whatever is checked out. Your `package.json` changes carry over to the new branch:

   ```sh
   git fetch origin main
   git switch -c update-example/$ARGUMENTS origin/main
   ```

2. Commit only the app's `package.json`, leaving anything else that's staged out of the commit, and push to `origin`. End the commit message with a `Co-Authored-By` trailer for Claude:

   ```sh
   git commit -m "<PR title>" -m "Co-Authored-By: Claude <noreply@anthropic.com>" -- $ARGUMENTS/package.json
   git push -u origin update-example/$ARGUMENTS
   ```

   Then run `git switch -` to return to the branch you started on.
3. Open the PR against `main` with `gh pr create --base main`. Title: `chore: Updated $ARGUMENTS to newrelic <version> and latest dependencies`.
4. The PR description has these sections:
   - **Upgrades:** a table of each package with its old and new version. List packages held back below their latest version, with the reason.
   - **Vulnerabilities:** the `npm audit` count before and after the upgrade (e.g. "12 moderate → 0").
   - **Smoke test:** the results before and after the upgrade (the PASS/WARN/FAIL lines).
   - **Findings:** problems found that this PR doesn't fix, such as an optional route that fails or a pre-existing failure. Say whether each one was there before the upgrade.

### Issue

Open the issue with `gh issue create`. Title: `$ARGUMENTS: upgrade to newrelic <version> breaks the example`. The issue description has these sections:

- **Upgrades attempted:** a table of each package with its old and new version.
- **Smoke test:** the results before and after the upgrade, and the relevant error output.
- **Likely cause:** what you found in step 4 (the error, and the changelog or migration guide entry that explains it).
- **Vulnerabilities:** the `npm audit` count before and after the upgrade.

End with the PR or issue URL.

## smoke-test.json format

Each app's recipe is written by hand and committed in the app's directory (the one with its `package.json`):

```json
{
  "start": "npm start",
  "port": 3000,
  "env_file": ".env",
  "secrets": ["NEW_RELIC_LICENSE_KEY"],
  "routes": ["/"],
  "optional_routes": [],
  "services": [],
  "ci": "full",
  "notes": ""
}
```

- `start`: command that starts the app, run from the app directory.
- `port`: port the app listens on.
- `env_file`: env file the start command loads, if any. In CI, the smoke test writes the `secrets` into it from the environment.
- `secrets`: env vars the app needs to run.
- `routes`: routes that must return 2xx.
- `optional_routes`: routes that are requested but may fail (e.g. they need cloud credentials). They're reported but don't fail the test.
- `services`: services the app needs, e.g. `["mongo"]`.
- `ci`: `full` (start and test the app), `install-only` (only `npm install`, for apps that need cloud accounts), or `skip`.
- `notes`: anything a reader needs to know about running the app.
