// PREPARATIONS
//=============
var assert = require('chai').assert;
var expect = require('chai').expect;
var req, res, next;


// Mock users
var mockUser = {
    userId: 477,
    username: 'joseph'
}

var mockInvalidUser = {
    userId: -9999,
    username: 'I do not exist'
}

var testGroup = 16;


// Controllers
var index = require('../app/controllers/index.controller'),
users = require('../app/controllers/users.controller'),
tasks = require('../app/controllers/tasks.controller.js'),
files = require('../app/controllers/files.controller.js'),
invitation = require('../app/controllers/invitations.controller.js'),
groups = require('../app/controllers/groups.controller.js');

// Mock request/response objects with stub functions
var beforeAllTests = function(){
    req = {
        flash: function(type, msg){
            this.flashMsg = {};
            this.flashMsg.type = type;
            if (msg) this.flash.msg = msg;
        },
    };
    res = {
        render: function(template, data){
            this.template = template;
            this.data = data;
            this.asyncReturn();
        },
        redirect: function(path){
            res.redirected = path;
        },
        flash: function(type, msg){
            this.flashMsg = {};
            this.flashMsg.type = type;
            if (msg) this.flashMsg.msg = msg;
        },
        asyncReturn: null // This will host Mocha's async callback ("done()")
    };
    next = function(){};
}


describe('Controllers', function(){
    beforeEach(beforeAllTests);

    /*
    *
    * Tests for the TASKS controller
    *
    */

    describe('Tasks controller', function(){

        // tasks.read
        // ==========

        describe('read tasks from a group', function(){
            beforeEach(function(done){
                req.currentGroup = 16;
                req.ownsGroup = false;
                // Inject Mocha's callback into the response object's 'render' method
                // so that it will wait for the response before running assertions
                res.asyncReturn = done;
                tasks.read(req, res);
            });
            it('Should render the groups\' task list', function(){
                assert.equal(res.template, 'viewTasks');
                assert.isAtLeast(res.data.taskList.length, 1);
            });
        });

        describe('read all tasks', function(){
            beforeEach(function(done){
                req.currentGroup = null;
                req.ownsGroup = false;
                res.asyncReturn = done;
                tasks.read(req, res);
            });
            it('Should render all tasks from all groups', function(){
                assert.equal(res.template, 'viewTasks');
                assert.isAtLeast(res.data.taskList.length, 1);
            });
        });

        // tasks.byId
        // ==========

        describe('Load a single task by ID', function(){
            beforeEach(function(done){
                tasks.byId(req, res, done, 9);
            });
            it('Should retrieve the task', function(){
                assert.isOk(req.task);
                assert.equal(req.task.taskId, 9);
            });
        });

        describe('Attempt to load a task that does not exist', function(){
            beforeEach(function(done){
                tasks.byId(req, res, done, -999);
            });
            it('Should not load the task', function(){
                assert.isNotOk(req.task);
            });
            it('Should show a flash message', function(){
                assert.equal(req.flashMsg.type, 'error');
            });
        });

        // tasks.allByUser
        // ===============

        describe('Load all tasks for a given user', function(){
            beforeEach(function(done){
                tasks.allByUser(req, res, done, mockUser.userId);
            });
            it('Should retrieve the list of tasks', function(){
                assert.isArray(req.assignerTasks);
                assert.isArray(req.assigneeTasks);
            });
            it('Tasks must belong to given user', function(){
                assert.isOk(req.username);
                assert.equal(req.username, 'joseph');
            });
        });

        describe('Attempt to load tasks for an invalid user', function(){
            beforeEach(function(done){
                tasks.allByUser(req, res, done, -999);
            });
            it('Should not load any tasks', function(){
                assert.isNotOk(req.assignerTasks);
                assert.isNotOk(req.assigneeTasks);
            });
            it('Should show a flash message', function(){
                assert.equal(req.flashMsg.type, 'error');
            });
        });

        // tasks.getNames
        // ===============

        describe('Manage (approve) tasks of a given user', function(){
            beforeEach(function(done){
                req.user = mockUser;
                res.asyncReturn = done;
                tasks.getNames(req, res, done);
            });
            it('Should retrieve the list of tasks', function(){
                assert.isArray(res.data.tasks);
            });
            it('Tasks must belong to given user', function(){
                assert.equal(res.data.tasks[0].taskmasterId, mockUser.userId);
            });
        });

        describe('Attempt to approve tasks of an invalid user', function(){
            beforeEach(function(done){
                req.user = mockInvalidUser;
                res.asyncReturn = done;
                tasks.getNames(req, res, done);
            });
            it('Should not load any tasks', function(){
                assert.isArray(res.data.tasks);
                assert.equal(res.data.tasks.length, 0);
            });
            it('Should show a flash message', function(){
                assert.equal(req.flashMsg.type, 'error');
            });
        });

    }); // Tasks controller tests
});
