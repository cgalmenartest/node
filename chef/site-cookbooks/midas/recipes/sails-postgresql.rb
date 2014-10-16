package_dir = "/home/midas/sails-postgresql"

user 'midas' do
  supports :manage_home => true
  home '/home/midas'
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
  user 'midas'
  group 'midas'
end

execute 'link sails-postgresql' do
  command <<-HERE
    sudo npm link
  HERE
  cwd package_dir
end
