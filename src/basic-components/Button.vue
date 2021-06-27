<template>
  <button :type="p_type" :name="p_name" :class="p_class" @click="$emit('click')">
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
    p_name: String,
    p_class: String
  }
}
</script>

<style scoped>
button {
  font-size: 1rem;
  padding: 0.3rem 0.6rem;
  color: var(--main-white-color);
  background-color: var(--main-black-color);
  border: solid 1px var(--main-white-color);
}
button:hover {
  filter: invert();
  cursor: pointer;
}
button:disabled {
  filter: opacity(0.5);
  background-color: var(--main-grey-color);
  cursor: default;
}
.bigBtn {
  padding: 0.4rem 0.5rem;
  font-size: 1.1rem;
}
.smallBtn {
  padding: 0;
  width: 30px;
  height: 30px;
  font-weight: bold;
}
.fightBtn {
  margin-top: 1rem;
}

@media screen and (min-width: 600px) {
  .bigBtn {
    font-size: 1.1rem;
    padding: 0.6rem 0.7em;
  }
}
</style>