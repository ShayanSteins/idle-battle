<template>
  <div>
    <div class="loginDiv" v-if="!isLogged">
      <form @submit.prevent="login">
        <span class="error">{{ errorMsg }}</span>

        <label for="email">Email</label>
        <input type="email" id="email" v-model="form.email" required />

        <label for="pwd">Password</label>
        <input
          type="password"
          id="pwd"
          v-model="form.pwd"
          minlength="8"
          maxlength="18"
          required
        />
        <input type="submit" value="Sign Up" name="register" />
        <input type="submit" value="Sign In" name="signIn" />
      </form>
      <button @click="gitHubLogin">Sign In with GitHub</button>
    </div>

    <div v-if="isLogged">
      <button @click="logout">Log out</button>
      <HeroDetail v-if="user.heroes.length === 0" :p_hero="newHero"></HeroDetail>
      <div v-else>Heroes list</div>
    </div>
  </div>
</template>

<script>
import HeroDetail from './components/HeroDetail.vue'

export default {
  name: 'App',
  components: { HeroDetail },
  data() {
    return {
      isLogged: false,
      errorMsg: '',
      token: null,
      form: {
        email: '',
        pwd: '',
      },
      user: {
        idUser: null,
        heroes: [],
      },
      newHero: {
        idHero: null,
        firstName: '',
        rankLvl: 1,
        skillPoint: 12,
        health: 10,
        attack: 0,
        defense: 0,
        magik: 0,
      },
    }
  },
  beforeMount() {
    if (document.cookie) {
      this.isLogged = document.cookie
        .split(';')
        .find((a) => a.startsWith('logged='))
        .split('=')[1]
      this.getDatas()
    }
  },
  methods: {
    async login(e) {
      try {
        const response = await fetch('/classic-login', {
          headers: {
            'Content-Type': 'application/json',
            authorization:
              'Basic ' +
              btoa(`${this.form.email}:${this.form.pwd}:${e.submitter.name}`),
          },
        })
        if (!response.ok) {
          const message = await response.json()
          throw message
        }
        this.getDatas()
      } catch (err) {
        this.errorMsg = err
      }
    },
    gitHubLogin() {
      window.location = '/github-login'
    },
    async logout() {
      const response = await fetch('/logout', {
        credentials: 'same-origin', // On envoie les cookies en secure
      })
      const datas = await response.json()
      if (response.status === 200 && datas.logged === false) {
        this.token = null
        this.isLogged = false
        window.location = '/'
      }
    },
    async getDatas() {
      const response = await fetch('/init-datas', {
        credentials: 'same-origin', // On envoie les cookies en secure
      })

      const datas = await response.json()
      if (response.status === 200) {
        this.user.idUser = datas.idUser
        this.user.heroes = datas.heroes
        this.form.email = ''
        this.form.pwd = ''
        this.isLogged = true
      } else this.errorMsg = datas
    },
  },
}
</script>

<style>
</style>