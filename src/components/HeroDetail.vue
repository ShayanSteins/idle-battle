<template>
  <div>
    <div v-if="p_type === $env.CREATION" class="subTitle center">Creation</div>
    <div class="error">{{ errorMsg }}</div>
    <form @submit.prevent="createUpdate">
      <label>Name</label>
      <label v-if="p_type">{{ p_hero.firstName }}</label>
      <input v-else type="text" minlength="2" maxlength="30" v-model="newHero.firstName" required />
      <input v-if="p_type === $env.EDITION" type="button" value="Delete" @click="remove" />
      <br />

      <label>Stats</label>
      <br />
      <label>Rank : {{ p_hero.rankLvl }}</label>
      <br />
      <label>Skill points availables : <span :class="{ error: maxExceeded }">{{ newHero.skillPoint }}</span></label>
      <br />

      <div v-for="stat in $stats" :key="stat.name" class="flex">
        <label>{{ stat.displayName }}</label>
        <label>{{ p_hero[stat.name] }}</label>

        <LineStatCalcul v-if="p_hero.skillPoint > 0"
          :p_statName="stat.displayName"
          :p_statType="stat.type"
          :p_statValue="p_hero[stat.name]"
          :p_maxReached="maxReached"
          ref="lineStat"
          @changeSkill="checkTotalSkillPointAmount"
        ></LineStatCalcul>
      </div>
      <div>
        <input type="button" value="Cancel" @click="cancel">
        <input v-if="p_type === $env.EDITION" type="submit" value="Save" name="save" />
        <input v-else type="submit" value="Create" name="create" />
      </div>
    </form>
  </div>
</template>

<script>
import LineStatCalcul from './LineStatCalcul.vue'

export default {
  name: 'HeroDetail',
  components: { LineStatCalcul },
  data () {
    return {
      newHero: {
        idHero: this.p_hero.idHero,
        firstName: this.p_hero.firstName,
        rankLvl: this.p_hero.rankLvl,
        skillPoint: this.p_hero.skillPoint,
        health: this.p_hero.health,
        attack: this.p_hero.attack,
        defense: this.p_hero.defense,
        magik: this.p_hero.magik
      },
      skillPointsRepartition: this.initRepartitionSkillMap(),
      maxReached: false,
      maxExceeded: false,
      errorMsg: null
    }
  },
  props: {
    p_hero: {
      type: Object
    },
    p_type: Number
  },
  methods: {
    checkTotalSkillPointAmount (obj) {
      this.newHero[obj.statName.toLowerCase()] = obj.statValue
      const totalSkillPointUsed = this.calculTotalSkillPointAmount(obj)

      this.maxReached =
        this.p_hero.skillPoint > totalSkillPointUsed ? false : true
      this.maxExceeded =
        this.p_hero.skillPoint < totalSkillPointUsed ? true : false

      this.newHero.skillPoint = this.p_hero.skillPoint - totalSkillPointUsed
    },
    calculTotalSkillPointAmount (obj) {
      this.skillPointsRepartition.set(obj.statName, obj.usedSkill)
      return Array.from(this.skillPointsRepartition.values()).reduce(
        (acc, curr) => acc + curr
      )
    },
    async createUpdate () {
      if (this.maxExceeded) {
        this.errorMsg = 'You spent too much skill point, please adjust your repartition.'
      } else {
        this.errorMsg = null
        try {
          const response = await fetch('/create-update-hero', {
            method: 'POST',
            credentials: 'same-origin',
            body: JSON.stringify(this.newHero)
          })

          if (!response.ok) {
            const message = await response.json()
            throw message
          }
          else {
            const datas = await response.json()
            this.newHero.idHero = JSON.parse(datas).idHero
            this.$emit('addHero', this.newHero)
          }
        } catch (error) {
          this.errorMsg = error
        }
      }
    },
    cancel () {
      this.skillPointsRepartition = this.initRepartitionSkillMap()
      this.newHero = { ...this.p_hero }
      this.maxReached = false
      this.maxExceeded = false

      for (const stat of this.$stats) {
        const tmp = this.$refs.lineStat.find(a => a.p_statName === stat.displayName)
        tmp._data.newStatValue = this.p_hero[stat.name]
        tmp.usedSkillPoint = 0
      }
    },
    async remove () {
      try {
        const response = await fetch('remove-hero', {
          method: 'DELETE',
          credentials: 'same-origin',
          body: JSON.stringify({ idHero: this.p_hero.idHero })
        })

        if (!response.ok) {
          const message = await response.json()
          throw message
        }
        else {
          this.$emit('removeHero', this.newHero.idHero)
        }
      } catch (error) {
        this.errorMsg = error
      }
    },
    initRepartitionSkillMap () {
      const map = new Map()
      for (const stat of this.$stats) {
        map.set(stat.displayName, 0)
      }
      return map
    }
  },
}
</script>

<style scoped>
.error {
  color: red;
}
.flex {
  display: flex;
  justify-content: space-evenly;
}
</style>