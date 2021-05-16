<template>
  <div>
    <div class="error">{{ errorMsg }}</div>
    <div v-if="p_list.length === 0">
      It seems you don't have any Hero in your pool...
    </div>
    <div v-else>
      <label>Choose your hero :</label>
      <select v-model="selectedHero">
        <option disabled value="">Choose...</option>
        <option v-for="hero in p_list" :key="hero.idHero" :value="hero.idHero">
          {{ hero.firstName }}
        </option>
      </select>
      <button @click="startFight" :disabled="selectedHero === ''">Fight !</button>
      
      <div v-if="displayFight">
        <div>------------------------------------------------</div>

        <span>FIGHT !</span>

        <div>{{ this.p_list.find(a => a.idHero === this.selectedHero).firstName }} VS {{ result.fight.opponentName }}</div>

        <div v-html="result.fight.report"></div>

        <button v-if="result.fight.result === 1" @click="startFight">Next fight</button>

      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'Fight',
  data () {
    return {
      selectedHero: '',
      displayFight: false,
      result: null,
      errorMsg: ''
    }
  },
  props: {
    p_list: Array
  },
  methods: {
    async startFight () {
      try {
        const response = await fetch('/start-fight', {
          method: 'POST',
          credentials: 'same-origin',
          body: JSON.stringify(this.p_list.find(a => a.idHero === this.selectedHero))
        })
        const datas = await response.json()
        if (!response.ok || response.status === 204) {
          throw datas
        }
        
        this.result = datas
        // console.log(datas)
        datas.heroUpdate.fights.push(datas.fight)        
        this.$emit('updateHero', datas.heroUpdate)
        this.displayFight = true

      } catch (error) {
        this.errorMsg = error
      }

    }
  }
}
</script>

<style scoped>
.imgFight {
  width: 100%;
}
</style>