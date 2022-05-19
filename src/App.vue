<template>
  <div class="wraper">
    <InputSection
      :coinsList="this.coinsList"
      :tickersName="this.tickersName"
      @add-ticker="btnAdd"
    />
    <hr />
    
    <wallet-section
      @selected="selectTicker"
      :filteredTickers="this.filteredTickers"
      @btn-delete="btnDelete"
    />
<filter-section
      :tickersLength="this.tickers.length"
      :filterpage="this.filterpage"
      @filterpage="filterAndPageGet"
    />

    <hr />

    <graph-section
      :maxHeightBar="this.maxHeightBar"
      :selected="this.selected"
      @selectedNull="selectTicker"
      @refs="this.calculateMaxBarElements"
    />
  </div>
</template>

<script>
import {
  getCoinList,
  subscribeToTicker,
  unsubscribeFromTicker,
} from "./api.js";
import InputSection from "./components/InputSection.vue";
import WalletSection from "./components/WalletSection.vue";
import GraphSection from "./components/GraphSection.vue";
import FilterSection from "./components/FilterSection.vue";

export default {
  name: "App",
  components: {
    InputSection,
    WalletSection,
    GraphSection,
    FilterSection,
  },
  data() {
    return {
      filter: "", //Фильтр
      filterpage: 1,

      tickers: [],
      coinsList: null,
      selected: null,
      graph: {},
      maxBarElements: null,

      // messages: { mess: null, errors: null },
    };
  },
  watch: {
    filterAndPage(value) {
      //Смотрим за вычисляемым свойством  filterAndPage(возращает объект с filter:this.filter и
      //page:this.filterpage),если оно меняется то меняем адресную строку
      const url = new URL(window.location);
      url.searchParams.set("filter", value.filter);
      url.searchParams.set("page", value.page);
      window.history.pushState(true, "", url);
    },
  },

  computed: {
    filterAndPage() {
      //Свойство возращающее this.filter и this.filterpage в ввиде объекта.
      //Нужна для отображения этих параметров в адресной строке

      return {
        filter: this.filter,
        page: this.filterpage,
      };
    },
    filteredTickers() {
      //Свойство отображающее тикеры согласно filter и разбивка на страницы
      const start = (this.filterpage - 1) * 6;
      const end = this.filterpage * 6;
      return this.tickers
        .filter((el) => el.name.includes(this.filter.toUpperCase()))
        .slice(start, end);
    },

    tickersName() {
      return this.tickers.map((el) => el.name);
    },

    maxHeightBar() {
      //Вывод графика , возвращает объект с данными высоты бара и ключом именем выбранного элемента
      let result = {};

      if (this.graph[this.selected?.name]) {
        let max = Math.max(...this.graph[this.selected?.name]);
        let min = Math.min(...this.graph[this.selected?.name]);
        this.graph[this.selected.name]?.forEach((el) => {
          let procent = 5 + ((el - min) * 95) / (max - min);
          result[el] = procent;
        });
      }

      return result;
    },
  },
  async created() {
    //при создпние запросом получает и записывает в coinList список валют,
    //затем проверяет localstorage и если он есть берет из него данные и записывает в tickers
    //после этого проверяет есть ли в url параметры filter и page и восстанавливает их если они есть
    //далее для всех тикеров в tickers запускает updatePrice()

    const data = await getCoinList();
    this.coinsList = data.Data;

    if (localStorage.tickersList) {
      this.tickers = JSON.parse(localStorage.getItem("tickersList"));
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (price) => {
          this.updateTicker(ticker.name, price);
        });
      });
    }
    const url = new URL(window.location);
    if (url.searchParams.has("filter") || url.searchParams.has("page")) {
      this.filter = url.searchParams.get("filter");
      this.filterpage = Number(url.searchParams.get("page"));
    }
  },
  mounted() {
    // window.addEventListener("resize", this.calculateMaxBarElements());
  },
  beforeUnmount() {
    // window.removeEventListener("resize", this.calculateMaxBarElements());
  },
  updated() {
    localStorage.setItem("tickersList", JSON.stringify(this.tickers));
  },
  methods: {
    filterAndPageGet(value) {
      //Свойство возращающее this.filter и this.filterpage в ввиде объекта.
      //Получение из компоеннта filter ,filterpage

      this.filter = value.filter;
      this.filterpage = value.filterpage;
      return {
        filter: this.filter,
        page: this.filterpage,
      };
    },
    selectTicker(data) {
      this.selected = data;
    },
    chooseClassDownPrice(t) {
      if (t?.history[-1] < t?.history[-2]) {
        return true;
      }
    },
    chooseClassUpPrice(t) {
      if (t?.history[-1] > t?.history[-2]) {
        return true;
      }
    },
    calculateMaxBarElements(refs) {
      const barWidth = refs?.bar?.clientWidth || 16;
      this.maxBarElements = refs?.graph?.clientWidth / barWidth;
      console.log("bar width:", refs?.bar?.clientWidth);
      console.log("graph div width:", refs?.graph?.clientWidth);
      console.log("maxelement", this.maxBarElements);
    },

    updateTicker(tickerName, price) {
      if (!price) {
        return;
      }
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((el) => {
          //Отображаем цены в божеском виде

          price > 1
            ? (price = price.toFixed(2))
            : (price = price.toPrecision(2));
          el.history?.push(el.price);
          console.log(el.price);

          el.price = price;
          if (!this.graph[el.name]) {
            this.graph[el.name] = [];
          }
          if (price) {
            this.graph[el.name].push(price);
            console.log(this.maxBarElements);
            while (this.graph[el.name].length > this.maxBarElements) {
              this.graph[el.name].shift();
            }
          }
        });
    },

    btnAdd(ticker) {
      //Добаляет выбранный тикер в массив tickers

      const added = {
        name: ticker.toUpperCase(),
        price: "--",
        history: [],
        fullName: this.coinsList[ticker.toUpperCase()]["FullName"],
      };
      this.tickers.push(added);
      subscribeToTicker(added.name, (price) => {
        this.updateTicker(added.name, price);
      });
      //После этого очишает инпут добавления  и фильтр ,переставляет страницу на первую
      // и записывает в локалсторэйдж
      //this.ticker = "";
      this.filter = "";
      this.filterpage = Math.round((this.tickers.length + 2) / 6);
      localStorage.setItem("tickersList", JSON.stringify(this.tickers));
    },
    btnDelete(name) {
      //Удаляет из массива по имени ,  убирает с него выбор и если страниц стало меньше
      //то переставляет страницу и записывает в локал сторэйдж
      let ind = this.tickers.findIndex((el) => el.name === name);
      if (this.tickers[ind] == this.selected) {
        this.selected = null;
      }
      unsubscribeFromTicker(this.tickers[ind].name);

      this.tickers.splice(ind, 1);

      localStorage.setItem("tickersList", JSON.stringify(this.tickers));
      if (Math.round((this.tickers.length + 2) / 6) < this.filterpage) {
        this.filterpage--;
      }
    },
  },
};
</script>

<style src="./style.css"></style>
