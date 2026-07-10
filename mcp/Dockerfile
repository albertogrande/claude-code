# Guide MCP server — minimal Node image for any container host.
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
COPY bin ./bin
ENV PORT=8787
# GUIDE_BASE_URL defaults to the live site; override to point at a fork/staging.
EXPOSE 8787
CMD ["node", "bin/serve.js"]
