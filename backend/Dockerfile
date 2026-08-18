# Stage 1: Build dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Copy files required to install dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Stage 2: Productive runtime image
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment flag
ENV NODE_ENV=production

# Apply system updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Copy dependency packages and project source
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# Run as non-root user
USER node

# Expose port (Matches standard environment default or PORT configurations)
EXPOSE 5000

# Server execution entrypoint
CMD ["npm", "start"]
