import { Button } from '../ui/button';
import Link from 'next/link';

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-zinc-900 to-black">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Make Your Move?
        </h2>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of chess enthusiasts and start your journey today. Sign
          in with Google and get playing in seconds.
        </p>
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Link href="/auth/signin">Sign in with Google</Link>
        </Button>
      </div>
    </section>
  );
};

export default CTA;
