'use strict'

const fetch = require('node-fetch');

const fetchAll = async (req, res, next) => {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        next(error);
    }
}

module.exports = {
    fetchAll
}