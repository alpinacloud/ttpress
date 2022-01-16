import { Request, Response, CookieOptions } from 'express';

const defaultOptions: CookieOptions = {
  httpOnly: false,
  signed: !!process.env.COOKIE_SECRET,
  secure: !!process.env.COOKIE_SECRET,
  domain: process.env.COOKIE_DOMAIN,
  sameSite: 'strict',
};

export const setCookie = (res: Response, name: string, value: string, expireIn: number) => {
  return res.cookie(name, value, {
    expires: new Date(Date.now() + expireIn),
    ...defaultOptions,
  });
};

export const getCookie = (req: Request, name: string) => {
  return (req[!!process.env.COOKIE_SECRET ? 'signedCookies' : 'cookies'] || {})[name];
};

export const removeCookie = (res: Response, name: string) => {
  return res.clearCookie(name, defaultOptions);
};
