# Deploy Inursly on Azure (with $100 credit)

Use Azure for **MySQL**, **backend API**, and **frontend**. Your $100 credit is enough to run everything on low-cost tiers.

---

## What you’ll create

| Resource | Purpose | Rough cost (use credit) |
|----------|---------|--------------------------|
| **Azure Database for MySQL – Flexible Server** | Database | ~$15–30/mo (Burstable B1ms or similar) |
| **App Service** (Node) | Backend API | Free F1 or low-cost B1 |
| **Static Web App** or **App Service** (static) | React frontend | Free tier available |

---

## If MySQL Flexible Server deployment fails (“terminal provisioning state Failed”)

This error is common and usually **not** caused by your form inputs. Try in this order:

1. **Use a different region**  
   Some regions have capacity or transient issues. Delete the failed server (if it appears in the resource group), then create a **new** Flexible Server and choose another region (e.g. **East US**, **East US 2**, **West US 2**, **Central US**). Avoid regions that often have issues (e.g. UK South, North Europe) unless you need them.

2. **Register the MySQL resource provider**  
   In [Azure Cloud Shell](https://portal.azure.com/#cloudshell) (or local Azure CLI) run:
   ```bash
   az provider register --namespace Microsoft.DBforMySQL
   az provider show --namespace Microsoft.DBforMySQL --query "registrationState"
   ```
   Wait until it says `Registered`, then try creating the server again.

3. **Password rules**  
   Admin password must be 8–128 characters and include uppercase, lowercase, a number, and a special character (e.g. `MyStr0ng!Pass`).

4. **Get the real error (optional)**  
   In Cloud Shell:
   ```bash
   az deployment operation group list --resource-group inursly-rg --name MySqlFlexibleServer_dd6056900ed411f1ae7a034434b09372 --query "[].properties.statusMessage" -o tsv
   ```
   Replace the deployment name if yours is different (see your error’s `target`). The status message often gives the actual reason (quota, region, etc.).

5. **Use a different MySQL option**  
   If Flexible Server keeps failing, use **PlanetScale** or **Railway** for MySQL and deploy only the **backend + frontend** on Azure (App Service + Static Web App). See [DEPLOY_RENDER_GITHUB.md](./DEPLOY_RENDER_GITHUB.md) for cloud MySQL setup; the backend env vars are the same.

---

## Step 1: Create a MySQL database on Azure

1. Go to [Azure Portal](https://portal.azure.com) and sign in.
2. Search for **“Azure Database for MySQL”** or **“MySQL flexible servers”**.
3. Click **Create** → **MySQL Flexible Server**.
4. Fill in:
   - **Subscription**: your subscription (with $100 credit).
   - **Resource group**: create new, e.g. `inursly-rg`.
   - **Server name**: e.g. `inursly-mysql` (must be globally unique; try a new name if you retry, e.g. `inursly-db2`).
   - **Region**: pick one that’s known to work (e.g. **East US**, **East US 2**, **West US 2**).
   - **Workload type**: Development (to keep cost lower).
   - **Compute + storage**: e.g. **Burstable B1ms** (or smallest available), 20 GiB storage.
   - **Authentication**: MySQL authentication (not Azure AD for simplicity).
   - **Admin username**: e.g. `inurslyadmin`.
   - **Password**: 8–128 chars, upper + lower + number + special character (e.g. `MyStr0ng!Pass`).
5. **Networking**:
   - Under “Firewall rules”, add **“Allow public access from any Azure service within Azure to this server”** (so App Service can connect).
   - Optionally add your own IP so you can connect from MySQL Workbench.
6. Click **Review + create** → **Create**. Wait until the server is deployed.
7. After deployment, open the resource. Go to **Overview** and note:
   - **Server name** (e.g. `inursly-mysql.mysql.database.azure.com`) → use as `DB_HOST`.
   - **Server admin login** → use as `DB_USER`.
   - You already have the password → `DB_PASSWORD`.
   - Default database is often `flexibleserverdb` or you can create one (see below) → `DB_NAME`.

**Create the app database (if needed):**

- In the left menu, open **Databases** or use a client (see Step 2). Create a database named `doctor_appointment` if your server didn’t create it. You can do this in MySQL Workbench after connecting.

---

## Step 2: Create tables (using MySQL Workbench)

1. In Azure Portal, open your MySQL server → **Networking** (or **Connection security**). Ensure **“Allow public access”** is enabled and your IP (or 0.0.0.0 for testing) is allowed.
2. Open **MySQL Workbench** on your PC.
3. **New connection**:
   - **Host**: `inursly-mysql.mysql.database.azure.com` (your server name from Step 1).
   - **Port**: `3306`.
   - **Username**: e.g. `inurslyadmin`.
   - **Password**: the one you set.
   - **Default schema**: leave blank or set `doctor_appointment` after creating it.
4. Connect. If it fails, add your IP in Azure MySQL **Networking** / firewall.
5. Run: `CREATE DATABASE IF NOT EXISTS doctor_appointment; USE doctor_appointment;`
6. Open **MYSQL_SETUP.md** in your project and copy the full **“3. Create tables”** SQL (all `CREATE TABLE` and `INSERT INTO specialties`). Paste into Workbench and execute.

Your Azure MySQL is ready. Use the same host, user, password, and database name in the backend.

---

## Step 3: Push code to GitHub (if not already)

- Repo contains your app (e.g. `doctor-appointment` folder or repo root = that folder).
- **Do not** commit `backend/.env` or any real passwords. Use `.gitignore` for `.env`.

---

## Step 4: Create the backend (App Service – Node)

1. In Azure Portal, search **“App Service”** → **Create**.
2. **Basics**:
   - **Subscription**: same as above.
   - **Resource group**: same, e.g. `inursly-rg`.
   - **Name**: e.g. `inursly-api` (will be `inursly-api.azurewebsites.net`).
   - **Publish**: Code.
   - **Runtime**: Node 20 LTS (or 18 LTS).
   - **Region**: same as MySQL.
   - **Plan**: create new → **Free F1** (or **B1** if you want always-on; uses more credit).
3. **Create** and wait for deployment.
4. **Deploy your code from GitHub**:
   - Open the App Service → **Deployment Center**.
   - **Source**: GitHub → authorize and select repo + branch.
   - **Build Provider**: GitHub Actions (or App Service build).
   - If your repo root is the whole project, set **Application source**: path to folder that contains `backend` (e.g. `doctor-appointment` or `/`). The build should run from the folder that has `backend/package.json`.
   - For **Application settings** (see below) you’ll add env vars in Step 5.
5. **Configuration** (env vars):
   - App Service → **Configuration** → **Application settings** → **New application setting**. Add:

   | Name | Value |
   |------|--------|
   | `DB_HOST` | `inursly-mysql.mysql.database.azure.com` (your MySQL server) |
   | `DB_PORT` | `3306` |
   | `DB_USER` | e.g. `inurslyadmin` |
   | `DB_PASSWORD` | your MySQL password (mark as slot setting / secret if available) |
   | `DB_NAME` | `doctor_appointment` |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | (set after Step 5 – your frontend URL, e.g. `https://inursly.azurestaticapps.net`) |
   | `GEMINI_API_KEY` | (optional) your Gemini key for chatbot |

   **Startup command** (so Node runs your app):
   - **Configuration** → **General settings** → **Startup Command**:  
     `cd backend && npm install && npm start`  
     (or if Azure builds from a different path, e.g. `npm install && npm start` from the folder that contains `server.js`).

6. If you use **GitHub Actions** for deploy, the workflow must build and deploy the **backend** (e.g. build `backend`, produce a deployable artifact, or deploy from repo path). If you use **App Service’s built-in** GitHub deploy, set **Repository** and ensure the **project path** points to the folder that has `backend` (e.g. root or `doctor-appointment`), and that the start command runs from `backend`.

7. After saving configuration, the app restarts. Backend URL: `https://inursly-api.azurewebsites.net` (or your App Service name).

---

## Step 5: Create the frontend (Static Web App – free tier)

1. In Azure Portal, search **“Static Web Apps”** → **Create**.
2. **Basics**:
   - **Subscription** / **Resource group**: same.
   - **Name**: e.g. `inursly`.
   - **Plan**: Free.
   - **Deployment**: GitHub → authorize, choose repo and branch.
   - **Build Details**:
     - **Build Presets**: Custom.
     - **App location**: `doctor-appointment/frontend` (or `frontend` if repo root is `doctor-appointment`).
     - **Output location**: `build`.
     - **Build command**: `npm install && npm run build`.
3. **Create**. Azure will add a GitHub Action to build and deploy the frontend.
4. **Environment variable for API URL**:
   - Open the Static Web App → **Configuration** → **Application settings**.
   - Add: `REACT_APP_API_URL` = `https://inursly-api.azurewebsites.net` (your backend URL from Step 4).
5. Redeploy the frontend (e.g. push a commit or re-run the GitHub Action) so the build uses `REACT_APP_API_URL`.
6. Copy the frontend URL (e.g. `https://inursly.azurestaticapps.net`).

---

## Step 6: Connect backend and frontend

1. **Backend CORS**: In the **App Service** (backend) → **Configuration** → **Application settings**, set:
   - `FRONTEND_URL` = your Static Web App URL (e.g. `https://inursly.azurestaticapps.net`).
2. Save so the backend restarts with the new CORS origin.

You can now open the frontend URL in a browser; it will call the Azure backend, which uses Azure MySQL.

---

## Step 7: Use the same MySQL locally (optional)

- In `backend/.env` set the **same** Azure MySQL values:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- Ensure your IP is allowed in Azure MySQL **Networking** (or use a VPN that’s allowed).
- Run `cd backend && npm start`; you should see **Connected to MySQL** and use the same data as in Azure.

---

## Cost and credit

- **MySQL Flexible Server** (Burstable B1ms): roughly ~$15–30/month depending on region.
- **App Service Free (F1)**: free with limits; **B1** is low cost if you need always-on.
- **Static Web Apps**: free tier is usually enough for this app.
- Your **$100 credit** will cover several months if you keep to small tiers; monitor **Cost Management + Billing** in the portal.

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| Backend can’t connect to MySQL | Azure MySQL **Networking**: allow “Azure services” and/or the outbound IPs of App Service (see App Service **Properties** or **Outbound IPs**). |
| 502/503 on backend | **Startup command** must run from the folder that has `server.js` (e.g. `cd backend && npm start`). Check **Log stream** and **Deployment** logs. |
| Frontend shows wrong API | `REACT_APP_API_URL` must be set in Static Web App **Configuration** and frontend **rebuilt/redeployed**. |
| CORS errors | `FRONTEND_URL` on the backend must match the frontend URL exactly (protocol + host, no trailing slash). |

Once this is done, you’re running Inursly on Azure with MySQL, backend, and frontend, and can keep using MySQL Workbench against the same Azure MySQL database.
