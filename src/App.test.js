import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  expect(screen.getByRole('button', { name: '✨ Surprise me' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Pumpkin recipe' }));
  expect(global.fetch).toHaveBeenCalledWith(
    'https://family-chatbot.onrender.com/api/chatbot/message',
    expect.objectContaining({ body: JSON.stringify({ message: 'pumpkin_recipe' }) })
  );

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
  expect(screen.getByRole('button', { name: 'Teej pooja' })).toBeInTheDocument();
});

test('surprise prompt explores different supported vegetarian recipes', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ response: 'Here is a family recipe.' }),
  });
  Element.prototype.scrollIntoView = jest.fn(() => Promise.resolve());
  const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

  render(<React.StrictMode><App /></React.StrictMode>);
  fireEvent.click(screen.getByRole('button', { name: '✨ Surprise me' }));
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  await screen.findByRole('button', { name: 'Teej pooja' });
  fireEvent.click(screen.getByRole('button', { name: '✨ Surprise me' }));
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

  const selectedRecipes = global.fetch.mock.calls.map(([, options]) =>
    JSON.parse(options.body).message
  );
  expect(selectedRecipes).toEqual(['pumpkin_recipe', 'bittergourd_recipe']);
  randomSpy.mockRestore();
});
