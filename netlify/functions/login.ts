import * as mongoDb from 'mongodb';

import { connectToDatabase, getDbInfo } from '../../helper/db';
import { verifyPassword } from '../../helper/user';
import { generateToken } from '../../helper/token';

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginData {
  user_id: string;
  token: string;
  refresh_token: string;
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
  const cursor = dbClient.collection('user');

  const user = await cursor.find({ username: username }).toArray();
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

  const [token, refreshToken] = generateToken(user[0] as mongoDb.Document);

  const loginData: LoginData = {
    user_id: user[0]._id.toString(),
    token: token,
    refresh_token: refreshToken,
  };

  await cursor.updateOne(
    { userid: user[0]._id.toString() },
    { $set: loginData },
    { upsert: true }
  );

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
