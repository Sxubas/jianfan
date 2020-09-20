<template>
  <div class="navigation-container">
    <h1>Jiǎnfán 简繁</h1>
    <hr>
    <router-link
      to="/"
      class="link"
    >
      <i class="material-icons-round">home</i>
      <span class="link-text">Home</span>
    </router-link>
    <router-link
      to="/learn"
      class="link"
    >
      <i class="material-icons-round">view_carousel</i>
      <span class="link-text">Learn</span>
    </router-link>
    <router-link
      to="/practice"
      class="link"
    >
      <i class="material-icons-round">assignment_turned_in</i>
      <span class="link-text">Practice</span>
    </router-link>
    <router-link
      to="/about"
      class="link"
    >
      <i class="material-icons-round">info</i>
      <span class="link-text">About</span>
    </router-link>
  </div>
</template>

<style scoped>
.navigation-container {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 256px;
  height: 100vh;

  user-select: none;
  background: whitesmoke;
  border-right: 1px solid lightgray;
  box-shadow: -2px 0px 8px 0px gray;
}

h1 {
  align-self: center;
  font-size: 2rem;
  padding: 24px 16px;
}

hr {
  width: 100%;
  margin: 0;
}

.link {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  text-decoration: none;
  color: #2c3e50;
  background-color: transparent;
  transition: 0.24s all ease;
  width: 100%;
  padding: 8px 16px;
}

.link:hover {
  background-color: lightgray;
}

.link:active {
  background-color: rgba(65, 184, 131, 0.64);
}

.link.router-link-exact-active {
  color: #3eaf7c;
}

.link i {
  text-decoration: none;
  font-size: 2rem;
  padding-right: 8px;
}

.link-text {
  font-size: 1.4rem;
}
</style>
