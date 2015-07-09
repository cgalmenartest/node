#!/bin/bash

# Migrate local users
psql -U midas -d midas -c "INSERT INTO passport (protocol, password, \"user\", \"createdAt\", \"updatedAt\", \"deletedAt\")
SELECT
  'local',
  \"password\",
  \"userId\",
  \"createdAt\",
  \"updatedAt\",
  \"deletedAt\"
FROM userpassword
WHERE \"userId\" is not null;";

# Migrate oauth users
psql -U midas -d midas -c "INSERT INTO passport (protocol, provider, identifier, tokens, \"user\", \"createdAt\", \"updatedAt\", \"deletedAt\")
SELECT
  'oauth2',
  \"provider\",
  \"providerId\",
  (select row_to_json(tokens) from (select \"accessToken\", \"refreshToken\") as tokens),
  \"userId\",
  \"createdAt\",
  \"updatedAt\",
  \"deletedAt\"
FROM userauth
WHERE \"userId\" is not null;"

# Update the schema version
psql -U midas -d midas -c "UPDATE schema SET version = 8 WHERE schema = 'current';"
