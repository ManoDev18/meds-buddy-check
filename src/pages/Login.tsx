import supabase from '@/helpers/supabaseClient';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Login Successful",
                description: "LoggedIn Successfully",
            });

            // Optional: clear the form
            setEmail("");
            setPassword("");

            // Redirect to home page
            navigate("/");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
            <div className='w-[600px] bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white'>
                <h1 className='text-3xl font-bold mb-4'>Login</h1>

                <form onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-2'>
                            <label className='font-medium'>Email</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type='email'
                                placeholder='Email'
                                required
                                autoComplete='off'
                                className='w-full text-black outline-none p-4 rounded-md border border-transparent focus:border-blue-500'
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='font-medium'>Password</label>
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type='password'
                                placeholder='Password'
                                autoComplete='off'
                                required
                                className='w-full text-black outline-none p-4 rounded-md border border-transparent focus:border-blue-500'
                            />
                        </div>
                        <button
                            type='submit'
                            className='text-xl bg-gradient-to-r from-blue-500 to-green-500 hover:shadow-lg transition-colors duration-300 ease-in-out rounded-2xl p-4 text-white font-medium'
                        >
                            Login
                        </button>
                        <p>
                            Don't have an account?{" "}
                            <Link to="/register" className='font-medium hover:underline duration-300'>Register</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
