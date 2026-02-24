import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the app with routing', () => {
  render(<App />);
  expect(screen.getByRole('main')).toBeInTheDocument();
});

test('displays Contoso Traders branding in navigation', () => {
  render(<App />);
  expect(screen.getByText('Contoso Traders')).toBeInTheDocument();
});

test('renders home page with welcome heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /welcome to contoso traders/i });
  expect(heading).toBeInTheDocument();
});
