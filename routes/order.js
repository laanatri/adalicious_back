const express = require('express')
const router = express.Router()
const db = require('../db')

router.get("/", async (req, res) => {
    try {
        const selectOrders = 'SELECT * FROM orders ORDER BY created_at DESC'
        const orders = await db.query(selectOrders)
        res.status(200).send(orders.rows)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

router.post("/", async (req, res) => {
    const client = await db.connect()
    try {
        const {userId, orderStatusId, quantities} = req.body

        // {
        //     "user_id": 1,
        //     "order_statu_id": 1,
        //     quantities: [
        //         {
        //             "quantity": 2,
        //             "meal_id": 2
        //         },{
        //             "quantity": 2,
        //             "meal_id": 2
        //         },
        //     ]
        // }

        if (quantities.length === 0) {
            return res.status(400).json({ error: 'Veuillez choisir au moins un plat.' })
        }

        await client.query('BEGIN')

        const insertOrder = 'INSERT INTO orders (user_id, order_statu_id) VALUES ($1, $2) RETURNING id, created_at, order_statu_id, (SELECT name FROM orders_status WHERE id = order_statu_id) as statu_name'
        const insertQuantity = 'INSERT INTO quantities (quantity, order_id, meal_id) VALUES ($1, $2, $3)'
        const getMealById = 'SELECT * FROM meals WHERE id = $1'

        const creatOrder = await client.query(insertOrder, [userId, orderStatusId])
        const orderId = creatOrder.rows[0].id
        const orderDateCreation = creatOrder.rows[0].created_at
        const orderStatus = creatOrder.rows[0].order_statu_id
        const orderStatusName = creatOrder.rows[0].statu_name

        const order = [{orderDateCreation, orderStatus, orderStatusName, "quantities": []}]
        let bill = 0
        for (const quantity of quantities) {
            await client.query(insertQuantity, [quantity.quantity, orderId, quantity.meal_id])
            const meal = await client.query(getMealById, [quantity.meal_id])
            
            order[0].quantities.push({"quantity": quantity.quantity,"meal": meal.rows[0]})
            bill += meal.rows[0].price * quantity.quantity
        }

        // return [
        //     orderDateCreation,
        //     orderStatus,
        //     [
        //         {
        //             quantity,
        //             meal {
        //                 mealdatas
        //             }
        //         }
        //     ]
        // ]

        await client.query('COMMIT')
        res.status(201).json(order, 'Merci pour votre commande !')
    } catch (error) {
        await client.query('ROLLBACK')
        res.status(500).json({error: error.message})
    } finally {
        client.release()
    }
})

module.exports = router;