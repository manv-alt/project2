# Fix 401 Refresh/CART Errors - Progress Tracker

## Plan Steps (Approved by User):
1. ~~✅ Understand issue via file reads/searches~~
2. 📝 Create TODO.md
3. ✅ Updated server/Controllers/userctrl.js (support body/cookie refresh)
4. ✅ Updated server/Routes/user.js (POST /auth/refresh)
5. ✅ Updated client/src/lib/axios.js (add interceptor, baseURL, withCredentials)
6. ✅ Updated client/src/context/AuthContext.jsx (POST refresh)
7. ✅ Created client/.env (VITE_API_URL) and server/.env.example
8. 🧪 Local test: Backend `cd server && npm start`, Frontend `cd client && npm run dev`
9. 🚀 Deploy & test Render prod
10. ✅ Verify cart refreshes on 401, close task

**Status: Code complete! Ready for test (step 8). Push to deploy Render.**

