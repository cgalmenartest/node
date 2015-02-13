#!/bin/bash

# Set up a table to store sessions
psql -U midas -d midas -c "ALTER TABLE \"task\"
  ADD COLUMN \"publishedAt\" timestamp with time zone,
  ADD COLUMN \"assignedAt\" timestamp with time zone,
  ADD COLUMN \"completedAt\" timestamp with time zone;"

# Update the schema version
psql -U midas -d midas -c "UPDATE schema SET version = 3 WHERE schema = 'current';"
