var auth = getCookie("chat");
if(auth){
    var chatView = new ChatView({ el: $("#login-area"), model: new chatModel() });
}else{
    var loginView = new LoginView({ el: $("#login-area"), model: new userModel() });
}
