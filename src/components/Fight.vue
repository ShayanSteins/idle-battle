<template>
  <div>
    <div class="subTitle center">Fight</div>
    <div class="error">{{ errorMsg }}</div>
    <div v-if="p_list.length === 0" class="emptyList center">
      It seems you don't have any Hero in your pool...
    </div>
    <div v-else>
      <div class="selectHeroLabel flex justify-between align-item-center">
        <span>Choose your hero :</span>
        <Button p_type="button" class="bold" p_value="?" @click="openFightDocumentation"></Button>
      </div>
      <select class="selectHero" v-model="selectedHero" @change="initDisplayFight">
        <option disabled value="">Choose...</option>
        <option v-for="hero in availableHeros" :key="hero.idHero" :value="hero">
          {{ hero.firstName }}
        </option>
      </select>
      <span class="infoFight italic tinny">Only heroes that have not loosed a fight in the past hour and have at least one attack point will be on the list.</span>
      <Button p_class="fightBtn" p_value="Fight !" :disabled="!canHeFight" @click="startFight"></Button>
      
      <div v-if="displayFight" class="flex fd-col align-item-center">
        <div class="center separator">- - - - - - - - - - - - - - - - - - - - -</div>

        <span class="subTitle fightTitle center">FIGHT !</span>

        <FightWorkflow :p_heroName="selectedHeroName" :p_fight="newFight"></FightWorkflow>

        <Button p_value="Next fight" v-if="canHeFight" @click="startFight"></Button>

      </div>

    </div>
  </div>
</template>

<script>
import Button from '~/basic-components/Button.vue'
import FightWorkflow from './FightWorkflow.vue'
export default {
  name: 'Fight',
  components: { Button, FightWorkflow },
  data () {
    return {
      selectedHero: '',
      selectedHeroName: '',
      displayFight: false,
      newFight: null,
      errorMsg: ''
    }
  },
  props: {
    p_list: {
      type: Array,
      default: []
    }
  },
  computed: {
    availableHeros: function () {
      let availableHeroes = []
      for (const hero of this.p_list) {
        if (hero.attack > 0) {
          if (hero.fights.length > 0) {
            const latestFight = hero.fights.reduce((prev, curr) => (prev.dateFight > curr.dateFight) ? prev : curr)
            let nowLessOneHour = new Date()
            nowLessOneHour.setHours(nowLessOneHour.getHours() - 1)
            if (new Date(latestFight.dateFight) > nowLessOneHour && !latestFight.result) continue
          }
          availableHeroes.push(hero)
        }
      }
      return availableHeroes
    },
    canHeFight () {
      if (this.selectedHero === '') return false
      else if (this.newFight !== null && this.newFight.result === 0) return false
      return true
    }
  },
  methods: {
    async startFight () {
      try {
        const response = await fetch('/start-fight', {
          method: 'POST',
          credentials: 'same-origin',
          body: JSON.stringify(this.selectedHero)
        })
        const datas = await response.json()
        if (!response.ok || response.status !== 200) {
          throw datas
        }

        this.newFight = datas.fights[datas.fights.length - 1]
        this.selectedHeroName = this.selectedHero.firstName
        this.$emit('updateHero', datas)

        const updatedHero = this.p_list.find(hero => hero.idHero === datas.idHero)
        if (this.newFight.result === 1 && updatedHero) {
          this.selectedHero = updatedHero
        } else {
          this.selectedHero = ''
        }

        this.errorMsg = ''
        this.displayFight = true

      } catch (error) {
        this.errorMsg = error
      }
    },
    initDisplayFight () {
      this.displayFight = false
      this.newFight = null
      this.selectedHeroName = null
    },
    openFightDocumentation () {
      window.open('https://github.com/ShayanSteins/idle-battle#fight')
    }
  }
}
</script>

<style>
.emptyList {
  margin: auto;
}
.selectHeroLabel {
  margin-bottom: 0.4rem;
}
.selectHero {
  padding: 0.4rem;
  margin-bottom: 0.3rem;
  width: 100%;
}
.infoFight {
  color: var(--darker-white-color);
}
.fightBtn {
  width: 100%;
}
.fightTitle {
  font-size: 4rem;
}

@media screen and (min-width: 600px) {
  .fightBtn {
    display: block;
    margin: auto;
    width: 12rem;
  }
}
</style>