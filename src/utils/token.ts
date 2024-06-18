import { Document, Types } from "mongoose";
import { IToken, Token } from "../models/Token";

export const generateUniqueToken = async () => {
  let tokenValue: string;
  let tokenExists: Document<unknown, {}, IToken> &
    IToken & {
      _id: Types.ObjectId;
    };

  do {
    tokenValue = generateToken();
    tokenExists = await Token.findOne({ token: tokenValue });
  } while (tokenExists);

  return tokenValue;
};

export const generateToken = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
