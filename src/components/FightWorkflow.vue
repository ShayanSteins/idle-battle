<template>
  <div>
    <div class="vsDiv center"><span>{{ p_heroName }}</span> VS <span>{{ p_fight.opponentName }}</span></div>

    <div v-for="turn in p_fight.turns" :key="turn.idTurn">
      <div class="turn">Turn n°{{ turn.turnNumber }}</div>
      <div class="turnA subTurn italic">
        <div v-if="turn.attackHeroA === 0 && turn.loosedHealthHeroB === 0">
          <div class="missed">{{ p_heroName }} missed his attack</div>
        </div>
        <div v-else>
          <div>{{ p_heroName }} attacked with <span class="green bold">{{ turn.attackHeroA }}</span></div>
          <div>{{ p_fight.opponentName }} loosed <span class="green bold">{{ turn.loosedHealthHeroB }}</span> health point(s)</div>
        </div>
      </div>
      <div class="turnB subTurn italic">
        <div v-if="turn.attackHeroB === 0 && turn.loosedHealthHeroA === 0">
          <div class="missed">{{ p_fight.opponentName }} missed his attack</div>
        </div>
        <div v-else-if="turn.attackHeroB !== null && turn.loosedHealthHeroA !== null ">
          <div>{{ p_fight.opponentName }} attacked with <span class="orange bold">{{ turn.attackHeroB }}</span></div>
          <div>{{ p_heroName }} loosed <span class="orange bold">{{ turn.loosedHealthHeroA }}</span> health point(s)</div>
        </div>
      </div>
    </div>

    <div class="center bold resultFight" :class="p_fight.result ? 'green' : 'orange'">
      <span v-if="p_fight.result === 1">YOU WIN !</span>
      <span v-else>YOU LOOSE !</span>
    </div>
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
.vsDiv {
  font-size: 1.2rem;
}
.turn {
  font-weight: bold;
  display: block;
  margin: 1rem 0 0.3rem 0;
}
.subTurn {
  margin-bottom: 0.3rem;
  margin-left: 1rem;
}
.orange {
  color: var(--main-orange-color);
}
.missed {
  color: var(--main-yellow-color);
}
.resultFight {  
  font-family: "Gameplay";
  font-size: 1.5rem;
  margin: 1rem 0;
}
</style>