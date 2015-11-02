#!/bin/bash

# Add a fd column for files
psql -U midas -d $DATABASE_URL -c "ALTER TABLE file ADD COLUMN fd varchar;"

# Update the schema version
psql -U midas -d $DATABASE_URL -c "UPDATE schema SET version = 6 WHERE schema = 'current';"
