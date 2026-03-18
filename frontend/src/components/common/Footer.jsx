import { Link } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const footerLinks = {
  Product: [
    { label: 'YouTube Q&A', to: '/signup' },
    { label: 'Blog Generator', to: '/signup' },
    { label: 'AI Images', to: '/signup' },
    { label: 'Dashboard', to: '/login' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Changelog', href: '#' },
    { label: 'Status', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <ChatBubbleLeftRightIcon className="h-7 w-7 text-primary-500" />
              <span className="text-lg font-bold text-white">{APP_NAME}</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              AI-powered platform to chat with YouTube videos, generate
              publication-ready blogs, and create stunning AI illustrations.
            </p>
            <div className="mt-6 flex space-x-4">
              {/* Social icons — simple circles */}
              {['X', 'GH', 'LI'].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-700 hover:text-white transition-colors text-xs font-bold"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-14 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built with ❤️ using React, FastAPI, LangChain &amp; OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
