import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { SubmissionsListProvider } from "./context/SubmissionsListContext";

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <SubmissionsListProvider>
          <RouterProvider router={router} />
        </SubmissionsListProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
