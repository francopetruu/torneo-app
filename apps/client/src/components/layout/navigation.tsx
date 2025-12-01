import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();

  const navItems = [{ path: "/", label: "Home" }];

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <ul className="flex gap-4">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`hover:text-primary block px-4 py-2 transition-colors ${
                  location.pathname === item.path ? "border-primary border-b-2 font-semibold" : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
