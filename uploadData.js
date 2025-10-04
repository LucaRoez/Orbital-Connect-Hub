import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

// Inicializa Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Carga el JSON

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const data = JSON.parse(fs.readFileSync(__dirname, "public/data/offers.json", "utf8"));

// Función para subir los datos
async function uploadCollection(collectionName, items) {
  const batch = db.batch();
  items.forEach(item => {
    const docRef = db.collection(collectionName).doc(item.id || undefined);
    batch.set(docRef, item);
  });
  await batch.commit();
  console.log(`✅ Subidos ${items.length} documentos a ${collectionName}`);
}

async function main() {
  for (const [collectionName, items] of Object.entries(data)) {
    await uploadCollection(collectionName, items);
  }
  console.log("🚀 Carga completa.");
  process.exit(0);
}

main().catch(console.error);
