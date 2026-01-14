

export const requireSession = (req, res, next) => {
    console.log('Session Data from middleware:', req.session);
    if (!req.session?.user?.refresh_token) {
        return res.status(401).send('No valid session found');
    }

    //refreshToken = req.session.user?.refresh_token;
    console.log('Refresh Token after assignment in middleware:', req.session.user.refresh_token);
    next();
}