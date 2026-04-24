import RegistrationForm from "@/components/RegistrationForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative z-10 bg-[radial-gradient(circle_at_center,var(--color-rustic-brown)_0%,var(--color-dark-espresso)_100%)]">
      {/* Texture Background */}
      <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none bg-black mix-blend-overlay paper-texture"></div>
      
      {/* Decorative Board Game Elements */}
      <div className="fixed top-10 left-10 w-20 h-20 bg-electric-orange rounded-2xl border-4 border-dark-espresso shadow-[6px_6px_0px_var(--color-deep-cocoa)] -rotate-12 opacity-20 hidden md:block"></div>
      <div className="fixed bottom-20 right-10 w-16 h-16 bg-burnt-orange rounded-full border-4 border-dark-espresso shadow-[6px_6px_0px_var(--color-deep-cocoa)] rotate-12 opacity-20 hidden md:block"></div>
      
      <div className="w-full max-w-2xl my-auto py-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <RegistrationForm />
      </div>
      
      <footer className="mt-8 mb-6 text-center text-xs font-subhead text-soft-tangerine tracking-[0.2em] uppercase font-bold text-shadow-tactile">
        &copy; 2026 UKM PCC POLINES // THE BOARD GAME EDITION // ALL RIGHTS RESERVED.
      </footer>
    </main>
  );
}
