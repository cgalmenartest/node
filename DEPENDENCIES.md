# Dependency Information

Badge | Status
--- | ---
**Version Eye** | [![Version Eye Dependency Status](https://www.versioneye.com/user/projects/57297a80a0ca35004baf7d09/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/57297a80a0ca35004baf7d09#tab-dependencies)

The Open Opportunities platform contains various versioned dependencies. Below
is a list of dependencies that are purposefully out-of-date. Each item in the
list contains an explanation regarding why it is out-of-date. Versioned
dependencies may also not share the same [license](LICENSE.md) with so each
dependencies license is outlined at the end of this document.

## Runtime Dependencies

    "express": "^3.x.x"

Express is the lightweight framework that is relied on by the more robust
Sails framework that Open Opportunities Platform is built on. The reason why the
version is locked a major version behind is because of the critical middleware
that Sails depends on were removed in [versions greater than 4.0.0][express-reason].

[express-reason]: https://github.com/expressjs/express/blob/master/History.md?_ga=1.190227883.1428253699.1469419900#400--2014-04-09 "Express 4.0.0 Release Notes"

    "marked": "openopps/marked"

The Marked library is used by the platform to parse and transpile Markdown
syntax text into HTML. These strings are stored in the description of both
opportunities or descriptions. There was a XSS vulnerability found within the
Marked library when parsing specific HTML entities. [Please read the release
notes][marked-reason] for more information on [the vulnerability][marked-issue].

[marked-reason]: https://github.com/openopps/openopps-platform/releases/tag/v0.10.6 "Open Opps 0.10.6 release notes"
[marked-issue]: https://snyk.io/blog/marked-xss-vulnerability/ "Snyk Marked XSS Vulnerability"

    "sails": "^0.12.x"

The Sails framework is the very foundation of the Open Opps Platform's API.
While the client-side is written mostly in Backbone and jQuery, the server-side
API component depends heavily on the conventions in Sails. While there are tags
greater than `0.12.x` in the releases for the repository, [the latest release
resolves with the current version][sails-reason].

[sails-reason]: https://github.com/balderdashy/sails/releases/latest "Sails Latest Release"

## Development Dependencies

None of these dependencies are currently out of date. :tada:
