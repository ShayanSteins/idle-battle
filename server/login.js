const https = require('https')
const { resolve } = require('path')
const { env } = require('./assets/utils.js')
const Database = require('./database.js')

/**
 * Login class
 * @property {Database} database : Database intance
 */
class Login {
  constructor () {
    this.database = Database.getInstance()
  }

  /**
   * Manage GitHub authentification
   * @param {Object} conf : OAuthKeysPath configuration
   * @param {Boolean} firstStage : first stage true, second stage false
   * @param {URL} url 
   * @param {String} host 
   * @returns 
   */
  githubAuth (conf, firstStage = true, url = null, host = null) {
    const { clientId, clientSecret } = require(conf.OAuthKeysPath)

    if (firstStage) {
      return { statusCode: 301, headers: { Location: `https://github.com/login/oauth/authorize?client_id=${clientId}` } }
    }

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

      return new Promise((resolve, reject) => {
        https.request(opt, response => {
          response.on('data', async (datas) => {
            try {
              datas = JSON.parse(datas.toString())
              const userId = await this.checkGithubToken(datas.access_token)
              let user = await this.getUserDbIfExist(userId, env.ID_AUTH)

              if (user === undefined) await this.database.setGitHubCredentials({ id: userId })
              resolve({ statusCode: 301, cookie: [`token=${datas.access_token}; secure; HttpOnly`, `userId=${userId}; secure; HttpOnly`, 'logged=true'], headers: { Location: `https://${host}/` } })
            } catch (error) {
              console.error(error)
              resolve({ statusCode: 403, returnedDatas: '403 - Access denied' })
            }
          })
        }).end(body)

      })

    } else {
      return { statusCode: 403, returnedDatas: '403 - Access denied' }
    }
  }

  /**
   * Manage classic authentification
   * @param {Request.headers} headers 
   * @returns {Object}
   */
  async loginUser (headers) {
    if (headers.authorization !== undefined && headers.authorization !== '') {
      const credentials = Buffer.from(headers.authorization.split(' ')[1], 'base64').toString('utf8')
      const [email, pwd, type] = credentials.split(':')

      try {
        const exist = await this.getUserDbIfExist(email, env.EMAIL_AUTH)
        const { hasher, createUUID, compare } = require('./assets/utils.js')

        if (type === 'register') { // Type register
          if (exist === undefined) {
            const cred = hasher(pwd)
            const newIdUser = createUUID()
            try {
              await this.database.setClassicCredentials({ id: newIdUser, email: email, hash: cred.hashedPassword, salt: cred.salt })
              return {
                statusCode: 200,
                cookie: [`userId=${newIdUser}; secure; HttpOnly`, 'logged=true']
              }
            } catch (err) {
              console.error(err)
              throw { statusCode: 500, returnedDatas: 'Internal server error : Cannot create user.' }
            }
          } else {
            throw { statusCode: 409, returnedDatas: 'Conflict : This email is already used by another account. Please try with another one.' }
          }
        } else { // Type Login
          if (exist !== undefined) {
            const match = compare(pwd, email, exist)
            if (match) {
              return {
                statusCode: 200,
                cookie: [`userId=${exist.idUser}; secure; HttpOnly`, 'logged=true']
              }
            } else {
              throw { statusCode: 403, returnedDatas: 'Forbidden : Wrong email or password. Please try again.' }
            }
          } else {
            throw { statusCode: 403, returnedDatas: 'Forbidden : Wrong email or password. Please try again.' }
          }
        }
      } catch (error) {
        if (!error.statusCode) {
          console.error(error)
          error = { statusCode: 500, returnedDatas: 'Internal server error : Process ending badly.' }
        }
        return error
      }
    }
    return { statusCode: 400, returnedDatas: 'Bad request : An error occured during authentification. Please try again.' }
  }

  /**
   * Log out te user and reset cookies
   * @param {Request.headers.cookie} cookies 
   * @returns {Object}
   */
  logout (cookies) {
    try {
      const expireCookies = []
      for (const cookie of cookies.split(';')) {
        expireCookies.push(`${cookie}; expires=${new Date(0)}`)
      }
      return {
        statusCode: 200,
        cookie: expireCookies,
        returnedDatas: {
          logged: false
        }
      }
    } catch (error) {
      console.error(error)
      return { statusCode: 500, returnedDatas: 'Internal server error : Process ending badly.' }
    }
  }

  /**
   * Check GitHub token
   * @param {String} token 
   * @returns {String} user id
   */
  checkGithubToken (token) {
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
          reject(new Error('GitHub Auth : bad token'))
        })
      }).end()
    })
  }

  /**
   * Get a user if he exist on DB, if not, return undefined
   * @param {String} id 
   * @param {Integer} type 
   * @returns {Obect|undefined}
   */
  async getUserDbIfExist (id, type) {
    let dbCred = []

    if (type === env.ID_AUTH) {
      dbCred = await this.database.getUserById(id)
    } else {
      dbCred = await this.database.getUserByEmail(id)
    }
    return dbCred[0]
  }
}

module.exports = Login
