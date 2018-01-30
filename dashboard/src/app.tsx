import React, {PureComponent} from 'react';
import {Provider} from 'react-redux';
import {store, history, persistor} from './state/app/store';
import {ConnectedRouter} from 'react-router-redux';
import {Content} from './components/content/content';
import {PersistGate} from 'redux-persist/lib/integration/react';

export class App extends PureComponent
{
    render()
    {
        return (
            <Provider store={store}>
                <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
                    <ConnectedRouter history={history}>
                        <Content />
                    </ConnectedRouter>
                </PersistGate>
            </Provider>
        );
    }
}
