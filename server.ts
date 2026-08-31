import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import jwt from "jsonwebtoken";

dotenv.config();

// Initialize Firebase Admin
// This will use ADC (Application Default Credentials). If the environment lacks proper roles, it will fail gracefully.
let adminApp;
try {
  adminApp = initializeApp({
    projectId: "zinc-purpose-zlsxp",
    storageBucket: "zinc-purpose-zlsxp.firebasestorage.app",
  });
} catch(e) {
  console.error("Firebase Admin initialization error", e);
}

const db = getFirestore(adminApp, "ai-studio-2d69b9e1-6f28-4389-af15-9410dd704eef");
const auth = getAuth(adminApp);
const storage = getStorage(adminApp);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || "default_dev_secret_key_change_in_prod";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            { role: "user", parts: [{ text: "You are a helpful customer support AI for Firewood, a digital assets marketplace selling LUTs, templates, and thumbnails. Keep answers concise." }] },
            { role: "model", parts: [{ text: "Got it!" }] },
            ...(history || []),
            { role: "user", parts: [{ text: message }] }
        ]
      });
      res.json({ reply: response.text });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Verify Auth Middleware
  const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await auth.verifyIdToken(token);
      (req as any).user = decodedToken;
      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ error: "Invalid token" });
    }
  };

  // Validate coupon endpoint
  app.post("/api/validate-coupon", requireAuth, async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ error: "Code is required" });

      const couponRef = db.collection('coupons').doc(code);
      const doc = await couponRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Coupon not found" });
      }

      const coupon = doc.data() as any;
      
      if (!coupon.isActive) {
        return res.status(400).json({ error: "Coupon is inactive" });
      }

      const now = new Date();
      if (coupon.startDate && new Date(coupon.startDate) > now) {
        return res.status(400).json({ error: "Coupon is not yet active" });
      }
      if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
        return res.status(400).json({ error: "Coupon has expired" });
      }

      if (coupon.currentUses >= coupon.maxUses) {
        return res.status(400).json({ error: "Coupon usage limit reached" });
      }

      res.json({ coupon });
    } catch (error) {
      console.error("Validate coupon error:", error);
      // Fallback for preview environment lacking Datastore permissions
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Checkout endpoint
  app.post("/api/checkout", requireAuth, async (req, res) => {
    try {
      const { cart, couponCode } = req.body;
      const user = (req as any).user;
      
      let discountPercentage = 0;
      let discountFixed = 0;

      // In a real app, use a Firestore transaction here to prevent race conditions on coupon usage.
      if (couponCode) {
        const couponRef = db.collection('coupons').doc(couponCode);
        const doc = await couponRef.get();
        if (doc.exists) {
          const coupon = doc.data() as any;
          const now = new Date();
          if (coupon.isActive && 
              (!coupon.startDate || new Date(coupon.startDate) <= now) &&
              (!coupon.expiryDate || new Date(coupon.expiryDate) >= now) &&
              coupon.currentUses < coupon.maxUses) {
                
            discountPercentage = coupon.discountPercentage || 0;
            discountFixed = coupon.discountFixed || 0;
            
            // Increment usage
            await couponRef.update({ currentUses: FieldValue.increment(1) });
          }
        }
      }

      const orderId = `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const orderDate = new Date().toISOString();
      const purchases = [];

      for (const item of cart) {
        const purchase = {
          id: `${orderId}-${item.id}`,
          orderId,
          userEmail: user.email,
          userId: user.uid,
          date: orderDate,
          title: item.title,
          price: item.price,
          status: 'completed',
          productId: item.id
        };
        await db.collection('purchases').doc(purchase.id).set(purchase);
        purchases.push(purchase);
      }

      res.json({ success: true, orderId, purchases });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Checkout failed" });
    }
  });

  // Generate temporary download URL (redirects to our signed JWT download)
  app.post("/api/get-download-url", requireAuth, async (req, res) => {
    try {
      const { productId } = req.body;
      const user = (req as any).user;

      // Verify purchase
      const purchasesSnapshot = await db.collection('purchases')
        .where('userId', '==', user.uid)
        .where('productId', '==', productId)
        .limit(1)
        .get();

      if (purchasesSnapshot.empty) {
        // Checking for super admin
        const userDoc = await db.collection('users').doc(user.uid).get();
        const role = userDoc.exists ? userDoc.data()?.role : null;
        if (role !== 'super_admin' && role !== 'product_admin') {
           return res.status(403).json({ error: "Not authorized to download this product" });
        }
      }

      const productDoc = await db.collection('products').doc(productId).get();
      if (!productDoc.exists) return res.status(404).json({ error: "Product not found" });
      
      const product = productDoc.data();
      if (!product?.fileUrl) return res.status(404).json({ error: "No file associated with this product" });

      // Generate a short-lived token (15 minutes)
      const token = jwt.sign(
        { productId, fileUrl: product.fileUrl, userId: user.uid }, 
        JWT_SECRET, 
        { expiresIn: '15m' }
      );

      // Return the temporary download URL
      res.json({ url: `/api/download?token=${token}` });

    } catch (error) {
      console.error("Get download URL error:", error);
      res.status(500).json({ error: "Failed to generate URL" });
    }
  });

  // Download endpoint (using the JWT token)
  app.get("/api/download", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') return res.status(400).send("Missing token");

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const fileUrl = decoded.fileUrl; // Expected to be a GCS path or full URL.
      
      // We assume fileUrl is a path in the storage bucket like "products/file.zip"
      let filePath = fileUrl;
      // If it's a full Firebase Storage URL, extract the path
      if (fileUrl.includes('firebasestorage.googleapis.com')) {
         const urlObj = new URL(fileUrl);
         // Example: /v0/b/zinc-purpose-zlsxp.firebasestorage.app/o/products%2Ffile.zip
         const pathPart = urlObj.pathname.split('/o/')[1];
         if (pathPart) {
           filePath = decodeURIComponent(pathPart.split('?')[0]);
         }
      }

      const bucket = storage.bucket();
      const file = bucket.file(filePath);
      
      const [exists] = await file.exists();
      if (!exists) return res.status(404).send("File not found in storage");

      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
      
      // Stream the file directly to the client
      file.createReadStream().pipe(res).on('error', (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) res.status(500).send("Error downloading file");
      });

    } catch (error) {
      console.error("Download error:", error);
      res.status(403).send("Invalid or expired token");
    }
  });


  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
