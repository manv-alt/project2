# Client-Server Sync Fix (Localhost) Complete ✅

**All Changes Applied:**
- ✅ axios.js: Auth header + refresh fix
- ✅ client/.env: Correct API/Socket URLs  
- ✅ userctrl.js: Cookie settings for local dev

**PRODUCTION FIX (Render/Vercel):**
1. **Vercel Project Settings → Environment Variables:**
   ```
   VITE_API_URL=https://project2-oz9n.onrender.com/api
   VITE_SOCKET_URL=https://project2-oz9n.onrender.com
   ```

2. **Render server/.env:**
   ```
   NODE_ENV=production
   JWT_ACCESS_SECRET=your_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   EMAIL_USER=your_gmail
   EMAIL_PASS=your_app_pass
   ```

3. Redeploy both.

**Local Test:**
```
cmd /c "cd client && npm run dev"
cmd /c "cd server && npm start"
```
Login → Network tab should show `Authorization: Bearer ...`

**401 Refresh Loop:** Deployed Render server missing env vars/secrets. Refresh endpoint rejects invalid/missing refreshToken cookie.

