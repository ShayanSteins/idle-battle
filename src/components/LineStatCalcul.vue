<template>
  <div>
    <label>{{ p_stat.name }} :</label>
    <label>{{ p_stat.value }}</label>
    <button @click="calculStat('less')">-</button>
    <label>{{ newStat }}</label>
    <button @click="calculStat('more')" :disabled="p_maxReached">+</button>
    <label class="green">(+{{ usedSkillPoint }})</label>
  </div>
</template>

<script>
export default {
  name: 'LineStatCalcul',
  data() {
    return {
      newStat: this.p_stat.value,
      usedSkillPoint: 0,
    }
  },
  props: {
    p_stat: Object,
    p_maxReached: Boolean
  },
  methods: {
    calculStat(type) {
      if (type === 'more') {
        this.newStat++
      } else {
        this.newStat =
          this.newStat - 1 >= this.p_stat.value
            ? this.newStat - 1
            : this.newStat
      }

      if (this.p_stat.value < this.newStat) {
        if (this.p_stat.type === 'increment') {
          this.usedSkillPoint = this.newStat - this.p_stat.value
        } else if (this.p_stat.type === 'divideBy5') {
          if (type === 'more') this.usedSkillPoint += Math.ceil(this.newStat / 5)
          else this.usedSkillPoint -= Math.ceil((this.newStat + 1) / 5)
        }
      } else {
        this.usedSkillPoint = 0
      }
      this.$emit('changeSkill', {usedSkill: this.usedSkillPoint, statName: this.p_stat.name})
    },
  },
}
</script>

<style scoped>
.green {
  color: rgb(0, 128, 49);
  font-weight: bold;
}
</style>