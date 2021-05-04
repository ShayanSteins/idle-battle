<template>
  <div>
    <div class="subTitle center">Heroes list</div>

    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="hero in p_list" :key="hero.idHero" @click="selectHero(hero)">
          <td>{{ hero.rankLvl }}</td>
          <td>{{ hero.firstName }}</td>
        </tr>
        <tr v-if="p_list.length === 0" class="center"><td colspan="2">It seems you don't have any Hero in your pool...</td></tr>
      </tbody>
    </table>

    <div>------------------------------------------------</div>
    <HeroDetail 
      v-if="selectedHero"
      :p_hero="selectedHero" 
      :p_type="$env.EDITION"
      @removeHero="removeHero" 
    ></HeroDetail>
  </div>
</template>

<script>
import HeroDetail from './HeroDetail.vue'
export default {
  name: 'HeroList',
  components: { HeroDetail },
  data() {
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
    }
  },
}
</script>

<style scoped>
table {
  border: lightgray dashed 1px;
  width: 100%;
}
tr {
  border: lightgray dashed 1px;
}
tr:hover {
  background-color: #464357;
}
</style>