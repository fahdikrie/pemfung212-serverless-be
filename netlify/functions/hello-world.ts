import { decodeToken } from '../../helper/token';
import { DecodedToken } from '../../types/token';
import { headers } from '../../constants/header';

exports.handler = async (event: { headers: { token: string } }) => {
  const decoded = decodeToken(event.headers.token) as DecodedToken;
  if (!Object.keys(decoded).length)
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({
        error: 'Bad request: No logged in user found',
      }),
    };

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      message: 'Hello world!',
    }),
  };
};
