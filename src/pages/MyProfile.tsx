import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

/** Routes the logged-in patient to their own profile, gated by auth role. */
const MyProfile = () => {
  const { role, patientId } = useAuth();
  if (role !== "user" || !patientId) return <Navigate to="/login" replace />;
  return <Navigate to={`/patient/${patientId}/profile`} replace />;
};

export default MyProfile;
