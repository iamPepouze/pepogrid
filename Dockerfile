# The image the Cluster runs: the built app behind an unprivileged nginx (see README.md, "Container image").
# Docker's Dependabot ecosystem bumps both tags below.

FROM node:24-alpine3.24 AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
# The Server serves the app at the root, where GitHub Pages serves /pepogrid/ (vite.config.ts).
ENV PEPOGRID_BASE=/
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31.7-alpine
LABEL org.opencontainers.image.source="https://github.com/iamPepouze/pepogrid"
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# A numeric user, so Kubernetes can verify runAsNonRoot. Port 8080 needs no privilege.
USER 101
EXPOSE 8080
