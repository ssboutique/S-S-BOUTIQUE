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
   * Builds the dynamic items block (same format for both templated and default messages)
   */
  _buildItemsBlock(items: CartItem[], currency: string): string {
    let block = '';
    items.forEach((item, index) => {
      block += `${index + 1}. *${item.name}*\n`;
      block += `   Cantidad: ${item.quantity}\n`;

      if (item.selectedVariants && Object.keys(item.selectedVariants).length > 0) {
        const variantText = Object.entries(item.selectedVariants)
          .map(([type, val]) => `${type}: ${val}`)
          .join(' | ');
        block += `   Detalles: ${variantText}\n`;
      }

      block += `   Precio: ${formatCurrency(item.price, currency)}\n`;
      block += `   Subtotal: ${formatCurrency(item.price * item.quantity, currency)}\n`;
      if (index < items.length - 1) block += '\n';
    });
    return block;
  },

  /**
   * Replaces all supported template variables in a string
   */
  _applyTemplateVars(
    text: string,
    store: Store,
    customer: CheckoutCustomerData,
    subtotal: number,
    total: number,
    currency: string
  ): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fecha = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    return text
      .replace(/\{\{TIENDA\}\}/g, store.name)
      .replace(/\{\{NOMBRE\}\}/g, customer.name)
      .replace(/\{\{TELEFONO\}\}/g, customer.phone)
      .replace(/\{\{DIRECCION\}\}/g, customer.address || '')
      .replace(/\{\{TOTAL\}\}/g, formatCurrency(total, currency))
      .replace(/\{\{SUBTOTAL\}\}/g, formatCurrency(subtotal, currency))
      .replace(/\{\{NOTAS\}\}/g, customer.notes?.trim() || '')
      .replace(/\{\{FECHA\}\}/g, fecha);
  },

  /**
   * Formats the order summary into a clean, minimalist, high-end message.
   * If the store has a custom whatsapp_order_template, it is used as the base;
   * otherwise the hardcoded default is used unchanged.
   */
  generateOrderMessage(payload: WhatsAppOrderPayload): string {
    const { store, items, customer, subtotal, total } = payload;
    const currency = store.currency || 'COP';
    const customTemplate = store.theme_settings?.whatsapp_order_template;
    const itemsBlock = this._buildItemsBlock(items, currency);

    if (customTemplate && customTemplate.trim()) {
      const SEPARATOR = '---ITEMS---';
      let message: string;

      if (customTemplate.includes(SEPARATOR)) {
        const parts = customTemplate.split(SEPARATOR);
        const header = this._applyTemplateVars(parts[0], store, customer, subtotal, total, currency);
        const footer = this._applyTemplateVars(parts[1], store, customer, subtotal, total, currency);
        message = `${header}\n${itemsBlock}\n${footer}`;
      } else {
        const base = this._applyTemplateVars(customTemplate, store, customer, subtotal, total, currency);
        message = `${base}\n\n${itemsBlock}`;
      }

      return message;
    }

    // ── Default hardcoded message (unchanged behavior) ──
    let message = `SOLICITUD DE PEDIDO\n`;
    message += `${store.name.toUpperCase()}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    message += itemsBlock + '\n';

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
