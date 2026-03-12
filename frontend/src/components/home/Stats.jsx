import {
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const stats = [
  {
    icon: VideoCameraIcon,
    value: '10,000+',
    label: 'Videos Processed',
    color: 'text-primary-600',
    bg: 'bg-primary-50',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    value: '50,000+',
    label: 'Questions Answered',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: DocumentTextIcon,
    value: '5,000+',
    label: 'Blogs Generated',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: UsersIcon,
    value: '1,000+',
    label: 'Active Users',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

const Stats = () => {
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center group">
              <div
                className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <s.icon className={`h-7 w-7 ${s.color}`} />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-gray-500 font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
