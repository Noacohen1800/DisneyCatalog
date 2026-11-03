import { Link, NavLink } from 'react-router-dom'
import './NavBar.css'

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/characters', label: 'Catalog', icon: '✦' },
  { to: '/favorites', label: 'Favorites', icon: '♡' },
  { to: '/random', label: 'Random', icon: '✧' },
]

function NavBar() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* The site's name, in the fairytale font, always leads back to the catalog */}
        <Link to="/characters" className="site-header__brand">
          Disney Catalog
        </Link>

        <nav className="nav-bar" aria-label="Main">
          <ul className="nav-bar__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                {/* NavLink adds the "active" class to the link of the page we are on */}
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? 'nav-bar__link nav-bar__link--active' : 'nav-bar__link'
                  }
                >
                  <span className="nav-bar__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default NavBar
