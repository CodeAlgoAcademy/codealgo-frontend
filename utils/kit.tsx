import React from "react";

const ParentResourcesForm = () => {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg md:grid-cols-2">
          
          {/* Left side */}
          <div className="bg-background p-6 md:p-8">
            <span className="mb-3 inline-block rounded-full bg-mainColor/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-mainColor">
              Parent Resources
            </span>

            <h2 className="mb-3 text-3xl font-bold leading-tight text-gray-900">
              Help Your Child Build Skills for the Future
            </h2>

            <p className="mb-5 leading-relaxed text-gray-600">
              Get practical coding activities, AI tips, learning resources,
              and simple ideas to help your child become more confident with
              technology.
            </p>

            {/* Fixed image height */}
<div className="h-64 w-full overflow-hidden rounded-2xl">
  <img
    src="https://embed.filekitcdn.com/e/hXH9VND4ctGmzYvAZJZkxm/fHCtak1ifDRFF6WgMRkoBo"
    alt="Students learning coding in class"
    className="h-full w-full object-cover object-center"
  />
</div>
          </div>

          {/* Right side */}
          <div className="flex items-center p-6 md:p-8">
            <div className="w-full">
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
                Get free parent resources
              </h3>

              <p className="mb-6 text-gray-600">
                Join our parent community and receive practical resources
                directly in your inbox.
              </p>

              <form
                action="https://app.kit.com/forms/10003442/subscriptions"
                method="post"
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="parent-email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>

                  <input
                    id="parent-email"
                    name="email_address"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-mainColor focus:ring-2 focus:ring-mainColor/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-mainRed px-6 py-3 font-bold text-white transition hover:opacity-90"
                >
                  Get Free Parent Resources
                </button>

                <p className="text-center text-xs text-gray-500">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ParentResourcesForm;