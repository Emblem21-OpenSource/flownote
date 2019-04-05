FROM node:11.13.0-alpine

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Install Yarn
RUN apt-get update -y && apk add yarn

# Setup the App folder
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy the Git checkout over
COPY . /usr/src/app

# Install Node Modules
RUN set -ex; \
  if [ "$NODE_ENV" = "production" ]; then \
    yarn install --no-cache --frozen-lockfile --production; \
  elif [ "$NODE_ENV" = "test" ]; then \
    yarn install --no-cache --frozen-lockfile; \
  fi;

# https://nodejs.org/de/docs/guides/nodejs-docker-webapp/