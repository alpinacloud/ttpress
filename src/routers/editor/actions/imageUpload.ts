import { Request, Response } from 'express';
import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

export default async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || (files && !files[0])) {
    return res.status(400).send('No files were provided');
  }

  const file = files[0];
  if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
    return fs.rm(file.path, () => {
      return res.status(400).end('Invalid file type');
    });
  }

  const sizes = req.body.isPostImg ? [] : [300, 1000];
  const promises = [];

  for (let size of sizes) {
    promises.push(sharp(path.resolve(process.env.DISK_STORAGE as string, file.filename))
      .resize({
        fit: sharp.fit.cover,
        position: sharp.strategy.attention,
        width: size,
        height: size,
      })
      .jpeg({ quality: 100 })
      .toFile(path.resolve(process.env.DISK_STORAGE as string, `${file.filename}_${size}`))
    );
  }

  Promise.all(promises)
    .then(() => {
      return res.status(200).end(file.filename);
    })
    .catch(() => {
      return res.status(400).end('Unable to generate miniatures');
    })
  ;
}