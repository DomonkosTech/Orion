import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { saveNewUserPassword } from "../../../services/emailService";
import { toast, Toaster } from "react-hot-toast";

const UserPasswordResetSave = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("A jelszavak nem egyeznek!");
      return;
    }

    if (password.length < 6) {
      toast.error("A jelszónak legalább 6 karakter hosszúnak kell lennie!");
      return;
    }

    const token = searchParams.get("token");
    if (!token) {
      toast.error("Érvénytelen vagy hiányzó token!");
      return;
    }

    try {
      await saveNewUserPassword(token, password);
      toast.success("Sikeres jelszóváltoztatás!");
      navigate("/UserLoginPage");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Hiba történt a jelszó mentése közben.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Toaster />
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Új jelszó megadása</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Új jelszó
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add meg az új jelszót"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Jelszó megerősítése
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add meg újra a jelszót"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          >
            Jelszó mentése
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserPasswordResetSave;
