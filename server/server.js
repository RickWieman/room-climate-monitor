Temperature = new Meteor.Collection("temperature");

Meteor.publish("temperature", function() {
	return Temperature.find({});
});