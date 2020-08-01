let express = require('express');
let app = express();
let mongoose = require('mongoose');
mongoose.connect('mongodb+srv:apiuser:abcd1234@cluster0.rcyha.mongodb.net/rest-api?retryWrites=true&w=majority')
let bodyParser = require('body-parser');
let Restaurant = require('./restaurant')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let port = process.env.PORT||8080;
let router = express.Router();

router.get('/', (req, res) => {
    res.json({message:'Home Page!!'})
})

router.get('/restaurant', (req, res) => {
    Restaurant.find().then(doc => {
        res.json({data: doc})
    }).catch(err => {
        res.err({message: 'Something is wrong'})
    })
})

router.get('/restaurant/:id', (req, res) => {
    Restaurant.findById(req.params.id).then(doc => {
        res.json({data:doc})
    }).catch(err => {
        res.json({message: 'Something is Wrong!'})
    })
})

router.put('/restaurant/:id', (req, res) => {
    Restaurant.findByIdAndUpdate(req.params.id, req.body, {useFindAndModify: false}).then(doc => {
        res.send('Restaurant Update successfully ' + req.params.id)
    }).catch(err => {
    res.err({message: 'Something went wrong'})
    })
})

router.post('/restaurant', (req,res) => {
    let newRestaurant = new Restaurant({
        name: req.body.name,
        address: req.body.address,
        types: req.body.types,
        description: req.body.description,
        opening_time: req.body.opening_time,
        email: req.body.email,
        phone: req.body.phone,
        lotitude: req.body.lotitude,
        longitude: req.body.longitude
    })

    newRestaurant.save().then(doc => {
        res.json({message: 'Create Restaurant Successfully'})
    }).catch(err => {
        res.err({message: 'Something is Wrong'})
    })
})

router.delete('/restaurant/:id', (req,res) => {
    Restaurant.findByIdAndDelete(req.params.id).then(doc => {
        res.json({message: 'Restaurant succesfully deleted'})
    }).catch(err =>{
        res.json({message: 'Something is wrong'})
    })
})


router.get('/')

app.use('/api', router);

app.listen(port);

console.log('Magic happen at port ' + port)