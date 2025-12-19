# PepsiCo 3D Animation & E-commerce App

A modern, full-stack e-commerce application featuring immersive 3D animations and a robust admin dashboard. Built with Angular for the frontend and Node.js/Express for the backend.

## 🚀 Features

- **Immersive 3D Experience**: Interactive 3D product showcase using Three.js and GSAP.
- **Full-Stack E-commerce**: Product management, user authentication, and shopping cart functionality.
- **Admin Dashboard**: Comprehensive tools for managing products, categories, and viewing system status.
- **Responsive Design**: Fully optimized for various screen sizes with Tailwind CSS.
- **Secure Authentication**: JWT-based authentication for users and admins.

## 🛠️ Tech Stack

**Frontend:**
- Angular 17
- Three.js (3D Graphics)
- GSAP (Animations)
- Tailwind CSS (Styling)
- Stripe JS (Payment Integration)

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Token (JWT)
- Multer (File Uploads)
- Stripe (Payment Processing)

## 📁 Project Structure

```text
demo-3d-animation/
├── frontend/           # Angular application
│   ├── src/
│   │   ├── app/        # Components, Services, Models
│   │   └── assets/     # Images, 3D Models
│   └── ...
├── backend/            # Express application
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth and validation
│   └── ...
└── README.md           # Main project documentation
```

## 🚥 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd demo-3d-animation
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

3. **Backend Setup:**
   ```bash
   cd ../backend
   npm install
   ```

### Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Running the Application

1. **Start the Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm start
   ```

The application will be available at `http://localhost:4200` (Frontend) and `http://localhost:5000` (Backend API).

## 📄 License

This project is licensed under the MIT License.
