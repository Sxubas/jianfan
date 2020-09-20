<template>
  <div class="login-container">
    <h1>Jiǎnfán 简繁</h1>
    <span>Learn chinese characters from both writing systems (simplified and traditional)</span>
    <div class="sign-in-methods-container">
      <div class="sign-in-method email">
        <h2>Sign in</h2>
        <form @submit.prevent="login">
          <span>Email</span>
          <input type="text">
          <span>Password</span>
          <input type="password">
          <button>Sign in</button>
        </form>
      </div>
      <div class="sign-in-method anonymous">
        <h2>First time?</h2>
        <button @click="anonymousSignIn">
          Get started!
        </button>
        <span>You can register later. No worries, we will keep all your progress</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useRouter } from 'vue-router';
import firebase from '@/firebase';
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
  setup() {
    const router = useRouter();

    onMounted(() => {
      if (firebase.auth().currentUser !== null) {
        router.push({ name: 'Home' });
      }
    });

    const login = () => {
      console.log('not yet :c');
    };

    const anonymousSignIn = async () => {
      try {
        await firebase.auth().signInAnonymously();
        router.push({ name: 'Home' });
      } catch (error) {
        console.error('Error logging in anonymously:', error);
      }
    };

    return { login, router, anonymousSignIn };
  },
});
</script>

<style>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.sign-in-methods-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}

.sign-in-method {
  margin: 8px 32px;
  flex: 1;
}

.sign-in-methods-container .email, .sign-in-methods-container form {
  display: flex;
  flex-direction: column;
}

.sign-in-methods-container .anonymous {
  display: flex;
  flex-direction: column;
}
</style>
