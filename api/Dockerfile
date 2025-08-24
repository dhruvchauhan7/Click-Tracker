# Use official Node LTS
FROM node:20-alpine

# Create app dir
WORKDIR /usr/src/app

# Install deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Cloud Run will set PORT
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
