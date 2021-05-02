<template>
  <div>
    <form @submit.prevent="create">
      <label>Name</label>
      <input
        type="text"
        minlength="2"
        maxlength="30"
        v-model="newHero.firstName"
        required
      />
      <br />

      <label>Stats</label>
      <br />
      <label>Rank : {{ p_hero.rankLvl }}</label>
      <br />
      <label
        >Skill points availables :
        <span :class="{ error: maxExceeded }">{{
          newHero.skillPoint
        }}</span></label
      >
      <br />
      <LineStatCalcul
        p_statName="Health"
        p_statType="increment"
        :p_statValue="p_hero.health"
        :p_maxReached="maxReached"
        @changeSkill="checkTotalSkillPointAmount"
      ></LineStatCalcul>

      <LineStatCalcul
        p_statName="Attack"
        p_statType="divideBy5"
        :p_statValue="p_hero.attack"
        :p_maxReached="maxReached"
        @changeSkill="checkTotalSkillPointAmount"
      ></LineStatCalcul>

      <LineStatCalcul
        p_statName="Defense"
        p_statType="divideBy5"
        :p_statValue="p_hero.defense"
        :p_maxReached="maxReached"
        @changeSkill="checkTotalSkillPointAmount"
      ></LineStatCalcul>

      <LineStatCalcul
        p_statName="Magik"
        p_statType="divideBy5"
        :p_statValue="p_hero.magik"
        :p_maxReached="maxReached"
        @changeSkill="checkTotalSkillPointAmount"
      ></LineStatCalcul>
      <div>
        <!-- <input type="button" value="Cancel" name="cancel"> -->
        <input type="submit" value="Create" name="create" />
      </div>
    </form>
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
      newHero: {
        firstName: this.p_hero.firstName,
        rankLvl: this.p_hero.rankLvl,
        skillPoint: this.p_hero.skillPoint,
        health: this.p_hero.health,
        attack: this.p_hero.attack,
        defense: this.p_hero.defense,
        magik: this.p_hero.magik,
      },
      skillPointsRepartition: new Map([
        ['Health', 0],
        ['Attack', 0],
        ['Defense', 0],
        ['Magik', 0],
      ]),
      maxReached: false,
      maxExceeded: false,
    }
  },
  props: {
    p_hero: {
      type: Object,
    },
  },
  methods: {
    checkTotalSkillPointAmount(obj) {
      this.newHero[obj.statName.toLowerCase()] = obj.statValue
      const totalSkillPointUsed = this.calculTotalSkillPointAmount(obj)

      this.maxReached =
        this.p_hero.skillPoint > totalSkillPointUsed ? false : true
      this.maxExceeded =
        this.p_hero.skillPoint < totalSkillPointUsed ? true : false

      this.newHero.skillPoint = this.p_hero.skillPoint - totalSkillPointUsed
    },
    calculTotalSkillPointAmount(obj) {
      this.skillPointsRepartition.set(obj.statName, obj.usedSkill)
      return Array.from(this.skillPointsRepartition.values()).reduce(
        (acc, curr) => acc + curr
      )
    },
    async create() {
      if (this.maxExceeded) {
        // !!! make a popin to display error
        alert('You spent too much skill point, please adjust your repartition.')
      } else {
        const response = await fetch('/create-hero', {
          method: 'POST',
          credentials: 'same-origin',
          body: JSON.stringify(this.newHero),
        })

        if (!response.ok) {
          // !!! ERROR to fire
        }
        else {
          this.$emit('addHero', this.newHero)
        }
      }
    },
    cancel() {
      console.log('CANCEL')
    },
  },
}
</script>

<style scoped>
.error {
  color: red;
}
</style>