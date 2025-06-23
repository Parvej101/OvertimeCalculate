"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [attendanceData, setAttendanceData] = useState([]);
  
  // Message and loading states
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all employees on initial load
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        if (res.ok) {
          setEmployees(data.employees);
        } else {
          throw new Error('Failed to fetch employees');
        }
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    };
    fetchEmployees();
  }, []);

  // Generate or clear the attendance sheet when employee or month changes
  useEffect(() => {
    if (selectedEmployee && month) {
      generateAttendanceSheet(month);
    } else {
      setAttendanceData([]); // Clear table if no employee is selected
    }
    setMessage(''); // Clear any previous messages
  }, [selectedEmployee, month]);

  const generateAttendanceSheet = (selectedMonth) => {
    const [year, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, m, 0).getDate();
    const sheet = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      date: new Date(year, m - 1, i + 1).toLocaleDateString('en-CA'), // YYYY-MM-DD
      inTime: '',
      outTime: '',
    }));
    setAttendanceData(sheet);
  };

  const handleInputChange = (day, field, value) => {
    const updatedData = attendanceData.map(d =>
      d.day === day ? { ...d, [field]: value } : d
    );
    setAttendanceData(updatedData);
  };

  // --- This is the main function for this step ---
  const handleSave = async () => {
    if (!selectedEmployee) {
      setMessage('Error: Please select an employee first.');
      return;
    }
    
    setIsLoading(true);
    setMessage('');

    // Filter out rows where inTime or outTime is not set
    const recordsToSave = attendanceData.filter(record => record.inTime && record.outTime);

    if (recordsToSave.length === 0) {
        setMessage("Info: No attendance data to save.");
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          attendanceRecords: recordsToSave,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Success: Attendance saved successfully!');
      } else {
        throw new Error(data.message || 'Failed to save attendance.');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <main>
  {/* মূল কন্টেইনারে প্যাডিং এবং সর্বোচ্চ প্রস্থ layout.js থেকে আসছে */}
  <div className="space-y-8">
    
    {/* --- পেজের হেডার --- */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Monthly Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter daily attendance or upload an Excel sheet.
        </p>
      </div>
      {/* "View Reports" বাটনটিকে আরও আকর্ষণীয় করা হয়েছে */}
      <Link 
        href="/reports" 
        className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-105"
      >
        View Reports →
      </Link>
    </div>
    
    {/* --- ফিল্টার সেকশন --- */}
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">
            Select Employee
          </label>
          <select 
            id="employee" 
            value={selectedEmployee} 
            onChange={(e) => setSelectedEmployee(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">-- Select an Employee --</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
            Select Month
          </label>
          <input 
            type="month" 
            id="month" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
      </div>
    </div>

    {/* --- অ্যাটেনডেন্স টেবিল সেকশন --- */}
    {selectedEmployee && (
      <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">
          Attendance Sheet for: <span className="text-indigo-600">{employees.find(e => e._id === selectedEmployee)?.name}</span>
        </h2>
        {/* --- মোবাইল ডিভাইসের জন্য বিশেষ নোট --- */}
        <p className="md:hidden text-sm text-center text-gray-500 bg-yellow-50 p-3 rounded-lg mb-4">
          For a better experience, rotate your device or scroll the table horizontally.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Time</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map(data => (
                <tr key={data.day} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.date}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <input 
                      type="time" 
                      value={data.inTime} 
                      onChange={(e) => handleInputChange(data.day, 'inTime', e.target.value)} 
                      className="p-2 border rounded-lg w-full focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <input 
                      type="time" 
                      value={data.outTime} 
                      onChange={(e) => handleInputChange(data.day, 'outTime', e.target.value)} 
                      className="p-2 border rounded-lg w-full focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-4">
          {message && <p className="font-semibold text-center sm:text-left">{message}</p>}
          <button 
            onClick={handleSave} 
            disabled={isLoading} 
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:bg-green-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {isLoading ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    )}
  </div>
</main>
  );
}