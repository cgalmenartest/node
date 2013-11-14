Installation
=====

## Linux (Ubuntu 12.04 LTS)

Clone the git repository.

     git clone https://github.com/Innovation-Toolkit/midas.git

Copy the main settings files and edit them.

     cd config
     cp local.ex.js local.js

Copy the module settings files and edit.

     cd config/settings
     cp auth.ex.js auth.js
     cp sources.ex.js sources.js

Lift sails from the main directory.

     sails lift

### Forked Libraries

This project uses forked repositories and libaries, which you will
need to `npm link` in order for everything to function properly.

- [sails-postgresql](https://github.com/Innovation-Toolkit/sails-postgresql). Forked to provide soft deletes and support binary objects.  `git clone https://github.com/Innovation-Toolkit/sails-postgresql.git`

## Windows (Windows 7 Server)

Insert information about installing on Windows here.