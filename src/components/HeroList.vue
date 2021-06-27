<template>
  <div>
    <div class="subTitle center">
      <Button p_type="button" class="iconHelp bold" p_value="?" @click="openPoolDocumentation"></Button>
      <span>Heroes list</span>
    </div>

    <div v-if="p_list.length === 0" class="emptyList center">It seems you don't have any Hero in your pool...</div>
    <div v-else class="heroesContainer flex justify-evenly">
      <div 
      v-for="hero in p_list" 
      :key="hero.idHero" 
      :class="{ selected: selectedHero && selectedHero.idHero === hero.idHero }" 
      class="heroContainer justify-center center flex fd-col" 
      @click="selectHero(hero)">
        <span class="heroName bold">{{ hero.firstName }}</span>
        <span class="small italic">Rank {{ hero.rankLvl }}</span>
      </div>
    </div>

    <div class="center separator">- - - - - - - - - - - - - - - - - - - - -</div>

    <HeroDetail 
      v-if="selectedHero"
      :p_hero="selectedHero" 
      :p_type="$mode.EDITION"
      @addHero="editHero"
      @removeHero="removeHero" 
    ></HeroDetail>
  </div>
</template>

<script>
import Button from '~/basic-components/Button.vue'
import HeroDetail from '~/components/HeroDetail.vue'

export default {
  name: 'HeroList',
  components: { Button, HeroDetail },
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
    },
    openPoolDocumentation () {
      window.open('https://github.com/ShayanSteins/idle-battle#pool')
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
}
.heroContainer {
  border: solid 1px var(--main-white-color);
  background-color: var(--main-black-color);
  padding: 0.5rem 1rem;
  margin-bottom: 0.6rem;
  width: calc(45% - 2rem);
  cursor: pointer;
}
.heroContainer:hover,
.heroContainer.selected {
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