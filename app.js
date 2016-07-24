var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);

app.use('/public', express.static('public'));
app.use('/client', express.static('client'));

server.listen(3001);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
