<template>
  <div>
    <div v-for="turn in p_fight.turns" :key="turn.idTurn">
      <div>Turn n°{{ turn.turnNumber }}</div>
      <div class="turnA">
        <div v-if="turn.attackHeroA === 0 && turn.loosedHealthHeroB === 0">
          <div>{{ p_heroName }} missed his attack</div>
        </div>
        <div v-else>
          <div>{{ p_heroName }} attacked with {{ turn.attackHeroA }}</div>
          <div>{{ p_fight.opponentName }} loosed {{ turn.loosedHealthHeroB }} health point(s) </div>
        </div>
      </div>
      <div class="turnB">
        <div v-if="turn.attackHeroB === 0 && turn.loosedHealthHeroA === 0">
          <div>{{ p_fight.opponentName }} missed his attack</div>
        </div>
        <div v-else-if="turn.attackHeroB !== null && turn.loosedHealthHeroA !== null ">
          <div>{{ p_fight.opponentName }} attacked with {{ turn.attackHeroB }}</div>
          <div>{{ p_heroName }} loosed {{ turn.loosedHealthHeroA }} health point(s) </div>
        </div>
      </div>
    </div>

    <div v-if="p_fight.result === true">YOU WIN</div>
    <div v-else>YOU LOOSE</div>
  </div>
</template>

<script>
export default {
  name: 'FightWorkflow',
  props: {
    p_fight: Object,
    p_heroName: String
  }
}
</script>

<style scoped>
  .reportFight {
    width: -webkit-fill-available;
  }
  .turn {
    font-weight: bold;
    display: block;
    font-size: 1.2rem;
    margin-top: 1rem;
  }
  .point {
    font-weight: bold;
    color: var(--main-green-color);
  }
</style>