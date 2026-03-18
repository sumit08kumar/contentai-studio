import { Link } from 'react-router-dom';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/solid';

const CallToAction = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-primary-900" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600 rounded-full opacity-10 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-600 rounded-full opacity-10 blur-[120px]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/10 text-white/80 px-4 py-1.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
          <SparklesIcon className="h-4 w-4 text-yellow-400" />
          <span>Free to get started — no credit card required</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Ready to transform how you
          <span className="block bg-gradient-to-r from-primary-400 via-secondary-400 to-purple-400 bg-clip-text text-transparent mt-1">
            create &amp; consume content?
          </span>
        </h2>

        <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
          Join thousands of creators using AI to chat with videos, generate blogs,
          and produce stunning content — faster than ever.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="group inline-flex items-center justify-center space-x-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-base hover:bg-gray-100 transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/15 hover:-translate-y-0.5"
          >
            <span>Start Creating for Free</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center space-x-2 text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
