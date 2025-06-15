import supabase from '@/helpers/supabaseClient';
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    // 🔁 Persist last attempt between renders
    const lastSignupAttempt = useRef(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const now = Date.now();

        // ⛔ Rate-limit check (1 min)
        if (now - lastSignupAttempt.current < 60000) {
            toast({
                title: "Too Many Attempts",
                description: "Please wait 1 minute before trying again.",
                variant: "destructive"
            });

            // ✅ Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            return;
        }

        lastSignupAttempt.current = now;
        setLoading(true);

        const { error } = await supabase.auth.signUp({ email, password });
        setLoading(false);

        if (error) {
            if (error.code === "over_email_send_rate_limit") {
                toast({
                    title: "Rate Limit Exceeded",
                    description: "Too many sign-up attempts. Try again later.",
                    variant: "destructive"
                });

                // Optional: Redirect to login after rate limit error
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast({
                    title: "Registration Failed",
                    description: error.message,
                    variant: "destructive"
                });
            }
            return;
        }

        toast({
            title: "Success!",
            description: "Check your email to confirm your account."
        });

        setTimeout(() => navigate("/login"), 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
            <div className='w-[600px] bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white'>
                <h1 className='text-3xl font-bold mb-4'>Register</h1>
                <form onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-2'>
                            <label className='font-medium'>Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="p-4 rounded-md text-black"
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='font-medium'>Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="p-4 rounded-md text-black"
                            />
                        </div>
                        <button
                            type='submit'
                            className='text-xl bg-gradient-to-r from-blue-500 to-green-500 hover:shadow-lg transition-colors duration-300 ease-in-out rounded-2xl p-4 text-white font-medium'
                        >
                            {loading ? "Creating..." : "Create Account"}
                        </button>
                        <p>
                            Already have an account?{" "}
                            <Link to="/login" className='underline'>Login</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
