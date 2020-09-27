<template>
  <div class="app-container">
    <router-view v-if="!user" />
    <template v-else>
      <Navigation />
      <div class="view-container">
        <router-view />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import firebase from '@/firebase';
import Navigation from '@/components/Navigation.vue';

export default defineComponent({
  components: {
    Navigation,
  },
  setup() {
    const router = useRouter();
    const user = ref(firebase.auth().currentUser);

    firebase.auth().onAuthStateChanged((newUser) => {
      user.value = newUser;

      if (newUser === null) {
        router.push({ name: 'Login' });
      }
    });

    return { user };
  },
});
</script>

<style>
.app-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: 1.24rem;
  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;

  min-height: 100vh;
}

.app-container * {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
}

h1,h2,h3,h4,h5,h6 {
  margin: 0;
}

.view-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  flex: 1;
  margin-left: 256px; /* sidebar width */
  min-height: 100vh;
}

p {
  margin: 16px 0;
}
</style>
