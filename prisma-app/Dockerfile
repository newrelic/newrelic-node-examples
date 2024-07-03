FROM node:20.15.0-slim
EXPOSE 3000

RUN apt-get update && apt-get install httpie jq -y

WORKDIR /app
COPY app .
COPY entrypoint.sh /entrypoint.sh
RUN npm ci

ENTRYPOINT ["/entrypoint.sh"]
