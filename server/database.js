const mariadb = require('mariadb')
const { TYPE_ACCOUNT } = require('./assets/utils.js')

/**
 * Database manager, singleton
 * @property {mariadb.Pool} : Pool connexion for DB
 */
class Database {
  constructor (config) {
    if (Database.instance instanceof Database) return Database.instance
    Database.instance = this

    try {
      this.pool = mariadb.createPool(config)
      this.testConnection()
    } catch (error) {
      console.error(error)
      throw error
    }

    return this
  }

  /**
   * Get the instance of DB manager
   * @param {Object} config 
   * @returns {Database|Error}
   */
  static getInstance (config) {
    if (Database.instance instanceof Database) return Database.instance
    else if (config !== null) return new Database(config)
    else throw new Error('Config file missing to initialize DB Connection')
  }

  /**
   * Test DB connection via simple request
   */
  async testConnection () {
    await this.pool.query('SELECT version()')
  }

  /**
   * Request excutive function
   * @param {String} query : parameter query to execute
   * @param {Array<Array>|Array|null} params : prepared statements
   */
  async executeQuery (query, params) {
    if (Array.isArray(params) && Array.isArray(params[0])) return await this.pool.batch(query, params)
    else return await this.pool.query(query, params)
  }

  /**
   * Get the user by Id
   * @param {String} idUser 
   * @returns {Object}
   */
  getUserById (idUser) {
    return this.executeQuery('SELECT * FROM User WHERE idUser = ?', [idUser])
  }

  /**
   * Get the user by Email
   * @param {String} idUser 
   * @returns {Object}
   */
  getUserByEmail (email) {
    return this.executeQuery('SELECT * FROM User WHERE email = ?', [email])
  }

  /**
   * Get heroes by id user
   * @param {String} idUser 
   * @returns {Object}
   */
  getHerosByUser (idUser) {
    return this.executeQuery(`SELECT h.*, f.opponentName, f.result, f.dateFight, t.* FROM Hero as h 
    LEFT JOIN Fight as f ON h.idHero = f.idHero 
    LEFT JOIN Turn as t ON f.idFight = t.idFight
    WHERE h.idUser = ? ORDER BY h.idHero, f.dateFight DESC, t.turnNumber ASC`
      , [idUser])
  }

  /**
    * 1 - take the closest opponents based on rank value
    * 2 - opponent has to be free (it must not have fight in the past hour)
    * 3 - take the opponents with the less number of fights
    * 4 - take a random opponent within the list
    * @param {Object} cred {idUser: String, rankLvl: Integer}
    * @returns {Object}
    */
  getOpponent (cred) {
    return this.executeQuery({
      namedPlaceholders: true, 
      sql: `SELECT h.idHero, h.firstName, h.rankLvl, h.skillPoint, h.health, h.attack, h.defense, h.magik, 
    ABS(:rankLvl - cast(h.rankLvl as signed)) as lvlRange,
    (SELECT count(*) FROM Fight WHERE idHero = h.idHero) as nbFight
  FROM Hero as h
  WHERE h.idUser != :idUser
  AND NOT EXISTS ( SELECT dateFight FROM Fight as f WHERE h.idHero = f.idHero AND f.dateFight > DATE_ADD(NOW(), INTERVAL -1 HOUR) ORDER BY dateFight DESC LIMIT 1 )
  ORDER BY lvlRange, nbFight, RAND() LIMIT 1`
    }, cred)
  }

  /**
   * Add gitHub account
   * @param {Object} cred {id: idUser}
   * @returns {Object}
   */
  setGitHubCredentials (cred) {
    return this.executeQuery({ namedPlaceholders: true, sql: `INSERT INTO User (idUser, typeUser) VALUES (:id, ${TYPE_ACCOUNT.GITHUB})` }, cred)
  }

  /**
   * Add classic account
   * @param {Object} cred {id:idUser, email:email, hash:hashedPassword, salt:salt}
   * @returns {Object}
   */
  setClassicCredentials (cred) {
    return this.executeQuery({ namedPlaceholders: true, sql: `INSERT INTO User (idUser, typeUser, email, hashedPassword, salt) VALUES (:id, ${TYPE_ACCOUNT.CLASSIC}, :email, :hash, :salt)` }, cred)
  }

  /**
   * Add or Update Hero
   * @param {Object} cred { idHero:idHero, firstName:firstName, rankLvl:rankLvl, skillPoint:skillPoint, health:health, attack:attack, defense:defense, magik:magik, idUser: idUser }
   * @returns {Object}
   */
  setHero (cred) {
    return this.executeQuery(
      {
        namedPlaceholders: true,
        sql: `INSERT INTO Hero (idHero, firstName, rankLvl, skillPoint, health, attack, defense, magik, idUser) 
          VALUES (:idHero, :firstName, :rankLvl, :skillPoint, :health, :attack, :defense, :magik, :idUser) 
          ON DUPLICATE KEY UPDATE 
          idHero = VALUES(idHero), 
          firstName = VALUES(firstName), 
          rankLvl = VALUES(rankLvl), 
          skillPoint = VALUES(skillPoint), 
          health = VALUES(health), 
          attack = VALUES(attack), 
          defense = VALUES(defense), 
          magik = VALUES(magik), 
          idUser = VALUES(idUser)
          RETURNING idHero, firstName, rankLvl, skillPoint, health, attack, defense, magik, idUser`
      }, cred)
  }

  /**
   * Add or Update Fight
   * @param {Object} cred { idFight:idFight, idHero:idHero, opponentName:opponentName, result:result }
   * @returns {Object}
   */
  setFight (cred) {
    return this.executeQuery({
      namedPlaceholders: true,
      sql: `INSERT INTO Fight (idFight, idHero, opponentName, result, dateFight) VALUES (:idFight, :idHero, :opponentName, :result, NOW())
      RETURNING idFight, idHero, opponentName, result, dateFight`
    }, cred)
  }

  /**
   * Add or Update Turn
   * @param {Object} cred { idTurn:idTurn, turnNumber:turnNumber, attackHeroA:attackHeroA, loosedHealthHeroB:loosedHealthHeroB, attackHeroB:attackHeroB, loosedHealthHeroA:loosedHealthHeroA, idFight:idFight }
   * @returns {Object}
   */
  setTurn (cred) {
    return this.executeQuery({
      namedPlaceholders: true,
      sql: `INSERT INTO Turn (idTurn, turnNumber, attackHeroA, loosedHealthHeroB, attackHeroB, loosedHealthHeroA, idFight) 
      VALUES (:idTurn, :turnNumber, :attackHeroA, :loosedHealthHeroB, :attackHeroB, :loosedHealthHeroA, :idFight)
      RETURNING idTurn, turnNumber, attackHeroA, loosedHealthHeroB, attackHeroB, loosedHealthHeroA, idFight`
    }, cred)
  }

  /**
   * Remove a Hero and all his related datas (Fight and Turn)
   * @param {String} idHero 
   * @returns {Object}
   */
  removeHero (idHero) {
    return this.executeQuery('DELETE FROM Hero where idHero = ?', [idHero])
  }
}

module.exports = Database
