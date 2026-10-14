import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function ProjectsRedirect() {
  const { search, hash } = useLocation();
  const navigate = useNavigate();
  const target = `/${search}${hash}`;
  useEffect(() => { void navigate(target, { replace: true }); }, [navigate, target]);
  return <Link to={target}>Перейти к проектам</Link>;
}
