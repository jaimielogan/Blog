$(function(){
  var socket = io();

  $('.chatBox').submit(function(event){
    event.preventDefault();
    var message = $('.messageInput').val();
    var user_fullName = $('.userFullName').val();
    console.log(message);
    socket.emit('chat message', {message: message, user_fullName: user_fullName});
    $(".messageInput").val("");
  });

  socket.on('chat message', function(messageData){
    $('.messages').append(`<li><strong>${messageData.user_fullName}: </strong>${messageData.message}</li>`);
  });

});
