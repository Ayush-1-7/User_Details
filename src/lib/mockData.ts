export interface RawEmployee {
  employeeId: string;
  name: string;
  department: string;
  grade: string;
  email: string;
  designation: string;
}

const FIRST_NAMES = [
  "Amit", "Priya", "Rahul", "Neha", "Vikram", "Anjali", "Sandeep", "Deepika", "Aditya", "Shweta",
  "Rohan", "Sneha", "Karan", "Kirti", "Manish", "Pooja", "Rajesh", "Aishwarya", "Suresh", "Divya",
  "Arjun", "Kavita", "Vivek", "Tanvi", "Sanjay", "Ritu", "Gaurav", "Nisha", "Alok", "Preeti",
  "Sunil", "Megha", "Vijay", "Aisha", "Harish", "Jyoti", "Abhishek", "Rhea", "Dinesh", "Kajal"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Mehta", "Singh", "Patel", "Reddy", "Joshi", "Iyer", "Nair",
  "Kumar", "Rao", "Mishra", "Choudhury", "Bose", "Das", "Sen", "Roy", "Pandey", "Trivedi",
  "Dubey", "Saxena", "Deshmukh", "Kulkarni", "Bhat", "Shenoy", "Pillai", "Menon", "Jha", "Prasad"
];

const DEPARTMENTS = [
  {
    name: "Engineering",
    designations: [
      { grade: "L1", title: "QA Engineer" },
      { grade: "L1", title: "Software Engineer" },
      { grade: "L2", title: "Senior Software Engineer" },
      { grade: "L3", title: "Lead DevOps Engineer" },
      { grade: "L3", title: "Tech Lead" },
      { grade: "L4", title: "Engineering Manager" },
      { grade: "L5", title: "Director of Engineering" },
      { grade: "L6", title: "VP of Engineering" }
    ]
  },
  {
    name: "Sales",
    designations: [
      { grade: "L1", title: "Sales Executive" },
      { grade: "L2", title: "Account Manager" },
      { grade: "L3", title: "Senior Account Executive" },
      { grade: "L4", title: "Sales Manager" },
      { grade: "L5", title: "Regional Sales Director" },
      { grade: "L6", title: "VP of Global Sales" }
    ]
  },
  {
    name: "Marketing",
    designations: [
      { grade: "L1", title: "Social Media Specialist" },
      { grade: "L2", title: "Marketing Analyst" },
      { grade: "L3", title: "Campaign Lead" },
      { grade: "L4", title: "Marketing Manager" },
      { grade: "L5", title: "Creative Director" },
      { grade: "L6", title: "VP of Marketing" }
    ]
  },
  {
    name: "Finance",
    designations: [
      { grade: "L1", title: "Accountant" },
      { grade: "L2", title: "Financial Analyst" },
      { grade: "L3", title: "Senior Accountant" },
      { grade: "L4", title: "Finance Manager" },
      { grade: "L5", title: "Director of Finance" },
      { grade: "L6", title: "CFO (VP of Finance)" }
    ]
  },
  {
    name: "Human Resources",
    designations: [
      { grade: "L1", title: "HR Associate" },
      { grade: "L2", title: "Talent Acquisition Specialist" },
      { grade: "L3", title: "HR Business Partner" },
      { grade: "L4", title: "HR Manager" },
      { grade: "L5", title: "Director of HR" },
      { grade: "L6", title: "CHRO" }
    ]
  }
];

// LCG Deterministic Pseudo-Random Generator
function createRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateMockEmployees(): RawEmployee[] {
  const employees: RawEmployee[] = [];
  const random = createRandom(12345); // Fixed seed for 100% deterministic generation
  const usedEmails = new Set<string>();

  // Ensure we get exactly 100 employees
  for (let i = 1; i <= 100; i++) {
    const idNum = String(i).padStart(3, "0");
    const employeeId = `EMP-${idNum}`;

    // Select Name
    const firstName = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;

    // Deterministic distribution of departments
    // Engineering: 35%, Sales: 20%, Marketing: 15%, Finance: 15%, HR: 15%
    let deptInfo = DEPARTMENTS[0]; // Default to Engineering
    const randDept = random();
    if (randDept < 0.35) {
      deptInfo = DEPARTMENTS[0]; // Engineering
    } else if (randDept < 0.55) {
      deptInfo = DEPARTMENTS[1]; // Sales
    } else if (randDept < 0.70) {
      deptInfo = DEPARTMENTS[2]; // Marketing
    } else if (randDept < 0.85) {
      deptInfo = DEPARTMENTS[3]; // Finance
    } else {
      deptInfo = DEPARTMENTS[4]; // Human Resources
    }

    // Assign Designation and Grade (based on department designations)
    // Make sure we have a natural distribution of grades (mostly L1-L3, some L4, few L5-L6)
    const randGrade = random();
    let designationIndex = 0;

    if (randGrade < 0.40) {
      // Junior (L1)
      const l1Dez = deptInfo.designations.filter(d => d.grade === "L1");
      const chosen = l1Dez[Math.floor(random() * l1Dez.length)] || deptInfo.designations[0];
      designationIndex = deptInfo.designations.indexOf(chosen);
    } else if (randGrade < 0.75) {
      // Mid-Senior (L2-L3)
      const l23Dez = deptInfo.designations.filter(d => d.grade === "L2" || d.grade === "L3");
      const chosen = l23Dez[Math.floor(random() * l23Dez.length)] || deptInfo.designations[1];
      designationIndex = deptInfo.designations.indexOf(chosen);
    } else if (randGrade < 0.92) {
      // Lead / Manager (L4)
      const l4Dez = deptInfo.designations.filter(d => d.grade === "L4");
      const chosen = l4Dez[0] || deptInfo.designations[3];
      designationIndex = deptInfo.designations.indexOf(chosen);
    } else if (randGrade < 0.98) {
      // Director (L5)
      const l5Dez = deptInfo.designations.filter(d => d.grade === "L5");
      const chosen = l5Dez[0] || deptInfo.designations[4];
      designationIndex = deptInfo.designations.indexOf(chosen);
    } else {
      // VP / Executive (L6)
      const l6Dez = deptInfo.designations.filter(d => d.grade === "L6");
      const chosen = l6Dez[0] || deptInfo.designations[5];
      designationIndex = deptInfo.designations.indexOf(chosen);
    }

    const { grade, title: designation } = deptInfo.designations[designationIndex] || deptInfo.designations[0];

    // Ensure we don't have overlapping emails
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@enterprise.com`;
    let attempts = 0;
    while (usedEmails.has(email) && attempts < 10) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(random() * 90 + 10)}@enterprise.com`;
      attempts++;
    }
    usedEmails.add(email);

    employees.push({
      employeeId,
      name,
      department: deptInfo.name,
      grade,
      email,
      designation
    });
  }

  // Force one specific employee in each role to be easily recognisable
  // Let's set EMP-001 to a clear executive or mid-level engineer
  return employees;
}
