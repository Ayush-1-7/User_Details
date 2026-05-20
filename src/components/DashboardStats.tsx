"use client";

import React from "react";
import { useRole } from "@/context/RoleContext";
import styles from "./DashboardStats.module.css";

interface StatsData {
  totalHeadcount: number;
  departmentSplit: Record<string, number>;
  gradeSplit: Record<string, number>;
}

interface DashboardStatsProps {
  stats: StatsData;
  loading: boolean;
}

export default function DashboardStats({ stats, loading }: DashboardStatsProps) {
  const { role, deptHeadDept } = useRole();

  if (loading) {
    return (
      <div className={styles.statsContainer}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${styles.card} shimmer`} style={{ height: "120px" }}></div>
        ))}
      </div>
    );
  }

  // Calculate specific metrics depending on active view
  const isDeptHead = role === "dept-head";
  const displayedHeadcount = isDeptHead
    ? stats.departmentSplit[deptHeadDept] || 0
    : stats.totalHeadcount;

  // Grade stats
  const totalGrades = Object.values(stats.gradeSplit).reduce((a, b) => a + b, 0);
  const l1to3Count = (stats.gradeSplit["L1"] || 0) + (stats.gradeSplit["L2"] || 0) + (stats.gradeSplit["L3"] || 0);
  const l4to6Count = (stats.gradeSplit["L4"] || 0) + (stats.gradeSplit["L5"] || 0) + (stats.gradeSplit["L6"] || 0);
  
  const l1to3Percent = totalGrades ? Math.round((l1to3Count / totalGrades) * 100) : 0;
  const l4to6Percent = totalGrades ? Math.round((l4to6Count / totalGrades) * 100) : 0;

  // Get department distribution percentages
  const deptEntries = Object.entries(stats.departmentSplit).sort((a, b) => b[1] - a[1]);
  const maxDeptCount = deptEntries.length ? Math.max(...deptEntries.map(e => e[1])) : 1;

  // Grades array for sorting
  const grades = ["L1", "L2", "L3", "L4", "L5", "L6"];

  return (
    <div className={styles.wrapper}>
      {/* Metrics Row */}
      <div className={styles.statsContainer}>
        {/* KPI 1: Headcount */}
        <div className={`${styles.card} glass`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              {isDeptHead ? "Department Headcount" : "Global Headcount"}
            </span>
            <span className={styles.cardIcon}>👥</span>
          </div>
          <div className={styles.cardValue} id="stat-headcount">
            {displayedHeadcount}
          </div>
          <div className={styles.cardSub}>
            {isDeptHead ? `Active in ${deptHeadDept}` : "Across all organizational structures"}
          </div>
        </div>

        {/* KPI 2: Organizational Unit */}
        <div className={`${styles.card} glass`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              {isDeptHead ? "Assigned Sector" : "Operating Units"}
            </span>
            <span className={styles.cardIcon}>🏢</span>
          </div>
          <div className={styles.cardValue} id="stat-departments">
            {isDeptHead ? "1 Unit" : `${Object.keys(stats.departmentSplit).length} Sectors`}
          </div>
          <div className={styles.cardSub}>
            {isDeptHead ? `Managing: ${deptHeadDept}` : "Core functional company divisions"}
          </div>
        </div>

        {/* KPI 3: Talent Band Distribution */}
        <div className={`${styles.card} glass`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Professional Bands</span>
            <span className={styles.cardIcon}>📊</span>
          </div>
          <div className={styles.cardValue} id="stat-grade-ratio">
            {l1to3Percent}% <span className={styles.divider}>/</span> {l4to6Percent}%
          </div>
          <div className={styles.cardSub}>
            Ratio: Support (L1-L3) vs Leadership (L4-L6)
          </div>
        </div>

        {/* KPI 4: Operations Stability */}
        <div className={`${styles.card} glass`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Status System</span>
            <span className={styles.cardIcon}>🛡️</span>
          </div>
          <div className={`${styles.cardValue} ${styles.successText}`} id="stat-stability">
            Active
          </div>
          <div className={styles.cardSub}>
            Connected to Live MongoDB Cluster
          </div>
        </div>
      </div>

      {/* Visualizations Row */}
      <div className={styles.vizRow}>
        {/* Chart 1: Grade Band Bar Chart */}
        <div className={`${styles.vizCard} glass`}>
          <h3 className={styles.vizHeading}>Grade Band Distribution</h3>
          <div className={styles.barChartContainer}>
            {grades.map((grade) => {
              const count = stats.gradeSplit[grade] || 0;
              const maxCount = Math.max(...Object.values(stats.gradeSplit), 1);
              const percentage = Math.round((count / maxCount) * 100);

              return (
                <div key={grade} className={styles.barItem}>
                  <div className={styles.barWrapper}>
                    <div
                      className={styles.barFill}
                      style={{ height: `${percentage}%` }}
                    >
                      <span className={styles.barValue}>{count}</span>
                    </div>
                  </div>
                  <span className={styles.barLabel}>{grade}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Department Split (Circular representation or progress listings) */}
        {!isDeptHead && (
          <div className={`${styles.vizCard} glass`}>
            <h3 className={styles.vizHeading}>Departmental Resource Allocation</h3>
            <div className={styles.deptList}>
              {deptEntries.map(([dept, count]) => {
                const percentage = Math.round((count / maxDeptCount) * 100);
                return (
                  <div key={dept} className={styles.deptItem}>
                    <div className={styles.deptMeta}>
                      <span className={styles.deptName}>{dept}</span>
                      <span className={styles.deptCount}>{count} employees</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
