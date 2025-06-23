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
    <main>
  {/* মূল কন্টেইনারে প্যাডিং এবং সর্বোচ্চ প্রস্থ layout.js থেকে আসছে */}
  <div className="space-y-8">

    {/* --- পেজের হেডার --- */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employee List</h1>
        <p className="mt-1 text-sm text-gray-500">
          A list of all registered employees in the system.
        </p>
      </div>
      <Link 
        href="/" 
        className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-105"
      >
        + Add New Employee
      </Link>
    </div>

    {/* --- এমপ্লয়ী টেবিলের কন্টেইনার --- */}
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-4 sm:p-6 lg:p-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading employees...</p>
          </div>
        ) : errorMessage ? (
          <div className="text-center py-12">
            <p className="text-red-500 font-semibold">{errorMessage}</p>
          </div>
        ) : employees.length > 0 ? (
          // --- মূল টেবিল ---
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Hourly Rate (BDT)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {emp.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {emp.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {emp.designation || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {emp.hourlyRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // --- সুন্দর এম্পটি স্টেট ---
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900">No Employees Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new employee.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                + Add Employee
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</main>
  );
}