export interface ProductDisplay {
  icon: string;
  bg: string;
}

const KEYWORD_MAP: { keyword: string; icon: string; bg: string }[] = [
  { keyword: 'coffee', icon: '☕', bg: '#EFE3D3' },
  { keyword: 'mango', icon: '🥭', bg: '#FCE9C7' },
  { keyword: 'onion', icon: '🧅', bg: '#F1DADD' },
  { keyword: 'pepper', icon: '⚫', bg: '#E4E1DC' },
  { keyword: 'cardamom', icon: '🌿', bg: '#E3EEE0' },
  { keyword: 'turmeric', icon: '🟠', bg: '#FCE9C7' },
  { keyword: 'rice', icon: '🍚', bg: '#E7EEF3' },
  { keyword: 'grape', icon: '🍇', bg: '#E9F0E3' },
  { keyword: 'apple', icon: '🍎', bg: '#F7E3E1' },
  { keyword: 'banana', icon: '🍌', bg: '#FBF0D9' },
  { keyword: 'tea', icon: '🍵', bg: '#E3EEE0' },
  { keyword: 'cashew', icon: '🌰', bg: '#F1E6D3' },
  { keyword: 'chil', icon: '🌶️', bg: '#F7DEDA' },
  { keyword: 'ginger', icon: '🫚', bg: '#F1E6D3' },
  { keyword: 'garlic', icon: '🧄', bg: '#EFEFE9' },
  { keyword: 'orange', icon: '🍊', bg: '#FCE9C7' },
  { keyword: 'pomegranate', icon: '🍈', bg: '#F7E3E1' },
  { keyword: 'tomato', icon: '🍅', bg: '#F7DEDA' },
  { keyword: 'potato', icon: '🥔', bg: '#F1E6D3' },
  { keyword: 'wheat', icon: '🌾', bg: '#FBF0D9' },
  { keyword: 'corn', icon: '🌽', bg: '#FBF0D9' },
  { keyword: 'sugar', icon: '🧂', bg: '#EFEFE9' },
  { keyword: 'cotton', icon: '☁️', bg: '#EFEFE9' },
  { keyword: 'coconut', icon: '🥥', bg: '#E9F0E3' },
];

const CATEGORY_FALLBACK: Record<string, ProductDisplay> = {
  fruits: { icon: '🍎', bg: '#F7E3E1' },
  vegetables: { icon: '🥦', bg: '#E9F0E3' },
  spices: { icon: '🌶️', bg: '#F7DEDA' },
  grains: { icon: '🌾', bg: '#FBF0D9' },
  coffee: { icon: '☕', bg: '#EFE3D3' },
};

export function getProductDisplay(productName: string, category?: string): ProductDisplay {
  const name = (productName || '').toLowerCase();
  const match = KEYWORD_MAP.find(k => name.includes(k.keyword));
  if (match) {
    return { icon: match.icon, bg: match.bg };
  }
  const cat = (category || '').toLowerCase();
  if (CATEGORY_FALLBACK[cat]) {
    return CATEGORY_FALLBACK[cat];
  }
  return { icon: '📦', bg: '#E4E1DC' };
}

const TAG_LABEL: Record<string, string> = {
  POPULAR: 'Popular',
  IN_SEASON: 'In Season',
  HIGH_DEMAND: 'High Demand',
  TRENDING: 'Trending',
  BESTSELLER: 'Bestseller',
};

const TAG_COLOR: Record<string, string> = {
  POPULAR: '#B98A1E',
  IN_SEASON: '#C2483C',
  HIGH_DEMAND: '#8A4A83',
  TRENDING: '#1E3B23',
  BESTSELLER: '#1E3B23',
};

export function getTagLabel(tag?: string): string {
  return tag ? (TAG_LABEL[tag] ?? '') : '';
}

export function getTagColor(tag?: string): string {
  return tag ? (TAG_COLOR[tag] ?? '#1E3B23') : '#1E3B23';
}

export function titleCase(value?: string): string {
  if (!value) return '';
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
