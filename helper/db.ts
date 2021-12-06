import * as mongoDb from 'mongodb';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MongoClient = require('mongodb').MongoClient;

let cachedDb: mongoDb.Db | null = null;

export const getDbInfo = () => {
  const MONGODB_URI = process.env.MONGODB_URI as string;
  const MONGODB_CLUSTER = process.env.MONGODB_CLUSTER as string;

  return [MONGODB_URI, MONGODB_CLUSTER];
};

export const connectToDatabase = async (uri: string, db: string) => {
  if (cachedDb) return cachedDb;

  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
  });

  cachedDb = client.db(db);

  return cachedDb;
};
