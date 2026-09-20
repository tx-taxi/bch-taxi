FROM node:24-bookworm-slim AS frontend-builder

WORKDIR /app/frontend
RUN apt-get update \
    && apt-get install -y --no-install-recommends rsync \
    && rm -rf /var/lib/apt/lists/*
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM node:24-bookworm-slim AS source-archive

WORKDIR /source
COPY . .
RUN printf '%s\n' \
      'This archive is generated from the same sanitized Docker build context as the deployed btc.tx.taxi image.' \
      'It intentionally excludes secrets, dependencies, caches, and generated build output.' \
      > SOURCE-ARCHIVE.txt \
    && tar --sort=name --mtime='UTC 1970-01-01' --owner=0 --group=0 --numeric-owner \
      -czf /tmp/btc-taxi-source.tar.gz .

FROM nginx:1.29-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-builder /app/frontend/dist/mempool/browser /usr/share/nginx/html
COPY --from=source-archive /tmp/btc-taxi-source.tar.gz /usr/share/nginx/html/source/btc-taxi-source.tar.gz

EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
