if node[:ec2]
  prefix = 'midas/' + node['midas']['environment']
  node.set['midas']['email']['username'] = citadel["#{prefix}/email_username"].strip
  node.set['midas']['email']['password'] = citadel["#{prefix}/email_password"].strip
  node.set['midas']['myusa']['client_id'] = citadel["#{prefix}/myusa_client_id"].strip
  node.set['midas']['myusa']['secret'] = citadel["#{prefix}/myusa_secret"].strip
  node.set['midas']['linkedin']['client_id'] = citadel["#{prefix}/linkedin_client_id"].strip
  node.set['midas']['linkedin']['secret'] = citadel["#{prefix}/linkedin_secret"].strip
end
