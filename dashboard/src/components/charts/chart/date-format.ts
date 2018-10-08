export const DATE_FORMAT_MONTH = 'MM.YYYY';
export const DATE_FORMAT_DAY = 'DD.MM.YYYY';
export const DATE_FORMAT_HOUR = 'DD.MM.YYYY HH[h]';

export type DateFormat = typeof DATE_FORMAT_MONTH | typeof DATE_FORMAT_HOUR | typeof DATE_FORMAT_DAY;
