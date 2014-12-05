
# set up user and group
include_recipe 'user'
group node.midas.group

user_account node.midas.user do
  gid node.midas.group
  action :create
end

package 'git'
include_recipe "nodejs"

include_recipe 'midas::app'

package 'graphicsmagick'

