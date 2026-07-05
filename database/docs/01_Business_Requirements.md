Real Estate CRM SaaS

Business Requirements Document (BRD)

Version: 1.0
Project Owner: Nethravathi
Prepared By: Nethravathi
Document Status: Draft
Last Updated: July 2026

1. Project Vision
Vision

To build a modern cloud-based Real Estate CRM SaaS platform that enables real estate companies to efficiently manage their complete sales lifecycle—from lead generation to booking, payment tracking, customer relationship management, employee performance, and business analytics.

The system must be scalable, secure, mobile-friendly, and capable of serving multiple companies from a single platform.


2. Project Objectives

The CRM should help companies:

Capture leads from multiple sources
Assign leads automatically or manually
Manage telecalling teams
Track every customer interaction
Schedule follow-ups with reminders
Manage site visits
Convert leads into bookings
Track customer payments
Manage projects and inventory
Monitor employee performance
Generate real-time reports
Support mobile users
Support multiple companies on one platform

3. Product Goals
Business Goals
Reduce lead leakage
Increase sales conversion
Improve employee productivity
Centralize customer data
Provide management dashboards
Automate repetitive work
Enable decision-making using reports
Technical Goals
Fast response time
High security
Scalable architecture
Cloud deployment
Mobile-first experience
API-driven backend
Modular design
Easy maintenance

4. Target Customers

The software is designed for:

Real Estate Developers
Builders
Construction Companies
Property Consultants
Channel Partners
Sales Agencies
Real Estate Marketing Companies
5. Deployment Model

The application will be delivered as SaaS (Software as a Service).

One platform will support multiple companies while keeping each company's data completely isolated.

Example:

CRM Platform

├── Company A
├── Company B
├── Company C
├── Company D
└── Company E

Each company will have:

Independent login
Independent employees
Independent customers
Independent projects
Independent reports
Independent settings
6. Supported Platforms
Web
Google Chrome
Microsoft Edge
Mozilla Firefox
Safari
Mobile
Android
iPhone
Tablet

7. Technology Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
Material UI (or similar)
Backend
Node.js
Express.js
JWT Authentication
Database
PostgreSQL
Mobile
React Native
Storage
AWS S3
Deployment
AWS EC2
Nginx
Docker (future)
GitHub Actions (future)
8. User Roles

The platform will support the following roles.

SaaS Owner

Controls the complete platform.

Responsibilities:

Create companies
Manage subscriptions
View all companies
Platform analytics
Global settings

Company Admin

Responsible for one company.

Responsibilities:

Manage branches
Manage users
Manage projects
Assign leads
View reports
Configure company settings
Branch Manager

Responsible for branch operations.

Responsibilities:

Manage branch employees
Assign leads
Review performance
Approve activities

Team Leader

Responsible for a team.

Responsibilities:

Assign work
Review follow-ups
Monitor telecallers
Track performance
Telecaller

Responsibilities:

View assigned leads
Make calls
Update call status
Schedule follow-ups
Send WhatsApp messages
Record call outcomes

Sales Executive

Responsibilities:

Conduct site visits
Update visit status
Convert bookings
Collect customer information
Receptionist

Responsibilities:

Register walk-in customers
Add enquiries
Schedule meetings

Accountant

Responsibilities:

Record payments
Generate receipts
View pending dues
HR

Responsibilities:

Manage employees
Attendance
Leave
Performance
9. High-Level Modules

Version 1.0 will include:

Authentication
Dashboard
Company Management
Branch Management
Employee Management
Lead Management
Call Management
Follow-up Management
Customer Management
Property Management
Site Visit Management
Booking Management
Payment Management
Reports
Notifications
Settings

10. Success Criteria

The product will be considered successful when it:

Supports multiple companies securely
Handles thousands of leads efficiently
Provides reliable dashboards and reports
Works on web and mobile
Enables role-based access control
Can be deployed on AWS
Is ready to be licensed to multiple real estate companies

11. Complete Business Workflow

This chapter explains how the CRM works from the moment a lead enters the system until a sale is completed.

11.1 Lead Life Cycle

Lead Created
      │
      ▼
Lead Assigned
      │
      ▼
Telecaller Calls Customer
      │
      ▼
Call Outcome Selected
      │
      ▼
Next Follow-up Scheduled
      │
      ▼
Reminder Notification
      │
      ▼
Customer Interested?
      │
 ┌───────────────┐
 │               │
 │YES            │NO
 │               │
 ▼               ▼
Site Visit     Closed
      │
      ▼
Booking
      │
      ▼
Payment
      │
      ▼
Completed Customer

11.2 Lead Sources

The CRM should support leads from multiple sources.

Manual
Walk-in
Phone Call
Referral
Digital
Website
Facebook
Instagram
Google Ads
WhatsApp
MagicBricks
99acres
Housing.com
CommonFloor
NoBroker
Property Portal API
CSV Import
Excel Upload

Company Admin can create additional lead sources.

11.3 Lead Status

Every lead must have one status.

Example statuses:

New

Assigned

Not Contacted

Attempted

Connected

Interested

Site Visit Scheduled

Visited

Negotiation

Booked

Lost

Duplicate

Invalid

Status history should never be deleted.

Every change must be stored.

11.4 Call Outcomes

After every call, the employee must select an outcome.

Examples:

Connected

No Answer

Busy

Switched Off

Wrong Number

Call Back Later

Interested

Not Interested

Language Barrier

Duplicate

Invalid Lead
11.5 Mandatory Follow-up

This is one of the most important business rules.

If a call outcome is:

Connected
Interested
Call Back Later

Then the employee must select:

Next Follow-up Date
Next Follow-up Time
Follow-up Notes

The system should not allow saving the call without these details.

11.6 Automatic Reminder

The system should automatically notify users:

Dashboard
Today's Follow-ups
Overdue Follow-ups
Upcoming Follow-ups
Mobile
Push Notification
Future Version
WhatsApp Reminder
Email Reminder
SMS Reminder
11.7 Lead Assignment

Only authorized users can assign leads.

Supported methods:

Manual Assignment

Company Admin selects:

Employee
Team
Branch
Automatic Assignment

Future versions may support:

Round Robin
Least Loaded Employee
Skill Based Assignment
11.8 Customer Timeline

Every activity should be stored.

Example:

01 Jul
Lead Created

02 Jul
Assigned to Ravi

02 Jul
Call Made

03 Jul
Follow-up Scheduled

05 Jul
Site Visit Scheduled

07 Jul
Site Visit Completed

10 Jul
Booking Completed

Nothing should be deleted from the timeline.

11.9 Duplicate Detection

Before creating a lead, the CRM should check:

Phone Number
Email

If a duplicate is found:

Warn the user
Allow opening the existing record
Prevent accidental duplicates
11.10 Lead Ownership

Each lead belongs to:

Company
Branch
Assigned Employee
Team (optional)
Project (optional)

Ownership changes should be tracked with a complete audit history.

12. Lead Data Fields

The Lead entity should include:

Basic Details
Full Name
Phone 1
Phone 2
Phone 3
Email
Property Interest
Project
Property Type
Unit Type
Budget
Preferred Location
Preferred Size (sq ft)
Marketing
Lead Source
Campaign
Medium
Assignment
Branch
Department
Team
Assigned Employee
CRM
Lead Status
Priority
Last Contact Date
Next Follow-up Date
Next Follow-up Time

13. Property Management Module
13.1 Purpose

The Property Management module manages all real estate inventory, including projects, towers, blocks, floors, units, pricing, availability, and amenities.

The CRM should allow each company to manage multiple projects across multiple branches.

13.2 Property Hierarchy
Company
│
├── Branch
│
├── Project
│      │
│      ├── Phase (Optional)
│      │
│      ├── Tower / Block
│      │
│      ├── Floor
│      │
│      ├── Unit
│      │
│      └── Parking

Example:

ABC Developers

Bangalore Branch

Green Valley Project

Tower A

Floor 7

Flat A-703
13.3 Project Information

Each project should include:

Basic Information
Project Name
Project Code
Project Type
RERA Number
Description
Location
Address
City
State
Country
Postal Code
Google Map Location
Sales
Launch Date
Possession Date
Status
Media
Images
Brochure PDF
Videos
Master Plan
13.4 Unit Details

Each property unit should contain:

Unit Number
Tower
Floor
Property Type
Configuration
Super Built-up Area
Carpet Area
Balcony Area
Facing
Price
PLC Charges
GST
Parking
Availability Status
13.5 Unit Status

Supported statuses:

Available

Blocked

Booked

Sold

Cancelled

Reserved
13.6 Amenities

Each project may include:

Club House
Swimming Pool
Gym
Children's Play Area
Garden
Security
Power Backup
Lift
CCTV
Party Hall
13.7 Documents

Projects should allow uploading:

Brochure
Floor Plan
Price List
Legal Documents
RERA Certificate
Images
Videos
14. Site Visit Management
Purpose

Track every customer visit to a project.

Site Visit Workflow
Lead

↓

Interested

↓

Visit Scheduled

↓

Executive Assigned

↓

Visit Completed

↓

Feedback

↓

Booking

OR

Next Follow-up
Site Visit Information

Every visit should store:

Customer
Name
Phone
Email
Visit
Visit Date
Visit Time
Meeting Location
Project
Employees
Telecaller
Sales Executive
Receptionist
Customer Feedback
Interested
Negotiation
Not Interested
Remarks

Unlimited notes.

Visit Status
Scheduled

Confirmed

Visited

Cancelled

Rescheduled

No Show
15. Booking Management
Booking Workflow
Lead

↓

Visit

↓

Negotiation

↓

Booking

↓

Agreement

↓

Payment

↓

Completed
Booking Details

The booking screen should include:

Customer
Name
Phone Numbers
Email
Property
Project
Tower
Unit
Area
Price
Booking
Booking Number
Booking Date
Booking Amount
Discount
Final Price
Sales
Telecaller
Sales Executive
Branch
Status
Booked
Cancelled
Refunded
Completed
Booking Documents

Upload support for:

Booking Form
Customer ID
PAN
Aadhaar
Sale Agreement
Payment Receipts
16. Payment Management

Each booking should support multiple payments.

Example:

Booking

↓

Advance

↓

Installment 1

↓

Installment 2

↓

Final Payment
Payment Details

Each payment includes:

Payment Date
Amount
Payment Mode
Reference Number
Received By
Remarks
Payment Modes

Supported methods:

Cash
UPI
Bank Transfer
Cheque
Credit Card
Debit Card
NEFT
RTGS
Pending Payment Dashboard

Management should see:

Total Pending Amount
Overdue Payments
Today's Collections
Monthly Collections
17. Dashboard Requirements

The dashboard should provide real-time information with date filters.

Lead Metrics
New Leads
Total Leads
Assigned Leads
Converted Leads
Lost Leads
Call Metrics
Calls Made
Connected Calls
Missed Calls
Average Call Duration
Follow-up Metrics
Today's Follow-ups
Overdue Follow-ups
Completed Follow-ups
Visit Metrics
Scheduled Visits
Completed Visits
Cancelled Visits
Booking Metrics
Total Bookings
Booking Value
Booking Conversion Rate
Revenue Metrics
Collections
Pending Amount
Monthly Revenue
Employee Metrics
Telecaller Performance
Sales Executive Performance
Attendance
Login Status
Property Metrics
Available Units
Booked Units
Sold Units
Inventory Value
Notifications
Follow-up Reminders
Visit Reminders
Booking Alerts
Payment Due Alerts
Employee Birthdays (optional)
Additional Enterprise Features (Recommended)

These are features I recommend adding to make your CRM competitive:

Workflow Automation
Auto-assign leads based on branch, project, or round-robin.
Escalate overdue follow-ups to managers.
Auto-notify managers when high-value leads are created.
Approval Workflows
Booking approval.
Discount approval.
Payment approval.
Lead transfer approval (optional).
Communication History

Maintain a complete history of calls, WhatsApp messages, emails, SMS, notes, visits, and bookings in a single customer timeline.

Document Management

Allow documents to be attached to leads, visits, bookings, projects, and employee profiles, with version history and role-based access.

18. Notification & Reminder Engine
18.1 Purpose

The Notification Engine ensures that employees never miss important tasks, follow-ups, visits, bookings, or payment collections.

Notifications should be available on both the web application and the mobile app.

18.2 Notification Types
CRM Notifications
New Lead Assigned
Lead Reassigned
New Follow-up
Follow-up Due Today
Overdue Follow-up
Follow-up Completed
Call Notifications
Missed Callback Reminder
Call Not Updated
Daily Call Target Pending
Visit Notifications
Visit Scheduled
Visit Reminder (1 hour before)
Visit Rescheduled
Visit Cancelled
Booking Notifications
Booking Created
Booking Approved
Booking Cancelled
Payment Notifications
Payment Received
Payment Due Today
Overdue Payment
Installment Reminder
Employee Notifications
Attendance Reminder
Leave Approval
New Announcement
Birthday (optional)
18.3 Reminder Rules

The CRM should automatically trigger reminders based on configured business rules.

Example:

Event	Reminder
Follow-up	At scheduled date & time
Site Visit	1 hour before
Payment Due	3 days before due date
Booking Approval	Immediately after booking
18.4 Notification Channels

Version 1.0:

In-App Dashboard
Mobile Push Notifications

Version 2.0:

WhatsApp
SMS
Email

Each company should be able to enable or disable channels.

19. Reports & Analytics
19.1 Dashboard Reports

Management should have access to:

Total Leads
New Leads
Converted Leads
Lost Leads
Lead Conversion Rate
Revenue
Collections
Pending Payments
Employee Performance
Branch Performance
Project Performance

All reports should support:

Date Range Filter
Branch Filter
Project Filter
Employee Filter
Lead Source Filter
19.2 Operational Reports
Lead Reports
Lead Source Analysis
Lead Status Report
Lead Aging Report
Duplicate Lead Report
Telecaller Reports
Calls Made
Connected Calls
Follow-ups Completed
Conversion Rate
Sales Reports
Visits Scheduled
Visits Completed
Bookings
Booking Value
Financial Reports
Payment Collection
Outstanding Dues
Refunds
Revenue by Project
19.3 Export Options

Every report should support:

Excel
PDF
CSV

Role-based permissions should control export access.

20. Employee Attendance & Performance
Attendance

Employees should be able to:

Check In
Check Out

Future enhancements:

GPS validation
Geofencing
Selfie verification
Leave Management

Employees can:

Apply Leave
View Leave Balance
Track Leave Status

Managers can:

Approve
Reject
Performance Metrics

Telecaller KPIs:

Calls Made
Connected Calls
Follow-ups Completed
Leads Converted

Sales Executive KPIs:

Site Visits
Bookings
Revenue Generated

Branch KPIs:

Lead Conversion
Booking Value
Collection Amount
21. Security & Audit
Authentication

Support:

Employee ID Login
Email Login (optional)
Secure Password Storage
JWT Authentication
Refresh Tokens
Account Lock After Repeated Failures
Authorization

Role-based access control (RBAC).

Permissions include:

View
Create
Update
Delete
Export
Approve

Menus and API access should both enforce permissions.

Audit Log

Every important action should be recorded.

Examples:

User Login
User Logout
Lead Created
Lead Updated
Lead Deleted (Soft Delete)
Booking Approved
Payment Recorded
User Permission Changed

Audit entries should include:

User
Date & Time
IP Address
Device
Action
Previous Value
New Value
22. Integrations

Version 1.0:

Click-to-Call Provider
WhatsApp Deep Link
Email (SMTP)
Excel Import/Export

Version 2.0:

WhatsApp Business API
SMS Gateway
Cloud Telephony
Google Calendar
Google Maps
Payment Gateway
Digital Signature
23. Non-Functional Requirements
Performance
Dashboard load: under 3 seconds
Search: under 2 seconds
API response: under 500 ms (typical)
Excel import: up to 50,000 rows
Scalability

Support:

500+ Companies
5,000+ Employees
10 Million+ Leads
100 Million+ Activity Records
Availability

Target uptime:

99.9%
Backup
Daily automatic backups
Point-in-time recovery (where supported)
Security
HTTPS everywhere
Password hashing
Input validation
SQL injection protection
Cross-site scripting protection
CSRF protection where applicable
Rate limiting on authentication
24. Version Roadmap
Version 1.0
Multi-company SaaS
CRM
Property Management
Site Visits
Bookings
Payments
Reports
Notifications
Mobile App
Version 2.0
AI Lead Scoring
AI Call Summaries
WhatsApp Business API
SMS Gateway
Payment Gateway
Digital Signatures
Advanced Workflow Automation
Version 3.0
Channel Partner Portal
Customer Portal
Builder Portal
Predictive Analytics
Voice AI Assistant
Regional Language Support