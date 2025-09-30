# Use Node 20 LTS slim image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port your app uses (Next.js defaults to 3000)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
