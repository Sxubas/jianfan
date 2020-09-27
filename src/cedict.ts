export type Definition = {
  simplified: string;
  traditional: string;
  pronunciation: string;
  definitions: string[];
};

const lineRegex = /(\S+)\s+(\S+)\s+\[([^\]]*)\]\s+\/(.*)\/\s*$/;

export const dictionary: {[key: string]: Definition} = {};

const parse = (contents: string): Definition[] => {
  const definitions: Definition[] = [];
  const lines = contents.split('\n');
  lines.forEach((line, i) => {
    if (line.startsWith('#') || line === '') return; // skip comments and blanks
    const match = lineRegex.exec(line);
    if (match !== null) {
      definitions.push({
        traditional: match[1],
        simplified: match[2],
        pronunciation: match[3],
        definitions: match[4].split('/'),
      });
    } else {
      console.error(`Invalid line format ${i + 1}: ${line}\n`);
    }
  });

  return definitions;
};

export const initializeDictionary = async () => {
  const request = await fetch('/cedict.txt');
  const cedict = await request.text();

  const definitions = parse(cedict);
  definitions.forEach((definition) => {
    const duplicateCharacter = dictionary[definition.simplified];
    if (duplicateCharacter) {
      duplicateCharacter.definitions.push(...definition.definitions);
      return;
      // There are tons of duplicate characters, due to proper names, slang
      // and variations being in different entries. TODO: how to handle those better.
    }

    dictionary[definition.simplified] = definition;
  });
};
