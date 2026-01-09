import express from 'express';
import cors from 'cors';
import router from './routes/userSocialRoute.js';
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session setup
app.use(
  session({
    name: "email-filter-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true only with HTTPS
      sameSite: "lax"
    }
  })
);

app.use('/auth', router);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

