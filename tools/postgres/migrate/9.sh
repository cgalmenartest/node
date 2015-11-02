#!/bin/bash

# Add a model column for notifications
psql -U midas -d $DATABASE_URL -c "ALTER TABLE task ADD COLUMN \"completedBy\" timestamp with time zone;"

# Update the schema version
psql -U midas -d $DATABASE_URL -c "UPDATE schema SET version = 9 WHERE schema = 'current';"
