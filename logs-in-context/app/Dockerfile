FROM node:18.9.1-slim
EXPOSE 3000

WORKDIR /app
COPY . .
RUN npm ci
CMD node server.js > ./logs/logs-in-context.log
