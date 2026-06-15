import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Category, Coupon, StoreConfig } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without the firestoreDatabaseId specified!
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Operational types for structured permission logging
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

// System error handler function (MANDATORY)
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot (MANDATORY CONSTRAINT)
async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection response received.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase offline or key not ready yet. Working in offline-capable caching mode.");
    }
  }
}
testFirebaseConnection();

// Initial database seeding logic (Seed Inicial)
export async function seedInitialData() {
  try {
    // 1. Seed Categories if empty
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      console.log('Seeding initial categories...');
      const initialCategories: Category[] = [
        {
          id: 'vestidos',
          name: 'Vestidos',
          subcategories: ['Midi', 'Longo Estampado', 'Alfaiataria Festa', 'Minimalistas']
        },
        {
          id: 'conjuntos',
          name: 'Conjuntos',
          subcategories: ['Seda Pura', 'Linho Rústico', 'Tricot Premium']
        },
        {
          id: 'blusas-camisas',
          name: 'Blusas & Camisas',
          subcategories: ['Camisas em Crepe', 'Bodys Elegantes', 'Regatas Acetinadas']
        },
        {
          id: 'alfaiataria',
          name: 'Alfaiataria',
          subcategories: ['Blazers Estruturados', 'Calças Pantalonas', 'Saias Midi']
        }
      ];

      for (const cat of initialCategories) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }

    // 2. Seed Banners & Configs
    const configSnap = await getDocs(collection(db, 'configs'));
    if (configSnap.empty) {
      console.log('Seeding store configurations...');
      const defaultConfig: StoreConfig = {
        id: 'main_store',
        socials: {
          instagram: 'https://instagram.com/usepeah',
          facebook: 'https://facebook.com/usepeah',
          tiktok: 'https://tiktok.com/@usepeah',
          pinterest: 'https://pinterest.com/usepeah',
          whatsapp: 'https://wa.me/553299564966'
        },
        banners: [
          {
            id: 'banner_main_1',
            imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
            title: 'COLEÇÃO VERÃO COM ALMA',
            subtitle: 'Leveza nos tecidos e sofisticação no corte premium.',
            type: 'main'
          },
          {
            id: 'banner_main_2',
            imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=2070&auto=format&fit=crop',
            title: 'ALFAIATARIA CONTEMPORÂNEA',
            subtitle: 'Modelagem impecável e tons champagne para o dia e noite.',
            type: 'main'
          },
          {
            id: 'banner_promo_1',
            imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop',
            title: 'LOOKS EXCLUSIVOS',
            subtitle: 'Modelos criados em Ubá com propósito e elegância.',
            type: 'promo'
          }
        ]
      };
      await setDoc(doc(db, 'configs', defaultConfig.id), defaultConfig);
    }

    // 3. Seed Promotional Coupons
    const couponSnap = await getDocs(collection(db, 'coupons'));
    if (couponSnap.empty) {
      console.log('Seeding introductory coupons...');
      const initialCoupons: Coupon[] = [
        {
          id: 'welcome10',
          code: 'WELCOME10',
          type: 'percentual',
          value: 10,
          minPurchaseValue: 200,
          isActive: true
        },
        {
          id: 'usepeah20',
          code: 'PEAH20',
          type: 'valor fixo',
          value: 20,
          minPurchaseValue: 150,
          isActive: true
        },
        {
          id: 'free',
          code: 'FRETEGRATIS',
          type: 'frete grátis',
          value: 0,
          minPurchaseValue: 400,
          isActive: true
        }
      ];
      for (const cup of initialCoupons) {
        await setDoc(doc(db, 'coupons', cup.id), cup);
      }
    }

    // 4. Seed Products
    const prodSnap = await getDocs(collection(db, 'products'));
    if (prodSnap.empty) {
      console.log('Seeding gorgeous clothing products...');
      const initialProducts: Product[] = [
        {
          id: 'prod_midi_amelie',
          name: 'Vestido Midi Rosé Amelie',
          categoryId: 'vestidos',
          subcategory: 'Midi',
          brand: 'USEPEAH',
          sku: 'PEAH-VD-01',
          barcode: '7891011121314',
          description: 'Vestido confeccionado em crepe acetinado de altíssima qualidade. Possui decote frente única, fenda suave traseira, drapeado impecável no quadril que valoriza com total discrição e sofisticação. Ideal para eventos especiais, jantares sofisticados ou coquetéis de luxo.',
          sizes: ['P', 'M', 'G'],
          colors: ['Rosé Gold', 'Off White', 'Champagne'],
          price: 589.00,
          promoPrice: 499.00,
          weight: 450,
          images: [
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549064482-6779ba329226?q=80&w=1000&auto=format&fit=crop'
          ],
          stock: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'prod_blazer_charlotte',
          name: 'Blazer Estruturado Champagne Charlotte',
          categoryId: 'alfaiataria',
          subcategory: 'Blazers Estruturados',
          brand: 'USEPEAH',
          sku: 'PEAH-BL-02',
          barcode: '7891011121321',
          description: 'A peça que exala poder e elegância. Confeccionado em crepe de alfaiataria premium encorpado, o blazer Charlotte apresenta cortes geométricos, forro interno em toque de seda, botões dourados personalizados de Rosé Gold e ombreiras discretas que desenham a silhueta com maestria estruturada.',
          sizes: ['P', 'M', 'G', 'GG'],
          colors: ['Champagne', 'Preto Premium', 'Nude Elegante'],
          price: 689.00,
          weight: 800,
          images: [
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop'
          ],
          stock: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'prod_pantalona_maite',
          name: 'Pantalona em Linho Puro Maitê',
          categoryId: 'alfaiataria',
          subcategory: 'Calças Pantalonas',
          brand: 'USEPEAH',
          sku: 'PEAH-PT-03',
          barcode: '7891011121338',
          description: 'Calça Pantalona em nobre tecido 100% Linho italiano. Caimento fluido, cintura alta extremamente confortável, bolsos faca e costura invisível. Perfeita para criar produções charmosas que vão da praia chique no Sul da França ao escritório contemporâneo em Ubá.',
          sizes: ['M', 'G'],
          colors: ['Nude Elegante', 'Off White'],
          price: 429.00,
          weight: 520,
          images: [
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop'
          ],
          stock: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'prod_conj_seda_isadora',
          name: 'Conjunto Camisa e Saia Acetinada Isadora',
          categoryId: 'conjuntos',
          subcategory: 'Seda Pura',
          brand: 'USEPEAH',
          sku: 'PEAH-CJ-04',
          barcode: '7891011121345',
          description: 'Conjunto deslumbrante composto por camisa cropped fluida e saia midi acetinada com viés enviesado. Uma sintonia que abraça a silhueta com leveza extraordinária e acabamento fosco-brilhante espetacular. Sinta o toque fresco da seda Usepeah.',
          sizes: ['P', 'M', 'G'],
          colors: ['Rosé Gold', 'Preto Premium'],
          price: 749.00,
          promoPrice: 629.00,
          weight: 600,
          images: [
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop'
          ],
          stock: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      for (const prod of initialProducts) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    }
    console.log('Seeding processes finished.');
  } catch (error) {
    console.error('Error seeding initial data: ', error);
  }
}
