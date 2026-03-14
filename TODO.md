# Fix 401 Refresh/CART Errors - FINAL IMPLEMENTATION PLAN

## Status: ✅ PLAN APPROVED - Starting Implementation

**Root Cause:** 
- axios interceptor refresh POST('/auth/refresh') misses baseURL → wrong endpoint on prod
- No VITE_API_URL env → localhost on Render  
- Possible CORS cookie issues

## Implementation Steps:

### 1. 🔧 Fix Client Axios Interceptor [✅ UPDATED]
`client/src/lib/axios.js`
- Change interceptor `axios.post('/auth/refresh')` → `api.post('/auth/refresh')`

### 2. 🌐 Create Production Env [✅ CREATED]
`client/.env`
```
VITE_API_URL=https://project2-oz9n.onrender.com/api
```

### 3. 🛡️ Update Server CORS [PENDING]  
`server/index.js`
- Add Vercel/Render frontend origins

### 4. 🔑 Server Env Template [✅ CREATED]
`server/.env.example`
```
JWT_ACCESS_SECRET=your_strong_access_secret_key_here
JWT_REFRESH_SECRET=your_strong_refresh_secret_key_here  
# ... other vars
```

### 5. 📝 Progress Tracking [PENDING]
- Update this TODO.md after each step

### 6. 🧪 Testing
```
# Terminal 1  
cd server && npm start

# Terminal 2  
cd client && npm run dev
```
- Test login → cart → logout → refresh → auto-login works

### 7. 🚀 Production Deploy
```
git add .
git commit -m 'fix: resolve 401 auth refresh loop prod'
git push origin main
```
- Render auto-deploys
- Clear browser localStorage
- Test https://project2-oz9n.onrender.com cart functionality

### 8. ✅ Verify Fixed
- No more 401 console errors
- Cart loads after page refresh
- Auto token refresh works

**Next Step:** Update axios.js interceptor
