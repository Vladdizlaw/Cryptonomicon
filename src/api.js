const API = "1ee2f607bb918c3d5b039251e1cfc0bac70df8a3092d7f5e4f18bcc2618e2de2";
const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API}`
);
let BTCPrice=undefined
let flag=false
function setBtcPrice(){
  if (tickersHandlers.has('BTC')){
    console.log('ret')
    return
  }
  const message = JSON.stringify({
    action: "SubAdd",
    subs: [`5~CCCAGG~BTC~USD`]
  });
  if (socket.readyState == WebSocket.OPEN) {
    socket.send(message);
  }
  socket.addEventListener('open',()=>{
    socket.send(message)
  },{once:true})
  socket.addEventListener('message',e=>{
   const  {PRICE:newPrice} = JSON.parse(e.data)
  newPrice?BTCPrice=newPrice:null
  console.log(newPrice)
  })
}

function subscribeToTickerOnWebsocket(tickerName) {
  const message = JSON.stringify({
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickerName}~USD`]
  });
  if (socket.readyState == WebSocket.OPEN) {
    socket.send(message);
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(message);
    },
    { once: true }
  );
  socket.addEventListener("message", e => {
    let {INFO:info, TYPE: type, FROMSYMBOL: currency, PRICE: price } = JSON.parse(
      e.data
    );

    if (type != "5" && type != '500') {
      return;
    }
    if(tickerName=='BTC'){

      BTCPrice=price
    }else { setBtcPrice() }
    if (tickerName!='BTC'&& type=='500' && info&&info.includes('We have not integrated ')){

        let message = JSON.stringify({
        action: "SubAdd",
        subs: [`5~CCCAGG~${tickerName}~BTC`]
      });
      if (socket.readyState == WebSocket.OPEN) {
        socket.send(message);
      }
      socket.addEventListener('open',()=>{
        socket.send(message)
      },{once:true})
      socket.addEventListener ('message', e=>{
       const  {PRICE:newPrice} = JSON.parse(e.data)
      
        price=newPrice*BTCPrice
        flag=true;
       console.log('BTC:',BTCPrice,price)
      
      })
      
    } 
    const handlers = tickersHandlers.get(currency) ?? [];
  
    handlers.forEach(handler => handler(price));
  });
}

function unsubscribeFromTickerOnWebsocket(tickerName) {
  let curr='USD'
  if (flag){
    curr='BTC'
    flag=false
  }
  const message = JSON.stringify({
    action: "SubRemove",
    subs: [`5~CCCAGG~${tickerName}~${curr}`]
  });
  if (socket.readyState == WebSocket.OPEN) {
    socket.send(message);
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(message);
    },
    { once: true }
  );
}

export const subscribeToTicker = (ticker, cb) => {
  //подписка на тикер, дописывает в tickerHandler, ticker и массив функций для вызова
  //если тикера нет ,заводит в tickerHandler пустой массив функций
  const subscriber = tickersHandlers.get(ticker) ?? [];
  tickersHandlers.set(ticker, [...subscriber, cb]);
  subscribeToTickerOnWebsocket(ticker);
};

export const unsubscribeFromTicker = ticker => {
  //Отписка от тикера , просто удаляет тикер из tickerHandler
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWebsocket(ticker);
};
