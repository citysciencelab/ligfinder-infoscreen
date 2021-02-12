FROM node:15

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
