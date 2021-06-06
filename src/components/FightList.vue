<template>
  <div>
    <div v-if="p_fights.length === 0" class="center">It seems your hero hasn't fight yet.</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Opponent</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fight in orderedFights" :key="fight.idFight" @click="selectFight(fight)">
            <td>{{ fight.dateFight.replaceAll('-', '/') }}</td>
            <td>{{ fight.opponentName }}</td>
            <td>{{ fight.result ? 'WON' : 'LOOSED' }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="selectedFight">
        <div><label>Status : </label><label>{{ selectedFight.result ? 'WON' : 'LOOSED' }}</label></div>
        <div><label>Opponent : </label><label>{{ selectedFight.opponentName }}</label></div>
        <FightWorkflow :p_heroName="p_heroName" :p_fight="selectedFight"></FightWorkflow>
      </div>
    </div>    
  </div>
</template>

<script>
import FightWorkflow from './FightWorkflow.vue'
export default {
  name: 'FightList',
  components: { FightWorkflow },
  data () {
    return {
      selectedFight: null
    }
  },
  props: {
    p_fights: Array,
    p_heroName: String
  },
  computed: {
    orderedFights: function () {
      return this.p_fights.sort(this.compareDateFight)
    }
  },
  watch: {
    p_fights: {
      immediate: true,
      deep: true,
      handler() {
        this.selectedFight = null
      }
    }
  },
  methods: {
    selectFight (fight) {
      this.selectedFight = fight
    },
    compareDateFight (a, b) {
      if (a.dateFight < b.dateFight) return 1
      if (a.dateFight > b.dateFight) return -1
      return 0
    }
  }
}
</script>

<style>
</style>