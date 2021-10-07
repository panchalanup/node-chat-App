const socket = io()

// Elements
const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const sendLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#messsge-template').innerHTML 
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix:true })

// Auto Scroll
const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // height of messages container
    const containerHeight = messages.scrollHeight 

    // how far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight 

    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }
    //console.log('containerHeight', 'newMessagHeight', 'scrillOffset')
    //console.log(containerHeight, newMessageHeight, scrollOffset, messages.scrollTop)
}


// message
socket.on('message', (msg) => {
    
    const html = Mustache.render(messageTemplate, {
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a'),
        userName:msg.userName
    })
    
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
  
// location message
socket.on('locationMessage', (message) => {

    const html = Mustache.render(locationMessageTemplate, { 
        message:message.url,
        createdAt: moment(message.createdAt).format('h:mm a'),
        userName:message.userName
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// Room Data
socket.on('roomData', ({ room, users }) => {
       const html = Mustache.render(sidebarTemplate, {
           room,
           users
       })

       sidebar.innerHTML = html
})


// Set up for sending message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disable button
    messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.inputMessage.value

    socket.emit('sendMessage', message, (error) => {

        // Enable button
         messageFormButton.removeAttribute('disabled')
         messageFormInput.value = ''
         messageFormInput.focus()

        if (error) {
            console.log(error)
        }

        console.log('The message was delivered!')
    })
})

// Set up for sending Geolocation
sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    // disable location button
    sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (AcknowledgeMSG) => {
            // enable location button
            sendLocationButton.removeAttribute('disabled')
            console.log(AcknowledgeMSG)
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})