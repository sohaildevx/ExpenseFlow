import React, {useState} from "react";
import { Link,useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import { toast } from 'react-toastify';

const SignUp = () => {
    const [error, setError] = useState(null);
    const [name, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('simple');
    const [loading, setLoading] = useState(false);
    const navigate= useNavigate();
    const {register}=useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            setError("All fields are required");
            return;
        }
         
        setLoading(true);
        try {
            const formData = await register(name,email,password, userType)
            if(formData.success){
                toast.success("Account created! Please verify your email.");
                navigate('/verify-email', { state: { email: formData.email || email } });
            }else{
                setError(formData.message);
                toast.error(formData.message);
            }
        } catch (error) {
            setError("Registration failed. Please try again.");
            toast.error("Registration failed. Please try again.");
        }finally{
          setLoading(false);
        }
    }
  return (
     <div className='min-h-screen bg-stone-100 flex flex-col'>
          <div className='p-2 md:p-4'>
            <Link to='/'>
              <h1 className='font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tight text-black rounded-2xl bg-yellow-400 inline-block px-2 py-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer'>
                ExpenseFlow
              </h1>
            </Link>
          </div>
    <div className="flex justify-center items-center px-3 py-2 md:py-4 bg-stone-100 flex-1">
      <form className="flex flex-col w-full max-w-md p-4 md:p-5 border-6 md:border-8 border-black bg-yellow-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl md:text-2xl font-black uppercase text-center mb-2 border-b-4 border-black pb-2">
          Sign Up to ExpenseFlow
        </h2>

        <label className="text-black text-sm md:text-base font-black uppercase mb-1 tracking-tight">
          What You Want To Track? :
        </label>

         <select
          id="userType"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="mb-2 p-2 border-4 border-black text-sm font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white cursor-pointer appearance-none"
        >
          <option value="simple" className="font-bold">
            Personal - Daily expenses
          </option>
          <option value="transport" className="font-bold">
            Transport - Trips & fuel
          </option>
        </select>

        <label
          htmlFor="fullName"
          className="text-black text-sm md:text-base font-black uppercase mb-1 tracking-tight"
        >
          Full Name
        </label>

        <div className="relative mb-2">
          <FaUser className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black" size={16} />
          <input
            type="text"
            id="fullName"
            className="w-full pl-9 pr-2 py-2 border-4 border-black text-sm font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white placeholder:text-gray-400"
            placeholder="Name"
            value={name}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <label
          htmlFor="email"
          className="text-black text-sm md:text-base font-black uppercase mb-1 tracking-tight"
        >
          Email
        </label>

        <div className="relative mb-2">
          <MdEmail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black" size={18} />
          <input
            type="email"
            id="email"
            className="w-full pl-9 pr-2 py-2 border-4 border-black text-sm font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white placeholder:text-gray-400"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
        </div>

        <label
          htmlFor="password"
          className="text-black text-sm md:text-base font-black uppercase mb-1 tracking-tight"
        >
          Password
        </label>

        <div className="relative mb-3">
          <RiLockPasswordFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black" size={18} />
          <input
            type="password"
            id="password"
            className="w-full pl-9 pr-2 py-2 border-4 border-black text-sm font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white placeholder:text-gray-400"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-600 font-bold mb-2 text-center text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
          className="bg-black text-yellow-400 font-black text-base md:text-xl uppercase py-2 px-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:bg-gray-800 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all mb-2 select-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>

        <div className="flex items-center my-1">
          <div className="flex-1 border-t-4 border-black"></div>
          <span className="px-3 font-black uppercase text-xs tracking-wider">
            Or
          </span>
          <div className="flex-1 border-t-4 border-black"></div>
        </div>

        <div className="text-center mt-1">
          <p className="font-bold uppercase text-xs mb-1 tracking-tight">
            Already have an account?
          </p>

          <Link to="/login">
            <button
              type="button"
              className="w-full bg-white text-black font-black text-base md:text-xl uppercase py-2 px-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:bg-gray-100 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all select-none"
            >
              Login
            </button>
          </Link>
        </div>
      </form>
    </div>
     </div> 
  );
};

export default SignUp;
