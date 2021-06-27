const { createUUID } = require("../assets/utils.js");
const Database = require('../database.js')
const Turn = require("./Turn.js");

/**
 * Fight entity
 * @property {String} idFight;
 * @property {String} opponentName;
 * @property {Integer} result;
 * @property {String} dateFight;
 * @property {Array<Turn>} turns
 */
class Fight {
  idFight;
  opponentName;
  result;
  dateFight;
  turns;

  /**
   * Constructor, mainly used to instanciate a Fight with db datas
   * @param {idFight: String, opponentName: String, result: Integer, dateFight: String, turns: Array<Turn>}  
   */
  constructor ({ idFight, opponentName, result, dateFight, turns } = {}) {
    this.idFight = idFight ?? createUUID()
    this.opponentName = opponentName
    this.result = result
    this.dateFight = dateFight
    this.turns = turns ?? []
  }

  /**
   * Create a Fight with datas coming via the front
   * @param {opponentName: String, result: Integer, dateFight: String, turns: Turn} param0 
   * @returns {Fight|null} return the Fight object
   */
  static create ({ opponentName, result, dateFight, turns }) {
    if (opponentName !== undefined && result !== undefined && dateFight !== undefined && turns !== undefined)
      return new Fight({ idFight: createUUID(), idHero, opponentName, result, dateFight, turns })
    return null
  }

  /**
   * Add a fight in DB
   * @param {String} idHero 
   * @returns {Object|Error} the fight saved
   */
  async saveInDb (idHero) {
    const savedFight = await Database.getInstance().setFight({
      idFight: this.idFight,
      idHero: idHero,
      opponentName: this.opponentName,
      result: this.result
    })
    
    if (savedFight[0] === undefined) throw { statusCode: 400, returnedDatas: 'Bad request : DB Fight insertion failed.' }

    for (const turn of this.turns) {
      turn.saveInDb(this.idFight)
    }

    return savedFight[0]
  }

  /**
   * Add a Turn to the Fight with a SQL Line result
   * @param {Object} sqlLine 
   * @returns {Fight}
   */
  addTurnFromSqlLine (sqlLine) {
    this.turns.push(
      new Turn({
        idTurn: sqlLine.idTurn,
        turnNumber: sqlLine.turnNumber,
        attackHeroA: sqlLine.attackHeroA,
        loosedHealthHeroB: sqlLine.loosedHealthHeroB,
        attackHeroB: sqlLine.attackHeroB,
        loosedHealthHeroA: sqlLine.loosedHealthHeroA
      })
    )
    return this
  }

  /**
   * Manage the fight workflow
   * @param {Hero} heroA : user hero
   * @param {Hero} heroB : opponent hero
   * @returns {Fight}
   */
  fightWorkflow (heroA, heroB) {
    let turnNumber = 1
    this.opponentName = heroB.firstName

    while (heroA.health > 0 && heroB.health > 0) {
      let turn = new Turn({ idTurn: createUUID(), turnNumber: turnNumber })
        .attack(heroA, heroB)
      this.turns.push(turn)
      turnNumber++
      if(turnNumber > 100)
        break
    }

    this.result = heroB.health <= 0 ? 1 : 0
    return this
  }
}

module.exports = Fight
