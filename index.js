let express = require('express');
let app = express();
let mongoose = require('mongoose');
mongoose.connect('mongodb+srv:apiuser:abcd1234@cluster0.rcyha.mongodb.net/rest-api?retryWrites=true&w=majority')
let bodyParser = require('body-parser');
let Restaurant = require('./restaurant');
let User = require('./user')
const auth = require('./auth')()
const jwt = require('jsonwebtoken');
const config = require('./config');


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//Initialize the authentication
app.use(auth.initialize());

let port = process.env.PORT||8080;
let router = express.Router();

//Page Route
router.get('/', (req, res) => {
    res.json({message:'Home Page!!'})
})

router.get('/restaurants', (req, res) => {
    //Get all Restaurant
    Restaurant.find().then(doc => {
        res.json({data: doc})
    }).catch(err => {
        res.json({message: 'Something is wrong ' + err})
    })
})

router.get('/restaurants/:id', (req, res) => {
    //Search certain Restaurant using ID
    Restaurant.findById(req.params.id).then(doc => {
        res.json({data:doc})
    }).catch(err => {
        res.json({message: 'Something is Wrong!'})
    })
})

router.put('/restaurants/:id', (req, res) => {
    //Search restaurant using ID and Update
    Restaurant.findByIdAndUpdate(req.params.id, req.body, {useFindAndModify: false}).then(doc => {
        res.send('Restaurant Update successfully ' + req.params.id)
    }).catch(err => {
        res.json({message: 'Something went wrong ' + err})
    })
})

//Add new Reatuarant route
router.post('/restaurants', auth.authenticate(), (req,res) => {
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
    //Save the new created restaurant
    newRestaurant.save().then(doc => {
        res.json({message: 'Create Restaurant Successfully'})
    }).catch(err => {
        res.err({message: 'Something is Wrong'})
    })
})

//Delete the restaurant
router.delete('/restaurants/:id', (req,res) => {
    Restaurant.findByIdAndDelete(req.params.id).then(doc => {
        res.json({message: 'Restaurant succesfully deleted'})
    }).catch(err =>{
        res.json({message: 'Something is wrong'})
    })
})

//Register route
router.post('/register', (req,res) =>{
    let newUser = new User({
        username: req.body.username,
        password: req.body.password
    })
    newUser.save().then(doc => {
        res.json({message: 'Register successfully'})
    }).catch(err => {
        res.json({message: 'An error occured ' + err})
    })
});

//Login route
router.post('/login', (req,res) => {
    User.findOne({username: req.body.username}).then(user => {
        if(user){
            user.verifyPassword(req.body.password, (err, isMatch) => {
                if(err) res.json({message: 'somethin is wrong '})
                if (!isMatch){
                    res.json({message:'Wrong password'})
                }
                else {
                    //Add Authentication token
                    const token = jwt.sign(user.toJSON(), config.secret, {
                        expiresIn: 10080
                    });
                    res.json({message: 'success', token: 'JWT ' + token})
                }
            });
         } else {
            res.json({message:'User not found!'})
        }
    }).catch(err => {
        res.json({message: 'An error occured ' + err})
    });
});

//Menu Route
router.post('/restaurants/:id/menus', (req,res) => {
    Restaurant.findById(req.params.id).then(doc => {
        let newMenu = {
            name: req.body.name,
            price: req.body.price
        }
        doc.menu.push(newMenu);

        doc.save().then(doc => {
            res.json({message: 'Menus have been post'})
        }).catch(err => {
            res.json({message: 'err ' + err})
        });
    }).catch(err => {
        res.json({message: 'err ' + err})
    });
});

//Get Menu
router.get('/restaurants/:id/menus', (req,res) => {
    newMenu.findById(req.params.restaurant_id).then(doc => {
        res.json({data: doc.menus});
    }).catch(err => {
        res.json({messsage: 'err ' + err})
    });
})

//Get a perticular Menu
router.get('/restaurants/:restaurant_id/menus/menu_id', (req,res) => {
    Restaurant.findById(req.params.restaurant_id).then(doc => {
        const restaurantMenu = doc.menus.filter(menus => menus._id == req.params.menu_id)[0]
    
        doc.then(doc => {
            res.send({data: restaurantMenu})
        }).catch(err => {
            res.send('Error ' + err)
        })
    });
});

//Update Menu
router.put('/restaurants/:restaurant_id/menu/:menu_id', (req, res) => {
    Restaurant.findById(req.params.restaurant_id).then(doc => {
        const menu = doc.reviews.filter(menu => menus.id == req.params.id)[0]
        menu.name = req.body.name 
        menu.price= req.body.price

        doc.menus.push(menu)

        doc.save().then(doc => {
            res.send('Menu have been updated')
        });

    }).catch(err => {
        res.send('err ' + err)
    });
});

//Delete Menu
router.delete('/restaurants/:restaurant_id/menus/:menus_id', (req,res) => {
    Restaurant.findById(req.params.restaurant_id).then(doc => {
        const remainingMenu = doc.menus.fileter(menus => menus._id != req.params.params.menu_id)[0]
        doc.menus = remainingMenu;

        doc.save().then(d0c => {
            res.send('Restaurant have been deleted ' + req.params.menu_id)
        }).catch(err => {
            res.send('Error ' + err)
        });
    });
});

//Rating route
//post Reviews
router.post('/restaurants/:id/reviews', (req,res) =>{
    Restaurant.findById(req.params.id).then(doc => {
        let newReview = {
            star: req.body.star,
            name: req.body.name,
            review: req.body.review
        }

        let sumAvgRating = newReview.star + newReview.star
        let averageRating = sumAvgRating / newReview.star.length

        doc.averageRating.push(averageRating);

        doc.reviews.push(newReview);

        doc.save().then(doc => {
            res.json({message: 'Reviews successfully post'})
        }).catch(err => {
            res.json({message: 'An error occured ' + err})
        });
    }).catch(err => {
        res.json({message: 'err ' +err})
    });
});

//Get All Review
router.get('/restaurants/:id/reviews', (req, res) => {
    Restaurant.findById(req.params.id).then(doc => {
        res.json({data: doc.reviews})
    }).catch(err => {
        res.json({message: 'err ' + err})
    });
});

//Get a particular review
router.get('/restaurants/:restaurant_id/reviews/:review_id', (req, res) => {
    Restaurant.findById(req.params.restaurant_id).then(doc => {
        let user_review = doc.reviews.filter(review => review._id == req.params.review_id)[0]
        res.json({message:"Ok", data:user_review})
    })
})

//Change Review
router.put('/restaurants/:restaurant_id/reviews/:review_id', (req, res) => {
    Restaurant.findById(req.params.restaurant_id).then(doc => {
        let review = doc.reviews.filter(reviews => reviews._id == req.params.review_id)[0]
        review.star = req.body.star 
        review.name = req.body.name
        review.review = req.body.review

        doc.reviews.push(review)

        doc.save().then(doc => {
            res.send('Review have been updated')
        });

    }).catch(err => {
        res.send('err ' + err)
    });
});

//Delete Review
router.delete('/restaurants/:restaurant_id/reviews/:review_id', (req,res) => {
    Restaurant.findById(req.params.restaurant_id).then(doc => {
        doc.reviews = remainingReview
        const remainingReview = doc.reviews.filter(review => review._id != req.params.review_id)[0]

        doc.save().then(doc => {
            res.send('Review have been delete')
        });
    }).catch(err => {
        res.send('error occur ' + err)
    });
});

router.get('/')
app.use('/api', router);
app.listen(port);
console.log('Magic happen at port ' + port)