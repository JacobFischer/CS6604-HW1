nextID = 0;

function Node(parentNode) {
    this.id = nextID++;

    this.parent = parentNode;
    this.children = {}; // all the immediate children
    this._subChildren = {}; // all of this node's children, and their children, for easy lookup
    this._users = {};
    this.forwardingPointers = {};

    this.level = 0;
    if(this.parent) {
        this.level = 1 + this.parent.addChild(this);
    }
};

Node.prototype.addChild = function(childNode) {
    this.children[childNode.id] = childNode;

    return 0 + this.addSubChild(childNode);
};

Node.prototype.addSubChild = function(subChildNode) {
    this._subChildren[subChildNode.id] = subChildNode;

    if(this.parent) {
        return 1 + this.parent.addSubChild(subChildNode);
    }

    return 0;
};

Node.prototype.contains = function(node) {
    return Boolean(this.children[node.id] || this._subChildren[node.id]);
};

Node.prototype.hasUser = function(user) {
    return Boolean(this._users[user.id]);
}

Node.prototype.registerUser = function(user) {
    var oldLocation = user.location;
    user.location = this;
    if(oldLocation) {
        oldLocation._unregisterUser(user);
    }

    this._users[user.id] = user;
    if(this.forwardingPointers[user.id]) {
        print("Node " + this.id + " purging forwarding pointer to user " + user.id);
        delete this.forwardingPointers[user.id];
    }
};

Node.prototype._unregisterUser = function(user) {
    this.forwardingPointers[user.id] = user.location;
    print("Node " + this.id + " registering forwarding pointer to user " + user.id);
    delete this._users[user.id];
};

Node.prototype.getInfo = function() {
    var children = [];
    for(var childID in this.children) {
        if(this.children.hasOwnProperty(childID)) {
            children.push("Node " + childID);
        }
    }
    children.sort();

    var pointers = {};
    for(var userID in this.forwardingPointers) {
        if(this.forwardingPointers.hasOwnProperty(userID)) {
            pointers["User " + userID] = "Node " + this.forwardingPointers[userID].id;
        }
    }

    var users = [];
    for(var userID in this._users) {
        if(this._users.hasOwnProperty(userID)) {
            users.push("User " + userID);
        }
    }
    users.sort();

    return {
        title: "Node " + this.id,
        data: {
            parent: this.parent ? "Node " + this.parent.id : null,
            children: children,
            forwardingPointers: pointers,
            users: users,
        }
    }
};
// Node helper function
function LeastCommonAncestor(nodeA, nodeB) {
    var parentNode = nodeA;
    while(parentNode) {
        if(parentNode.contains(nodeB)) {
            return parentNode;
        }

        parentNode = parentNode.parent;
    }
};
