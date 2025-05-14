# Use the official Node.js image as a base
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy over application code to the working directory
COPY . .

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the application
CMD ["npm", "start"]