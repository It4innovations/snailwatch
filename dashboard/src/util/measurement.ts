function removeValue(value: string): string
{
    if (value.startsWith('result.') && value.endsWith('.value'))
    {
        return value.substring(0, value.indexOf('.value'));
    }
    return value;
}
function removePrefix(value: string): string
{
    const index = value.indexOf('.');
    if (index !== -1)
    {
        return value.substring(index + 1);
    }
    return value;
}

export function formatKey(key: string): string
{
    return removePrefix(removeValue(key));
}

export function getResultKeys(keys: string[]): string[]
{
    return keys.filter(key => key.match(/^result\..*(?<!type)$/));
}
