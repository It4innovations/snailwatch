import moment, {isMoment} from 'moment';
import {deserializeDates, serializeDates} from '../util/date';

describe('serializeDates', () =>
{
    it('Should serialize moment.js dates recursively', () =>
    {
        const data = {
            a: moment('2013-02-08 09:30:26'),
            b: [
                moment('2013-01-03 04:30:26'),
                moment('2013-02-04 11:38:37')
            ]
        };

        expect(serializeDates(data)).toEqual({
            a: '08.02.2013T09:30:26',
            b: [
                '03.01.2013T04:30:26',
                '04.02.2013T11:38:37'
            ]
        });
    });
});

describe('deserializeDates', () =>
{
    it('Should deserialize moment.js dates recursively', () =>
    {
        const data = {
            a: '08.02.2013T09:30:26',
            b: [
                '03.01.2013T04:30:26',
                '04.02.2013T11:38:37'
            ]
        };

        const deserialized = deserializeDates(data);
        expect(isMoment(deserialized['a']));
        expect(isMoment(deserialized['b'][0]));
        expect(isMoment(deserialized['b'][1]));

        expect(deserialized['a'].format('DD.MM.YYYY HH:mm:ss')).toEqual('08.02.2013 09:30:26');
    });
});
