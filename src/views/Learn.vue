<template>
  <div class="learn-container">
    <h2>Learn</h2>
    <div class="content-container">
      <div v-if="character === undefined">
        <h2>Loading...</h2>
      </div>
      <template v-if="character !== undefined">
        <div class="character-container">
          <div
            class="glyph-container"
            @click="toggleWritingSystem"
          >
            <span class="hanzi">
              {{ character[writingSystem] }}
            </span>
            <span
              v-if="showPronunciation"
              class="pronunciation"
            >
              {{ pinyin }}
            </span>
          </div>
          <div
            v-if="showDefinitions"
            class="vertical-hr"
          />
          <div
            v-if="showDefinitions"
            class="definitions-container"
          >
            <span class="definitions-header">Definitions</span>
            <ul class="definitions">
              <li
                v-for="definition in character.definitions"
                :key="definition"
                class="definition"
              >
                {{ definition }}
              </li>
            </ul>
          </div>
        </div>
        <span class="character-significant">
          Press 'k' or click the character to show the {{ opposite }} version
        </span>
        <div class="helper-buttons-container">
          <button
            class="helper-button"
            @click="togglePronunciation"
          >
            {{ showPronunciation ? 'Hide' : 'Show' }}
            pronunciation
            <small> Press "s" </small>
          </button>
          <button
            class="helper-button"
            @click="toggleDefinitions"
          >
            {{ showDefinitions ? 'Hide' : 'Show' }}
            definitions
            <small> Press "d" </small>
          </button>
        </div>
        <button
          class="main-button"
          @click="nextCharacter"
        >
          Next character
        </button>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import pinyin from 'pinyin-tone-converter';
import { Character, User } from '@/models.d.ts';
import firebase from '@/firebase';

export default defineComponent({
  data() {
    return {
      character: undefined as Character | undefined,
      showPronunciation: true,
      showDefinitions: true,
      writingSystem: 'simplified' as 'simplified' | 'traditional',
      collection: [] as Character[],
    };
  },
  computed: {
    opposite(): string {
      const opposite = {
        traditional: 'simplified',
        simplified: 'traditional',
      };

      return opposite[this.writingSystem];
    },
    pinyin(): string {
      if (this.character === undefined) {
        return 'unknown';
      }

      return pinyin(this.character.pronunciation);
    },
  },
  async mounted() {
    const user = firebase.auth().currentUser;
    if (user === null) {
      this.$router.push({ name: 'Login' });
      return;
    }

    const userQuery = await firebase.firestore().doc(`users/${user.uid}`).get();
    if (!userQuery.exists) {
      console.error('Could not find user data');
      return;
    }

    const userData = { ...userQuery.data(), uid: userQuery.id } as User;

    this.writingSystem = userData.learning;

    const charactersQuery = await firebase.firestore().collection(`users/${user.uid}/knownCharacters`).get();
    charactersQuery.docs.forEach((character) => {
      this.collection.push(character.data() as Character);
    });

    this.nextCharacter();
    this.registerKeyHandlers();
  },
  unmounted() {
    document.onkeyup = null;
  },
  methods: {
    togglePronunciation() {
      this.showPronunciation = !this.showPronunciation;
    },
    toggleDefinitions() {
      this.showDefinitions = !this.showDefinitions;
    },
    toggleWritingSystem() {
      if (this.writingSystem === 'traditional') {
        this.writingSystem = 'simplified';
        return;
      }

      this.writingSystem = 'traditional';
    },
    nextCharacter() {
      const index = Math.floor(Math.random() * this.collection.length);
      const tentativeCharacter = this.collection[index];
      if (this.character && this.character.simplified === tentativeCharacter.simplified) {
        this.nextCharacter();
        return;
      }

      this.showPronunciation = false;
      this.showDefinitions = false;
      this.character = tentativeCharacter;
    },
    registerKeyHandlers() {
      document.onkeyup = (event) => {
        if (event.code === 'KeyS') {
          this.togglePronunciation();
          return;
        }
        if (event.code === 'KeyD') {
          this.toggleDefinitions();
          return;
        }
        if (event.code === 'KeyK') {
          this.toggleWritingSystem();
          return;
        }
        if (event.code === 'Space') {
          this.nextCharacter();
        }
      };
    },
  },
});
</script>

<style scoped>
.learn-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 16px;
  width: 100%;
  flex: 1;
}

.content-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex: 1;
}

.character-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0 16px ;
  min-width: 400px;
  background-color: rgb(240, 244, 240);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 2px;
}

.glyph-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;

  cursor: pointer;
}

.glyph-container .hanzi {
  font-size: 4rem;
  white-space: nowrap;
}

.vertical-hr {
  height: 80px;
  width: 1px;
  background-color: gray;
}

.glyph-container .pronunciation {
  font-size: 1rem;
}

.definitions-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  max-width: 640px;
  font-size: 1.08rem;
}

.definitions-header {
  font-weight: bold;
}

.definitions {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 0;
  padding-left: 24px;

  max-height: 160px;
  overflow: auto;
}

.character-significant {
  font-size: 1rem;
  margin-bottom: 16px;
}

.helper-buttons-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 0 16px;
}

.helper-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: none;
  padding: 8px 16px;
  font-size: 1.16rem;
  border-radius: 8px;
  color: #41b883;
  background: whitesmoke;
  cursor: pointer;
  transition: 0.24s all ease;
  max-width: 240px;
}

.helper-button:hover {
  background-color: rgb(226, 226, 226);
}

.helper-button:active {
  background-color: rgb(211, 211, 211);
}

.helper-button:disabled {
  color: #717e78;
}

.helper-button small {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 1rem;

  color: gray;
}

.main-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: none;
  padding: 8px 80px;
  font-size: 1.16rem;
  border-radius: 8px;
  background: #41b883;
  color: whitesmoke;
  cursor: pointer;
  transition: 0.24s all ease;
  margin-top: 16px;
}

.main-button:hover {
  background-color: #55ca95;
}

.main-button:active {
  background-color: #49b484;
}

.main-button:disabled {
  color: #717e78;
}
</style>
