# 🚀 Aura: Smart E-Commerce Platform

A production-ready, full-stack microservices e-commerce application designed with a premium sleek dark-mode aesthetic. 

## 🏗️ Architecture Stack
* **Frontend Storefront**: Next.js 16 (Turbopack), React 19, Tailwind CSS, ShadCN UI, Framer Motion
* **Customer API**: FastAPI (Python 3), SQLAlchemy, JWT Authentication, pbkdf2_sha256 Hashing
* **Admin Control Panel**: Django, Django ORM
* **Central Database**: SQLite (Development) / PostgreSQL-ready (Production)

---

## ✅ Completed Deliverables Matrix

### 👤 User Panel & Storefront
- [x] **Premium UI/UX**: Custom CSS transitions, Framer Motion, sleek dark-mode aesthetic with interactive gradients.
- [x] **Next.js Structure**: Fully responsive routing for `/auth/login`, `/auth/register`, `/profile`, `/categories`, and `/orders`.
- [x] **Authentication**: Secure JWT tokens, password hashing, and login/register integration directly from the UI.
- [x] **Product Navigation**: Categorization browsing, catalog rendering.
- [x] **Checkout & Orders**: Orders tracking dashboard (`/orders`), dynamic total calculations.

### 🛠️ Admin Control Panel (Django)
- [x] **Robust ORM Sync**: Django and FastAPI natively share the same centralized database (`ecommerce.db`).
- [x] **User Management**: Unified customer vs admin roles.
- [x] **Content Management**: Category curation, Product tracking, pricing adjustments.

### 📁 Technical Deliverables
1. [x] **Source Code**: Complete separate directories for `frontend`, `backend-api`, and `backend-admin`.
2. [x] **Database Schema**: Unified tracking in centralized SQLite DB.
3. [x] **Postman Collection**: `Aura_Postman_Collection.json` provided in root.
4. [x] **Documentation**: This robust `README.md`.
5. [x] **Docker Compose**: Pre-configured `docker-compose.yml` mapped in root.

---

## 💻 Quick Start Launch Instructions

To launch the entire platform concurrently:

1. **Terminal 1 (Next.js Storefront):**
   ```bash
   cd frontend
   npm run dev
   ```
2. **Terminal 2 (FastAPI Customer Backend):**
   ```bash
   cd backend-api
   source env/bin/activate
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
3. **Terminal 3 (Django Admin Panel):**
   ```bash
   cd backend-admin
   source venv/bin/activate
   python manage.py runserver 8001
   ```

* **Live Storefront**: `http://localhost:3000`
* **Swagger API Docs**: `http://localhost:8000/docs`
* **Admin Dashboard**: `http://localhost:8001/admin`

*Default seeded Admin:* User: `admin` / Password: `admin123`

---

*System conceptualized and architected entirely for scale, security, and elegance by Antigravity.*
