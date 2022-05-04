const crypto = require('crypto')

const key = 'secret key'

function hashArguements(...parameters) {

    const concatenatedRequest = parameters.join('')
    
    // Create hash
    const hash = crypto.createHmac('sha512', key)

    hash.update(concatenatedRequest)

    return hash.digest('hex')
}

module.exports = { hashArguements }