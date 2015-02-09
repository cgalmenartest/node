
#MOCHA_OPTS= --check-leaks --timeout 60000
MOCHA_OPTS= --timeout 60000
REPORTER = spec
DIR = .
NODE_ENV = development

export TEST_ROOT ?= http://localhost:1337


build:
	grunt build

migrate:
	./tools/postgres/init.sh

check: test

import:
	-cp -v $(DIR)/exclude.txt exclude.txt
	rsync -av --exclude-from=exclude.txt $(DIR)/* .

test: test-api test-browser

test-all: test-all-current-config

start: server.PID

server.PID:
	@NODE_ENV=test sails lift & echo $$! > $@;
	sleep 15

stop: server.PID
	kill `cat $<` && rm $<

.PHONY: start stop server.PID

test-browser: test-browser-current-config-with-server

test-browser-current-config-with-server: start test-browser-current-config stop

test-browser-current-config:
	find ./test-browser -name "*.js" -exec ./node_modules/mocha-casperjs/bin/mocha-casperjs {} \; || true

test-all-current-config:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		--recursive test

test-api:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		test/test.upstart.js  \
		--recursive test/api

demo:
	@NODE_ENV=$(NODE_ENV) ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		test/test.upstart.js  \
		--recursive test/demo

init: migrate
	@NODE_ENV=$(NODE_ENV) ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		test/test.upstart.js  \
		--recursive test/init
