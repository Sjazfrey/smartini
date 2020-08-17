const chatForm = document.getElementById("chat-form");
// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();//add

// Join chatroom
socket.emit('joinRoom', { username, room });

//message submit
socket.on('message', message =>{

    console.log(message);
    outputMessage(message);
});


//message submit
chatForm.addEventListener('submit', (e)=> {
    e.preventDefault();
//get message text
    const msg = e.target.elements.msg.value;
//Emit message to server
   socket.emit('chatMessage', msg);

   // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

//output message to dom
function outputMessage(message) {

    const urlParams = new URLSearchParams(window.location.search);
    const currentUser = urlParams.get('username');
    // check if user is the host, and then send message
    if (currentUser === message.hostUsername || currentUser === message.username || message.isHostMessage) {
        console.log(message);
        const div = document.createElement('div');
        div.classList.add('message');
        div.innerHTML = `<p class="meta"><strong>${message.username}</strong></p>
        <p class="text">
            ${message.text}
        </p>`;
        document.querySelector('.chat-messages').appendChild(div);
    }
}