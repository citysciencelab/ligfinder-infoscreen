FROM node:15 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM nginx:alpine

WORKDIR /etc/nginx

COPY nginx.conf nginx.conf
COPY --from=build /app/dist /etc/nginx/html
