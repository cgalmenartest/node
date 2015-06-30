#!/bin/bash

# Add a model column for notifications
psql -U midas -d midas -c "ALTER TABLE notification ADD COLUMN model json;"

# Update the schema version
psql -U midas -d midas -c "UPDATE schema SET version = 7 WHERE schema = 'current';"
