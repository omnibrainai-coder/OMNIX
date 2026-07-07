import { motion } from 'framer-motion';
import { Hop as HomeIcon, Search, CirclePlus as PlusCircle, MessageCircle, User } from 'lucide-react';

interface HomeProps {
  user?: {
    username: string;
    email?: string;
  };
  onNavigate: (page: string) => void;
}

export function Home({ user, onNavigate }: HomeProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-shadow-bg pb-20">
      {/* Header */}
      <motion.header
        variants={container}
        initial="hidden"
        animate="show"
        className="sticky top-0 z-50 bg-shadow-surface/80 backdrop-blur-xl border-b border-white/10 px-4 py-3"
      >
        <motion.div variants={item} className="flex items-center justify-between">
          <h1 className="text-xl font-light tracking-[0.2em] text-white font-[Share_Tech_Mono]">
            SHADOW
          </h1>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-shadow-primary/20 text-shadow-primary text-[10px] font-mono tracking-wider">
              LIVE
            </span>
          </div>
        </motion.div>
      </motion.header>

      {/* Welcome message */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 py-6"
      >
        <motion.div variants={item} className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-shadow-primary to-shadow-secondary flex items-center justify-center text-black text-2xl font-bold mb-3">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h2 className="text-lg font-medium text-white">
            Welcome, {user?.username || 'User'}
          </h2>
          <p className="text-sm text-white/40 mt-1">
            Your private social feed awaits
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-shadow-card/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-mono text-shadow-primary">0</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Posts</div>
          </div>
          <div className="bg-shadow-card/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-mono text-shadow-primary">0</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Followers</div>
          </div>
          <div className="bg-shadow-card/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-mono text-shadow-primary">0</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Following</div>
          </div>
        </motion.div>

        {/* OMNI Score */}
        <motion.div
          variants={item}
          className="bg-shadow-card/60 backdrop-blur-xl border border-shadow-primary/30 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">OMNI Score</div>
              <div className="text-3xl font-mono text-shadow-primary mt-1">0.0</div>
            </div>
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-gradient-to-r from-shadow-primary to-shadow-secondary rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Empty state */}
        <motion.div
          variants={item}
          className="bg-shadow-card/40 border border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-shadow-primary/10 flex items-center justify-center mb-4">
            <PlusCircle className="w-8 h-8 text-shadow-primary" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
          <p className="text-sm text-white/40 mb-4">
            Create your first post to get started
          </p>
          <button
            onClick={() => onNavigate('create')}
            className="px-6 py-2 bg-gradient-to-r from-shadow-primary to-cyan-400 text-black font-semibold text-sm rounded-lg"
          >
            Create Post
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-shadow-surface/90 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center gap-1 text-shadow-primary px-4 py-2"
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-mono tracking-wider">HOME</span>
          </button>
          <button
            onClick={() => onNavigate('search')}
            className="flex flex-col items-center gap-1 text-white/40 hover:text-white/60 transition-colors px-4 py-2"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-mono tracking-wider">SEARCH</span>
          </button>
          <button
            onClick={() => onNavigate('create')}
            className="flex flex-col items-center gap-1 text-white/40 hover:text-white/60 transition-colors px-4 py-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-[10px] font-mono tracking-wider">CREATE</span>
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className="flex flex-col items-center gap-1 text-white/40 hover:text-white/60 transition-colors px-4 py-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-mono tracking-wider">CHAT</span>
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className="flex flex-col items-center gap-1 text-white/40 hover:text-white/60 transition-colors px-4 py-2"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-mono tracking-wider">PROFILE</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
