import React, {ReactNode, SFC} from 'react';
import styled from 'styled-components';
import {Card, CardTitle} from 'reactstrap';

const SlimCard = styled(Card)`
  padding: 10px !important;
  margin-bottom: 5px;
`;

export const Box: SFC<{title: ReactNode | string, className?: string}> = (props) =>
{
    return (
        <SlimCard body outline color='secondary' className={props.className}>
            <CardTitle>{props.title}</CardTitle>
            <div>{props.children}</div>
        </SlimCard>
    );
};
