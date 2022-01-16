import { Request, Response } from 'express';
import { Feed } from 'feed';
import { getRepository } from 'typeorm';
import { Post, PostState } from '../../../entities/post';

export default async (req: Request, res: Response) => {
  const kind = req.params.kind;

  const postRepository = getRepository(Post);
  const posts = await postRepository.find({
    where: {
      state: PostState.PUBLISHED,
    },
    order: {
      createdAt: 'DESC',
    },
  });

  const feed = new Feed({
    title: res.locals.prefs.site.websiteName,
    id: req.hostname,
    link: res.locals.baseURL,
    description: res.locals.prefs.site.websiteDescription,
    image: res.locals.prefs.site.logo ? `${res.locals.baseURL}/i/${res.locals.prefs.site.logo}` : undefined,
    favicon: res.locals.prefs.site.favicon ? `${res.locals.baseURL}/i/${res.locals.prefs.site.favicon}` : undefined,
    copyright: res.locals.prefs.site.websiteName,
    updated: posts.length ? posts[0].createdAt : undefined,
    feedLinks: {
      json: `${res.locals.baseURL}/feed/json`,
      atom: `${res.locals.baseURL}/feed/atom`,
    },
    generator: 'ttpress',
  });

  for (let post of posts) {
    feed.addItem({
      title: post.title,
      id: post.slug,
      link: `${res.locals.baseURL}/p/${post.slug}`,
      date: post.createdAt,
      content: post.content,
      image: `${res.locals.baseURL}/i/${post.coverImage}`,
      published: post.createdAt,
      // author: post.author,
    });
  }

  const fnc = kind === 'rss' ? feed.rss2 : kind === 'atom' ? feed.atom1 : feed.json1;
  return res.status(200).end(fnc());
}