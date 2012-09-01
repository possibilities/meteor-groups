
MeteorGroups = function(options) {
  options = options || {};
  
  this.adminGroup = options.adminGroup;
  
  this.groups = new Meteor.Collection('groups');
  this.groupsToUsers = new Meteor.Collection('groupsToUsers');

  var userIsAdmin = function(userId) {
    if (!this.adminGroup)
      return false;

    return this.isUserInGroupName(userId, this.adminGroup);
  };
  
  var allow = {
    insert: userIsAdmin,
    update: userIsAdmin,
    remove: userIsAdmin
  };

  this.groups.allow(allow);
  this.groupsToUsers.allow(allow);

  var self = this;

  if (Meteor.is_client) {
    Meteor.subscribe('groups');
    Meteor.subscribe('groupsToUsers');
  }

  if (Meteor.is_server) {

    Meteor.publish('groups', function() {
      if (self.isUserInGroupName(this.userId(), self.adminGroup))
        return self.groups.find();
    });
    
    Meteor.publish('groupsToUsers', function() {
      if (self.isUserInGroupName(this.userId(), self.adminGroup))
        return self.groupsToUsers.find();
    });
  }
};

MeteorGroups.prototype.findOrCreateGroup = function(groupName) {
  var data = {name: groupName};
  var group = this.groups.findOne(data);
  if (!group) {
    var id = this.groups.insert(data);
    group = _.extend(data, {
      _id: id
    });
  }
  
  return group;
};

MeteorGroups.prototype.addUserToGroup = function(user, group) {
  var userId = _.isString(user) ? user : user._id;
  var groupId = _.isString(group) ? group : group._id;
  
  var data = {userId: userId, groupId: groupId};
  var groupToUser = this.groupsToUsers.findOne(data);
  if (!groupToUser) {
    var id = this.groupsToUsers.insert(data);
    groupToUser = _.extend(data, {
      _id: id
    });
  }
  
  return groupToUser;
};

MeteorGroups.prototype.addUserToGroupName = function(user, groupName) {
  var userId = _.isString(user) ? user : user._id;

  var group = this.groups.findOne({name: groupName});
  if (group)
    this.addUserToGroup(userId, group._id);
};

MeteorGroups.prototype.removeUserFromGroup = function(user, group) {
  var userId = _.isString(user) ? user : user._id;
  var groupId = _.isString(group) ? group : group._id;

  var data = {userId: userId, groupId: groupId};
  var groupToUser = this.groupsToUsers.findOne(data);

  if (groupToUser)
    this.groupsToUsers.remove(groupToUsers._id);
};

MeteorGroups.prototype.isUserInGroup = function(user, group) {
  if (!user || !group)
    return false;

  var userId = _.isString(user) ? user : user._id;
  var groupId = _.isString(group) ? group : group._id;

  var data = {userId: userId, groupId: groupId};
  return this.groupsToUsers.find(data).count() === 1;
};

MeteorGroups.prototype.isUserInGroupName = function(user, groupName) {
  if (!user || !groupName)
    return false;

  var userId = _.isString(user) ? user : user._id;
  var group = this.groups.findOne({name: groupName});
  if (!group)
    return false;

  return this.isUserInGroup(userId, group._id);
};
