<template>
  <div class="variables">
    <Button p_type="button" p_class="smallBtn" p_value="-" @click="calculStat('less')"></Button>
    <!-- <input type="button" @click="calculStat('less')" value="-" /> -->
    <span class="green statVal">{{ newStatValue }}</span>
    <Button p_type="button" p_class="smallBtn" p_value="+" :disabled="p_maxReached" @click="calculStat('more')"></Button>
    <!-- <input type="button" @click="calculStat('more')" value="+" :disabled="p_maxReached" /> -->
    <span>(+{{ usedSkillPoint }})</span>
  </div>
</template>

<script>
import Button from '~/basic-components/Button.vue'

export default {
  name: 'LineStatCalcul',
  components: { Button },
  data () {
    return {
      newStatValue: this.p_statValue,
      usedSkillPoint: 0
    }
  },
  props: {
    p_statName: String,
    p_statType: String,
    p_statValue: Number,
    p_maxReached: Boolean
  },
  methods: {
    calculStat (type) {
      if (type === 'more') {
        this.newStatValue++
      } else {
        this.newStatValue =
          this.newStatValue - 1 >= this.p_statValue
            ? this.newStatValue - 1
            : this.newStatValue
      }

      if (this.p_statValue < this.newStatValue) {
        if (this.p_statType === 'increment') {
          this.usedSkillPoint = this.newStatValue - this.p_statValue
        } else if (this.p_statType === 'divideBy5') {
          if (type === 'more')
            this.usedSkillPoint += Math.ceil(this.newStatValue / 5)
          else this.usedSkillPoint -= Math.ceil((this.newStatValue + 1) / 5)
        }
      } else {
        this.usedSkillPoint = 0
      }
      this.$emit('changeSkill', this.usedSkillPoint, this.p_statName, this.newStatValue)
    }
  }
}
</script>

<style scoped>
.variables {
  display: grid;
  grid-template-columns: repeat(2, 1fr 2fr);
  grid-column-gap: 10px;
  text-align: center;
  align-items: center;
}
.statVal {
  font-weight: bold;
}
</style>