# Use the official Node.js 18 Alpine image as the base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install the project dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port that Vite uses
EXPOSE 5173

# Start the Vite development server (bind to 0.0.0.0 so it's accessible outside the container)
CMD ["npm", "run", "dev", "--", "--host"]
