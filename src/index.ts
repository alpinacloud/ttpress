import express from 'express';
import { engine } from 'express-handlebars';
import truncate from 'lodash/truncate';

import connectDatabase from './utils/connectDatabase';
import securityMiddlewares from './middlewares/security';
import stateMiddleware from './middlewares/state';
import mainRouter from './routers/main';
import editorRouter from './routers/editor';
import localsProviderMiddleware from './middlewares/localsProvider';

const handlebarsEngine = engine({
  layoutsDir: process.env.NODE_ENV === 'development' ? undefined : require('path').join(__dirname, 'views/layouts'),
  partialsDir: process.env.NODE_ENV === 'development' ? undefined : require('path').join(__dirname, 'views/partials'),
  helpers: {
    isOnPath: function(opts: any) {
      return opts.hash.target === opts.data.exphbs.view ? opts.fn(this) : opts.inverse(this);
    },
    isEq: function(opts: any) {
      return opts.hash.lh === opts.hash.rh ? opts.fn(this) : opts.inverse(this);
    },
    isInEditor: (opts: any) => {
      return opts.data.root.currentPath.startsWith('/editor/') ? opts.fn(this) : opts.inverse(this);
    },
    trunc: (opts: any) => {
      const { text, limit } = opts.hash;
      return truncate(text, { length: limit });
    },
    keywordify: (opts: any) => {
      return (opts.hash.text || '').split(' ').splice(0, 20);
    },
    rssIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 5C13.1797 5 19 10.8203 19 18M6 11C9.86599 11 13 14.134 13 18M7 18C7 18.5523 6.55228 19 6 19C5.44772 19 5 18.5523 5 18C5 17.4477 5.44772 17 6 17C6.55228 17 7 17.4477 7 18Z" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    searchIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g data-name="Layer 2"><g data-name="search"><rect width="24" height="24" opacity="0"/><path d="M20.71 19.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM5 11a6 6 0 1 1 6 6 6 6 0 0 1-6-6z"/></g></g></svg>`,
    checkmarkCircleIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g data-name="Layer 2"><g data-name="checkmark-circle"><rect width="24" height="24" opacity="0"/><path d="M9.71 11.29a1 1 0 0 0-1.42 1.42l3 3A1 1 0 0 0 12 16a1 1 0 0 0 .72-.34l7-8a1 1 0 0 0-1.5-1.32L12 13.54z"/><path d="M21 11a1 1 0 0 0-1 1 8 8 0 0 1-8 8A8 8 0 0 1 6.33 6.36 7.93 7.93 0 0 1 12 4a8.79 8.79 0 0 1 1.9.22 1 1 0 1 0 .47-1.94A10.54 10.54 0 0 0 12 2a10 10 0 0 0-7 17.09A9.93 9.93 0 0 0 12 22a10 10 0 0 0 10-10 1 1 0 0 0-1-1z"/></g></g></svg>`,
    alertTriangleIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g data-name="Layer 2"><g data-name="alert-triangle"><rect width="24" height="24" transform="rotate(90 12 12)" opacity="0"/><path d="M22.56 16.3L14.89 3.58a3.43 3.43 0 0 0-5.78 0L1.44 16.3a3 3 0 0 0-.05 3A3.37 3.37 0 0 0 4.33 21h15.34a3.37 3.37 0 0 0 2.94-1.66 3 3 0 0 0-.05-3.04zM12 17a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm1-4a1 1 0 0 1-2 0V9a1 1 0 0 1 2 0z"/></g></g></svg>`,
  },
});

const PORT = process.env.PORT || 4444;

const app = express();
if (process.env.NODE_ENV === 'production') {
  app.enable('view cache');
}

const start = async () => {
  await connectDatabase();

  app
    .use(...securityMiddlewares)
    .use((req, res, next) => {
      res.locals.baseURL = (process.env.NODE_ENV === 'production' ? 'https' : 'http') + '://' + req.headers.host;
      res.locals.currentPath = req.path;

      return next();
    })
    .engine('handlebars', handlebarsEngine)
    .set('view engine', 'handlebars')

    .use(express.static('public'))
    // .use(express.json())
    .use(express.urlencoded({extended: false, limit: '150mb'}))

    .use(stateMiddleware)
    .use(localsProviderMiddleware)
    .use('/editor', editorRouter)
    .use('/', mainRouter)

    .get('*', function(_, res) {
      return res.status(404).render('error', {
        pageTitle: 'Page not found',
        title: 'Page was not found',
        description: 'Yep, that\'s the dreaded 404',
      });
    })

    .listen(PORT, () =>
      console.log(`@ Running on ${PORT}`)
    );
};

start();