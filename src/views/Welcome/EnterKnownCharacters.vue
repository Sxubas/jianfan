<template>
  <div class="enter-characters-container">
    <h2>First things first</h2>
    <p>
      We need to know which {{ known }} characters you recognize,
      so you can practice their {{ learning }} version.
    </p>
    <p>
      We know for sure listing all the {{ known }} chinese characters you know may take
      a while. Because of this, we are going to make things a little bit easier, based on the HSK
      word lists.
    </p>
    <p>
      Which is the highest HSK level you think you recognize <b>most</b> of the words/expressions?
    </p>
    <select v-model="maxHSKLevel">
      <option
        disabled
        value="0"
      >
        Select an option...
      </option>
      <option value="1">
        HSK 1
      </option>
      <option value="2">
        HSK 2
      </option>
      <option value="3">
        HSK 3
      </option>
      <option value="4">
        HSK 4
      </option>
      <option value="5">
        HSK 5
      </option>
      <option value="6">
        HSK 6
      </option>
    </select>
    <p v-if="maxHSKLevelNumber > 1">
      Assuming you know most of the characters from previous levels, we are going to show you all
      the characters from {{ HSKRange }}. For each character, you have to mark it as known or
      unknown. Don't feel pressured, after this you will be able to add any other {{ known }}
      character you learn.
    </p>
    <p v-else>
      We are going to show you all the characters from HSK 1. For each character,
      you have to mark it as known or unknown. Don't feel under pressure, after this you will
      be able to add any other {{ known }} character you learn.
    </p>
    <span>
      You will be shown {{ totalCharacterCount }} {{ known }} characters, based on the HSK word list
      count:
    </span>
    <ul>
      <li
        v-for="level in HSKLevelRange"
        :key="level"
      >
        HSK {{ level + 1 }}: {{ HSKWordCount[level] }}
      </li>
    </ul>
    <button
      v-if="maxHSKLevel !== '0'"
      @click="startBackfill"
    >
      Continue
      <i class="material-icons-round">navigate_next</i>
    </button>
  </div>
</template>

<script lang="ts">
import {
  computed, defineComponent, onMounted, ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import firebase from '@/firebase';

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { learning } = route.params;

    if (learning instanceof Array) {
      // TODO: improve error handling
      throw new Error('unexpected param type');
    }

    onMounted(() => {
      if (!learning) {
        // TODO: query the db for the value instead of returning
        router.push({ name: 'Welcome' });
      }
    });

    const opposite: Record<string, string> = {
      simplified: 'traditional',
      traditional: 'simplified',
    };

    const known = opposite[learning];

    const maxHSKLevel = ref('0');
    const maxHSKLevelNumber = computed(() => parseInt(maxHSKLevel.value, 10));

    const HSKRange = computed(() => {
      if (maxHSKLevel.value === '1') {
        return 'HSK 1';
      }

      return `HSK 1 to HSK ${maxHSKLevel.value}`;
    });

    const HSKWordCount: number[] = [150, 152, 303, 600, 1300, 2500];
    const HSKLevelRange = computed(
      () => Array.from({ length: maxHSKLevelNumber.value }, (x, i) => i),
    );
    const totalCharacterCount = computed(
      () => HSKWordCount.slice(0, maxHSKLevelNumber.value).reduce((a, b) => a + b, 0),
    );

    const startBackfill = async () => {
      const user = firebase.auth().currentUser;
      if (user === null) {
        router.push({ name: 'Login' });
        return;
      }

      await firebase.firestore().doc(`users/${user.uid}`).update({ maxHSKLevel: maxHSKLevelNumber.value });
      router.push({
        name: 'Characters backfill',
        params: {
          maxHSKLevel: maxHSKLevelNumber.value,
          learning,
        },
      });
    };

    return {
      learning,
      known,
      maxHSKLevel,
      HSKRange,
      maxHSKLevelNumber,
      totalCharacterCount,
      HSKLevelRange,
      HSKWordCount,
      startBackfill,
    };
  },
});
</script>

<style scoped>
.enter-characters-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 16px;
  text-align: left;
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
</style>
