import { Link } from 'react-router-dom';
import {
  PlayCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left gradient orb */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary-100 via-primary-50 to-transparent opacity-60 blur-3xl" />
        {/* Bottom-right gradient orb */}
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-secondary-100 via-purple-50 to-transparent opacity-60 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 hero-fade-in">
              <SparklesIcon className="h-4 w-4" />
              <span>Powered by GPT-4 &amp; RAG Technology</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] hero-fade-in" style={{ animationDelay: '0.1s' }}>
              Your AI Content
              <span className="block bg-gradient-to-r from-primary-600 via-secondary-500 to-purple-600 bg-clip-text text-transparent mt-1">
                Studio
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed hero-fade-in" style={{ animationDelay: '0.2s' }}>
              Chat with any YouTube video, generate publication-ready blogs with
              AI-powered research, and create stunning illustrations — all from
              one platform.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 hero-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center space-x-2 bg-gray-900 text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/25 hover:-translate-y-0.5"
              >
                <span>Get Started Free</span>
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center space-x-2 bg-white text-gray-700 border border-gray-200 px-7 py-3.5 rounded-xl font-semibold text-base hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <PlayCircleIcon className="h-5 w-5 text-primary-600" />
                <span>Watch Demo</span>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center space-x-4 hero-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex -space-x-2">
                {['bg-primary-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'].map(
                  (bg, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${bg} ring-2 ring-white flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  )
                )}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">1,000+</span>{' '}
                creators already on board
              </div>
            </div>
          </div>

          {/* Right — Feature Preview Cards */}
          <div className="relative hidden lg:block hero-fade-in" style={{ animationDelay: '0.35s' }}>
            {/* Main card */}
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 p-6 space-y-5">
              {/* Header mock */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">YouTube RAG Chat</p>
                  <p className="text-xs text-gray-400">Ask anything about a video</p>
                </div>
              </div>

              {/* Chat messages mock */}
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-primary-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-md max-w-[75%]">
                    What are the main points of this video?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-700 text-sm px-4 py-2.5 rounded-2xl rounded-tl-md max-w-[85%] leading-relaxed">
                    The video covers 3 key topics:
                    <span className="font-medium"> AI agents</span>,
                    <span className="font-medium"> RAG pipelines</span>, and
                    <span className="font-medium"> vector databases</span>…
                  </div>
                </div>
              </div>

              {/* Input mock */}
              <div className="flex items-center space-x-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <span className="text-sm text-gray-400 flex-1">Ask a follow-up question…</span>
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <ArrowRightIcon className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Floating card — Blog Generator */}
            <div className="absolute -left-8 bottom-12 z-20 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 w-52 float-card">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <DocumentTextIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Blog AI</span>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 rounded bg-purple-200 w-full" />
                <div className="h-2 rounded bg-purple-100 w-4/5" />
                <div className="h-2 rounded bg-purple-100 w-3/5" />
              </div>
              <div className="mt-3 text-[11px] font-medium text-purple-600">2,400 words generated ✓</div>
            </div>

            {/* Floating card — Research */}
            <div className="absolute -right-4 top-8 z-20 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 w-48 float-card" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <GlobeAltIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Research</span>
              </div>
              <div className="text-xs text-gray-500">
                <span className="text-emerald-600 font-semibold">24</span> sources found
              </div>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-5 flex-1 rounded bg-emerald-100" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trusted by / Logos strip */}
        <div className="mt-24 hero-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            Built with industry-leading technologies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-40 grayscale">
            {['OpenAI', 'LangChain', 'Pinecone', 'MongoDB', 'React', 'Tavily'].map((name) => (
              <span key={name} className="text-lg font-bold text-gray-900 tracking-tight">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
