import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import joi from 'joi';

import { usernameValidator, passwordValidator } from './install';
import { Editor } from '../../../entities';
import { setCookie } from '../../../utils/cookies';
import { AUTH_COOKIE_KEY } from '../../../middlewares/editorAuth';

const validationSchema = joi
  .object({
    username: usernameValidator,
    pwd: passwordValidator,
  })
  .strict(true)
  .unknown(false);
  
export default async (req: Request, res: Response) => {
  const notFound = () => res.status(400).render('editor/login', {
    pageTitle: 'Login',
    withoutHeader: true,
    formErrors: true,
    prefill: {
      username: values.username,
    },
  });

  const values = {
    ...req.body,
    username: (req.body.username || '').trim(),
  };

  const { error } = validationSchema.validate(values);

  if (error) {
    return notFound();
  }

  const editorRepository = getRepository(Editor);
  const editor = await editorRepository.findOne({
    where: {
      username: values.username,
    },
  });

  if (!editor) {
    return notFound();
  }

  bcrypt.compare(values.pwd, editor.pwd, function(err, result) {
    if (err || !result) {
      return notFound();
    }

    const token = jwt.sign({u: editor.uuid}, process.env.JWT_SECRET as string, {
      expiresIn: '14d',
    });

    setCookie(res, AUTH_COOKIE_KEY, token, 1209600000);

    return res.redirect('/editor/posts');
  });
}