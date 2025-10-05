import jwt from "jsonwebtoken";
const { sign, verify } = jwt;

export const encode = (payload) => {
  return sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' })
}

export const verifyToken = (token) => {
  // console.log(token);
  return verify(token, process.env.JWT_SECRET || 'secret')
}