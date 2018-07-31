/*
import React, {PureComponent, Fragment} from 'react';
import {View, createView} from '../../lib/view/view';
import {FilterList} from '../visualisation/selection-container/filter/filter-list';
import styled from 'styled-components';
import {Button} from 'reactstrap';
import {EditableText} from '../global/editable-text';
import {stringifyFilter} from '../../lib/measurement/selection/filter';

interface Props
{
    analysis: View;
    onChange(analysis: View): void;
    onDelete(analysis: View): void;
}

const initialState = {
    editing: false,
    analysis: createView()
};

type State = Readonly<typeof initialState>;

const Wrapper = styled.div`
  padding: 5px;
  border: 1px solid #000000;
  margin-bottom: 5px;
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const ActionButton = styled(Button)`
  margin-left: 5px;
`;
const NameWrapper = styled.div`
  width: 160px;
  font-weight: bold;
`;
const Row = styled.div`
  display: flex;
`;

export class AnalysisView extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    componentDidUpdate(prevProps: Props, prevState: State)
    {
        if (!prevState.editing && this.state.editing)
        {
            this.setState(() => ({
                analysis: {...this.props.analysis}
            }));
        }
    }

    render()
    {
        const {analysis} = this.state.editing ? this.state : this.props;

        return (
            <Wrapper>
                <Header>
                    <NameWrapper>
                        <EditableText editing={this.state.editing}
                                      value={analysis.name}
                                      onChange={value => this.changeAnalysis('name', value)} />
                    </NameWrapper>
                    <div>
                        {this.renderEditButton()}
                        <ActionButton onClick={this.onDelete}
                                color='danger'
                                size='sm'>Delete</ActionButton>
                    </div>
                </Header>
                {this.renderFilters(analysis)}
                {this.renderTrigger(analysis)}
                {this.renderObservedValue(analysis)}
                {this.renderRatio(analysis)}
                {this.createDescription(analysis)}
            </Wrapper>
        );
    }
    renderEditButton = (): JSX.Element =>
    {
        const name = this.state.editing ? 'Save' : 'Edit';
        const callback = this.state.editing ? this.onUpdate : () => this.changeEdit(true);
        const color = this.state.editing ? 'success' : 'primary';

        return (
            <ActionButton size='sm'
                             onClick={callback}
                             color={color}>
                {name}
            </ActionButton>
        );
    }
    renderFilters = (analysis: View): JSX.Element =>
    {
        return (
            <div>
                <div>Filters</div>
                <FilterList filters={analysis.filters}
                            editable={this.state.editing}
                            measurementKeys={[]}
                            measurements={[]}
                            onChange={filters => this.changeAnalysis('filters', filters)} />
            </div>
        );
    }
    renderTrigger = (analysis: View): JSX.Element =>
    {
        return (
            <Row>
                Trigger:
                <EditableText editing={this.state.editing}
                              value={analysis.trigger}
                              onChange={value => this.changeAnalysis('trigger', value)} />
            </Row>
        );
    }
    renderObservedValue = (analysis: View): JSX.Element =>
    {
        return (
            <Row>
                Observed value:
                <EditableText editing={this.state.editing}
                              value={analysis.observedValue}
                              onChange={value => this.changeAnalysis('observedValue', value)} />
            </Row>
        );
    }
    renderRatio = (analysis: View): JSX.Element =>
    {
        return (
            <Row>
                Ratio:
                <EditableText editing={this.state.editing}
                              value={analysis.ratio.toString()}
                              type='number'
                              onChange={value => this.changeAnalysis('ratio', Number(value || 1))} />
            </Row>
        );
    }
    createDescription = (analysis: View): JSX.Element =>
    {
        const filters = analysis.filters.map(f => ({
            path: f.path === '' ? '?' : f.path,
            operator: f.operator,
            value: f.value === '' ? '?' : f.value
        })).map(stringifyFilter);
        const start: (JSX.Element | string)[] = ['Analyse measurements'];
        if (filters.length > 0)
        {
            start.push(' with predicates ');
            start.push(<b>{filters.join(', ')}</b>);
        }

        return (
            <div>
                {start.map((item, index) => <Fragment key={index}>{item}</Fragment>)} when&nbsp;
                <b>{analysis.trigger}</b> changes and <b>{analysis.observedValue}</b> differs
                by a ratio of <b>{analysis.ratio}</b>.
            </div>
        );
    }

    onDelete = () =>
    {
        this.props.onDelete(this.props.analysis);
    }
    onUpdate = () =>
    {
        this.changeEdit(false);
        this.props.onChange({...this.state.analysis});
    }
    changeAnalysis = (key: keyof View, value: {}) =>
    {
        this.setState(state => ({
            analysis: {...state.analysis, [key]: value}
        }));
    }

    changeEdit = (editing: boolean) =>
    {
        this.setState(() => ({ editing }));
    }
}
*/
