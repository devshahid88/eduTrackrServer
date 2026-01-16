# EduTrackr Architecture Documentation

This document explains the **Clean Architecture** and **SOLID Principles** implemented in the EduTrackr project, along with the reasoning behind using **Entities** and **Mappers**.

---

## 1. Clean Architecture

Clean Architecture is a software design philosophy that separates concerns by dividing the system into several layers. The primary goal is to create a system that is:
- **Independent of Frameworks**: The business logic is not coupled to a specific library (e.g., Express, Mongoose).
- **Testable**: Business rules can be tested without the UI, Database, or any other external element.
- **Independent of UI**: The UI can change easily without changing the rest of the system.
- **Independent of Database**: You can swap MongoDB for PostgreSQL without touching business logic.

### The Layers in EduTrackr

Our project is structured as follows:

1.  **Domain Layer (`src/domain`)**:
    *   The core of the application.
    *   Contains **Entities** (e.g., `Teacher`, `Student`) and business rules.
    *   It has *zero* dependencies on other layers.
2.  **Application Layer (`src/application`)**:
    *   Contains **Use Cases** (interactors) and **Interfaces**.
    *   Defines *what* the system does (e.g., `CreateTeacher`, `LoginUser`).
    *   Orchestrates the flow of data to and from entities.
3.  **Infrastructure Layer (`src/infrastructure`)**:
    *   Contains implementations of interfaces defined in the application layer.
    *   Handles external tools like Database (Mongoose models), Mail services, and **Mappers**.
4.  **Interface Layer (`src/interface`)**:
    *   The entry point of the system.
    *   Contains **Controllers**, **Routes**, and **Middlewares**.
    *   Converts HTTP requests into a format the Use Cases can understand.

---

## 2. SOLID Principles

SOLID is an acronym for five design principles intended to make software designs more understandable, flexible, and maintainable.

### **S - Single Responsibility Principle (SRP)**
A class should have one, and only one, reason to change.
*   *Example*: `TeacherRepository` only handles database operations for Teachers. It doesn't handle password hashing or sending emails; those are separate responsibilities.

### **O - Open/Closed Principle (OCP)**
Software entities should be open for extension, but closed for modification.
*   *Example*: Using interfaces allows us to add new implementations (like a `PostgresTeacherRepository`) without modifying the Use Cases that consume them.

### **L - Liskov Substitution Principle (LSP)**
Subtypes must be substitutable for their base types.
*   *Example*: `TeacherRepository` extends `BaseRepository`. Any code expecting a `BaseRepository` should work perfectly with `TeacherRepository`.

### **I - Interface Segregation Principle (ISP)**
Clients should not be forced to depend on methods they do not use.
*   *Example*: Instead of one giant `IRepository`, we have specific interfaces like `ITeacherRepository`, `IStudentRepository`, etc.

### **D - Dependency Inversion Principle (DIP)**
High-level modules should not depend on low-level modules. Both should depend on abstractions.
*   *Example*: A Use Case depends on `ITeacherRepository` (an interface), not on the concrete `TeacherRepository` (Mongoose implementation). This allows us to "inject" the repository at runtime.

---

## 3. The Need for Entity and Mapper

This is often the most confusing part for developers moving from "MVC" to "Clean Architecture".

### **What is an Entity?**
An **Entity** (`src/domain/entities/Teacher.ts`) is a plain TypeScript class that represents a business concept in its purest form. It is **not** a database model.
*   It contains only the properties and logic relevant to the business.
*   It is decoupled from the database schema.

### **What is a Mapper?**
A **Mapper** (`src/infrastructure/mappers/TeacherMapper.ts`) is a utility that translates data between two different formats:
1.  **Database Model (`ITeacherDocument`)** <---> **Domain Entity (`Teacher`)**
2.  **Domain Entity** <---> **Data Transfer Object (DTO)**

### **Why do we need them?**
1.  **Decoupling**: If you change your MongoDB schema (e.g., renaming `email` to `user_email`), you only need to update the Mapper and the Model. Your business logic (Use Cases and Entities) remains untouched.
2.  **Data Integrity**: Entities can have logic to ensure they are always in a valid state (e.g., ensuring a teacher must have a department).
3.  **Hiding Implementation Details**: Database models often have extra fields like `__v`, `_id` (as an object), or passwords that you might not want to expose throughout the app. The Mapper handles converting `_id` to a string `id` and cleaning up the data.
4.  **Handling Relationships**: A Mapper can take a populated Mongoose document and flatten it into a simple property in the Entity (e.g., converting a populated `department` object into a `departmentName` string).


### Example Workflow:
1.  **Request** comes into `TeacherController`.
2.  Controller calls a **Use Case**.
3.  Use Case calls `TeacherRepository.findTeacherById(id)`.
4.  The Repository queries the **Mongoose Model** (`teacherModel`).
5.  Mongoose returns a **Document**.
6.  The Repository uses **`TeacherMapper.toDomain(doc)`** to convert the Document into a **`Teacher` Entity**.
7.  The Use Case performs logic on the **Entity** and returns it.
8.  The Controller sends the result back to the user.

---

## Summary Table

| Component | Responsibility | Layer |
| :--- | :--- | :--- |
| **Entity** | Core Business Concept | Domain |
| **Use Case** | Business Logic Flow | Application |
| **Controller** | Handling HTTP Requests | Interface |
| **Repository**| Data Persistence | Infrastructure |
| **Model** | Database Schema | Infrastructure |
| **Mapper** | Data Transformation | Infrastructure |

