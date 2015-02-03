#!/bin/bash

# Set up a table to store sessions
psql -U midas -d midas -c "CREATE TABLE \"session\" (
  \"sid\" varchar NOT NULL COLLATE \"default\",
  \"sess\" json NOT NULL,
  \"expire\" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE \"session\" ADD CONSTRAINT \"session_pkey\" PRIMARY KEY (\"sid\") NOT DEFERRABLE INITIALLY IMMEDIATE;"

# Update the schema version
psql -U midas -d midas -c "UPDATE schema SET version = 2 WHERE schema = 'current';"
