const fs = require('fs')
const { GET_BY } = require('./assets/utils.js')
const DatasManager = require('./datasManager')
const Login = require('./login')

// MIME Types
const mimeType = {
  css: 'text/css',
  js: 'application/javascript',
  map: 'application/javascript',
  html: 'text/html',
  jpeg: 'image/jpeg',
  png: 'image/png',
  jpg: 'image/jpeg',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  ttf: 'font/ttf'
}

/**
 * Web router
 * @property {Object} conf : router configuration
 * @property {String} distPath : path to dist folder (parcel)
 */
class Router {
  constructor (config) {
    this.conf = config
    this.distPath = this.conf.distPath
  }

  /**
   * HTTPS route and request manager
   * @param {Request} req : resquest to route
   * @param {Response} res : received response
   */
  async handle (req, res) {
    const url = new URL(req.url, `https://${req.headers.host}`)
    const fileName = url.pathname === '/' ? 'index.html' : url.pathname
    const extension = fileName.split('.')[fileName.split('.').length - 1]
    const login = new Login()

    if (req.method === 'GET') {
      if (fileName === '/github-login') {
        Router.responseToClient(res, login.githubAuth(this.conf))
      } else if (fileName.match(/^(\/oauth-callback)/) !== null) {
        Router.responseToClient(res, await login.githubAuth(this.conf, false, url, req.headers.host))
      } else if (fileName === '/classic-login') {
        Router.responseToClient(res, await login.loginUser(req.headers))
      } else if (fileName === '/init-datas') {
        try {
          if (req.headers.cookie) {
            const userId = req.headers.cookie.split(';').find(a => a.includes('userId=')).split('=')[1]
            const datasManager = new DatasManager(req, res, url)
            const heroes = await datasManager.getAllUserDatas(userId)

            Router.responseToClient(res, {
              statusCode: 200,
              returnedDatas: {
                heroes: heroes
              }
            })
          } else {
            throw new Error('No cookie find.')
          }
        } catch (error) {
          console.error(error)
          Router.responseToClient(res, { statusCode: 400, returnedDatas: 'Bad request : An error occured during login process. Please try again.' })
        }
      } else if (fileName === '/logout') {
        Router.responseToClient(res, login.logout(req.headers.cookie))
      } else if (!fs.existsSync(this.distPath + fileName)) { // Erreur 404
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end(`<html><body style="display: flex;background-color:  rgb(248, 248, 248);color: rgb(208 44 55);font-size: 2rem;justify-content: center;align-items: center;text-align: center;font-family: monospace;"><h2>Error 404 : File "${this.distPath + fileName}" not found... (&deg;o&deg;)!</h2></body></html>`)
      } else { // html, js, css, images files
        res.writeHead(200, { 'Content-Type': mimeType[extension] })
        res.end(fs.readFileSync(this.distPath + fileName))
      }
    } else if (req.method === 'POST') {
      try {
        const datasManager = new DatasManager()
        const { userId, temp } = await this.checkCookieBefore(req, res, login)
        if (userId !== undefined && temp !== undefined) {
          if (fileName === '/create-update-hero') {
            Router.responseToClient(res, await datasManager.createUpdateHero(userId, temp))
          } else if (fileName === '/start-fight') {
            Router.responseToClient(res, await datasManager.startFight(userId, temp))
          }
        }
      } catch (error) {
        console.error(error)
        return Router.responseToClient(res, { statusCode: 400, returnedDatas: 'Bad request : An error occured during process.' })
      }
    } else if (req.method === 'DELETE') {
      try {
        const datasManager = new DatasManager()
        const { userId, temp } = await this.checkCookieBefore(req, res, login)
        if (userId !== undefined && temp !== undefined) {
          if (fileName === '/remove-hero') {
            Router.responseToClient(res, await datasManager.removeHero(temp))
          }
        }
      } catch (error) {
        console.error(error)
        return Router.responseToClient(res, { statusCode: 400, returnedDatas: 'Bad request : An error occured during removing process.' })
      }
    }
  }

  /**
   * Construct the response for client with status code, datas, headers and cookie
   * @param {Object} params : {statusCode, returnedDatas, headers, cookie}
   */
  static responseToClient (response, params) {
    if (params.cookie) response.setHeader('Set-Cookie', params.cookie)

    response.writeHead(params.statusCode, params.headers)

    if (params.returnedDatas) response.end(JSON.stringify(params.returnedDatas))
    else response.end()
  }

  /**
   * Checking for auth cookies
   * @param {Request} request
   * @param {Response} response
   * @param {Login} login
   * @returns {Object}
   */
  async checkCookieBefore (request, response, login) {
    try {
      if (request.headers.cookie) {
        const userId = request.headers.cookie.split(';').find(a => a.includes('userId=')).split('=')[1]
        const user = await login.getUserDbIfExist(userId, GET_BY.ID)
        if (user !== undefined) {
          let concatedDatas = Buffer.alloc(0)
          request.on('data', datas => {
            concatedDatas = Buffer.concat([concatedDatas, datas])
          })
          await new Promise(resolve => request.on('end', resolve))
          return Promise.resolve({ userId: userId, temp: JSON.parse(concatedDatas.toString()) })
        }
      } else {
        throw new Error('No cookie find.')
      }
    } catch (error) {
      console.error(error)
      return Router.responseToClient(response, { statusCode: 400, returnedDatas: 'Bad request : An error occured during process. Please try logout and login again.' })
    }
  }
}

module.exports = Router
