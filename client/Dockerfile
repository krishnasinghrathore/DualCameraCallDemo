FROM node:18-alpine
WORKDIR /app
# Install dependencies and build
COPY . .
RUN npm install && npm run build

# Expose Next.js default port
EXPOSE 3000
# Start the app
CMD ["npm", "start"]