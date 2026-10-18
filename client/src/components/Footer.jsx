import Link from "next/link";
import { Sprout, Code2, Briefcase, Users, AtSign } from "lucide-react";

const socials = [
  { Icon: Code2, href: "https://github.com", label: "GitHub" },
  { Icon: Briefcase, href: "https://linkedin.com", label: "LinkedIn" },
  { Icon: Users, href: "https://facebook.com", label: "Facebook" },
  { Icon: AtSign, href: "https://twitter.com", label: "X" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-teal-700">
          <Sprout className="h-6 w-6" />
          SeedInvest
        </Link>

        <div className="flex items-center gap-4">
          {socials.map(({ Icon, href }, i) => (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-teal-500 hover:text-teal-700"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} SeedInvest. Fund ideas that matter.
        </p>
      </div>
    </footer>
  );
}
