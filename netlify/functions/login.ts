import * as mongoDb from 'mongodb';
import { connectToDatabase, getDbInfo } from '../../helper/db';

interface LoginPayload {
  username: string;
  password: string;
}

exports.handler = async (event: { body: string }) => {
  const { username, password }: LoginPayload = JSON.parse(event.body);

  if (username && password) {
    console.log('bundas');
  }

  const [uri, cluster] = getDbInfo();
  const dbClient = (await connectToDatabase(uri, cluster)) as mongoDb.Db;
  const users = await dbClient.collection('user').find({}).toArray();

  return {
    statusCode: 200,
    body: JSON.stringify({
      user: users,
    }),
  };
};
