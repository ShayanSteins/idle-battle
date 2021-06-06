const { createUUID } = require('./assets/utils.js')
const Database = require('./database.js')
const Hero = require('./components/Hero.js')
const Fight = require('./components/Fight.js')
const Turn = require('./components/Turn.js')

class DatasManager {
  constructor () {
    this.database = Database.getInstance()
  }

  async getAllUserDatas (userId) {
    let rawDatas = await this.database.getHerosByUser(userId)
    let heroes = []

    if (rawDatas[0] !== undefined) {
      rawDatas = Array.from(rawDatas)
      for (const sqlLine of rawDatas) {
        const indexH = heroes.findIndex(a => a.idHero === sqlLine.idHero)
        if (indexH === -1) {
          const hero = new Hero({
            idHero: sqlLine.idHero,
            firstName: sqlLine.firstName,
            rankLvl: sqlLine.rankLvl,
            skillPoint: sqlLine.skillPoint,
            health: sqlLine.health,
            attack: sqlLine.attack,
            defense: sqlLine.defense,
            magik: sqlLine.magik
          })
          if (sqlLine.idFight !== null) hero.addFightFromSqlLine(sqlLine)
          heroes.push(hero)
        } else {
          const indexF = heroes[indexH].fights.findIndex(a => a.idFight === sqlLine.idFight)

          if (indexF === -1) heroes[indexH].addFightFromSqlLine(sqlLine)
          else heroes[indexH].fights[indexF].addTurnFromSqlLine(sqlLine)
        }
      }
    }
    return heroes
  }

  async createUpdateHero (userId, hero) {
    const newHero = Hero.create(hero)
    newHero.update({ 
      idHero: hero.idHero === null ? createUUID() : hero.idHero, 
      idUser: userId 
    })
    await this.database.setHero(newHero)
    return { statusCode: 200, returnedDatas: { idHero: newHero.idHero } }
  }

  async removeHero (hero) {
    await this.database.removeHero(hero.idHero)
    return { statusCode: 200 }
  }

  async startFight (userId, hero) {
    const opponent = await this.database.getOpponent({ idUser: userId, rankLvl: hero.rankLvl })

    if (opponent[0] !== undefined) {
      let heroObject = await Hero.create({ ...hero, idUser: userId }).startFight(opponent[0])
      return { statusCode: 200, returnedDatas: heroObject }
    }
    return { statusCode: 400, returnedDatas: 'Sorry... it seems that there is no hero to fight with you.' }
  }
}

module.exports = DatasManager
