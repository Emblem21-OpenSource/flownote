FROM node:11.12.0-alpine

ARG NODE_ENV

# Install Yarn
RUN apk update && apk add yarn

# Setup the App folder
RUN mkdir -p /usr/src/flownote
RUN mkdir -p /usr/src/flownote/compiler
RUN mkdir -p /usr/src/flownote/src
WORKDIR /usr/src/flownote

# Copy the dependencies
COPY package.json /usr/src/flownote
COPY yarn.lock /usr/src/flownote

# Install Node Modules
RUN set -ex; \
  if [ "$NODE_ENV" = "production" ]; then \
    yarn install --no-cache --frozen-lockfile --production; \
  elif [ "$NODE_ENV" = "test" ]; then \
    yarn install --no-cache --frozen-lockfile; \
  fi;

# Copy over the minimally needed files
COPY compiler /usr/src/flownote/compiler
COPY src /usr/src/flownote/src
COPY .env /usr/src/flownote
COPY compile /usr/src/flownote
COPY server.js /usr/src/flownote
COPY entrypoint.sh /usr/src/flownote
COPY flownote /usr/src/flownote

ENTRYPOINT [ "./entrypoint.sh" ]
