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

const env = {
  GITHUB_AUTH: 0,
  CLASSIC_AUTH: 1
}

/**
 * Routeur web
 * @property {String} distPath : chemin d'accès au dossier dist (parcel)
 */
class Router {
  constructor(config) {
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

    if (fileName === '/github-login') {
      this.githubAuth(req, res, url)
    } else if (fileName.match(/^(\/oauth-callback)/) !== null) {
      this.githubAuth(req, res, url, false)
    } else if (fileName === '/classic-login') {
      this.registerUser(req, res)
    } else if (!fs.existsSync(this.distPath + fileName)) { // Erreur 404
      res.writeHead(404, { 'Content-Type': 'text/html' })
      res.end(`<html><body style="display: flex;background-color:  rgb(248, 248, 248);color: rgb(208 44 55);font-size: 2rem;justify-content: center;align-items: center;text-align: center;font-family: monospace;"><h2>Error 404 : File "${this.distPath + fileName}" not found... (&deg;o&deg;)!</h2></body></html>`)
    } else { // Cas nominal des fichiers html, js, css, images
      res.writeHead(200, { 'Content-Type': mimeType[extension] })
      res.end(fs.readFileSync(this.distPath + fileName))
    }
  }

  githubAuth (req, res, url, firstStage = true) {
    const { clientId, clientSecret } = require(this.conf.OAuthKeysPath)

    if (firstStage) {
      res.writeHead(301, { Location: `https://github.com/login/oauth/authorize?client_id=${clientId}` })
      res.end()
    } else {
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
            this.userDbExist(clientId, env.GITHUB_AUTH).then(resp => {
              if (resp === undefined) {
                this.database.setGitHubCredentials([clientId, env.GITHUB_AUTH]).catch(err => {
                  console.error(err)
                })
              }
              res.writeHead(301, { Location: `https://${req.headers.host}/index.html?access-token=${datas.access_token}` })
              res.end()
            })
          })
        }).end(body)
      } else {
        res.statusCode = 403
        res.end('403 - Access denied')
      }
    }
  }

  registerUser (req, res) {
    if (req.headers.authorization !== undefined && req.headers.authorization !== '') {
      const credentials = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf8')
      const [email, pwd, type] = credentials.split(':')

      if (type === 'register') {
        return this.userDbExist(email, env.CLASSIC_AUTH).then(exist => {
          if (exist === undefined) {
            const { hasher, createUUID } = require('./assets/utils.js')
            let cred = hasher(pwd)
            cred = [email, cred.hashedPassword, cred.salt]
            const newIdUser = createUUID()

            this.database.setClassicCredentials([newIdUser, env.CLASSIC_AUTH, ...cred]).then(r => {
              res.statusCode = 200
              res.end(JSON.stringify(newIdUser))
            }).catch(err => {
              console.error(err)
            })
          }
          else {
            res.statusCode = 409
            res.end(JSON.stringify('Conflict : This email is already used by another account. Please try with another one.'))
          }
        })
      }
      else { // Type Login
        return this.userDbExist(email, env.CLASSIC_AUTH).then(exist => {
          if (exist !== undefined) {

            const { compare } = require('./assets/utils.js')
            const match = compare(pwd, email, exist)
            if (match) {
              res.statusCode = 200
              res.end(JSON.stringify(exist.idUser))
            }
            else {
              res.statusCode = 400
              res.end(JSON.stringify('Bad request : Wrong email or password. Please try again.'))
            }
          }
          else {
            res.statusCode = 400
            res.end(JSON.stringify('Bad request : Wrong email or password. Please try again.'))
          }
        })
      }
    }
    res.statusCode = 400
    res.end(JSON.stringify(`Bad request : An error occured during regsitering process. Please try again.`))
  }

  async userDbExist (token, type) {
    let dbCred = []

    if (type === env.GITHUB_AUTH) {
      dbCred = await this.database.getUserById(token)
    } else {
      dbCred = await this.database.getUserByEmail(token)
    }
    // console.log(dbCred[0])
    return dbCred[0]
  }
}

module.exports = Router
