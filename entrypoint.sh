#!/bin/sh
. ./.env
./flownote start-$FLOWNOTE_SERVER_TYPE --actions=$FLOWNOTE_ACTIONS_FILE_PATH --flow=$FLOWNOTE_APP_FILE_PATH