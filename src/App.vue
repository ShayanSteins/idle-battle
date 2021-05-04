<template>
  <div>
    <header>
      <div class="title center">Another not RPG game</div>      
      <div v-if="isLogged" class="nav">
        <!-- <span id="menuButton" title="Menu"></span> -->
        <button class="menuEl center" @click="navigation($screen.DETAIL)">
          <div class="createImgMenu"></div>
          <span>CREATE</span>
        </button>
        <button class="menuEl center" @click="navigation($screen.LIST)">
          <div class="poolImgMenu"></div>
          <span>POOL</span>
        </button>
        <button class="menuEl center" @click="navigation($screen.FIGHT)">
          <div class="fightImgMenu"></div>
          <span>FIGHT !</span>
        </button>
        <!-- <ul class="menu">
          <li class="menuEl center" data-name="createMenu" @click="navigation"><div class="createImgMenu"></div><a>CREATE</a></li>
          <li class="menuEl center" data-name="poolMenu" @click="navigation"><div class="poolImgMenu"></div><a>POOL</a></li>
          <li class="menuEl center" data-name="fightMenu" @click="navigation"><div class="fightImgMenu"></div><a>FIGHT !</a></li>
        </ul> -->
      </div>
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
        <!-- <div v-if="heroes.length === 0">
          It seems you don't have any Hero in your pool... <br>
          Let's begin with create one ! <br>
          <input type="button" class="button" value="Create" @click="navigation($screen.DETAIL)" />
        </div> -->
        <HeroDetail
          v-if="displayScreen === $screen.DETAIL"
          :p_hero="newHero"
          :p_type="$env.CREATION"
          @addHero="addHero"
        ></HeroDetail>
        <HeroList 
          v-if="displayScreen === $screen.LIST"
          :p_list="heroes" 
          @removeHeroFromList="removeHero"
        ></HeroList>
        <Fight v-if="displayScreen === $screen.FIGHT"></Fight>
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
      this.displayScreen = this.$screen.LIST
    },
    removeHero (idHero) {
      console.log(idHero)
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
  /* color: var(--main-white-color); */
}
.title {
  padding: 1rem 0;
  font-size: 1.8rem;
  font-weight: bold;
  border: var(--main-white-color) 3px dashed;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/* .menu {
  display: flex;
  flex: auto;
  flex-direction: row;
  list-style: none;
  margin: 0;
  padding: 0;
  justify-content: space-between;
} */
.nav .menuEl {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--main-black-color);
  color: var(--main-white-color);
  border:none;
  border-right: 1px solid var(--main-white-color);
  padding: 0.8rem;
  width: 100%;
  cursor: pointer;
}
.nav .menuEl:last-child {
  /* border-bottom: none; */
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
.nav .menuEl .createImgMenu {
  background: url("./assets/img/add_hero_white.png") 0%/100% no-repeat;
}
.nav .menuEl .poolImgMenu {
  background: url("./assets/img/group_white.png") 0%/100% no-repeat;
}
.nav .menuEl .fightImgMenu {
  background: url("./assets/img/fight_white.png") 0%/100% no-repeat;
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
.nav span {
  text-decoration: none;
  font-size: 1.1rem;
}
/* .nav #menuButton {
  display: none;
  position: absolute;
  top: 14px;
  left: 10px;
  font-size: 3rem;
  width: 25px;
  height: 25px;
  background: url("./assets/img/menu_white.png") 0%/100% no-repeat;
} */

.content {
  padding: var(--content-padding);
  /* height: 80vh; */
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
  background: url("./assets/img/github_white.png") 0%/100% no-repeat;
}
.btnImg:hover .img {
  background: url("./assets/img/github.png") 0%/100% no-repeat;
}
</style>