<template>
  <div class="welcome-container">
    <h2>你好！</h2>
    <p>
      Welcome to Jiǎnfán!
    </p>
    <p>
      Which writing system do you want to learn?
    </p>
    <div class="writing-systems-container">
      <div
        :class="['writing-system', {selected: selectedWritingSystem === 'traditional'}]"
        @click="selectWritingSystem('traditional')"
      >
        <div class="writing-system-content">
          <span class="helper">I want to learn</span>
          <span class="main">Traditional Chinese</span>
        </div>
        <span class="hanzi">繁體</span>
      </div>
      <div
        :class="['writing-system', {selected: selectedWritingSystem === 'simplified'}]"
        @click="selectWritingSystem('simplified')"
      >
        <div class="writing-system-content">
          <span class="helper">I want to learn</span>
          <span class="main">Simplified Chinese</span>
        </div>
        <span class="hanzi">简体</span>
      </div>
    </div>
    <button
      v-if="selectedWritingSystem"
      @click="nextStep"
    >
      Continue
      <i class="material-icons-round">navigate_next</i>
    </button>
    <span
      v-else
      class="button-placeholder"
    >Please click on a writing system to continue</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import firebase from '@/firebase';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const selectedWritingSystem = ref('');
    const selectWritingSystem = (writingSystem: string) => {
      selectedWritingSystem.value = writingSystem;
    };

    const router = useRouter();
    const nextStep = async () => {
      try {
        const user = firebase.auth().currentUser;
        if (user === null) {
          router.push({ name: 'Login' });
          return;
        }

        await firebase.firestore().doc(`users/${user.uid}`).set({ learning: selectedWritingSystem.value });
        router.push({
          name: 'Enter Known Characters',
          params: { learning: selectedWritingSystem.value },
        });
      } catch (error) {
        console.error('Error while saving learning setting:', error);
      }
    };

    return { selectedWritingSystem, selectWritingSystem, nextStep };
  },
});
</script>

<style scoped>
.welcome-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 16px;
}

h2 {
  font-size: 4rem;
}

.writing-systems-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
}

.writing-system {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-right: 16px;

  border: 1px solid gray;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  user-select: none;

  transition: 0.24s all ease;
}

.writing-system:hover {
  background-color: lightgray;
}

.selected.writing-system {
  background-color: #41b883;
}

.writing-system .hanzi {
  font-size: 3.2rem;
  font-weight: bold;
}

.writing-system-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.writing-system-content .helper {
  font-size: 1rem;
}

.writing-system-content .main {
  font-weight: bold;
  font-size: 1.24rem;
}

button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border: none;
  padding: 8px 16px;
  font-size: 1.24rem;
  border-radius: 8px;
  color: #41b883;
  background: whitesmoke;
  cursor: pointer;
  transition: 0.24s all ease;
}

button:hover {
  background-color: rgb(226, 226, 226);
}

button:active {
  background-color: rgb(211, 211, 211);
}

button i {
  padding-top: 4px;
}

.button-placeholder {
  color: gray
}
</style>
