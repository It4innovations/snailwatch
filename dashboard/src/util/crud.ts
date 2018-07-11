import actionCreatorFactory, {AsyncActionCreators, Action, AnyAction, Failure, Meta, Success} from 'typescript-fsa';

interface OptionalCreator<P> {
    type: string;
    match: (action: AnyAction) => action is Action<P>;
    (payload?: P, meta?: Meta): Action<P>;
}

interface OptionalActionsCreator<P, S = {}, E = {}> {
    type: string;
    started: OptionalCreator<P>;
    done: OptionalCreator<Success<P, S>>;
    failed: OptionalCreator<Failure<P, E>>;
}

export interface CrudActionWrapper<T>
{
    load: OptionalActionsCreator<{}, T[], {}>;
    create: AsyncActionCreators<T, T, {}>;
    update: AsyncActionCreators<T, boolean, {}>;
    delete: AsyncActionCreators<T, boolean, {}>;
}

export function createCrudActions<T>(name: string): CrudActionWrapper<T>
{
    const creator = actionCreatorFactory(name);

    return {
        load: creator.async<{}, T[]>('load') as OptionalActionsCreator<{}, T[], {}>,
        create: creator.async<T, T>('create'),
        update: creator.async<T, boolean>('update'),
        delete: creator.async<T, boolean>('delete')
    };
}
