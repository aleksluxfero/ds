
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

// Это обходной путь, чтобы гарантировать, что JIT-компилятор Tailwind
// включает все возможные классы градиентов для карточек снов, даже когда
// приложение впервые загружается на странице, где они не используются.
const PurgeSafelist = () => (
  <div className="hidden">
    {/* Container gradient borders */}
    <div className="p-px bg-gradient-to-br from-cyan-500/50 to-purple-500/50"></div>
    <div className="p-px bg-gradient-to-br from-cyan-400/50 to-blue-500/50"></div>
    <div className="p-px bg-gradient-to-br from-purple-500/50 to-pink-500/50"></div>
    <div className="p-px bg-gradient-to-br from-purple-600/40 to-indigo-600/40"></div>
    <div className="p-px bg-gradient-to-br from-red-700/50 to-gray-800/50"></div>
    <div className="p-px bg-gradient-to-br from-yellow-400/50 to-orange-500/50"></div>
    
    {/* Divider gradients */}
    <div className="bg-gradient-to-r from-cyan-500/50 to-purple-500/50"></div>
    <div className="bg-gradient-to-r from-cyan-400/50 to-blue-500/50"></div>
    <div className="bg-gradient-to-r from-purple-500/50 to-pink-500/50"></div>
    <div className="bg-gradient-to-r from-purple-600/40 to-indigo-600/40"></div>
    <div className="bg-gradient-to-r from-red-700/50 to-gray-800/50"></div>
    <div className="bg-gradient-to-r from-yellow-400/50 to-orange-500/50"></div>

    {/* Card classes */}
    <div className="border-transparent bg-[#1a182e] backdrop-blur-none"></div>
  </div>
);


const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#0c0a1a] text-gray-100 font-sans relative overflow-x-clip">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-transparent"></div>
      <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-purple-600/20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 -left-1/4 w-1/2 h-1/2 rounded-full bg-indigo-600/20 blur-3xl animate-pulse delay-1000"></div>
      
      {/* Container and padding classes removed to allow for full-width sticky headers */}
      {/* `overflow-hidden` removed to allow sticky positioning to work correctly */}
      <main className="relative z-10">
        {children}
      </main>
      <PurgeSafelist />
    </div>
  );
};

export default Layout;