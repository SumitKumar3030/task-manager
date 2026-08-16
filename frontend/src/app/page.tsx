import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0B14] overflow-hidden relative">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] min-h-screen">
        {/* LEFT: Typographic hero */}
        <div className="relative flex items-center justify-center px-8 py-24 lg:py-0 min-h-[60vh] lg:min-h-screen">
          {/* ambient glow */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />

          {/* scattered status labels */}
          <span className="hidden md:block absolute top-[12%] left-[8%] text-indigo-400/70 font-semibold tracking-wide text-sm rotate-[-8deg] select-none">
            To Do
          </span>
          <span className="hidden md:block absolute top-[20%] left-[42%] text-cyan-300/60 font-semibold tracking-wide text-xs border border-cyan-300/30 rounded-full px-3 py-1 rotate-[4deg] select-none">
            In Progress
          </span>
          <span className="hidden md:block absolute top-[8%] right-[6%] text-slate-500 font-mono text-xs rotate-[6deg] select-none">
            #TASK-241
          </span>
          <span className="hidden md:block absolute bottom-[22%] left-[6%] text-indigo-300/50 font-semibold text-sm rotate-[5deg] select-none">
            Review
          </span>
          <span className="hidden md:block absolute bottom-[10%] right-[10%] text-emerald-400/70 font-semibold text-sm rotate-[-4deg] select-none">
            ✓ Done
          </span>
          <span className="hidden md:block absolute top-[45%] right-[2%] text-slate-600 font-mono text-[11px] rotate-[-10deg] select-none">
            assigned to Priya
          </span>
          <span className="hidden md:block absolute bottom-[6%] left-[38%] text-indigo-400/40 font-semibold text-xs tracking-widest rotate-[-3deg] select-none">
            DUE FRIDAY
          </span>
          <span className="hidden lg:block absolute top-[65%] left-[14%] w-2 h-2 rounded-full bg-cyan-400/60 select-none" />
          <span className="hidden lg:block absolute top-[30%] right-[20%] w-1.5 h-1.5 rounded-full bg-indigo-400/50 select-none" />
          <span className="hidden lg:block absolute bottom-[35%] right-[6%] w-3 h-3 rotate-45 border border-slate-500/40 select-none" />

          {/* signature wordmark */}
          <h1 className="relative text-center font-black leading-[0.85] tracking-tight select-none">
            <span className="block text-[15vw] lg:text-[7.5rem] text-white drop-shadow-[0_0_40px_rgba(99,102,241,0.35)]">
              TASK
            </span>
            <span className="block text-[15vw] lg:text-[7.5rem] bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              FLOW
            </span>
          </h1>
        </div>

        {/* RIGHT: CTA panel */}
        <div className="relative flex flex-col justify-center px-10 py-16 lg:py-0 bg-[#100F1B] border-t lg:border-t-0 lg:border-l border-white/5">
          <p className="text-cyan-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Team workspace
          </p>
          <h2 className="text-4xl font-bold text-white leading-tight mb-3">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
              TaskFlow
            </span>
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full mb-6" />
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
            Boards, tasks, and your whole team — in sync, in real time.
            Create a workspace and see what actually needs doing today.
          </p>

          <div className="flex flex-col gap-3 max-w-xs">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg shadow-indigo-600/25"
            >
              Sign Up
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-white/15 hover:border-indigo-400/60 hover:bg-white/5 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              Log In
            </Link>
          </div>

          <p className="text-slate-600 text-xs mt-12">
            No credit card required · Free for small teams
          </p>
        </div>
      </div>
    </div>
  );
}