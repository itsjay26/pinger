var userModel = Backbone.Model.extend({
  urlRoot : '/chat'
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
        console.log(JSON.parse(JSON.stringify(response.data)));
        var id = response.data;
        document.cookie ='user-id='+id.ops[0].userId+'';
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
