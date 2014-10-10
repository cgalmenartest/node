if node[:ec2]
  prefix = 'midas/' + node['midas']['environment']
  node.set['midas']['email']['username'] = citadel["#{prefix}/email_username"]
  node.set['midas']['email']['password'] = citadel["#{prefix}/email_password"]
  node.set['midas']['myusa']['client_id'] = citadel["#{prefix}/myusa_client_id"]
  node.set['midas']['myusa']['secret'] = citadel["#{prefix}/myusa_secret"]
  node.set['midas']['linkedin']['client_id'] = citadel["#{prefix}/linkedin_client_id"]
  node.set['midas']['linkedin']['secret'] = citadel["#{prefix}/linkedin_secret"]
end
