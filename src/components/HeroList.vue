<template>
  <div>
    <div class="subTitle center">Heroes list</div>
    <div class="heroesContainer flex">
      <div v-if="p_list.length === 0" class="center">It seems you don't have any Hero in your pool...</div>
      <div v-for="hero in p_list" :key="hero.idHero" class="heroContainer center flex fd-col" @click="selectHero(hero)">
        <span class="heroName">{{ hero.firstName }}</span>
        <span class="small italic">Rank n°{{ hero.rankLvl }}</span>
      </div>
    </div>

    <div class="center">------------------------------------------------</div>
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
import HeroDetail from './HeroDetail.vue'
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
.heroesContainer {
  /* height: 15rem; */
  flex-wrap: wrap;
}
.heroContainer {
  border: solid 1px var(--main-white-color);
  justify-content: center;
  padding: 0.5rem 3rem;
  cursor: pointer;
}
.heroContainer:hover {
  background-color: #464357;
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