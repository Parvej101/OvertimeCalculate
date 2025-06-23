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
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ফিল্টার এবং বাটন সেকশন (no-print ক্লাস যোগ করা হয়েছে) */}
        <div className="no-print p-6 bg-white rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Monthly Overtime Report</h1>
            {reportData && (
              <button onClick={handlePrint} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg">
                🖨️ Print / Save as PDF
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div><label htmlFor="employee">Select Employee</label><select id="employee" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full p-2 border rounded-md"><option value="">-- Select --</option>{employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>)}</select></div>
            <div><label htmlFor="month">Select Month</label><input type="month" id="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full p-2 border rounded-md" /></div>
            <button onClick={handleGenerateReport} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-blue-400">{isLoading ? 'Generating...' : 'Generate Report'}</button>
          </div>
          {message && <p className="mt-4 text-center font-semibold text-red-500">{message}</p>}
        </div>

        {/* --- সমাধান: এই div-টিতে printable-area ক্লাস যোগ করা হয়েছে --- */}
        {reportData && (
          <div className="printable-area bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2 text-center">Overtime Report</h2>
            <hr className="mb-4" />
            <div className="flex justify-between items-start mb-6">
              <div><p><strong>Employee:</strong> {reportData.employeeDetails.name}</p><p><strong>ID:</strong> {reportData.employeeDetails.employeeId}</p></div>
              <div><p><strong>Month:</strong> {month}</p><p><strong>Report Date:</strong> {new Date().toLocaleDateString()}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-6 mb-8 text-center">
              <div className="border border-green-300 bg-green-50 p-4 rounded-lg"><h3>Total Overtime</h3><p className="text-2xl font-bold">{summary.totalOvertime} hours</p></div>
              <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-lg"><h3>Hourly Rate</h3><p className="text-2xl font-bold">{reportData.employeeDetails.hourlyRate} BDT</p></div>
              <div className="border border-red-300 bg-red-50 p-4 rounded-lg"><h3>Total Bill</h3><p className="text-2xl font-bold">{summary.totalBill} BDT</p></div>
            </div>
            <h3 className="text-xl font-bold mb-4 mt-8">Detailed Attendance Log</h3>
            <table className="min-w-full border">
              <thead className="bg-gray-100 border-b">
                <tr><th>Date</th><th>In Time</th><th>Out Time</th><th>Duty Hours</th><th className="text-red-600">Overtime Hours</th></tr>
              </thead>
              <tbody className="text-center">
                {reportData.attendanceRecords.map(record => (
                  <tr key={record._id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td><td>{new Date(record.inTime).toLocaleTimeString()}</td><td>{new Date(record.outTime).toLocaleTimeString()}</td><td>{record.dutyHours.toFixed(2)}</td><td className="font-bold text-red-600">{record.overtimeHours.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}