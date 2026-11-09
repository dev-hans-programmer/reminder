import { Droplets, Settings2 } from 'lucide-react'

interface HeaderProps {
  onOpenSettings: () => void
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Splash home">
        <span className="brand-mark" aria-hidden="true"><Droplets size={21} strokeWidth={2.4} /></span>
        <span>Splash</span>
      </a>
      <nav className="header-nav" aria-label="Main navigation">
        <span className="local-badge"><span aria-hidden="true" /> Private & local</span>
        <button className="icon-button" type="button" onClick={onOpenSettings} aria-label="Open settings">
          <Settings2 size={20} />
        </button>
      </nav>
    </header>
  )
}
