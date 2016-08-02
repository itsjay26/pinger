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
//var url = 'mongodb://localhost:27017/members';
var url = process.env.SCALINGO_MONGO_URL;

var socketArray = [];

server.listen(process.env.PORT);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


var userId = 1;

app.post('/chat',jsonParser, function(req, res){
  console.log("the request " + JSON.stringify(req.body));
  var error = 0, errorMessage = '';

  var data  = addUserToStore(req.body, userId, function(result){
    if(error){
      var response = {
        status : 500,
        error : errorMessage
      };
      res.json(response);
    }else{
      userId++;
      var response = {
        status  : 200,
        success : 'User added to the Datastore',
        data : result
      };
      res.json(response);
    }
  });


});

app.get('/users', jsonParser, function(req, res){
  var users = getUsersFromStore(function(users){
    res.json(users);
  });
});


io.sockets.on('connection', function(socket) {

  socket.on('new-user', function(data, callback){
    console.log("id of the user" + data );
    updateUserSocket(data, socket);

    var users = getUsersFromStore(function(users){
      console.log(users);
      if(users){
        io.sockets.emit('usernames', users);
      }else{
        //callback(users);
      }
    });

  });

  socket.on('new-message', function(msg){
    console.log(msg);
    console.log(socketArray);
    var fromId = msg.from;
    var toId = msg.to;
    var targetSocket = getSocketInfo(toId);
    targetSocket.emit('incoming', msg);
  });

  socket.on('disconnect', function(){
    var users = getUsersFromStore(function(users){
      console.log(users);
      if(users){
        io.sockets.emit('usernames', users);
      }else{
        //callback(users);
      }
    });
    console.log('user disconnected');
  });
});


function addUserToStore(data, userId, callback){
  MongoClient.connect(url, function(err, db){
    if(err){
      console.log('Unable to connect to the mongoDB server. Error:', err);
      error = 1, errorMessage = 'Unable to connect to Datastore. Please try again.';
    }else{
      console.log('Connection established to', url);

      var collection = db.collection('users');
      var currentUser = data;
      currentUser.userId = userId;
      collection.insert(currentUser, function(err, result){
        if (err) {
          console.log(err);
          error = 1, errorMessage = 'Unable to store data to the document. Please try again';
        } else {
          console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
          callback(result);
        }
      });
      db.close();
    }
  });
}

function getUsersFromStore(callback){
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
          //console.log('Found:', result);
          callback(result);
        } else {
          console.log('No document(s) found with defined "find" criteria!');
        }
        //Close connection
        db.close();
      });
    }
  });
}

function updateUserSocket(id, socket){
  var x = 0;
  for(var i in socketArray){
    if(socketArray[i].userId == id){
      x = 1;
    }
  }

  if(!x){
    var socketData = {
      userId : id,
      socket : socket
    };
    socketArray.push(socketData);
    console.log(socketArray);
  }
}

function getSocketInfo(id){
  for(var i in socketArray){
    if(socketArray[i].userId == id){
      return socketArray[i].socket;
    }
  }
}
