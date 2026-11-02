import {
  CONTRACT_CATEGORY_COLORS,
  FALLBACK_CATEGORY_COLOR,
} from '../charts/categoryColors';
import { Badge } from '../ui';

export function ContractCategoryBadge({ category }: { category: string }) {
  const categoryColor =
    CONTRACT_CATEGORY_COLORS[category] ?? FALLBACK_CATEGORY_COLOR;

  return (
    <Badge
      size="sm"
      style={{ backgroundColor: `${categoryColor}1f`, color: categoryColor }}
    >
      {category}
    </Badge>
  );
}
