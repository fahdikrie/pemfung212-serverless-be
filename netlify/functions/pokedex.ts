import fetch from 'node-fetch';

import { decodeToken } from '../../helper/token';
import { DecodedToken } from '../../types/token';
import { headers } from '../../constants/header';

exports.handler = async (event: { headers: { token: string } }) => {
  const decoded = decodeToken(event.headers.token) as DecodedToken;
  if (!Object.keys(decoded).length)
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Bad request: No logged in user found',
      }),
    };

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
    headers: headers,
    body: JSON.stringify(data),
  };
};
