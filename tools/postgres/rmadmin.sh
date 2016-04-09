#!/bin/sh

# Revoke admin privileges from the user with the given ID
psql -U midas -c "UPDATE \"midas_user\" SET \"isAdmin\"=FALSE WHERE \"id\"= $1;" midas
