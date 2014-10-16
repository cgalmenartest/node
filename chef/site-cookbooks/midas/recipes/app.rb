include_recipe 'midas::ec2_vars'

directory node.midas.deploy_dir do
  owner node.midas.user
  group node.midas.group
  recursive true
  mode 0770
  action :create
end

git node.midas.deploy_dir do
  repository node.midas.git_repo
  checkout_branch node.midas.git_branch
  revision node.midas.git_revision
  enable_submodules true
  user node.midas.user
  group node.midas.group
  action :sync
end

include_recipe 'midas::node_modules'

template  "#{node.midas.deploy_dir}/config/local.js" do
  source "local.js.erb"
  variables(
    app_id: node.midas.app_id,
    app_host: node.midas.app_host,
    app_environment: node.midas.environment,
    db_host: node.midas.database.hostname,
    db_user: node.midas.database.username,
    db_password: node.midas.database.password,
    db_name: node.midas.database.name,
    app_system_email: node.midas.system_email,
    email_host: node.midas.email.hostname,
    email_user: node.midas.email.username,
    email_password: node.midas.email.password,
    email_port: node.midas.email.port,
    email_secure: node.midas.email.secure
  )
end

template  "#{node.midas.deploy_dir}/config/settings/auth.js" do
  source "auth.js.erb"
  variables(
    app_host: node.midas.app_host,
    linkedin_client_id: node.midas.linkedin.client_id,
    linkedin_client_secret: node.midas.linkedin.secret,
    myusa_client_id: node.midas.myusa.client_id,
    myusa_client_secret: node.midas.myusa.secret
  )
end

# client config
execute 'client config' do
 command "cp -n login.ex.json login.json"
 cwd "#{node.midas.deploy_dir}/assets/js/backbone/config/"
end

execute 'build assets' do
  command "make build"
  cwd node.midas.deploy_dir
  user node.midas.user
end

bash 'server config/settings' do
  code "for file in *.ex.js; do cp -n \"$file\" \"${file/ex./}\"; done"
  cwd "#{node.midas.deploy_dir}/config/settings"
  user node.midas.user
end

file "#{node.midas.nginx_conf_dir}/#{node.midas.nginx_default}" do
  action :delete
end

link "#{node.midas.nginx_conf_dir}/midas.conf" do
  to "#{node.midas.deploy_dir}/#{node.midas.nginx_conf_source}"
  action :create
  owner node.midas.user
end

execute 'run make init' do
  command "make init && touch /tmp/midas_init"
  cwd node.midas.deploy_dir
  creates "/tmp/midas_init"
  user node.midas.user
end

template "/etc/init/midas.conf" do
  source "midas.upstart.erb"
  variables(
    working_dir: node.midas.deploy_dir,
    app_user: node.midas.user,
  )
end

service "midas" do
  provider Chef::Provider::Service::Upstart
  action   [:enable, :start]
end

service "nginx" do
  action :restart
end
