import * as mongoDb from 'mongodb';

import { connectToDatabase, getDbInfo } from '../../helper/db';
import { checkIfObjContainsNull } from '../../helper/util';
import { hashPassword } from '../../helper/user';
import { UserData } from '../../types/user';
import { generateToken } from '../../helper/token';

interface SignUpPayload {
  name: string;
  fullname: string;
  username: string;
  password: string;
}

exports.handler = async (event: { body: string }) => {
  const payload: SignUpPayload = JSON.parse(event.body);
  if (checkIfObjContainsNull(payload))
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Bad request: incomplete Sign Up information',
      }),
    };

  const [uri, cluster] = getDbInfo();
  const dbClient = (await connectToDatabase(uri, cluster)) as mongoDb.Db;
  const cursor = dbClient.collection('user');

  const createdUser = await cursor
    .find({ username: payload.username })
    .toArray();
  if (createdUser.length)
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'Bad request: Username already taken!',
      }),
    };

  payload.password = await hashPassword(payload.password);
  const userID = await cursor
    .insertOne(payload)
    .then((inserted) => inserted.insertedId)
    .catch((err) => {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err,
        }),
      };
    });

  const userData: UserData = { ...payload };
  userData._id = userID as mongoDb.ObjectId;
  const [token, refreshToken] = generateToken(userData);

  const user = await cursor.findOneAndUpdate(
    { _id: userID },
    {
      $set: {
        user_id: userID.toString(),
        token: token,
        refresh_token: refreshToken,
      },
    },
    { returnDocument: 'after' }
  );

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        user: user,
        message: 'Sign Up Successful',
      },
      null,
      2
    ),
  };
};
