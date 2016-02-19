Temperature = new Meteor.Collection("temperature");

var chart, initializing = true, pointsAdded = 0;

// When all data is downloaded, the initialization is completed
Meteor.subscribe("temperature", function() {
	initializing = false;
	chart.redraw();
});

// Add measurements of the past week to the chart
// Redraw only after initialization or after receiving one day of data points (6 * 24 = 144)
// Shift if we have one week of data (144 * 7 = 1008)
Temperature.find({ ts: { $gt: new Date().getTime() - (7 * 24 * 60 * 60 * 1000) } }, { sort: { ts: 1 } }).observeChanges({
	added: function(id, fields) {
		pointsAdded++;
		chart.series[0].addPoint([fields['ts'], fields['humidity']], (!initializing || pointsAdded % 144 == 0), (pointsAdded > 1008));
		chart.series[1].addPoint([fields['ts'], fields['temperature']], (!initializing || pointsAdded % 144 == 0), (pointsAdded > 1008));
	}
});

// Set timezone of chart to the local timezone
Highcharts.setOptions({
	global: {
		timezoneOffset: new Date().getTimezoneOffset()
	}
});

Template.chart.onRendered(function() {
	var chart_id = Template.currentData().chart_id;

	chart = Highcharts.chart(chart_id, {
		title: {
			text: 'Room Climate over Time'
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: [{
			labels: {
				format: '{value}\xB0C',
				style: {
					color: Highcharts.getOptions().colors[1]
				}
			},
			title: {
				text: 'Temperature',
				style: {
					color: Highcharts.getOptions().colors[1]
				}
			}
		},
		{
			labels: {
				format: '{value}%',
				style: {
					color: Highcharts.getOptions().colors[0]
				}
			},
			title: {
				text: 'Humidity',
				style: {
					color: Highcharts.getOptions().colors[0]
				}
			},
			opposite: true,
			min: 0,
			max: 100
		}],
		tooltip: {
			shared: true
		},
		series: [{
			name: 'Humidity',
			yAxis: 1,
			data: [],
			tooltip: {
				valueSuffix: '%'
			}
		},
		{
			name: 'Temperature',
			data: [],
			tooltip: {
				valueSuffix: '\xB0C'
			}
		}]
	});
});