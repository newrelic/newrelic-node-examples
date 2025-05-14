# Azure Function Examples

This is a simple repo to get started with Azure Functions through local testing and development, into deployment to Azure. The example is this directory assumes `enableHttpStream` is disabled (default); if you would like to test Azure Functions with HTTP streaming enabled, see [./streaming-enabled](./streaming-enabled).

### Install Developer Tools

```
# install azure cli
# https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-macos

brew update && brew install azure-cli

# install azure developer cli
# https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd

brew tap azure/azd && brew install azd

# Or if it's already installed, upgrade with brew
brew upgrade azd
```

Install the functions core tools:

```
brew tap azure/functions
brew install azure-functions-core-tools@4
```

### Environment variables

Since Azure Functions instrumentation does not require serverless mode operation, we can configure the agent with any combination of environment variables and agent config file values.

For local development, we can add environment variables in the `local.settings.json` file, as key/value pairs in the `values` block. See the `example_local.settings.json`, and rename it `local.settings.json`.

We can add the debugger connection to our local settings as well, by adding `"languageWorkers__node__arguments": "--inspect"` to the `values` block.

#### Injecting the agent

Much like in AWS Lambda, we can inject the agent via `NODE_OPTIONS`, adding the injection to the local env vars or to the env vars for deployment. If you are having issues with missing instrumenation, make sure you `unset NODE_OPTIONS` beforehand.

### Running the Application

Install node modules

```
  npm install
```

Double check `local.settings.json` for the correct New Relic license key and app name.

Test the function app locally. The `func start` command will show the applications's local URL, including port and path for each active function handler.

```
  func start
```

```
  # with debugger
  func start --language-worker -- --inspect=9229 
```

We can, alternatively, launch this in a local container. The Azure base images expect a `linux/amd64` architecture, but our M1 machines want `linux/amd64`. Docker will mention the mismatch, but it should still work for local development.

```
  docker build --platform=linux/amd64 --tag <Your Docker Hub User ID>/azurefunctionsimage:v1.0.0 .
  docker run -p 8080:80 -it <Your Docker Hub User ID>/azurefunctionsimage:v1.0.0
```

Finally, navigate to http://localhost:8080/api/HttpExample?name=Functions

### Deployment

First authenticate to Azure:

```
az login
# then select the linked azure account
```

Deploy the project:

```
func azure functionapp publish <APP_NAME>
```

Both of those approaches automatically create resources in Azure that you'd otherwise have to create individually before deployment.

### Notes:

#### Supported Node versions:

The version supported generally follows LTS, but can vary based on the OS used. (The syntax for setting the runtime also varies based on OS.) To verify the available versions and how to set them, we can use these commands:

```
$ az webapp list-runtimes --os-type linux | grep NODE
> NODE:22-lts
  NODE:20-lts
  NODE:18-lts
  NODE:16-lts

$ az webapp list-runtimes --os-type windows | grep NODE
> NODE:20LTS
  NODE:18LTS
  NODE:16LTS
```

Note the difference in available versions and differing runtime version tags.

#### Logging

Azure's docs recommend using `context.log` for logging within the handler. The `context` object also offers `trace`, `debug`, `info`, `warn`, and `error`.

#### `main` entry points

In the `package.json`, the value of `main` can be a glob. An Azure Function app can be triggered by multiple events, each with its own function handler.

---

To generate a new function app directory like this one:

```
func init --worker-runtime node --language javascript --model V4 --docker --source-control true 
```

([Source](https://learn.microsoft.com/en-us/azure/azure-functions/functions-deploy-container-apps?tabs=acr%2Cbash&pivots=programming-language-javascript))
