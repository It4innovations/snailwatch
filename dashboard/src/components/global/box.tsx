import React, {SFC} from 'react';
import styled from 'styled-components';
import {Card, CardTitle} from 'reactstrap';

const SlimCard = styled(Card)`
  padding: 10px !important;
  margin-bottom: 5px;
`;

export const Box: SFC<{title: JSX.Element | string}> = (props) =>
{
    return (
        <SlimCard body outline color='secondary'>
            <CardTitle>{props.title}</CardTitle>
            <div>{props.children}</div>
        </SlimCard>
    );
};
