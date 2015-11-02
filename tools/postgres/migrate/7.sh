#!/bin/bash

# Add a model column for notifications
psql -U midas -d $DATABASE_URL -c "ALTER TABLE notification ADD COLUMN model json;"

# Update the schema version
psql -U midas -d $DATABASE_URL -c "UPDATE schema SET version = 7 WHERE schema = 'current';"
