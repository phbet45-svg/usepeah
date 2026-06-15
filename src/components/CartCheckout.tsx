import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, Truck, Check, Sparkles } from 'lucide-react';
import { CartItem, Coupon, Order, Product } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface CartCheckoutProps {
  cartItems: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (product: Product, size: string, color: string, qty: number) => void;
  onRemoveItem: (product: Product, size: string, color: string) => void;
  onClearCart: () => void;
  coupons: Coupon[];
}

export default function CartCheckout({
  cartItems,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  coupons,
}: CartCheckoutProps) {
  // Step workflow
  const [step, setStep] = useState<'cart' | 'checkout' | 'completed'>('cart');
  
  // Checkout fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // Shipping & Coupon estimation
  const [shippingType, setShippingType] = useState<'PAC' | 'SEDEX' | 'Retirada'>('PAC');
  const [shippingCost, setShippingCost] = useState(25);
  const [cepLoading, setCepLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Order state persistence
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Subtotals
  const itemsSubtotal = cartItems.reduce((acc, item) => {
    const activePrice = item.product.promoPrice || item.product.price;
    return acc + (activePrice * item.quantity);
  }, 0);

  // Apply Coupon Rules
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode) return;

    const findCup = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (!findCup) {
      setCouponError('Cupom inválido ou expirado.');
      setAppliedCoupon(null);
      return;
    }

    if (!findCup.isActive) {
      setCouponError('Cupom inativo.');
      setAppliedCoupon(null);
      return;
    }

    if (findCup.minPurchaseValue && itemsSubtotal < findCup.minPurchaseValue) {
      setCouponError(`Compra mínima para este cupom é de R$ ${findCup.minPurchaseValue.toFixed(2)}`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(findCup);
  };

  // Calculate discount value
  let discountValue = 0;
  let finalShippingCost = shippingType === 'Retirada' ? 0 : shippingCost;

  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentual') {
      discountValue = itemsSubtotal * (appliedCoupon.value / 100);
    } else if (appliedCoupon.type === 'valor fixo') {
      discountValue = appliedCoupon.value;
    } else if (appliedCoupon.type === 'frete grátis') {
      finalShippingCost = 0;
    }
  }

  const grandTotal = Math.max(0, itemsSubtotal - discountValue + finalShippingCost);

  // CEP Consulting - ViaCEP Integation
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawCep = e.target.value.replace(/\D/g, '');
    setCep(rawCep);
    if (rawCep.length === 8) {
      try {
        setCepLoading(true);
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await res.json();
        if (data && !data.erro) {
          setAddress(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setEstado(data.uf || '');
          
          // Shipping cost computation dynamically based on weight and region
          const totalWeight = cartItems.reduce((acc, i) => acc + (i.product.weight * i.quantity), 0);
          const isMG = data.uf === 'MG';
          
          // Estimative
          let pacFee = isMG ? 18.00 : 28.00;
          let sedexFee = isMG ? 32.00 : 52.00;

          // add small weight variable fee
          const weightKg = totalWeight / 1000;
          pacFee += Math.ceil(weightKg) * 1.5;
          sedexFee += Math.ceil(weightKg) * 3.0;

          setShippingCost(shippingType === 'PAC' ? pacFee : sedexFee);
        }
      } catch (err) {
        console.error('Error fetching ViaCEP: ', err);
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleShippingTypeChange = (type: 'PAC' | 'SEDEX' | 'Retirada') => {
    setShippingType(type);
    if (type === 'Retirada') {
      setShippingCost(0);
    } else {
      // Re-trigger small shipping PAC / SEDEX estimation
      const isMG = estado === 'MG' || estado === '';
      let baseFee = type === 'PAC' ? (isMG ? 18 : 28) : (isMG ? 32 : 52);
      setShippingCost(baseFee);
    }
  };

  // Create Order and Redirect to WhatsApp
  const handleFinalizeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      setSubmitting(true);
      const orderId = 'order_' + Date.now().toString(16);
      const oNum = 'PEAH-' + Math.floor(100000 + Math.random() * 900000).toString();

      const orderPayload: Order = {
        id: orderId,
        orderNumber: oNum,
        customerName,
        customerPhone,
        customerEmail,
        customerCpf: customerCpf || undefined,
        cep,
        address,
        number,
        complement: complement || undefined,
        bairro,
        cidade,
        estado,
        items: cartItems.map(i => ({
          productId: i.product.id,
          name: i.product.name,
          sku: i.product.sku,
          size: i.selectedSize,
          color: i.selectedColor,
          quantity: i.quantity,
          price: i.product.promoPrice || i.product.price,
        })),
        shippingType,
        shippingCost: finalShippingCost,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        discountValue: discountValue > 0 ? discountValue : undefined,
        total: grandTotal,
        status: 'Novo',
        createdAt: new Date().toISOString(),
      };

      // 1. Write the Order to Firestore (real sync!)
      await setDoc(doc(db, 'orders', orderId), orderPayload);

      setCreatedOrder(orderPayload);
      setStep('completed');

      // 2. Generate premium WhatsApp invoice text
      let textMessage = `*NOVO PEDIDO USEPEAH - ${oNum}*\n`;
      textMessage += `_Data: ${new Date().toLocaleDateString('pt-BR')}_\n\n`;
      textMessage += `*DADOS DA CLIENTE*\n`;
      textMessage += `Nome: ${customerName}\n`;
      textMessage += `Telefone: ${customerPhone}\n`;
      textMessage += `E-mail: ${customerEmail}\n`;
      if (customerCpf) textMessage += `CPF: ${customerCpf}\n`;
      textMessage += `\n*ENDEREÇO DE ENTREGA*\n`;
      textMessage += `CEP: ${cep}\n`;
      textMessage += `Logradouro: ${address}, Nº ${number}\n`;
      if (complement) textMessage += `Complemento: ${complement}\n`;
      textMessage += `Bairro: ${bairro}\n`;
      textMessage += `Cidade/UF: ${cidade} - ${estado}\n\n`;

      textMessage += `*SACOLA DE COMPRAS*\n`;
      cartItems.forEach((it, xi) => {
        const itemPrice = it.product.promoPrice || it.product.price;
        const sub = itemPrice * it.quantity;
        textMessage += `${xi + 1}. ${it.product.name} [Size: ${it.selectedSize} / Color: ${it.selectedColor}] x${it.quantity} - R$ ${itemPrice.toFixed(2)} (Sub: R$ ${sub.toFixed(2)})\n`;
      });

      textMessage += `\n*RESUMO FINANCEIRO*\n`;
      textMessage += `Subtotal Itens: R$ ${itemsSubtotal.toFixed(2)}\n`;
      if (discountValue > 0) textMessage += `Desconto Cupom: -R$ ${discountValue.toFixed(2)}\n`;
      textMessage += `Frete (${shippingType}): R$ ${finalShippingCost.toFixed(2)}\n`;
      textMessage += `*VALOR TOTAL A PAGAR: R$ ${grandTotal.toFixed(2)}*\n\n`;
      textMessage += `_Por favor, valide as peças para enviarmos sua chave Pix de faturamento. Muito obrigado!_`;

      const encodedMsg = encodeURIComponent(textMessage);
      const url = `https://wa.me/553299564966?text=${encodedMsg}`;

      // Open message in new window
      window.open(url, '_blank');

      // Clear operational bag on success
      onClearCart();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'orders');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="cart-drawer-sheet" className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-sm animate-fadeIn">
      {/* Absolute drawer card */}
      <div className="w-full max-w-lg bg-cream-soft h-full flex flex-col shadow-3xl relative border-l border-atelier-line">
        
        {/* Drawer Header Navbar */}
        <div className="p-5 border-b border-atelier-line flex items-center justify-between bg-luxe-dark text-stone-100">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag size={18} className="text-luxury animate-pulse" />
            <h3 className="text-xs uppercase tracking-luxury text-[#FAF9F6] font-light">
              {step === 'cart' ? 'Sua Sacola Usepeah' : step === 'checkout' ? 'Dados para Entrega' : 'Pedido Confirmado!'}
            </h3>
          </div>
          <button
            id="close-cart-btn"
            onClick={onClose}
            className="text-stone-400 hover:text-luxury transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Cart Items panel */}
        {step === 'cart' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
                <ShoppingBag size={48} className="text-[#C2C2C2] stroke-[1] mb-2" />
                <p className="text-neutral-500 text-xs uppercase tracking-luxury text-center">Sua sacola está vazia.</p>
                <button
                  id="checkout-resume-browsing"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-[#1A1A1A] text-luxe-dark text-[10px] uppercase tracking-luxury hover:bg-[#1A1A1A] hover:text-white transition duration-300 rounded-none"
                >
                  Ver Coleção
                </button>
              </div>
            ) : (
              <>
                {/* Scrolling Box and line items */}
                <div className="flex-1 overflow-y-auto p-5 divide-y divide-atelier-line">
                  {cartItems.map((item, idx) => {
                    const activeP = item.product.promoPrice || item.product.price;
                    return (
                      <div key={idx} id={`cart-item-row-${idx}`} className="py-4 flex space-x-4 items-start animate-fadeIn">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-20 object-cover bg-[#FAF9F6] border border-atelier-line rounded-none"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-sans font-medium text-luxe-dark truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-[10px] text-neutral-500 font-sans uppercase tracking-luxury">
                            Tam: {item.selectedSize} | Cor: {item.selectedColor}
                          </p>
                          <div className="flex items-center space-x-3 pt-1">
                            {/* Quantity Selector buttons */}
                            <button
                              id={`cart-qty-dec-${idx}`}
                              onClick={() => onUpdateQuantity(item.product, item.selectedSize, item.selectedColor, item.quantity - 1)}
                              className="w-5 h-5 rounded-none border border-atelier-line flex items-center justify-center hover:border-luxury hover:bg-white text-stone-500 text-xs transition duration-200"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="text-xs text-luxe-dark font-medium">{item.quantity}</span>
                            <button
                              id={`cart-qty-inc-${idx}`}
                              onClick={() => onUpdateQuantity(item.product, item.selectedSize, item.selectedColor, item.quantity + 1)}
                              className="w-5 h-5 rounded-none border border-atelier-line flex items-center justify-center hover:border-luxury hover:bg-white text-stone-400 text-xs transition duration-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right flex flex-col justify-between h-20">
                          <span className="text-xs font-sans font-semibold text-luxe-dark block">
                            R$ {(activeP * item.quantity).toFixed(2)}
                          </span>
                          <button
                            id={`cart-delete-item-${idx}`}
                            onClick={() => onRemoveItem(item.product, item.selectedSize, item.selectedColor)}
                            className="text-stone-400 hover:text-luxury transition-all self-end p-1"
                            title="Remover"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subfooter checkout calculations */}
                <div className="p-5 border-t border-atelier-line bg-white space-y-4">
                  {/* Coupon section */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      id="cart-coupon-input-field"
                      type="text"
                      placeholder="Cupom de Desconto"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-atelier-line bg-[#FAF9F6] text-xs rounded-none uppercase outline-none focus:border-luxury placeholder:text-stone-400"
                    />
                    <button
                      id="cart-coupon-apply-btn"
                      type="submit"
                      className="px-4 py-2 bg-luxe-dark border border-luxury text-[#FAF9F6] hover:bg-luxury hover:text-luxe-dark text-[10px] uppercase font-sans tracking-luxury rounded-none font-medium transition duration-300"
                    >
                      Aplicar
                    </button>
                  </form>
                  {couponError && <p className="text-rose-500 text-[10px] tracking-wide">{couponError}</p>}
                  {appliedCoupon && (
                    <div id="congrats-coupon-banner" className="flex items-center justify-between text-[11px] text-luxury bg-[#FAF9F6] border border-luxury/40 px-3 py-1.5 rounded-none">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Sparkles size={13} className="text-luxury" />
                        Cupom {appliedCoupon.code} aplicado!
                      </span>
                      <button
                        id="remove-applied-coupon"
                        onClick={() => setAppliedCoupon(null)}
                        className="text-stone-400 hover:text-stone-900 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  )}

                  {/* Calculations breakdown */}
                  <div className="space-y-2 border-t border-atelier-line pt-3 text-xs">
                    <div className="flex items-center justify-between text-stone-500 font-sans tracking-luxury uppercase text-[9px]">
                      <span>Subtotal Itens:</span>
                      <span className="font-sans font-medium text-luxe-dark">R$ {itemsSubtotal.toFixed(2)}</span>
                    </div>
                    {discountValue > 0 && (
                      <div className="flex items-center justify-between text-luxury uppercase font-sans font-medium text-[9px]">
                        <span>Desconto Cupom:</span>
                        <span>-R$ {discountValue.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-serif text-sm text-luxe-dark border-t border-atelier-line/65 pt-2">
                      <span className="uppercase tracking-luxury">Total estimado:</span>
                      <span className="font-semibold text-luxury text-base">R$ {Math.max(0, itemsSubtotal - discountValue).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    id="cart-proceed-checkout"
                    onClick={() => setStep('checkout')}
                    className="w-full py-4 bg-luxe-dark hover:bg-luxury hover:text-luxe-dark text-white font-sans text-xs uppercase tracking-luxury font-medium flex items-center justify-center space-x-1.5 transition-colors duration-300 border border-luxury rounded-none shadow-xl cursor-pointer"
                  >
                    <span>Finalizar Compra</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Shipping & Capture Customer Form */}
        {step === 'checkout' && (
          <form onSubmit={handleFinalizeOrder} className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* Back to Cart link */}
              <button
                id="back-to-bag-link"
                type="button"
                onClick={() => setStep('cart')}
                className="text-[10px] uppercase tracking-luxury text-luxury hover:text-luxe-dark transition-colors font-sans font-medium flex items-center space-x-1"
              >
                <span>&larr; Voltar para a Sacola</span>
              </button>

              <div className="space-y-3.5 pt-2">
                <span className="text-[11px] uppercase tracking-luxury text-luxe-dark font-sans font-medium block border-b border-atelier-line pb-1.5">
                  Dados de Identificação
                </span>
                
                {/* Inputs rows */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase text-neutral-500 font-sans tracking-luxury block mb-1">Nome Completo *</label>
                    <input
                      id="cli-name-input"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-atelier-line outline-none text-xs bg-[#FAF9F6] text-luxe-dark rounded-none font-serif focus:border-luxury"
                      placeholder="Amanda Souza"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-neutral-500 font-sans tracking-luxury block mb-1">Telefone / Whatsapp *</label>
                    <input
                      id="cli-phone-input"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-atelier-line outline-none text-xs bg-[#FAF9F6] text-luxe-dark rounded-none font-serif focus:border-luxury"
                      placeholder="(32) 99999-9999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase text-neutral-500 font-sans tracking-luxury block mb-1">E-mail *</label>
                    <input
                      id="cli-email-input"
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-atelier-line outline-none text-xs bg-[#FAF9F6] text-luxe-dark rounded-none font-serif focus:border-luxury"
                      placeholder="amanda@ex.com"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-neutral-500 font-sans tracking-luxury block mb-1">CPF (Opcional)</label>
                    <input
                      id="cli-cpf-input"
                      type="text"
                      value={customerCpf}
                      onChange={(e) => setCustomerCpf(e.target.value)}
                      className="w-full px-3 py-2 border border-atelier-line outline-none text-xs bg-[#FAF9F6] text-luxe-dark rounded-none font-serif focus:border-luxury"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <span className="text-[11px] uppercase tracking-luxury text-luxe-dark font-sans font-medium block border-b border-atelier-line pt-3 pb-1.5">
                  Endereço de Entrega
                </span>

                {/* Logistics estimates */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] uppercase text-neutral-500 font-sans tracking-luxury block mb-1">CEP *</label>
                    <input
                      id="cli-cep-input"
                      type="text"
                      required
                      value={cep}
                      onChange={handleCepChange}
                      className="w-full px-3 py-2 border border-atelier-line outline-none text-xs tracking-widest bg-[#FAF9F6] text-luxe-dark rounded-none font-serif focus:border-luxury"
                      placeholder="36502000"
                      maxLength={8}
                    />
                    {cepLoading && <span className="text-[9px] tracking-wide text-luxury animate-pulse">Consultando...</span>}
                  </div>
                  <div className="col-span-2">
                    <label className="text-[9px] uppercase text-neutral-500 font-sans tracking-luxury block mb-1">Cidade / UF *</label>
                    <div className="grid grid-cols-3 gap-1">
                      <input
                        id="cli-city-input"
                        type="text"
                        required
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        className="col-span-2 px-3 py-2 border border-atelier-line outline-none text-xs bg-white text-luxe-dark rounded-none font-serif focus:border-luxury"
                        placeholder="Ubá"
                      />
                      <input
                        id="cli-state-input"
                        type="text"
                        required
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="px-3 py-2 border border-atelier-line outline-none text-xs bg-white text-luxe-dark rounded-none font-serif text-center uppercase focus:border-luxury"
                        placeholder="MG"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase text-neutral-500 font-sans tracking-luxury block mb-1">Endereço / Logradouro *</label>
                  <input
                    id="cli-address-input"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-atelier-line outline-none text-xs bg-[#FAF9F6] text-luxe-dark rounded-none font-serif focus:border-luxury"
                    placeholder="Avenida Olegário Maciel"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] uppercase text-neutral-500 font-sans tracking-luxury block mb-1">Número *</label>
                    <input
                      id="cli-number-input"
                      type="text"
                      required
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-atelier-line outline-none text-xs bg-[#FAF9F6] text-luxe-dark rounded-none font-serif focus:border-luxury"
                      placeholder="295"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[9px] uppercase text-neutral-500 font-sans tracking-luxury block mb-1">Bairro *</label>
                    <input
                      id="cli-bairro-input"
                      type="text"
                      required
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      className="w-full px-3 py-2 border border-atelier-line outline-none text-xs bg-[#FAF9F6] text-luxe-dark rounded-none font-serif focus:border-luxury"
                      placeholder="Industrial"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase text-neutral-500 font-sans tracking-luxury block mb-1">Complemento / Referência</label>
                  <input
                    id="cli-complement-input"
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className="w-full px-3 py-2 border border-atelier-line outline-none text-xs bg-[#FAF9F6] text-luxe-dark rounded-none font-serif focus:border-luxury"
                    placeholder="Apto 301, bloco B"
                  />
                </div>

                {/* Correios integrated selection */}
                <div className="space-y-2 pt-2">
                  <label className="text-[9px] uppercase text-neutral-500 font-sans tracking-luxury block">Opção de Envio</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      id="corr-pac-btn"
                      type="button"
                      onClick={() => handleShippingTypeChange('PAC')}
                      className={`p-3 border rounded-none flex flex-col items-center justify-center space-y-1 text-xs transition-all ${shippingType === 'PAC' ? 'border-luxury bg-cream-soft text-luxe-dark shadow-md' : 'border-atelier-line hover:border-luxury/50 bg-[#FAF9F6]'}`}
                    >
                      <Truck size={14} className="text-luxury" />
                      <span className="font-medium text-[10px] tracking-luxury">PAC</span>
                      <span className="text-[9px] text-neutral-500 font-sans tracking-wider">
                        {appliedCoupon?.type === 'frete grátis' ? 'R$ 0,00' : `R$ ${shippingCost.toFixed(2)}`}
                      </span>
                    </button>

                    <button
                      id="corr-sedex-btn"
                      type="button"
                      onClick={() => handleShippingTypeChange('SEDEX')}
                      className={`p-3 border rounded-none flex flex-col items-center justify-center space-y-1 text-xs transition-all ${shippingType === 'SEDEX' ? 'border-luxury bg-cream-soft text-luxe-dark shadow-md' : 'border-atelier-line hover:border-luxury/50 bg-[#FAF9F6]'}`}
                    >
                      <Truck size={14} className="text-luxury" />
                      <span className="font-medium text-[10px] tracking-luxury">SEDEX</span>
                      <span className="text-[9px] text-neutral-500 font-sans tracking-wider">
                        {appliedCoupon?.type === 'frete grátis' ? 'R$ 0,00' : `R$ ${shippingCost.toFixed(2)}`}
                      </span>
                    </button>

                    <button
                      id="corr-pickup-btn"
                      type="button"
                      onClick={() => handleShippingTypeChange('Retirada')}
                      className={`p-3 border rounded-none flex flex-col items-center justify-center space-y-1 text-xs transition-all ${shippingType === 'Retirada' ? 'border-luxury bg-cream-soft text-luxe-dark shadow-md' : 'border-atelier-line hover:border-luxury/50 bg-[#FAF9F6]'}`}
                    >
                      <ShoppingBag size={14} className="text-luxury" />
                      <span className="font-medium text-[10px] tracking-luxury">Retirada</span>
                      <span className="text-[9px] text-neutral-500 font-sans tracking-wider font-light">Grátis</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Calculations breakdown and button */}
            <div className="p-5 border-t border-atelier-line bg-white space-y-3 text-xs">
              <div className="flex items-center justify-between text-stone-500 font-sans tracking-luxury uppercase text-[9px]">
                <span>Subtotal Sacola:</span>
                <span className="font-sans font-medium text-luxe-dark">R$ {itemsSubtotal.toFixed(2)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex items-center justify-between text-luxury font-medium font-sans tracking-luxury uppercase text-[9px]">
                  <span>Desconto de Cupom:</span>
                  <span>-R$ {discountValue.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-stone-500 font-sans tracking-luxury uppercase text-[9px] animate-fadeIn">
                <span>Frete ({shippingType}):</span>
                <span className="font-sans font-medium text-luxe-dark">R$ {finalShippingCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-serif text-sm text-luxe-dark border-t border-atelier-line/65 pt-2 pb-1">
                <span className="uppercase tracking-luxury">Total Final da Compra:</span>
                <span className="font-bold text-luxury text-base">R$ {grandTotal.toFixed(2)}</span>
              </div>

              <button
                id="checkout-finalize-btn"
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-luxe-dark hover:bg-luxury hover:text-luxe-dark border border-luxury text-[#FAF9F6] font-sans text-xs uppercase tracking-luxury font-medium transition-colors duration-300 rounded-none flex items-center justify-center space-x-1 disabled:opacity-50 shadow-xl cursor-pointer"
              >
                <span>{submitting ? 'Gerando faturamento...' : 'Finalizar & Enviar WhatsApp'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Completed Checkout Success Indicator */}
        {step === 'completed' && createdOrder && (
          <div id="checkout-completed-stage" className="flex-1 flex flex-col justify-center items-center p-8 space-y-6 text-center animate-fadeIn font-serif">
            <div className="w-16 h-16 bg-cream-soft rounded-none flex items-center justify-center text-luxury border border-luxury/40 shadow-lg">
              <Check size={32} className="stroke-[2.5]" />
            </div>

            <div className="space-y-2 max-w-sm">
              <span className="text-[10px] tracking-luxury font-sans text-luxury uppercase font-medium">
                Pedido Gerado com Sucesso!
              </span>
              <h4 className="text-2xl font-serif text-luxe-dark tracking-wide font-light uppercase">
                {createdOrder.orderNumber}
              </h4>
              <p className="text-stone-500 text-xs font-light leading-relaxed text-justify px-2 font-sans">
                Um documento integrado foi sincronizado em tempo real na nuvem Usepeah. Uma janela foi aberta com sua mensagem pré-formatada para finalização da compra no WhatsApp.
              </p>
            </div>

            <div className="bg-white border border-atelier-line p-5 rounded-none text-left w-full text-xs font-serif space-y-1.5 text-stone-700">
              <div>&bull; <strong>Status:</strong> Novo / Aguardando atendimento</div>
              <div>&bull; <strong>Cliente:</strong> {createdOrder.customerName}</div>
              <div>&bull; <strong>Total:</strong> R$ {createdOrder.total.toFixed(2)}</div>
              <div>&bull; <strong>Entrega:</strong> {createdOrder.shippingType} em {createdOrder.cidade} - {createdOrder.estado}</div>
            </div>

            <button
              id="checkout-completed-done-btn"
              onClick={onClose}
              className="px-6 py-3.5 bg-luxe-dark border border-luxury text-[#FAF9F6] hover:bg-luxury hover:text-luxe-dark text-[11px] uppercase font-sans tracking-luxury rounded-none w-full transition duration-300 shadow-lg cursor-pointer"
            >
              Voltar ao Site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
