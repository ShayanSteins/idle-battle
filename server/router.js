const fs = require('fs')
const Login = require('./login')
// const https = require('https')

// Types MIME
const mimeType = {
  css: 'text/css',
  js: 'application/javascript',
  map: 'application/javascript',
  html: 'text/html',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  svg: 'image/svg+xml',
  ico: 'image/x-icon'
}

/**
 * Routeur web
 * @property {String} distPath : chemin d'accès au dossier dist (parcel)
 */
class Router {
  constructor (config) {
    this.conf = config
    this.distPath = this.conf.distPath
    this.database = null
  }

  /**
   * Enregistrement du gestionnaire de base de données
   * @param {Database} Database : gestionnaire de base de données
   */
  registerDataBase (Database) {
    this.database = Database
  }

  /**
   * Gestionnaire de routes et requêtes HTTP
   * @param {Request} req : requête à router
   * @param {Response} res : réponse reçue
   */
  handle (req, res) {
    const url = new URL(req.url, `https://${req.headers.host}`)
    const fileName = url.pathname === '/' ? 'index.html' : url.pathname
    const extension = fileName.split('.')[fileName.split('.').length - 1]
    console.log(fileName)

    if (req.method === 'GET') {
      const login = new Login(req, res, url, this.database)

      if (fileName === '/github-login') {
        login.githubAuth(this.conf)
      } else if (fileName.match(/^(\/oauth-callback)/) !== null) {
        login.githubAuth(this.conf, false)
      } else if (fileName === '/classic-login') {
        login.loginUser()
      } else if (fileName === '/init-datas') {
        login.returnDatas()
      } else if (fileName === '/logout') {
        login.logout()
      } else if (!fs.existsSync(this.distPath + fileName)) { // Erreur 404
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end(`<html><body style="display: flex;background-color:  rgb(248, 248, 248);color: rgb(208 44 55);font-size: 2rem;justify-content: center;align-items: center;text-align: center;font-family: monospace;"><h2>Error 404 : File "${this.distPath + fileName}" not found... (&deg;o&deg;)!</h2></body></html>`)
      } else { // Cas nominal des fichiers html, js, css, images
        res.writeHead(200, { 'Content-Type': mimeType[extension] })
        res.end(fs.readFileSync(this.distPath + fileName))
      }
    }
  }
}

module.exports = Router
