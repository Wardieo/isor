import { useEffect, useState } from "react";
import Home from "./components/Home";
import Book from "./components/Book";
import SelectPackage from "./components/SelectPackage";
import PackageDetails from "./components/PackageDetails";
import "./App.css";

const cleanPath = () => window.location.pathname.replace(/\/$/, "") || "/";

function App() {
  const [path, setPath] = useState(cleanPath);

  useEffect(() => {
    const handlePopState = () => setPath(cleanPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (path === "/book") return <Book navigate={navigate} />;
  if (path === "/select-package") return <SelectPackage navigate={navigate} />;
  if (path === "/package-details")
    return <PackageDetails navigate={navigate} />;

  return <Home navigate={navigate} />;
}

export default App;
