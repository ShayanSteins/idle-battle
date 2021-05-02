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

  async createHero () {
    try {
      if (this.req.headers.cookie) {
        // console.log(this.req.headers.cookie)
        const userId = this.req.headers.cookie.split(';').find(a => a.includes('userId=')).split('=')[1]
        const user = await this.login.doesUserDbExist(userId, env.ID_AUTH)
        if (user !== undefined) {
          let concatedDatas = Buffer.alloc(0)
          this.req.on('data', datas => {
            concatedDatas = Buffer.concat([concatedDatas, datas])
          })
          this.req.on('end', async () => {
            const temp = JSON.parse(concatedDatas.toString())
            const newHero = [createUUID(), temp.firstName, temp.rankLvl, temp.skillPoint, temp.health, temp.attack, temp.defense, temp.magik, userId]
            await this.database.setHero(newHero)
            return this.login.responseToClient({ statusCode: 200 })
          })
        }
      } else {
        throw new Error('No cookie find.')
      }
    } catch (error) {
      return this.login.responseToClient({ statusCode: 400, returnedDatas: 'Bad request : An error occured during process. Please try logout and login again.' })
    }
  }
}

module.exports = DatasManager
