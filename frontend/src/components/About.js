import React, { useState, useEffect } from 'react';

export default function About() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation on mount
        setIsVisible(true);
    }, []);

    const stats = [
        { label: 'Years of Excellence', value: '10+' },
        { label: 'Customers Worldwide', value: '5K+' },
        { label: 'Security Audits', value: '100%' },
        { label: 'Uptime Guarantee', value: '99.99%' },
    ];

    const pillars = [
        {
            icon: '🔒',
            title: 'Security First',
            description: 'Security integrated into every stage of development',
        },
        {
            icon: '⚙️',
            title: 'Continuous Integration',
            description: 'Automated testing and deployment pipelines',
        },
        {
            icon: '✅',
            title: 'Compliance',
            description: 'Meeting industry standards and regulations',
        },
        {
            icon: '📊',
            title: 'Monitoring',
            description: '24/7 real-time threat detection and response',
        },
    ];

    return (
        <main className="w-full bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <section
                className={`relative py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                aria-label="Hero section"
            >
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6">
                        About Contoso Traders
                    </h1>
                    <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto">
                        Secure Commerce, Built Right
                    </p>
                    <p className="text-lg text-slate-500 max-w-3xl mx-auto">
                        Transforming e-commerce through innovative DevSecOps practices and unwavering commitment
                        to security excellence.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section
                className={`py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white transition-all duration-1000 delay-200 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                aria-labelledby="mission-heading"
            >
                <div className="max-w-4xl mx-auto">
                    <h2 id="mission-heading" className="text-4xl font-bold mb-6">
                        Our Mission
                    </h2>
                    <p className="text-lg text-slate-200 leading-relaxed">
                        At Contoso Traders, we're committed to delivering secure, reliable e-commerce solutions
                        that empower businesses to grow with confidence. We prioritize customer trust through
                        transparent practices and cutting-edge security infrastructure. Every line of code, every
                        deployment, and every system decision is made with security, reliability, and customer
                        success at the forefront.
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section
                className={`py-16 px-4 sm:px-6 lg:px-8 transition-all duration-1000 delay-300 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                aria-labelledby="stats-heading"
            >
                <div className="max-w-6xl mx-auto">
                    <h2 id="stats-heading" className="text-3xl font-bold text-slate-900 mb-12 text-center">
                        By The Numbers
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="text-center p-6 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                                <p className="text-slate-700 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DevSecOps Pillars Section */}
            <section
                className={`py-16 px-4 sm:px-6 lg:px-8 transition-all duration-1000 delay-400 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                aria-labelledby="pillars-heading"
            >
                <div className="max-w-6xl mx-auto">
                    <h2 id="pillars-heading" className="text-3xl font-bold text-slate-900 mb-12 text-center">
                        DevSecOps Excellence
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {pillars.map((pillar, index) => (
                            <div
                                key={index}
                                className="p-8 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 bg-white"
                            >
                                <div
                                    className="text-5xl mb-4"
                                    role="img"
                                    aria-label={pillar.title}
                                >
                                    {pillar.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{pillar.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{pillar.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call-to-Action Section */}
            <section
                className={`py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white transition-all duration-1000 delay-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                aria-labelledby="cta-heading"
            >
                <div className="max-w-4xl mx-auto text-center">
                    <h2 id="cta-heading" className="text-4xl font-bold mb-6">
                        Ready to Transform Your Commerce?
                    </h2>
                    <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of businesses that trust Contoso Traders for secure, scalable e-commerce
                        solutions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:support@contoso-traders.com"
                            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                            aria-label="Contact support email"
                        >
                            Get in Touch
                        </a>
                        <a
                            href="#"
                            className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section
                className={`py-16 px-4 sm:px-6 lg:px-8 transition-all duration-1000 delay-600 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                aria-labelledby="contact-heading"
            >
                <div className="max-w-4xl mx-auto text-center">
                    <h2 id="contact-heading" className="text-3xl font-bold text-slate-900 mb-6">
                        Questions or Feedback?
                    </h2>
                    <p className="text-lg text-slate-600 mb-8">
                        We'd love to hear from you. Reach out to our team anytime.
                    </p>
                    <a
                        href="mailto:support@contoso-traders.com"
                        className="inline-block text-xl font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded px-3 py-1"
                    >
                        support@contoso-traders.com
                    </a>
                </div>
            </section>
        </main>
    );
}