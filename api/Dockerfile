FROM node:20-alpine AS builder

WORKDIR /app

# Install bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Copy package files
COPY package.json bun.lockb* ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Build application
RUN bun run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Copy package files
COPY package.json bun.lockb* ./
COPY prisma ./prisma/

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Start application
CMD ["bun", "run", "start:prod"]

