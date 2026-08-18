const BaseProvider = require('../../contracts/provider.interface');

class PerceptualHashProvider extends BaseProvider {
  constructor() {
    super('perceptual-hash');
  }

  /**
   * Computes a lightweight structural hash from image buffer data.
   * @param {Buffer} imageBuffer 
   */
  async query(imageBuffer) {
    if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
      throw new Error('Image buffer is required for perceptual hashing');
    }

    // Fallback simple checksum hash for layout comparison
    let hash = 0;
    for (let i = 0; i < imageBuffer.length; i += 64) {
      hash = (hash << 5) - hash + imageBuffer[i];
      hash |= 0;
    }

    return {
      perceptualHash: hash.toString(16),
      sizeBytes: imageBuffer.length
    };
  }
}

module.exports = PerceptualHashProvider;
