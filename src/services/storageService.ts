import { supabase, isSupabaseConfigured } from './supabase';

export const storageService = {
  /**
   * Compresses an image file in browser using HTML Canvas before upload
   */
  async compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = (err) => reject(err);
    });
  },

  /**
   * Uploads an image to Supabase Storage bucket 'store-assets' or converts to data URL in demo mode
   */
  async uploadStoreAsset(file: File, folder = 'products'): Promise<string> {
    const compressedBlob = await this.compressImage(file);
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.storage
        .from('store-assets')
        .upload(fileName, compressedBlob, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error('No se pudo subir la imagen. Verifica tu conexión.');
      }

      const { data: publicUrlData } = supabase.storage
        .from('store-assets')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    }

    // Demo Mode / Offline fallback: Convert to Base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(compressedBlob);
    });
  },
};
