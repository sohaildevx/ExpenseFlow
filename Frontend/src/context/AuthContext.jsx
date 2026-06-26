import React, {createContext, useContext, useState, useEffect} from 'react'
import axios from '../config/Axios';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);
    const [isAuthenticated,setIsAuthenticated]=useState(false);

    const parseError = (error) => {
        const data = error.response?.data;
        if (data?.message) return data.message;
        if (data?.errors?.length) return data.errors.map(e => e.msg).join(', ');
        return 'Something went wrong. Please try again.';
    };
 
    useEffect(()=>{
        checkAuth();
    },[]);

    const checkAuth = async()=>{
          try {
            const response = await axios.get('/user/getCurrentUser');
            setUser(response.data.user);
            setIsAuthenticated(true);
          } catch (error) {
            setIsAuthenticated(prev => {
              if (prev) return prev;
              return false;
            });
            setUser(prev => {
              if (prev) return prev;
              return null;
            });
          } finally{
            setLoading(false);
          }
    }

    const login = async(email, password) => {
         try {
            
            const response = await axios.post('/user/login',{email,password});
            setIsAuthenticated(true);
            setUser(response.data.user);
            setLoading(false);
            return {success: true, user: response.data.user};
         } catch (error) {
            if (error.response?.status === 403 && error.response?.data?.needsVerification) {
                return {success: false, needsVerification: true, email: error.response.data.email, message: error.response.data.message};
            }
            return{ success: false, message: parseError(error) }
         }   
    }

    const register = async(name,email,password,userType)=>{
        try{
            const response = await axios.post('/user/register',{name,email,password,userType});
            return {success: true, email: response.data.email};
        }catch(error){
            return{ success: false, message: parseError(error) }
        }
    }

    const logOut = async()=>{
        try {
            const response = await axios.post('/user/logout');
            setIsAuthenticated(false);
            setUser(null);
            return {success: true};
        } catch (error) {
            return {
                success: false,
                message: parseError(error)
            }
        }
    }

    const resetPassword = async(email, otp, newPassword)=>{
        try {
            setLoading(true);
            const reponse = await axios.post('/user/reset-password',{email, otp, newPassword});
            return {success:true, message: reponse.data.message || 'Password reset successful'};
        } catch (error) {
            return{success:false, message: parseError(error)};
        }
    }

    const resetPassOtp = async(email)=>{
        try{
            setLoading(true);
            const response = await axios.post('/user/send-reset-otp',{email});
            return {success:true, message: response.data.message || 'OTP sent successfully'};
        }catch(error){ 
            return {success:false, message: parseError(error)};
        }

    }

    const verifyResetOtp = async(email, otp)=>{
        try{
            const response = await axios.post('/user/verify-reset-otp',{email, otp});
            return {success:true, message: response.data.message || 'OTP verified'};
        }catch(error){
            return {success:false, message: parseError(error)};
        }
    }

    const verifyEmail = async(email, otp)=>{
        try{
            const response = await axios.post('/user/verify-email',{email, otp});
            return {success:true, message: response.data.message || 'Email verified'};
        }catch(error){
            return {success:false, message: parseError(error)};
        }
    }

    const resendVerificationOtp = async(email)=>{
        try{
            const response = await axios.post('/user/resend-verification-otp',{email});
            return {success:true, message: response.data.message || 'OTP sent successfully'};
        }catch(error){
            return {success:false, message: parseError(error)};
        }
    }

    const googleLogin = async(credential, userType)=>{
        try{
            const response = await axios.post('/user/google',{credential, userType});
            if(response.data.user){
                setIsAuthenticated(true);
                setUser(response.data.user);
                setLoading(false);
            }
            return {success:true, ...response.data};
        }catch(error){
            return {success:false, message: parseError(error)};
        }
    }

    const completeGoogleSignup = async(credential, userType)=>{
        try{
            const response = await axios.post('/user/google/complete',{credential, userType});
            setIsAuthenticated(true);
            setUser(response.data.user);
            setLoading(false);
            return {success:true, user: response.data.user};
        }catch(error){
            return {success:false, message: parseError(error)};
        }
    }

    const value ={
        user,
        loading,
        isAuthenticated,
        resetPassOtp,
        verifyResetOtp,
        resetPassword,
        verifyEmail,
        resendVerificationOtp,
        googleLogin,
        completeGoogleSignup,
        login,
        logOut,
        register,
        checkAuth
    }

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = ()=>{
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
