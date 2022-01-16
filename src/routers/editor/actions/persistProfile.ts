import { Request, Response } from 'express';
import joi from 'joi';
import { getRepository } from 'typeorm';
import fs from 'fs';

import { Editor } from '../../../entities';

const validationSchema = joi
  .object({
    name: joi.string().min(3).max(64).required(),
  })
  .strict(true)
  .unknown(false);

export default async (req: Request, res: Response) => {
  const { error } = validationSchema.validate(req.body);
  const commonOptions = {
    pageTitle: 'Profile',
    prefill: req.body,
  }

  if (error) {
    return res.status(400).render('editor/profile', {
      ...commonOptions,
      formErrors: true,
    });
  }

  const editorRepository = getRepository(Editor);
  const editor = await editorRepository.findOne({
    where: {
      uuid: res.locals.editor.uuid,
    },
  });

  if (!editor) {
    return res.status(500).send('Unknown error');
  }

  editor.name = req.body.name;

  await editorRepository.save(editor);

  return res.render('editor/profile', {
    ...commonOptions,
    success: true,
  });
};