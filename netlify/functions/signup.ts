import * as mongoDb from 'mongodb';

import { connectToDatabase, getDbInfo } from '../../helper/db';
import { hashPassword } from '../../helper/user';

interface SignUpPayload {
  name: string;
  fullname: string;
  username: string;
  password: string;
}

interface UserData {
  name: string;
  userid?: string;
  fullname: string;
  username: string;
  password: string;
  token?: string;
  refreshtoken?: string;
}

const checkIfObjContainsNull = <T>(obj: T): boolean =>
  !Object.values(obj).every((attr) => attr === null);

exports.handler = async (event: { body: string }) => {
  const payload: SignUpPayload = JSON.parse(event.body);
  if (checkIfObjContainsNull(payload)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Bad request: incomplete Sign Up information',
      }),
    };
  }

  const [uri, cluster] = getDbInfo();
  const dbClient = (await connectToDatabase(uri, cluster)) as mongoDb.Db;
  const cursor = await dbClient.collection('user');

  const createdUser = await cursor
    .find({ username: payload.username })
    .toArray();
  if (!createdUser.length)
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
  userData.userid = userID.toString();

  const user = await cursor.findOneAndUpdate(
    { _id: userID },
    { userid: userID },
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
