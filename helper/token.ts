import jwt from 'jsonwebtoken';
import * as mongoDb from 'mongodb';

import { JWTSignedData } from '../types/jwt';
import { UserData } from '../types/user';

const SECRET_KEY = process.env.SECRET_KEY as string;
const HOUR = Math.floor(Date.now() / 1000) + 60 * 60;

export const generateToken = (user: mongoDb.Document | UserData) => {
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
    expiresIn: HOUR * 24,
  });

  const refreshToken = jwt.sign(tokenDataRefresh, SECRET_KEY, {
    algorithm: 'HS256',
    expiresIn: HOUR * 168,
  });

  return [token, refreshToken];
};
