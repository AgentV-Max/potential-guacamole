import Link from "next/link";

const links = [
  { href: "/", label: "Find Gas" },
  { href: "/sell", label: "Sell Gas" },
  { href: "/dashboard", label: "Seller Login" },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
            🔥
          </span>
          <span>
            GasLink <span className="text-orange-600">Surulere</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-orange-50 hover:text-orange-700 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
