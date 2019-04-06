const fs = require('fs').promises;
const path = require('path');

const replaceOldImages = async (newImage, oldImage) => {
    if (!newImage || !oldImage || newImage === oldImage)
        return false;

    try {
        await fs.unlink(path.join(__dirname, '../../../', oldImage));
        return newImage;
    } catch (error) {
        throw error;
    }
};

module.exports = replaceOldImages;