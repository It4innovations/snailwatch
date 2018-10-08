import React, {PureComponent} from 'react';
import MdClose from 'react-icons/lib/md/close';
import {Button} from 'reactstrap';
import styled from 'styled-components';
import {Measurement} from '../../../lib/measurement/measurement';
import {Project} from '../../../lib/project/project';
import {View} from '../../../lib/view/view';
import {Box} from '../../global/box';
import {ViewManager} from '../view/view-manager';
import {MeasurementList} from './measurement-list';

interface Props
{
    view: View | null;
    project: Project;
    selectedMeasurements: Measurement[];
    deselectView(): void;
    deselectMeasurements(): void;
}

const Row = styled.div`
  display: flex;
  align-items: flex-start;
`;
const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const MeasurementsWrapper = styled(Box)`
  width: 750px !important;
  max-width: 750px;
  margin: 0 0 0 15px;

  .card-body {
    padding: 0 !important;
  }
`;
const ViewManagerWrapper = styled(ViewManager)`
  max-width: 750px;
  margin-bottom: 0;
  border-radius: 5px;
`;

export class ChartBottomPanel extends PureComponent<Props>
{
    render()
    {
        const {view} = this.props;

        return (
            <Row>
                {view &&
                    <ViewManagerWrapper view={view} onClose={this.props.deselectView} />
                }
                {this.props.selectedMeasurements.length > 0 &&
                    <MeasurementsWrapper title={this.renderMeasurementsTitle()}>
                        <MeasurementList measurements={this.props.selectedMeasurements}
                                         project={this.props.project} />
                    </MeasurementsWrapper>
                }
            </Row>
        );
    }

    renderMeasurementsTitle = (): JSX.Element =>
    {
        return (
            <TitleRow>
                <div>Selected measurements</div>
                <Button title='Close box'
                        size='sm'
                        onClick={this.props.deselectMeasurements}>
                    <MdClose size={20} />
                </Button>
            </TitleRow>
        );
    }
}
