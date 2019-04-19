FROM node:11.13.0-alpine

ARG NODE_ENV

# Install Yarn
RUN apk update && apk add yarn

# Setup the App folder
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy the dependencies
COPY package.json /usr/src/app
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
COPY flownote /usr/src/app

ENTRYPOINT [ "./flownote", "start-$FLOWNOTE_SERVER_TYPE", "--actions=$FLOWNOTE_ACTIONS_FILE_PATH", "--flow=$FLOWNOTE_APP_FILE_PATH" ]

# https://nodejs.org/de/docs/guides/nodejs-docker-webapp/