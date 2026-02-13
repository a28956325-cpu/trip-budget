import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  backTo?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, backTo }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <header className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {backTo && (
                <button
                  onClick={() => navigate(backTo)}
                  className="text-primary-600 hover:text-primary-800 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl">✈️</span>
                <div>
                  <h1 className="text-xl font-bold text-primary-700">TravelSplit</h1>
                  <p className="text-xs text-gray-500">旅行分帳神器</p>
                </div>
              </Link>
            </div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
