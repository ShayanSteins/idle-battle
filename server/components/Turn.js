const { createUUID } = require("../assets/utils.js");
const Database = require('../database.js')


class Turn {
  idTurn;
  turnNumber = 1;
  attackHeroA = 0;
  loosedHealthHeroB = 0;
  attackHeroB = 0;
  loosedHealthHeroA = 0;

  constructor ({ idTurn, turnNumber, attackHeroA, loosedHealthHeroB, attackHeroB, loosedHealthHeroA }) {
    this.idTurn = idTurn
    this.turnNumber = turnNumber
    this.attackHeroA = attackHeroA ?? this.attackHeroA
    this.loosedHealthHeroB = loosedHealthHeroB ?? this.loosedHealthHeroB
    this.attackHeroB = attackHeroB ?? this.attackHeroB
    this.loosedHealthHeroA = loosedHealthHeroA ?? this.loosedHealthHeroA
  }

  static create ({ turnNumber, attackHeroA, loosedHealthHeroB, attackHeroB, loosedHealthHeroA }) {
    if (turnNumber != undefined && attackHeroA != undefined && loosedHealthHeroB != undefined && attackHeroB != undefined && loosedHealthHeroA != undefined) {
      return new Turn({ idTurn: createUUID(), turnNumber, attackHeroA, loosedHealthHeroB, attackHeroB, loosedHealthHeroA })
    }
  }

  update (properties) {
    for (const key in properties) {
      this[key] = properties[key]
    }
    return this
  }


  async saveInDb (idFight) {
    const savedTurn = await Database.getInstance().setTurn({
      idTurn: this.idTurn,
      turnNumber: this.turnNumber,
      attackHeroA: this.attackHeroA,
      loosedHealthHeroB: this.loosedHealthHeroB,
      attackHeroB: this.attackHeroB,
      loosedHealthHeroA: this.loosedHealthHeroA,
      idFight: idFight
    })

    if (savedTurn[0] === undefined) throw { statusCode: 400, returnedDatas: 'Bad request : DB Turn insertion failed.' }
    return this
  }

  attack (heroA, heroB) {
    let result = this.attackCalculation(heroA, heroB)
    this.attackHeroA = result.attack
    this.loosedHealthHeroB = result.loosedHealth
    heroB.health = heroB.health - result.loosedHealth

    if (heroB.health <= 0) {
      this.attackHeroB = null
      this.loosedHealthHeroA = null
      return this
    }

    result = this.attackCalculation(heroB, heroA)
    this.attackHeroB = result.attack
    this.loosedHealthHeroA = result.loosedHealth
    heroA.health = heroA.health - result.loosedHealth

    return this
  }

  attackCalculation (attacker, defender) {
    let effectiveAttack = 0

    const atkA = attacker.attack !== 0 ? this.getRandomIntInclusive(1, attacker.attack) : 0
    if (atkA === 0) return { attack: 0, loosedHealth: 0 }

    effectiveAttack = atkA - defender.defense

    if (effectiveAttack < 0) return { attack: 0, loosedHealth: 0 }
    else if (attacker.magik === effectiveAttack) effectiveAttack += attacker.magik

    return { attack: atkA, loosedHealth: effectiveAttack }
  }

  getRandomIntInclusive (min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}

module.exports = Turn
