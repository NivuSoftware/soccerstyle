import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { getPublicCategoryPath } from "@/data/seo";

const priorityLinks = [
  { href: "/contacto", label: "Contacto" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { availableCategories } = useCatalog();

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = search.trim();
    if (!query) {
      return;
    }

    navigate(`/buscar?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl">
      <div className="border-b border-border">
        <div className="container mx-auto flex h-20 items-center gap-4 px-4 md:h-24 lg:grid lg:h-20 lg:grid-cols-[auto_minmax(280px,1fr)_auto] lg:gap-5 xl:grid-cols-[auto_minmax(320px,1fr)_auto] xl:gap-6">
        {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/images/logo.png"
              alt="Soccer Style"
              className="h-11 w-11 object-contain md:h-14 md:w-14"
              width={56}
              height={56}
            />
            <span className="text-2xl font-display font-bold tracking-tight text-foreground md:text-3xl">
              SOCCER <span className="text-primary">STYLE</span>
              <span className="text-primary text-sm align-super md:text-base">®</span>
            </span>
          </Link>

          <div className="hidden min-w-0 lg:block">
            <form
              onSubmit={handleSearchSubmit}
              className="flex h-14 items-center gap-3 rounded-full border border-border/70 bg-background/70 px-4"
            >
              <Search className="h-4 w-4 text-primary" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Que es lo que buscas?"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </form>
          </div>

          <div className="hidden min-w-0 lg:flex items-center justify-end justify-self-end">
            <div className="flex min-w-0 items-center justify-end gap-1 whitespace-nowrap">
              {priorityLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`shrink-0 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200 xl:px-4 ${
                    location.pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 text-foreground hover:text-primary transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-border/70 bg-background/90 lg:block">
        <div className="container mx-auto flex h-12 items-center justify-end px-4">
          <div className="flex min-w-0 items-center justify-end gap-1 overflow-x-auto whitespace-nowrap">
            {availableCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={getPublicCategoryPath(cat.slug)}
                className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 xl:px-4 ${
                  location.pathname === getPublicCategoryPath(cat.slug)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="container mx-auto py-4 px-4 flex flex-col gap-1">
              <form
                onSubmit={handleSearchSubmit}
                className="mb-3 flex items-center gap-3 rounded-full border border-border/70 bg-background/70 px-4 py-3"
              >
                <Search className="h-4 w-4 text-primary" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Que es lo que buscas?"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </form>

              {availableCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={getPublicCategoryPath(cat.slug)}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === getPublicCategoryPath(cat.slug)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {cat.label}
                </Link>
              ))}

              {priorityLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
