import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DEFAULT_EMAIL = "maheshch1094@gmail.com";
const AUTH_CODE = "CC-500";

export default function AdminLoginCC500({ onLogin }: { onLogin?: (email: string) => void }) {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [authCode, setAuthCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (email !== DEFAULT_EMAIL) {
      setError("Only the default admin email is allowed.");
      setLoading(false);
      return;
    }
    if (authCode !== AUTH_CODE) {
      setError("Invalid authentication code.");
      setLoading(false);
      return;
    }
    setLoading(false);
    if (onLogin) onLogin(email);
    navigate("/admin-points");
  };

  return (
    <Card className="max-w-md mx-auto mt-20 p-6">
      <CardHeader>
        <CardTitle>Admin Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={true}
          />
          <Input
            type="text"
            placeholder="Enter Auth Code (CC-500)"
            value={authCode}
            onChange={e => setAuthCode(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !authCode}>
            {loading ? "Logging in..." : "Login"}
          </Button>
          {error && <div className="text-red-600 font-semibold">{error}</div>}
        </form>
      </CardContent>
    </Card>
  );
}
