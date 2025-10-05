import fs from "fs";
import admin from "firebase-admin";

// Inicializa Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync("serviceAccountKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Carga el JSON
const fileName = "collision_data";
const filePath = `public/data/${fileName}.json`;
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

// Función para subir una lista a Firestore
async function uploadArray(collectionName, array) {
  const batch = db.batch();
  array.forEach((item, i) => {
    const docRef = db.collection(collectionName).doc(item.id || undefined);
    batch.set(docRef, item);
  });
  await batch.commit();
  console.log(`✅ Subidos ${array.length} documentos a ${collectionName}`);
}

async function uploadObject(collectionName, objectData) {
  const docRef = db.collection(collectionName).doc(objectData.id || "default");
  await docRef.set(objectData);
  console.log(`✅ Subido un documento único a ${collectionName}`);
}

// Función principal
async function main() {
  // Si es un array simple, sube todo a una colección con el nombre del archivo
  if (Array.isArray(data)) {
    const fileName = filePath.split("/").pop().replace(".json", "");
    await uploadArray(fileName, data);
  }
  // Si es un objeto, interpreta sus claves como colecciones
  else if (typeof data === "object" && data !== null) {
    const valuesAreArrays = Object.values(data).every(v => Array.isArray(v));

    if (valuesAreArrays) {
      // Caso 2: Objeto con arrays (colecciones)
      for (const [collectionName, items] of Object.entries(data)) {
        await uploadArray(collectionName, items);
      }
    } else {
      // Caso 3: Objeto único
      await uploadObject(fileName, data);
    
    }
  } else {
    console.error("❌ El formato JSON no es válido para Firestore.");
  }

  console.log("🚀 Carga completa.");
  process.exit(0);
}

main().catch(console.error);
