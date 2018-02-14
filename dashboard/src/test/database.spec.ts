import {createDatabase, getDatabaseItems, mergeDatabase} from '../util/database';

describe('Database', () =>
{
    it('Is created from an array of items', () =>
    {
        const items = [{
            id: '1',
            data: 1
        }, {
            id: '2',
            data: 8
        }, {
            id: '3',
            data: 5
        }];
        const db = createDatabase(items);
        expect(db.keys.length).toEqual(items.length);
        expect(getDatabaseItems(db)).toEqual(items);
        expect(db.items['1']).toEqual(items[0]);
        expect(db.items['2']).toEqual(items[1]);
        expect(db.items['3']).toEqual(items[2]);
    });

    it('Is respects the provided key extractor', () =>
    {
        const items = [{
            identifier: '1',
            data: 1
        }, {
            identifier: '2',
            data: 8
        }, {
            identifier: '3',
            data: 5
        }];
        const db = createDatabase(items, i => i.identifier);
        expect(db.keys.length).toEqual(items.length);
        expect(getDatabaseItems(db)).toEqual(items);
    });

    it('Merge overwrites old values', () =>
    {
        const items = [{
            id: '1',
            data: 1
        }, {
            id: '2',
            data: 8
        }, {
            id: '3',
            data: 5
        }];
        const db = createDatabase(items);

        const newItems = [{
            id: '1',
            data: 10
        }, {
            id: '2',
            data: 80
        }, {
            id: '4',
            data: 50
        }];

        const newDb = mergeDatabase(db, newItems);
        expect(newDb.keys.length).toEqual(4);
        expect(newDb.items['1'].data).toEqual(10);
        expect(newDb.items['2'].data).toEqual(80);
        expect(newDb.items['3'].data).toEqual(5);
        expect(newDb.items['4'].data).toEqual(50);
    });
});
