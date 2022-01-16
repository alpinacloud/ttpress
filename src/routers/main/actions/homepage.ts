import { Request, Response } from 'express';
import clone from 'lodash/clone';
import { getRepository } from 'typeorm';
import { Post, PostState } from '../../../entities/post';
import enrichPost from '../../../utils/enrichPost';

export default async (req: Request, res: Response) => {
  const pageQuery = typeof req.query.page === 'string' ? parseInt(req.query.page) : 0;
  const page = pageQuery >= 0 ? pageQuery : 0;

  const limit = 10;
  const offset = limit * page;

  const postRepository = getRepository(Post);
  const posts = await postRepository.find({
    where: {
      state: PostState.PUBLISHED,
    },
    order: {
      createdAt: 'DESC',
    },
    take: limit * 2,
    skip: offset,
  });

  if (!posts.length && page > 0) {
    return res.redirect('/');
  }

  const previousPage = page > 0 ? page - 1 : null;
  const nextPage = (posts.length > limit) ? (page + 1) : null;

  return res.render('index', {
    pageTitle: res.locals.prefs.site.websiteName,
    mainPostUUID: posts.length ? posts[0].uuid : null,
    posts: posts.splice(0, limit).map(enrichPost),
    page: page + 1,
    previousPage,
    nextPage,
  });
}