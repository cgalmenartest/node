name "vagrant"
description "Vagrant with midas and its dependencies"

run_list "recipe[apt]", "recipe[build-essential::default]", "nginx", "midas::db", "midas"

default_attributes(
  nodejs: {npm: '1.4.23' }
)

override_attributes(
  midas: {
    nginx_conf_dir: "/etc/nginx/sites-enabled",
    nginx_default: "default",
    nginx_conf_source: "tools/nginx/sites-enabled.default"
  }
)
