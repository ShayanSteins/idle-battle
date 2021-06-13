const { createUUID } = require("../assets/utils.js");
const Database = require('../database.js')
const Turn = require("./Turn.js");

class Fight {
  idFight;
  opponentName;
  result;
  dateFight;
  turns;

  constructor ({ idFight, opponentName, result, dateFight, turns } = {}) {
    this.idFight = idFight ?? createUUID()
    this.opponentName = opponentName
    this.result = result
    this.dateFight = dateFight
    this.turns = turns ?? []
  }

  static create ({ opponentName, result, dateFight, turns }) {
    if (opponentName !== undefined && result !== undefined && dateFight !== undefined && turns !== undefined) {
      return new Fight({ idFight: createUUID(), idHero, opponentName, result, dateFight, turns })
    }
    return null
  }

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

  fightWorkflow (heroA, heroB) {
    let turnNumber = 1
    this.opponentName = heroB.firstName

    while (heroA.health > 0 && heroB.health > 0) {
      let turn = new Turn({ idTurn: createUUID(), turnNumber: turnNumber })
        .attack(heroA, heroB)
      this.turns.push(turn)
      turnNumber++
      if(turnNumber > 100) {
        break
      }
    }

    this.result = heroB.health <= 0 ? 1 : 0
    return this
  }
}

module.exports = Fight
