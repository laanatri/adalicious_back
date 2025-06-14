const express = require('express')
const app = express()
var cors = require('cors')

const mealsRoutes = require('./routes/meal')
const ordersRoutes = require('./routes/order')

app.use(cors())
app.use(express.json())

const port = 5001

app.use('/meal', mealsRoutes)

app.use('/order', ordersRoutes)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})