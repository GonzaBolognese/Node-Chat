import express from 'express'

const app = express()

const port = process.env.PORT ?? 3000

app.get('/', (req, res) => {
    res.send('<h1>Bongiorno tuti</h1>')
})

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
})