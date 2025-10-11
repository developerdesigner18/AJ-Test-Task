FROM node:22-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Create .env file with the API base URL
RUN echo 'VITE_API_BASE_URL=/api' > .env

RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]