## We can replicate utilizing the New Relic Lambda extension by utilizing
## the Docker layers available at:
## https://gallery.ecr.aws/newrelic-lambda-layers-for-docker/newrelic-lambda-layers-lambdaextension
##
## If this is not desired, simply comment out the `COPY --from=nr-ext` line.
##
## Note: as of 2026-07, the above registry does not have floating tags for the
## latest layers. So we must specify a specific version.
##
## TARGETARCH is set automatically by BuildKit ("amd64" or "arm64").
## The New Relic extension image tags the arm64 build as "2.6.3-arm64"
## and the amd64 build as bare "2.6.3", so map arch -> tag suffix here.
ARG TARGETARCH
ARG NR_EXT_VERSION=2.6.3
FROM public.ecr.aws/newrelic-lambda-layers-for-docker/newrelic-lambda-layers-lambdaextension:${NR_EXT_VERSION}-arm64 AS nr-ext-arm64
FROM public.ecr.aws/newrelic-lambda-layers-for-docker/newrelic-lambda-layers-lambdaextension:${NR_EXT_VERSION} AS nr-ext-amd64
FROM nr-ext-${TARGETARCH} AS nr-ext

# This FROM clause specifies our actual base image.
FROM public.ecr.aws/lambda/nodejs:24

# This FROM clause copies in the New Relic Lambda extension.
COPY --from=nr-ext /opt/ /opt/

# Copy function code
COPY . ${LAMBDA_TASK_ROOT}
# Uncomment if you want to install new agent
#RUN npm install

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
ENV NODE_OPTIONS='--inspect=0.0.0.0'
CMD [ "app.handler" ]
