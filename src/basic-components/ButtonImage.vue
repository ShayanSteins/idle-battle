<template>
<Button class="imageButton" :class="p_class" p_type="button" :p_value="p_value" @click="$emit('click')">
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
    p_value: String,
    p_img: String,
    p_class: {
      type: String,
      default: 'btnIcon'
    }
  }
}
</script>

<style scoped>
.imageButton {
  display: flex;
  align-items: center;
  justify-content: space-around;
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

@media screen and (min-width: 600px) {
  .withText img {
    margin-right: 0.6rem;
  }
}
</style>