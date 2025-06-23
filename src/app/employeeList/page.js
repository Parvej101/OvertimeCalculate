"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link'; // নেভিগেশনের জন্য

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/employees');
        const data = await res.json();
        if (res.ok) {
          setEmployees(data.employees);
        } else {
          throw new Error(data.message || 'Failed to fetch employees');
        }
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Employee List</h1>
          <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
            + Add New Employee
          </Link>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading employees...</p>
          ) : errorMessage ? (
            <p className="text-center text-red-500">{errorMessage}</p>
          ) : employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Employee ID</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Designation</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Hourly Rate (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.employeeId}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700">{emp.name}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700">{emp.designation || 'N/A'}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700">{emp.hourlyRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">No employees found. You can add one!</p>
          )}
        </div>
      </div>
    </main>
  );
}