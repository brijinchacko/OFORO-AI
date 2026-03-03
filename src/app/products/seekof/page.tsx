import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Globe,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  Star,
  TrendingUp,
  Layers,
  Zap,
  Filter,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SEEKOF — AI Discovery & Search Agent",
  description: "SEEKOF is a specialized AI agent for discovering, comparing, and analyzing AI tools. Search 50,000+ AI platforms and companies.",
  keywords: ["SEEKOF AI", "AI search agent", "AI discovery platform"],
};

export default function SeekofPage() {
  const features = [
    {
      icon: <Search className="w-5 h-5" />,
      title: "Intelligent AI Search",
      description:
        "Natural language search across 50,000+ AI tools and companies. Find exactly what you need with semantic understanding, not just keywords.",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Smart Comparisons",
      description:
        "Side-by-side comparison of AI tools with real benchmarks, pricing analysis, feature matrices, and community reviews.",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Trend Intelligence",
      description:
        "Track emerging AI tools, funding rounds, product launches, and industry shifts with real-time market intelligence.",
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: "API Marketplace",
      description:
        "Discover and connect to AI APIs through our unified marketplace. One integration point for thousands of AI services.",
    },
    {
      icon: <Filter className="w-5 h-5" />,
      title: "Advanced Filtering",
      description:
        "Filter by pricing model, deployment type, industry, use case, company size, ratings, and 30+ other parameters.",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Curated Collections",
      description:
        "Expert-curated collections for specific use cases: 'Best AI for Healthcare', 'Top Code Assistants', 'Enterprise LLMs', and more.",
    },
  ];

  const categories = [
    { name: "Language Models", count: "2,400+" },
    { name: "Image Generation", count: "1,800+" },
    { name: "Code Assistants", count: "950+" },
    { name: "Voice & Audio", count: "720+" },
    { name: "Video AI", count: "580+" },
    { name: "Data Analytics", count: "3,200+" },
    { name: "Healthcare AI", count: "890+" },
    { name: "Robotics", count: "430+" },
  ];

  return (
    <div className="pt-24">
      {/* CTA Banner */}
      <div className="sticky top-16 z-40 w-full py-3 px-4 text-center text-sm font-medium"
        style={{ background: "linear-gradient(135deg, var(--accent), #8b5cf6)", color: "#fff" }}>
        Experience the full SEEKOF platform →{" "}
        <a href="https://seekof.cloud/" target="_blank" rel="noopener noreferrer" className="underline font-bold">
          Visit seekof.cloud
        </a>
      </div>

      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-sm text-purple-400 mb-6">
            <Globe className="w-3.5 h-3.5" />
            AI Discovery Platform
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Discover </span>
            <span className="gradient-text">every AI tool</span>
            <br />
            <span className="text-white">in the world</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            SEEKOF AI indexes, analyses, and ranks 50,000+ AI tools globally.
            Find, compare, and access the perfect AI solution for any use case.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://seekof.cloud/"
              className="group flex items-center gap-2 px-8 py-3.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 transition-all"
            >
              Visit seekof.cloud
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 px-8 py-3.5 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Try in chat
            </Link>
          </div>
        </div>
      </section>

      {/* Search demo */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-surface-100 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 bg-surface-200 rounded-xl px-4 py-3 mb-6">
              <Search className="w-5 h-5 text-gray-500" />
              <span className="text-gray-400 text-sm">
                "Find the best AI tools for real-time video generation under $50/month"
              </span>
            </div>
            <div className="space-y-3">
              {[
                { name: "RunwayML Gen-3", rating: 4.8, price: "$28/mo", badge: "Top Pick" },
                { name: "Pika Labs", rating: 4.6, price: "$8/mo", badge: "Best Value" },
                { name: "Luma Dream Machine", rating: 4.5, price: "$23.99/mo", badge: "" },
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center justify-between p-3 bg-surface-200/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tool.name}</span>
                        {tool.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-500/10 text-purple-400">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {tool.rating}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{tool.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Browse by category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="p-4 bg-surface-100/50 border border-white/5 rounded-xl hover:border-purple-500/20 transition-all cursor-pointer"
              >
                <p className="text-sm font-medium mb-1">{cat.name}</p>
                <p className="text-xs text-gray-500">{cat.count} tools</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            The <span className="gradient-text">smartest way</span> to find AI tools
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 bg-surface-100/50 border border-white/5 rounded-xl hover:border-white/10 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Explore the world of AI with{" "}
            <span className="gradient-text">SEEKOF</span>
          </h2>
          <p className="text-gray-400 mb-8">
            50,000+ AI tools. One intelligent search engine. Free to explore.
          </p>
          <Link
            href="https://seekof.cloud/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-all"
          >
            Start exploring at seekof.cloud
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
