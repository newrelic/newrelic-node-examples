This is an example of an instrumented Prisma app, originally based on
code from
https://github.com/prisma/prisma-examples/tree/latest/javascript/rest-express

Get it running:

1. Copy sample.env to .env
2. Edit .env to add your New Relic ingest key, and any other desired changes.
3. Start with `docker compose up -d`.
4. Use script on container to make requests to application: `docker exec -i prisma-app-app-1 bash -c './make-requests.sh'` 
5. Stop the app with `docker compose down`.
