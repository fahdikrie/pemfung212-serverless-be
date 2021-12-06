import { connectToDatabase } from '../../helper/db';

const MONGODB_URL = process.env.MONGODB_URL as string;
const MONGODB_DB = process.env.MONGODB_DB as string;

exports.handler = async () => {
  const db = await connectToDatabase(MONGODB_URL, MONGODB_DB);
  const users = await db.collection('user').find({}).toArray();

  return {
    statusCode: 200,
    body: JSON.stringify({
      user: users,
    }),
  };
};
