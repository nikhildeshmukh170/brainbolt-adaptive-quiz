# Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Build next app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Set API URLs for Docker container networking
ENV NEXT_PUBLIC_API_URL=http://api:4000
ENV NEXT_PUBLIC_SOCKET_URL=http://api:4000

COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]
