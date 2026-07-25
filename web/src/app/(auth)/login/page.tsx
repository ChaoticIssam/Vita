import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full max-w-[320px]">
      <div className="mb-8 text-center">
        <h1 className="text-[34px] font-light tracking-[0.28em] text-white">Vite</h1>
      </div>

      <div className="rounded-[18px] border border-white/12 bg-[rgba(20,21,31,0.76)] px-5 py-5 shadow-[0_18px_42px_rgba(0,0,0,0.32)] backdrop-blur-[18px]">
        <form className="space-y-4">
          <label className="block text-left">
            <input
              className="h-10 w-full border-0 border-b border-white/18 bg-transparent px-0 text-[14px] font-normal text-white outline-none placeholder:text-white/32 focus:border-white/50 focus:ring-0"
              type="email"
              name="email"
              placeholder="Email / Mobile Number"
              autoComplete="email"
            />
          </label>

          <label className="block text-left">
            <input
              className="h-10 w-full border-0 border-b border-white/18 bg-transparent px-0 text-[14px] font-normal text-white outline-none placeholder:text-white/32 focus:border-white/50 focus:ring-0"
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            className="mt-5 flex h-11 w-full items-center justify-center rounded-[2px] border border-white/72 bg-transparent text-[13px] font-medium text-white transition hover:bg-white hover:text-black"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center text-[10px] text-white/38">
          No account yet?{' '}
          <Link href="/register" className="font-medium text-white/78 transition hover:text-white">
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}
