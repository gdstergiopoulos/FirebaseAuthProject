import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import { initializeApp } from "firebase/app";
import { getAuth,  createUserWithEmailAndPassword , signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
// import {} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDujX1xksZ12l4HTNIesiez-hdEPmRaO4g",
    authDomain: "cybersecurityhmty.firebaseapp.com",
    projectId: "cybersecurityhmty",
    storageBucket: "cybersecurityhmty.firebasestorage.app",
    messagingSenderId: "617838396186",
    appId: "1:617838396186:web:bf8a87b857ca9d3748e2a3",
    measurementId: "G-8B270P5BTQ"
  };

const authapp= initializeApp(firebaseConfig);
const auth= getAuth(authapp);

const app = express();
const router = express.Router();
const port = 3000;

app.engine('hbs', engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');

app.use(express.static('public'));

app.use(router);

router.use(express.urlencoded({ extended: true }));

router.use(session({

    secret: process.env.SESSION_SECRET || "PynOjAuHetAuWawtinAytVunar", // κλειδί για κρυπτογράφηση του cookie
    resave: false, // δεν χρειάζεται να αποθηκεύεται αν δεν αλλάξει
    saveUninitialized: false, // όχι αποθήκευση αν δεν έχει αρχικοποιηθεί
    cookie: {
      maxAge: 2 * 60 * 60 * 1000, //TWO_HOURS χρόνος ζωής του cookie σε ms
      sameSite: true
    }
  }));

router.route('/').get((req, res) => { 
    if (req.session.email) {
        res.render('main', { layout: 'main', username: req.session.email });
    }
    else {
        res.redirect('/login');
    }
    // res.render('main', { layout: 'main' });
});

router.route('/login').get((req, res) => { 
    if (req.session.email) {
        res.redirect('/');
    }
    else {
        res.render('login', { layout: 'main' });
    }
});

router.route('/login').post(async (req, res) => { 
    await signInWithEmailAndPassword(auth,req.body.email,req.body.password)
    .then((userCredential) => {
        // Signed in 
        console.log("signed in")
        let user = userCredential.user;
        // console.log(user)
        req.session.email = req.body.email;
        res.render('main', { layout: 'main', email: req.session.email });
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage)
        res.render('login', { layout: 'main', error: errorMessage });
    });
});


router.route('/logout').get((req, res) => { 
    req.session.destroy();
    res.redirect('/login');
});

router.route('/register').get((req, res) => { 
    res.render('register', { layout: 'main' });
});

router.route('/login/accountcreated').get((req, res) => {
    res.render('login', { layout: 'main', message: 'Your account has been created. Please login.' });
});

router.route('/register').post(async (req, res) => { 
    if(req.body.password !== req.body.confirmpassword) {
        res.render('register', { layout: 'main', error: 'Passwords do not match' });
    }
    else{
        await createUserWithEmailAndPassword(auth,req.body.email,req.body.password)
        .then((userCredential) => {
        // Signed in 
            const user = userCredential.user;
            // console.log(user)
            // res.send(user)
            // res.render('login', { layout: 'main', message: 'Your account has been created. Please login.' });
            res.redirect('/login/accountcreated');
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            res.render('register', { layout: 'main', error: errorMessage });
        });
    }
    
});

router.use((req, res) => {
    res.status(404).send('404 Not Found');
});




const server = app.listen(port, () => {console.log(`http://localhost:${port}`)});