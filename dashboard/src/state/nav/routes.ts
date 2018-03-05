export class Routes
{
    static Login = '/login';
    static Logout = '/logout';
    static Projects = '/projects';
    static Profile = '/profile';
}

export class Navigation
{
    static Login = Routes.Login;
    static Logout = Routes.Logout;
    static Projects = Routes.Projects;
    static Profile = Routes.Profile;
}

export function projectRoute(name: string)
{
    return `${Navigation.Projects}/${name}`;
}
