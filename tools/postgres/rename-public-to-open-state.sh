#!/bin/sh

# changes any public tasks or project to open, should only need to be done once
psql -U midas -c "update task set state='open' where state='public';" midas
psql -U midas -c "update project set state='open' where state='public';" midas
