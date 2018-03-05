export class Routes
{
    static Login = '/login';
    static Projects = '/projects';
    static Profile = '/profile';
}

export class Navigation
{
    static Login = Routes.Login;
    static Projects = Routes.Projects;
    static Profile = Routes.Profile;
}

export function projectRoute(name: string)
{
    return `${Navigation.Projects}/${name}`;
}
