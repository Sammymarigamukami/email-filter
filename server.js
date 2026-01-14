import express from 'express';
import cors from 'cors';
import router from './routes/userSocialRoute.js';
import emailRouter from './routes/emailAttachmentRoute.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 4000;


app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))

app.use(express.json());   // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));    // To parse URL-encoded bodies
app.use(cookieParser());    // To parse cookies

// Session setup
app.use(
  session({    // To manage user sessions
    name: "email-filter-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true only with HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
  })
);

app.use('/auth', router);
app.use('/', emailRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

