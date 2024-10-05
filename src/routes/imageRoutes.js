// src/routes/imageRoutes.js
import express from 'express';
import { uploadImage, getOptimizeUrl, getAutoCropUrl } from '../services/cloudinaryService';

const router = express.Router();

router.post('/upload', async (req, res) => {
    const { imageUrl, publicId } = req.body;

    try {
        const uploadResult = await uploadImage(imageUrl, publicId);
        res.json({
            uploadResult,
            optimizeUrl: getOptimizeUrl(publicId),
            autoCropUrl: getAutoCropUrl(publicId),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading image' });
    }
});

export default router;
