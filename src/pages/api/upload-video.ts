import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Validar credenciales
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return res.status(500).json({ 
        error: 'Credenciales de Cloudinary no configuradas',
      });
    }

    const maxSizeBytes = 500 * 1024 * 1024;
    const contentLength = Number(req.headers['content-length'] || 0);
    if (contentLength > maxSizeBytes) {
      return res.status(413).json({ error: 'Video muy grande. Máximo 500MB.' });
    }

    let bytesRead = 0;

    const result = await new Promise((resolve, reject) => {
      let settled = false;
      const finish = (err?: Error | null, value?: any) => {
        if (settled) return;
        settled = true;
        if (err) reject(err);
        else resolve(value);
      };

      console.log('Starting Cloudinary upload stream...');
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'rifas_videos',
          resource_type: 'video',
          timeout: 10 * 60 * 1000,
        },
        (error, uploadResult) => {
          if (error) {
            console.error('Cloudinary error:', error);
            finish(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            console.log('Upload success:', uploadResult?.public_id);
            finish(null, uploadResult);
          }
        }
      );

      req.on('data', (chunk: Buffer) => {
        bytesRead += chunk.length;
        if (bytesRead > maxSizeBytes) {
          const sizeError = new Error('Video muy grande. Máximo 500MB.');
          req.destroy(sizeError);
          uploadStream.destroy(sizeError);
          finish(sizeError);
        }
      });

      req.on('aborted', () => finish(new Error('La subida fue cancelada por el cliente.')));
      req.on('error', (err) => finish(err));
      uploadStream.on('error', (err) => finish(err));

      req.pipe(uploadStream);
    });

    const uploadResult = result as any;

    return res.status(200).json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error: any) {
    console.error('Video upload error:', error);
    return res.status(500).json({
      error: error?.message || 'Error desconocido al subir video a Cloudinary',
    });
  }
}
