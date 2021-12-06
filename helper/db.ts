import * as mongoDb from 'mongodb';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MongoClient = require('mongodb').MongoClient;

let cachedDb: mongoDb.Db | null = null;

export const connectToDatabase = async (uri: string, db: string) => {
  if (cachedDb) return cachedDb;

  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
  });

  cachedDb = client.db(db);

  return cachedDb;
};
