var chatModel = Backbone.Model.extend({
  urlRoot : '/users'
});

var userCollection = Backbone.Collection.extend({
  model : userModel
})

var chatCollection = Backbone.Collection.extend({
  model : chatModel
});

var ChatView = Backbone.View.extend({

  events: {
    'click .exit-btn': 'exit',
    'submit #chat-msg' : 'sendMessage',
    'keypress #chat-type-text' : 'sendOnEnter'
  },

  initialize: function(){
    var that = this;
    this.socket = io.connect();
    this.socket.on('incoming', function(msg){
      var fromId = msg.from;
      console.log(fromId);
      that.$el.find('#alert-'+fromId).show();
      var html = '<li class="message-list-item">';
      html += '<div class="row">';
      html += '<div class="col-md-1">';
      html += '<div class="profile-img"><img src="public/images/account.svg"/></div>';
      html += '</div>'
      html += '<div class="col-md-11" style="padding-left: 0;">';
      html += '<p class="msg-text">'+msg.message+'</p>';
      html += '<p class="time-text no-margin">'+msg.time+'</p>';
      html += '</div></div></li>';
      that.$el.find('.message-list').append(html);
    });
    this.render();
  },

  render: function(){
    var template = _.template( $("#chat-template").html());
    this.$el.html(template);
    var that = this;
    var cookie = getCookie('user-id');
    console.log("Cookie : " + cookie);
    this.socket.emit('new-user', cookie);
    this.socket.on('usernames', function(data){
      that.$el.find('.user-list-area ul').html('');
      console.log(data);
      for(var i in data){
        console.log(data[i].uname);
        that.$el.find('.user-list-area ul').append('<li data-id="'+data[i].userId+'" data-name="'+data[i].uname+'" class="waves-effect waves-block">'+data[i].uname+' <span style="display : none;" id="alert-'+data[i].userId+'">(new)</span></li>');
      }
    });
  },

  sendOnEnter : function(event){
    if(event.keyCode == 13){
      var message = this.$el.find('#chat-type-text').val();
      var toUserId = this.$el.find('#current-msg-rec').data('id');
      var fromUserId = getCookie('user-id');
      var date = new Date();
      var h = date.getHours(), hours, m = date.getMinutes(), minutes;
      if (h < 10){
        hours = '0'+h;
      }else{
        hours = h;
      }
      if(m < 10){
        minutes = '0'+m;
      }else{
        minutes = m;
      }
      var timeStamp = hours + ":" + minutes;
      console.log(timeStamp);
      var msg = {
        message : message,
        time : timeStamp,
        to : toUserId,
        from : fromUserId
      };
      console.log(msg);
      if(message.trim() !== ''){
        this.socket.emit('new-message', msg);
        var html = '<li class="message-list-item">';
        html += '<div class="row">';
        html += '<div class="col-md-11 text-right" style="padding-left: 0;">';
        html += '<p class="msg-text">'+message+'</p>';
        html += '<p class="time-text no-margin">'+timeStamp+'</p>';
        html += '</div>';
        html += '<div class="col-md-1">';
        html += '<div class="profile-img"><span class="p-text">You</span></div>';
        html += '</div></div></li>';
        this.$el.find('.message-list').append(html);
        this.$el.find('#chat-type-text').val('')
      }
      var that = this;
    }
  },

  sendMessage : function(event){
    event.preventDefault();
    var message = this.$el.find('#chat-type-text').val();
    var toUserId = this.$el.find('#current-msg-rec').data('id');
    var fromUserId = getCookie('user-id');
    var date = new Date();
    var h = date.getHours(), hours, m = date.getMinutes(), minutes;
    if (h < 10){
      hours = '0'+h;
    }else{
      hours = h;
    }
    if(m < 10){
      minutes = '0'+m;
    }else{
      minutes = m;
    }
    var timeStamp = hours + ":" + minutes;
    console.log(timeStamp);
    var msg = {
      message : message,
      time : timeStamp,
      to : toUserId,
      from : fromUserId
    };
    console.log(msg);
    if(message.trim() !== ''){
      this.socket.emit('new-message', msg);
      var html = '<li class="message-list-item">';
      html += '<div class="row">';
      html += '<div class="col-md-11 text-right" style="padding-left: 0;">';
      html += '<p class="msg-text">'+message+'</p>';
      html += '<p class="time-text no-margin">'+timeStamp+'</p>';
      html += '</div>';
      html += '<div class="col-md-1">';
      html += '<div class="profile-img"><span class="p-text">You</span></div>';
      html += '</div></div></li>';
      this.$el.find('.message-list').append(html);
      this.$el.find('#chat-type-text').val('')
    }
    var that = this;
  },

  exit : function(){
    console.log(this.$el);
    document.cookie = "chat=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = "insert-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    location.reload();
  }
});
