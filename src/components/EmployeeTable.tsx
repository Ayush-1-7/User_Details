"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import styles from "./EmployeeTable.module.css";

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  department: string;
  grade: string;
  email: string;
  designation: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface EmployeeTableProps {
  employees: Employee[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onFilterChange: (filters: { search: string; department: string; grade: string }) => void;
  onSortChange: (sort: { sortBy: string; sortOrder: "asc" | "desc" }) => void;
  onAddClick: () => void;
  onEditClick: (employee: Employee) => void;
  onDeleteClick: (id: string, name: string) => void;
  onReseedClick: () => void;
  loading: boolean;
}

export default function EmployeeTable({
  employees,
  pagination,
  onPageChange,
  onLimitChange,
  onFilterChange,
  onSortChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onReseedClick,
  loading,
}: EmployeeTableProps) {
  const { role, deptHeadDept, departments, grades } = useRole();
  const isDeptHead = role === "dept-head";

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState(isDeptHead ? deptHeadDept : "All");
  const [selectedGrade, setSelectedGrade] = useState("All");

  // Sort States
  const [sortBy, setSortBy] = useState("employeeId");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Sync department locked for Department Head
  useEffect(() => {
    if (isDeptHead) {
      setSelectedDept(deptHeadDept);
      onFilterChange({ search, department: deptHeadDept, grade: selectedGrade });
    } else {
      // If switched back to Admin, keep All or whatever it was
      onFilterChange({ search, department: selectedDept, grade: selectedGrade });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeptHead, deptHeadDept]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({
        search,
        department: isDeptHead ? deptHeadDept : selectedDept,
        grade: selectedGrade,
      });
    }, 300);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDeptSelect = (dept: string) => {
    setSelectedDept(dept);
    onFilterChange({ search, department: dept, grade: selectedGrade });
  };

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
    onFilterChange({ search, department: isDeptHead ? deptHeadDept : selectedDept, grade });
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newOrder);
    onSortChange({ sortBy: field, sortOrder: newOrder });
  };

  // Check if current user has edit permission for a specific employee
  const canEditEmployee = (emp: Employee) => {
    if (role === "admin") return true;
    if (role === "dept-head" && emp.department === deptHeadDept) return true;
    return false;
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "🔼" : "🔽";
  };

  return (
    <div className={`${styles.container} glass`}>
      {/* Control Panel */}
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            id="input-search-employees"
            type="text"
            placeholder="Search by ID, name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          {!isDeptHead && (
            <div className={styles.filterGroup}>
              <label htmlFor="select-dept" className={styles.filterLabel}>Dept:</label>
              <select
                id="select-dept"
                value={selectedDept}
                onChange={(e) => handleDeptSelect(e.target.value)}
                className={styles.select}
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.filterGroup}>
            <label htmlFor="select-grade" className={styles.filterLabel}>Grade:</label>
            <select
              id="select-grade"
              value={selectedGrade}
              onChange={(e) => handleGradeSelect(e.target.value)}
              className={styles.select}
            >
              <option value="All">All Grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.actions}>
            {role === "admin" && (
              <>
                <button
                  id="btn-reseed-employees"
                  onClick={onReseedClick}
                  className={styles.reseedBtn}
                  title="Resets database back to pristine 100 corporate employees"
                >
                  🔄 Reset 100 Base
                </button>
                <button
                  id="btn-add-employee"
                  onClick={onAddClick}
                  className={styles.addBtn}
                >
                  ➕ Add Talent
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Data Grid */}
      <div className={styles.tableResponsive}>
        <table className={styles.table} id="employee-data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("employeeId")} className={styles.sortableHeader}>
                ID {getSortIcon("employeeId")}
              </th>
              <th onClick={() => handleSort("name")} className={styles.sortableHeader}>
                Name {getSortIcon("name")}
              </th>
              <th onClick={() => handleSort("department")} className={styles.sortableHeader}>
                Department {getSortIcon("department")}
              </th>
              <th onClick={() => handleSort("grade")} className={styles.sortableHeader}>
                Grade {getSortIcon("grade")}
              </th>
              <th onClick={() => handleSort("email")} className={styles.sortableHeader}>
                Email ID {getSortIcon("email")}
              </th>
              <th onClick={() => handleSort("designation")} className={styles.sortableHeader}>
                Designation {getSortIcon("designation")}
              </th>
              <th className={styles.actionsHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, idx) => (
                <tr key={idx} className={styles.loadingRow}>
                  <td colSpan={7} className="shimmer" style={{ height: "48px" }}></td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <span>📭</span>
                    <p>No matching employee records found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id} className={styles.row}>
                  <td className={styles.empIdCell}>{emp.employeeId}</td>
                  <td className={styles.nameCell}>{emp.name}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[emp.department.toLowerCase().replace(" ", "")]}`}>
                      {emp.department}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.gradeBadge} ${styles[emp.grade.toLowerCase()]}`}>
                      {emp.grade}
                    </span>
                  </td>
                  <td className={styles.emailCell}>{emp.email}</td>
                  <td className={styles.designationCell}>{emp.designation}</td>
                  <td className={styles.actionsCell}>
                    {canEditEmployee(emp) ? (
                      <button
                        onClick={() => onEditClick(emp)}
                        className={styles.editActionBtn}
                        title="Edit Employee details"
                      >
                        ✏️ Edit
                      </button>
                    ) : (
                      <span className={styles.restrictedLabel} title="Read-only view for Department Head">
                        🔒 Lock
                      </span>
                    )}
                    {role === "admin" && (
                      <button
                        onClick={() => onDeleteClick(emp._id, emp.name)}
                        className={styles.deleteActionBtn}
                        title="Delete Employee record"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing <b>{employees.length}</b> of <b>{pagination.total}</b> employees
        </div>

        <div className={styles.pageControls}>
          <div className={styles.limitSelect}>
            <span className={styles.limitLabel}>Rows:</span>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className={styles.smallSelect}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
            className={styles.pageBtn}
          >
            ◀ Previous
          </button>

          <span className={styles.pageNumber}>
            Page <b>{pagination.page}</b> of <b>{pagination.pages || 1}</b>
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages || loading}
            className={styles.pageBtn}
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}
