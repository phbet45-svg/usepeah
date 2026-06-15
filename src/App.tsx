import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, getDocs } from 'firebase/firestore';
import { db, auth, seedInitialData, handleFirestoreError, OperationType } from './lib/firebase';
import { Product, Category, Coupon, StoreConfig, CartItem, Order } from './types';

// Importing premium custom subcomponents
import SplashIntro from './components/SplashIntro';
import NavBar from './components/NavBar';
import StoreFront from './components/StoreFront';
import ProductDetail from './components/ProductDetail';
import Footer from './components/Footer';
import CartCheckout from './components/CartCheckout';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Page flows and displays states
  const [showSplash, setShowSplash] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Firestore synchronization states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<StoreConfig>({
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
        subtitle: 'Leveza nos tecidos e sofisticação no corte de luxo.',
        type: 'main'
      }
    ]
  });

  // Navigation Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  // Shopping Bag persistent state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 1. Initial Seeding and live subscriptions
  useEffect(() => {
    // Public subscriptions accessible by everyone (guests and admins)
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((snapshotDoc) => {
        prods.push(snapshotDoc.data() as Product);
      });
      setProducts(prods);
    }, (err) => {
      console.error('Error fetching products:', err);
      handleFirestoreError(err, OperationType.GET, 'products');
    });

    // Set up real-time sync listeners for categories
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((snapshotDoc) => {
        cats.push(snapshotDoc.data() as Category);
      });
      setCategories(cats);
    }, (err) => {
      console.error('Error fetching categories:', err);
      handleFirestoreError(err, OperationType.GET, 'categories');
    });

    // Set up real-time sync listeners for coupons
    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const cups: Coupon[] = [];
      snapshot.forEach((snapshotDoc) => {
        cups.push(snapshotDoc.data() as Coupon);
      });
      setCoupons(cups);
    }, (err) => {
      console.error('Error fetching coupons:', err);
      handleFirestoreError(err, OperationType.GET, 'coupons');
    });

    // Set up real-time sync listeners for configs
    const unsubConfig = onSnapshot(collection(db, 'configs'), (snapshot) => {
      snapshot.forEach((snapshotDoc) => {
        if (snapshotDoc.id === 'main_store') {
          setConfig(snapshotDoc.data() as StoreConfig);
        }
      });
    }, (err) => {
      console.error('Error fetching configs:', err);
      handleFirestoreError(err, OperationType.GET, 'configs');
    });

    // Admin-secured subscriptions and actions (depend on Admin role)
    let unsubOrders: (() => void) | null = null;

    const unsubAuth = auth.onAuthStateChanged((user) => {
      const isAdminUser = !!(user && (user.email === 'usepeah@x.com' || user.email === 'phbet45@gmail.com'));
      
      if (isAdminUser) {
        // Run automatic seeding ONLY if the admin is authenticated
        seedInitialData().catch((err) => {
          console.error('Error seeding initial data: ', err);
        });

        // Set up real-time sync listeners for orders (admin only)
        if (!unsubOrders) {
          unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
            const ords: Order[] = [];
            snapshot.forEach((snapshotDoc) => {
              ords.push(snapshotDoc.data() as Order);
            });
            setOrders(ords);
          }, (err) => {
            console.error('Error fetching orders:', err);
            handleFirestoreError(err, OperationType.GET, 'orders');
          });
        }
      } else {
        // Clear orders and teardown orders listener if guest
        setOrders([]);
        if (unsubOrders) {
          unsubOrders();
          unsubOrders = null;
        }
      }
    });

    // Restore persistent shopping cart bag from local session
    const localCartStr = localStorage.getItem('usepeah_cart');
    if (localCartStr) {
      try {
        setCartItems(JSON.parse(localCartStr));
      } catch (err) {
        console.error('Failed reading browser cart storage', err);
      }
    }

    return () => {
      unsubProducts();
      unsubCategories();
      unsubCoupons();
      unsubConfig();
      unsubAuth();
      if (unsubOrders) {
        unsubOrders();
      }
    };
  }, []);

  // Helper trigger to manual pull updates
  const handleRefreshData = async () => {
    // This is useful on bulk writes or changes
    console.log('Synchronizing collections manually...');
  };

  // shopping bag operations
  const handleAddToCart = (product: Product, size: string, color: string) => {
    const nextCart = [...cartItems];
    const existsIndex = nextCart.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
    );

    if (existsIndex > -1) {
      nextCart[existsIndex].quantity += 1;
    } else {
      nextCart.push({
        product,
        selectedSize: size,
        selectedColor: color,
        quantity: 1
      });
    }

    setCartItems(nextCart);
    localStorage.setItem('usepeah_cart', JSON.stringify(nextCart));
  };

  const handleUpdateCartQuantity = (product: Product, size: string, color: string, qty: number) => {
    const nextCart = cartItems.map((item) => {
      if (item.product.id === product.id && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity: Math.max(1, qty) };
      }
      return item;
    });

    setCartItems(nextCart);
    localStorage.setItem('usepeah_cart', JSON.stringify(nextCart));
  };

  const handleRemoveCartItem = (product: Product, size: string, color: string) => {
    const nextCart = cartItems.filter(
      (item) => !(item.product.id === product.id && item.selectedSize === size && item.selectedColor === color)
    );

    setCartItems(nextCart);
    localStorage.setItem('usepeah_cart', JSON.stringify(nextCart));
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem('usepeah_cart');
  };

  const totalCartCount = cartItems.reduce((acc, current) => acc + current.quantity, 0);

  // Related products finder
  const getRelatedProducts = (activeProd: Product) => {
    return products.filter((p) => p.id !== activeProd.id && p.categoryId === activeProd.categoryId);
  };

  return (
    <div id="usepeah-applet-root" className="min-h-screen bg-cream-soft text-luxe-dark flex flex-col font-sans selection:bg-luxe-accent selection:text-luxe-dark">
      
      {/* 1. Splendid Luxurious 5-seconds Splash Video Segment on first load */}
      {showSplash && <SplashIntro onComplete={() => setShowSplash(false)} />}

      {/* Render Main App layout when splash is cleared */}
      {!showSplash && (
        <>
          {/* Main Top Navigation Row */}
          <NavBar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={(catId) => {
              setSelectedCategory(catId);
              setSelectedProduct(null); // Return to catalog on Category click
            }}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={(subcat) => {
              setSelectedSubcategory(subcat);
              setSelectedProduct(null); // Return to catalog on Subcategory click
            }}
            cartCount={totalCartCount}
            onOpenCart={() => setCartOpen(true)}
            searchTerm={searchTerm}
            setSearchTerm={(term) => {
              setSearchTerm(term);
              setSelectedProduct(null); // Return to catalog on active search
            }}
          />

          {/* Core Page Router View Outlet */}
          <main className="flex-1">
            {selectedProduct ? (
              <ProductDetail
                product={selectedProduct}
                relatedProducts={getRelatedProducts(selectedProduct)}
                onBack={() => setSelectedProduct(null)}
                onAddToCart={handleAddToCart}
                onSelectProduct={setSelectedProduct}
              />
            ) : (
              <StoreFront
                products={products}
                categories={categories}
                config={config}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubcategory={selectedSubcategory}
                setSelectedSubcategory={setSelectedSubcategory}
                onSelectProduct={(prod) => setSelectedProduct(prod)}
                searchTerm={searchTerm}
              />
            )}
          </main>

          {/* Main Website Footer */}
          <Footer
            socials={config?.socials || { instagram: '', facebook: '', tiktok: '', pinterest: '', whatsapp: '' }}
            onAdminClick={() => setAdminPanelOpen(true)}
          />

          {/* Slide-out Drawer Bag & Checkouts */}
          {cartOpen && (
            <CartCheckout
              cartItems={cartItems}
              onClose={() => setCartOpen(false)}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
              coupons={coupons}
            />
          )}

          {/* Fullscreen Hidden Administration Management Backoffice System */}
          {adminPanelOpen && (
            <AdminPanel
              products={products}
              categories={categories}
              orders={orders}
              coupons={coupons}
              config={config}
              onClose={() => setAdminPanelOpen(false)}
              onRefreshAll={handleRefreshData}
            />
          )}

          {/* Floating WhatsApp Button - Official icon with high-fashion gold glow */}
          <div className="fixed bottom-6 right-6 z-50 flex items-center group">
            {/* Elegant label floating to the left on hover */}
            <div className="mr-3 bg-[#120F0D] text-white border border-[#C9A076]/40 px-3.5 py-2 text-[10px] tracking-widest uppercase font-sans font-medium rounded-none shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              Atendimento <span className="font-serif italic text-[#C9A076] lowercase">premium</span>
            </div>
            <a
              id="whatsapp-floating-trigger"
              href="https://wa.me/553299564966?text=Ol%C3%A1%20Ateli%C3%AAt%20USEPEAH!%20Gostaria%20de%20um%20atendimento%20exclusivo%20premium."
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-[0_0_20px_rgba(37,211,102,0.45)] hover:shadow-[0_0_25px_rgba(37,211,102,0.65)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
              aria-label="Atendimento WhatsApp"
            >
              {/* Luxury shimmering outer gold halo */}
              <div className="absolute inset-0 rounded-full border border-[#C9A076]/50 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
              <div className="absolute -inset-1.5 rounded-full border border-[#C9A076]/20 animate-pulse" />

              {/* Official WhatsApp path icon */}
              <svg 
                viewBox="0 0 24 24" 
                className="w-7 h-7 fill-current drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
              >
                <path d="M12.012 2c-5.506 0-9.97 4.463-9.97 9.97 0 1.96.57 3.79 1.556 5.342l-1.654 6.04 6.185-1.621c1.49.814 3.178 1.28 4.966 1.28 5.505 0 9.97-4.46 9.97-9.97C21.982 6.463 17.518 2 12.012 2zm6.273 14.162c-.272.766-1.39 1.395-1.895 1.455-.49.057-.96.255-3.11-.6-2.753-1.096-4.507-3.905-4.637-4.086-.14-.17-1.127-1.498-1.127-2.85 0-1.353.7-2.017.953-2.28.257-.268.56-.33.747-.33.19 0 .378.002.54.01.173.007.404-.067.63.483.23.56.787 1.916.853 2.052.07.135.115.31.025.49-.09.18-.135.29-.27.45l-.408.484c-.135.152-.284.316-.113.61.17.294.76 1.253 1.63 2.03.114.1.213.148.33.2l.626.376c.307.163.493.11.666-.088.175-.197.747-.87.95-1.17.2-.3.403-.25.67-.15.27.1.1.285 1.705 1.085s.964.44.807.7c-.156.27-.723 1.012-.995 1.772z"/>
              </svg>

              {/* Pulsating live dot indicator */}
              <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 border-2 border-white rounded-full shadow flex items-center justify-center">
                <span className="w-1 h-1 bg-neutral-900 rounded-full animate-ping" />
              </div>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
