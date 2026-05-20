"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import styles from "./EmployeeModal.module.css";

interface Employee {
  _id?: string;
  employeeId: string;
  name: string;
  department: string;
  grade: string;
  email: string;
  designation: string;
}

interface EmployeeModalProps {
  employee: Employee | null; // Null means creating, Object means editing
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => Promise<boolean>;
}

export default function EmployeeModal({
  employee,
  isOpen,
  onClose,
  onSave,
}: EmployeeModalProps) {
  const { role, deptHeadDept, departments, grades } = useRole();
  const isDeptHead = role === "dept-head";

  // Form State
  const [formData, setFormData] = useState<Employee>({
    employeeId: "",
    name: "",
    department: isDeptHead ? deptHeadDept : "Engineering",
    grade: "L1",
    email: "",
    designation: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync state with selected employee for editing
  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        employeeId: "",
        name: "",
        department: isDeptHead ? deptHeadDept : "Engineering",
        grade: "L1",
        email: "",
        designation: "",
      });
    }
    setError(null);
  }, [employee, isOpen, isDeptHead, deptHeadDept]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    if (!formData.employeeId.trim()) {
      setError("Employee ID is required");
      return false;
    }
    if (!/^EMP-\d{3,}$/.test(formData.employeeId.trim())) {
      setError("Employee ID must follow the standard format, e.g., EMP-101");
      return false;
    }
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email address is required");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setError("Please provide a valid email format");
      return false;
    }
    if (!formData.designation.trim()) {
      setError("Designation / Title is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      } else {
        setError("Failed to register employee. Uniqueness check or server error occurred.");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("A server connection issue occurred. Please check database logs.");
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!employee;

  return (
    <div className={styles.overlay} onClick={onClose} id="employee-modal-overlay">
      <div
        className={`${styles.drawer} glass`}
        onClick={(e) => e.stopPropagation()}
        id="employee-modal-drawer"
      >
        <div className={styles.header}>
          <h2>{isEditing ? "✏️ Edit Team Member" : "➕ Add New Talent"}</h2>
          <button id="btn-close-modal" className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {error && (
          <div className={styles.errorAlert} id="modal-error-alert">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} id="employee-registration-form">
          {/* Employee ID */}
          <div className={styles.formField}>
            <label htmlFor="modal-employeeId">Employee ID</label>
            <input
              id="modal-employeeId"
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="e.g. EMP-101"
              disabled={isEditing}
              className={isEditing ? styles.disabledInput : ""}
              required
            />
            <span className={styles.helperText}>
              {isEditing ? "Employee ID cannot be edited" : "Unique identifier formatted as EMP-###"}
            </span>
          </div>

          {/* Full Name */}
          <div className={styles.formField}>
            <label htmlFor="modal-name">Full Name</label>
            <input
              id="modal-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="First and Last name"
              required
            />
          </div>

          {/* Department */}
          <div className={styles.formField}>
            <label htmlFor="modal-department">Department</label>
            <select
              id="modal-department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={isDeptHead}
              className={isDeptHead ? styles.disabledInput : ""}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {isDeptHead && (
              <span className={styles.helperText}>
                Locked to your managed sector ({deptHeadDept})
              </span>
            )}
          </div>

          {/* Grade Band */}
          <div className={styles.formField}>
            <label htmlFor="modal-grade">Corporate Grade Band</label>
            <select
              id="modal-grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
            >
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          {/* Email Address */}
          <div className={styles.formField}>
            <label htmlFor="modal-email">Email ID</label>
            <input
              id="modal-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="username@enterprise.com"
              required
            />
          </div>

          {/* Designation */}
          <div className={styles.formField}>
            <label htmlFor="modal-designation">Designation / Role</label>
            <input
              id="modal-designation"
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className={styles.footer}>
            <button
              id="btn-cancel-modal"
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              id="btn-submit-modal"
              type="submit"
              className={styles.saveBtn}
              disabled={submitting}
            >
              {submitting ? "Processing..." : isEditing ? "Save Modifications" : "Register Talent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
