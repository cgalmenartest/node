name "vagrant-custom-oo"
description "Vagrant with midas for Open Opportunities"

run_list "recipe[apt]", "recipe[build-essential::default]", "nginx", "midas"

default_attributes(
  postgresql: { version: '9.3' },
  nodejs: {npm: '1.4.23' }
)

override_attributes(
  midas: {
    nginx_conf_dir: "/etc/nginx/sites-enabled",
    nginx_default: "default",
    nginx_conf_source: "tools/nginx/sites-enabled.default",
    config_repo: "https://github.com/18F/midas-open-opportunities.git",
    config_name: "open-opportunities"
  }
)
