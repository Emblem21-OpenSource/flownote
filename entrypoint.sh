#!/bin/sh

. ./.env

./flownote start-$FLOWNOTE_SERVER_TYPE --json=app.json