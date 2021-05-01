<template>
  <div>
    <label>Name</label>
    <input type="text" minlength="2" maxlength="30" :value="firstName" />
    <br />

    <label>Stats</label>
    <br />
    <label>Rank : {{ p_hero.rankLvl }}</label>
    <br />
    <label>Skill points availables : {{ skillPoint }}</label>
    <br />
    <LineStatCalcul
      :p_stat="{ value: health, name: 'Health', type: 'increment' }"
      :p_maxReached="maxReached"
      @changeSkill="checkTotalSkillPointAmount"
    ></LineStatCalcul>

    <LineStatCalcul
      :p_stat="{ value: attack, name: 'Attack', type: 'divideBy5' }"
      :p_maxReached="maxReached"
      @changeSkill="checkTotalSkillPointAmount"
    ></LineStatCalcul>

    <LineStatCalcul
      :p_stat="{ value: defense, name: 'Defense', type: 'divideBy5' }"
      :p_maxReached="maxReached"
      @changeSkill="checkTotalSkillPointAmount"
    ></LineStatCalcul>

    <LineStatCalcul
      :p_stat="{ value: magik, name: 'Magik', type: 'divideBy5' }"
      :p_maxReached="maxReached"
      @changeSkill="checkTotalSkillPointAmount"
    ></LineStatCalcul>
  </div>
</template>

<script>
import LineStatCalcul from './LineStatCalcul.vue'
// const statsName = {
//   HEALTH: 'Health',
//   ATTACK: 'Attack',
//   DEFENSE: 'Defense',
//   MAGIK: 'Magik',
// }

export default {
  name: 'HeroDetail',
  components: { LineStatCalcul },
  data() {
    return {
      firstName: this.p_hero.firstName,
      rankLvl: this.p_hero.rankLvl,
      skillPoint: this.p_hero.skillPoint,
      health: this.p_hero.health,
      attack: this.p_hero.attack,
      defense: this.p_hero.defense,
      magik: this.p_hero.magik,
      skillPointsRepartition: new Map([
        ['Health', 0],
        ['Attack', 0],
        ['Defense', 0],
        ['Magik', 0],
      ]),
      maxReached: false,
    }
  },
  props: {
    p_hero: {
      type: Object,
    },
  },
  methods: {
    checkTotalSkillPointAmount(obj) {
      const totalSkillPointUsed = calculTotalSkillPointAmount(obj)
      if (this.p_hero.skillPoint <= totalSkillPointUsed) this.maxReached = true
      else this.maxReached = false
      this.skillPoint = this.p_hero.skillPoint - totalSkillPointUsed
    },
    calculTotalSkillPointAmount(obj) {
      this.skillPointsRepartition.set(obj.statName, obj.usedSkill)
      return Array.from(this.skillPointsRepartition.values()).reduce((acc, curr) => acc + curr)
    },
  },
}
</script>

<style scoped>
</style>