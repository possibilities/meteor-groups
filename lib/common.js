
MeteorGroups = function(options) {
  options = options || {};
  
  this.groups = new Meteor.Collection('groups');
  this.groupsToUsers = new Meteor.Collection('groupsToUsers');

  this.groups.allow({});
  this.groupsToUsers.allow({});

  if (Meteor.is_client) {
    Meteor.subscribe('groups');
    Meteor.subscribe('groupsToUsers');
  }

  if (Meteor.is_server) {

    var self = this;

    Meteor.publish('groups', function() {
      if (self.isUserInGroup(this.userId(), self.adminGroup))
        return self.groups.find();
    });
    
    Meteor.publish('groupsToUsers', function() {
      if (self.isUserInGroup(this.userId(), self.adminGroup))
        return self.groupsToUsers.find();
    });
  }
};

MeteorGroups.prototype.allow = function(rules) {
  this.groups.allow(rules);
  this.groupsToUsers.allow(rules);
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

MeteorGroups.prototype._addUserToGroup = function(user, group) {
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

MeteorGroups.prototype.addUserToGroup = function(user, groupName) {
  var userId = _.isString(user) ? user : user._id;

  var group = this.groups.findOne({name: groupName});
  if (group)
    this._addUserToGroup(userId, group._id);
};

MeteorGroups.prototype._removeUserFromGroup = function(user, group) {
  var userId = _.isString(user) ? user : user._id;
  var groupId = _.isString(group) ? group : group._id;

  var data = {userId: userId, groupId: groupId};
  var groupToUser = this.groupsToUsers.findOne(data);

  if (groupToUser)
    this.groupsToUsers.remove(groupToUser._id);
};

MeteorGroups.prototype.removeUserFromGroup = function(user, groupName) {
  if (!user || !groupName)
    return false;
  
  var userId = _.isString(user) ? user : user._id;
  var group = this.groups.findOne({name: groupName});
  if (!group)
    return false;

  this._removeUserFromGroup(userId, group._id);
};

MeteorGroups.prototype._isUserInGroup = function(user, group) {
  if (!user || !group)
    return false;

  var userId = _.isString(user) ? user : user._id;
  var groupId = _.isString(group) ? group : group._id;

  var data = {userId: userId, groupId: groupId};
  return this.groupsToUsers.find(data).count() === 1;
};

MeteorGroups.prototype.isUserInGroup = function(user, groupName) {
  if (!user || !groupName)
    return false;

  var userId = _.isString(user) ? user : user._id;
  var group = this.groups.findOne({name: groupName});
  if (!group)
    return false;

  return this._isUserInGroup(userId, group._id);
};
