import * as mongoDb from 'mongodb';

import { connectToDatabase, getDbInfo } from '../../helper/db';
import { verifyPassword } from '../../helper/user';

interface LoginPayload {
  username: string;
  password: string;
}

exports.handler = async (event: { body: string }) => {
  const { username, password }: LoginPayload = JSON.parse(event.body);
  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Bad request: incomplete Login information',
      }),
    };
  }

  const [uri, cluster] = getDbInfo();
  const dbClient = (await connectToDatabase(uri, cluster)) as mongoDb.Db;

  const cursor = await dbClient.collection('user').find({ username: username });
  const user = await cursor.toArray();
  if (!user.length)
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'Unauthorized: incorrect Login information',
      }),
    };

  const isPasswordMatch = await verifyPassword(password, user[0].password);
  if (!isPasswordMatch)
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
