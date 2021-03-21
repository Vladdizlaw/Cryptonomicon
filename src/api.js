const API = "1ee2f607bb918c3d5b039251e1cfc0bac70df8a3092d7f5e4f18bcc2618e2de2";
const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API}`
);
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
    const { TYPE: type, FROMSYMBOL: currency, PRICE: price } = JSON.parse(
      e.data
    );

    if (type != "5") {
      return;
    }
    const handlers = tickersHandlers.get(currency) ?? [];

    handlers.forEach(handler => handler(price));
  });
}
function unsubscribeFromTickerOnWebsocket(tickerName) {
  const message = JSON.stringify({
    action: "SubRemove",
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
}

/*export async function getCurrencyData() {
  if (tickersHandlers.size === 0) {
    return;
  }
  const tickerListNames = [...tickersHandlers.keys()].join(",");

  const res = await fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickerListNames}&tsyms=USD&api_key=${API}`
  );
  const js = await res.json();

  const updatedPrices = Object.fromEntries(
    Object.entries(js).map(([name, price]) => [name, price["USD"]])
  );
  Object.entries(updatedPrices).forEach(([currency, price]) => {
    //Запускаем каждую функцию в tickerHandlerе
    const handlers = tickersHandlers.get(currency) ?? [];
    handlers.forEach(handler => handler(price));
  });
  return updatedPrices;
}*/
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
