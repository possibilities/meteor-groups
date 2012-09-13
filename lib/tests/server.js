Groups = new MeteorGroups();

var reset = function() {
  Meteor.users.remove({});
  Groups.groups.remove({});
  Groups.groupsToUsers.remove({});
};

var createUser = function() {
  if (Meteor.is_server)
    Meteor.createUser({
      username: 'possibilities',
      email: 'mikebannister@gmail.com'
    });
};

Tinytest.add("groups - findOrCreateGroup exists", function (test) {

  reset();

  // Starts with one
  Groups.findOrCreateGroup('uncool-guys');
  test.equal(Groups.groups.find({name: 'uncool-guys'}).count(), 1)

  // Should grab the group
  var group = Groups.findOrCreateGroup('uncool-guys');
  test.equal(group.name, 'uncool-guys')

  // Should still have one
  test.equal(Groups.groups.find({name: 'uncool-guys'}).count(), 1)

});

Tinytest.add("groups - findOrCreateGroup doesn't exist", function (test) {

  reset();

  // Start with nothing
  test.equal(Groups.groups.find({name: 'cool-guys'}).count(), 0)

  // Should create a group if it doesn't exist
  var group = Groups.findOrCreateGroup('cool-guys');
  test.equal(group.name, 'cool-guys')

  // Should have one now
  test.equal(Groups.groups.find({name: 'cool-guys'}).count(), 1)

});

Tinytest.add("groups - addUserToGroup", function (test) {

  reset();
  createUser();

  var group = Groups.findOrCreateGroup('super-cool-guys');
  var user = Meteor.users.findOne();

  // Initially user shouldn't be in the group
  test.isFalse(Groups.isUserInGroup(user, 'super-cool-guys'))

  // Add the user to the group
  Groups.addUserToGroup(user, 'super-cool-guys');
  
  // Now the user should be in the group
  test.isTrue(Groups.isUserInGroup(user, 'super-cool-guys'))

});

Tinytest.add("groups - removeUserFromGroup", function (test) {

  reset();
  createUser();

  var group = Groups.findOrCreateGroup('awesome-guys');
  var user = Meteor.users.findOne();

  // Add the user to the group
  Groups.addUserToGroup(user, 'awesome-guys');
  
  // Initially user should be in the group
  test.isTrue(Groups.isUserInGroup(user, 'awesome-guys'))
  
  // Remove user from group
  Groups.removeUserFromGroup(user, 'awesome-guys');
  
  // Now the user shouldn't be in the group
  test.isFalse(Groups.isUserInGroup(user, 'awesome-guys'))

});

Tinytest.add("groups - isUserInGroup", function (test) {

  reset();
  createUser();

  var group = Groups.findOrCreateGroup('silly-guys');
  var user = Meteor.users.findOne();

  // Initially user shouldn't be in the group
  test.isFalse(Groups.isUserInGroup(user, 'silly-guys'))

  // Add the user to the group
  Groups.addUserToGroup(user, 'silly-guys');
  
  // Now the user should be in the group
  test.isTrue(Groups.isUserInGroup(user, 'silly-guys'))

});
