"use client";

import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';

export default function ReportPage() {
  // State for selectors
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  
  // State for report data and loading
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch all employees on initial load
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        if (res.ok) setEmployees(data.employees);
      } catch (error) {
        setMessage('Error fetching employees');
      }
    };
    fetchEmployees();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedEmployee || !month) {
      setMessage('Please select an employee and a month.');
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    setReportData(null);

    try {
      const res = await fetch(`/api/reports?employeeId=${selectedEmployee}&month=${month}`);
      const data = await res.json();

      if (res.ok) {
        if (data.attendanceRecords.length === 0) {
            setMessage('No attendance records found for the selected period.');
        }
        setReportData(data);
      } else {
        throw new Error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary using useMemo for performance
  const summary = useMemo(() => {
    if (!reportData || !reportData.attendanceRecords) {
      return { totalOvertime: 0, totalBill: 0 };
    }
    const totalOvertime = reportData.attendanceRecords.reduce((acc, record) => acc + (record.overtimeHours || 0), 0);
    const hourlyRate = reportData.employeeDetails?.hourlyRate || 0;
    const totalBill = totalOvertime * hourlyRate;
    
    return {
      totalOvertime: totalOvertime.toFixed(2),
      totalBill: totalBill.toFixed(2)
    };
  }, [reportData]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Monthly Overtime Report</h1>
             <Link href="/attendance" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                ← Back to Attendance
            </Link>
        </div>
        
        {/* --- Filter Section --- */}
        <div className="p-6 bg-white rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                    <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                    <select id="employee" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm">
                        <option value="">-- Select --</option>
                        {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                    <input type="month" id="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <button onClick={handleGenerateReport} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-blue-400">
                    {isLoading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>
             {message && <p className="mt-4 text-center font-semibold text-red-500">{message}</p>}
        </div>

        {/* --- Report Display Section --- */}
        {reportData && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Report for: <span className="text-indigo-600">{reportData.employeeDetails.name}</span></h2>
            <p className="mb-6 text-gray-600">Month: {month}</p>

            {/* --- Summary Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
                <div className="bg-green-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800">Total Overtime</h3>
                    <p className="text-3xl font-bold text-green-900">{summary.totalOvertime} <span className="text-xl">hours</span></p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-800">Hourly Rate</h3>
                    <p className="text-3xl font-bold text-yellow-900">{reportData.employeeDetails.hourlyRate} <span className="text-xl">BDT</span></p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800">Total Overtime Bill</h3>
                    <p className="text-3xl font-bold text-red-900">{summary.totalBill} <span className="text-xl">BDT</span></p>
                </div>
            </div>

            {/* --- Detailed Report Table --- */}
            <h3 className="text-xl font-bold mb-4">Detailed Attendance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">In Time</th>
                    <th className="py-2 px-4 text-left">Out Time</th>
                    <th className="py-2 px-4 text-left">Duty Hours</th>
                    <th className="py-2 px-4 text-left text-red-600">Overtime Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.attendanceRecords.map(record => (
                    <tr key={record._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="py-2 px-4">{new Date(record.inTime).toLocaleTimeString()}</td>
                      <td className="py-2 px-4">{new Date(record.outTime).toLocaleTimeString()}</td>
                      <td className="py-2 px-4">{record.dutyHours.toFixed(2)}</td>
                      <td className="py-2 px-4 font-bold text-red-600">{record.overtimeHours.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}