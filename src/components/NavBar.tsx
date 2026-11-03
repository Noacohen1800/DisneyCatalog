import { NavLink } from 'react-router-dom'
import './NavBar.css'

interface NavItem {
  to: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/characters', label: 'Catalog' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/random', label: 'Random' },
]

function NavBar() {
  return (
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
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default NavBar
