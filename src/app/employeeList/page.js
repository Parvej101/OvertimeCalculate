"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import EditEmployeeModal from '@/components/EditEmployeeModal';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
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

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (employee) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${employee.name}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/employees/${employee._id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete the employee.');
          Swal.fire('Deleted!', `${employee.name} has been successfully deleted.`, 'success');
          fetchEmployees();
        } catch (error) {
          Swal.fire('Error!', 'Something went wrong during deletion. Please try again.', 'error');
        }
      }
    });
  };

  const handleSave = async (updatedEmployee) => {
    try {
        const res = await fetch(`/api/employees/${updatedEmployee._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedEmployee),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Update failed');
        Swal.fire('Updated!', 'Employee details have been successfully updated.', 'success');
        setIsModalOpen(false);
        fetchEmployees();
    } catch (error) {
        Swal.fire('Error!', error.message, 'error');
    }
  };

  return (
    <main>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employee Profiles</h1>
            <p className="mt-1 text-sm text-gray-500">View and manage all employee records.</p>
          </div>
          <Link href="/" className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-700 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-105">
            + Add New Employee
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-4 sm:p-6 lg:p-8">
            {isLoading ? (
              <div className="text-center py-12"><p className="text-gray-500">Loading employees...</p></div>
            ) : errorMessage ? (
              <div className="text-center py-12"><p className="text-red-500 font-semibold">{errorMessage}</p></div>
            ) : employees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Designation</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Duty Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rate (BDT)</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.employeeId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{emp.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.designation || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.floor(emp.standardDutyMinutes / 60)}h {emp.standardDutyMinutes % 60}m</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{emp.hourlyRate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEditClick(emp)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold">Edit</button>
                          <button onClick={() => handleDeleteClick(emp)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium text-gray-900">No Employees Found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new employee.</p>
                <div className="mt-6">
                  <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">+ Add Employee</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <EditEmployeeModal 
            employee={selectedEmployee} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSave} 
        />
      )}
    </main>
  );
}