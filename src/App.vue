<template>
  <div>
    <div class="loginDiv" v-if="!isLogged">
      <form>
        <span class="error">{{ errorMsg }}</span>
        <label for="account">Account</label>
        <input type="text" id="account" />
        <label for="pwd">Password</label>
        <input type="password" id="pwd" />
        <button>Sign Up</button>
        <button>Sign In</button>
      </form>
      <button @click="gitHubSignIn">Sign In with GitHub</button>
    </div>

    <div v-if="isLogged">Hello !</div>
  </div>
</template>

<script>
export default {
  name: "App",
  datas() {
    return {
      isLogged: false,
      errorMsg: "",
      token: null,
    }
  },
  beforeMount() {
    this.token = new URL(document.location).searchParams.get("access-token")
    if (this.token === null) this.isLogged = false
    else this.isLogged = true
  },
  methods: {
    gitHubSignIn: function () {
      window.location = "/githublogin"
    },
    classicSignIn: function () {
    },
  },
}
</script>

<style>
</style>