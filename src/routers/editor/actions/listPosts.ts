import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { Post } from '../../../entities';
import enrichPost from '../../../utils/enrichPost';

export default async (_: Request, res: Response) => {
  const postRepository = getRepository(Post);
  const posts = await postRepository.find({
    relations: ['author'],
    order: {
      createdAt: 'DESC',
    }
  });

  res.render('editor/posts', {
    pageTitle: 'Posts',
    posts: posts.map(enrichPost),
  });
};