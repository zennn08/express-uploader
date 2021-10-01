import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express()
const port = process.env.PORT || 8000

// Cretae folder
if (!fs.existsSync('./public/file')) fs.mkdirSync('./public/file')

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

app.set('json spaces', 2)
app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({
    extended: false
}))
app.use(cookieParser())
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

const storage = multer.diskStorage({
    destination: 'public/file',
    filename: (req, file, cb) => {
        cb(null, makeid(12) +
            path.extname(file.originalname))
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10000000 // 10 MB
    }
})

app.get('/', (req, res) => {
    res.status(200).sendFile('./public/index.html')
})

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file.path) return res.status(400).json({
        status: false,
        message: "No file uploaded"
    })
    res.status(200).json({
        status: true,
        message: "Created by aqulzz",
        result: {
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: "https://" + req.hostname + "/file/" + req.file.filename
        }
    })
}, (error, req, res, next) => {
    res.status(400).json({
        error: error.message
    })
})

app.post('/multi-upload', upload.array('files', 10), (req, res) => {
    if (!req.files) return res.status(400).json({
        status: false,
        message: "No file uploaded"
    })
    const result = []
    req.files.forEach(v => {
        result.push({
            originalname: v.originalname,
            encoding: v.encoding,
            mimetype: v.mimetype,
            size: v.size,
            url: "https://" + req.hostname + "/file/" + v.filename
        })
    });
    res.status(200).json({
        status: true,
        message: "Created by aqulzz",
        result: result
    })
})

// Handling 404
app.use(function (req, res, next) {
    res.status(404).json({
        status: false,
        message: "Page not found"
    })
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
