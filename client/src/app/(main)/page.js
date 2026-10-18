"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import {
  Cpu,
  Palette,
  Users,
  HeartPulse,
  GraduationCap,
  Leaf,
  ArrowRight,
  Quote,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import api from "@/lib/api";
import CampaignCard from "@/components/CampaignCard";
import Loader from "@/components/Loader";
import {
  heroSlides,
  testimonials,
  categories,
  howItWorks,
  impactStats,
} from "@/data/static";

const categoryIcons = { Cpu, Palette, Users, HeartPulse, GraduationCap, Leaf };

export default function HomePage() {
  const [topCampaigns, setTopCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/campaigns/top-funded")
      .then(({ data }) => setTopCampaigns(data.campaigns))
      .catch(() => setTopCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="h-[520px] w-full"
        >
          {heroSlides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div
                className="relative flex h-[520px] items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 to-slate-900/40" />
                <div className="relative mx-auto max-w-3xl px-6 text-center text-white">
                  <span className="badge mb-4 bg-teal-500/20 text-teal-200">{slide.heading}</span>
                  <h1 className="animate-fade-up text-4xl font-extrabold leading-tight md:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mt-4 animate-fade-up text-base text-slate-200 md:text-lg">
                    {slide.text}
                  </p>
                  <div className="mt-8 flex justify-center gap-3">
                    <Link href="/explore" className="btn-primary px-6 py-3">
                      Explore Campaigns
                    </Link>
                    <Link href="/register" className="btn-outline border-white/40 bg-white/10 px-6 py-3 text-white hover:bg-white/20">
                      Start a Campaign
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Top funded */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Top Funded Campaigns</h2>
            <p className="mt-1 text-slate-500">The projects our community is backing the most.</p>
          </div>
          <Link href="/explore" className="hidden items-center gap-1 text-sm font-semibold text-teal-700 md:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <Loader label="Loading campaigns..." />
        ) : topCampaigns.length === 0 ? (
          <p className="text-sm text-slate-500">No campaigns to show yet. Be the first to launch one!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topCampaigns.map((c) => (
              <CampaignCard key={c._id} campaign={c} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-bold md:text-3xl">How It Works</h2>
          <p className="mt-1 text-center text-slate-500">
            From idea to funded project in three simple steps.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="card relative p-6 animate-fade-up">
                <span className="text-4xl font-black text-teal-100">{item.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore by category */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold md:text-3xl">Explore by Category</h2>
        <p className="mt-1 text-center text-slate-500">Find the causes closest to your heart.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.icon] || Rocket;
            return (
              <Link
                key={cat.name}
                href={`/explore?category=${cat.name}`}
                className="card flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-xs text-slate-500">{cat.blurb}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-teal-700 py-16 text-white">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold md:text-3xl">Loved by creators & backers</h2>
          <p className="mt-1 text-center text-teal-100">Real stories from the SeedInvest community.</p>
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{ 768: { slidesPerView: 2 } }}
            className="mt-10 !pb-12"
          >
            {testimonials.map((t, i) => (
              <SwiperSlide key={i}>
                <div className="card h-full bg-white/95 p-6 text-slate-800">
                  <Quote className="h-7 w-7 text-teal-500" />
                  <p className="mt-3 text-sm italic text-slate-600">“{t.quote}”</p>
                  <div className="mt-4 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.photo} alt={t.name} className="h-11 w-11 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Platform impact */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="card grid gap-8 bg-gradient-to-br from-slate-900 to-teal-900 p-10 text-white md:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Platform Impact in Numbers</h2>
            <p className="mt-3 text-slate-300">
              SeedInvest is more than a platform — it’s a global community turning small credits into
              big change. Secure, transparent, and built for creators.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <ShieldCheck className="h-4 w-4 text-teal-300" /> Admin-verified campaigns
              </span>
              <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <Rocket className="h-4 w-4 text-teal-300" /> Fast withdrawals
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {impactStats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-teal-300">{s.value}</p>
                <p className="text-sm text-slate-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
