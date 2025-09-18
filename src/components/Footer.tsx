import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div>
          © {year} Harvestia • Learn sustainable farming with satellite data
        </div>
        <nav className="flex items-center gap-4">
         
          <Link to="/simulation" className="hover:text-foreground">Simulation</Link>
          <span className="hidden sm:inline text-muted-foreground/40">|</span>
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
      </div>
    </footer>
  )
}
