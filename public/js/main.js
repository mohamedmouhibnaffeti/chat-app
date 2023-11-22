const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//get username and room from url
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const username = urlParams.get('username')
const room = urlParams.get('room')
console.log('username :>> ', username);
const socket = io()

//join chatroom
socket.emit('joinRoom', { username, room })

socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room)
    outputUsers(users)
})

//message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message)

    //scroll down to final message
    chatMessages.scrollTop = chatMessages.scrollHeight
})

// message submit 
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //get message from input
    const msg = e.target.elements.msg.value

    //emit message to the server
    socket.emit('chatMessage', msg)

    //clear input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

//output message to dom
function outputMessage(message){
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `
    <p class="meta">${message.username}  <span>${message.time}</span></p>
    <p>${message.message}</p>
    `
    document.querySelector('.chat-messages').appendChild(div)   
}

function outputRoomName(room){
    roomName.innerText = room
}

function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}