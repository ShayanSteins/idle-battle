<template>
  <div>         
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
        <tr v-if="p_fights.length === 0" class="center"><td colspan="2">It seems your hero hasn't fight yet.</td></tr>
      </tbody>
    </table>

    <div v-if="selectedFight">
      <div><label>Status : </label><label>{{ selectedFight.result ? 'WON' : 'LOOSED' }}</label></div>
      <div><label>Opponent : </label><label>{{ selectedFight.opponentName }}</label></div>
      <div v-html="selectedFight.report"></div>
    </div>
    
  </div>
</template>

<script>
export default {
  name: 'FightList',
  data () {
    return {
      selectedFight: null
    }
  },
  props: {
    p_fights: Array
  },
  computed: {
    orderedFights: function () {
      return this.p_fights.sort(this.compareDateFight)
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