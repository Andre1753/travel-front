# Stage 1: Build
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
# Strict Mode: Use 'npm ci' no lugar de 'npm install' para builds limpos e previsíveis
RUN npm ci 
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Configuração robusta para SPA (Garante que o F5 não retorne erro 404)
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]