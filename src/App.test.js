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
  const ingredientsSummary = screen.getByText('Ingredients');
  const ingredientsDisclosure = ingredientsSummary.closest('details');
  expect(ingredientsDisclosure).not.toHaveAttribute('open');
  fireEvent.click(ingredientsSummary);
  expect(ingredientsDisclosure).toHaveAttribute('open');
  const methodSummary = screen.getByText('Method');
  expect(methodSummary.closest('details')).not.toHaveAttribute('open');
  expect(screen.getByText('Pumpkin')).toBeInTheDocument();
  expect(screen.getByText('Cook until tender.')).toBeInTheDocument();
});
