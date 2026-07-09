import React from 'react';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const handleGoogleLogin = async () => {
    // Note: Yahan aap apna supabase auth provider call config jod sakte hain
    console.log("Google Login Triggered");
  };

  return (
    <div className="min-h-screen bg-[#0a0512] flex flex-col items-center justify-center p-6 selection:bg-[#ff007f]">
      <div className="w-full max-w-md bg-[#130b24] border border-[#261542] rounded-2xl p-8 shadow-[0_0_30px_rgba(255,0,127,0.15)] flex flex-col items-center">
        
        {/* Neon Logo Section */}
        <div className="mb-8 text-center animate-pulse">
          <h1 className="text-4xl font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-[#ff007f] to-[#7f00ff] drop-shadow-[0_0_10px_#ff007f]">
            SHADOW
          </h1>
          <p className="text-[#a28ec2] text-xs font-mono mt-2 tracking-widest uppercase">
            Private Social Intelligence
          </p>
        </div>

        {/* Input Fields Container */}
        <div className="w-full space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase text-[#ff007f] mb-2 tracking-wider">
              Email or Phone
            </label>
            <input 
              type="text" 
              placeholder="Enter your credentials" 
              className="w-full bg-[#0a0512] border border-[#3d2269] rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ff007f] focus:shadow-[0_0_10px_rgba(255,0,127,0.3)] transition-all duration-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#ff007f] mb-2 tracking-wider">
              Password
            </label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              className="w-full bg-[#0a0512] border border-[#3d2269] rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ff007f] focus:shadow-[0_0_10px_rgba(255,0,127,0.3)] transition-all duration-300 text-sm"
            />
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-gradient-to-r from-[#ff007f] to-[#aa00ff] hover:from-[#aa00ff] hover:to-[#ff007f] text-white font-bold py-3.5 px-4 rounded-xl mt-6 transition-all duration-500 shadow-[0_0_15px_#ff007f] hover:scale-[1.02] text-sm tracking-wider uppercase">
          Sign In
        </button>

        {/* Divider */}
        <div className="w-full flex items-center my-6">
          <div className="flex-1 h-[1px] bg-[#261542]"></div>
          <span className="px-3 text-xs text-gray-500 font-mono">OR</span>
          <div className="flex-1 h-[1px] bg-[#261542]"></div>
        </div>

        {/* Clean Google Button */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-[#0a0512] border border-[#3d2269] hover:border-[#ff007f] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:bg-[#130b24]"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          <span className="text-sm font-sans tracking-wide">Continue with Google</span>
        </button>

        {/* Footer Link */}
        <p className="text-xs text-gray-500 font-sans mt-8">
          Don't have an account?{' '}
          <span onClick={() => onNavigate('signup')} className="text-[#ff007f] hover:underline cursor-pointer font-medium">
            Create account
          </span>
        </p>

      </div>
    </div>
  );
};
