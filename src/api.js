const API = "1ee2f607bb918c3d5b039251e1cfc0bac70df8a3092d7f5e4f18bcc2618e2de2";
const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API}`
);
let flagSetBTC = false;
let BTCPrice = undefined;
let subscribedBTC = new Set();
function setBtcPrice() {
  if (flagSetBTC) {
    console.log("ret");
    return;
  }

  const message = JSON.stringify({
    action: "SubAdd",
    subs: [`5~CCCAGG~BTC~USD`]
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
    const { PRICE: newPrice, FROMSYMBOL: currency } = JSON.parse(e.data);
    if (!!newPrice && currency === "BTC") {
      BTCPrice = newPrice;
    }
  });
  flagSetBTC = true;
  console.log(flagSetBTC);
}

function subscribeToTickerOnWebsocket(tickerName) {
  let countRuns = 0;
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
    let {
      INFO: info,
      TYPE: type,
      FROMSYMBOL: currency,
      PRICE: price,
      PARAMETER: parameter,
      TOSYMBOL: quote
    } = JSON.parse(e.data);

    if (type != "5" && type != "500") {
      return;
    }
    if (currency == "BTC" && !!price) {
      BTCPrice = price;
      flagSetBTC = true;
    }
    if (quote == "BTC") {
      price = price * BTCPrice;
    }
    if (type == "500" && !!info && info.includes("We have not integrated ")) {
      if (countRuns > 0) {
        return;
      }
      countRuns++;
      console.log(countRuns);
      if (!flagSetBTC) {
        setBtcPrice();
      }

      let curBTC = parameter.split("~")[2];
      let message = JSON.stringify({
        action: "SubAdd",
        subs: [`5~CCCAGG~${curBTC}~BTC`]
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

      subscribedBTC.add(curBTC);
    }
    const handlers = tickersHandlers.get(currency) ?? [];

    handlers.forEach(handler => handler(price));
  });
}

function unsubscribeFromTickerOnWebsocket(tickerName) {
  let curr = "USD";
  if (subscribedBTC.has(tickerName)) {
    curr = "BTC";

    subscribedBTC.delete(tickerName);
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
  if (tickersHandlers.size === 0) {
    flagSetBTC = false;
    console.log(flagSetBTC);
    unsubscribeFromTickerOnWebsocket("BTC");
  }
};
