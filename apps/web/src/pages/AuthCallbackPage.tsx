import { useAuth } from "react-oidc-context";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Mount this at the route matching VITE_ZITADEL_REDIRECT_URI (e.g. /callback).
 * react-oidc-context automatically processes the auth code from the URL
 * once AuthProvider is mounted - this component just waits for that to
 * finish and then redirects into the app.
 */
export const AuthCallbackPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  if (auth.isLoading) {
    return <div>Signing you in...</div>;
  }

  if (auth.error) {
    return <div>Sign in failed: {auth.error.message}</div>;
  }

  return <div>Redirecting...</div>;
};
