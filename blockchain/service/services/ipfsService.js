const PinataSDK = require("@pinata/sdk");
const fs = require("fs");
require("dotenv").config();

const pinata = new PinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

class IpfsService {
  async uploadFile(buffer, filename) {
    try {
      const readableStream = fs.createReadStream(filename);
      const result = await pinata.pinFileToIPFS(readableStream);
      return { success: true, hash: result.IpfsHash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async uploadJSON(json) {
    try {
      const result = await pinata.pinJSONToIPFS(json);
      return { success: true, hash: result.IpfsHash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFileByHash(hash) {
    try {
      // Trả về URL public gateway
      const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
      return { success: true, url };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new IpfsService();
