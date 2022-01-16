import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Post, PostState } from '../../../entities/post';
import enrichPost from '../../../utils/enrichPost';

export default async (req: Request, res: Response) => {
  const postRepository = getRepository(Post);
  const post = await postRepository.findOne({
    relations: ['author'],
    where: {
      slug: req.params.slug,
      state: PostState.PUBLISHED,
    },
  });

  if (!post) {
    return res.redirect('/404');
  }

  return res.render('post', {
    pageTitle: `${post.title} - ${res.locals.prefs.site.websiteName}`,
    post: enrichPost(post),
  });
}