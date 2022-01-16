import { Router } from 'express';
import cookieParser from 'cookie-parser';
import multer from 'multer';

import editorAuthMiddleware from '../../middlewares/editorAuth';

import installerCompleteAction from './actions/install';
import loginAction from './actions/login';
import logoutAction from './actions/logout';
import persistSettingsAction from './actions/persistSettings';
import persistPostAction from './actions/persistPost';
import listPosts from './actions/listPosts';
import editOrCreatePostAction from './actions/editOrCreatePost';
import deletePostAction from './actions/deletePost';
import imageUploadAction from './actions/imageUpload';
import persistProfileAction from './actions/persistProfile';

const multerMiddleware = multer({
  storage: multer.diskStorage({
    destination: function (_, __, cb) {
      cb(null, process.env.DISK_STORAGE as string)
    },
  })
}).any();

export default Router()
  .use(cookieParser(!!process.env.COOKIE_SECRET ? process.env.COOKIE_SECRET : undefined))
  
  // Public
  .get('/login', (_, res) => res.render('editor/login', {
    withoutHeader: true,
    pageTitle: 'Editor login',
  }))
  .post('/login', loginAction)

  .get('/installer', (_, res) => res.render('editor/installer', {
    withoutHeader: true,
    pageTitle: 'Installation',
  }))
  .post('/installer', installerCompleteAction)


  // Authorized
  .use(editorAuthMiddleware)
  
  .get('/settings', (_, res) => res.render('editor/settings', { pageTitle: 'Settings' }))
  .post('/settings', multerMiddleware, persistSettingsAction)
  .get('/profile', (_, res) => res.render('editor/profile', { pageTitle: 'Author profile' }))
  .post('/profile', persistProfileAction)

  .get('/posts', listPosts)
  .get('/posts/new', editOrCreatePostAction)
  .post('/posts/new', persistPostAction)
  .get('/posts/:uuid', editOrCreatePostAction)
  .post('/posts/:uuid', persistPostAction)
  .get('/posts/:uuid/delete', deletePostAction(false))
  .get('/posts/:uuid/delete/confirm', deletePostAction(true))
  
  .get('/logout', logoutAction)
  .put('/image-upload', multerMiddleware, imageUploadAction)

  .use('*', (_, res) => res.redirect(!!res.locals.editor ? '/editor/posts' : '/editor/login'))
;