const https = require('https')
const fs = require('fs')

/**
 * Serveur Web
 * @property {Router} router : routeur web
 * @property {Database} database : gestionnaire de base de données
 * @property {http.Server} server : serveur HTTP
 */
class Server {
  constructor (conf) {
    this.router = null
    // this.database = null
    this.conf = conf

    const options = {
      key: fs.readFileSync(this.conf.keyPath),
      cert: fs.readFileSync(this.conf.certPath)
    }

    this.server = https.createServer(options)
    return this
  }

  /**
   * Enregistrement du gestionnaire de base de données
   * @param {Database} DataBase : gestionnaire de base de données
   */
  registerDataBase (DataBase) {
    this.database = DataBase
    return this
  }

  /**
   * Enregistrement du routeur web
   * @param {Router} Router : routeur web
   */
  registerRouter (Router) {
    this.router = Router
    // this.router.registerDataBase(this.database)
    this.server.on('request', (req, res) => { this.router.handle(req, res) })
    return this
  }

  /**
   * Lancement du serveur web
   */
  start () {
    this.server.listen(this.conf.port, () => {
      console.log(`Server running at port ${this.conf.port}`)
    })
    return this
  }
}

module.exports = Server
