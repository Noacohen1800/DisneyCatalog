import './PageHeader.css'

interface PageHeaderProps {
  title: string
  subtitle?: string
  // "hero" is the big fairytale title of the main page; "page" is for the other pages
  size?: 'hero' | 'page'
}

// The decorated title at the top of every page, with little sparkles around it
function PageHeader({ title, subtitle, size = 'page' }: PageHeaderProps) {
  return (
    <header className={`page-header page-header--${size}`}>
      <div className="page-header__title-row">
        <span className="page-header__sparkle" aria-hidden="true">
          ✦
        </span>
        <h1 className="page-header__title">{title}</h1>
        <span className="page-header__sparkle page-header__sparkle--small" aria-hidden="true">
          ✦
        </span>
      </div>

      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}

      {/* A delicate golden divider: line, star, line */}
      <div className="page-header__divider" aria-hidden="true">
        <span />
        <span className="page-header__divider-star">✧</span>
        <span />
      </div>
    </header>
  )
}

export default PageHeader
