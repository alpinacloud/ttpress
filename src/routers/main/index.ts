import { Router } from 'express';

import homepageAction from './actions/homepage';
import readPostAction from './actions/readPost';
import getImageAction from './actions/getImage';
import getFeedAction from './actions/getFeed';
import searchAction from './actions/search';

export default Router()
  .get('/', homepageAction)
  .get('/p/:slug', readPostAction)
  .get('/i/:filename', getImageAction)
  .get('/feed/:kind(rss|atom|json)', getFeedAction)
  .get('/search', searchAction)
;