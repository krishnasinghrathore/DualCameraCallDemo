FROM node:18-alpine
WORKDIR /app

# Copy source and install only production dependencies
COPY . .
RUN npm install --omit=dev

# Expose the port used in index.ts (4000)
EXPOSE 4000

# Start the server
CMD ["npm", "start"]