import express from 'express'
const app = express()

const PORT = 3000

app.listen(PORT, ()=> {
    console.log(`Server started on port ${PORT}`)
})

 app.use(express.json())

app.get('/', (req, res)=>{
    res.status(212).send("<h1>Hello there bro!</h1>")
})

app.get('/shop', (req, res)=>{
    res.status(232).send("<h1>Hello shop!</h1>")
})

app.get('/shop/:id', (req, res)=>{
    const data = req.params
    res.status(232).send(`<a href='/'> Book: ${data.id}</a>`)
})