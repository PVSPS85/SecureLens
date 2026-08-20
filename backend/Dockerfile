FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY securityEngine/package*.json ./securityEngine/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd securityEngine && npm install
RUN cd backend && npm install

# Copy source trees
COPY securityEngine ./securityEngine
COPY backend ./backend

WORKDIR /app/backend

ENV PORT=5001
ENV NODE_ENV=production

EXPOSE 5001

CMD ["node", "src/index.js"]
