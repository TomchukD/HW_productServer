var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var multer = require('multer');
var path = require('path');
var app = express();
const mockProducts = require('./mock.data.json');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let products = [...mockProducts];

app.get('/random-product', function (req, res) {
    const randomIndex = Math.floor(Math.random() * products.length);
    res.json(products[randomIndex]);
});

app.get('/all-products', function (req, res) {
    res.status(200).json(products);
});

app.post('/products', upload.single('image'), function (req, res) {
    if (!req.file) {
        return res.status(400).json({ message: 'Изображение не загружено' });
    }

    const newProduct = {
        productID: products.length + 1,
        name: req.body.name,
        price: parseFloat(req.body.price),
        discount: parseFloat(req.body.discount),
        sku: req.body.sku,
        isActive: req.body.isActive === 'true',
        countryCode: req.body.countryCode,
        itemUrl: req.body.itemUrl,
        tags: req.body.tags ? req.body.tags.split(',') : [],
        imageUrl: `/uploads/${req.file.filename}`
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.put('/products/:id', function (req, res) {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;

    const index = products.findIndex(product => product.productID === productId);
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedProduct };
        res.json(products[index]);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.delete('/products/:id', function (req, res) {
    const productId = parseInt(req.params.id);
    const index = products.findIndex(product => product.productID === productId);

    if (index !== -1) {
        const deletedProduct = products.splice(index, 1);
        res.json(deletedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.listen(80, function () {
    console.log('Сервер запущен на порту 80');
});
