import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders recipe response titles and instructions as structured content', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({
      response: '**Pumpkin Recipe**\n\nIngredients:\n- Pumpkin\n\nMethod:\n1. Cook until tender.',
    }),
  });
  Element.prototype.scrollIntoView = jest.fn(() => Promise.resolve());

  render(<React.StrictMode><App /></React.StrictMode>);
  expect(screen.getByText(/Namaste! I'm Nehu/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Type your message'), { target: { value: 'pumpkin' } });
  fireEvent.click(screen.getByLabelText('Send message'));

  expect(await screen.findByRole('heading', { name: 'Pumpkin Recipe' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Ingredients' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Method' })).toBeInTheDocument();
  expect(screen.getByText('Pumpkin')).toBeInTheDocument();
  expect(screen.getByText('Cook until tender.')).toBeInTheDocument();
});
