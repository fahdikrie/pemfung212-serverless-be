import * as mongoDb from 'mongodb';

import { connectToDatabase, getDbInfo } from '../../helper/db';

exports.handler = async () => {
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
