import { render, screen } from '@testing-library/react';
import App from './App';

test('renders top navigation brand', () => {
  render(<App />);
  const brand = screen.getByText(/ViralTrend/i);
  expect(brand).toBeInTheDocument();
});
