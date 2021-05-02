<template>
  <div>
    <header>
      <span>Another not RPG game</span>
    </header>
    <div class="content">
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
        <input type="button" @click="gitHubLogin" value="Sign In with GitHub" />
      </div>

      <div v-if="isLogged">
        <div class="menu">
          <input type="button" @click="logout" value="Log out" />
        </div>
        <HeroDetail
          v-if="user.heroes.length === 0"
          :p_hero="newHero"
          @addHero="addHero"
        ></HeroDetail>
        <div v-else>Heroes list</div>
      </div>
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
    addHero(hero) {
      this.user.heroes.push(hero)
    },
  },
}
</script>

<style>
html, body {
  margin: 0;
  height: 100vh;
  font-family: sans-serif;
  font-size: 1.2rem;
  color: lightgray;
  background-color: rgb(36, 36, 36);
}
header {
  padding: 1rem 0;
  text-align: center;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  background-color: rgb(44, 88, 124);
}
.content {
  padding: 0.5rem;
}
</style>