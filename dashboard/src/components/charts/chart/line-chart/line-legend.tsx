import React, {PureComponent} from 'react';
import {LegendProps} from 'recharts';
import styled from 'styled-components';

interface Props
{
    groups: {
        color: string;
    }[];
}

const List = styled.ul`
  display: flex;
  justify-content: center;
  list-style: none;
`;
const Entry = styled.li`
  margin-right: 10px;
`;
const Icon = styled.svg`
  margin-right: 4px;
`;

export class LineLegend extends PureComponent<LegendProps & Props>
{
    render()
    {
        const payload = this.props.payload;
        return (
            <List>
                {payload.map((entry, index) =>
                    entry.type !== 'none' &&
                    <Entry key={index}>
                        <Icon height='12' width='12'>
                            <circle cx='6' cy='6' r='6' fill={this.props.groups[index].color} />
                        </Icon>
                        {entry.value}
                    </Entry>
                )}
            </List>
        );
    }
}
