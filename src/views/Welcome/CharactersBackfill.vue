<template>
  <div class="backfill-container">
    <h2>Backfill characters</h2>
    <p>level: {{ maxHSKLevel }}  {{ HSKLevelRange }}</p>
    <div
      v-for="character in backfillCharacters"
      :key="character.simplified"
      class="backfill"
    >
      <div>{{ character.simplified }} | {{ character.traditional }}</div>
      <div>{{ character.definitions }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed, defineComponent, onMounted, ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { initializeDictionary, dictionary, Definition } from '@/cedict';

export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { maxHSKLevel } = route.params;

    if (maxHSKLevel instanceof Array) {
      // TODO: improve error handling
      throw new Error('unexpected param type');
    }

    const maxHSKLevelNumber = parseInt(maxHSKLevel, 10);
    const backfillCharacters = ref<Definition[]>([]);
    const HSKLevelRange = Array.from({ length: maxHSKLevelNumber }, (x, i) => i + 1);
    onMounted(async () => {
      // TODO: use fallback to avoid losing state
      if (!maxHSKLevel) {
        router.push({ name: 'Welcome' });
        return;
      }

      console.log('dict b4 init: ', dictionary);
      await initializeDictionary();
      console.log('dict after init: ', dictionary);

      const fetchedBackfillCharacters: Definition[] = [];
      await Promise.all(HSKLevelRange.map(async (level) => {
        const response = await fetch(`/characters_per_level/HSK_${level}.txt`);
        const text = await response.text();
        text.split('\r\n').forEach((character) => {
          if (character === '' || character === undefined) {
            console.log('Fcion');

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

      backfillCharacters.value = fetchedBackfillCharacters;
    });

    return { maxHSKLevel, HSKLevelRange, backfillCharacters };
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

.backfill {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 8px;
}
</style>
