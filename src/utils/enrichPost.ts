import readingTime from 'reading-time';
import formatDate from './formatDate';
import stripHTML from './stripHTML';
import { Post } from '../entities';

export default (post: Post) => ({
  ...post,
  readTime: readingTime(post.content).text,
  createdAt: formatDate(post.createdAt),
  updatedAt: formatDate(post.updatedAt, false),
  textContent: stripHTML(post.content),
  author: post.author ? post.author.name : null,
});