import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContractCategoryBreakdownChart } from './ContractCategoryBreakdownChart';

describe('ContractCategoryBreakdownChart', () => {
  it('renders a legend item and percentage for each category', () => {
    render(
      <ContractCategoryBreakdownChart
        breakdown={[
          { category: 'Internet', total: 30 },
          { category: 'Electricity', total: 10 },
        ]}
      />
    );

    expect(screen.getByText('Internet')).toBeInTheDocument();
    expect(screen.getByText('Electricity')).toBeInTheDocument();
    expect(screen.getByText('(75.0%)')).toBeInTheDocument();
    expect(screen.getByText('(25.0%)')).toBeInTheDocument();
  });
});
