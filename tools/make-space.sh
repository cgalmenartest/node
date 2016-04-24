#!/bin/bash

# psql-openopps        rds             micro-psql   openopps     create succeeded
# env-openopps         user-provided                openopps
# s3-midas-assets      user-provided                openopps
# deploy-credentials   user-provided
# redis-openopps       redis28-swarm   standard     openopps     update succeeded

if [ -z $1 ]; then
  echo ""
  echo "usage: make-space.sh <spacename>";
  echo ""
  exit 0;
fi
SPACE=$1
echo "making Cloud Foundry space: ${SPACE}"

set -o verbose  # echo commands as we go

cf create-space $SPACE
cf target -s $SPACE

cf create-service rds shared-psql psql-openopps
cf create-service redis28-swarm standard redis-openopps
cf create-service s3 basic s3-midas-assets

# doesn't really work as expected cups prompts interactively
export CREDS_FILE="$(< credentials.json)"
export CREDS="'{${CREDS_FILE//[$'\t\r\n ']}}'"
cf create-user-provided-service env-openopps -p "$CREDS"

# echo "$CREDS" | xargs -0 cf create-user-provided-service env-openopps -p


echo "created!";
echo "go to your openopps-platform directory"
echo "create a manifest-$SPACE.yml file"
echo "deploy the app with:"
echo "  cf push -f manifest-new.yml"
echo ""
