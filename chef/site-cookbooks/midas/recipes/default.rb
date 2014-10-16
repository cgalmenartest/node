include_recipe 'user'

# set up user and group
group node.midas.group

user_account node.midas.user do
  gid node.midas.group
  action :create
end

include_recipe "nodejs"

include_recipe 'postgresql'
include_recipe 'postgresql::server'
include_recipe 'postgresql::pg_user'
include_recipe 'postgresql::pg_database'

package 'git'

include_recipe 'midas::sails-postgresql'
include_recipe 'midas::app'

package 'graphicsmagick'

