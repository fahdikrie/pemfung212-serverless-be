import fetch from 'node-fetch';

exports.handler = async () => {
  const POKE_API = 'https://pokeapi.co/api/v2/pokedex/kanto';

  const response = await fetch(POKE_API, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
