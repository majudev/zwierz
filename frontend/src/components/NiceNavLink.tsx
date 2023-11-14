import React from 'react';
import { Link, useLocation, LinkProps } from 'react-router-dom';

interface NiceNavLinkProps extends LinkProps {
  to: string;
}

const NiceNavLink: React.FC<NiceNavLinkProps> = ({ to, children, ...rest }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const linkClassName = isActive ? 'nav-link active' : 'nav-link';

  return (
    <Link className={linkClassName} to={to} {...rest}>
      {children}
    </Link>
  );
};

export default NiceNavLink;
