FROM node:16.9.1-alpine as base

WORKDIR /app

#########################################
FROM base as backend

COPY package.json ./
COPY package-lock.json ./

RUN apk --update-cache add build-base libtool autoconf automake python2 && \
    npm install && \
    apk del build-base libtool autoconf automake python2

COPY . .
RUN npm run build

#########################################
FROM backend as frontend

WORKDIR /app/src/frontend

RUN npm install
RUN npm run build

#########################################
FROM backend
COPY --from=frontend /app/src/frontend/build/ ./src/frontend/build/

RUN apk --update-cache add ffmpeg

ENV NODE_ENV=production

# start app
CMD ["node", "dist/backend/app.js"]