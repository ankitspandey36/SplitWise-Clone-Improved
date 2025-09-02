# Splitit - Improved Version  

[![GitHub License](https://img.shields.io/github/license/ankitspandey36/SplitWise-Clone-Improved)](https://github.com/ankitspandey36/SplitWise-Clone-Improved/blob/main/LICENSE)  
[![GitHub Repo size](https://img.shields.io/github/repo-size/ankitspandey36/SplitWise-Clone-Improved)](https://github.com/ankitspandey36/SplitWise-Clone-Improved)  
[![GitHub last commit](https://img.shields.io/github/last-commit/ankitspandey36/SplitWise-Clone-Improved)](https://github.com/ankitspandey36/SplitWise-Clone-Improved/commits/main)  
[![GitHub issues](https://img.shields.io/github/issues/ankitspandey36/SplitWise-Clone-Improved)](https://github.com/ankitspandey36/SplitWise-Clone-Improved/issues)  

---

## 📖 Introduction  

**SplitWise Clone - Improved Version** is a full-stack expense-sharing application that helps you manage both personal and group expenses effortlessly.  
Track your individual spending or create groups with friends, family, or colleagues to manage shared costs.  

Managing finances together has never been easier! 🚀  

---

## ✨ Key Features  

- **Dual Expense Modes** → Log **personal** (ungrouped) expenses or create **shared** (grouped) expenses.  
- **Flexible Splitting** → Split **equally**, **unequally**, or by **shares**.  
- **Real-Time Chat** → Integrated group chat using Socket.IO.  
- **Instant Payments** → Pay directly via Razorpay.  
- **Live Status Tracking** → See who has cleared their expense in real time.  
- **Activity Log** → Complete transaction, edit, and payment history.  
- **Secure Authentication** → Protected with JWT & bcrypt.  

---

## 🛠 Tech Stack  

**Frontend:** React, Tailwind CSS, Redux  
**Backend:** Node.js, Express.js, MongoDB  
**Authentication:** JSON Web Tokens (JWT), bcrypt  
**Payments:** Razorpay  
**Real-time Communication:** Socket.IO  
**APIs:** REST APIs  

---

## 📂 Folder Structure  

```
SplitWise-Clone-Improved/
│
├── frontend/       # React frontend
│   ├── src/
│   └── package.json
│
├── backend/        # Node.js + Express backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## ⚙️ Requirements  

- Node.js & npm  
- MongoDB (local or MongoDB Atlas)  
- Code Editor (VS Code recommended)  

---

## 🚀 Installation  

1. **Clone the repository**  
   ```bash
   git clone https://github.com/ankitspandey36/SplitWise-Clone-Improved.git
   cd SplitWise-Clone-Improved
   ```

2. **Install dependencies for backend**  
   ```bash
   cd backend
   npm install
   ```

3. **Install dependencies for frontend**  
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**  
   - Rename `.env.example` → `.env` inside both `frontend/` and `backend/`.  
   - Add values for:  
     - `MONGO_URI`  
     - `JWT_SECRET`  
     - `RAZORPAY_KEY_ID`  
     - `RAZORPAY_SECRET`  
     - etc.  

5. **Run the project**  
   - Start backend server:  
     ```bash
     cd backend
     npm run dev
     ```
   - Start frontend:  
     ```bash
     cd ../frontend
     npm start
     ```

---

## 🎮 Usage  

1. Sign up or log in.  
2. Add your profile details (UPI ID).  
3. Create a group and invite friends.  
4. Add expenses with descriptions, amounts, and splitting methods.  
5. Track balances and chat in real-time.  
6. Settle up instantly with Razorpay.  
7. View the **activity log** for your history.  

---

## 🤝 Contributing  

We welcome contributions from the community! 🎉  
- Fork the repository  
- Create a feature branch (`git checkout -b feature-name`)  
- Commit changes (`git commit -m "Added feature"`)  
- Push (`git push origin feature-name`)  
- Open a Pull Request  

Refer to [CONTRIBUTING.md](CONTRIBUTING.md) for details.  

---

## 📜 License  

This project is licensed under the [MIT License](LICENSE).  

---

## 📸 Screenshots (Coming Soon)  

_Add screenshots or GIFs here to showcase UI/UX._  

---

Enjoy managing finances with **SplitWise Clone - Improved Version** 🎉  
Feel free to share feedback by opening an [issue](https://github.com/ankitspandey36/SplitWise-Clone-Improved/issues) or submitting a PR 🚀  
