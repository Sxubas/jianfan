<template>
  <div class="collection-view-container">
    <div class="header-container">
      <h1>Collection</h1>
      <div class="settings-container">
        <div class="writing-system-container">
          <span>Show characters in</span>
          <select
            v-model="writingSystem"
            class="writing-system-selector"
          >
            <option value="simplified">
              Simplified (简体)
            </option>
            <option value="traditional">
              Traditional (繁体)
            </option>
          </select>
        </div>
        <label class="show-pronunciation-container">
          <input
            v-model="showPronunciation"
            class="checkbox"
            type="checkbox"
          >
          <span>Show pronunciation</span>
        </label>
      </div>
    </div>
    <div class="collection-container">
      <div
        v-for="character in collection"
        :key="character.simplified"
        class="character-container"
      >
        <span v-if="writingSystem === 'simplified'">
          {{ character.simplified }}
        </span>
        <span v-else>
          {{ character.traditional }}
        </span>
        <span
          v-if="showPronunciation"
          class="pronunciation"
        >
          {{ pinyin(character.pronunciation) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import pinyin from 'pinyin-tone-converter';
import { Character } from '@/models.d.ts';
import firebase from '@/firebase';

export default defineComponent({
  data() {
    return {
      writingSystem: 'simplified',
      showPronunciation: false,
      collection: [] as Character[],
    };
  },
  async mounted() {
    const user = firebase.auth().currentUser;
    if (user === null) {
      this.$router.push({ name: 'Login' });
      return;
    }

    const query = await firebase.firestore().collection(`users/${user.uid}/knownCharacters`).get();
    query.docs.forEach((character) => {
      this.collection.push(character.data() as Character);
    });
  },
  methods: {
    pinyin(pronunciation: string) {
      return pinyin(pronunciation);
    },
  },
});
</script>

<style scoped>
.collection-view-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid gray;
  width: 100%;

  position: sticky;
  background-color: white;
  top: 0;
  box-shadow: 2px 0px 4px 0px gray
}

.settings-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-top: 8px;
}

.writing-system-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  font-size: 1rem;
}

.writing-system-selector {
  color: #2c3e50;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 1.16rem;
}

.show-pronunciation-container {
  margin-left: 40px;
}

.checkbox {
  margin-right: 8px;
  transform: scale(1.25);
}

.collection-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;

  gap: 16px 16px;

  align-content: flex-start;
  flex-wrap: wrap;
  padding: 16px;
}

.collection-container::after {
  content: "";
  flex: auto;
  /* https://stackoverflow.com/questions/18744164/flex-box-align-last-row-to-grid */
}

.character-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  padding: 8px;
  min-width: 88px;
  height: 80px;
  background-color: rgb(240, 244, 240);
  font-size: 2.4rem;
  border-radius: 8px;
  box-shadow: 1px 1px 1px 0px rgb(148, 148, 148)
}

.collection-container .pronunciation {
  font-size: 1.16rem;
}
</style>
