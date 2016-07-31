var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);
var bodyParser = require('body-parser')
app.use('/public', express.static('public'));
app.use('/client', express.static('client'));

var jsonParser = bodyParser.json();

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/members';

server.listen(3001);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/chat',jsonParser, function(req, res){
  console.log("the request " + JSON.stringify(req.body));
  var error = 0, errorMessage = '';

  MongoClient.connect(url, function(err, db){
    if(err){
      console.log('Unable to connect to the mongoDB server. Error:', err);
      error = 1, errorMessage = 'Unable to connect to Datastore. Please try again.';
    }else{
      console.log('Connection established to', url);

      var collection = db.collection('users');
      var currentUser = req.body;

      collection.insert(currentUser, function(err, result){
        if (err) {
          console.log(err);
          error = 1, errorMessage = 'Unable to store data to the document. Please try again';
        } else {
          console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
        }
      });
      db.close();
    }
  });

  if(error){
    var response = {
      status : 500,
      error : errorMessage
    };
  }else{
    var response = {
      status  : 200,
      success : 'User added to the Datastore'
    };
  }

  res.json(response);
});

app.get('/users', jsonParser, function(req, res){
  // Use connect method to connect to the Server
  var users = ''
  users = getUsersFromStore();
  res.json(users);
});

io.sockets.on('connection', function(socket) {

  var users = getUsersFromStore();
  if(users){
    io.socket.emit('usernames', users);
  }
  

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


function getUsersFromStore(){
  var users = '';
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      res.json({error : true});
    } else {
      var collection = db.collection('users');
      collection.find().toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {
          console.log('Found:', result);
          users = result;
        } else {
          console.log('No document(s) found with defined "find" criteria!');
        }
        //Close connection
        db.close();
        return users;
      });
    }
  });
}
