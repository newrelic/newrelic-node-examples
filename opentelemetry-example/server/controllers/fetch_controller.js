'use strict'

const fetchAll = async (req, res, next) => {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts')
        const data = await response.json()
        res.json(data)
    } catch (error) {
        console.error('Error fetching data:', error)
        next(error)
    }
}

const fetchCross = async (req, res, next) => {
    try {
        const port = req.headers.host.includes('3000') ? 3001 : 3000   
        const response = await fetch(`http://localhost:${port}/fetch`)
        const data = await response.json()
        res.json(data)
    } catch (error){
        console.error('Error fetching data:', error)
        next(error)
    }
}

module.exports = {
    fetchAll,
    fetchCross
}