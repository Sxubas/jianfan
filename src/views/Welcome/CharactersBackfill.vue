<template>
  <div class="backfill-container">
    <div
      v-if="currentCharacter === undefined"
      class="loading-container"
    >
      <p>Downloading dictionary and word lists...</p>
      <span>
        This may take a while depending on your internet connection
      </span>
    </div>
    <div
      v-else
      class="loaded-view-container"
    >
      <h2>Add known {{ known }} characters</h2>
      <p>Do you recognize this charatcer?</p>
      <div class="character-container">
        <span class="hanzi">{{ currentCharacterHanzi }}</span>
        <span
          v-if="showPronunciation"
          class="pronunciation"
        >
          {{ currentCharacterPinyin }}
        </span>
        <template v-if="showDefinitions">
          <span
            v-for="definition in currentCharacter.definitions"
            :key="definition"
            class="definition"
          >
            {{ definition }}
          </span>
        </template>

        <div class="buttons-container">
          <div class="show-buttons-container">
            <button @click="showPronunciation = !showPronunciation">
              {{ showPronunciation ? 'Hide' : 'show' }}
              pronunciation
              <small> Press "s" </small>
            </button>
            <button @click="showDefinitions = !showDefinitions">
              {{ showDefinitions ? 'Hide' : 'show' }}
              definitions
              <small> Press "d" </small>
            </button>
          </div>
          <div class="recognize-buttons-container">
            <button
              :disabled="disableButtons"
              @click="addCharacterToRecognizedList"
            >
              I recognize it
              <small>
                Press <i class="material-icons">arrow_backwards</i>
              </small>
            </button>
            <button
              :disabled="disableButtons"
              @click="nextCharacter"
            >
              I don't recognize it
              <small>
                Press <i class="material-icons">arrow_forward</i>
              </small>
            </button>
          </div>
        </div>
      </div>
      <p>{{ backfillCharacters.length }} characters left to review</p>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed, defineComponent, onMounted, onUnmounted, ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Character } from '@/models.d.ts';
import { initializeDictionary, dictionary } from '@/cedict';
import pinyin from 'pinyin-tone-converter';

import * as firebase from 'firebase/app';
import 'firebase/firestore';

export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { maxHSKLevel, learning } = route.params;

    if (maxHSKLevel instanceof Array || learning instanceof Array) {
      // TODO: improve error handling
      router.push({ name: 'Welcome' });
      throw new Error('unexpected param type');
    }

    const opposite: Record<string, string> = {
      simplified: 'traditional',
      traditional: 'simplified',
    };

    const known = opposite[learning];

    const currentCharacter = ref<Character>();
    const currentCharacterHanzi = computed(() => {
      if (!currentCharacter.value) {
        return '';
      }

      if (known === 'simplified') {
        return currentCharacter.value.simplified;
      }

      return currentCharacter.value.traditional;
    });
    const currentCharacterPinyin = computed(() => {
      if (!currentCharacter.value) {
        return '';
      }

      return pinyin(currentCharacter.value.pronunciation);
    });

    const backfillCharacters = ref<Character[]>([]);
    const disableButtons = ref(false);

    const user = firebase.auth().currentUser;
    if (user === null) {
      router.push({ name: 'Login' });
      throw new Error('unexpected param type');
    }

    const nextCharacter = () => {
      currentCharacter.value = backfillCharacters.value.pop();
    };
    const addCharacterToRecognizedList = async () => {
      disableButtons.value = true;

      if (!currentCharacter.value) {
        throw new Error('unexpected character');
      }

      await firebase.firestore().doc(`users/${user.uid}/knownCharacters/${currentCharacter.value.simplified}`).set({
        ...currentCharacter.value,
        dateAdded: firebase.firestore.FieldValue.serverTimestamp(),
      });

      nextCharacter();

      disableButtons.value = false;
    };

    const showPronunciation = ref(false);
    const showDefinitions = ref(false);

    const keyupHandler = (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft') {
        addCharacterToRecognizedList();
      } else if (event.code === 'ArrowRight') {
        nextCharacter();
      } else if (event.code === 'KeyS') {
        showPronunciation.value = !showPronunciation.value;
      } else if (event.code === 'KeyD') {
        showDefinitions.value = !showDefinitions.value;
      }

      if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        showDefinitions.value = false;
        showPronunciation.value = false;
      }
    };

    const setKeyListeners = () => {
      document.addEventListener('keyup', keyupHandler);
    };

    const removeAlreadyLearntCharacters = (
      fetchedBackfillCharacters: Character[],
      knownCharacters: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>,
    ) => {
      knownCharacters.docs.forEach((knownCharacter) => {
        fetchedBackfillCharacters.forEach((fetchedBackfillCharacter, i) => {
          if (knownCharacter.id === fetchedBackfillCharacter.simplified) {
            fetchedBackfillCharacters.splice(i, 1);
          }
        });
      });
    };

    const maxHSKLevelNumber = parseInt(maxHSKLevel, 10);
    const HSKLevelRange = Array.from({ length: maxHSKLevelNumber }, (x, i) => i + 1);
    onMounted(async () => {
      // TODO: use fallback to avoid losing state
      if (!maxHSKLevel || !learning) {
        router.push({ name: 'Welcome' });
        return;
      }

      await initializeDictionary();

      const fetchedBackfillCharacters: Character[] = [];
      await Promise.all(HSKLevelRange.map(async (level) => {
        const response = await fetch(`/characters_per_level/HSK_${level}.txt`);
        const text = await response.text();
        text.split('\r\n').forEach((character) => {
          if (character === '' || character === undefined) {
            return; // skip newlines
          }

          const characterDefinition = dictionary[character];
          if (characterDefinition === undefined) {
            // skip compound expressions that are not in the cedict dictionary:
            // 打篮球, 踢足球, 只有, 放暑假, 弹钢琴, 系领带, 纽扣儿, 烟花爆竹
            return;
          }

          fetchedBackfillCharacters.push(characterDefinition);
        });
      }));

      // This will allow .pop() to retrieve the lowest level characters first in order to
      // 'warmup' the chinese memory of the user before asking for more advanced characters
      fetchedBackfillCharacters.reverse();

      const query = await firebase.firestore().collection(`users/${user.uid}/knownCharacters`).get();
      if (!query.empty) {
        removeAlreadyLearntCharacters(fetchedBackfillCharacters, query);
      }

      backfillCharacters.value = fetchedBackfillCharacters;
      currentCharacter.value = backfillCharacters.value.pop();

      setKeyListeners();
    });

    onUnmounted(() => {
      document.removeEventListener('keyup', keyupHandler);
    });

    return {
      maxHSKLevel,
      HSKLevelRange,
      backfillCharacters,
      known,
      currentCharacter,
      currentCharacterHanzi,
      currentCharacterPinyin,
      nextCharacter,
      addCharacterToRecognizedList,
      disableButtons,
      showPronunciation,
      showDefinitions,
    };
  },
});
</script>

<style scoped>
.backfill-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 16px;
  text-align: left;
}

.character-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 480px;
  text-align: center;
}

.character-container .hanzi {
  font-size: 4rem;
  font-weight: bold;
}

.character-container .pronunciation {
  font-size: 1.4rem;
  margin-bottom: 16px;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 32px;
  width: 100%;
}

.show-buttons-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.recognize-buttons-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 8px;
}

button {
  flex: 1;
  display: flex;
  flex-direction: column;
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
  margin: 0 8px;
}

button:hover {
  background-color: rgb(226, 226, 226);
}

button:active {
  background-color: rgb(211, 211, 211);
}

button:disabled {
  color: #717e78;
}

button small {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 1rem;

  color: gray;
}

button small i {
  font-size: 1.24rem;
  width: 1.24rem;
  margin-left: 4px;
}
</style>
