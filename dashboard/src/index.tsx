// CSS
import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './app';

import 'bootstrap/dist/css/bootstrap.css';
import 'react-table/react-table.css';
import 'react-tabs/style/react-tabs.css';
import 'react-day-picker/lib/style.css';

import json from 'react-syntax-highlighter/languages/hljs/json';
import {registerLanguage} from 'react-syntax-highlighter/light';
registerLanguage('json', json);

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
// registerServiceWorker();
