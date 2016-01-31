Temperature = new Meteor.Collection("temperature");

var chart, initializing = true;

// Fetch initial measurements and add that dataset to the chart
Meteor.subscribe("temperature", function() {
	var measurements = Temperature.find({}, { sort: { ts: 1 } });

	var temperatureData = measurements.map(function(entry) {
		return [ entry['ts'], entry['temperature'] ];
	});

	var humidityData = measurements.map(function(entry) {
		return [ entry['ts'], entry['humidity'] ];
	});

	chart.series[0].setData(humidityData);
	chart.series[1].setData(temperatureData);

	initializing = false;
});

// Add newly inserted measurements to the chart
Temperature.find({}).observeChanges({
	added: function(id, fields) {
		if (!initializing) {
			chart.series[0].addPoint([fields['ts'], fields['humidity']]);
			chart.series[1].addPoint([fields['ts'], fields['temperature']]);
		}
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