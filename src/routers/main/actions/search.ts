import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import enrichPost from '../../../utils/enrichPost';
import { Post, PostState } from '../../../entities/post';
import stripHTML from '../../../utils/stripHTML';

export default async (req: Request, res: Response) => {
  const { q } = req.query;
  const commonOptions = {
    pageTitle: 'Search',
    searchMode: true,
  }

  const fail = (specificError?: string) => res.render('index', {
    ...commonOptions,
    specificError,
    posts: [],
  });
  
  if (typeof q !== 'string') {
    return fail();
  }

  if (q.length < 3) {
    return fail('too_short');
  }

  if (/[#^*(),."'?{}|<>]/g.test(q)) {
    return fail();
  }

  const postRepository = getRepository(Post);
  const posts = await postRepository.find({
    where: {
      state: PostState.PUBLISHED,
    },
    order: {
      createdAt: 'DESC',
    },
  });

  const found = posts.filter(p =>
    p.title
      .toLowerCase()
      .includes(q) ||
    p.subtitle
      .toLowerCase()
      .includes(q) ||
    stripHTML(p.content)
      .toLowerCase()
      .includes(q)
  );
  
  return res.render('index', {
    ...commonOptions,
    posts: found.map(enrichPost),
  });
};