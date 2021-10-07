const generateMessage = (userName, text) => {
    return {
        text,
        userName,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (userName, url) => {
    return {
        url,
        userName,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}