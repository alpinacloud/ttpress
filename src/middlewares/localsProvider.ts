import { Request, Response, NextFunction } from 'express';
import { Setting } from '../entities';
import { getRepository } from 'typeorm';
import getDefaultTheme from '../utils/getDefaultTheme';

export default async (_: Request, res: Response, next: NextFunction) => {
  const settingRepository = getRepository(Setting);
  const settings = await settingRepository.find();

  const theme = settings.find(s => s.key === 'theme');

  if (!theme) {
    res.locals.prefs = {
      theme: getDefaultTheme(),
    };

    return next();
  }

  res.locals.prefs = {
    site: settings.find(s => s.key === 'site')?.value,
    analytics: settings.find(s => s.key === 'analytics')?.value,
    theme: theme.value,
  };

  return next();
}