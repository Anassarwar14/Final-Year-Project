import SignOutButton from "@/components/logout";
import PrivateRoute from "@/components/privateRoute";

export default function DashboardPage() {
  return (
    <div>
      <h1>Private dashboard</h1>
      <SignOutButton />
      <PrivateRoute />
    </div>
  );
}
