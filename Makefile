
#MOCHA_OPTS= --check-leaks --timeout 60000
MOCHA_OPTS= --timeout 60000
REPORTER = spec

check: test

copy-config:
	-cp config/local.js config/local.js.bak
	-cp config/settings/auth.js config/settings/auth.js.bak
	-cp config/settings/sources.js config/settings/sources.js.bak
	cp config/local.ex.js config/local.js
	cp config/settings/auth.ex.js config/settings/auth.js
	cp config/settings/sources.ex.js config/settings/sources.js

restore-config:
	rm config/local.js
	rm config/settings/auth.js
	rm config/settings/sources.js
	-mv config/local.js.bak config/local.js
	-mv config/settings/auth.js.bak config/settings/auth.js
	-mv config/settings/sources.js.bak config/settings/sources.js

test: copy-config test-api restore-config

test-api:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		--recursive test/api
