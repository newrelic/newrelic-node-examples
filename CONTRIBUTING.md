# Contributing

Contributions are always welcome. Before contributing please read the
[code of conduct](https://github.com/newrelic/.github/blob/main/CODE_OF_CONDUCT.md) and [search the issue tracker](../../issues); your issue may have already been discussed or fixed in `main`. To contribute,
[fork](https://help.github.com/articles/fork-a-repo/) this repository, commit your changes, and [send a Pull Request](https://help.github.com/articles/using-pull-requests/).

Note that our [code of conduct](https://github.com/newrelic/.github/blob/main/CODE_OF_CONDUCT.md) applies to all platforms and venues related to this project; please follow it in all your interactions with the project and its participants.

## Feature Requests

Feature requests should be submitted in the [Issue tracker](../../issues), with a description of the expected behavior & use case, where they’ll remain closed until sufficient interest, [e.g. :+1: reactions](https://help.github.com/articles/about-discussions-in-issues-and-pull-requests/), has been [shown by the community](../../issues?q=label%3A%22votes+needed%22+sort%3Areactions-%2B1-desc).
Before submitting an Issue, please search for similar ones in the
[closed issues](../../issues?q=is%3Aissue+is%3Aclosed+label%3Aenhancement).

## Pull Requests

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
3. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## Updating an example app with Claude Code

The `update-example` [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) skill upgrades one example app to the latest `newrelic` agent and dependencies, then smoke-tests it. If the upgrade passes, it opens a PR. If the upgrade breaks the app, it opens an issue instead. It only works on apps that have a `smoke-test.json`. The format is described in [the skill](.claude/skills/update-example/SKILL.md#smoke-testjson-format).

### One-time setup

1. Install Claude Code: `npm install -g @anthropic-ai/claude-code`.
2. Sign in to GitHub with `gh auth login`. You need write access to this repository, because the skill pushes its branch to `origin`.
3. Use the current Node.js LTS.
4. Make your New Relic license key available, either by exporting `NEW_RELIC_LICENSE_KEY` or by putting it in the app's `.env` (copy `env.sample`).

### Run it

From the repo root:

```sh
claude -p "/update-example simple-express-app"
```

Leave out `-p` to watch it work interactively. The run ends with the URL of the PR or issue it opened. If nothing was outdated, it prints a one-line summary.

To update every app that has a `smoke-test.json`:

```sh
npm run update-examples
```

To update only some apps, list them after `--`, e.g. `npm run update-examples -- simple-express-app nestjs`. Apps are updated one at a time, and a failed run doesn't stop the rest. Each app's output is saved to a log, and the run ends with a summary of the PR or issue URL for each app.

The skill pre-approves the commands it needs, so it doesn't stop for permission prompts. It branches from the latest `main`, commits only the app's `package.json`, and switches back to your branch when it's done. Any changes you have checked out are left alone. Before running it, stop anything using the app's port, or the skill stops and reports the conflict.

## Contributor License Agreement

Keep in mind that when you submit your Pull Request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource@newrelic.com.

For more information about CLAs, please check out Alex Russell’s excellent post,
[“Why Do I Need to Sign This?”](https://web.archive.org/web/20080704/https://infrequently.org/2008/06/why-do-i-need-to-sign-this/).
