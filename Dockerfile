FROM docker.io/library/node:lts-alpine AS base

# Prepare work directory
WORKDIR /nuxter

FROM base AS builder

# Prepare pnpm https://pnpm.io/installation#using-corepack
RUN corepack enable

# Prepare deps
RUN apk update
RUN apk add git --no-cache

# Prepare build deps ( ignore postinstall scripts for now )
COPY package.json ./
COPY .npmrc ./
COPY pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile --ignore-scripts

# Copy all source files
COPY . ./

# Run full install with every postinstall script ( This needs project file )
RUN pnpm i --frozen-lockfile

EXPOSE 3000

CMD ["pnpm","run","dev"]

