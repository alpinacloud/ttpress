import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';

dayjs.extend(utcPlugin);

export default (value: Date, mentionUTC: boolean = true) => dayjs(value).utc().format(`DD.MM.YYYY HH:mm${mentionUTC ? ' (UTC)' : ''}`);