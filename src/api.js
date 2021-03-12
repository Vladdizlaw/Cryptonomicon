 const API='1ee2f607bb918c3d5b039251e1cfc0bac70df8a3092d7f5e4f18bcc2618e2de2'
export async function getCurrencyData (tickerName){
          const tickerListNames=tickerName.join(',') 
          console.log(tickerListNames)
         const res = await fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickerListNames}&api_key=${API}`
  )
       const js= await res.json() 
      
        return Object.fromEntries(Object.entries(js).map(([name,price])=>[name,1/price]))
     }