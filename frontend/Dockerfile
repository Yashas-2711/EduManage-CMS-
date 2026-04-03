# Stage 1: Build the Vite React application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
# We use wildcard * to catch package-lock.json if it exists
COPY package.json package-lock.json* ./
RUN npm install

# Copy all source files
COPY . .

# Build the production application
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the dist folder from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Overwrite the default Nginx configuration with our custom setup
# This ensures React Router handles all the routing correctly
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
