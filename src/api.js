const API = "1ee2f607bb918c3d5b039251e1cfc0bac70df8a3092d7f5e4f18bcc2618e2de2";
const tickersHandlers= new Map();
export async function getCurrencyData() {
  if (tickersHandlers.size===0){
    return
  }
  const tickerListNames = [...tickersHandlers.keys()].join(",");
 
  const res = await fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickerListNames}&tsyms=USD&api_key=${API}`
  );
  const js = await res.json();

 const updatedPrices= Object.fromEntries(
    Object.entries(js).map(([name, price]) => [name, price["USD"]])
  );
  Object.entries(updatedPrices).forEach(([currency,price])=>{
    const handlers=tickersHandlers.get(currency)??[]
    handlers.forEach(handler=>handler(price))
  })
  return updatedPrices
}
export const subscribeToTicker = (ticker,cb)=> {
  const subscriber=tickersHandlers.get(ticker)??[]
  tickersHandlers.set(ticker,[...subscriber,cb])
}
export const unsubscribeFromTicker=(ticker)=>{
 
  tickersHandlers.delete(ticker)
}
window.tickers=tickersHandlers
