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
import MdMenu from 'react-icons/lib/md/menu';

interface Props
{
    authenticated: boolean;
    selectedProject: Project | null;
    deselectProject(): void;
}

const Appbar = styled(Navbar)`
  margin-bottom: 5px;
  border-bottom: 1px solid #000000;
`;
const SidePanel = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
  align-content: center;
`;
const ProjectName = styled.div`
  font-weight: bold;
  font-size: 22px;
  align-self: center;
  margin-right: 20px;
`;
const MenuLink = styled.div`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
  color: #007BFF;
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
                </Nav>
                {this.props.authenticated && this.renderSidePanel()}
            </Appbar>
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
            links.push(this.authLink('Project', Navigation.Overview));
            links.push(this.authLink('Measurements', Navigation.MeasurementList));
            links.push(this.authLink('Views', Navigation.Views));
        }

        return <>{links}</>;
    }
    renderSidePanel = (): JSX.Element =>
    {
        return (
            <SidePanel>
                {this.props.selectedProject !== null && <ProjectName>{this.props.selectedProject.name}</ProjectName>}
                {this.renderExpandableMenu()}
            </SidePanel>
        );
    }
    renderExpandableMenu = (): JSX.Element =>
    {
        const items: JSX.Element[] = [];

        if (this.props.selectedProject !== null)
        {
            items.push(
                <DropdownItem key='switch-project' onClick={this.props.deselectProject}>
                    <MenuLink>Switch project</MenuLink>
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
                    <MdMenu />
                </DropdownToggle>
                <DropdownMenu right>{items}</DropdownMenu>
            </UncontrolledDropdown>
        );
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
