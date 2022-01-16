import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import { Editor } from '../entities';
import { getCookie } from '../utils/cookies';

export const AUTH_COOKIE_KEY = 'ttpress_acto';

export default async (req: Request, res: Response, next: NextFunction) => {
  const token = getCookie(req, AUTH_COOKIE_KEY);

  const fail = () => res.redirect('/editor/login');

  if (!token) {
    return fail();
  }

  try {
    const data = jwt.verify(token as string, process.env.JWT_SECRET as string) as { u: string };

    if (typeof data.u !== 'string') {
      return fail();
    }

    const editorRepository = getRepository(Editor);
    const editorProfile = await editorRepository.findOne({
      where: {
        uuid: data.u,
      },
    });

    if (!editorProfile) {
      return fail();
    }

    res.locals.editor = {
      uuid: editorProfile.uuid,
      name: editorProfile.name,
    };

    return next();
  } catch {
    return fail();
  }
}