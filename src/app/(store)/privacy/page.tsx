export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-40 pb-32 px-6 lg:px-12 bg-white dark:bg-[#0a0a0a] transition-colors duration-1000">
      <div className="max-w-[800px] mx-auto w-full">
        <h1 className="text-3xl md:text-5xl font-serif font-light text-stone-900 dark:text-white uppercase tracking-wider mb-16">
          Privacy Policy
        </h1>

        <div className="flex flex-col gap-12 text-[14px] text-stone-500 font-light leading-relaxed">
          <p>
            At Flenjure, we take your privacy very seriously. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website.
          </p>
          
          <div>
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-stone-900 dark:text-white mb-4">Information Collection</h3>
            <p>
              We collect information that you provide to us directly, such as when you create an account, place an order, or subscribe to our newsletter. This may include your name, email address, shipping address, and payment details.
            </p>
          </div>
          
          <div>
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-stone-900 dark:text-white mb-4">Use of Information</h3>
            <p>
              The information we collect is used to process your orders, communicate with you about your purchases, and improve our services. We may also use your email to send you promotional content, which you can opt out of at any time.
            </p>
          </div>
          
          <div>
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-stone-900 dark:text-white mb-4">Data Protection</h3>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. Your payment details are securely processed through our payment gateway partners and are not stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
