FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

ARG GRAPHQL_URI=/graphql
ARG GOOGLE_MAPS_API_KEY=
ARG GOOGLE_CLIENT_ID=
ARG TURNSTILE_SITE_KEY=

RUN printf '%s\n' \
  'export const environment = {' \
  '  production: true,' \
  "  graphqlUri: '${GRAPHQL_URI}'," \
  "  GOOGLE_MAPS_API_KEY: '${GOOGLE_MAPS_API_KEY}'," \
  "  turnstileSiteKey: '${TURNSTILE_SITE_KEY}'," \
  "  googleClientId: '${GOOGLE_CLIENT_ID}'," \
  '};' \
  > src/enviroments/enviroment.prod.ts

RUN npm run build -- --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/R_3_Love/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
