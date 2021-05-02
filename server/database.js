const mariadb = require('mariadb')

/**
 * Gestionnaire de base de données
 * @property {mariadb.Pool} : Pool de connexion à la DB
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

  static getInstance (config) {
    if (Database.instance instanceof Database) return Database.instance
    else if (config !== null) return new Database(config)
    else throw new Error('Config file missing to initialize DB Connection')
  }

  /**
   * Teste la connexion à la DB via une requête simple
   */
  async testConnection () {
    await this.pool.query('SELECT version()')
  }

  /**
   * Fonction d'exécution des requêtes
   * @param {String} query : requête paramétrée à exécuter
   * @param {Array[Array]|Array|null} params : paramètres à inclure dans la requête
   */
  async executeQuery (query, params) {
    if (Array.isArray(params) && Array.isArray(params[0])) return await this.pool.batch(query, params)
    else return await this.pool.query(query, params)
  }

  getUserById (idUser) {
    return this.executeQuery('SELECT * FROM User WHERE idUser = ?', [idUser])
  }

  getUserByEmail (email) {
    return this.executeQuery('SELECT * FROM User WHERE email = ?', [email])
  }

  getHerosByUser (idUser) {
    return this.executeQuery('SELECT * FROM Hero WHERE idUser = ?', [idUser])
  }

  setGitHubCredentials (cred) {
    return this.executeQuery('INSERT INTO User (idUser, typeUser) VALUES (?, ?)', cred)
  }

  setClassicCredentials (cred) {
    return this.executeQuery('INSERT INTO User (idUser, typeUser, email, hashedPassword, salt) VALUES (?, ?, ?, ?, ?)', cred)
  }

  setHero (cred) {
    return this.executeQuery('INSERT INTO Hero (idHero, firstName, rankLvl, skillPoint, health, attack, defense, magik, idUser) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', cred)
  }
}

module.exports = Database
