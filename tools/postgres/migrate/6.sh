#!/bin/bash

# Add a data column for tagEntities
psql -U midas -d midas -c "ALTER TABLE file ADD COLUMN fd varchar;"

# Update the schema version
psql -U midas -d midas -c "UPDATE schema SET version = 6 WHERE schema = 'current';"
