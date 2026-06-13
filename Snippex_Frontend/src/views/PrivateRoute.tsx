import { Navigate} from "react-router-dom";
import type { ReactNode } from "react";

interface PrivateRouteProps {
  children: ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const token = localStorage.getItem("user");

  return token ? <>{children}</> : <Navigate to="/login" replace />;
}