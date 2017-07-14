const Koa = require('koa')
const cors = require('koa-cors')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser')
const asyncBusboy = require('async-busboy')
const fs = require('fs')

const app = new Koa()

app.use(cors())
app.use(static(__dirname + '/public'))
app.use(bodyParser())

app.use(async (ctx, next) => {
    if (ctx.method === 'POST' && ctx.path === '/upload') {
        try {
            const { fields, files } = await asyncBusboy(ctx.req)
            const filenames = files.map(file => {
                file.pipe(fs.createWriteStream(`${__dirname}/upload/${file.filename}`))
                return file.filename
            })
            ctx.body = filenames
        } catch (err) {
            console.error(err.stack)
            throw err
        }
    } else {
        await next()
    }
})

app.listen(8888)