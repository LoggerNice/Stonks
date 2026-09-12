import {
  Bitcoin,
  CircleDollarSign,
  Image as ImageIcon,
  LineChart,
} from 'lucide-react';

export const categoryIcons = {
  stocks: LineChart,
  crypto: Bitcoin,
  nft: ImageIcon,
};

export const categoryLabels = {
  stocks: 'Акции',
  crypto: 'Крипта',
  nft: 'NFT',
};

export function getCategoryIcon(category) {
  return categoryIcons[category] || CircleDollarSign;
}