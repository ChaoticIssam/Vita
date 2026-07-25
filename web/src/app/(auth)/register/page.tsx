import Link from "next/link";
import { Hubballi } from "next/font/google";

const hubballi = Hubballi({
  weight: "400",
  subsets: ["latin"],
});

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[412px]">
      <div className="mb-7 text-center">
        <h1 className={`${hubballi.className} text-[60px] font-normal leading-[1.25] tracking-normal text-white`}>
          vita
        </h1>
      </div>

      <div className="h-[282px] w-full rounded-[10px] border border-white/10 bg-[#23233B]/20 px-6 py-6 opacity-95 shadow-[0_18px_42px_rgba(0,0,0,0.3)] backdrop-blur-[18px]">
        <form className="flex h-full flex-col justify-between">
          <label className="block text-left">
            <input
              className="h-10 w-full border-0 border-b border-white/14 bg-transparent px-0 text-[14px] font-normal text-white outline-none placeholder:text-white/30 focus:border-white/40 focus:ring-0"
              type="text"
              name="name"
              placeholder="Full name"
              autoComplete="name"
            />
          </label>

          <label className="block text-left">
            <input
              className="h-10 w-full border-0 border-b border-white/14 bg-transparent px-0 text-[14px] font-normal text-white outline-none placeholder:text-white/30 focus:border-white/40 focus:ring-0"
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
            />
          </label>

          <label className="block text-left">
            <input
              className="h-10 w-full border-0 border-b border-white/14 bg-transparent px-0 text-[14px] font-normal text-white outline-none placeholder:text-white/30 focus:border-white/40 focus:ring-0"
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
            />
          </label>

          <div className="pt-2">
            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center rounded-[2px] border border-white/72 bg-transparent text-[13px] font-medium text-white transition hover:bg-white hover:text-black"
            >
              Create account
            </button>
          </div>
        </form>

        <div className="mt-3 text-center text-[10px] text-white/38">
          Already have an account?{' '}
          <Link className="font-medium text-white/78 transition hover:text-white" href="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
