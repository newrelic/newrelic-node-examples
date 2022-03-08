FROM node:16
EXPOSE 3000

WORKDIR /app
COPY . .
RUN npm ci
CMD node server.js > ./logs/logs-in-context.log
