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
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Monthly Attendance</h1>
            <div>
                <Link href="/reports" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                    View Reports →
                </Link>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-white rounded-lg shadow-md">
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
            <select id="employee" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm">
              <option value="">-- Select an Employee --</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
            <input type="month" id="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>

        {selectedEmployee && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Attendance Sheet for: <span className="text-indigo-600">{employees.find(e => e._id === selectedEmployee)?.name}</span></h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">Day</th>
                    <th className="py-2 px-4 text-left">In Time</th>
                    <th className="py-2 px-4 text-left">Out Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map(data => (
                    <tr key={data.day} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{data.date}</td>
                      <td className="py-2 px-4">{new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}</td>
                      <td className="py-2 px-4">
                        <input type="time" value={data.inTime} onChange={(e) => handleInputChange(data.day, 'inTime', e.target.value)} className="p-1 border rounded-md w-full"/>
                      </td>
                      <td className="py-2 px-4">
                        <input type="time" value={data.outTime} onChange={(e) => handleInputChange(data.day, 'outTime', e.target.value)} className="p-1 border rounded-md w-full"/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8 flex justify-end items-center gap-4">
              {message && <p className={`font-semibold ${message.includes('Error') || message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
              <button onClick={handleSave} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-green-400 disabled:cursor-not-allowed">
                {isLoading ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}