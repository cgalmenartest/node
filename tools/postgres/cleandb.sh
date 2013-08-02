#!/bin/sh

# Drops the schema and recreates it, thereby removing all tables.
psql -U midas -c "drop schema public cascade; create schema public;" midas
