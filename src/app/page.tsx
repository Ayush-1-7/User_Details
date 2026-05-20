"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import RoleSwitcher from "@/components/RoleSwitcher";
import DashboardStats from "@/components/DashboardStats";
import EmployeeTable from "@/components/EmployeeTable";
import EmployeeModal from "@/components/EmployeeModal";
import styles from "./page.module.css";

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  department: string;
  grade: string;
  email: string;
  designation: string;
}

interface StatsData {
  totalHeadcount: number;
  departmentSplit: Record<string, number>;
  gradeSplit: Record<string, number>;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function DashboardPage() {
  const { role } = useRole();

  // Theme State
  const [darkMode, setDarkMode] = useState(true);

  // Sync dark mode class with document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
    }
  }, [darkMode]);

  // Data States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalHeadcount: 0,
    departmentSplit: {},
    gradeSplit: {},
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Notification Toast State
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Filter & Query States
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [grade, setGrade] = useState("");
  const [sortBy, setSortBy] = useState("employeeId");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
  };

  // Main Fetch function
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        search,
        department,
        grade,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: limit.toString(),
      });

      const res = await fetch(`/api/employees?${queryParams.toString()}`);
      const result = await res.json();

      if (result.success) {
        setEmployees(result.data);
        setPagination(result.pagination);
        setStats(result.stats);
      } else {
        setError(result.error || "Failed to load database entries");
      }
    } catch (err: unknown) {
      console.error("Fetch employees error:", err);
      setError("Failed to establish server connection. Verify MongoDB connection status.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when parameters modify
  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, department, grade, sortBy, sortOrder, page, limit, role]);

  const handleFilterChange = (filters: { search: string; department: string; grade: string }) => {
    setSearch(filters.search);
    setDepartment(filters.department === "All" ? "" : filters.department);
    setGrade(filters.grade === "All" ? "" : filters.grade);
    setPage(1); // Reset page on filter change
  };

  const handleSortChange = (sort: { sortBy: string; sortOrder: "asc" | "desc" }) => {
    setSortBy(sort.sortBy);
    setSortOrder(sort.sortOrder);
  };

  // Add Action
  const handleAddClick = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  // Edit Action
  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  // Delete Action
  const handleDeleteClick = async (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete employee record for '${name}'?`)) {
      try {
        const res = await fetch(`/api/employees/${id}`, {
          method: "DELETE",
        });
        const result = await res.json();

        if (result.success) {
          showToast(`Successfully deleted ${name}'s corporate profile!`, "success");
          fetchEmployees();
        } else {
          showToast(result.error || "Delete command refused", "error");
        }
      } catch (err: unknown) {
        console.error(err);
        showToast("Server connection error during delete", "error");
      }
    }
  };

  // Database Seed/Reseed Action
  const handleReseedClick = async () => {
    if (confirm("Resetting database will clear existing and seed exactly 100 high-quality corporate employee entries. Proceed?")) {
      setLoading(true);
      try {
        const res = await fetch("/api/seed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ force: true }),
        });
        const result = await res.json();

        if (result.success) {
          showToast("Database successfully restored to 100 base employee profiles!", "success");
          setPage(1);
          fetchEmployees();
        } else {
          showToast(result.error || "Seeding failed", "error");
        }
      } catch (err: unknown) {
        console.error(err);
        showToast("Database communication timeout", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Save (Create/Update) Action inside Modal
  const handleSaveEmployee = async (employeeData: Partial<Employee>): Promise<boolean> => {
    try {
      const isEditing = !!employeeData._id;
      const url = isEditing ? `/api/employees/${employeeData._id}` : "/api/employees";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      const result = await res.json();

      if (result.success) {
        showToast(
          isEditing
            ? `Successfully updated details for ${employeeData.name}!`
            : `Successfully registered ${employeeData.name} as a new team member!`,
          "success"
        );
        fetchEmployees();
        return true;
      } else {
        showToast(result.error || "Failed to commit record updates", "error");
        return false;
      }
    } catch (err: unknown) {
      console.error(err);
      showToast("Server processing error", "error");
      return false;
    }
  };

  return (
    <div className={styles.layout}>
      {/* Visual background enhancements for glassmorphism */}
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>

      {/* Corporate Sidebar */}
      <aside className={`${styles.sidebar} glass`}>
        <div className={styles.brandWrapper}>
          <span className={styles.brandIcon}>🔮</span>
          <div>
            <h1 className={styles.brandName}>TalentSphere</h1>
            <span className={styles.brandTagline}>Enterprise Suite v1.0</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <a href="#" className={`${styles.navLink} ${styles.navActive}`} id="nav-dashboard">
            <span className={styles.navLinkIcon}>📊</span> Dashboard Hub
          </a>
          <div className={styles.sidebarDivider}></div>
          <div className={styles.dbIndicator}>
            <div className={styles.dbDot}></div>
            <div>
              <div className={styles.dbStatus}>Database Connected</div>
              <div className={styles.dbSub}>MongoDB Atlas Live Node</div>
            </div>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <p>© 2026 TalentSphere Inc.</p>
          <span>Production Ready</span>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className={styles.main}>
        {/* Toast Notification */}
        {notification && (
          <div
            className={`${styles.toast} ${styles[notification.type]}`}
            id="toast-notification"
            role="alert"
          >
            <span className={styles.toastIcon}>
              {notification.type === "success" ? "✅" : notification.type === "error" ? "❌" : "ℹ️"}
            </span>
            <span>{notification.message}</span>
          </div>
        )}

        {/* Dashboard Header */}
        <header className={styles.header}>
          <div>
            <span className={styles.preTitle}>Overview</span>
            <h2 className={styles.title} id="main-header-title">
              {role === "admin" ? "Enterprise Administration" : "Department Management"}
            </h2>
          </div>
          
          <div className={styles.headerRight}>
            <div className={styles.roleBadge}>
              {role === "admin" ? "🛡️ Global Admin" : "💼 Dept Lead"}
            </div>
          </div>
        </header>

        {/* Role switching hub */}
        <RoleSwitcher darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Errors display */}
        {error && (
          <div className={styles.errorBanner} id="main-error-banner">
            <span className={styles.errorIcon}>🚨</span>
            <div className={styles.errorContent}>
              <h4>API Connection Failures</h4>
              <p>{error}</p>
            </div>
            <button className={styles.retryBtn} onClick={fetchEmployees}>
              Retry Connection
            </button>
          </div>
        )}

        {/* Dynamic Aggregated Metrics */}
        <DashboardStats stats={stats} loading={loading && employees.length === 0} />

        {/* Detailed Grid Table */}
        <EmployeeTable
          employees={employees}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onAddClick={handleAddClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onReseedClick={handleReseedClick}
          loading={loading}
        />
      </main>

      {/* Talent Registration / Modification Form Drawer */}
      <EmployeeModal
        employee={editingEmployee}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
      />
    </div>
  );
}
