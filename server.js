const 
    express = require('express'), 
    PORT = process.env.PORT || 5000;

    var cors = require('cors')    

express()
    .use(cors())
    .use(express.urlencoded({ extended: false }))
    .use(express.json())
    .use('/api/', require('./api/'))
    .listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))
