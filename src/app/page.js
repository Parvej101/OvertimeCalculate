"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'; // SweetAlert2 ইম্পোর্ট করা

export default function AddEmployeePage() {
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [dutyHours, setDutyHours] = useState('9');
  const [dutyMinutes, setDutyMinutes] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const totalDutyMinutes = (parseInt(dutyHours, 10) || 0) * 60 + (parseInt(dutyMinutes, 10) || 0);

    if (totalDutyMinutes <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid Duty Time',
            text: 'Standard Duty Time must be greater than 0 minutes.',
        });
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          name,
          designation,
          hourlyRate: Number(hourlyRate),
          standardDutyMinutes: totalDutyMinutes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // --- সফল হলে সাকসেস অ্যালার্ট ---
        Swal.fire({
          icon: 'success',
          title: 'Employee Added!',
          text: `${name} has been successfully added to the system.`,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          router.push('/employeeList');
        });

      } else {
        // --- সমাধান: ব্যর্থ হলে এরর অ্যালার্ট ---
        // API থেকে পাওয়া নির্দিষ্ট মেসেজটি এখানে দেখানো হবে
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: data.message || "An unknown error occurred. Please try again.",
        });
      }
    } catch (error) {
      // নেটওয়ার্ক বা সার্ভার কানেকশন এররের জন্য অ্যালার্ট
      Swal.fire({
        icon: 'error',
        title: 'Identification Error',
        text: 'Employee id is already exists please chack employee list.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white p-8 sm:p-10 rounded-2xl shadow-lg space-y-6">
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Create New Employee Profile
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Fill in the details below to add a new employee.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Employee ID and Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
                <input 
                  id="employeeId" 
                  type="text" 
                  value={employeeId} 
                  onChange={(e) => setEmployeeId(e.target.value)} 
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" 
                  required 
                  placeholder="e.g., 101"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  id="name" 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" 
                  required 
                  placeholder="e.g., John Doe"
                />
              </div>
            </div>
            
            {/* Designation and Hourly Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700">Designation</label>
                <input 
                  id="designation" 
                  type="text" 
                  value={designation} 
                  onChange={(e) => setDesignation(e.target.value)} 
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">Overtime Hourly Rate (Taka)</label>
                <input 
                  id="hourlyRate" 
                  type="number" 
                  step="any" 
                  value={hourlyRate} 
                  onChange={(e) => setHourlyRate(e.target.value)} 
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" 
                  required 
                  placeholder="e.g., 150"
                />
              </div>
            </div>
            
            {/* Standard Duty Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Standard Duty Time</label>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dutyHours" className="text-xs text-gray-500">Hours</label>
                  <input 
                    id="dutyHours"
                    type="number" 
                    value={dutyHours} 
                    onChange={(e) => setDutyHours(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="dutyMinutes" className="text-xs text-gray-500">Minutes</label>
                  <input 
                    id="dutyMinutes"
                    type="number" 
                    value={dutyMinutes} 
                    onChange={(e) => setDutyMinutes(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm"
                    min="0" 
                    max="59" 
                  />
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full flex justify-center py-3 px-4 mt-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {isLoading ? 'Adding...' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}