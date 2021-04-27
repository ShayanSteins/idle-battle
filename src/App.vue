<template>
  <div>
    <div class="loginDiv" v-if="!isLogged">
      <form @submit.prevent>
        <span class="error">{{ errorMsg }}</span>
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          v-model="email"
          required
        />
        <label for="pwd">Password</label>
        <input
          type="password"
          id="pwd"
          v-model="userPwd"
          minlength="8"
          maxlength="18"
          required
        />
        <button @click="signUp">Sign Up</button>
        <button @click="classicSignIn">Sign In</button>
      </form>
      <button @click="gitHubSignIn">Sign In with GitHub</button>
    </div>

    <div v-if="isLogged">
      Hello !
      <button @click="logout">Log out</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      isLogged: false,
      errorMsg: "",
      token: null,
      email: "",
      userPwd: "",
    }
  },
  beforeMount() {
    this.token = new URL(document.location).searchParams.get("access-token")
    if (this.token === null) {
      this.isLogged = false
    } else {
      this.isLogged = true
    }
  },
  methods: {
    signUp: function () {
      fetch("/register", {
        headers: {
          "Content-Type": "application/json",
          authorization: "Basic " + btoa(`${this.email}:${this.userPwd}`),
        },
      })
        .then((response) => {
          return response.json()
        })
        .then((datas) => {
          console.log(datas)
        })
        .catch((err) => {
          throw err
        })
    },
    gitHubSignIn: function () {
      window.location = "/github-login"
    },
    classicSignIn: function () {
      console.log("signin classic")
    },
    logout: function () {
      this.token = null
      window.location = "/"
    },
  },
}
</script>

<style>
</style>