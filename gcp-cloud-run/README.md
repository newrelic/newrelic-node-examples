# GCP Cloud Run example app

## Running the Example App

1. Download the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).
2. Create or select a Google Cloud Project. Make sure that project has billing enabled (for New Relic employees, reach out to ask-it on Slack). Continue setting up your project by following the [Before you begin section of this setup guide](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service?hl=en#before-you-begin).

   1. The app is already created in the `helloworld` directory, so you can skip the "Write the sample service" section.
3. Set up your environment and YAML files.

   ```zsh
   cd helloworld
   cp env.sample .env
   # Fill out New Relic license key
   ```

   ```zsh
   # from ./helloworld
   cp skaffold_example.yaml skaffold.yaml
   # replace GCP_REGION with your region
   # replace GCP_PROJECT_ID with your project id

   cd resources
   cp service_example.yaml service.yaml
   # replace GCP_REGION with your region
   # replace GCP_PROJECT_ID with your project id
   ```
4. [Deploy to Cloud Run from source.](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service?hl=en#deploy)

   ```zsh
   # from ./helloworld
   gcloud run deploy --source .
   ```
5. Once you have deployed the app succesfully to GCR, you should be given a service URL.

   ```zsh
   Service URL: https://helloworld-{project-id}.{region}.run.app
   ```
6. Generate traffic on the app and then view the results in NR One.

   ```zsh
   for run in {1..10}; do curl https://helloworld-{project-id}.{region}.run.app; done
   ```

## Debugging the Example App

1. Install [skaffold](https://skaffold.dev/docs/install/). It should come with the Google Cloud CLI, but double check with:

   ```zsh
   gcloud components update
   gcloud components install skaffold
   ```
2. Fill out environment and YAML variables if you haven't already (see step #3 above).
3. Deploy the app to Google Cloud with skaffold.

   ```zsh
   # from ./helloworld
   skaffold dev --port-forward
   ```
4. Generate traffic.

   ```zsh
   for run in {1..10}; do curl http://localhost:8080; done
   ```
