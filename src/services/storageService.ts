import { supabase, isSupabaseConfigured } from './supabase';

export const storageService = {
  /**
   * Compresses an image file in browser using HTML Canvas before upload.
   * If compression fails or format is unsupported, gracefully falls back to the original file.
   */
  async compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          try {
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
          } catch (e) {
            console.warn('Canvas compression fallback to original file:', e);
            resolve(file);
          }
        };

        img.onerror = (err) => {
          URL.revokeObjectURL(objectUrl);
          console.warn('Image decode error, uploading original file directly:', err);
          resolve(file);
        };
      } catch (err) {
        console.warn('compressImage exception, fallback to original:', err);
        resolve(file);
      }
    });
  },

  /**
   * Uploads an image to Supabase Storage bucket 'store-assets' or converts to data URL in demo mode
   */
  async uploadStoreAsset(file: File, folder = 'products'): Promise<string> {
    const compressedBlob = await this.compressImage(file);
    const ext = compressedBlob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg');
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.storage
        .from('store-assets')
        .upload(fileName, compressedBlob, {
          contentType: compressedBlob.type || 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('Storage upload error:', error);
        if ((error as any).statusCode === '403' || (error as any).status === 403 || error.message?.includes('row-level security')) {
          throw new Error('Permiso de subida denegado. Por favor verifica que tu sesión esté iniciada.');
        }
        throw new Error(`Error al subir imagen: ${error.message || 'Verifica tu conexión.'}`);
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

