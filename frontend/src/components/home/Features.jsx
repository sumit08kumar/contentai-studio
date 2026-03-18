import {
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  BoltIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  PencilSquareIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'AI-Powered Q&A',
    description:
      'Ask any question about a YouTube video and get accurate, context-aware answers powered by GPT-4.',
    gradient: 'from-primary-500 to-primary-600',
    bg: 'bg-primary-50',
    text: 'text-primary-600',
  },
  {
    icon: PencilSquareIcon,
    title: 'AI Blog Generator',
    description:
      'Generate comprehensive, publication-ready blog posts with AI-powered research, citations, and illustrations.',
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    badge: 'New',
  },
  {
    icon: GlobeAltIcon,
    title: 'Web Research',
    description:
      'Automatic web research via Tavily brings the latest information, facts, and statistics into your content.',
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  {
    icon: BoltIcon,
    title: 'RAG Technology',
    description:
      'Retrieval-Augmented Generation ensures every answer is grounded in actual video content — not hallucinated.',
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  {
    icon: PhotoIcon,
    title: 'AI Image Generation',
    description:
      'Automatically generate relevant illustrations and diagrams for your blog posts using Stable Diffusion XL.',
    gradient: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    badge: 'New',
  },
  {
    icon: DocumentTextIcon,
    title: 'Source Citations',
    description:
      'Every answer includes verifiable citations from the video transcript or web sources.',
    gradient: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
  },
  {
    icon: ClockIcon,
    title: 'Chat History',
    description:
      'All conversations are saved and can be exported to Markdown for future reference or sharing.',
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure & Private',
    description:
      'Your data is encrypted with enterprise-grade security, JWT authentication, and full data isolation.',
    gradient: 'from-slate-500 to-slate-600',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-gray-50/50 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-white to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-600 mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Everything you need to create{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              &amp; explore
            </span>{' '}
            content
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            One platform. Video chat, blog generation, web research, and AI
            images — seamlessly connected.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300 hover:-translate-y-1"
            >
              {f.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {f.badge}
                </span>
              )}

              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-sm`}
              >
                <f.icon className="h-5 w-5 text-white" />
              </div>

              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
