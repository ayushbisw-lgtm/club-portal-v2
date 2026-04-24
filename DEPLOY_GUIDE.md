# 🚀 How to Keep Your Node.js Server Running 24/7

To make your server work 24/7, you have two main options: **Cloud Hosting** (Recommended) or **Local Persistent Hosting**.

---

## 1. Cloud Hosting (Best for 24/7)
Cloud platforms keep your server running even when your computer is turned off.

### **Option A: Vercel (Easiest)**
Since you already have a `vercel.json` file, you are ready for Vercel.
1. Create a free account at [vercel.com](https://vercel.com).
2. Install Vercel CLI: `npm install -g vercel`.
3. Run `vercel` in your project folder.
4. **Note:** Vercel is "Serverless," meaning it's great for APIs but might reset your `database.db` and `json` files on every deployment. For persistent data, use a cloud database (like MongoDB or Supabase).

### **Option B: Render.com (Supports Databases)**
Render is excellent for apps that use local files like `database.db`.
1. Create a free account at [render.com](https://render.com).
2. Connect your GitHub repository.
3. Choose **Web Service**.
4. Set Build Command: `npm install`.
5. Set Start Command: `node server.js`.
6. **Important:** To keep your files (like `database.db` and `uploads/`) safe, you should add a "Disk" in Render settings.

---

## 2. Local Persistent Hosting (Keep your PC on)
If you want to run it from your own computer 24/7, use **PM2 (Process Manager 2)**. This ensures the server restarts automatically if it crashes or if your computer reboots.

### **Setup PM2:**
1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```
2. Start your server with PM2:
   ```bash
   pm2 start server.js --name "club-server"
   ```
3. Make it start on Windows boot:
   - Install `pm2-windows-startup`:
     ```bash
     npm install -g pm2-windows-startup
     pm2-startup install
     ```
   - Save the current process list:
     ```bash
     pm2 save
     ```

---

## 3. Important: Handling Data
When running 24/7 on the cloud:
- **Local files** (`database.db`, `projects.json`) will be erased whenever the server restarts on most free cloud providers.
- **Solution:** Use the **GitHub Sync** feature we built! It will push your data to GitHub so it stays safe.
- **Better Solution:** Use a real cloud database like **MongoDB Atlas** or **Supabase** for permanent storage.

---

## 4. Keeping the Tunnel Alive
If you use **Ngrok** for your public link:
- Ensure you have a free Ngrok account and are authenticated.
- Use the provided [START_ALL.bat](file:///e:/club/New%20folder/START_ALL.bat) to keep both the server and tunnel running together.
