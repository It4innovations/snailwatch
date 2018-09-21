import React from 'react';

export const RangeHelp = 'Choose how many measurements you want to display. ' +
    'You can either select last N uploaded measurements or pick a date range.';

export const XAxisHelp = 'Choose what attribute will be used as the X-axis. If you select timestamp, ' +
    'the measurements will be grouped by day.';

export const ViewListHelp = <>Select which views will be displayed in the chart.
    You can use the pencil icon to edit or delete individual views.<br /><br />
    Views define a filtered subset of measurements along with observed values that will appear on the Y axis
    of charts. You can also assign watches to individual views to receive regression notifications.</>;

export const TrendGroupHelp = 'Choose an attribute by which the measurements will be grouped';

export const ExportHelp = 'Export all measurements of this project to a CSV or JSON file';
