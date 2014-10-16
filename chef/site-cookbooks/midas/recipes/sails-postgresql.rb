package_dir = "#{node.midas.user_home}/sails-postgresql"

user node.midas.user do
  supports :manage_home => true
  home node.midas.user_home
end

git package_dir do
  repository "https://github.com/Innovation-Toolkit/sails-postgresql.git"
  revision 'bytea'
  action :sync
  user 'midas'
end

nodejs_npm 'sails-postgresql' do
  path package_dir
  json true
  user node.midas.user
  group node.midas.group
end

execute 'link sails-postgresql' do
  command <<-HERE
    sudo npm link
  HERE
  cwd package_dir
end
