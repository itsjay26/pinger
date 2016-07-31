var userModel = Backbone.Model.extend({
  urlRoot : '/chat'
});

var chatModel = Backbone.Model.extend({
  urlRoot : '/users'
});

var LoginView = Backbone.View.extend({

  events: {'submit': 'save'},

  initialize: function() {
    this.render();
  },

  render: function(){
    var variables = { title: "pinger", tagline: "communication made simple" };
    var template = _.template( $("#login-template").html());
    this.$el.html( template (variables));
  },

  save: function(event) {
    event.preventDefault();
    var userName = this.$el.find('input[type=text]').val();
    var email = this.$el.find('input[type=email]').val();
    var data = {
      uname : userName,
      email : email
    };
    this.model.save(data,{
      success : function(model, response){
        document.cookie="chat=1";
        location.reload();
      },
      error : function(model, response){
        console.log(response);
      }
    });
    return false;
  }


});

var ChatView = Backbone.View.extend({
  events: {
    'click .exit-btn': 'exit'
  },
  initialize: function(){
    var socket = io.connect();
    socket.emit('getUsers', {}, function(response){
      console.log(response);
    });

    socket.on('usernames', function(data){
      console.log(data);
    });
    this.render();
  },

  render: function(){
    var template = _.template( $("#chat-template").html());
    this.$el.html(template);
  },

  exit : function(){
    document.cookie = "chat=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    location.reload();
  },

  userList : function(){
    console.log("testa");
  }
});

var auth = getCookie("chat");
if(auth){
    var chatView = new ChatView({ el: $("#login-area"), model: new chatModel() });
}else{
    var loginView = new LoginView({ el: $("#login-area"), model: new userModel() });
}

/*
var AppRouter =  Backbone.Router.extend({
  routes : {
    '' : 'index',
    'index' : 'index',
    'chat' : 'chat'
  },

  index : function(){
    if(auth){
        var chatView = new ChatView({ el: $("#login-area"), model: new chatModel() });
    }else{
        var loginView = new LoginView({ el: $("#login-area"), model: new userModel() });
    }
  },
  chat : function(){
    if(auth){
        var chatView = new ChatView({ el: $("#login-area"), model: new chatModel() });
    }else{
        var loginView = new LoginView({ el: $("#login-area"), model: new userModel() });
    }
  }
});

new AppRouter;
Backbone.history.start();
*/

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
