import { NavLink } from 'react-router-dom';
import {
  CreditCard, Undo2, Banknote, RotateCcw, Search,
  ShieldCheck, Repeat, Smartphone,
} from 'lucide-react';
import { NAV_GROUPS } from '../navConfig';
import './Sidebar.css';

const ICONS = { CreditCard, Undo2, Banknote, RotateCcw, Search, ShieldCheck, Repeat, Smartphone };

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <svg viewBox="0 0 32 32" width="18" height="18" fill="none">
            <path
              d="M16 3l11 5v8c0 7-4.7 11.6-11 13-6.3-1.4-11-6-11-13V8l11-5z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div>
          <div className="sidebar-brand-name">交易測試主控台</div>
          <span className="env-pill">
            <span className="env-dot" />
            測試環境
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div className="sidebar-group" key={group.title}>
            <div className="sidebar-group-title">{group.title}</div>
            {group.items.map((item) => {
              const Icon = ICONS[item.icon];
              if (!item.enabled) {
                return (
                  <div className="sidebar-item sidebar-item--disabled" key={item.path}>
                    <Icon size={17} />
                    <span>{item.label}</span>
                    <span className="soon-tag">即將推出</span>
                  </div>
                );
              }
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-item${isActive ? ' sidebar-item--active' : ''}`
                  }
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}