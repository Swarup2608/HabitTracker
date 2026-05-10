import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const startOfDayUTC = (d: Date | string = new Date()) =>
  dayjs.utc(d).startOf('day').toDate();

export const dayKey = (d: Date | string = new Date()) =>
  dayjs.utc(d).format('YYYY-MM-DD');

export const daysBetween = (a: Date, b: Date) =>
  Math.abs(dayjs.utc(a).startOf('day').diff(dayjs.utc(b).startOf('day'), 'day'));

export { dayjs };
