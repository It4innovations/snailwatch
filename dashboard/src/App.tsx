import React, {PureComponent} from 'react';
import {Provider} from 'react-redux';
import {store, history} from './lib/state/store';
import {ConnectedRouter} from 'react-router-redux';
import {Link} from 'react-router-dom';
import {Route} from 'react-router';
import {Routes} from './lib/nav/routes';
import {LoginScreen} from './components/login-screen/login-screen';

import styles from './App.scss';

export class App extends PureComponent
{
    render()
    {
        return (
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <div className={styles.app}>
                        <ul className='nav nav-pills'>
                            <li><Link to={'/'}>Home</Link></li>
                        </ul>
                        <div className='content'>
                            <Route path={Routes.Root} exact component={LoginScreen}/>
                        </div>
                    </div>
                </ConnectedRouter>
            </Provider>
        );
    }
}
