const Server = require('./server.js')
const Router = require('./router.js')
const Database = require('./database.js')
const config = require('./assets/config.json')

new Server(config.server)
  .registerDataBase(new Database(config.database))
  .registerRouter(new Router(config.server))
  .start()
