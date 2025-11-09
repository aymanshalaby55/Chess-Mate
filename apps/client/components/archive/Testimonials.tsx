const Testimonials = () => {
  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          What Players Say
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <p className="italic text-gray-300 mb-4">
              &ldquo;Chess Masters helped me improve my rating by 300 points in
              just three months. The analysis tools are incredible!&rdquo;
            </p>
            <p className="font-semibold text-green-400">- Alex K.</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <p className="italic text-gray-300 mb-4">
              &ldquo;The best chess platform I&apos;ve used. Clean interface,
              great community, and the lessons are top-notch.&rdquo;
            </p>
            <p className="font-semibold text-green-400">- Maria S.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
