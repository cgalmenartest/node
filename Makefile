
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

copy-config:
	-cp assets/js/backbone/config/login.json assets/js/backbone/config/login.json.bak
	-cp assets/js/backbone/config/i18n.json assets/js/backbone/config/i18n.json.bak
	-cp config/local.js config/local.js.bak
	-cp config/i18next.js config/i18next.js.bak
	-cp config/settings/auth.js config/settings/auth.js.bak
	-cp config/settings/sources.js config/settings/sources.js.bak
	-cp config/settings/notifications.js config/settings/notifications.js.bak
	-cp config/settings/emailTemplates.js config/settings/emailTemplates.js.bak
	-cp config/settings/analytics.js config/settings/analytics.js.bak
	cp assets/js/backbone/config/login.ex.json assets/js/backbone/config/login.json
	cp config/local.ex.js config/local.js
	cp config/i18next.ex.js config/i18next.js
	cp config/settings/auth.ex.js config/settings/auth.js
	cp config/settings/sources.ex.js config/settings/sources.js
	-cp config/settings/notifications.ex.js config/settings/notifications.js
	-cp config/settings/emailTemplates.ex.js config/settings/emailTemplates.js
	-cp config/settings/analytics.ex.js config/settings/analytics.js

restore-config:
	rm assets/js/backbone/config/login.json
	rm assets/js/backbone/config/i18n.json
	rm config/local.js
	rm config/settings/auth.js
	rm config/settings/sources.js
	rm config/settings/analytics.js
	rm config/i18next.js
	-mv assets/js/backbone/config/login.json.bak assets/js/backbone/config/login.json
	-mv assets/js/backbone/config/i18n.json.bak assets/js/backbone/config/i18n.json
	-mv config/local.js.bak config/local.js
	-mv config/settings/auth.js.bak config/settings/auth.js
	-mv config/settings/sources.js.bak config/settings/sources.js
	-mv config/settings/notifications.js.bak config/settings/notifications.js
	-mv config/settings/emailTemplates.js.bak config/settings/emailTemplates.js
	-mv config/settings/analytics.js.bak config/settings/analytics.js
	-mv config/i18next.js.bak config/i18next.js

import:
	-cp -v $(DIR)/exclude.txt exclude.txt
	rsync -av --exclude-from=exclude.txt $(DIR)/* .

test: copy-config test-api restore-config

test-all: copy-config test-all-current-config restore-config

start: server.PID

server.PID:
	sails lift & echo $$! > $@;
	sleep 5

stop: server.PID
	kill `cat $<` && rm $<

.PHONY: start stop server.PID

test-browser: copy-config test-browser-current-config-with-server restore-config

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
