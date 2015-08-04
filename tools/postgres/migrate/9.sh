#!/bin/bash

# Add a model column for notifications
psql -U midas -d midas -c "ALTER TABLE task ADD COLUMN \"completedBy\" timestamp with time zone;"

# Update the schema version
psql -U midas -d midas -c "UPDATE schema SET version = 9 WHERE schema = 'current';"
