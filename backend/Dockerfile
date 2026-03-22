# Use the official pre-built Puppeteer image (Much faster and already has Chromium!)
FROM ghcr.io/puppeteer/puppeteer:21.1.1

WORKDIR /app

# Switch to root to fix permissions if needed
USER root

# Skip the redundant Chromium download during npm install
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Install dependencies
COPY --chown=pptruser:pptruser package*.json ./
RUN npm ci --only=production

# Copy source code
COPY --chown=pptruser:pptruser src/ ./src/

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R pptruser:pptruser /app

# Switch back to the non-root user for security
USER pptruser

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "src/server.js"]