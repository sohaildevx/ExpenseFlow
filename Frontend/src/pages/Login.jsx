import React, {useState,useEffect} from 'react'
import {Link} from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { toast } from 'react-toastify';
import ModeSelectionModal from '../Components/ModeSelectionModal';

const Login = () => {
  const navigate=useNavigate();
  const [error,setError]=useState(null);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const {login,isAuthenticated,user,googleLogin,completeGoogleSignup}=useAuth();
  const [loading, setLoading] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);

  useEffect(()=>{
     if(isAuthenticated && user){
       const dest = user.userType === 'transport' ? '/dashboard' : '/expense-dashboard';
       navigate(dest, {replace: true});
     }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit= async (e)=>{
    e.preventDefault();

    if(!email || !password){
      setError("All fields are required");
      toast.error("All fields are required");
      return;
    }
     
    setLoading(true);

    try {
      const result = await login(email, password);
      if(result.success){
        toast.success("Login successful!");
        setError(null);
      }else if(result.needsVerification){
        toast.error("Email not verified. Please verify your email.");
        navigate('/verify-email', { state: { email: result.email } });
      }else{
        setError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    }finally{
      setLoading(false);
    }
    
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        toast.success("Google login successful!");
      } else if (result.needsModeSelection) {
        setGoogleCredential(result.googleCredential);
        setShowModeModal(true);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      setError("Google login failed. Please try again.");
      toast.error("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModeSelect = async (userType) => {
    setLoading(true);
    try {
      const result = await completeGoogleSignup(googleCredential, userType);
      if (result.success) {
        toast.success("Account created successfully!");
        setShowModeModal(false);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      setError("Failed to complete signup. Please try again.");
      toast.error("Failed to complete signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  return (
        <div className='min-h-screen bg-stone-100'>
      <div className='p-4'>
        <Link to='/'>
          <h1 className='font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-black rounded-2xl bg-yellow-400 inline-block px-2 py-1 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer'>
            ExpenseFlow
          </h1>
        </Link>
      </div>
    <div className='flex justify-center items-center  px-4 py-6 md:py-8 bg-stone-100'>
      <form className='flex flex-col w-full max-w-md p-6 md:p-6 border-8 border-black bg-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]' onSubmit={handleSubmit}>
        <h2 className='text-2xl md:text-3xl font-black uppercase text-center mb-5 border-b-4 border-black pb-3'>Login to ExpenseFlow</h2>

        <label htmlFor="email" className='text-black text-sm md:text-base font-black uppercase mb-1 tracking-tight'>
            Email
        </label>

        <div className='relative mb-2'>
          <MdEmail className='absolute left-2 top-1/2 transform -translate-y-1/2 text-black' size={18}/>
          <input 
            type="email" 
            id='email' 
            className='w-full pl-9 pr-2 py-2 border-4 border-black text-sm font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white placeholder:text-gray-400' 
            placeholder='Email' 
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
        </div>


        <label htmlFor="password" className='text-black text-sm md:text-base font-black uppercase mb-1 tracking-tight'>
            Password
        </label>

        <div className="relative mb-3">
          <RiLockPasswordFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black" size={18} />
          <input 
            type="password" 
            id='password' 
            className='w-full pl-9 pr-2 py-2 border-4 border-black text-sm font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white placeholder:text-gray-400' 
            placeholder='Password' 
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className='text-red-600 font-bold mb-4 text-center'>{error}</p>}

        <Link to="/forgot" className='text-center mb-4 font-bold uppercase text-xs md:text-sm underline decoration-4 decoration-black hover:bg-black hover:text-yellow-400 transition-colors px-2 py-1 inline-block self-center'>
        Forgot Password?
        </Link>

        <button
          type='submit'
          disabled={loading}
          className='bg-black text-yellow-400 font-black text-xl md:text-2xl uppercase py-3 px-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 active:bg-gray-800 active:shadow-none active:translate-x-2 active:translate-y-2 transition-all mb-4 select-none disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? 'Logging In...' : 'Login'}
        </button>

        <div className='flex items-center my-3'>
          <div className='flex-1 border-t-4 border-black'></div>
          <span className='px-4 font-black uppercase text-base tracking-wider'>Or</span>
          <div className='flex-1 border-t-4 border-black'></div>
        </div>

        <div className='flex justify-center mb-4'>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
          />
        </div>

        <div className='text-center mt-3'>
          <p className='font-bold uppercase text-sm mb-3 tracking-tight'>
            Don't have an account?
          </p>
          
          <Link to='/signup'>
            <button 
              type='button'
              className='w-full bg-white text-black font-black text-xl md:text-2xl uppercase py-3 px-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 active:bg-gray-100 active:shadow-none active:translate-x-2 active:translate-y-2 transition-all select-none'
              
              >
              Create Account
            </button>
              </Link>
        </div>
        
      </form>
    </div>

    {showModeModal && (
      <ModeSelectionModal 
        onSelect={handleModeSelect} 
        loading={loading} 
      />
    )}
     </div> 
  )
}

export default Login
