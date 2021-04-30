const https = require('https')

const env = {
  GITHUB_AUTH: 0,
  CLASSIC_AUTH: 1
}

class Login {
  constructor(req, res, url, database) {
    this.req = req
    this.res = res
    this.url = url
    this.database = database
  }

  githubAuth (conf, firstStage = true) {
    const { clientId, clientSecret } = require(conf.OAuthKeysPath)

    if (firstStage) {
      return this.responseToClient({ statusCode: 301, headers: { Location: `https://github.com/login/oauth/authorize?client_id=${clientId}` } })
    }

    if (this.url.searchParams.get('code')) {
      const body = JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: this.url.searchParams.get('code')
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
        response.on('data', async (datas) => {
          try {
            datas = JSON.parse(datas.toString())

            const userId = await this.checkToken(datas.access_token)

            let user = await this.getDbUserByToken(userId, env.GITHUB_AUTH)

            if (user === undefined) {
              user = { idUser: userId, typeUser: env.GITHUB_AUTH }
              await this.database.setGitHubCredentials([userId, env.GITHUB_AUTH])
            }
            this.responseToClient({ statusCode: 301, cookie: [`token=${datas.access_token}; secure; HttpOnly`, 'logged=true'], headers: { Location: `https://${this.req.headers.host}/` } })
            // this.responseToClient({ statusCode: 301, headers: { Location: `https://${this.req.headers.host}/index.html?access-token=${datas.access_token}` } })
          } catch (error) {
            console.error(error)
            this.responseToClient({ statusCode: 403, returnedDatas: '403 - Access denied' })
          }
        })
      }).end(body)
    } else {
      this.responseToClient({ statusCode: 403, returnedDatas: '403 - Access denied' })
    }

  }

  async loginUser () {
    if (this.req.headers.authorization !== undefined && this.req.headers.authorization !== '') {
      const credentials = Buffer.from(this.req.headers.authorization.split(' ')[1], 'base64').toString('utf8')
      const [email, pwd, type] = credentials.split(':')

      try {
        const exist = await this.getDbUserByToken(email, env.CLASSIC_AUTH)
        const { hasher, createUUID, compare } = require('./assets/utils.js')

        if (type === 'register') {
          if (exist === undefined) {
            let cred = hasher(pwd)
            cred = [email, cred.hashedPassword, cred.salt]
            const newIdUser = createUUID()
            try {
              await this.database.setClassicCredentials([newIdUser, env.CLASSIC_AUTH, ...cred])
              return this.responseToClient({
                statusCode: 200,
                cookie: [`userId=${newIdUser}; secure; HttpOnly`, 'logged=true']
              })
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
              return this.responseToClient({
                statusCode: 200,
                cookie: [`userId=${exist.idUser}; secure; HttpOnly`, 'logged=true']
              })
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
        return this.responseToClient(error)
      }
    }
    return this.responseToClient({ statusCode: 400, returnedDatas: 'Bad request : An error occured during registration process. Please try again.' })
  }

  logout () {
    const allCookies = this.req.headers.cookie.split(';')
    let expireCookies = []
    for (let cookie of allCookies) {
      expireCookies.push(`${cookie}; expires=${new Date(0)}`)
    }
    return this.responseToClient({
      statusCode: 200,
      cookie: expireCookies,
      returnedDatas: {
        logged: false
      }
    })
  }

  async returnDatas () {
    try {
      if(this.req.headers.cookie) {
        const userId = this.req.headers.cookie.split(';').find(a => a.startsWith('userId=')).split('=')[1]
        const exist = await this.getDbUserByToken(userId, env.GITHUB_AUTH)
        return this.responseToClient({
          statusCode: 200,
          returnedDatas: {
            idUser: exist.userId,
            typeUser: exist.type
          }
        })
      }
      throw 'No cookie find.'
    } catch(error) {
      console.log(error)
      return this.responseToClient({ statusCode: 400, returnedDatas: 'Bad request : An error occured during login process. Please try again.' })
    }
  }

  /**
   * 
   * @param {Object} params : {statusCode, returnedDatas, headers} 
   */
  responseToClient (params) {
    if (params.cookie) this.res.setHeader('Set-Cookie', params.cookie)

    this.res.writeHead(params.statusCode, params.headers)

    if (params.returnedDatas) this.res.end(JSON.stringify(params.returnedDatas))
    else this.res.end()
  }

  checkToken (token) {
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
          reject('GitHub Auth : bad token')
        })
      }).end()
    })
  }

  async getDbUserByToken (token, type) {
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

module.exports = Login