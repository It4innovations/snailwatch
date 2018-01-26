export class Routes
{
    static Login = '/login';
    static Projects = '/projects';
}

export class Navigation
{
    static Login = '/login';
    static Projects = '/projects';
}

export function projectRoute(id: string)
{
    return `${Navigation.Projects}/${id}`;
}
