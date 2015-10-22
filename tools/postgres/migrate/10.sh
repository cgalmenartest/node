#!/bin/bash

# Add a column to volunteers for marking notifications as silent
psql -U midas -d midas -c "ALTER TABLE volunteer ADD COLUMN silent boolean;"

# Update the schema version
psql -U midas -d midas -c "UPDATE schema SET version = 10 WHERE schema = 'current';"
