import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandPalette } from "@/components/CommandPalette";
import { NoorProvider } from "@/components/patient/NoorContext";
import { AuthProvider } from "@/lib/auth";
import { RequireAuth } from "@/components/RequireAuth";
import Login from "./pages/Login.tsx";
import MyProfile from "./pages/MyProfile.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AdminTable from "./pages/AdminTable.tsx";
import { PatientLayout } from "./components/patient/PatientLayout.tsx";
import PatientProfile from "./pages/patient/PatientProfile.tsx";
import Reports from "./pages/patient/Reports.tsx";
import ReportDetail from "./pages/patient/ReportDetail.tsx";
import Exercise from "./pages/patient/Exercise.tsx";
import Meds from "./pages/patient/Meds.tsx";
import Sleep from "./pages/patient/Sleep.tsx";
import Nutrition from "./pages/patient/Nutrition.tsx";
import RoutineSelector from "./pages/patient/RoutineSelector.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NoorProvider>
            <CommandPalette />
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Clinician home */}
              <Route
                path="/"
                element={
                  <RequireAuth roles={["clinician"]}>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/:slug"
                element={
                  <RequireAuth roles={["clinician"]}>
                    <AdminTable />
                  </RequireAuth>
                }
              />

              {/* Patient self-view shortcut */}
              <Route
                path="/me"
                element={
                  <RequireAuth roles={["user"]}>
                    <MyProfile />
                  </RequireAuth>
                }
              />

              {/* Patient profile — accessible to clinicians (any patient) and to
                  the user themselves (their own patient id only — see below). */}
              <Route
                path="/patient/:id"
                element={
                  <RequireAuth>
                    <PatientLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<PatientProfile />} />
                <Route path="reports" element={<Reports />} />
                <Route path="reports/:report" element={<ReportDetail />} />
                <Route path="nutrition" element={<Nutrition />} />
                <Route path="meds" element={<Meds />} />
                <Route path="exercise" element={<Exercise />} />
                <Route path="sleep" element={<Sleep />} />
                <Route path="routines" element={<RoutineSelector />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </NoorProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
