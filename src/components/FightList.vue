<template>
  <div>
    <div v-if="p_fights.length === 0" class="center">It seems your hero hasn't fight yet.</div>
    <div v-else>
      <table class="fightTable">
        <thead>
          <tr>
            <th>Date</th>
            <th>Opponent</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr 
          v-for="fight in orderedFights" 
          :key="fight.idFight"
          :class="{ selected: selectedFight && selectedFight.idFight === fight.idFight }" 
          class="center" 
          @click="selectFight(fight)"
          >
            <td :title="fight.dateFight.replaceAll('-', '/')">{{ displayedDate(fight.dateFight) }}</td>
            <td>{{ fight.opponentName }}</td>
            <td :class="classesStatusLine(fight.result)">{{ fight.result ? 'WON' : 'LOOSED' }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="selectedFight">
        
        <div class="center separator">- - - - - - - - - - - - - - - - - - - - -</div>
        <span class="heroCategoriesName bold">Fight report : </span>
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
      handler () {
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
    },
    displayedDate: function (dateNotFormated) {
      const dateFromated = new Date(dateNotFormated)
      const dateNow = new Date()

      if (dateNow.toLocaleDateString() === dateFromated.toLocaleDateString())
        return dateNotFormated.split(' ')[1] // return hh:mm:ss

      return dateNotFormated.split(' ')[0].replaceAll('-', '/') // return YYYY/MM/DD
    },
    classesStatusLine: function (result) {
      if (result) return { bold: true, success: true }
      return { fail: true }
    }
  }
}
</script>

<style scoped>
.fightTable {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.fightTable thead th {
  padding: 0.3rem;
}
.fightTable tbody td {
  padding: 0.2rem 0;
}
.fightTable tbody tr {
  border: 1px solid var(--main-white-color);
}
.fightTable tbody tr:hover,
.fightTable tbody tr.selected {
  background-color: var(--main-white-color);
  color: var(--main-black-color);
}
.success {
  color: var(--main-green-color);
}
.fightTable tbody tr:hover .success,
.fightTable tbody tr.selected .success {
  color: var(--darker-green-color);
}
.fail {
  color: var(--main-orange-color);
}
.fightTable tbody tr:hover .fail,
.fightTable tbody tr.selected .fail {
  color: var(--darker-orange-color);
}

.heroCategoriesName {
  font-size: 1.1rem;
}
</style>