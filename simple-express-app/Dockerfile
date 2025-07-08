FROM node:20

# Install PostgreSQL
RUN apt-get update && \
    apt-get install -y postgresql postgresql-contrib sudo && \
    rm -rf /var/lib/apt/lists/*

# Initialize PostgreSQL database cluster
RUN sudo -u postgres /usr/lib/postgresql/*/bin/initdb -D /var/lib/postgresql/data

# Set up working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose default ports
EXPOSE 3000

# Create startup script that properly starts PostgreSQL
RUN echo '#!/bin/bash\n\
sudo -u postgres /usr/lib/postgresql/*/bin/pg_ctl -D /var/lib/postgresql/data -l /var/lib/postgresql/data/logfile start\n\
sleep 3\n\
sudo -u postgres createdb postgres 2>/dev/null || true\n\
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '\''postgres'\'';" 2>/dev/null || true\n\
node -r newrelic --env-file .env index.js' > /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]