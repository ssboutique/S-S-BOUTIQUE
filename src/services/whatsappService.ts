import type { CartItem, CheckoutCustomerData } from '../types/cart';
import type { Store } from '../types/database';
import { formatCurrency } from '../utils/currency';

export interface WhatsAppOrderPayload {
  store: Store;
  items: CartItem[];
  customer: CheckoutCustomerData;
  subtotal: number;
  total: number;
}

export const whatsappService = {
  /**
   * Sanitizes a phone number to international WhatsApp format (digits only)
   */
  sanitizePhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('3')) {
      return `57${digits}`;
    }
    return digits;
  },

  /**
   * Formats the order summary into a clean, minimalist, high-end message (No generic emojis)
   */
  generateOrderMessage(payload: WhatsAppOrderPayload): string {
    const { store, items, customer, subtotal, total } = payload;
    const currency = store.currency || 'COP';

    let message = `SOLICITUD DE PEDIDO\n`;
    message += `${store.name.toUpperCase()}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Items list
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   Cantidad: ${item.quantity}\n`;

      if (item.selectedVariants && Object.keys(item.selectedVariants).length > 0) {
        const variantText = Object.entries(item.selectedVariants)
          .map(([type, val]) => `${type}: ${val}`)
          .join(' | ');
        message += `   Detalles: ${variantText}\n`;
      }

      message += `   Precio: ${formatCurrency(item.price, currency)}\n`;
      message += `   Subtotal: ${formatCurrency(item.price * item.quantity, currency)}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*Subtotal:* ${formatCurrency(subtotal, currency)}\n`;
    message += `*Total a Pagar:* ${formatCurrency(total, currency)}\n\n`;

    message += `DATOS DE ENTREGA:\n`;
    message += `• Nombre: ${customer.name}\n`;
    message += `• Contacto: ${customer.phone}\n`;
    if (customer.address) {
      message += `• Dirección: ${customer.address}\n`;
    }

    if (customer.notes && customer.notes.trim()) {
      message += `\nOBSERVACIONES:\n${customer.notes.trim()}\n`;
    }

    message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `_Pedido generado desde la tienda oficial_`;

    return message;
  },

  /**
   * Generates direct WhatsApp URL with sanitized phone number and encoded message
   */
  generateWhatsAppUrl(payload: WhatsAppOrderPayload): string {
    const phoneNumber = this.sanitizePhoneNumber(payload.store.whatsapp_number);
    const text = this.generateOrderMessage(payload);
    const encodedText = encodeURIComponent(text);

    return `https://wa.me/${phoneNumber}?text=${encodedText}`;
  },

  /**
   * Dispatches WhatsApp navigation smoothly across desktop and mobile devices
   */
  sendOrderViaWhatsApp(payload: WhatsAppOrderPayload): void {
    const url = this.generateWhatsAppUrl(payload);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
