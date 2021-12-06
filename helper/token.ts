import jwt from 'jsonwebtoken';
import * as mongoDb from 'mongodb';

import { JWTSignedData } from '../types/jwt';

const SECRET_KEY = process.env.SECRET_KEY as string;

export const generateToken = (user: mongoDb.Document) => {
  const tokenData: JWTSignedData = {
    name: user.name,
    fullname: user.fullname,
    username: user.username,
    uid: user._id.toString(),
  };

  const tokenDataRefresh: JWTSignedData = {
    name: user.name,
    fullname: user.fullname,
    username: user.username,
    uid: user._id.toString(),
  };

  const token = jwt.sign(tokenData, SECRET_KEY, {
    algorithm: 'HS256',
    expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  });

  const refreshToken = jwt.sign(tokenDataRefresh, SECRET_KEY, {
    algorithm: 'HS256',
    expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 168,
  });

  return [token, refreshToken];
};
