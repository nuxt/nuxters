FROM docker.io/library/node:lts-alpine

# Prepare work directory
WORKDIR /nuxter

# Prepare pnpm https://pnpm.io/installation#using-corepack
RUN corepack enable

# Prepare deps
RUN apk update
RUN apk add git --no-cache

# Prepase dev deps
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile --ignore-scripts

# Copy all source files
COPY . ./

# Run full install with every postinstall script
RUN pnpm i --frozen-lockfile

EXPOSE 3000/tcp

ENV PORT=3000

VOLUME ["/nuxter/data"]

CMD ["pnpm", "dev"]
