export interface Character {
  simplified: string;
  traditional: string;
  pronunciation: string;
  definitions: string[];
}

export interface User {
  uid: string;
  learning: 'simplified' | 'traditional';
  maxHSKLevel: number;
}
