FROM public.ecr.aws/lambda/nodejs:22

# Copy function code
COPY . ${LAMBDA_TASK_ROOT}
# Uncomment if you want to install new agent
#RUN npm install

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
ENV NODE_OPTIONS='--inspect=0.0.0.0'
CMD [ "app.handler" ]
