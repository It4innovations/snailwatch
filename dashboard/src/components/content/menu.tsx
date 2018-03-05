import React, {PureComponent} from 'react';
import {Navigation} from '../../state/nav/routes';
import {RouteComponentProps, withRouter} from 'react-router';
import {
    Navbar, NavbarBrand, NavItem, Nav,
    UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import {Project} from '../../lib/project/project';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import MdSettings from 'react-icons/lib/md/settings';

interface Props
{
    authenticated: boolean;
    selectedProject: Project | null;
}

const Appbar = styled(Navbar)`
  margin-bottom: 5px;
  border-bottom: 1px solid #000000;
`;

class MenuComponent extends PureComponent<Props & RouteComponentProps<void>>
{
    render()
    {
        return (
            <Appbar expand='md'>
                <NavbarBrand>Snailwatch</NavbarBrand>
                <Nav navbar>
                    {this.publicLink('Login', Navigation.Login)}
                    {this.props.authenticated && this.renderAuthenticatedLinks()}
                    {this.props.authenticated && this.renderExpandableMenu()}
                </Nav>
            </Appbar>
        );
    }
    renderExpandableMenu = (): JSX.Element =>
    {
        const items: JSX.Element[] = [];

        if (this.props.selectedProject !== null)
        {
            items.push(
                <DropdownItem key='switch-project'>
                    <Link to={Navigation.Projects}>Switch project</Link>
                </DropdownItem>
            );
            items.push(<DropdownItem divider key='divider' />);
        }

        items.push(
            <DropdownItem key='logout'>
                <Link to={Navigation.Logout}>Sign out</Link>
            </DropdownItem>
        );

        return (
            <UncontrolledDropdown>
                <DropdownToggle>
                    <MdSettings />
                </DropdownToggle>
                <DropdownMenu>
                    {items}
                </DropdownMenu>
            </UncontrolledDropdown>
        );
    }
    renderAuthenticatedLinks = (): JSX.Element =>
    {
        const links: JSX.Element[] = [];
        links.push(this.authLink('Profile', Navigation.Profile));

        if (this.props.selectedProject === null)
        {
            links.push(this.authLink('Projects', Navigation.Projects));
        }
        else
        {
            links.push(this.authLink('Overview', Navigation.Overview));
            links.push(this.authLink('Measurements', Navigation.MeasurementList));
            links.push(this.authLink('Charts', Navigation.Charts));
        }

        return <>{links}</>;
    }

    authLink(name: string, path: string): JSX.Element
    {
        if (!this.props.authenticated) return null;
        return this.link(name, path);
    }
    publicLink(name: string, path: string): JSX.Element
    {
        if (this.props.authenticated) return null;
        return this.link(name, path);
    }

    link(name: string, path: string): JSX.Element
    {
        return (
            <NavItem key={name}>
                <Link to={path} className='nav-link'>{name}</Link>
            </NavItem>
        );
    }
}

export const Menu = withRouter(MenuComponent);
