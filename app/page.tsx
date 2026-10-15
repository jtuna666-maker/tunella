"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone,
  PhoneCall,
  PhoneForwarded,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Calendar,
  MessageSquare,
  HelpCircle,
  FileText,
  Clock,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Wrench,
  Flame,
  Zap,
  Home,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Check,
  UserCheck
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface TranscriptTurn {
  id: number;
  speaker: "tunella" | "caller";
  speakerLabel: string;
  startSec: number;
  endSec: number;
  text: string;
  extractedField?: {
    label: string;
    value: string;
  };
}

const CALL_DURATION = 46;

const SAMPLE_TRANSCRIPT: TranscriptTurn[] = [
  {
    id: 1,
    speaker: "tunella",
    speakerLabel: "Tunella (AI Receptionist)",
    startSec: 0,
    endSec: 7,
    text: "Thanks for calling Miller & Sons Plumbing. This is Tunella, the AI receptionist for the shop. How can I help you out today?"
  },
  {
    id: 2,
    speaker: "caller",
    speakerLabel: "Homeowner (Dave R.)",
    startSec: 7,
    endSec: 15,
    text: "Hey, yeah, my water heater shutoff valve is dripping pretty steadily in the garage. Are you guys able to come out to Oak Creek?",
    extractedField: {
      label: "Issue & Location",
      value: "Leaking water heater shutoff valve • Oak Creek"
    }
  },
  {
    id: 3,
    speaker: "tunella",
    speakerLabel: "Tunella (AI Receptionist)",
    startSec: 15,
    endSec: 23,
    text: "We sure do — Oak Creek is right in our regular service area. Is the leak contained right now, or is water flooding the floor?"
  },
  {
    id: 4,
    speaker: "caller",
    speakerLabel: "Homeowner (Dave R.)",
    startSec: 23,
    endSec: 30,
    text: "I've got a bucket under it for tonight, so it's not an emergency flood, but I definitely need someone out tomorrow morning if possible.",
    extractedField: {
      label: "Urgency",
      value: "Contained leak (Non-emergency • Next-day morning)"
    }
  },
  {
    id: 5,
    speaker: "tunella",
    speakerLabel: "Tunella (AI Receptionist)",
    startSec: 30,
    endSec: 38,
    text: "Got it. We have an opening tomorrow between 8:00 AM and 10:00 AM. Can I grab your name and street address to lock that in?"
  },
  {
    id: 6,
    speaker: "caller",
    speakerLabel: "Homeowner (Dave R.)",
    startSec: 38,
    endSec: 42,
    text: "Yeah, it's Dave Reynolds at 418 Maple Ridge Drive.",
    extractedField: {
      label: "Customer & Address",
      value: "Dave Reynolds • 418 Maple Ridge Dr"
    }
  },
  {
    id: 7,
    speaker: "tunella",
    speakerLabel: "Tunella (AI Receptionist)",
    startSec: 42,
    endSec: 46,
    text: "You're all set for tomorrow, 8:00 to 10:00 AM, Dave. I've sent your booking details straight to the crew. See you in the morning!",
    extractedField: {
      label: "Status",
      value: "Booked: Tomorrow 8:00–10:00 AM • Summary sent to owner"
    }
  }
];

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Will Tunella work with my existing business phone number?",
    answer:
      "Yes — Tunella works with your existing business number through call forwarding, so customers keep calling the number they already know. There's nothing to install at your shop; we configure it together during onboarding."
  },
  {
    question: "Can it answer calls after hours?",
    answer:
      "Yes. Tunella answers around the clock — evenings, weekends, and holidays — so after-hours callers reach your business instead of voicemail."
  },
  {
    question: "Can it schedule appointments?",
    answer:
      "Tunella can take appointment requests and handle bookings according to your configuration. The exact scheduling behavior is set up during onboarding to match how you run your calendar."
  },
  {
    question: "What happens if a customer needs to speak with a real person?",
    answer:
      "Tunella can transfer calls to you or a team member when a caller needs a human — for example, urgent or sensitive situations you define during setup."
  },
  {
    question: "Can I customize what the AI says?",
    answer:
      "Yes. Your greeting, business details, and how common questions are answered are all configured for your business during onboarding."
  },
  {
    question: "What happens if I exceed 500 minutes?",
    answer:
      "Additional AI minutes are billed at $0.20 per minute. You'll see your usage so there are no surprises."
  },
  {
    question: "How long does setup take?",
    answer:
      "Most businesses are up and running within 2-3 business days after completing onboarding — we configure your greeting, business knowledge, and call routing, then test it with you."
  },
  {
    question: "Is there a contract or cancellation policy?",
    answer:
      "Tunella is month-to-month — no long-term contract. Cancel anytime with 30 days' notice. The $99 setup fee is non-refundable, and unused AI minutes don't roll over."
  },
  {
    question: "Will customers know they're speaking with AI?",
    answer:
      "Tunella answers with a professional greeting for your business and identifies itself as an AI receptionist where required by law. The focus is always on helping the caller — most callers just notice that someone picked up."
  }
];

const TRADE_OPTIONS = [
  "Plumbing",
  "HVAC",
  "Electrical",
  "Roofing",
  "Landscaping",
  "General Contracting",
  "Other"
] as const;

interface DemoFormValues {
  name: string;
  businessName: string;
  phone: string;
  email: string;
  trade: string;
  message: string;
}

interface DemoFormErrors {
  name?: string;
  businessName?: string;
  phone?: string;
  email?: string;
  trade?: string;
}

// ---------------------------------------------------------------------------
// Brand Logo Component (Peak / Mountain Mark + Wordmark)
// ---------------------------------------------------------------------------

function TunellaLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <span
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#F97316]/15 border border-[#F97316]/40 shadow-sm"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.5 24.5L12.2 8.5L17.8 18.2L21.6 12.4L28.5 24.5H3.5Z"
            stroke="#F97316"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.6 13.3L12.2 8.5L15.1 13.7"
            stroke="#F8FAFC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-xl font-extrabold tracking-tight text-white">
        Tunella
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Application Component
// ---------------------------------------------------------------------------

export default function App() {
  // Navigation & Modal State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedTradePreset, setSelectedTradePreset] = useState<string>("");

  // Interactive Sample Call Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastToneBucketRef = useRef<number>(-1);

  // FAQ Accordion State (first item open by default)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Pricing Calculator State (strictly using $299/mo, 500 mins, $0.20/min overage)
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(420);

  // Demo Form State
  const [formValues, setFormValues] = useState<DemoFormValues>({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    trade: "",
    message: ""
  });
  const [formErrors, setFormErrors] = useState<DemoFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const modalFirstInputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const pageContentRef = useRef<HTMLDivElement | null>(null);

  // Smooth section scrolling helper
  const scrollToSection = useCallback((sectionId: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Open Demo Modal helper
  const openDemoModal = useCallback((presetTrade?: string) => {
    setMobileMenuOpen(false);
    if (presetTrade) {
      setSelectedTradePreset(presetTrade);
      setFormValues((prev) => ({
        ...prev,
        trade: prev.trade || presetTrade
      }));
    }
    setDemoModalOpen(true);
  }, []);

  // Close Demo Modal helper
  const closeDemoModal = useCallback(() => {
    setDemoModalOpen(false);
  }, []);

  // Keep keyboard focus inside the modal, lock background scrolling, and restore focus.
  useEffect(() => {
    if (!demoModalOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const background = pageContentRef.current;
    if (background) background.inert = true;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDemoModal();
      if (e.key !== "Tab") return;
      const controls = Array.from(modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]'
      ) ?? []).filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) { e.preventDefault(); return; }
      if (e.shiftKey && (document.activeElement === first || !modalRef.current?.contains(document.activeElement))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !modalRef.current?.contains(document.activeElement))) {
        e.preventDefault(); first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const timer = window.setTimeout(() => modalFirstInputRef.current?.focus(), 0);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      if (background) background.inert = false;
      previousFocus?.focus();
    };
  }, [demoModalOpen, closeDemoModal]);

  useEffect(() => {
    if (demoModalOpen && isSubmitted) modalRef.current?.querySelector<HTMLElement>("button")?.focus();
  }, [demoModalOpen, isSubmitted]);

  useEffect(() => () => { void audioCtxRef.current?.close(); }, []);

  // Subtle Web Audio API speech cadence synthesizer for simulated call
  const triggerCadenceGrain = useCallback(
    (speaker: "tunella" | "caller", bucket: number) => {
      if (!soundEnabled || typeof window === "undefined") return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioCtx) return;

        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        // Create a gentle, warm telephone-filtered vocal murmur grain so the play button gives tactile audio feedback
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        const baseFreq = speaker === "tunella" ? 195 : 132;
        const pitchOffsets = [0, 14, -8, 22, 6, -12, 18, 4];
        const offset = pitchOffsets[bucket % pitchOffsets.length];

        osc.type = "triangle";
        osc.frequency.setValueAtTime(baseFreq + offset, now);
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(85, baseFreq + offset - 10),
          now + 0.11
        );

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(speaker === "tunella" ? 780 : 540, now);
        filter.Q.setValueAtTime(2.5, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.018, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
      } catch {
        // Ignore Web Audio errors if blocked by browser autoplay policy
      }
    },
    [soundEnabled]
  );

  // Audio player timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 100;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (intervalMs / 1000) * playbackSpeed;
        if (next >= CALL_DURATION) {
          setIsPlaying(false);
          lastToneBucketRef.current = -1;
          return CALL_DURATION;
        }

        const bucket = Math.floor(next * 3.2);
        if (bucket !== lastToneBucketRef.current) {
          lastToneBucketRef.current = bucket;
          const activeTurn = SAMPLE_TRANSCRIPT.find(
            (t) => next >= t.startSec && next < t.endSec
          );
          if (activeTurn && bucket % 2 === 0) {
            triggerCadenceGrain(activeTurn.speaker, bucket);
          }
        }
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, playbackSpeed, triggerCadenceGrain]);

  const togglePlay = () => {
    if (currentTime >= CALL_DURATION) {
      setCurrentTime(0);
      lastToneBucketRef.current = -1;
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const restartCall = () => {
    setCurrentTime(0);
    lastToneBucketRef.current = -1;
    setIsPlaying(true);
  };

  const formatSeconds = (sec: number) => {
    const clamped = Math.max(0, Math.min(CALL_DURATION, Math.floor(sec)));
    const mins = Math.floor(clamped / 60);
    const rem = clamped % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  const activeTurn =
    SAMPLE_TRANSCRIPT.find(
      (turn) => currentTime >= turn.startSec && currentTime < turn.endSec
    ) ||
    (currentTime >= CALL_DURATION
      ? SAMPLE_TRANSCRIPT[SAMPLE_TRANSCRIPT.length - 1]
      : SAMPLE_TRANSCRIPT[0]);

  const capturedFields = SAMPLE_TRANSCRIPT.filter(
    (turn) => turn.extractedField && currentTime >= turn.startSec + 1.5
  );

  // Pricing Calculator Math
  const overageMinutes = Math.max(0, estimatedMinutes - 500);
  const overageCost = overageMinutes * 0.2;
  const totalMonthlyEstimate = 299 + overageCost;

  // Form Validation
  const validateForm = (values: DemoFormValues): DemoFormErrors => {
    const errors: DemoFormErrors = {};
    if (!values.name.trim()) {
      errors.name = "Please enter your name.";
    }
    if (!values.businessName.trim()) {
      errors.businessName = "Please enter your business name.";
    }
    const digitsOnly = values.phone.replace(/\D/g, "");
    if (!values.phone.trim()) {
      errors.phone = "Please enter a phone number where we can reach you.";
    } else if (digitsOnly.length < 10) {
      errors.phone = "Please enter a valid 10-digit phone number.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!emailRegex.test(values.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!values.trade) {
      errors.trade = "Please select your primary trade.";
    }
    return errors;
  };

  const handleInputChange = (
    field: keyof DemoFormValues,
    value: string
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof DemoFormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    // TODO - Replace simulated timeout with POST request to production demo request endpoint
    // Example payload wiring for production deployment:
    // await fetch("/api/demo-requests", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(formValues),
    // });

    window.setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 450);
  };

  const resetDemoForm = () => {
    setFormValues({
      name: "",
      businessName: "",
      phone: "",
      email: "",
      trade: selectedTradePreset || "",
      message: ""
    });
    setFormErrors({});
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1424] text-slate-100 font-sans antialiased selection:bg-[#F97316] selection:text-white">
      <div ref={pageContentRef}>
      <a href="#top" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-[#0B1424] focus:p-4">Skip to content</a>
      {/* =====================================================================
          1. STICKY NAVIGATION
      ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#0B1424]/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-lg"
            aria-label="Tunella Home"
          >
            <TunellaLogo />
          </a>

          {/* Desktop Nav Links */}
          <nav
            className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300"
            aria-label="Primary Navigation"
          >
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("how-it-works");
              }}
              className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded px-1 py-0.5"
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("features");
              }}
              className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded px-1 py-0.5"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("pricing");
              }}
              className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded px-1 py-0.5"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("faq");
              }}
              className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded px-1 py-0.5"
            >
              FAQ
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSection("pricing")}
              className="px-4 py-2.5 text-sm font-semibold text-slate-200 hover:text-white transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
            >
              See Pricing
            </button>
            <button
              type="button"
              onClick={() => openDemoModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-sm shadow-lg shadow-[#F97316]/25 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1424] focus-visible:ring-[#F97316]"
            >
              Request a Demo
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => openDemoModal()}
              className="px-3.5 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs shadow-md shadow-[#F97316]/20 transition-all"
            >
              Request a Demo
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <nav
            className="md:hidden bg-[#0F1B30] border-b border-slate-800 px-4 pt-3 pb-5 space-y-2"
            aria-label="Mobile Navigation"
          >
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("how-it-works");
              }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/60 hover:text-white"
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("features");
              }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/60 hover:text-white"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("pricing");
              }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/60 hover:text-white"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("faq");
              }}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/60 hover:text-white"
            >
              FAQ
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => openDemoModal()}
                className="w-full py-3 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-center shadow-lg shadow-[#F97316]/25"
              >
                Request a Demo
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("pricing")}
                className="w-full py-2.5 rounded-lg border border-slate-700 text-slate-200 font-semibold text-sm hover:bg-slate-800/60"
              >
                See Pricing
              </button>
            </div>
          </nav>
        )}
      </header>

      <main id="top">
        {/* ===================================================================
            2. HERO SECTION
        =================================================================== */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
          {/* Subtle radial glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[420px] bg-[#F97316]/10 blur-[130px] rounded-full"
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left Column: Copy & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs sm:text-sm text-slate-300">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
                  <span className="font-semibold text-white">
                    AI Phone Receptionist for Contractors
                  </span>
                  <span className="text-slate-400">
                    • Plumbers, HVAC, Electricians &amp; Roofers
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                  Your business is{" "}
                  <span className="text-[#F97316]">always answering.</span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
                  While you&apos;re under a sink or on a roof, Tunella picks up
                  every call, books the job, and keeps you working.
                </p>

                {/* Primary & Secondary CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => openDemoModal()}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-base shadow-xl shadow-[#F97316]/25 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1424] focus-visible:ring-[#F97316]"
                  >
                    Request a Demo
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      scrollToSection("demo");
                      if (!isPlaying) {
                        setIsPlaying(true);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-base border border-slate-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
                  >
                    <Play
                      className="w-4 h-4 text-[#F97316] fill-[#F97316]"
                      aria-hidden="true"
                    />
                    Hear a sample call
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("pricing")}
                    className="inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white underline underline-offset-4 transition-colors"
                  >
                    See Pricing
                  </button>
                </div>

                {/* Quick Contractor Facts */}
                <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2
                      className="w-4 h-4 text-[#F97316]"
                      aria-hidden="true"
                    />
                    Works with your existing phone number
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2
                      className="w-4 h-4 text-[#F97316]"
                      aria-hidden="true"
                    />
                    Nothing to install
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2
                      className="w-4 h-4 text-[#F97316]"
                      aria-hidden="true"
                    />
                    Built for 1–10 person crews
                  </span>
                </div>
              </div>

              {/* Right Column: Phone / Audio Visual Motif */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md rounded-3xl bg-gradient-to-b from-[#13223B] to-[#0E192D] border border-slate-700/80 p-5 sm:p-6 shadow-2xl">
                  {/* Top Phone Status Bar */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#F97316]/20 text-[#F97316]">
                        <PhoneCall className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#F97316]">
                          Live Call Answered • Ring 1
                        </p>
                        <p className="text-sm font-bold text-white">
                          Forwarded from Your Shop Line
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      24/7 Active
                    </span>
                  </div>

                  {/* Audio Waveform Visual Box */}
                  <div className="rounded-2xl bg-[#0B1424] border border-slate-800 p-4 mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                      <span>Tunella AI Receptionist</span>
                      <span className="font-mono text-slate-300">
                        {isPlaying
                          ? `Playing ${formatSeconds(currentTime)}`
                          : "Sample Call Ready"}
                      </span>
                    </div>

                    {/* SVG Waveform Bars */}
                    <div
                      className="flex items-center justify-between gap-1 h-14 px-2"
                      aria-hidden="true"
                    >
                      {[
                        28, 52, 75, 42, 88, 64, 95, 58, 36, 70, 92, 60, 46, 82,
                        68, 40, 74, 86, 54, 34, 62, 48, 30, 44
                      ].map((heightPct, idx) => (
                        <span
                          key={idx}
                          style={{
                            height: `${heightPct}%`
                          }}
                          className={`w-1.5 rounded-full transition-all duration-300 ${
                            idx % 3 === 0
                              ? "bg-[#F97316]"
                              : idx % 2 === 0
                              ? "bg-[#F97316]/75"
                              : "bg-slate-600"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="mt-3 text-sm text-slate-200 leading-snug italic">
                      &ldquo;We have an opening tomorrow between 8:00 AM and
                      10:00 AM. Can I grab your name and street address to lock
                      that in?&rdquo;
                    </p>
                  </div>

                  {/* Instant Action Cards Inside Motif */}
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
                      <Calendar
                        className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="text-xs sm:text-sm">
                        <p className="font-bold text-white">
                          Job Booked: Water Heater Valve Leak
                        </p>
                        <p className="text-slate-300">
                          Tomorrow, 8:00–10:00 AM • 418 Maple Ridge Dr
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
                      <FileText
                        className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="text-xs sm:text-sm">
                        <p className="font-bold text-white">
                          Call Summary Sent to You
                        </p>
                        <p className="text-slate-300">
                          Caller details, job notes, and urgency delivered right
                          after hang-up.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Jump to Sample Call */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Pronounced &ldquo;to-NEL-ah&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        scrollToSection("demo");
                        setIsPlaying(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316] hover:text-orange-400 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Listen to full 46s call
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            3. TRUST STRIP
        =================================================================== */}
        <section
          aria-label="Core Guarantees"
          className="border-y border-slate-800 bg-[#0E1A2F]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
              <div className="flex items-center gap-3.5 bg-[#0B1424]/70 border border-slate-800/90 rounded-xl px-5 py-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#F97316]/15 text-[#F97316] shrink-0">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </span>
                <p className="text-base sm:text-lg font-bold text-white">
                  Every call answered, 24/7
                </p>
              </div>

              <div className="flex items-center gap-3.5 bg-[#0B1424]/70 border border-slate-800/90 rounded-xl px-5 py-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#F97316]/15 text-[#F97316] shrink-0">
                  <Wrench className="w-5 h-5" aria-hidden="true" />
                </span>
                <p className="text-base sm:text-lg font-bold text-white">
                  Jobs booked while you&apos;re on the tools
                </p>
              </div>

              <div className="flex items-center gap-3.5 bg-[#0B1424]/70 border border-slate-800/90 rounded-xl px-5 py-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#F97316]/15 text-[#F97316] shrink-0">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                </span>
                <p className="text-base sm:text-lg font-bold text-white">
                  No missed calls, no lost customers
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            4. THE PROBLEM
        =================================================================== */}
        <section className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-[#122038] to-[#0D182B] border border-slate-800 p-6 sm:p-10 lg:p-12 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F97316]">
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    The Reality in Home Services
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    Missed calls are missed revenue.
                  </h2>
                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                    It&apos;s 7:00 PM. A homeowner&apos;s pipe bursts in the
                    basement. They don&apos;t leave a voicemail and wait around
                    hoping somebody calls back tomorrow — they call two
                    plumbers.{" "}
                    <span className="text-white font-semibold">
                      The one who answers gets the job.
                    </span>
                  </p>
                  <p className="text-base text-slate-300 leading-relaxed">
                    When you&apos;re soldering copper in a crawlspace, up on a
                    steep pitch, or troubleshooting a compressor, you can&apos;t
                    drop your tools every time your phone buzzes. Tunella makes
                    sure your business picks up on the first call — day or
                    night — so the job lands on your schedule, not your
                    competitor&apos;s.
                  </p>
                </div>

                {/* Visual Scenario Comparison */}
                <div className="lg:col-span-5 space-y-3.5">
                  <div className="rounded-2xl bg-[#0B1424]/90 border border-rose-500/30 p-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-rose-300 mb-1">
                      <span>Contractor #1 (Voicemail)</span>
                      <span>7:02 PM</span>
                    </div>
                    <p className="text-sm font-bold text-white">
                      &ldquo;Leave a message after the beep...&rdquo;
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Homeowner hangs up without leaving a voicemail and dials
                      the next shop on the list.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#0B1424] border-2 border-[#F97316] p-4 shadow-lg shadow-[#F97316]/10">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#F97316] mb-1">
                      <span>Your Shop with Tunella</span>
                      <span>7:03 PM</span>
                    </div>
                    <p className="text-sm font-bold text-white">
                      Answered live • Job booked • Urgent call routed
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      Tunella answers immediately, captures the address and
                      issue, and books the job or transfers urgent calls to you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-slate-300">
                  Built for owner-operators and small crews (1–10 people) across
                  Plumbing, HVAC, Electrical, Roofing, and more.
                </p>
                <button
                  type="button"
                  onClick={() => openDemoModal()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm transition-colors shrink-0"
                >
                  Request a Demo
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            5. HOW IT WORKS (3 STEPS)
        =================================================================== */}
        <section
          id="how-it-works"
          className="py-16 sm:py-24 bg-[#0E1A2F]/60 border-y border-slate-800/80 scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#F97316]">
                How It Works
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Up and running in 3 simple steps.
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-300">
                Keep the business number painted on your trucks. Nothing to
                install at your shop.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative rounded-2xl bg-[#0B1424] border border-slate-800 p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F97316]/15 text-[#F97316] font-extrabold text-lg border border-[#F97316]/30">
                      1
                    </span>
                    <PhoneForwarded
                      className="w-6 h-6 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Forward your existing business number to Tunella
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Tunella works with the phone number your customers already
                    know via standard call forwarding. There is no hardware to
                    buy and nothing to install.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-[#F97316]">
                  Keep your current business number
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl bg-[#0B1424] border border-slate-800 p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F97316]/15 text-[#F97316] font-extrabold text-lg border border-[#F97316]/30">
                      2
                    </span>
                    <Wrench
                      className="w-6 h-6 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    2–3 day onboarding configured with you
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    In 2–3 business days, we configure your custom greeting,
                    services, hours, service area, pricing answers, and call
                    routing — then test it together with you.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-[#F97316]">
                  Tested with you before going live
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl bg-[#0B1424] border border-slate-800 p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F97316]/15 text-[#F97316] font-extrabold text-lg border border-[#F97316]/30">
                      3
                    </span>
                    <Calendar
                      className="w-6 h-6 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Tunella answers every call, books jobs, and sends you the
                    details
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Every caller reaches your business 24/7. Tunella books jobs,
                    takes messages, answers common questions, transfers urgent
                    calls, and sends you a summary after every call.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-[#F97316]">
                  24/7 answering + instant call summaries
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => openDemoModal()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-base shadow-lg shadow-[#F97316]/20 transition-all"
              >
                Request a Demo
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("pricing")}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-700 hover:bg-slate-800/60 text-slate-200 font-semibold text-base transition-colors"
              >
                See Pricing
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================================
            6. INTERACTIVE DEMO PREVIEW (SAMPLE CALL PLAYER)
        =================================================================== */}
        <section id="demo" className="py-16 sm:py-24 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#F97316]">
                Interactive Sample Call
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Hear how Tunella books a plumbing job.
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-300">
                Press play to follow a real-world call flow. Watch the live
                transcript highlight and see the summary Tunella sends to the
                contractor as the call happens.
              </p>
            </div>

            <div className="rounded-3xl bg-[#111E34] border border-slate-700/80 shadow-2xl overflow-hidden">
              {/* Top Audio Player Control Bar */}
              <div className="bg-[#0E192D] border-b border-slate-800 p-5 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white shadow-lg shadow-[#F97316]/30 transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      aria-label={
                        isPlaying ? "Pause sample call" : "Play sample call"
                      }
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#F97316]">
                          Sample Call • Plumbing
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {activeTurn.speakerLabel}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                        Water Heater Shutoff Valve Leak — Oak Creek
                      </h3>
                    </div>
                  </div>

                  {/* Speed & Audio Controls */}
                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      type="button"
                      onClick={restartCall}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                      aria-label="Restart sample call"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      Restart
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPlaybackSpeed((prev) =>
                          prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                      aria-label={`Playback speed ${playbackSpeed}x`}
                    >
                      {playbackSpeed}x
                    </button>

                    <button
                      type="button"
                      onClick={() => setSoundEnabled((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                      aria-label={
                        soundEnabled
                          ? "Mute simulated audio"
                          : "Unmute simulated audio"
                      }
                    >
                      {soundEnabled ? (
                        <>
                          <Volume2
                            className="w-4 h-4 text-[#F97316]"
                            aria-hidden="true"
                          />
                          <span className="hidden sm:inline">Audio On</span>
                        </>
                      ) : (
                        <>
                          <VolumeX
                            className="w-4 h-4 text-slate-400"
                            aria-hidden="true"
                          />
                          <span className="hidden sm:inline">Muted</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress Bar Scrubber */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                    <span>{formatSeconds(currentTime)}</span>
                    <span className="text-slate-300 font-sans font-medium">
                      Click anywhere on the timeline or transcript to jump
                    </span>
                    <span>{formatSeconds(CALL_DURATION)}</span>
                  </div>
                  <label htmlFor="call-progress-slider" className="sr-only">
                    Sample call playback progress
                  </label>
                  <input
                    id="call-progress-slider"
                    type="range"
                    min={0}
                    max={CALL_DURATION}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => {
                      setCurrentTime(parseFloat(e.target.value));
                    }}
                    className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#F97316]"
                  />
                </div>
              </div>

              {/* Lower Split: Live Highlighted Transcript + Live Extracted Job Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Transcript Column */}
                <div className="lg:col-span-7 p-5 sm:p-7 space-y-3 border-b lg:border-b-0 lg:border-r border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Live Call Transcript
                    </h4>
                    <span className="text-xs text-slate-400">
                      Tap any line to jump
                    </span>
                  </div>

                  <div className="space-y-3">
                    {SAMPLE_TRANSCRIPT.map((turn) => {
                      const isActive =
                        currentTime >= turn.startSec &&
                        currentTime < turn.endSec;
                      const isPast = currentTime >= turn.endSec;

                      return (
                        <button
                          key={turn.id}
                          type="button"
                          onClick={() => {
                            setCurrentTime(turn.startSec + 0.05);
                            setIsPlaying(true);
                          }}
                          className={`w-full text-left rounded-2xl p-4 transition-all border ${
                            isActive
                              ? "bg-[#F97316]/15 border-[#F97316] shadow-md"
                              : isPast
                              ? "bg-[#0B1424]/90 border-slate-800/90 opacity-90 hover:border-slate-700"
                              : "bg-[#0B1424]/40 border-slate-800/50 opacity-65 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span
                              className={`font-bold ${
                                turn.speaker === "tunella"
                                  ? "text-[#F97316]"
                                  : "text-sky-300"
                              }`}
                            >
                              {turn.speakerLabel}
                            </span>
                            <span className="font-mono text-slate-400">
                              {formatSeconds(turn.startSec)}
                            </span>
                          </div>
                          <p
                            className={`text-sm sm:text-base leading-relaxed ${
                              isActive
                                ? "text-white font-medium"
                                : "text-slate-300"
                            }`}
                          >
                            {turn.text}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Contractor Summary Column */}
                <div className="lg:col-span-5 p-5 sm:p-7 bg-[#0B1424]/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F97316]">
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        Instant Call Summary
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        Sent to Owner
                      </span>
                    </div>

                    <div className="rounded-2xl bg-[#0B1424] border border-slate-800 p-5 space-y-4">
                      <div className="pb-3 border-b border-slate-800">
                        <p className="text-xs text-slate-400">
                          What Tunella sends you after the call:
                        </p>
                        <p className="text-sm font-bold text-white mt-0.5">
                          Miller &amp; Sons Plumbing — Incoming Lead
                        </p>
                      </div>

                      <div className="space-y-3">
                        {SAMPLE_TRANSCRIPT.filter(
                          (t) => t.extractedField
                        ).map((turn) => {
                          const isCaptured =
                            currentTime >= turn.startSec + 1.2 ||
                            currentTime === 0;
                          return (
                            <div
                              key={turn.id}
                              className={`rounded-xl p-3 border transition-all ${
                                currentTime >= turn.startSec &&
                                currentTime < turn.endSec
                                  ? "bg-[#F97316]/15 border-[#F97316]"
                                  : isCaptured
                                  ? "bg-slate-900/90 border-slate-800"
                                  : "bg-slate-900/30 border-slate-800/40 opacity-50"
                              }`}
                            >
                              <p className="text-xs font-semibold text-slate-400">
                                {turn.extractedField?.label}
                              </p>
                              <p className="text-sm font-bold text-white mt-0.5">
                                {isCaptured
                                  ? turn.extractedField?.value
                                  : "Listening for caller details..."}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {capturedFields.length > 0 && (
                        <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>
                            Captured {capturedFields.length} of 4 booking
                            details in real time
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-800">
                    <p className="text-sm text-slate-300 mb-3">
                      Want to hear how Tunella will sound answering for your own
                      shop?
                    </p>
                    <button
                      type="button"
                      onClick={() => openDemoModal()}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm shadow-lg shadow-[#F97316]/20 transition-all"
                    >
                      Request a Demo for Your Business
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            7. FEATURES GRID (6 CARDS)
        =================================================================== */}
        <section
          id="features"
          className="py-16 sm:py-24 bg-[#0E1A2F]/60 border-y border-slate-800/80 scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#F97316]">
                Built for the Field
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Everything your front desk should do — without hiring one.
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-300">
                Designed specifically for owner-operators and 1–10 person crews
                in plumbing, HVAC, electrical, roofing, and home services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature Card 1 */}
              <div className="rounded-2xl bg-[#0B1424] border border-slate-800 p-7 hover:border-slate-700 transition-colors">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F97316]/15 text-[#F97316] mb-5">
                  <Clock className="w-6 h-6" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  24/7 Answering
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Tunella answers every business call around the clock —
                  weekdays, evenings, weekends, and holidays. No missed calls
                  and no voicemail black holes.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="rounded-2xl bg-[#0B1424] border border-slate-800 p-7 hover:border-slate-700 transition-colors">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F97316]/15 text-[#F97316] mb-5">
                  <Calendar className="w-6 h-6" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  Job Booking
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Takes appointment requests and books jobs while you&apos;re
                  on the tools, configured during onboarding to match how you
                  run your calendar.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="rounded-2xl bg-[#0B1424] border border-slate-800 p-7 hover:border-slate-700 transition-colors">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F97316]/15 text-[#F97316] mb-5">
                  <MessageSquare className="w-6 h-6" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  Message Taking
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Captures complete, accurate messages from customers,
                  inspectors, or suppliers so you never have to decipher a
                  garbled voicemail again.
                </p>
              </div>

              {/* Feature Card 4 */}
              <div className="rounded-2xl bg-[#0B1424] border border-slate-800 p-7 hover:border-slate-700 transition-colors">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F97316]/15 text-[#F97316] mb-5">
                  <HelpCircle className="w-6 h-6" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  Answers Common Questions
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Gives callers clear answers on your hours, service area, and
                  pricing based on the exact business details configured with
                  you during setup.
                </p>
              </div>

              {/* Feature Card 5 */}
              <div className="rounded-2xl bg-[#0B1424] border border-slate-800 p-7 hover:border-slate-700 transition-colors">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F97316]/15 text-[#F97316] mb-5">
                  <FileText className="w-6 h-6" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  Call Summaries Sent to You After Every Call
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Right after each call ends, Tunella sends you the caller&apos;s
                  details, what they need, and what was booked so you can review
                  it between jobs.
                </p>
              </div>

              {/* Feature Card 6 */}
              <div className="rounded-2xl bg-[#0B1424] border border-slate-800 p-7 hover:border-slate-700 transition-colors">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#F97316]/15 text-[#F97316] mb-5">
                  <PhoneForwarded className="w-6 h-6" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  Urgent-Call Transfer to You or Your Crew
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  When a caller has an urgent or sensitive issue that meets the
                  rules you define during setup, Tunella transfers the call live
                  to you or a team member.
                </p>
              </div>
            </div>

            {/* Trade Quick-Select Pills (Each opens Demo Form pre-selected for that trade) */}
            <div className="mt-12 rounded-2xl bg-[#0B1424] border border-slate-800 p-6 flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="text-center lg:text-left">
                <p className="text-sm font-bold text-white">
                  Configured for your specific trade during onboarding:
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your trade to request a tailored demo walkthrough.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => openDemoModal("Plumbing")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-[#F97316] text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
                  Plumbing
                </button>
                <button
                  type="button"
                  onClick={() => openDemoModal("HVAC")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-[#F97316] text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                  HVAC
                </button>
                <button
                  type="button"
                  onClick={() => openDemoModal("Electrical")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-[#F97316] text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                  Electrical
                </button>
                <button
                  type="button"
                  onClick={() => openDemoModal("Roofing")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-[#F97316] text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" aria-hidden="true" />
                  Roofing
                </button>
                <button
                  type="button"
                  onClick={() => openDemoModal("General Contracting")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-[#F97316] text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  Home Services
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            8. PRICING SECTION
        =================================================================== */}
        <section id="pricing" className="py-16 sm:py-24 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#F97316]">
                Simple, Straightforward Pricing
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                One plan. Every business call covered.
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-300">
                No hidden tiers, no long-term contracts, and no surprises on
                your bill.
              </p>
            </div>

            {/* Highlighted Single Pricing Card */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#152642] to-[#0E1A2F] border-2 border-[#F97316] shadow-2xl shadow-[#F97316]/10 overflow-hidden">
              <div className="bg-[#F97316] px-6 py-2.5 text-center">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                  Complete 24/7 AI Phone Receptionist for Contractors
                </p>
              </div>

              <div className="p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                {/* Left Column: Price & Breakdown */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
                        $299
                      </span>
                      <span className="text-xl font-semibold text-slate-300">
                        /month
                      </span>
                    </div>
                    <p className="mt-2 text-sm sm:text-base font-medium text-[#F97316]">
                      + $99 one-time onboarding fee (non-refundable)
                    </p>
                  </div>

                  {/* Key Allowance Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#0B1424]/90 border border-slate-800 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Included Monthly Usage
                      </p>
                      <p className="text-lg font-extrabold text-white mt-0.5">
                        500 AI minutes / mo
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Unused minutes do not roll over
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#0B1424]/90 border border-slate-800 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Transparent Overage
                      </p>
                      <p className="text-lg font-extrabold text-white mt-0.5">
                        $0.20 / minute
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Only if you exceed 500 minutes
                      </p>
                    </div>
                  </div>

                  {/* Required Bullets */}
                  <ul className="space-y-3 text-sm sm:text-base text-slate-200">
                    <li className="flex items-start gap-3">
                      <Check
                        className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>
                        <strong className="text-white">Month-to-month</strong> —
                        no long-term contract
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check
                        className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>
                        <strong className="text-white">Cancel anytime</strong>{" "}
                        with 30 days&apos; notice
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check
                        className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>
                        <strong className="text-white">
                          Works with your existing number
                        </strong>{" "}
                        via call forwarding — nothing to install
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check
                        className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>
                        <strong className="text-white">
                          2–3 business day onboarding:
                        </strong>{" "}
                        greeting, business knowledge, and call routing
                        configured and tested together
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Right Column: Interactive Usage Estimator + Primary CTA */}
                <div className="lg:col-span-5 rounded-2xl bg-[#0B1424] border border-slate-800 p-6 space-y-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="minutes-estimator"
                        className="text-xs font-bold uppercase tracking-wider text-slate-300"
                      >
                        Estimate Your Monthly Minutes
                      </label>
                      <span className="text-sm font-extrabold text-[#F97316]">
                        {estimatedMinutes} mins / mo
                      </span>
                    </div>
                    <input
                      id="minutes-estimator"
                      type="range"
                      min={100}
                      max={1000}
                      step={25}
                      value={estimatedMinutes}
                      onChange={(e) =>
                        setEstimatedMinutes(parseInt(e.target.value, 10))
                      }
                      className="mt-3 w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#F97316]"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>100 mins</span>
                      <span>500 mins (Included)</span>
                      <span>1,000 mins</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Monthly base (includes 500 mins)</span>
                      <span className="font-semibold text-white">$299.00</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>
                        Overage ({overageMinutes} mins × $0.20/min)
                      </span>
                      <span className="font-semibold text-white">
                        ${overageCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="font-bold text-white">
                        Estimated Monthly Total
                      </span>
                      <span className="text-xl font-extrabold text-[#F97316]">
                        ${totalMonthlyEstimate.toFixed(2)}/mo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1">
                      Plus $99 one-time non-refundable onboarding fee in month
                      one.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openDemoModal()}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-base shadow-xl shadow-[#F97316]/25 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Request a Demo
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            9. FAQ ACCORDION (EXACT Q&As)
        =================================================================== */}
        <section
          id="faq"
          className="py-16 sm:py-24 bg-[#0E1A2F]/60 border-t border-slate-800/80 scroll-mt-20"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#F97316]">
                Frequently Asked Questions
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Straight answers before you book a demo.
              </h2>
            </div>

            <div className="space-y-3.5">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                const panelId = `faq-panel-${idx}`;
                const buttonId = `faq-button-${idx}`;

                return (
                  <div
                    key={item.question}
                    className={`rounded-2xl border transition-colors ${
                      isOpen
                        ? "bg-[#111E34] border-[#F97316]/60"
                        : "bg-[#0B1424] border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() =>
                          setOpenFaqIndex((prev) => (prev === idx ? null : idx))
                        }
                        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-2xl"
                      >
                        <span className="text-base sm:text-lg font-bold text-white">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-[#F97316] shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    </h3>
                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="px-6 pb-5 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-slate-800/70 pt-4"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            10. FINAL CTA BANNER
        =================================================================== */}
        <section className="py-16 sm:py-24 relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#F97316]/10 via-transparent to-[#F97316]/10"
            aria-hidden="true"
          />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="rounded-3xl bg-gradient-to-br from-[#162746] to-[#0E192D] border-2 border-[#F97316]/80 p-8 sm:p-12 lg:p-14 text-center shadow-2xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Your Next Customer Is Calling.
              </h2>
              <p className="mt-4 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
                Make sure your business is ready to answer.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => openDemoModal()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-base shadow-xl shadow-[#F97316]/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Request a Demo
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("pricing")}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 rounded-xl border border-slate-700 hover:bg-slate-800/70 text-slate-200 font-semibold text-base transition-colors"
                >
                  See Pricing
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          11. FOOTER
      ===================================================================== */}
      <footer className="bg-[#080F1C] border-t border-slate-800/90 py-12 sm:py-16 text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-slate-800/80">
            <div className="md:col-span-5 space-y-3">
              <TunellaLogo />
              <p className="text-slate-300 max-w-sm leading-relaxed">
                24/7 AI phone receptionist for local contractors: plumbers, HVAC
                techs, electricians, roofers, and home-service businesses.
              </p>
              <p className="text-xs text-slate-400">
                Tunella (pronounced &ldquo;to-NEL-ah&rdquo;) identifies itself
                as an AI receptionist where required by law.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#how-it-works"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("how-it-works");
                    }}
                    className="hover:text-white transition-colors"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    href="#demo"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("demo");
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Hear a sample call
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("features");
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("pricing");
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("faq");
                    }}
                    className="hover:text-white transition-colors"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openDemoModal()}
                    className="text-[#F97316] hover:text-orange-400 font-semibold transition-colors"
                  >
                    Request a Demo
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Contact
              </h3>
              {/* TODO - Replace placeholder contact email below with live production contact email */}
              <p className="text-slate-300">
                Email:{" "}
                <a
                  href="mailto:TODO-contact-email@tunella.com"
                  className="text-[#F97316] hover:underline font-mono text-xs break-all"
                >
                  TODO-contact-email@tunella.com
                </a>
              </p>
              <p className="text-xs text-slate-400">
                Onboarding takes 2–3 business days. Works with your existing
                business phone number.
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Tunella. All rights reserved.</p>
            <p>
              Built for owner-operators &amp; small crews (1–10 people) in home
              services.
            </p>
          </div>
        </div>
      </footer>

      </div>
      {/* =====================================================================
          12. DEMO REQUEST MODAL
      ===================================================================== */}
      {demoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm"
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDemoModal();
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-[#111E34] border border-slate-700 shadow-2xl p-6 sm:p-8 my-8">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F97316]">
                  See Tunella in Action
                </span>
                <h2
                  id="demo-modal-title"
                  className="text-2xl font-extrabold text-white mt-0.5"
                >
                  Request a Demo
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDemoModal}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
                aria-label="Close demo request modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {isSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto">
                  <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Demo Request Received, {formValues.name}!
                </h3>
                <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
                  We&apos;ve got your details for{" "}
                  <strong className="text-white">
                    {formValues.businessName}
                  </strong>{" "}
                  ({formValues.trade}). We&apos;ll reach out to{" "}
                  <strong className="text-white">{formValues.phone}</strong> and{" "}
                  <strong className="text-white">{formValues.email}</strong> to
                  walk you through a live sample call for your shop.
                </p>
                <div className="rounded-xl bg-[#0B1424] border border-slate-800 p-4 text-xs text-slate-300 text-left space-y-1">
                  <p className="font-bold text-white">What happens next:</p>
                  <p>
                    • We&apos;ll show you how Tunella answers calls for your{" "}
                    {formValues.trade.toLowerCase()} business.
                  </p>
                  <p>
                    • When you&apos;re ready, onboarding takes 2–3 business days
                    using your existing business phone number.
                  </p>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={closeDemoModal}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm"
                  >
                    Back to Page
                  </button>
                  <button
                    type="button"
                    onClick={resetDemoForm}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-sm"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleDemoSubmit}
                noValidate
                className="mt-5 space-y-4"
              >
                <p className="text-xs sm:text-sm text-slate-300">
                  Tell us a little about your shop and we&apos;ll set up a
                  walkthrough showing how Tunella answers your calls 24/7.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="demo-name"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5"
                    >
                      Your Name <span className="text-[#F97316]">*</span>
                    </label>
                    <input
                      ref={modalFirstInputRef}
                      id="demo-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={formValues.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      aria-invalid={Boolean(formErrors.name)}
                      aria-describedby={
                        formErrors.name ? "demo-name-error" : undefined
                      }
                      placeholder="Mike Miller"
                      className={`w-full rounded-xl bg-[#0B1424] border px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] ${
                        formErrors.name ? "border-rose-500" : "border-slate-700"
                      }`}
                    />
                    {formErrors.name && (
                      <p
                        id="demo-name-error"
                        role="alert"
                        className="mt-1 text-xs text-rose-400"
                      >
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Business Name */}
                  <div>
                    <label
                      htmlFor="demo-business"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5"
                    >
                      Business Name <span className="text-[#F97316]">*</span>
                    </label>
                    <input
                      id="demo-business"
                      name="businessName"
                      type="text"
                      required
                      autoComplete="organization"
                      value={formValues.businessName}
                      onChange={(e) =>
                        handleInputChange("businessName", e.target.value)
                      }
                      aria-invalid={Boolean(formErrors.businessName)}
                      aria-describedby={
                        formErrors.businessName
                          ? "demo-business-error"
                          : undefined
                      }
                      placeholder="Miller & Sons Plumbing"
                      className={`w-full rounded-xl bg-[#0B1424] border px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] ${
                        formErrors.businessName
                          ? "border-rose-500"
                          : "border-slate-700"
                      }`}
                    />
                    {formErrors.businessName && (
                      <p
                        id="demo-business-error"
                        role="alert"
                        className="mt-1 text-xs text-rose-400"
                      >
                        {formErrors.businessName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="demo-phone"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5"
                    >
                      Phone Number <span className="text-[#F97316]">*</span>
                    </label>
                    <input
                      id="demo-phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={formValues.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      aria-invalid={Boolean(formErrors.phone)}
                      aria-describedby={
                        formErrors.phone ? "demo-phone-error" : undefined
                      }
                      placeholder="(555) 234-5678"
                      className={`w-full rounded-xl bg-[#0B1424] border px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] ${
                        formErrors.phone
                          ? "border-rose-500"
                          : "border-slate-700"
                      }`}
                    />
                    {formErrors.phone && (
                      <p
                        id="demo-phone-error"
                        role="alert"
                        className="mt-1 text-xs text-rose-400"
                      >
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="demo-email"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5"
                    >
                      Email Address <span className="text-[#F97316]">*</span>
                    </label>
                    <input
                      id="demo-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formValues.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      aria-invalid={Boolean(formErrors.email)}
                      aria-describedby={
                        formErrors.email ? "demo-email-error" : undefined
                      }
                      placeholder="mike@millerplumbing.com"
                      className={`w-full rounded-xl bg-[#0B1424] border px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] ${
                        formErrors.email
                          ? "border-rose-500"
                          : "border-slate-700"
                      }`}
                    />
                    {formErrors.email && (
                      <p
                        id="demo-email-error"
                        role="alert"
                        className="mt-1 text-xs text-rose-400"
                      >
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Trade Dropdown */}
                <div>
                  <label
                    htmlFor="demo-trade"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5"
                  >
                    Trade <span className="text-[#F97316]">*</span>
                  </label>
                  <select
                    id="demo-trade"
                    name="trade"
                    required
                    value={formValues.trade}
                    onChange={(e) => handleInputChange("trade", e.target.value)}
                    aria-invalid={Boolean(formErrors.trade)}
                    aria-describedby={
                      formErrors.trade ? "demo-trade-error" : undefined
                    }
                    className={`w-full rounded-xl bg-[#0B1424] border px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] ${
                      formErrors.trade ? "border-rose-500" : "border-slate-700"
                    }`}
                  >
                    <option value="">Select your trade...</option>
                    {TRADE_OPTIONS.map((tradeOption) => (
                      <option key={tradeOption} value={tradeOption}>
                        {tradeOption}
                      </option>
                    ))}
                  </select>
                  {formErrors.trade && (
                    <p
                      id="demo-trade-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-400"
                    >
                      {formErrors.trade}
                    </p>
                  )}
                </div>

                {/* Optional Message */}
                <div>
                  <label
                    htmlFor="demo-message"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5"
                  >
                    Message{" "}
                    <span className="text-slate-400 font-normal normal-case">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="demo-message"
                    name="message"
                    rows={3}
                    value={formValues.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder="Tell us your crew size (1–10), how you currently handle calls, or any questions..."
                    className="w-full rounded-xl bg-[#0B1424] border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white font-bold text-base shadow-lg shadow-[#F97316]/25 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {isSubmitting ? "Submitting Request..." : "Request a Demo"}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <p className="mt-2.5 text-center text-xs text-slate-400">
                    $299/month • $99 one-time setup • Month-to-month, cancel
                    anytime with 30 days&apos; notice.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}