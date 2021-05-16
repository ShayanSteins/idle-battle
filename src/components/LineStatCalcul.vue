<template>
  <div>
    <input type="button" @click="calculStat('less')" value="-" />
    <label class="green">{{ newStatValue }}</label>
    <input type="button" @click="calculStat('more')" value="+" :disabled="p_maxReached" />
    <label>(+{{ usedSkillPoint }})</label>
  </div>
</template>

<script>
export default {
  name: 'LineStatCalcul',
  data () {
    return {
      newStatValue: this.p_statValue,
      usedSkillPoint: 0
    }
  },
  // computed: {
  //   newStatValue: {
  //     get: function () {
  //       return this.p_statValue
  //     },
  //     set: function (val) {
  //       this.newStatValue = val
  //     }
  //   }
  // },
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
.green {
  color: rgb(0, 128, 49);
  font-weight: bold;
}
</style>