// https://stackoverflow.com/a/3261380/1107768
export function isBlank(str: string)
{
    return (!str || /^\s*$/.test(str));
}
