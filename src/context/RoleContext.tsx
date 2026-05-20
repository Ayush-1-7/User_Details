"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "dept-head";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  deptHeadDept: string;
  setDeptHeadDept: (dept: string) => void;
  departments: string[];
  grades: string[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>("admin");
  const [deptHeadDept, setDeptHeadDept] = useState<string>("Engineering");

  const departments = ["Engineering", "Sales", "Marketing", "Finance", "Human Resources"];
  const grades = ["L1", "L2", "L3", "L4", "L5", "L6"];

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        deptHeadDept,
        setDeptHeadDept,
        departments,
        grades,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
