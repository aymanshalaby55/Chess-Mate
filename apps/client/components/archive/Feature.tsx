import { FeatureCardProps } from '@/types';
import { Crown, Shield, Zap } from 'lucide-react';

const FeatureCard = function ({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800 hover:border-green-800 transition-colors group">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-green-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

const Feature = () => {
  return (
    <section className="py-16 bg-zinc-900">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Choose <span className="text-green-400">ChessMate</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="h-10 w-10 text-green-400" />}
            title="Real-time Matches"
            description="Play against opponents of your skill level with our advanced matchmaking system."
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-green-400" />}
            title="Learn Strategies"
            description="Access tutorials and puzzles designed to improve your tactical awareness."
          />
          <FeatureCard
            icon={<Crown className="h-10 w-10 text-green-400" />}
            title="Compete in Tournaments"
            description="Join daily and weekly tournaments to test your skills and win prizes."
          />
        </div>
      </div>
    </section>
  );
};

export default Feature;
