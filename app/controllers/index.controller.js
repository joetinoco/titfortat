/*
"index" controller
==================

Serves the home page

*/

// Just a placeholder for the index page
exports.render = function(req, res){
    res.render('index', {
        pageTitle: '',
        user: req.user,
        groups: req.groups,
        userCredits: req.userCredits,
        tasksPending: req.tasksPending,
        tasksWaitingApproval: req.tasksWaitingApproval,
        tasksClosed: req.tasksClosed,
        tasksAssignedPending: req.tasksAssignedPending,
        tasksAssignedWaitingApproval: req.tasksAssignedWaitingApproval,
        tasksAssignedClosed: req.tasksAssignedClosed
    });
};
