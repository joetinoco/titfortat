/*
  Files controller
  ==================

  Manages file download links
*/

var fs = require('fs');

exports.getProofFile = function (req, res, next) {
  // Check if user is logged in
  if (!req.user){
    res.status(403).send('You are not logged in');
    return;
  }

  // Check if user either owns the task or is the assignee
  if (req.user.userId !== req.task.assigneeId && req.user.userId !== req.task.taskmasterId){
    res.status(403).send('You are not authorized to view this file');
    return;
  }

  var file = JSON.parse(req.task.proofFile);

  // Serve the file
  fs.readFile('uploads/' + file.filename, function (err, content) {
      if (err) {
          res.writeHead(400, {'Content-type':'text/html'})
          console.log(err);
          res.end("No such file");
      } else {
          res.setHeader('Content-disposition', 'attachment; filename=' + file.originalname);
          res.setHeader('Content-type', file.mimetype);
          res.end(content);
      }
  });
}
