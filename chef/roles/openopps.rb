name "openopps"
description "Open Opportunities configuration & customizations on Midas for AWS"

run_list "midas"

override_attributes(
  midas: {
    config_repo: "https://github.com/18F/midas-open-opportunities.git",
    config_name: "open-opportunities",
  }
)
