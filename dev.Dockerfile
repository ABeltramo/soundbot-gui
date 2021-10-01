FROM node:16.9.1-alpine as base

WORKDIR /app

RUN apk --update-cache add build-base libtool autoconf automake python2 ffmpeg

RUN mkdir /data
RUN chown node:node /data
USER node