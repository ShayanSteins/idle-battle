<template>
  <div>
    <div class="subTitle center">Heroes list</div>
    <div class="flex">
      <div v-if="p_list.length === 0" class="emptyList center">It seems you don't have any Hero in your pool...</div>
      <div v-else class="heroesContainer flex">
        <div v-for="hero in p_list" :key="hero.idHero" class="heroContainer center flex fd-col" @click="selectHero(hero)">
          <span class="heroName">{{ hero.firstName }}</span>
          <span class="small italic">Rank n°{{ hero.rankLvl }}</span>
        </div>
        <div class="center">------------------------------------------------</div>
      </div>
    </div>

    <HeroDetail 
      v-if="selectedHero"
      :p_hero="selectedHero" 
      :p_type="$env.EDITION"
      @addHero="editHero"
      @removeHero="removeHero" 
    ></HeroDetail>
  </div>
</template>

<script>
import HeroDetail from '~/components/HeroDetail.vue'
export default {
  name: 'HeroList',
  components: { HeroDetail },
  data () {
    return {
      selectedHero: null
    }
  },
  props: {
    p_list: Array,
  },
  methods: {
    selectHero (hero) {
      this.selectedHero = hero
    },
    removeHero (idHero) {
      this.selectedHero = null
      this.$emit('removeHeroFromList', idHero)
    },
    editHero (hero) {
      this.selectedHero = hero
      this.$emit('heroesUpdate', hero)
    }
  },
}
</script>

<style scoped>
.emptyList {
  margin: auto;
}
.heroesContainer {
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: flex-start;
  height: 45vh;
}
.heroContainer {
  border: solid 1px var(--main-white-color);
  background-color: var(--main-black-color);
  justify-content: center;
  padding: 0.5rem 3rem;
  cursor: pointer;
}
.heroContainer:hover {
  /* background-color: #464357; */
  filter: invert();
}
.heroName {
  font-weight: bold;
}
@media screen and (min-width: 600px) {
  .heroesContainer {
    height: 12rem;
  }
}
</style>