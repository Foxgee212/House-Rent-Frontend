# Step 1 — Build the frontend
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
RUN rm -rf node_modules package-lock.json
RUN npm install


COPY . .


# Build the production version of your frontend
RUN npm run build


# Step 2 — Run the built files using a lightweight server
FROM nginx:alpine

# Copy built Vite files to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the port your site will run on
EXPOSE 5173

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
