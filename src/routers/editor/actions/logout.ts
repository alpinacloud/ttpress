import { Request, Response } from 'express';
import { removeCookie } from '../../../utils/cookies';
import { AUTH_COOKIE_KEY } from '../../../middlewares/editorAuth';

export default async (_: Request, res: Response) => {
  removeCookie(res, AUTH_COOKIE_KEY);
  return res.redirect('/');
};