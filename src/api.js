//const API = "1ee2f607bb918c3d5b039251e1cfc0bac70df8a3092d7f5e4f18bcc2618e2de2";
import Worker from "worker-loader!./worker.js";

const tickersHandlers = new Map();
const worker = new Worker();
const bc = new BroadcastChannel("wssChannel1");
worker.start;

let countRuns = false;
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

  worker.postMessage(message);

  worker.onmessage = e => {
    const { PRICE: newPrice, FROMSYMBOL: currency } = JSON.parse(e.data);
    if (!!newPrice && currency === "BTC") {
      BTCPrice = newPrice;
    }
  };

  flagSetBTC = true;
}

function subscribeToTickerOnWebsocket(tickerName) {
  const message = JSON.stringify({
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickerName}~USD`]
  });

  worker.postMessage(message);

  bc.onmessage = e => {
    //console.log("answer from worker", e.data);
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
    if (
      type == "500" &&
      !!info &&
      info.includes("We have not integrated ") &&
      parameter.split("~")[3] === "USD"
    ) {
      if (countRuns) {
        countRuns = !countRuns;
        return;
      }

      if (!flagSetBTC) {
        setBtcPrice();
      }
      countRuns = !countRuns;

      let curBTC = parameter.split("~")[2];
      let message = JSON.stringify({
        action: "SubAdd",
        subs: [`5~CCCAGG~${curBTC}~BTC`]
      });

      worker.postMessage(message);

      subscribedBTC.add(curBTC);
    }
    const handlers = tickersHandlers.get(currency) ?? [];

    handlers.forEach(handler => handler(price));
  };
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

  worker.postMessage(message);
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

    unsubscribeFromTickerOnWebsocket("BTC");
  }
};
