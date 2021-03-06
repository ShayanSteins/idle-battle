<template>
  <div>
    <div v-if="p_type === $mode.CREATION" class="subTitle center">
      <Button p_type="button" class="iconHelp bold" p_value="?" @click="openCreateDocumentation"></Button>
      <span>Creation</span>
    </div>
    <div class="error">{{ errorMsg }}</div>
    <div v-if="maxNbHeroesReached" class="error">Your pool is full. Remove a hero before created new one.</div>
    
  

    <div v-if="canCreateHero || p_type === $mode.EDITION">
      <div v-if="maxExceeded" class="error">You spent too much skill point, please adjust your repartition.</div>
      <form @submit.prevent="createUpdate" class="flex fd-col">
        <div class="flex align-item-center justify-between heroCategories">
          <div class="flex f-grow align-item-center"> 
            <label for="heroName" class="heroCategoriesName bold">Name : </label>
            <label v-if="p_type === $mode.EDITION">{{ p_hero.firstName }}</label>
            <input v-else type="text" minlength="2" maxlength="30" class="inputHeroName f-grow border-bl" id="heroName" v-model="newHero.firstName" required />          
          </div>
          <ButtonImage v-if="p_type === $mode.EDITION" p_class="right btnIcon" p_type="button" title="Delete"
            :p_img="$images.delete"
            @click="remove"
          ></ButtonImage>
        </div>
        <br />

        <div class="heroCategories flex justify-between align-item-center">
          <span class="heroCategoriesName bold">Stats :</span>
          <span v-if="p_type === $mode.EDITION">Rank : {{ p_hero.rankLvl }}</span>
          
        </div>
        <div class="heroPropertiesDiv">
          <span class="italic small">Skill points availables : <span :class="{ error: maxExceeded }">{{ newHero.skillPoint }}</span></span>
          <br />
          <div v-for="stat in $stats" :key="stat.name" class="statsDiv align-item-center">
            <span>- {{ stat.displayName }}</span>
            <span>{{ p_hero[stat.name] }}</span>
            <LineStatCalcul v-if="p_hero.skillPoint > 0"
              :p_statName="stat.displayName"
              :p_statType="stat.type"
              :p_statValue="p_hero[stat.name]"
              :p_maxReached="maxReached"
              ref="lineStat"
              @changeSkill="checkTotalSkillPointAmount"
            ></LineStatCalcul>
          </div>
        </div>
        <div class="actions right">
          <Button v-if="p_hero.skillPoint > 0" p_type="button" p_value="Cancel" p_name="cancel" @click="cancel"></Button>
          <Button v-if="p_type === $mode.EDITION && p_hero.skillPoint" p_type="submit" p_value="Save" p_name="save" :disabled="maxExceeded"></Button>
          <Button v-if="p_type === $mode.CREATION" p_type="submit" p_value="Create" p_name="create" :disabled="maxExceeded"></Button>
        </div>

        <div v-if="p_type === $mode.EDITION" class="heroCategories">          
          <span class="heroCategoriesName bold">Fights :</span> 
          <FightList :p_heroName="p_hero.firstName" :p_fights="p_hero.fights"></FightList>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import Button from '~/basic-components/Button.vue'
import ButtonImage from '~/basic-components/ButtonImage.vue'
import LineStatCalcul from '~/components/LineStatCalcul.vue'
import FightList from '~/components/FightList.vue'

export default {
  name: 'HeroDetail',
  components: { Button, ButtonImage, LineStatCalcul, FightList },
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
      deep: true,
      handler: function () {
        this.cancel()
      }
    }
  },
  props: {
    p_hero: Object,
    p_type: Number,
    p_nbHeroes: Number
  },
  computed: {
    canCreateHero () {
      return this.p_type === this.$mode.CREATION && this.p_nbHeroes < 10
    },
    maxNbHeroesReached () {
      return this.p_type === this.$mode.CREATION && this.p_nbHeroes >= 10
    }
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
      this.initStats()
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
    },
    openCreateDocumentation () {
      window.open('https://github.com/ShayanSteins/idle-battle#create')
    }
  },
}
</script>

<style scoped>
.inputHeroName {
  margin-left: 0.5rem;
}
.heroCategories {
  margin: 0.5rem 0;
}
.heroCategoriesName {
  font-size: 1.1rem;
  padding-right: 0.4rem;
}
.heroPropertiesDiv {
  padding-left: 1rem;
}
.statsDiv {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  margin-top: 0.3rem;
}
.actions {
  margin-top: 1rem;
}
</style>