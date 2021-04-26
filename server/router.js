const fs = require('fs')
const https = require('https')

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
    // this.database = null
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
  async handle (req, res) {
    const url = new URL(req.url, `https://${req.headers.host}`)
    const fileName = url.pathname === '/' ? 'index.html' : url.pathname
    const extension = fileName.split('.')[fileName.split('.').length - 1]
    const { clientId, clientSecret } = require(this.conf.OAuthKeysPath)

    console.log(fileName)

    if (fileName === '/githublogin') {
      res.writeHead(301, { Location: `https://github.com/login/oauth/authorize?client_id=${clientId}` })
      res.end()
    } else if (fileName.match(/^(\/oauth-callback)/) !== null) {
      if (url.searchParams.get('code')) {
        const body = JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: url.searchParams.get('code')
        })
        const opt = {
          port: 443,
          method: 'POST',
          hostname: 'github.com',
          path: '/login/oauth/access_token',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': body.length,
            Accept: 'application/json'
          }
        }

        https.request(opt, response => {
          response.on('data', datas => {
            datas = JSON.parse(datas.toString())
            res.writeHead(301, { Location: `https://${req.headers.host}/index.html?access-token=${datas.access_token}` })
            res.end()
          })
        }).end(body)
      } else {
        res.statusCode = 403
        res.end('403 - Access denied')
      }
    } else if (!fs.existsSync(this.distPath + fileName)) { // Erreur 404
      res.writeHead(404, { 'Content-Type': 'text/html' })
      res.end(`<html><body style="display: flex;background-color:  rgb(248, 248, 248);color: rgb(208 44 55);font-size: 2rem;justify-content: center;align-items: center;text-align: center;font-family: monospace;"><h2>Error 404 : File "${this.distPath + fileName}" not found... (&deg;o&deg;)!</h2></body></html>`)
    } else { // Cas nominal des fichiers html, js, css, images
      res.writeHead(200, { 'Content-Type': mimeType[extension] })
      res.end(fs.readFileSync(this.distPath + fileName))
    }
  }

  /**
   * Vérifie que le token de l'utilisateur est toujours valide via une requête HTTPS vers l'OAuth de Github
   * @param {string} token : token d'accès de l'utilisateur
   */
   checkToken(token) {
    const opt = {
      port: 443,
      method: 'GET',
      hostname: 'api.github.com',
      path: '/user',
      headers: {
        'User-Agent': 'curl/7.22.0',
        Authorization: `token ${token}`
      }
    }

    return new Promise((resolve, reject) => {
      https.request(opt, response => {
        let concatedDatas = Buffer.alloc(0)

        response.on('data', datas => {
          concatedDatas = Buffer.concat([concatedDatas, datas])
        })
        response.on('end', () => {
          concatedDatas = JSON.parse(concatedDatas.toString())
          if (concatedDatas.id !== undefined) resolve(concatedDatas.id)
          reject('bad token')
        })
      }).end()
    })
  }
}

module.exports = Router
