import { Routes, Route, Navigate } from "react-router-dom";
// pages
import {
  // default
  Welcome,
  // other
  Page404,
} from "pages";

export const PublicRoutes = () => {
  return (
    <Routes>
      {/* default */}
      <Route path="/" element={<Navigate to="welcome" />} />
      <Route path="/welcome" element={<Welcome />} />

      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};
