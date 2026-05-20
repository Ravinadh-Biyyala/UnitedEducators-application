import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { SiteAccessGate } from "./components/SiteAccessGate";

export default function App() {
  return (
    <SiteAccessGate>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </SiteAccessGate>
  );
}
