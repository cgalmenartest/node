#!/bin/sh

# Update task table with new attribute
#
psql $DATABASE_URL -c "
ALTER TABLE task ADD COLUMN \"submittedAt\" timestamp with time zone;
"
# Update the schema version
#
psql $DATABASE_URL -c "
UPDATE schema SET version = 12 WHERE schema = 'current';
"
