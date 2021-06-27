const { createUUID } = require('./assets/utils.js')
const Database = require('./database.js')
const Hero = require('./components/Hero.js')

/**
 * Entities Manager
 * @property {Database} : database instance
 */
class DatasManager {
  constructor () {
    this.database = Database.getInstance()
  }

  /**
   * Get all datas for a user (Heroes, Fights, and Turns)
   * @param {String} userId
   * @returns {Array<Hero>}
   */
  async getAllUserDatas (userId) {
    let rawDatas = await this.database.getHerosByUser(userId)
    const heroes = []

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

  /**
   * Create or update a Hero
   * @param {String} userId
   * @param {Hero} hero
   * @returns {Object}
   */
  async createUpdateHero (userId, hero) {
    const newHero = Hero.create(hero)
    newHero.update({
      idHero: hero.idHero === null ? createUUID() : hero.idHero,
      idUser: userId
    })
    await this.database.setHero(newHero)
    return { statusCode: 200, returnedDatas: { idHero: newHero.idHero } }
  }

  /**
   * Remove a Hero
   * @param {Hero} hero
   * @returns {Object}
   */
  async removeHero (hero) {
    await this.database.removeHero(hero.idHero)
    return { statusCode: 200 }
  }

  /**
   * Start a new Fight
   * @param {String} userId
   * @param {Hero} hero
   * @returns {Object}
   */
  async startFight (userId, hero) {
    const opponent = await this.database.getOpponent({ idUser: userId, rankLvl: hero.rankLvl })

    if (opponent[0] !== undefined) {
      const heroObject = await Hero.create({ ...hero, idUser: userId }).startFight(opponent[0])
      return { statusCode: 200, returnedDatas: heroObject }
    }
    return { statusCode: 400, returnedDatas: 'Sorry... it seems that there is no hero to fight with you.' }
  }
}

module.exports = DatasManager
