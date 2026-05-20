"use client";

import React from "react";
import { useRole } from "@/context/RoleContext";
import styles from "./RoleSwitcher.module.css";

interface RoleSwitcherProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function RoleSwitcher({ darkMode, setDarkMode }: RoleSwitcherProps) {
  const { role, setRole, deptHeadDept, setDeptHeadDept, departments } = useRole();

  return (
    <div className={`${styles.container} glass`} id="role-switcher-panel">
      <div className={styles.leftSection}>
        <span className={styles.label}>Active View:</span>
        <div className={styles.toggleGroup}>
          <button
            id="btn-role-admin"
            className={`${styles.toggleButton} ${role === "admin" ? styles.active : ""}`}
            onClick={() => setRole("admin")}
          >
            🛡️ Admin Portal
          </button>
          <button
            id="btn-role-dept"
            className={`${styles.toggleButton} ${role === "dept-head" ? styles.active : ""}`}
            onClick={() => setRole("dept-head")}
          >
            💼 Dept Head Portal
          </button>
        </div>

        {role === "dept-head" && (
          <div className={styles.deptSelectWrapper} id="dept-head-selector-wrapper">
            <span className={styles.selectLabel}>Managing Dept:</span>
            <select
              id="select-dept-head-dept"
              value={deptHeadDept}
              onChange={(e) => setDeptHeadDept(e.target.value)}
              className={styles.select}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={styles.rightSection}>
        <button
          id="btn-theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          className={styles.themeToggle}
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    </div>
  );
}
