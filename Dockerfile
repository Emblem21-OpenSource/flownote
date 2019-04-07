FROM node:11.13.0-alpine

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

ARG FLOWNOTE_SERVER_TYPE=stdin
ENV FLOWNOTE_SERVER_TYPE=$FLOWNOTE_SERVER_TYPE

ARG FLOWNOTE_APP_FILE_PATH=stdin
ENV FLOWNOTE_APP_FILE_PATH=$FLOWNOTE_APP_FILE_PATH

# Install Yarn
RUN apt-get update -y && apk add yarn

# Setup the App folder
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy the dependencies
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
COPY yarn.lock /usr/src/app

# Install Node Modules
RUN set -ex; \
  if [ "$NODE_ENV" = "production" ]; then \
    yarn install --no-cache --frozen-lockfile --production; \
  elif [ "$NODE_ENV" = "test" ]; then \
    yarn install --no-cache --frozen-lockfile; \
  fi;

# Copy over the minimally needed files
COPY compiler /usr/src/app
COPY compile /usr/src/app
COPY src /usr/src/app
COPY .env /usr/src/app

RUN set -ex; \
  if [ "$FLOWNOTE_SERVER_TYPE" = "stdin" ]; then \
    ./flownote start-stdin \
  elif [ "$FLOWNOTE_SERVER_TYPE" = "http" ]; then \
    ./flownote start-http \
  fi;

# https://nodejs.org/de/docs/guides/nodejs-docker-webapp/