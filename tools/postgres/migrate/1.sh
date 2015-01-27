#!/bin/bash

# Add schema table
psql -U midas -d midas -c "CREATE TABLE \"schema\" (
  \"schema\" varchar,
  \"version\" integer
);
INSERT INTO \"schema\" (schema, version) VALUES ('current', 1);"
