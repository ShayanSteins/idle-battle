const { env, createUUID } = require('./assets/utils.js')
const Database = require('./database.js')

class DatasManager {
  constructor (req, res, url) {
    this.req = req
    this.res = res
    this.url = url
    this.database = Database.getInstance()
    this.login = null
  }

  registerLogin (Login) {
    this.login = Login
    return this
  }

  async createUpdateHero () {
    try {
      if (this.req.headers.cookie) {
        const userId = this.req.headers.cookie.split(';').find(a => a.includes('userId=')).split('=')[1]
        const user = await this.login.doesUserDbExist(userId, env.ID_AUTH)
        if (user !== undefined) {
          let concatedDatas = Buffer.alloc(0)
          this.req.on('data', datas => {
            concatedDatas = Buffer.concat([concatedDatas, datas])
          })
          await new Promise(resolve => this.req.on('end', resolve))
          const temp = JSON.parse(concatedDatas.toString())
          const newHero = { idHero: temp.idHero === null ? createUUID() : temp.idHero, idUser: userId }
          await this.database.setHero(Object.assign(temp, newHero))
          return this.login.responseToClient({ statusCode: 200, returnedDatas: JSON.stringify({ idHero: newHero.idHero }) })
        }
      } else {
        throw new Error('No cookie find.')
      }
    } catch (error) {
      console.error(error)
      return this.login.responseToClient({ statusCode: 400, returnedDatas: 'Bad request : An error occured during process. Please try logout and login again.' })
    }
  }

  async removeHero () {
    try {
      if (this.req.headers.cookie) {
        const userId = this.req.headers.cookie.split(';').find(a => a.includes('userId=')).split('=')[1]
        const user = await this.login.doesUserDbExist(userId, env.ID_AUTH)
        if (user !== undefined) {
          let concatedDatas = Buffer.alloc(0)
          this.req.on('data', datas => {
            concatedDatas = Buffer.concat([concatedDatas, datas])
          })
          await new Promise(resolve => this.req.on('end', resolve))
          const temp = JSON.parse(concatedDatas.toString())
          await this.database.removeHero(temp.idHero)
          return this.login.responseToClient({ statusCode: 200 })
        }
      } else {
        throw new Error('No cookie find.')
      }
    } catch (error) {
      console.error(error)
      return this.login.responseToClient({ statusCode: 400, returnedDatas: 'Bad request : An error occured during process. Please try logout and login again.' })
    }
  }
}

module.exports = DatasManager
