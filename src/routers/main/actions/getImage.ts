import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import mmm, { Magic } from 'mmmagic';
import joi from 'joi';

export const getMimeType = async (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    var magic = new Magic(mmm.MAGIC_MIME_TYPE);
    magic.detectFile(path, (err, r) => {
      if (err) {
        return reject(err);
      }
      
      return resolve(r as string);
    });
  });
};

export default async (req: Request, res: Response) => {
  const { error } = joi.string().alphanum().validate(req.params.filename.replace(/_/g, ''));

  if (error) {
    return res.status(400).end('Not Found');
  }

  const targetFilePath = path.resolve(process.env.DISK_STORAGE as string, req.params.filename);
  if (!fs.existsSync(targetFilePath)) {
    return res.status(400).end('Not Found');
  }

  const mime = await getMimeType(targetFilePath);

  if (!mime) {
    return res.status(400).end('Not Found');
  }

  if (!['image/jpeg', 'image/png', 'image/x-icon'].includes(mime)) {
    return res.status(400).end('Not Found');
  }

  return res.sendFile(targetFilePath, {
    headers: {
      'content-type': mime,
    }
  });
}