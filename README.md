# sss_server

Node.js (Koa-style http) backend for the sss children's English learning app.
Serves video groups/users and streams files from `/video`.

## Image

Published to GitHub Container Registry:

```
ghcr.io/yqx6/sss_server:latest
```

## Run with Docker

```bash
docker pull ghcr.io/yqx6/sss_server:latest

docker run -d --name sss-server -p 8001:8001 \
  -v /volume1/video:/video:rw \
  ghcr.io/yqx6/sss_server:latest
```

## Run with docker-compose (server deployment)

```bash
git clone https://github.com/yqx6/sss_server.git
cd sss_server

# data files are baked into the image (seeded from archived tables);
# runtime writes persist in the sss-data named volume.

# if the image is private, log in first
echo $GHCR_TOKEN | docker login ghcr.io -u yqx6 --password-stdin

docker compose up -d

# verify
curl http://localhost:8001/getAllGroups
docker compose logs -f
```

`docker-compose.yml` maps:
- `8001:8001` (matches nginx `@api_local` fallback port)
- `/volume1/video:/video:rw`
- `./data/cartoon_group.json:/cartoon_group.json` and `./data/db.json:/db.json` for persistence

## Updating the GHCR image

After changing code:

```bash
# 1. build locally
cd node-server
docker build -t ghcr.io/yqx6/sss_server:latest .

# 2. log in (needs a PAT with write:packages)
echo $GHCR_TOKEN | docker login ghcr.io -u yqx6 --password-stdin

# 3. push
docker push ghcr.io/yqx6/sss_server:latest

# 4. on the server, pull and recreate
docker compose pull
docker compose up -d
```

To refresh the gh CLI token's scopes (if push is denied):

```bash
gh auth refresh -s write:packages,read:packages -h github.com
```

Then complete the device-flow authorization in the browser.

## Nginx notes

`/api/` proxies to `nageren.top:4` and falls back to `127.0.0.1:8001` on 502/503/504.
The container maps host port 8001, so the fallback works automatically.
To force all `/api/` traffic to the local container, change `proxy_pass` to `http://127.0.0.1:8001` and remove the variable/resolver logic.

## Data files

lowdb stores data at the container root:
- `/cartoon_group.json`  (`{ groups: [] }`)
- `/db.json`            (`{ users: [] }`)

Mount these paths to persist data across container recreations.
