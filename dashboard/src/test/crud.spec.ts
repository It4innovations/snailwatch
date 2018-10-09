import {createStore} from 'redux';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createCrudActions, createCrudReducer} from '../util/crud';
import {createRequest, Request} from '../util/request';

describe('createCrudReducer', () => {
    interface Item {
        id: string;
        data: number;
    }
    interface State {
        items: Item[];
        request: Request;
    }

    const actions = createCrudActions<Item>('test');
    const createReducer = <P, S, E>(state: Partial<State> = {}) =>
    {
        let reducer = reducerWithInitialState<State>({
            items: [] as Item[],
            request: createRequest(),
            ...state
        });

        return createCrudReducer(reducer, actions, 'items', (s: State) => s.request).build();
    };

    it('Replaces item array after load', () => {
        const reducer = createReducer({
            items: [{ id: '1', data: 5 }]
        });
        const store = createStore(reducer);

        const items = [{ id: '2', data: 8 }];
        store.dispatch(
            actions.load.done({
                params: {},
                result: items
            })
        );

        expect(store.getState().items).toEqual(items);
    });
    it('Adds new item after create', () => {
        const items = [{ id: '1', data: 5 }, { id: '2', data: 3 }];
        const reducer = createReducer({ items });
        const store = createStore(reducer);

        const item = { id: '3', data: 8 };
        store.dispatch(
            actions.create.done({
                params: item,
                result: item
            })
        );

        expect(store.getState().items).toEqual([...items, item]);
    });
    it('Updates only the correct item after update', () => {
        const items = [{ id: '1', data: 5 }, { id: '2', data: 3 }, { id: '3', data: 4 }];
        const reducer = createReducer({ items });
        const store = createStore(reducer);

        const item = { id: '2', data: 8 };
        store.dispatch(
            actions.update.done({
                params: item,
                result: item
            })
        );

        expect(store.getState().items).toEqual([
            items[0],
            item,
            items[2]
        ]);
    });
    it('Delete the correct item after delete', () => {
        const items = [{ id: '1', data: 5 }, { id: '2', data: 3 }, { id: '3', data: 4 }];
        const reducer = createReducer({ items });
        const store = createStore(reducer);

        const item = { id: '2', data: 8 }; // identity is recognized by id
        store.dispatch(
            actions.delete.done({
                params: item,
                result: true
            })
        );

        expect(store.getState().items).toEqual([
            items[0],
            items[2]
        ]);
    });
});
