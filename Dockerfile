# sss node-server image
# Build: docker build -t sss-server ./node-server
# Run:  docker run -d --name sss-server -p 8001:8001 \
#         -v /volume1/video:/video:rw \
#         -v sss-data:/data \
#         sss-server
#
# Lowdb data files (cartoon_group.json, db.json) live in the container root by
# default (../../ relative to node-server/db). Mount them to persist:
#   -v /host/cartoon_group.json:/cartoon_group.json -v /host/db.json:/db.json

FROM node:22-alpine

# Runtime deps for native modules (none required, but handy for debugging)
RUN apk add --no-cache tini

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Seed db tables into the image data dir
ENV DATA_DIR=/data
RUN mkdir -p /data /video
COPY data/db.json /data/db.json
COPY data/cartoon_group.json /data/cartoon_group.json

# lowdb writes to the container root by default; make it writable
VOLUME ["/video", "/data"]

EXPOSE 8001

# tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js", "8001"]
