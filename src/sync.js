const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config(); // if using a .env file for credentials

async function updateInventoryByProductId(storeName, accessToken, productId, quantity) {
    const url = `https://${storeName}.myshopify.com/admin/api/2023-07/inventory_levels/set.json`;

    const data = {
        location_id: '',
        inventory_item_id: productId,
        available: quantity,
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
        });
        console.log(`Updated Product ID: ${productId} with quantity: ${quantity}`);
        return response.data;
    } catch (error) {
        console.error(`Error updating Product ID: ${productId} - ${error.response?.data?.errors || error.message}`);
    }
}

async function updateInventoryBySku(storeName, accessToken, sku, quantity) {
    const url = `https://${storeName}.myshopify.com/admin/api/2023-07/inventory_items.json?sku=${sku}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
        });

        if (response.data.inventory_items.length === 0) {
            console.log(`No product found with SKU: ${sku}`);
            return;
        }

        const inventoryItemId = response.data.inventory_items[0].id;

        await updateInventoryByProductId(storeName, accessToken, inventoryItemId, quantity);
    } catch (error) {
        console.error(`Error updating SKU: ${sku} - ${error.response?.data?.errors || error.message}`);
    }
}

async function processCsvFile(storeName, accessToken, csvFilePath, updateOption) {
    const results = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            for (const item of results) {
                const quantity = parseInt(item.quantity, 10);

                if (updateOption === 'productId') {
                    const productId = item.product_id;
                    await updateInventoryByProductId(storeName, accessToken, productId, quantity);
                } else if (updateOption === 'sku') {
                    const sku = item.sku;
                    await updateInventoryBySku(storeName, accessToken, sku, quantity);
                }
            }
        });
}

async function processThirdPartyData(storeName, accessToken, thirdPartyData, updateOption) {
    for (const item of thirdPartyData) {
        const quantity = parseInt(item.quantity, 10);

        if (updateOption === 'productId') {
            const productId = item.product_id;
            await updateInventoryByProductId(storeName, accessToken, productId, quantity);
        } else if (updateOption === 'sku') {
            const sku = item.sku;
            await updateInventoryBySku(storeName, accessToken, sku, quantity);
        }
    }
}

(async () => {
    const storeName = process.env.SHOP_NAME 
    const accessToken = process.env.SHOP_ACCESS_TOKEN 
    const updateOption = process.env.UPDATE_OPTION || 'productId'; // 'productId' or 'sku'
    await processCsvFile(storeName, accessToken, csvFilePath, updateOption);
    // await processThirdPartyData(storeName, accessToken, thirdPartyData, updateOption);
})();

