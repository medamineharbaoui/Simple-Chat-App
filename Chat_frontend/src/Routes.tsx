import { Routes as AppRoutes, Route } from "react-router-dom";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

export default function Routes() {
  return (
    <AppRoutes>
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Chat />} />
      </Route>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </AppRoutes>
  );
}
