import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import joi from 'joi';

import { Editor, Setting } from '../../../entities';
import getDefaultTheme from '../../../utils/getDefaultTheme';
import { PermissionType } from '../../../entities/editor';
import { siteValidationSchema } from './persistSettings';

export const usernameValidator = joi.string().min(4).max(24).required();
export const passwordValidator = joi.string().min(8).max(48).required();

const validationSchema = joi
  .object({
    username: usernameValidator,
    pwd: passwordValidator,
    pwdRepeat: joi.string().min(8).max(48).required(),
    websiteName: siteValidationSchema.websiteName,
    websiteDescription: siteValidationSchema.websiteDescription,
  })
  .strict(true)
  .unknown(false);
  
export default async (req: Request, res: Response) => {
  const values = {
    ...req.body,
    username: (req.body.username || '').trim(),
    websiteName: (req.body.websiteName || '').trim(),
  };

  const { error } = validationSchema.validate(values);

  if (error || values.pwd !== values.pwdRepeat) {
    return res.status(400).render('editor/installer', {
      pageTitle: 'Installation',
      withoutHeader: true,
      formErrors: true,
      prefill: {
        websiteName: values.websiteName,
        websiteDescription: values.websiteDescription,
        username: values.username,
      },
    });
  }

  bcrypt.hash(values.pwd, 16, async (err, hash) => {
    if (err) {
      return res.status(500).send('Something went wrong');
    }

    const editorRepository = getRepository(Editor);
    const settingRepository = getRepository(Setting);

    const editor = new Editor();
    editor.username = values.username;
    editor.pwd = hash;
    editor.permissionType = PermissionType.SUPERADMIN;

    const analytics = new Setting();
    analytics.key = 'analytics';
    analytics.value = {
      alpinaWebsiteUUID: '',
    };

    const site = new Setting();
    site.key = 'site';
    site.value = {
      websiteName: values.websiteName,
      websiteDescription: values.websiteDescription,
      logo: null,
      favicon: null,
      credit: 'on',
      coverInPosts: 'on',
      showPostUpdateDate: 'on',
      homepageStyle: 'blog',
      injectCustomJS: '',
    };

    const theme = new Setting();
    theme.key = 'theme';
    theme.value = getDefaultTheme();

    await settingRepository.save([site, theme, analytics]);
    await editorRepository.save(editor);

    return res.redirect('/editor/login');
  });
}