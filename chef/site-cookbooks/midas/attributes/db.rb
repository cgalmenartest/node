default.midas.database.username = 'midas'
default.midas.database.password = 'midas'
default.midas.database.hostname = 'localhost'
default.midas.database.name = 'midas'

default.postgresql.database.name = 'midas'
default.postgresql.database.encoding = 'unicode'
default.postgresql.databases = [
  {
    name: node.midas.database.name,
    owner: node.midas.database.username
  }
]
default.postgresql.users = [
  {
    username: node.midas.database.username,
    password: node.midas.database.password,
    superuser: false,
    createdb: true,
    login: true
  }
]
default.postgresql.pg_hba = [
  {
    type: 'hostssl',
    db: 'all',
    user: 'all',
    addr: '0.0.0.0/0',
    method: 'md5'
  }
]
default.postgresql.password = ''
