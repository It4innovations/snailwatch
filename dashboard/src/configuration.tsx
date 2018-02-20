const apiHost = window['API_HOST'];

export const API_SERVER = apiHost !== undefined && apiHost !== '{{API_HOST}}' ? apiHost : 'http://localhost:5000';
