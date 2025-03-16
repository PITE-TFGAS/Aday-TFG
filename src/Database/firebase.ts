/**
 * Universidad de La Laguna
 * Escuela Superior de Ingeniería y Tecnología
 * Grado en Ingeniería Informática
 * Trabajo de Fin de Grado 2025
 *
 * @author Aday Cuesta Correa
 * @alias alu0101483887
 * @since 13 MARCH 2025
 *
 */

import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc } from "firebase/firestore";

class FirebaseService {
  private db: any;
  private app: any;

  constructor(private collectionName: string, private document: string) {
    const firebaseConfig = {
      apiKey: "AIzaSyCVNbUt4MNzwNm6gZGpO_A1wyzLjpdXFg4",
      authDomain: "chatbot-6eb81.firebaseapp.com",
      databaseURL: "https://chatbot-6eb81-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "chatbot-6eb81",
      storageBucket: "chatbot-6eb81.firebasestorage.app",
      messagingSenderId: "178109976025",
      appId: "1:178109976025:web:ae4157944f4e4c4d10ddc8",
      measurementId: "G-MZVNB5GGTC"
    };

    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.collectionName = collectionName;
    this.document = document;
  }

  public async readAllData(): Promise<void> {
    try {
      const querySnapshot = await getDocs(collection(this.db, this.collectionName));
      querySnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
      });
    } catch (error) {
      console.error("Error al leer datos:", error);
    }
  }

  public async getData(key: string): Promise<string | null> {
    try {
      const docRef = doc(this.db, this.collectionName, this.document);  // Referencia al documento
      const docSnap = await getDoc(docRef);  // Obtener el documento

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && key in data) {
          return JSON.stringify(data[key]).replace(/\\/g, ""); // Devuelve solo el valor del campo solicitado
        } else {
          console.log(`La clave '${key}' no existe en el documento.`);
          return null;
        }
      } else {
        console.log("El documento no existe.");
        return null;
      }
    } catch (error) {
      console.error("Error al leer datos:", error);
      return null;
    }
  }

  public async close() {
    await deleteApp(this.app);
  }
}

export default FirebaseService;