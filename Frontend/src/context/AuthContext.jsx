import React, {createContext, useContext, useState, useEffect} from 'react'
import axios from '../config/Axios';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);
    const [isAuthenticated,setIsAuthenticated]=useState(false);
 
    useEffect(()=>{
        checkAuth();
    },[]);

    const checkAuth = async()=>{
          try {
            const response = await axios.get('/user/getCurrentUser');
            setUser(response.data.user);
            setIsAuthenticated(true);
          } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
          } finally{
            setLoading(false);
          }
    }

    const login = async(email, password) => {
         try {
            
            const response = await axios.post('/user/login',{email,password});
            setIsAuthenticated(true);
            setUser(response.data.user);
            return {success: true};
         } catch (error) {
            if (error.response?.status === 403 && error.response?.data?.needsVerification) {
                return {success: false, needsVerification: true, email: error.response.data.email, message: error.response.data.message};
            }
            return{
                success: false,
                message: error.response?.data?.message || 'Login failed'
            }
         }   
    }

    const register = async(name,email,password,userType)=>{
        try{
            const response = await axios.post('/user/register',{name,email,password,userType});
            return {success: true, email: response.data.email};
        }catch(error){
            return{
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            }
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
                message: error.response?.data?.message || 'Logout failed'
            }
        }
    }

    //Reset password function's added here

    const resetPassword = async(email, otp, newPassword)=>{
        try {
            setLoading(true);
            const reponse = await axios.post('/user/reset-password',{email, otp, newPassword});
            return {success:true, message: reponse.data.message || 'Password reset successful'};
        } catch (error) {
            return{success:false, message: error.response?.data?.message || 'Password reset failed'};
        }
    }

    const resetPassOtp = async(email)=>{
        try{
            setLoading(true);
            const response = await axios.post('/user/send-reset-otp',{email});
            return {success:true, message: response.data.message || 'OTP sent successfully'};
        }catch(error){ 
            return {success:false, message: error.response?.data?.message || 'Failed to send OTP'};
        }

    }

    const verifyResetOtp = async(email, otp)=>{
        try{
            const response = await axios.post('/user/verify-reset-otp',{email, otp});
            return {success:true, message: response.data.message || 'OTP verified'};
        }catch(error){
            return {success:false, message: error.response?.data?.message || 'Failed to verify OTP'};
        }
    }

    const verifyEmail = async(email, otp)=>{
        try{
            const response = await axios.post('/user/verify-email',{email, otp});
            return {success:true, message: response.data.message || 'Email verified'};
        }catch(error){
            return {success:false, message: error.response?.data?.message || 'Failed to verify email'};
        }
    }

    const resendVerificationOtp = async(email)=>{
        try{
            const response = await axios.post('/user/resend-verification-otp',{email});
            return {success:true, message: response.data.message || 'OTP sent successfully'};
        }catch(error){
            return {success:false, message: error.response?.data?.message || 'Failed to send OTP'};
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
