/* App Configuration */
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mysql = require('mysql');
var app = express();
var session = require('express-session');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static("public"));
var bcrypt = require('bcrypt');
app.use(session({
    secret: 'top secret code!',
    resave: true,
    saveUninitialized: true
}));

// /* Configure MySQL DBMS */
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'jperez',
//     password: 'jperez',
//     database: 'quotes_db'
// });
// connection.connect();

/* Home Route */
app.get('/', function(req, res){
    
        res.render('index');
    });

/* Login Routes */
app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', async function(req, res){
    let isUserExist   = await checkUsername(req.body.username);
    let hashedPasswd  = isUserExist.length > 0 ? isUserExist[0].password : '';
    let passwordMatch = await checkPassword(req.body.password, hashedPasswd);
    if(passwordMatch){
        req.session.authenticated = true;
        req.session.user = isUserExist[0].username;
        res.redirect('/welcome');
    }
    else{
        res.render('login', {error: true});
    }
});

/* Register Routes */
app.get('/register', function(req, res){
    res.render('register');
});

app.post('/register', function(req, res){
    let salt = 10;
    bcrypt.hash(req.body.password, salt, function(error, hash){
        if(error) throw error;
        let stmt = 'INSERT INTO users (username, password) VALUES (?, ?)';
        let data = [req.body.username, hash];
        connection.query(stmt, data, function(error, result){
           if(error) throw error;
           res.redirect('/login');
        });
    });
});

/* Logout Route */
app.get('/logout', function(req, res){
   req.session.destroy();
   res.redirect('/');
});

/* Welcome Route */
app.get('/welcome', isAuthenticated, function(req, res){
   res.render('welcome', {user: req.session.user}); 
});
function isAuthenticated(req, res, next){
    if(!req.session.authenticated) res.redirect('/login');
    else next();
};
function checkUsername(username){
    let stmt = 'SELECT * FROM users WHERE username=?';
    return new Promise(function(resolve, reject){
       connection.query(stmt, [username], function(error, results){
           if(error) throw error;
           resolve(results);
       }); 
    });
};

function checkPassword(password, hash){
    return new Promise(function(resolve, reject){
       bcrypt.compare(password, hash, function(error, result){
          if(error) throw error;
          resolve(result);
       }); 
    });
};


/* Error Route*/
app.get('*', function(req, res){
   res.render('error'); 
});

// test server listener
// app.listen("8081", "127.0.0.1", function(){
// 	console.log("Express server is running ... ");
// });

app.listen(process.env.PORT || 3000, function(){
    console.log('Your Server Started ...');
});