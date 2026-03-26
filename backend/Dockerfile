# ---- Build Stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads/logos

EXPOSE 3000

CMD ["npm", "run", "start"]
