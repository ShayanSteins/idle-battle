<template>
  <div>
    <div class="loginDiv" v-if="!isLogged">
      <form @submit.prevent>
        <span class="error">{{ errorMsg }}</span>

        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required />

        <label for="pwd">Password</label>
        <input
          type="password"
          id="pwd"
          v-model="userPwd"
          minlength="8"
          maxlength="18"
          required
        />

        <button @click="login('register')">Sign Up</button>
        <button @click="login('signIn')">Sign In</button>
      </form>
      <button @click="gitHubLogin">Sign In with GitHub</button>
    </div>

    <div v-if="isLogged">
      Hello !
      <button @click="logout">Log out</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isLogged: false,
      errorMsg: '',
      token: null,
      email: '',
      userPwd: '',
    }
  },
  beforeMount() {
    this.token = new URL(document.location).searchParams.get('access-token')
    if (this.token === null) {
      this.isLogged = false
    } else {
      this.isLogged = true
    }
  },
  methods: {
    login: function (type) {
      fetch('/classic-login', {
        headers: {
          'Content-Type': 'application/json',
          authorization:
            'Basic ' + btoa(`${this.email}:${this.userPwd}:${type}`),
        },
      })
        .then((response) => {
          return response.json()
        })
        .then((datas) => {
          if (datas.includes('Conflict') || datas.includes('Bad request')) {
            this.errorMsg = datas
          } else {
            this.errorMsg = ''
            window.location = `/index.html?access-token=${datas}`
          }
        })
        .catch((err) => {
          this.errorMsg = err
        })
    },
    gitHubLogin: function () {
      window.location = '/github-login'
    },
    logout: function () {
      this.token = null
      window.location = '/'
    },
  },
}
</script>

<style>
</style>