import jwt from 'jsonwebtoken';

const generateToken = (token)=>{
    return jwt.sign(token,process.env.JWT_SECRET,{expiresIn:'1d'});
}

const  setTokenCookie= (res,token)=>{
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token',token,{
        httpOnly:true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge:24*60*60*1000,
        path:'/'
    });
}

export {
    generateToken,
    setTokenCookie
}