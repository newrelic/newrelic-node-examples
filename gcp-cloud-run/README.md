# GCP Cloud Run example app

## Running the Example App

1. Make sure you have a billable acount on Google Cloud Provider. For New Relic employees, reach out to #ask-it on Slack.
2. Set up your Google Cloud Run project by following the [Before you begin section of this setup guide](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service?hl=en#before-you-begin).

   1. The app is already created in the `helloworld` directory, so you can skip the "Write the sample service" section.
3. Set up your environment variables.

   ```zsh
   cd helloworld
   cp env.sample .env
   # Fill out New Relic license key
   ```
4. [Deploy to Cloud Run from source.](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service?hl=en#deploy)

   ```zsh
   # from ./helloworld
   gcloud run deploy --source .
   ```
5. Once you have deployed the app succesfully to GCR, you should be given a service URL.

   ```
   Service URL: https://helloworld-{project-id}.{region}.run.app
   ```
6. Generate traffic on the app and then view the results in NR One.

   ```
   for run in {1..10}; do curl https://helloworld-{project-id}.{region}.run.app; done
   ```
