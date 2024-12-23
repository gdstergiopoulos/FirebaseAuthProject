import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import { initializeApp } from "firebase/app";
import cors from 'cors';

import { getAuth,  createUserWithEmailAndPassword , signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect,signInWithPopup, signInAnonymously, linkWithCredential, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink} from "firebase/auth";
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

const googleProvider = new GoogleAuthProvider();

const app = express();
const router = express.Router();
const port = 3000;

app.engine('hbs', engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');

app.use(express.static('public'));

app.use(router);

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(session({

    secret: process.env.SESSION_SECRET || "PynOjAuHetAuWawtinAytVunar", // κλειδί για κρυπτογράφηση του cookie
    resave: false, // δεν χρειάζεται να αποθηκεύεται αν δεν αλλάξει
    saveUninitialized: false, // όχι αποθήκευση αν δεν έχει αρχικοποιηθεί
    cookie: {
      maxAge: 2 * 60 * 60 * 1000, //TWO_HOURS χρόνος ζωής του cookie σε ms
      sameSite: true
    }
  }));

router.use(cors());
router.route('/').get((req, res) => { 
    // if (req.session.email) {
    //     res.render('main', { layout: 'main', username: req.session.email });
    // } else {
    //     res.redirect('/login');
    // }
    // res.render('main', { layout: 'main' });
    // onAuthStateChanged(auth, (user) => {
    //     if (user) {
    //         console.log("signed in",user.email)
    //         res.render('main', { layout: 'main', email: user.email });
    //     } else {
    //         res.redirect('/login');
    //     }
    // });
    if(req.session.email){ 
        res.render('main', { layout: 'main', email: req.session.email, uid:req.session.uid, displayName:req.session.displayName, photoURL:req.session.photoURL });
    }
    else{
        if(auth.currentUser){
        if(auth.currentUser.isAnonymous){
            res.render('main', { layout: 'main', email: "Guest" });
        }
        else{
            res.render('main', { layout: 'main', email: auth.currentUser.email });
        }
    }
    else{
        res.redirect('/login');
    }
    }
    
});

router.route('/login').get((req, res) => { 
    // if (req.session.email) {
    //     res.redirect('/');
    // }
    // else {
    //     res.render('login', { layout: 'main' });
    // }
    
    // onAuthStateChanged(auth, (user) => {
    //     if (user) {
    //         // console.log("signed in",user)
    //         res.redirect('/');
    //     } else {
    //         res.render('login');
    //     }
    // });

    if(auth.currentUser){
        res.redirect('/');
    }
    else{
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
        // req.session.email = req.body.email;
        res.render('main', { layout: 'main', email:user.email });
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
    auth.signOut().then(() => {
        console.log('User signed out.');
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
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

router.route('/login/anon').get(async (req, res) => {
    if(auth.currentUser){
        res.redirect('/');
    }
    else{
        await signInAnonymously(auth)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user)
            // req.session.email = user;
            res.redirect('/');
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            res.render('login', { layout: 'main', error: errorMessage });
        });
    }   
}   );

router.route('/login/google').post(async (req, res) => {
    console.log(req.body);
    if(req.body.uid){
        console.log("entered")
        req.session.email = req.body.email;
        req.session.uid=req.body.uid;
        req.session.displayName=req.body.displayName;
        req.session.photoURL=req.body.photoURL;
        res.json({ message: 'Google login successful' });
    }   
});

router.route('/login/passwordless').get((req, res) => {
    res.render('passwordless', { layout: 'main' });
} );

router.route('/login/passwordless').post((req, res) => {
    req.session.emailprovided=req.body.email;
    sendSignInLinkToEmail(auth, req.body.email, {
        url: 'http://localhost:3000/login/passwordless/verify',
        handleCodeInApp: true,
    })
    .then(() => {
        res.render('passwordless', { layout: 'main', message: 'Email sent. Please check your inbox.' });
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        res.render('passwordless', { layout: 'main', error: errorMessage });
    });
});

router.route('/login/passwordless/verify').get((req, res) => {
    const { oobCode } = req.query;
    res.render('passwordlessverify', { layout: 'main',message:"Verifying...",emailprovided:req.session.emailprovided,oobCode });
});

router.route('/login/passwordless/success').post((req, res) => {
    console.log(req.body);
});

router.use((req, res) => {
    res.status(404).send('404 Not Found');
});




const server = app.listen(port, () => {console.log(`http://localhost:${port}`)});