export default function FAQPage() {
  return (
    <div className="min-h-screen pt-40 pb-32 px-6 lg:px-12 bg-white dark:bg-[#0a0a0a] transition-colors duration-1000">
      <div className="max-w-[800px] mx-auto w-full">
        <h1 className="text-3xl md:text-5xl font-serif font-light text-stone-900 dark:text-white uppercase tracking-wider mb-16">
          Frequently Asked Questions
        </h1>

        <div className="flex flex-col gap-12">
          <div>
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-stone-900 dark:text-white mb-4">When will my order ship?</h3>
            <p className="text-[14px] text-stone-500 font-light leading-relaxed">
              All orders are processed and shipped within 3-5 business days. Once your order has shipped, you will receive a confirmation email with tracking information.
            </p>
          </div>
          <div>
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-stone-900 dark:text-white mb-4">Do you ship internationally?</h3>
            <p className="text-[14px] text-stone-500 font-light leading-relaxed">
              Yes, we offer worldwide shipping. Delivery times and shipping costs will be calculated at checkout based on your location.
            </p>
          </div>
          <div>
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-stone-900 dark:text-white mb-4">What is your return policy?</h3>
            <p className="text-[14px] text-stone-500 font-light leading-relaxed">
              We accept returns for unworn, unwashed items in their original condition with tags attached within 14 days of delivery for store credit or refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
