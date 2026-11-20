# 🌐 INTERN ENGINE: Global Engineering Internship Portal

> A modern, responsive web application for exploring **National and International** engineering internships across all engineering disciplines, with verified stipends, visa sponsorship, housing information, application tracking, and global research fellowships.

---

## 🚀 Key Features

### 1. Multi-Disciplinary Coverage (All Engineering Streams)
- **Computer Science & IT**: AI/ML, Distributed Systems, Cloud Architecture, Cyber Security (Google, Microsoft, NVIDIA, Apple).
- **Mechanical & Robotics**: Autonomous Vehicles, CAD/FEA, Mechatronics, Industrial Automation (Tesla, Siemens, Tata Motors, ASML).
- **Electrical & Electronics (ECE/EEE)**: Silicon Architecture, VLSI, Analog IC Design, Smart Grid (Intel, Texas Instruments, Schneider Electric, DRDO).
- **Aerospace & Defense**: Space systems, Rocket Propulsion, Aerodynamics, Avionics (ISRO, NASA JPL, Airbus, Boeing, Skyroot Aerospace).
- **Civil & Infrastructure**: Structural Engineering, BIM Modeling, Tunnel Boring, Metro Rail, Facade Design (Larsen & Toubro, ARUP, DMRC).
- **Chemical & Materials**: Green Hydrogen, Decarbonization, Refining, Nanotechnology (Shell Global, Reliance Industries, A*STAR).
- **Biomedical & Biotech**: Neural Interfaces, Biosensors, Medical Device Engineering (Medtronic, EPFL).
- **Industrial & Systems**: Supply Chain Optimization, Six Sigma, Lean Manufacturing (Apple, Amazon).

---

### 2. National & International Segments
- **International Programs**: USA (J-1 visa), Germany (DAAD), Switzerland (CERN, ETH Zurich), Canada (Mitacs Globalink), UK, Netherlands (ASML), Singapore (A*STAR).
- **National Programs**: Top Indian research institutions and industrial giants (ISRO, DRDO, Tata Motors, Reliance, L&T Construction, DMRC).
- **Filters**: Quickly toggle between **All Scope**, **National**, and **International** with one click.

---

### 3. Comprehensive Search & Smart Filters
- **Real-Time Keyword Search**: Matches role title, company, skills, keywords, and country.
- **Discipline Quick Pills**: Live counters for each branch.
- **Location Filter**: Filter by country (USA, India, Germany, Switzerland, Canada, UK, Netherlands, Singapore).
- **Work Mode**: Onsite, Hybrid, Remote.
- **Perks**: Visa Sponsorship, Housing Provided, Paid Stipends Only.
- **Sorting**: Featured / Recommended, Approaching Deadline, Highest Stipend, Company Rating.
- **View Toggle**: Switch between **Grid Cards** and **Compact List View**.

---

### 4. Interactive Detail Modal
- In-depth role responsibilities and project overview.
- Clear eligibility criteria (year, CGPA, degree requirements).
- Key technical skills required.
- Detailed breakdown of perks: flight reimbursement, housing allowances, mentorship, and Pre-Placement Offer (PPO) conversion rates.
- Direct links to the company's official careers portal.

---

### 5. Private Application Kanban Tracker (`localStorage`)
- Save, organize, and manage applications privately in your browser without requiring an account:
  - **Saved / Considering**
  - **Applied**
  - **Interviewing**
  - **Offer Received!**
  - **Archived / Closed**
- **Export to CSV**: Download your application tracking spreadsheet anytime with one click.

---

### 6. Curated Global Research Fellowships
Deep-dive guides with timeline and funding breakdown:
- **CERN Summer Student Programme** (Geneva, Switzerland - CHF 91/day + Airfare)
- **DAAD WISE** (Germany - €934/month + €1,050 travel grant + Health Insurance)
- **Mitacs Globalink** (Canada - CAD $8,000+ package + $15k Master's fellowship)
- **ETH Zurich Summer Research Fellowship** (Switzerland - CHF 1,750/mo + Airfare)
- **EPFL Summer Research** (Switzerland - CHF 1,800/mo + Airfare)
- **S.N. Bose Scholars Program** (US Premier Universities - $3,500 + Airfare)
- **A*STAR SIP** (Singapore - SGD $1,500 - $2,000/mo)

---

### 7. Engineering Career & Outreach Toolkit
- **Cold Email Templates**: Ready-to-copy email templates for contacting international professors and industry recruiters.
- **ATS Resume Checklist**: The Google XYZ formula, technical skills grouping, and formatting guidelines.
- **Engineering Portfolio Advice**: Instructions on building GrabCAD / KiCad / GitHub / Revit portfolios for non-CS disciplines.

---

### 8. Post an Internship / Community Submissions
- Recruiters and students can submit new national or international openings.
- Submissions are validated and instantly added to the directory and preserved in `localStorage`.

---

### 9. Dark Mode & Modern UI
- Clean glassmorphism design powered by Tailwind CSS.
- Smooth dark/light mode toggle with preference persistence.

---

## 🏃 How to Run the Website

### Option 1: Double-Click (Zero Setup Required)
Simply double-click `start.bat` or open `index.html` directly in any web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Option 2: Local PowerShell Web Server
In PowerShell, run:
```powershell
.\serve.ps1
```
This starts a lightweight web server on `http://localhost:8080` and opens it automatically.

---

## 📂 Project Structure

```
eng-internships/
├── index.html       # Single Page Application structure with semantic components
├── data.js          # 24+ Detailed real-world engineering listings & fellowships
├── app.js           # Filtering engine, state management, tracker & local storage
├── styles.css       # Custom styling, animations, glassmorphism, print styles
├── serve.ps1        # Pure PowerShell zero-dependency HTTP server
├── start.bat        # 1-click launcher for Windows
└── README.md        # Documentation and guide
```

---

## 🚀 Free Hosting & Deployment

You can host this website online for free in under 1 minute:
- **GitHub Pages**: Push this directory to a GitHub repository, go to `Settings > Pages`, and select `Deploy from Branch (main)`.
- **Vercel / Netlify**: Drag and drop the `eng-internships` folder directly onto [Netlify Drop](https://app.netlify.com/drop) or deploy via Vercel.
