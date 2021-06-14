<template>
  <div>
    <div class="subTitle center">Heroes list</div>
    <!-- <div class="flex"> -->
      <div v-if="p_list.length === 0" class="emptyList center">It seems you don't have any Hero in your pool...</div>
      <div v-else class="heroesContainer flex">
        <div 
        v-for="hero in p_list" 
        :key="hero.idHero" 
        :class="{ selected: selectedHero && selectedHero.idHero === hero.idHero }" 
        class="heroContainer center flex fd-col" 
        @click="selectHero(hero)">
          <span class="heroName bold">{{ hero.firstName }}</span>
          <span class="small italic">Rank {{ hero.rankLvl }}</span>
        </div>
      </div>
    <!-- </div> -->

        <div class="center separator">- - - - - - - - - - - - - - - - - - - - -</div>
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
  justify-content: space-evenly;
}
.heroContainer {
  border: solid 1px var(--main-white-color);
  background-color: var(--main-black-color);
  justify-content: center;
  padding: 0.5rem 1rem;
  margin-bottom: 0.6rem;
  width: calc(45% - 2rem);
  cursor: pointer;
}
.heroContainer:hover, .heroContainer.selected {
  filter: invert();
}
.heroName {
  overflow: hidden;
  text-overflow: ellipsis;
}
@media screen and (min-width: 600px) {
  .heroContainer {
    width: calc(30% - 2rem);
  }
}
</style>