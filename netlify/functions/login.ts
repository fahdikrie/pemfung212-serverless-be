import * as mongoDb from 'mongodb';

import { connectToDatabase, getDbInfo } from '../../helper/db';
import { verifyPassword } from '../../helper/user';
import { generateToken } from '../../helper/token';
import { headers } from '../../constants/header';

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginDataUpdate {
  token: string;
  refresh_token: string;
}

exports.handler = async (event: { body: string }) => {
  const { username, password }: LoginPayload = JSON.parse(event.body);
  if (!username || !password)
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({
        error: 'Bad request: incomplete Login information',
      }),
    };

  const [uri, cluster] = getDbInfo();
  const dbClient = (await connectToDatabase(uri, cluster)) as mongoDb.Db;
  const cursor = dbClient.collection('user');

  const user = await cursor.find({ username: username }).toArray();
  if (!user.length)
    return {
      statusCode: 401,
      headers: headers,
      body: JSON.stringify({
        error: 'Unauthorized: incorrect Login information',
      }),
    };

  const isPasswordMatch = await verifyPassword(password, user[0].password);
  if (!isPasswordMatch)
    return {
      statusCode: 401,
      headers: headers,
      body: JSON.stringify({
        error: 'Unauthorized: incorrect Login information',
      }),
    };

  const [token, refreshToken] = generateToken(user[0] as mongoDb.Document);

  const loginDataUpdate: LoginDataUpdate = {
    token: token,
    refresh_token: refreshToken,
  };

  await cursor.updateOne(
    { username: user[0].username },
    { $set: loginDataUpdate },
    { upsert: true }
  );

  return {
    statusCode: 200,
    headers: headers,
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
