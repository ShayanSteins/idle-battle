export const Store = {
  stats: [{
    name: 'health',
    displayName: 'Health',
    type: 'increment'
  }, {
    name: 'attack',
    displayName: 'Attack',
    type: 'divideBy5'
  }, {
    name: 'defense',
    displayName: 'Defense',
    type: 'divideBy5'
  }, {
    name: 'magik',
    displayName: 'Magik',
    type: 'divideBy5'
  }],

  env: {
    CREATION: 0,
    EDITION: 1
  }
}

Store.install = function (Vue, option) {
  Vue.prototype.$stats = Store.stats
  Vue.prototype.$env = Store.env
}
