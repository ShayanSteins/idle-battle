<template>
  <div>
    <header>
      <div v-if="!isLogged" class="title center">Another not RPG game</div>      
      <div v-if="isLogged" class="nav flex fa-i-center fj-c-between">        
        <ButtonImage p_class="menuEl center fa-i-center withText" title="Create" p_value="CREATE" 
          :p_img="$images.add_hero"
          @click="navigation($screen.DETAIL)"
         ></ButtonImage>
         <ButtonImage p_class="menuEl center fa-i-center withText"  title="Pool" p_value="POOL" 
          :p_img="$images.pool"
          @click="navigation($screen.LIST)"
         ></ButtonImage>
         <ButtonImage p_class="menuEl center fa-i-center withText" title="Fight !" p_value="FIGHT !" 
          :p_img="$images.fight"
          @click="navigation($screen.FIGHT)"
         ></ButtonImage>
         <ButtonImage p_class="menuEl center fa-i-center withText" title="Log out" p_value="Log out" 
          :p_img="$images.logout"
          @click="logout"
         ></ButtonImage>
      </div>
    </header>

    <div class="content">
      <span class="error left">{{ errorMsg }}</span>
      <div class="loginDiv center flex fd-col" v-if="!isLogged">
        <form @submit.prevent="login" class="flex fd-col">
          
          <label for="email" class="notDisplayed">Email</label>
          <input type="email" class="formInput border-bl" id="email" v-model="form.email" placeholder="Email" required />        
        
          <label for="pwd" class="notDisplayed">Password</label>
          <input type="password" class="formInput border-bl" id="pwd" v-model="form.pwd" placeholder="Password" minlength="8" maxlength="18" required />        

          <div class="formButton">
            <Button p_type="submit" p_class="bigBtn" p_value="Register" p_name="register"></Button>
            <Button p_type="submit" p_class="bigBtn" p_value="Sign In" p_name="signIn"></Button>
          </div>
        </form>
        <div>or</div>
        <ButtonImage p_class="withText" p_value="Sign In with GitHub" :p_img="$images.github" @click="gitHubLogin"></ButtonImage>
      </div>

      <div v-if="isLogged" class="tabDiv">
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
import Button from '~/basic-components/Button.vue'
import ButtonImage from '~/basic-components/ButtonImage.vue'
import HeroDetail from '~/components/HeroDetail.vue'
import HeroList from '~/components/HeroList.vue'
import Fight from '~/components/Fight.vue'

export default {
  name: 'App',
  components: { Button, ButtonImage, HeroDetail, HeroList, Fight },
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
        fights: []
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
        credentials: 'same-origin',
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
        this.errorMsg = ''
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
  --main-grey-color: rgba(88, 88, 88, 1);
  --main-white-color: rgba(236, 236, 236, 1);
  --main-red-color: rgba(255, 36, 36, 1);
  --main-green-color: rgba(72, 169, 101, 1);
  --darker-green-color: rgba(5, 115, 50, 1);
  --main-orange-color: rgba(255, 147, 95, 1);
  --darker-orange-color: rgba(139, 47, 2, 1);
  --main-yellow-color: rgba(255, 198, 95, 1);
}

@font-face {
  font-family: "Gameplay";
  src: url("./assets/Gameplay.ttf") format("truetype");
}

html,
body {
  margin: 0;
  /* width: 100vw; */
  font-family: sans-serif;
  font-size: 1rem;
  color: var(--main-white-color);
  background-color: var(--main-black-color);
}

.italic {
  font-style: italic;
}
.bold {
  font-weight: bold;
}
.small {
  font-size: 0.9rem;
}
.center {
  text-align: center;
}
.left {
  text-align: left;
}
.right {
  text-align: right;
}
.border-bl {
  border: none;
  border-left: 2px solid var(--main-white-color);
  border-bottom: 2px solid var(--main-white-color);
}
.flex {
  display: flex;
}
.f-grow {
  flex: 2 1 auto;
}
.fd-col {
  flex-direction: column;
}
.fj-c-between {
  justify-content: space-between;
}
.fa-i-center {
  align-items: center;
}
.error {
  color: var(--main-red-color);
}
.green {
  color: var(--main-green-color);
}

.separator {
  margin: 1rem;
}

input {
  background-color: var(--main-black-color);
  color: var(--main-white-color);
}

.title {
  padding: 1rem;
  font-family: "Gameplay";
  font-size: 1.8rem;
  border: var(--main-white-color) 3px dashed;
}
.subTitle {
  font-family: "Gameplay";
  margin-bottom: 2rem;
  font-size: 1.3rem;
}

.nav {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 999;
}
.nav .menuEl {
  justify-content: center;
  border: none;
  border-bottom: 1px solid var(--main-white-color);
  border-right: 1px solid var(--main-white-color);
  padding: 0.8rem;
  width: 100%;
  margin: 0;
}
.nav .menuEl:last-child {
  border-right: none;
}
.nav .menuEl span {
  display: none;
}

.content {
  padding: var(--content-padding);
  margin-top: 4rem;
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

@media screen and (min-width: 600px) {
  html,
  body {
    font-size: 1.1rem;
  }

  .loginDiv {
    max-width: 600px;
    margin: auto;
  }

  .content {
    max-width: 600px;
    margin: auto;
    margin-top: 4rem;
  }

  .nav .menuEl span {
    display: block;
  }
}
</style>