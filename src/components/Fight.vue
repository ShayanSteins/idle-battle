<template>
  <div>
    <div class="subTitle center">Fight</div>
    <div class="error">{{ errorMsg }}</div>
    <div v-if="p_list.length === 0" class="emptyList center">
      It seems you don't have any Hero in your pool...
    </div>
    <div v-else>
      <div class="selectHeroLabel">Choose your hero :</div>
      <select class="selectHero" v-model="selectedHero">
        <option disabled value="">Choose...</option>
        <option v-for="hero in availableHeros" :key="hero.idHero" :value="hero">
          {{ hero.firstName }}
        </option>
      </select>
      <Button p_class="fightBtn" p_value="Fight !" :disabled="!canHeFight" @click="startFight"></Button>
      
      <div v-if="displayFight" class="flex fd-col fa-i-center">
        <div class="center separator">- - - - - - - - - - - - - - - - - - - - -</div>

        <span class="subTitle fightTitle center">FIGHT !</span>

        <!-- <div><span class="green">{{ selectedHero.firstName }}</span> VS <span class="error">{{ newFight.opponentName }}</span></div> -->

        <FightWorkflow :p_heroName="selectedHero.firstName" :p_fight="newFight"></FightWorkflow>

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
      let avHero = []
      for (const hero of this.p_list) {
        if (hero.attack > 0) {
          if (hero.fights.length > 0) {
            const latestFight = hero.fights.reduce((prev, curr) => (prev.dateFight > curr.dateFight) ? prev : curr)
            let nowLessOneHour = new Date()
            nowLessOneHour.setHours(nowLessOneHour.getHours() - 1)
            if (new Date(latestFight.dateFight) > nowLessOneHour && !latestFight.result) continue
          }
          avHero.push(hero)
        }
      }
      return avHero
    },
    canHeFight () {
      if(this.selectedHero === '') return false
      else if(this.newFight !== null && this.newFight.result === false) return false
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
        this.$emit('updateHero', datas)
        this.errorMsg = ''
        this.displayFight = true

      } catch (error) {
        this.errorMsg = error
      }
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
  margin-bottom: 1rem;
  width: 100%;
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