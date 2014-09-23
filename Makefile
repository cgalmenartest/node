
#MOCHA_OPTS= --check-leaks --timeout 60000
MOCHA_OPTS= --timeout 60000
REPORTER = spec
DIR = .
NODE_ENV = development

build:
	grunt build

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
	cp assets/js/backbone/config/login.ex.json assets/js/backbone/config/login.json
	cp config/local.ex.js config/local.js
	cp config/i18next.ex.js config/i18next.js
	cp config/settings/auth.ex.js config/settings/auth.js
	cp config/settings/sources.ex.js config/settings/sources.js
	-cp config/settings/notifications.ex.js config/settings/notifications.js
	-cp config/settings/emailTemplates.ex.js config/settings/emailTemplates.js

restore-config:
	rm assets/js/backbone/config/login.json
	rm assets/js/backbone/config/i18n.json
	rm config/local.js
	rm config/settings/auth.js
	rm config/settings/sources.js
	rm config/i18next.js
	-mv assets/js/backbone/config/login.json.bak assets/js/backbone/config/login.json
	-mv assets/js/backbone/config/i18n.json.bak assets/js/backbone/config/i18n.json
	-mv config/local.js.bak config/local.js
	-mv config/settings/auth.js.bak config/settings/auth.js
	-mv config/settings/sources.js.bak config/settings/sources.js
	-mv config/settings/notifications.js.bak config/settings/notifications.js
	-mv config/settings/emailTemplates.js.bak config/settings/emailTemplates.js
	-mv config/i18next.js.bak config/i18next.js

import:
	-cp $(DIR)/config/local.js config/
	-cp $(DIR)/config/i18next.js config/
	-cp $(DIR)/config/settings/*.js config/settings/
	-cp $(DIR)/assets/js/backbone/config/*.js assets/js/backbone/config/
	-cp $(DIR)/assets/js/backbone/config/*.json assets/js/backbone/config/
	-cp -R $(DIR)/assets/locales/* assets/locales/
	-cp $(DIR)/assets/styles/*.css assets/styles/
	-cp -R $(DIR)/assets/images/* assets/images/
	-cp $(DIR)/assets/js/backbone/apps/footer/templates/footer_template.html assets/js/backbone/apps/footer/templates/footer_template.html
	-cp $(DIR)/test/init/init/config.js test/init/init/config.js
	-cp $(DIR)/test/demo/data/config.js test/demo/data/config.js
	-cp -R $(DIR)/test/demo/data/assets/* test/demo/data/assets

test: copy-config test-api restore-config

test-all: copy-config test-all-current-config restore-config

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
	@NODE_ENV=$(NODE_ENV) ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		test/test.upstart.js  \
		--recursive test/init
