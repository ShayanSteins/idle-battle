const https = require('https')
const fs = require('fs')

/**
 * Web server
 * @property {Router} router : web router
 * @property {Object} conf : server configuration
 * @property {https.Server} server : HTTPS server
 */
class Server {
  constructor (conf) {
    this.router = null
    this.conf = conf

    const options = {
      key: fs.readFileSync(this.conf.keyPath),
      cert: fs.readFileSync(this.conf.certPath)
    }

    this.server = https.createServer(options)
    return this
  }

  /**
   * Web router registration
   * @param {Router} Router : web router
   */
  registerRouter (Router) {
    this.router = Router
    this.server.on('request', (req, res) => { this.router.handle(req, res) })
    return this
  }

  /**
   * Start web server
   */
  start () {
    this.server.listen(this.conf.port, () => {
      console.log(`Server running at port ${this.conf.port}`)
    })
    return this
  }
}

module.exports = Server
