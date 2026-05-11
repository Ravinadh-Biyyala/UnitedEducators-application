import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { CompanionProvider } from "./context/CompanionContext";

export default function App() {
  return (
    <AuthProvider>
      <CompanionProvider>
        <RouterProvider router={router} />
      </CompanionProvider>
    </AuthProvider>
  );
}