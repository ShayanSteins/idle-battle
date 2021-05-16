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

  async checkCookieBefore () {
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
          return Promise.resolve({ userId: userId, temp: temp })
        }
      } else {
        throw new Error('No cookie find.')
      }
    } catch (error) {
      console.error(error)
      return this.login.responseToClient({ statusCode: 400, returnedDatas: 'Bad request : An error occured during process. Please try logout and login again.' })
    }
  }

  async createUpdateHero (userId, hero) {
    const newHero = { idHero: hero.idHero === null ? createUUID() : hero.idHero, idUser: userId }
    await this.database.setHero(Object.assign(hero, newHero))
    return this.login.responseToClient({ statusCode: 200, returnedDatas: { idHero: newHero.idHero } })
  }

  async removeHero (hero) {
    await this.database.removeHero(hero.idHero)
    return this.login.responseToClient({ statusCode: 200 })
  }

  async startFight (userId, hero) {
    const opponent = await this.database.getOpponent({ idUser: userId, rankLvl: hero.rankLvl })

    if (opponent[0] !== undefined) {
      const result = this.fightReport(hero, opponent[0])
      const newFight = await this.database.setFight({
        idFight: createUUID(),
        idHero: hero.idHero,
        opponentName: opponent[0].firstName,
        result: result.winner === hero.idHero ? 1 : 0,
        report: result.report
      })
      if (result.winner === hero.idHero) {
        hero.rankLvl += 1
        hero.skillPoint += 1
      }
      else {
        hero.rankLvl = hero.rankLvl === 1 ? 1 : hero.rankLvl - 1
      }
      hero.idUser = userId

      await this.database.setHero(hero)
      if (newFight[0] !== undefined) return this.login.responseToClient({ statusCode: 200, returnedDatas: { fight: newFight[0], heroUpdate: hero, opponent: opponent[0] } })
    }
    return this.login.responseToClient({ statusCode: 400, returnedDatas: 'Sorry... it seems that there is no hero to fight with you.' })
  }

  fightReport (heroA, heroB) {
    let report = ''
    let turn = 1
    let winner = null
    let healthA = heroA.health
    let healthB = heroB.health

    while (healthA > 0 && healthB > 0) {
      report += `Turn n°${turn} : <br>`

      let result = this.turn(heroA, heroB)
      report += result.report
      healthB = healthB - result.loosedHealth

      result = this.turn(heroB, heroA)
      report += result.report
      healthA = healthA - result.loosedHealth

      turn++
    }
    if (healthB <= 0) winner = heroA
    if (healthA <= 0) winner = heroB
    report += `<br><br>WINNER : ${winner.firstName} ! <br>`
    return { report: report, winner: winner.idHero }
  }

  turn (heroA, heroB) {
    const result = this.attack(heroA.attack, heroA.magik, heroB.defense)
    if (result === null) {
      return { report: `${heroA.firstName} missed attack.<br>`, loosedHealth: 0 }
    } else {
      const report = `${heroA.firstName} attack with ${result.atkA}.<br>${heroB.firstName} loosed ${result.effectiveAttack} life point(s).<br>`
      return { report: report, loosedHealth: result.effectiveAttack }
    }
  }

  attack (attackA, magikA, defenseB) {
    let effectiveAttack = 0

    const atkA = attackA !== 0 ? this.getRandomIntInclusive(1, attackA) : 0
    if (atkA === 0) return null

    effectiveAttack = atkA - defenseB

    if (effectiveAttack < 0) return null
    else if (magikA === effectiveAttack) effectiveAttack += magikA

    return { atkA: atkA, effectiveAttack: effectiveAttack }
  }

  getRandomIntInclusive (min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}

module.exports = DatasManager
