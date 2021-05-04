<template>
  <div>
    <header class="center">
      <span>Another not RPG game</span>
    </header>
    <div class="content">
      <div class="loginDiv center" v-if="!isLogged">
        <form @submit.prevent="login">
          <span class="error">{{ errorMsg }}</span>
          
          <label for="email" class="notDisplayed">Email</label>
          <input type="email" class="formInput" id="email" v-model="form.email" placeholder="Email" required />        
        
          <label for="pwd" class="notDisplayed">Password</label>
          <input type="password" class="formInput" id="pwd" v-model="form.pwd" placeholder="Password" minlength="8" maxlength="18" required />        

          <div class="formButton">
            <input type="submit" class="button" value="Sign Up" name="register" />
            <input type="submit" class="button" value="Sign In" name="signIn" />
          </div>
        </form>
        <div>or</div>
        <button class="button btnImg" @click="gitHubLogin">
          <div class="img"></div>
          <span>Sign In with GitHub</span>
        </button>
      </div>

      <div v-if="isLogged">
        <div class="menu">
          <input type="button" @click="logout" value="Log out" />
        </div>
        <HeroDetail
          v-if="heroes.length === 0"
          :p_hero="newHero"
          :p_type="$env.CREATION"
          @addHero="addHero"
        ></HeroDetail>
        <HeroList 
          v-else 
          :p_list="heroes" 
          @removeHeroFromList="removeHero"
        ></HeroList>
      </div>
    </div>
  </div>
</template>

<script>
import HeroDetail from './components/HeroDetail.vue'
import HeroList from './components/HeroList.vue'

export default {
  name: 'App',
  components: { HeroDetail, HeroList },
  data () {
    return {
      isLogged: false,
      errorMsg: '',
      token: null,
      form: {
        email: '',
        pwd: '',
      },
      heroes: [],
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
  beforeMount () {
    if (document.cookie) {
      this.isLogged = document.cookie
        .split(';')
        .find((a) => a.startsWith('logged='))
        .split('=')[1]
      this.getDatas()
    }
  },
  methods: {
    async login (e) {
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
    gitHubLogin () {
      window.location = '/github-login'
    },
    async logout () {
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
    async getDatas () {
      const response = await fetch('/init-datas', {
        credentials: 'same-origin', // On envoie les cookies en secure
      })

      const datas = await response.json()
      if (response.status === 200) {
        this.heroes = datas.heroes
        this.form.email = ''
        this.form.pwd = ''
        this.isLogged = true
      } else this.errorMsg = datas
    },
    addHero (hero) {
      this.heroes.push(hero)
    },
    removeHero (idHero) {
      console.log(idHero)
      this.heroes = this.heroes.filter(a => a.idHero !== idHero)
    }
  },
}
</script>

<style>
:root {
  --content-padding: 1rem;
  --main-black-color: rgba(36, 36, 36, 1);
  --main-white-color: rgba(236, 236, 236, 1);
}

html,
body {
  margin: 0;
  height: 100vh;
  width: 100vw;
  font-family: sans-serif;
  font-size: 1rem;
  color: var(--main-white-color);
  background-color: var(--main-black-color);
}

.center {
  text-align: center;
}

header {
  padding: 1rem 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--main-white-color);
  border: var(--main-white-color) 3px dashed;
}
.content {
  padding: var(--content-padding);
  height: 80vh;
}
.subTitle {
  width: calc(100% - var(--content-padding));
  font-weight: bold;
}
.notDisplayed {
  display: none;
}
.loginDiv {
  display: flex;
  flex-direction: column;
}
.loginDiv form {
  margin: 0.6rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.loginDiv .formInput {
  width: 100%;
  box-sizing: border-box;
  padding: 0.4rem;
  margin: 0.8rem 0;
}
.formButton {
  display: flex;
  justify-content: space-between;
}
.button {
  padding: 0.4rem 0.5rem;
  color: var(--main-white-color);
  background-color: var(--main-black-color);
  border: solid 1px var(--main-white-color);
}
.button:hover {
  color: var(--main-black-color);
  background-color: var(--main-white-color);
}
.btnImg {
  display: flex;
  align-items: center;
  width: 180px;
  justify-content: space-around;
  margin: auto;
  margin-top: 1rem;
}
.btnImg .img {
  width: 25px;
  height: 25px;
  background: url("./assets/github_white.png") 0%/100% no-repeat;
}
.btnImg:hover .img {
  background: url("./assets/github.png") 0%/100% no-repeat;
}
</style>