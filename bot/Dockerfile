FROM node:20-alpine

WORKDIR /app

# Install curl and bash for bun installation
RUN apk add --no-cache curl bash unzip

# Install bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 9000

CMD ["bun", "run", "start:prod"]

