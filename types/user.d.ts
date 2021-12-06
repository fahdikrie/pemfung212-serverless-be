import { ObjectId } from 'mongodb';

export interface UserData {
  _id?: ObjectId;
  name: string;
  userid?: string;
  fullname: string;
  username: string;
  password: string;
  token?: string;
  refreshtoken?: string;
}
