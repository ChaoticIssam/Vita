export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#262626] px-4 py-6 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.035),_transparent_26%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.02),_transparent_18%)]" />

      <section className="relative flex w-full max-w-[1180px] items-center justify-center overflow-hidden rounded-[14px] bg-black px-6 py-12 shadow-[0_22px_90px_rgba(0,0,0,0.42)] sm:min-h-[640px] sm:px-8 sm:py-14">
        {/* <div className="absolute left-1/2 top-[13%] h-28 w-[160px] -translate-x-1/2 rounded-full bg-white/85 blur-[18px]" /> */}
        {/* <div className="absolute left-1/2 top-[12%] h-40 w-[230px] -translate-x-1/2 rounded-full bg-white/22 blur-[28px]" /> */}

        <div className="relative flex w-full max-w-[380px] flex-col items-center justify-center text-center text-white">
          {children}
        </div>
      </section>
    </main>
  );
}
