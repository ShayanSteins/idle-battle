<template>
  <div>
    <header>
      <div class="title center">Another not RPG game</div>      
      <div v-if="isLogged" class="nav flex fa-i-center">
        <button class="menuEl center fa-i-center" title="Create" @click="navigation($screen.DETAIL)">
          <div class="createImgMenu"></div>
          <span>CREATE</span>
        </button>
        <button class="menuEl center fa-i-center" title="Pool" @click="navigation($screen.LIST)">
          <div class="poolImgMenu"></div>
          <span>POOL</span>
        </button>
        <button class="menuEl center fa-i-center" title="Fight !" @click="navigation($screen.FIGHT)">
          <div class="fightImgMenu"></div>
          <span>FIGHT !</span>
        </button>
        <button class="menuEl center fa-i-center" title="Log out" @click="logout">
          <div class="logout"></div>
          <span>Log out</span>
        </button>
      </div>
    </header>

    <div class="content">
      <div class="loginDiv center flex fd-col" v-if="!isLogged">
        <form @submit.prevent="login" class="flex fd-col">
          <span class="error ta-l">{{ errorMsg }}</span>
          
          <label for="email" class="notDisplayed">Email</label>
          <input type="email" class="formInput border-bl" id="email" v-model="form.email" placeholder="Email" required />        
        
          <label for="pwd" class="notDisplayed">Password</label>
          <input type="password" class="formInput border-bl" id="pwd" v-model="form.pwd" placeholder="Password" minlength="8" maxlength="18" required />        

          <div class="formButton">
            <input type="submit" class="button" value="Register" name="register" />
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
        <HeroDetail
          v-if="displayScreen === $screen.DETAIL"
          :p_hero="newHero"
          :p_type="$env.CREATION"
          :p_nbHeroes="heroes.length"
          @addHero="addHero"
        ></HeroDetail>
        <HeroList 
          v-if="displayScreen === $screen.LIST"
          :p_list="heroes" 
          @removeHeroFromList="removeHero"
          @heroesUpdate="heroesUpdate"
        ></HeroList>
        <Fight 
          v-if="displayScreen === $screen.FIGHT"
          :p_list="heroes"
          @updateHero="heroesUpdate"
        ></Fight>
      </div>
    </div>
  </div>
</template>

<script>
import HeroDetail from './components/HeroDetail.vue'
import HeroList from './components/HeroList.vue'
import Fight from './components/Fight.vue'

export default {
  name: 'App',
  components: { HeroDetail, HeroList, Fight },
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
      displayScreen: null
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
        credentials: 'same-origin',
      })

      const datas = await response.json()
      if (response.status === 200) {
        this.heroes = datas.heroes
        this.form.email = ''
        this.form.pwd = ''
        this.isLogged = true
        this.displayScreen = this.heroes.length > 0 ? this.$screen.LIST : this.$screen.DETAIL
      } else this.errorMsg = datas
    },
    addHero (hero) {
      this.heroes.push(hero)
      this.displayScreen = this.$screen.LIST
    },
    heroesUpdate (modifiedHero) {
      const heroIndex = this.heroes.findIndex(a => a.idHero === modifiedHero.idHero)
      if (heroIndex !== undefined) {
        const updateHero = Object.assign(this.heroes[heroIndex], modifiedHero)
        this.heroes[heroIndex] = { ...updateHero }
      }
    },
    removeHero (idHero) {
      this.heroes = this.heroes.filter(a => a.idHero !== idHero)
    },
    navigation (screen) {
      this.displayScreen = screen
    }
  },
}
</script>

<style>
:root {
  --content-padding: 1rem;
  --main-black-color: rgba(36, 36, 36, 1);
  --main-white-color: rgba(236, 236, 236, 1);
  --main-red-color: rgba(255, 36, 36, 1);
}

@font-face {
  font-family: "Gameplay";
  src: url("./assets/Gameplay.ttf") format("truetype");
}

html,
body {
  margin: 0;
  /* height: 100vh;
  width: 100vw; */
  font-family: sans-serif;
  font-size: 1rem;
  color: var(--main-white-color);
  background-color: var(--main-black-color);
}

.center {
  text-align: center;
}
.ta-l {
  text-align: left;
}
.border-bl {
  border: none;
  border-left: 2px solid var(--main-white-color);
  border-bottom: 2px solid var(--main-white-color);
}
.error {
  color: var(--main-red-color);
}
.flex {
  display: flex;
}
.fd-col {
  flex-direction: column;
}
.fa-i-center {
  align-items: center;
}

input {
  background-color: var(--main-black-color);
  color: var(--main-white-color);
}

.title {
  padding: 1rem 0;
  font-family: "Gameplay";
  font-size: 1.8rem;
  border: var(--main-white-color) 3px dashed;
}
.subTitle {
  font-family: "Gameplay";
  width: calc(100% - var(--content-padding));
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.nav {
  justify-content: space-between;
}
.nav .menuEl {
  display: flex;
  justify-content: center;
  background-color: var(--main-black-color);
  color: var(--main-white-color);
  border: none;
  border-right: 1px solid var(--main-white-color);
  padding: 0.8rem;
  width: 100%;
  cursor: pointer;
}
.nav .menuEl:last-child {
  border-right: none;
}
.nav .menuEl:hover {
  background-color: var(--main-white-color);
  color: var(--main-black-color);
}
.nav .menuEl div {
  width: 22px;
  height: 22px;
  margin-right: 0.4rem;
}
.nav .menuEl span {
  display: none;
}
.nav .menuEl .createImgMenu {
  background: url("./assets/img/add_hero_white.png") 0%/100% no-repeat;
}
.nav .menuEl .poolImgMenu {
  background: url("./assets/img/group_white.png") 0%/100% no-repeat;
}
.nav .menuEl .fightImgMenu {
  background: url("./assets/img/fight_white.png") 0%/100% no-repeat;
}
.nav .menuEl .logout {
  background: url("./assets/img/logout_white.png") 0%/100% no-repeat;
}
.nav .menuEl:hover .createImgMenu {
  background: url("./assets/img/add_hero_black.png") 0%/100% no-repeat;
}
.nav .menuEl:hover .poolImgMenu {
  background: url("./assets/img/group_black.png") 0%/100% no-repeat;
}
.nav .menuEl:hover .fightImgMenu {
  background: url("./assets/img/fight_black.png") 0%/100% no-repeat;
}
.nav .menuEl:hover .logout {
  background: url("./assets/img/logout_black.png") 0%/100% no-repeat;
}
.nav span {
  text-decoration: none;
  font-size: 1.1rem;
}

.content {
  padding: var(--content-padding);
}
.notDisplayed {
  display: none;
}
.loginDiv form {
  margin: 0.6rem;
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
  justify-content: space-evenly;
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
  justify-content: space-around;
  margin: auto;
  margin-top: 1rem;
}
.button span {
  margin-left: 0.6rem;
}
.btnImg .img {
  width: 25px;
  height: 25px;
  background: url("./assets/img/github_white.png") 0%/100% no-repeat;
}
.btnImg:hover .img {
  background: url("./assets/img/github.png") 0%/100% no-repeat;
}

@media screen and (min-width: 600px) {
  html,
  body {
    font-size: 1.1rem;
  }

  .loginDiv {
    max-width: 600px;
    margin: auto;
  }

  .button {
    font-size: 1.1rem;
    padding: 0.6rem 0.7em;
  }

  .nav .menuEl span {
    display: block;
  }
}
</style>