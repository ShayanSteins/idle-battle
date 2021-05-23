<template>
  <button :type="p_type" :name="p_name" @click="$emit('click')">
    <slot name="content"></slot>
    <span>{{ p_value }}</span>
  </button>
</template>

<script>
export default {
  name: "Button",
  props: {
    p_type: String,
    p_value: String,
    p_name: String
  }
}
</script>

<style scoped>
button {
  padding: 0.4rem 0.5rem;
  color: var(--main-white-color);
  background-color: var(--main-black-color);
  border: solid 1px var(--main-white-color);
}
button:hover {
  filter: invert();
  cursor: pointer;
}

@media screen and (min-width: 600px) {
  button {
    font-size: 1.1rem;
    padding: 0.6rem 0.7em;
  }
}
</style>