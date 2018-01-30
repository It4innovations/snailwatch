import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './app';
import registerServiceWorker from './registerServiceWorker';

// CSS
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
