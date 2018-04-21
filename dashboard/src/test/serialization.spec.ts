import moment, {isMoment} from 'moment';
import {deserializeDates, serializeDates} from '../util/date';

describe('serializeDates', () =>
{
    it('Should serialize moment.js dates recursively', () =>
    {
        const data = {
            a: moment('2013-02-08 09:30:26'),
            b: [
                moment('2013-01-03 09:30:26'),
                moment('2013-02-04 09:30:26')
            ]
        };

        expect(serializeDates(data)).toEqual({
            a: '2013-02-08T08:30:26.000Z',
            b: [
                '2013-01-03T08:30:26.000Z',
                '2013-02-04T08:30:26.000Z'
            ]
        });
    });
});

describe('deserializeDates', () =>
{
    it('Should deserialize moment.js dates recursively', () =>
    {
        const data = {
            a: '2013-02-08T08:30:26.000Z',
            b: [
                '2013-01-03T08:30:26.000Z',
                '2013-02-04T08:30:26.000Z'
            ]
        };

        const deserialized = deserializeDates(data);
        expect(isMoment(deserialized['a']));
        expect(isMoment(deserialized['b'][0]));
        expect(isMoment(deserialized['b'][1]));

        expect(deserialized['a'].toISOString()).toEqual(data.a);
    });
});
