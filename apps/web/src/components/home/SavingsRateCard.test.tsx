import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SavingsRateCard } from './SavingsRateCard';

describe('SavingsRateCard', () => {
  it('shows the share of income saved and names the report it covers', () => {
    render(<SavingsRateCard rate={92} reportTitle="January 2026" />);

    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText(/January 2026/)).toBeInTheDocument();
  });

  it('shows how far income was overspent when expenses exceed it', () => {
    render(<SavingsRateCard rate={-20} reportTitle="March 2026" />);

    expect(screen.getByText('Overspent')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });
});
