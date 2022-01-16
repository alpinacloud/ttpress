import { Request, Response } from 'express';
import joi from 'joi';
import { getRepository } from 'typeorm';
import { Post } from '../../../entities';
import enrichPost from '../../../utils/enrichPost';

export default async (req: Request, res: Response) => {
  if (!req.params.uuid) {
    return res.render('editor/postEdit', {
      pageTitle: 'New post',
    });
  }

  const { error } = joi.string().uuid().validate(req.params.uuid);
  if (error) {
    return res.status(404).end('Not found');
  }

  const postRepository = getRepository(Post);
  const post = await postRepository.findOne({
    where: {
      uuid: req.params.uuid,
    },
  });

  if (!post) {
    return res.status(404).end('Not found');
  }

  return res.render('editor/postEdit', {
    pageTitle: 'Edit post',
    postUUID: req.params.uuid,
    prefill: enrichPost(post),
  });
};