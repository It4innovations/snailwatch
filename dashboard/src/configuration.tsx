function parseVariable(name: string, defaultValue: string = ''): string
{
    const variable = window[name];
    return (variable !== undefined && variable !== `{{${name}}}`) ? variable : defaultValue;
}

export const API_SERVER = parseVariable('API_SERVER', 'http://localhost:5000');
export const URL_PREFIX = parseVariable('URL_PREFIX', '/');
