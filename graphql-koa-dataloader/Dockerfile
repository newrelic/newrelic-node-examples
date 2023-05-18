FROM node:lts-slim
EXPOSE 4000

RUN apt-get update && apt-get install httpie jq -y

WORKDIR /app
COPY app .
COPY entrypoint.sh /entrypoint.sh
RUN npm ci

ENTRYPOINT ["/entrypoint.sh"]
