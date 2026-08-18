# SecureLens Frontend

This is the frontend application for SecureLens, a modern web dashboard for security investigations, built with React, Vite, TypeScript, and Tailwind CSS.

## Getting Started on Other Systems

Because this project uses Node.js, the equivalent of a Python `requirements.txt` is the `package.json` file. All dependencies are already tracked there.

### Option 1: Running with Node.js (Standard)

If you have Node.js installed on your system (v18 or higher recommended):

1. **Install all dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

### Option 2: Running with Docker (Isolated)

If you prefer not to install Node.js locally, you can run the entire frontend inside a Docker container using the provided `Dockerfile`.

1. **Build the Docker image:**
   ```bash
   docker build -t securelens-frontend .
   ```

2. **Run the Docker container:**
   ```bash
   docker run -p 5173:5173 securelens-frontend
   ```

3. Open your browser and navigate to `http://localhost:5173`.

## Backend Integration
Throughout the `src/pages` directory, you will find comments formatted as `// @BACKEND-TODO:`. These explicitly mark where the frontend is currently using mock data and where it needs to be wired up to your actual API endpoints.
