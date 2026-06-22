import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type CategoryBreakdownSlice } from '../../hooks/subscriptions/selectors/computeCategoryBreakdown';
import { SubscriptionCategoryBreakdownChart } from './SubscriptionCategoryBreakdownChart';

describe('SubscriptionCategoryBreakdownChart', () => {
  it('renders nothing when the breakdown is empty', () => {
    const { container } = render(
      <SubscriptionCategoryBreakdownChart breakdown={[]} />
    );

    expect(container.innerHTML).toBe('');
  });

  it('renders a legend item and percentage for each category', () => {
    const breakdown: Array<CategoryBreakdownSlice> = [
      { category: 'Entertainment', total: 30 },
      { category: 'Productivity', total: 10 },
    ];

    render(<SubscriptionCategoryBreakdownChart breakdown={breakdown} />);

    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Productivity')).toBeInTheDocument();
    expect(screen.getByText('(75.0%)')).toBeInTheDocument();
    expect(screen.getByText('(25.0%)')).toBeInTheDocument();
  });
});
