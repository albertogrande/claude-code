# Guide MCP server — minimal Node image for any container host.
FROM node:20-alpine
WORKDIR /app
# npm ci against the lockfile so the image runs exactly the tested versions.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY lib.js server.js contract.mjs ./
ENV PORT=8787
# GUIDE_BASE_URL defaults to the live site; override to point at a fork/staging.
EXPOSE 8787
CMD ["node", "server.js"]
