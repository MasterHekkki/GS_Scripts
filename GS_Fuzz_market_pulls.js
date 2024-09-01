
/**
 * Query's Fuzz market API for the given types in batches and return all available data
 * @param {range} type_ids A vertical range of type_ids.
 * @return {Array} minSell, maxBuy, and all other data for each type_id
 * @customfunction
 */
function fuzzApiPriceData(type_ids) {
  if (!type_ids) throw new Error('type_ids is required');
  
  // Filter out blank or empty cells
  const ids = Array.isArray(type_ids) 
    ? type_ids.map(row => row[0]).filter(id => id) 
    : [type_ids].filter(id => id);
  
  const batchSize = 60; // Set batch size to 60 to avoid exceeding URL length limit
  let results = [['Item ID', 'minSell', 'maxBuy',
                  'buy_weightedAverage', 'buy_max', 'buy_min', 'buy_stddev', 'buy_median', 'buy_volume', 'buy_orderCount', 'buy_percentile',
                  'sell_weightedAverage', 'sell_max', 'sell_min', 'sell_stddev', 'sell_median', 'sell_volume', 'sell_orderCount', 'sell_percentile']];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batchIds = ids.slice(i, i + batchSize);
    const apiUrl = `https://market.fuzzwork.co.uk/aggregates/?station=60003760&types=${batchIds.join(',')}`;

    try {
      const response = UrlFetchApp.fetch(apiUrl);
      const fuzz_price_data = JSON.parse(response.getContentText());

      const batchResults = batchIds.map(type_id => {
        const buyData = fuzz_price_data[type_id]?.buy || {};
        const sellData = fuzz_price_data[type_id]?.sell || {};

        return [
          type_id,
          parseFloat(sellData.min || 'N/A'),  // minSell
          parseFloat(buyData.max || 'N/A'),   // maxBuy
          parseFloat(buyData.weightedAverage || 'N/A'), 
          parseFloat(buyData.max || 'N/A'), 
          parseFloat(buyData.min || 'N/A'), 
          parseFloat(buyData.stddev || 'N/A'), 
          parseFloat(buyData.median || 'N/A'), 
          parseFloat(buyData.volume || 'N/A'), 
          parseInt(buyData.orderCount || 'N/A'), 
          parseFloat(buyData.percentile || 'N/A'),
          parseFloat(sellData.weightedAverage || 'N/A'), 
          parseFloat(sellData.max || 'N/A'), 
          parseFloat(sellData.min || 'N/A'), 
          parseFloat(sellData.stddev || 'N/A'), 
          parseFloat(sellData.median || 'N/A'), 
          parseFloat(sellData.volume || 'N/A'), 
          parseInt(sellData.orderCount || 'N/A'), 
          parseFloat(sellData.percentile || 'N/A')
        ];
      });

      results = results.concat(batchResults);
    } catch (error) {
      throw new Error(`Error fetching data for batch starting with ${batchIds[0]}: ${error.message}`);
    }
  }

  return results;
}



