const axios = require('axios');
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

const getPrediction = async (features) => {
    try {
        const response = await axios.post(`${ML_API_URL}/predict`, features, {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            throw new Error('ML API unavailable. Check if Python service is running.');
        }
        throw new Error(`ML API error: ${err.response?.data?.error || err.message}`);
    }
};

module.exports = { getPrediction };
