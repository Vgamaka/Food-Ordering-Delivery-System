# Use official Node.js base image
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json if available
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port (use 3001 or read from .env)
EXPOSE 3001

# Start the application
CMD ["node", "src/index.js"]
