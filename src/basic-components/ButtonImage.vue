<template>
<Button class="imageButton flex align-item-center" :class="p_class" p_type="button" :p_value="p_value" @click="$emit('click')">
  <template v-slot:content>
    <img :src="p_img" alt="">
  </template>
</Button>
</template>

<script>
import Button from '~/basic-components/Button.vue'

export default {
  name: "ButtonImage",
  components: { Button },
  props: {
    p_img: {
      type: String,
      required: true
    },
    p_class: {
      type: String,
      default: 'btnIcon'
    },
    p_value: {
      type: String,
      required: false
    }
  }
}
</script>

<style scoped>
.imageButton {
  margin: auto;
  margin-top: 1rem;
}
.imageButton img {
  width: 25px;
  height: 25px;
}
.btnIcon {
  padding: 0.4rem;
  margin: 0;
}
.withText img {
  margin-right: 0.6rem;
}
</style>