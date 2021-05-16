<template>
  <div>
    <div v-if="p_type === $env.CREATION" class="subTitle center">Creation</div>
    <div class="error">{{ errorMsg }}</div>
    <div v-if="p_type === $env.CREATION && p_nbHeroes === 10" class="error">Your pool is full. Remove a hero before created new one.</div>
    
    <div v-if="(p_type === $env.CREATION && p_nbHeroes < 10) || p_type === $env.EDITION">
      <div class="error" v-if="maxExceeded">You spent too much skill point, please adjust your repartition.</div>
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
          <input v-if="p_hero.skillPoint > 0" type="button" value="Cancel" @click="cancel">
          <input v-if="p_type === $env.EDITION && p_hero.skillPoint" type="submit" value="Save" name="save" :disabled="maxExceeded"/>
          <input v-if="p_type === $env.CREATION" type="submit" value="Create" name="create" :disabled="maxExceeded"/>
        </div>

        <div v-if="p_type === $env.EDITION">
          <FightList :p_fights="p_hero.fights"></FightList>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import LineStatCalcul from './LineStatCalcul.vue'
import FightList from './FightList.vue'

export default {
  name: 'HeroDetail',
  components: { LineStatCalcul, FightList },
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
        magik: this.p_hero.magik,
        fights: this.p_hero.fights
      },
      skillPointsRepartition: this.initRepartitionSkillMap(),
      maxReached: false,
      maxExceeded: false,
      errorMsg: null
    }
  },
  watch: {
    p_hero: {
      handler: function () {
        this.cancel()
      },
      deep: true
    }
  },
  props: {
    p_hero: Object,
    p_type: Number,
    p_nbHeroes: Number
  },
  methods: {
    checkTotalSkillPointAmount (usedSkill, statName, statValue) {
      this.newHero[statName.toLowerCase()] = statValue
      const totalSkillPointUsed = this.calculTotalSkillPointAmount(usedSkill, statName)

      this.maxReached =
        this.p_hero.skillPoint > totalSkillPointUsed ? false : true
      this.maxExceeded =
        this.p_hero.skillPoint < totalSkillPointUsed ? true : false

      this.newHero.skillPoint = this.p_hero.skillPoint - totalSkillPointUsed
    },
    calculTotalSkillPointAmount (usedSkill, statName) {
      this.skillPointsRepartition.set(statName, usedSkill)
      return Array.from(this.skillPointsRepartition.values()).reduce(
        (acc, curr) => acc + curr
      )
    },
    async createUpdate () {
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
          this.newHero.idHero = datas.idHero
          this.$emit('addHero', this.newHero)
        }
      } catch (error) {
        this.errorMsg = error
      }
    },
    cancel () {
      this.skillPointsRepartition = this.initRepartitionSkillMap()
      this.newHero = { ...this.p_hero }
      this.maxReached = false
      this.maxExceeded = false
      // if (this.$refs.lineStat === undefined || this.$refs.lineStat.length <= 0) {
      //   this.$nextTick(this.initStats)
      // } else {
        this.initStats()
      // }
    },
    async remove () {
      if (confirm('Are you sure you want to remove this Hero ?')) {
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
      }
    },
    initStats () {
      if (this.$refs.lineStat !== undefined && this.$refs.lineStat.length > 0) {
        for (const stat of this.$stats) {
          const tmp = this.$refs.lineStat.find(a => a.p_statName === stat.displayName)
          tmp._data.newStatValue = this.p_hero[stat.name]
          tmp.usedSkillPoint = 0
        }
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