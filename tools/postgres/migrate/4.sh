#!/bin/bash

# Add a data column for tagEntities
psql -U midas -d midas -c "ALTER TABLE tagentity ADD COLUMN data json;"

# Update the schema version
psql -U midas -d midas -c "UPDATE schema SET version = 4 WHERE schema = 'current';"
