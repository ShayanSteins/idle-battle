const Server = require('./server.js')
const Router = require('./router.js')
// const Database = require('./database.js')
const config = require('./assets/config.json')

const args = process.argv
const passwordModif = args.indexOf('--adminPassword')

if (passwordModif !== -1) {
  // const { hasher } = require('./assets/utils.js')

  // let cred = hasher(args[passwordModif + 1])
  // cred = [
  //   cred.hashedPassword,
  //   cred.salt,
  //   'admin'
  // ]
  // const db = new Database(config.database)
  // db.setCredentials(cred)
  //   .then(() => db.getCredentials())
  //   .then(cred => {
  //     console.log(cred[0])
  //     process.exit()
  //   })
  //   .catch(error => {
  //     console.error(error)
  //     process.exit(-1)
  //   })

} else {
  try {
    new Server(config.server)
      // .registerDataBase(new Database(config.database))
      .registerRouter(new Router(config.server))
      .start()
  } catch (error) {
    throw error
  }
}
