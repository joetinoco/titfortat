

exports.getNames = function(req, res, next) {
    var taskNameList = '';

    var tasks = require('../models/tasks.model');
    

   
    tasks.getTasksByAssigner(req.user.userId, function(err, results) {
        if (err) {
            console.log(err.toString());
           // next(err);
        } else if (results.length > 0) {
           
            console.log("Tasks returned.");
            
        }

    res.render('manageTask', {
            title: 'Manage Task',
            user:req.user,   //pass the user  object
            tasks: results
        });
      
    });
}

//test-mar.19
exports.completeTask = function(req, res, next) {
    var db = require('../models/db.model')();
    var tasks = require('../models/tasks.model');
    var message = '';

    tasks.awardCredits(req.body, function(err, data) {
        if (err) {
            console.log(err.toString());
            res.redirect('/manageTask');
        } else {
           
           message = '<h1>completed Task!</h1><br><table><tr><td>Task Name:</td><td>' + data.getName +
                   
                    '</td></tr></table>';
          
                     res.send(message);
        }     
    

    });
}