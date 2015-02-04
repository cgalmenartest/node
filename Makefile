
#MOCHA_OPTS= --check-leaks --timeout 60000
MOCHA_OPTS= --timeout 60000
REPORTER = spec
DIR = .
NODE_ENV = development

export TEST_ROOT ?= http://localhost:1337


build:
	grunt build
	./tools/postgres/init.sh

check: test

import:
	-cp -v $(DIR)/exclude.txt exclude.txt
	rsync -av --exclude-from=exclude.txt $(DIR)/* .

test: test-api

test-all: test-all-current-config

start: server.PID

server.PID:
	sails lift & echo $$! > $@;
	sleep 5

stop: server.PID
	kill `cat $<` && rm $<

.PHONY: start stop server.PID

test-browser: test-browser-current-config-with-server

test-browser-current-config-with-server: start test-browser-current-config stop

test-browser-current-config:
	./node_modules/mocha-casperjs/bin/mocha-casperjs test-browser/*.js || true

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

init:
	./tools/postgres/init.sh
	@NODE_ENV=$(NODE_ENV) ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		test/test.upstart.js  \
		--recursive test/init
