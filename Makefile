
#MOCHA_OPTS= --check-leaks --timeout 60000
MOCHA_OPTS= --timeout 60000
REPORTER = spec
DIR = .

build:
	grunt build

check: test

copy-config:
	-cp config/local.js config/local.js.bak
	-cp config/settings/auth.js config/settings/auth.js.bak
	-cp config/settings/sources.js config/settings/sources.js.bak
	-cp config/settings/notifications.js config/settings/notifications.js.bak
	-cp config/settings/emailTemplates.js config/settings/emailTemplates.js.bak
	cp config/local.ex.js config/local.js
	cp config/settings/auth.ex.js config/settings/auth.js
	cp config/settings/sources.ex.js config/settings/sources.js
	-cp config/settings/notifications.ex.js config/settings/notifications.js
	-cp config/settings/emailTemplates.ex.js config/settings/emailTemplates.js

restore-config:
	rm config/local.js
	rm config/settings/auth.js
	rm config/settings/sources.js
	-mv config/local.js.bak config/local.js
	-mv config/settings/auth.js.bak config/settings/auth.js
	-mv config/settings/sources.js.bak config/settings/sources.js
	-mv config/settings/notifications.js.bak config/settings/notifications.js
	-mv config/settings/emailTemplates.js.bak config/settings/emailTemplates.js

import:
	-cp $(DIR)/config/local.js config/
	-cp $(DIR)/config/settings/*.js config/settings/
	-cp $(DIR)/assets/js/backbone/config/*.js assets/js/backbone/config/
	-cp $(DIR)/assets/js/backbone/config/*.json assets/js/backbone/config/
	-cp $(DIR)/assets/styles/*.css assets/styles/
	-cp -R $(DIR)/assets/images/* assets/images/
	-cp $(DIR)/assets/js/backbone/apps/footer/templates/footer_template.html assets/js/backbone/apps/footer/templates/footer_template.html
	-cp $(DIR)/test/init/init/config.js test/init/init/config.js
	-cp $(DIR)/test/demo/data/config.js test/demo/data/config.js
	-cp -R $(DIR)/test/demo/data/assets/* test/demo/data/assets

test: copy-config test-api restore-config

test-api:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		--recursive test/api

demo:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		--recursive test/demo

init:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		--recursive test/init
