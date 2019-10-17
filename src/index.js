const express = require('express')
require('./db/mongoose') // ensures that the file runs and connect to the db
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

const app = express()
const port = process.env.PORT

app.use(express.json()) // automatically parse incoming json to an object
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up')
})