const { createUUID } = require("../assets/utils.js");
const Database = require('../database.js')
const Fight = require("./Fight.js");

class Hero {
  idHero;
  firstName;
  rankLvl = 1;
  skillPoint = 12;
  health = 10;
  attack = 0;
  defense = 0;
  magik = 0;
  idUser;
  fights = [];

  constructor ({ idHero, firstName, rankLvl, skillPoint, health, attack, defense, magik, fights, idUser }) {
    this.idHero = idHero
    this.firstName = firstName
    this.rankLvl = rankLvl ?? this.rankLvl
    this.skillPoint = skillPoint ?? this.skillPoint
    this.health = health ?? this.health
    this.attack = attack
    this.defense = defense
    this.magik = magik
    this.fights = fights ?? []
    this.idUser = idUser
  }

  static create ({ idHero, firstName, rankLvl, skillPoint, health, attack, defense, magik, fights, idUser }) {
    if (firstName !== undefined && rankLvl !== undefined && skillPoint !== undefined && health !== undefined && attack !== undefined && defense !== undefined && magik !== undefined) {
      return new Hero({ 
        idHero: idHero ?? createUUID(), 
        firstName,
        rankLvl,
        skillPoint, 
        health, 
        attack, 
        defense, 
        magik, 
        fights: fights ?? [],
        idUser
      })
    }
    return null
  }

  update (properties) {
    for (const key in properties) {
      this[key] = properties[key]
    }
    return this
  }

  async saveInDb () {
    const savedHero = await Database.getInstance().setHero(this)    
    if (savedHero[0] === undefined) throw { statusCode: 400, returnedDatas: 'Bad request : DB Hero insertion failed.' }
    return this
  }

  addFightFromSqlLine (sqlLine) {
    this.fights.push(
      new Fight({
        idFight: sqlLine.idFight,
        opponentName: sqlLine.opponentName,
        result: sqlLine.result,
        dateFight: sqlLine.dateFight
      }).addTurnFromSqlLine(sqlLine)
    )
    return this
  }

  async startFight (opponent) {
    const fight = new Fight().fightWorkflow({ ...this}, opponent)
    const dbFight = await fight.saveInDb(this.idHero)
    fight.dateFight = dbFight.dateFight
    this.fights.push(fight)

    if (fight.result === true) {
      this.rankLvl += 1
      this.skillPoint += 1
    }
    else {
      this.rankLvl = this.rankLvl === 1 ? 1 : this.rankLvl - 1
    }
    this.saveInDb()

    return this
  }
}

module.exports = Hero
