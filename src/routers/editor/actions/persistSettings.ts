import { Request, Response } from 'express';
import joi from 'joi';
import { getRepository } from 'typeorm';
import fs from 'fs';

import { Setting } from '../../../entities';

export const analyticsValidationSchema = {
  alpinaWebsiteUUID: joi.string().uuid().allow('').optional(),
}

export const siteValidationSchema = {
  websiteName: joi.string().min(3).max(24).required(),
  websiteDescription: joi.string().min(3).max(320).required(),
  credit: joi.string().allow('on', 'off').required(),
  homepageStyle: joi.string().allow('news', 'blog').required(),
  coverInPosts: joi.string().allow('on', 'off').required(),
  showPostUpdateDate: joi.string().allow('on', 'off').required(),
  injectCustomJS: joi.string().allow('').required(),
};

const colorRegex = /(#([\da-f]{3}){1,2}|(rgb|hsl)a\((\d{1,3}%?,\s?){3}(1|0?\.\d+)\)|(rgb|hsl)\(\d{1,3}%?(,\s?\d{1,3}%?){2}\))/i;
const themeValidationSchema = {
  bgColor: joi.string().regex(colorRegex).required(),
  primaryColor: joi.string().regex(colorRegex).required(),
  primaryColorText: joi.string().regex(colorRegex).required(),
  outlineColor: joi.string().regex(colorRegex).required(),
  borderColor: joi.string().regex(colorRegex).required(),
  textHeadingColor: joi.string().regex(colorRegex).required(),
  textColor: joi.string().regex(colorRegex).required(),
  textMutedColor: joi.string().regex(colorRegex).required(),
  successColor: joi.string().regex(colorRegex).required(),
  errorColor: joi.string().regex(colorRegex).required(),
  borderRadius: joi.string().required(),
}

const validationSchema = joi
  .object({
    ...themeValidationSchema,
    ...siteValidationSchema,
    ...analyticsValidationSchema,
  })
  .strict(true)
  .unknown(false);

const assignBodyToSetting = (validationSchema: object, body: Record<string, string>) => {
  let result: Record<string, string> = {};

  Object.keys(body).forEach(key => {
    if (Object.keys(validationSchema).includes(key)) {
      result[key] = body[key];
    }
  });

  return result;
}

export default async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const faviconFile = files && files.find(f => f.fieldname === 'favicon');
  const logoFile = files && files.find(f => f.fieldname === 'logo');

  if (logoFile && !['image/jpeg', 'image/png'].includes(logoFile.mimetype)) {
    return fs.rm(logoFile.path, () => {
      return res.status(400).end('Invalid logo file type, only .png and .jpeg are accepted');
    });
  }

  if (faviconFile && faviconFile.mimetype !== 'image/x-icon') {
    return fs.rm(faviconFile.path, () => {
      return res.status(400).end('Invalid favicon file type, only .ico is accepted');
    });
  }

  const { error } = validationSchema.validate(req.body);

  if (error) {
    return res.status(400).render('editor/settings', {
      pageTitle: 'Settings',
      formErrors: true,
      prefill: req.body,
    });
  }

  const settingRepository = getRepository(Setting);
  const settings = await settingRepository.find();

  const site = settings.find(({ key }) => key === 'site');
  const theme = settings.find(({ key }) => key === 'theme');
  const analytics = settings.find(({ key }) => key === 'analytics');

  const newTheme = assignBodyToSetting(themeValidationSchema, req.body);
  theme!.value = newTheme;

  site!.value = {
    ...res.locals.prefs.site,
    ...assignBodyToSetting(siteValidationSchema, req.body),
  };

  analytics!.value = {
    ...res.locals.prefs.analytics,
    ...assignBodyToSetting(analyticsValidationSchema, req.body),
  }

  if (logoFile) {
    site!.value.logo = logoFile.filename;
  }

  if (faviconFile) {
    site!.value.favicon = faviconFile.filename;
  }

  await settingRepository.save([theme!, site!, analytics!]);

  res.locals.prefs = {
    ...res.locals.prefs,
    theme: newTheme,
  };

  return res.render('editor/settings', {
    pageTitle: 'Settings',
    success: true,
    prefill: {
      ...req.body,
      logo: logoFile ? logoFile.filename : res.locals.prefs.site.logo,
      favicon: faviconFile ? faviconFile.filename : res.locals.prefs.site.faviconFile,
    },
  });
};