const { Router } = require('express')
const router = Router()

const { getMarketItems } = require('../parse')

router.get('/', async (req, res) => {
    try {
        /* const server = req.headers.server */
        const server = req.headers.server
        let items = getMarketItems(server)
    } catch (e) {
        res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
})

module.exports = router