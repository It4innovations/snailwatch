import React from 'react';

export const RangeHelp = 'Choose how many measurements you want to display. ' +
    'You can either pick a date range or display last N uploaded measurements for each view.';

export const XAxisHelp = 'Choose what attribute will be displayed on the X axis. If you select timestamp, ' +
    'you can select how will the measurements be grouped (per month/per day/per hour).';

export const ViewListHelp = <>Select which views will be displayed in the chart.
    You can use the pencil icon to edit or delete individual views.<br /><br />
    Views define a filtered subset of measurements along with observed values that will appear on the Y axis
    of charts. You can also assign watches to individual views to receive regression notifications.</>;

export const LineChartSettingsHelp = 'Trend displays a dashed line representing the exponential moving average ' +
    'of the last 10 measurement groups. Error bars span +/- one standard deviation from the average.';

export const TrendGroupHelp = 'Choose an attribute by which the measurements will be aggregated into groups. The ' +
    'groups are sorted in descending order by timestamp.';

export const ExportHelp = 'Export all measurements of this project to a CSV or JSON file';
