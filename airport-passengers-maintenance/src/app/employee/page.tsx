'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function EmployeeLogin() {
  const [employeeID, setEmployeeID] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!employeeID) {
      setError('Please enter your Employee ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8080/api/employee/${employeeID}`);
      
      if (response.ok) {
        router.push('/employee/dashboard'); // Redirect to dashboard after successful login
      } else {
        setError('Invalid Employee ID');
      }
    } catch (err) {
      setError('Failed to login');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 bg-white/10 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Employee Login</h1>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="employeeID" className="block text-white text-xl font-bold italic mb-2">
              Employee ID
            </label>
            <input
              id="employeeID"
              type="text"
              value={employeeID}
              onChange={(e) => setEmployeeID(e.target.value)}
              placeholder="Enter your Employee ID"
              className="w-full px-4 py-2 text-white rounded-lg focus:outline-none bg-white/30 border-2 border-white/50 focus:ring-2 focus:ring-blue-500 placeholder:text-white/70"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-black text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-800 focus:outline-none transform hover:scale-105 transition-transform duration-200"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </div>
    </div>
  );
}