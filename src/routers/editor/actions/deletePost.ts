import { Request, Response } from 'express';
import joi from 'joi';
import { getRepository } from 'typeorm';
import { Post } from '../../../entities';
import formatDate from '../../../utils/formatDate';

export default (actionConfirmed: boolean = false) => async (req: Request, res: Response) => {
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

  if (actionConfirmed) {
    await postRepository.remove(post);
    return res.redirect('/editor/posts');
  }

  return res.render('editor/postDeleteDialog', {
    pageTitle: 'Delete post',
    postUUID: post.uuid,
    postTitle: post.title,
  });
};