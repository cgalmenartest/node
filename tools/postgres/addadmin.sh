#!/bin/sh

# Makes the user with the given ID an administrator
psql -U midas -c "UPDATE \"midas_user\" SET \"isAdmin\"=TRUE WHERE \"id\"= $1;" midas
