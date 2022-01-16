import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { Editor } from '../entities/editor';

export default async (req: Request, res: Response, next: NextFunction) => {
  const editorRepository = getRepository(Editor);
  const editors = await editorRepository.count();

  if (editors === 0 && !req.path.startsWith('/editor/installer')) {
      return res.redirect('/editor/installer');
  }

  if (editors && req.path.startsWith('/editor/installer')) {
    return res.redirect('/editor/posts');
  }

  return next();
}