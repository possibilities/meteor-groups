
MeteorGroups = function(options) {
  var self = this;
  options = options || {};

  this.groups = new Meteor.Collection('groups');
  this.groupsToUsers = new Meteor.Collection('groupsToUsers');

  var isAdmin = function(userId) {
    var user = Meteor.users.findOne(userId);
    return self.isUserInGroup(user, 'group-manager');
  };

  var canUserBeRemovedFromGroup = function(userId, groupsToUsers) {
    var adminGroup = self.groups.findOne({ name: 'group-manager' });
    
    // make sure user is not removing self from admin group
    return !_.any(groupsToUsers, function(groupToUser) {
      return adminGroup._id === groupToUser.groupId && groupToUser.userId === userId;
    });
  };

  var canGroupBeRemoved = function(userId, groups) {
    // can't delete admin group
    return _.all(groups, function(group) {
      return group.name !== 'group-manager';
    });
  };

  this.groups.allow({
    insert: isAdmin,
    update: isAdmin,
    remove: function(userId, groups) {
      return isAdmin(userId) &&
        canGroupBeRemoved(userId, groups);
    }
  });

  this.groupsToUsers.allow({
    insert: isAdmin,
    update: isAdmin,
    remove: function(userId, groupsToUsers) {
      return isAdmin(userId) &&
        canUserBeRemovedFromGroup(userId, groupsToUsers);
    }
  });

  if (Meteor.is_client) {
    var subs = ['groups', 'groupsToUsers'];
    var done = _.after(subs.length, function() {
      if (options.onComplete)
        options.onComplete();
    });
    
    Meteor.subscribe('groups', done);
    Meteor.subscribe('groupsToUsers', done);
  }

  if (Meteor.is_server) {

    var self = this;

    Meteor.publish('groups', function() {
      if (isAdmin(this.userId()))
        return self.groups.find();
      else {
        this.flush();
        this.complete();
      }  
      
    });
    
    Meteor.publish('groupsToUsers', function() {
      if (isAdmin(this.userId()))
        return self.groupsToUsers.find();
      else {
        this.flush();
        this.complete();
      }  
    });
    
    Meteor.publish(null, function() {
      if (isAdmin(this.userId()))
        return Meteor.users.find({}, {
          fields: {
            username: 1
          }
        });
      else {
        this.flush();
        this.complete();
      }  
    });
  }

  if (Meteor.is_server && this.groups.find().count() === 0)
    this.findOrCreateGroup('group-manager', true);
};

MeteorGroups.prototype.findOrCreateGroup = function(groupName, locked) {
  var data = {name: groupName};
  if (!_.isUndefined(locked)) data.locked = locked;
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
  if (!user || !groupName)
    return false;
  
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
