import express from 'express'
import winston from 'winston'
const { transports, format, createLogger } = winston

const logger = createLogger({
	level: 'info',
	format: format.combine(
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		format.errors({ stack: true }),
		format.splat(),
		format.json()
	),
	defaultMeta: { service: process.env.NEW_RELIC_APP_NAME },
	transports: [new transports.Console()]
});

const app = express()

const port = 3000

app.get('/', (req, res) => {
	const randomNumber = Math.floor(Math.random() * 10000)
	const message = `your random number: ${randomNumber}`
	logger.info(message)
	res.status(200).json({ message })
})

app.listen(port, () => {
	logger.info(`Server is running on port ${port}`)
})
