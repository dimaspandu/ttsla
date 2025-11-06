import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { initGA, trackPage } from "./analytics";
import "./App.scss";

const MainScene = lazy(() => import("~/scenes/MainScene"));

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize GA once
  useEffect(() => {
    initGA();
  }, []);

  // Track page view on route change
  useEffect(() => {
    trackPage(location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    // Handle browser back action on the "/" page
    const handleBackNavigation = (event: PopStateEvent) => {
      if (location.pathname === "/") {
        // Prevent going back from "/" and exit the app instead
        event.preventDefault();
        window.close(); // Try to close the window/tab
        // Optional: navigate away from "/" before trying to close
        // navigate('/some-other-route');
      }
    };

    // Listen for popstate event (back button press)
    window.addEventListener("popstate", handleBackNavigation);

    // Push a state to prevent default browser back behavior when user is on "/"
    if (location.pathname === "/") {
      window.history.pushState(null, "", window.location.href);
    }

    // Cleanup the event listener
    return () => {
      window.removeEventListener("popstate", handleBackNavigation);
    };
  }, [location, navigate]);

  return (
    <div className="app-container">
      <Suspense
        fallback={
          <div className="app-container__loading">
            <div className="app-container__spinner" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<MainScene />} />
        </Routes>
      </Suspense>
    </div>
  );
}
