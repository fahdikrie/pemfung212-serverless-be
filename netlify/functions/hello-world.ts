import { decodeToken } from '../../helper/token';
import { DecodedToken } from '../../types/token';

exports.handler = async (event: { headers: { token: string } }) => {
  const decoded = decodeToken(event.headers.token) as DecodedToken;
  if (!Object.keys(decoded).length)
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Bad request: No logged in user found',
      }),
    };

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello world!',
    }),
  };
};
