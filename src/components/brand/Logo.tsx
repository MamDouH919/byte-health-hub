import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`wordmark ${className}`} aria-label="byte+ home">
    byte<span className="plus">+</span>
  </Link>
);
