const Server = require('./server.js')
const Router = require('./router.js')
const Database = require('./database.js')
const config = require('./assets/config.json')

Database.getInstance(config.database)

new Server(config.server)
  .registerRouter(new Router(config.server))
  .start()
