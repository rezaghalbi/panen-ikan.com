import multer from 'multer';

// Konfigurasi Lokasi & Nama File (Memory storage untuk upload Supabase)
const storage = multer.memoryStorage();

// Filter: Hanya boleh upload gambar
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

export const uploader = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB
});

export default uploader;
