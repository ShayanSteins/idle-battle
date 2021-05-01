const mariadb = require('mariadb')

/**
 * Gestionnaire de base de données
 * @property {mariadb.Pool} : Pool de connexion à la DB
 */
class Database {
  constructor (config) {
    this.pool = mariadb.createPool(config)
    this.testConnection().catch(error => {
      console.error(error)
    })
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

  /**
   * Récupération
   */
  getUserById (idUser) {
    return this.executeQuery('SELECT * FROM User WHERE idUser = ?', [idUser])
  }

  getUserByEmail (email) {
    return this.executeQuery('SELECT * FROM User WHERE email = ?', [email])
  }

  setGitHubCredentials (cred) {
    return this.executeQuery('INSERT INTO User (idUser, typeUser) VALUES (?, ?)', cred)
  }
  
  setClassicCredentials (cred) {
    return this.executeQuery('INSERT INTO User (idUser, typeUser, email, hashedPassword, salt) VALUES (?, ?, ?, ?, ?)', cred)
  }
}

module.exports = Database
