Temperature = new Meteor.Collection("temperature");

Meteor.publish("temperature", function() {
	return Temperature.find({ ts: { $gt: new Date().getTime() - (7 * 24 * 60 * 60 * 1000) } });
});