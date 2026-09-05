import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const contractorLinks = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/submit', label: 'Submit a project' },
];

const adminLinks = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/projects', label: 'Review queue' },
  { to: '/admin/contractors', label: 'Contractors' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : contractorLinks;

  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col bg-ink text-paper">
      <div className="px-6 pt-7 pb-6">
        <div className="font-serif text-lg font-semibold tracking-tight">MoSPI</div>
        <div className="mt-0.5 text-xs text-paper/60">Project Monitor</div>
      </div>

      <nav className="flex-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `mb-1 block rounded-sm px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-paper/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-5">
        <div className="text-sm font-medium">{user?.name}</div>
        <div className="text-xs text-paper/50">{user?.company || (user?.role === 'admin' ? 'Program office' : '')}</div>
        <button
          onClick={logout}
          className="mt-3 text-xs text-paper/60 underline decoration-paper/30 underline-offset-2 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
