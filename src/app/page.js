// ফাইল পাথ: src/app/page.js
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddEmployeePage() {
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [dutyHours, setDutyHours] = useState('9');
  const [dutyMinutes, setDutyMinutes] = useState('10');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const totalDutyMinutes = (parseInt(dutyHours, 10) || 0) * 60 + (parseInt(dutyMinutes, 10) || 0);
    
    // ফ্রন্টএন্ড কনসোলে ফাইনাল চেক
    console.log("Sending to API:", { totalDutyMinutes });

    if (totalDutyMinutes <= 0) {
      setErrorMessage("Standard Duty Time must be greater than 0.");
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
        alert('Employee added successfully!');
        router.push('/employeeList');
      } else {
        setErrorMessage(data.message || 'Something went wrong!');
      }
    } catch (error) {
      setErrorMessage('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <Link href="/employeeList" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            View Employee List →
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Employee</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label><input id="employeeId" type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
            <div><label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label><input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
            <div><label htmlFor="designation" className="block text-sm font-medium text-gray-700">Designation</label><input id="designation" type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">Overtime Hourly Rate (Taka)</label><input id="hourlyRate" type="number" step="any" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Standard Duty Time</label>
              <div className="mt-1 flex items-center space-x-2"><input type="number" value={dutyHours} onChange={(e) => setDutyHours(e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded-md" placeholder="Hours" min="0" /><span className="text-gray-500">hr</span><input type="number" value={dutyMinutes} onChange={(e) => setDutyMinutes(e.target.value)} className="w-1/2 px-3 py-2 border border-gray-300 rounded-md" placeholder="Minutes" min="0" max="59" /><span className="text-gray-500">min</span></div>
            </div>
            <div><button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"> {isLoading ? 'Adding...' : 'Add Employee'} </button></div>
          </form>
          {errorMessage && <p className="mt-4 text-center text-red-600 font-medium">{errorMessage}</p>}
        </div>
      </div>
    </main>
  );
}