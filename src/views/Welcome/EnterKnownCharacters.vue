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
    <p v-if="maxHSKLevel > 0">
      Assuming you know most of the characters from previous levels, we are going to show you all
      the characters from {{ HSKRange }}. For each character, you have to mark it as known or
      unknown. Don't feel pressured, after this you will be able to add any other {{ known }}
      character you learn.
    </p>
  </div>
</template>

<script>
import {
  computed, defineComponent, onMounted, ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { learning } = route.params;

    onMounted(() => {
      if (!learning) {
        // TODO: query the db for the value instead of returning
        router.push({ name: 'Welcome' });
      }
    });

    const opposite = {
      simplified: 'traditional',
      traditional: 'simplified',
    };

    const known = opposite[learning];

    const maxHSKLevel = ref(0);

    const HSKRange = computed(() => {
      if (maxHSKLevel.value === '1') {
        return 'HSK 1';
      }

      return `HSK 1 to HSK ${maxHSKLevel.value}`;
    });

    return {
      learning, known, maxHSKLevel, HSKRange,
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
</style>
