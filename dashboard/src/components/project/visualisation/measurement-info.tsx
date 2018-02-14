import React, {PureComponent} from 'react';
import {Measurement} from '../../../lib/measurement/measurement';
import {Button} from 'react-bootstrap';

interface Props
{
    measurements: Measurement[];
    totalMeasurements: number;
    loadMore(): void;
}

export class MeasurementInfo extends PureComponent<Props>
{
    render()
    {
        const {measurements, totalMeasurements} = this.props;
        const length = measurements.length;
        const hasMore = length < totalMeasurements;

        return (
            <div>
                <div>Measurements loaded: {length}</div>
                <div>Total measurements filtered: {totalMeasurements}</div>
                {hasMore && <Button onClick={this.props.loadMore}>Load more</Button>}
            </div>
        );
    }
}
