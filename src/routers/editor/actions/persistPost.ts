import { Request, Response } from 'express';
import joi from 'joi';
import slugify from 'slugify';
import { getRepository } from 'typeorm';

import enrichPost from '../../../utils/enrichPost';
import { Editor } from '../../../entities/editor';
import { Post, PostState } from '../../../entities/post';

const validationSchema = joi
  .object({
    title: joi.string().min(3).max(164).required(),
    subtitle: joi.string().min(3).max(248).allow('').required(),
    content: joi.string().required(),
    slug: joi.string().allow('').required(),
    state: joi.string().allow(...Object.keys(PostState), '').only().optional(),
    coverImage: joi.string().alphanum().allow('').optional(),
  })
  .strict(true)
  .unknown(false);

export default async (req: Request, res: Response) => {
  const { uuid, ...values } = req.body;
  const commonOptions = {
    pageTitle: uuid ? 'Edit post' : 'New post',
    prefill: values,
    postUUID: req.params.uuid,
  }

  const { error } = validationSchema.validate(values);

  if (error) {
    console.log(error)
    return res.status(400).render('editor/postEdit', {
      ...commonOptions,
      formErrors: 'unknown',
    });
  }

  const postRepository = getRepository(Post);
  let post: Post = new Post();
  const slug = values.slug || slugify(values.title, {trim: true, lower: true, strict: true});

  if (req.params.uuid) {
    const { error: uuidError } = joi.string().uuid().validate(req.params.uuid);

    if (uuidError) {
      return res.status(404).send('Invalid UUID');
    }

    const existingPost = await postRepository.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });

    if (!existingPost) {
      return res.status(404).send('Requested post does not exist');
    }

    post = existingPost;
  } else {
    const existingSlug = await postRepository.count({
      where: {
        slug,
      },
    });

    if (existingSlug) {
      return res.status(400).render('editor/postEdit', {
        ...commonOptions,
        formErrors: 'slug',
      });
    }
  }

  post.title = values.title;
  post.subtitle = values.subtitle;
  post.content = values.content;
  post.slug = slug;
  post.state = values.state || PostState.DRAFT;
  post.coverImage = values.coverImage || null;

  if (!req.params.uuid) {
    const editorRepository = getRepository(Editor);
    const editor = await editorRepository.findOne({
      where: {
        uuid: res.locals.editor.uuid,
      },
    });

    if (!editor) {
      return res.status(500).send('Unknown error');
    }

    post.author = editor;
  }

  await postRepository.save(post);

  return res.render('editor/postEdit', {
    ...commonOptions,
    success: true,
    prefill: enrichPost(post),
    postUUID: post.uuid,
  });
};