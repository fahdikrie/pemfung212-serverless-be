import * as mongoDb from 'mongodb';

import { connectToDatabase, getDbInfo } from '../../helper/db';
import { DecodedToken } from '../../types/token';
import { decodeToken } from '../../helper/token';
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

  const [uri, cluster] = getDbInfo();
  const dbClient = (await connectToDatabase(uri, cluster)) as mongoDb.Db;
  const users = await dbClient.collection('user').find({}).toArray();

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      users: users,
    }),
  };
};
