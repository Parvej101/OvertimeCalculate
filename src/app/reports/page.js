"use client";

import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';

export default function ReportPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ... (useEffect, handleGenerateReport, summary ফাংশনগুলো আগের মতোই থাকবে)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        if (res.ok) setEmployees(data.employees);
        else throw new Error('Failed to fetch employees');
      } catch (error) {
        setMessage(error.message);
      }
    };
    fetchEmployees();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedEmployee || !month) { setMessage('Please select an employee and a month.'); return; }
    setIsLoading(true); setMessage(''); setReportData(null);
    try {
      const res = await fetch(`/api/reports?employeeId=${selectedEmployee}&month=${month}`);
      const data = await res.json();
      if (res.ok) {
        if (data.attendanceRecords.length === 0) { setMessage('No attendance records found.'); }
        setReportData(data);
      } else { throw new Error(data.message || 'Failed to generate report'); }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const summary = useMemo(() => {
    if (!reportData) return { totalOvertime: 0, totalBill: 0 };
    const totalOvertime = reportData.attendanceRecords.reduce((acc, record) => acc + (record.overtimeHours || 0), 0);
    const hourlyRate = reportData.employeeDetails?.hourlyRate || 0;
    const totalBill = totalOvertime * hourlyRate;
    return {
      totalOvertime: totalOvertime.toFixed(2),
      totalBill: totalBill.toFixed(2)
    };
  }, [reportData]);

  // প্রিন্ট করার জন্য সহজ জাভাস্ক্রিপ্ট ফাংশন
  const handlePrint = () => {
    window.print();
  };

  return (
   <main>
  {/* মূল কন্টেইনারে প্যাডিং এবং সর্বোচ্চ প্রস্থ layout.js থেকে আসছে */}
  <div className="space-y-8">
    
    {/* --- ফিল্টার এবং বাটন সেকশন --- */}
    <div className="no-print p-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Monthly Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Select an employee and month to generate a report.
          </p>
        </div>
        {/* রিপোর্ট জেনারেট হলেই শুধু প্রিন্ট বাটনটি দেখানো হবে */}
        {reportData && (
          <button 
            onClick={handlePrint} 
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-transform hover:scale-105"
          >
            🖨️ Print / Save as PDF
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select 
            id="employee" 
            value={selectedEmployee} 
            onChange={(e) => setSelectedEmployee(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">-- Select --</option>
            {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <input 
            type="month" 
            id="month" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" 
          />
        </div>
        <button 
          onClick={handleGenerateReport} 
          disabled={isLoading} 
          className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {isLoading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
      {message && <p className="mt-4 text-center font-semibold text-red-500">{message}</p>}
    </div>

    {/* --- রিপোর্ট দেখানোর সেকশন --- */}
    {reportData && (
      <div className="printable-area bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        {/* রিপোর্ট হেডার */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Overtime Report</h2>
          <p className="text-gray-500">For the month of {new Date(month + '-02').toLocaleString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex justify-between items-start mb-8 text-sm">
          <div>
            <p className="font-semibold">Employee:</p>
            <p>{reportData.employeeDetails.name} (ID: {reportData.employeeDetails.employeeId})</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Report Date:</p>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        {/* সামারি কার্ড */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-center">
          <div className="p-6 rounded-lg bg-green-50 border border-green-200 transition-shadow hover:shadow-md">
            <h3 className="text-sm font-medium text-green-800 uppercase">Total Overtime</h3>
            <p className="mt-2 text-3xl font-bold text-green-900">{summary.totalOvertime} <span className="text-lg font-medium">hours</span></p>
          </div>
          <div className="p-6 rounded-lg bg-yellow-50 border border-yellow-200 transition-shadow hover:shadow-md">
            <h3 className="text-sm font-medium text-yellow-800 uppercase">Hourly Rate</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-900">{reportData.employeeDetails.hourlyRate} <span className="text-lg font-medium">BDT</span></p>
          </div>
          <div className="p-6 rounded-lg bg-red-50 border border-red-200 transition-shadow hover:shadow-md">
            <h3 className="text-sm font-medium text-red-800 uppercase">Total Bill</h3>
            <p className="mt-2 text-3xl font-bold text-red-900">{summary.totalBill} <span className="text-lg font-medium">BDT</span></p>
          </div>
        </div>
        
        {/* বিস্তারিত টেবিল */}
        <h3 className="text-xl font-bold mb-4 mt-8">Detailed Attendance Log</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">In Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Out Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Duty Hours</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-red-500 uppercase tracking-wider">Overtime</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.attendanceRecords.map(record => (
                <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.inTime).toLocaleTimeString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.outTime).toLocaleTimeString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.dutyHours.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{record.overtimeHours.toFixed(2)}</td>
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