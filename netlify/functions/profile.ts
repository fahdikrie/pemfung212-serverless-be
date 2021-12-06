import * as mongoDb from 'mongodb';

import { connectToDatabase, getDbInfo } from '../../helper/db';
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

  const [uri, cluster] = getDbInfo();
  const dbClient = (await connectToDatabase(uri, cluster)) as mongoDb.Db;
  const cursor = dbClient.collection('user');

  const user = await cursor.find({ username: decoded.username }).toArray();
  if (!user.length)
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'Unauthorized: incorrect Login information',
      }),
    };

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        user: user[0],
        message: 'Login successful',
      },
      null,
      2
    ),
  };
};
