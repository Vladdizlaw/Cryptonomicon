<template>
  <div class="wraper">
    <div class="forinput">
      <p>ticker</p>
      <input
        type="text"
        v-model="ticker"
        @keydown.enter="validation() ? btnAdd() : null"
        class="generalinput"
      />
      <div v-if="messages.mes" class="messagesfield">
        <p
          v-for="(mes, ind) in messages.mes"
          :key="ind"
          @click="
            ticker = mes;
            validation() ? btnAdd() : null;
          "
        >
          {{ mes }}
        </p>
      </div>
      <div v-if="messages.errors" class="errorsfield">
        <p>{{ messages.errors }}</p>
      </div>
      <button class="btn btn-add" v-on:click="validation() ? btnAdd() : null">
        add
      </button>
    </div>
    <hr />
    <div class="filter" v-if="tickers.length != 0">
      <p>Filter:</p>
      <input
        type="text"
        class="filterinput"
        v-model="filter"
        @input="filterpage = 1"
      />
      <div class="controlpages" v-show="this.tickers.length > 6">
        <button
          class="btn prevpage"
          v-if="filterpage > 1"
          @click="filterpage--"
        >
          &#129128;
        </button>
        <p>{{ filterpage }} from {{ Math.round((tickers.length + 2) / 6) }}</p>
        <button
          class="btn nextpage"
          @click="filterpage++"
          v-if="tickers.length / 6 > filterpage"
        >
          &#129130;
        </button>
      </div>
    </div>

    <kinesis-container :duration="300" perspective="2500">
      <div class="forwallets">
        <div
          @click="selected === t ? (selected = null) : (selected = t)"
          v-for="(t, i) in filteredTickers"
          :key="i"
          
        >
          <kinesis-element :strength="10" type="depth"
            ><div class="walletblock" :class="{ active: t === selected,disabled: t.price === '--' }">
              <kinesis-element :strength="14" type="depth">
                <p>{{ t.name }}/USD</p></kinesis-element
              >
              <kinesis-element :strength="12" type="depth"
                ><p>{{ t.fullName }}</p>
              </kinesis-element>
              <kinesis-element :strength="15" type="depth">
                <h1
                  class="price"
                  :class="{
                    down: t.history[-1] < t.history[-2],
                    up: t.price > t.history[-2]
                  }"
                >
                  {{ t.price }}
                </h1>
              </kinesis-element>

              <kinesis-element :strength="15" type="depth"
                ><h4 @click.stop="btnDelete(t.name)">
                  Delete
                </h4></kinesis-element
              >
            </div></kinesis-element
          >
        </div>
      </div></kinesis-container
    >

    <hr />

    <div v-if="selected" class="outputdisplay">
      <button @click="selected = null" class="closeoutput">X</button>

      <div v-if="selected != null" class="graph" ref="graph">
        <div
          v-for="(key, ind) in Object.keys(maxHeightBar)"
          :key="key"
          :title="key"
          :style="{ height: maxHeightBar[key] + '%' }"
          class="bar"
          ref="bar"
          :class="{
            up:
              maxHeightBar[Object.keys(maxHeightBar)[ind - 1]] <
              maxHeightBar[Object.keys(maxHeightBar)[ind]],
            down:
              maxHeightBar[Object.keys(maxHeightBar)[ind - 1]] >
              maxHeightBar[Object.keys(maxHeightBar)[ind]]
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCoinList, subscribeToTicker, unsubscribeFromTicker } from "./api.js";

export default {
  name: "App",
  data() {
    return {
      filter: "",//Фильтр
      filterpage: 1,
      ticker: "",
      tickers: [],
      coinsList: null,
      selected: null,
      graph: {},
      maxBarElements:null,

      messages: { mess: null, errors: null }
    };
  },
  watch: {
    ticker: function() {
      //Смотрим за ticker, если он есть в вычисляемых свойствах  filteredTickers, записываем сообщение об ошибку
      //в объект data messages.errors
      if (this.tickersName.includes(this.ticker?.toUpperCase())) {
        this.messages.errors = "This crypto is selected alredy";
      } else {
        this.messages.errors = null;
      }

      this.messages.mes = this.tickersMessages;
    },

    filterAndPage(value) {
      //Смотрим за вычисляемым свойством  filterAndPage(возращает объект с filter:this.filter и
      //page:this.filterpage),если оно меняется то меняем адресную строку
      const url= new URL(window.location)
      url.searchParams.set('filter',value.filter)
      url.searchParams.set('page',value.page)
      window.history.pushState(
        true,
        "",
       url
      );
    }
  },

  computed: {
   

    filterAndPage() {
      //Свойство возращающее this.filter и this.filterpage в ввиде объекта.
      //Нужна для отображения этих параметров в адресной строке
      return {
        filter: this.filter,
        page: this.filterpage
      };
    },
    filteredTickers() {
      //Свойство отображающее тикеры согласно filter и разбивка на страницы
      const start = (this.filterpage - 1) * 6;
      const end = this.filterpage * 6;
      return this.tickers
        .filter(el => el.name.includes(this.filter.toUpperCase()))
        .slice(start, end);
    },
    tickersMessages() {
      //Отоброжение подсказок при вводе в тикер.Проверяет на включение значения ticker в coinList ,
      //сортирует по размеру и выводит 4 результата
      if (this.ticker != "") {
        return Object.keys(this.coinsList)
          .filter(el => el.includes(this.ticker?.toUpperCase()))
          .sort((a, b) => {
            return a.length - b.length;
          })
          .slice(0, 5);
      }
      return null;
    },

    tickersName() {
      return this.tickers.map(el => el.name);
    },

    maxHeightBar() {
      this.calculateMaxBarElements()
      //Вывод графика , возвращает объект с данными высоты бара и ключом именем выбранного элемента
      let result = {};

      if (this.graph[this.selected.name]) {
        let max = Math.max(...this.graph[this.selected.name]);
        let min = Math.min(...this.graph[this.selected.name]);
        this.graph[this.selected.name]?.forEach(el => {
          let procent = 5 + ((el - min) * 95) / (max - min);
          result[el] = procent;
        });
      }

      return result;
    }
  },
  async created() {
    //при создпние запросом получает и записывает в coinList список валют,
    //затем проверяет localstorage и если он есть берет из него данные и записывает в tickers
    //после этого проверяет есть ли в url параметры filter и page и восстанавливает их если они есть
    //далее для всех тикеров в tickers запускает updatePrice()

    const data=await getCoinList()
    this.coinsList = data.Data;
    
    if (localStorage.tickersList) {
      this.tickers = JSON.parse(localStorage.getItem("tickersList"));
      this.tickers.forEach(ticker => {
        subscribeToTicker(ticker.name, price => {
          this.updateTicker(ticker.name, price);
        });
      });
    }
    const url = new URL(window.location);
    if (
      url.searchParams.has("filter") ||
      url.searchParams.has("page")
    ) {
      this.filter = url.searchParams.get("filter");
      this.filterpage = url.searchParams.get("page");
    }
  },
  mounted(){
    window.addEventListener('resize',this.calculateMaxBarElements())
  },
  beforeUnmount(){
     window.removeEventListener('resize',this.calculateMaxBarElements())},
  updated() {
    localStorage.setItem("tickersList", JSON.stringify(this.tickers));
  },
  methods: {
    calculateMaxBarElements(){
        const barWidth=this.$refs.bar?.clientWidth || 16
        this.maxBarElements=this.$refs.graph?.clientWidth/barWidth
    },
    updateTicker(tickerName, price) {
    console.log('bar width:',this.$refs.bar?.clientWidth)
     console.log('graph div width:',this.$refs.graph?.clientWidth)
      this.calculateMaxBarElements()
     console.log(this.maxBarElements)
      if (!price) {
        return;
      }
      this.tickers
        .filter(t => t.name === tickerName)
        .forEach(el => {
          //Отображаем цены в божеском виде

          price > 1
            ? (price = price.toFixed(2))
            : (price = price.toPrecision(2));
          el.history.push(el.price);

          el.price = price;
          if (!this.graph[el.name]) {
            this.graph[el.name] = [];
            
          }
          if (price) {
            this.graph[el.name].push(price);
            console.log(this.maxBarElements)
            while  (this.graph[el.name].length>this.maxBarElements){
              this.graph[el.name].shift()
            }
          }
        });
    },

    chooseMes(mes) {
      this.ticker = mes;
    },
    validation() {
      //Валидация инпута добавления
      if (
        this.coinsList[this.ticker?.toUpperCase()] &&
        !this.tickersName.includes(this.ticker.toUpperCase())
      ) {
        return true;
      } else {
        return false;
      }
    },

    btnAdd() {
      //Добаляет выбранный тикер в массив tickers
      const added = {
        name: this.ticker.toUpperCase(),
        price: "--",
        history: [],
        fullName: this.coinsList[this.ticker?.toUpperCase()]["FullName"]
      };
      this.tickers.push(added);
      subscribeToTicker(added.name, price => {
        this.updateTicker(added.name, price);
      });
      //После этого очишает инпут добавления  и фильтр ,переставляет страницу на первую
      // и записывает в локалсторэйдж
      this.ticker = "";
      this.filter = "";
      this.filterpage = Math.round((this.tickers.length + 2) / 6);
      localStorage.setItem("tickersList", JSON.stringify(this.tickers));
    },
    btnDelete(name) {
      //Удаляет из массива по имени ,  убирает с него выбор и если страниц стало меньше
      //то переставляет страницу и записывает в локал сторэйдж
      let ind = this.tickers.findIndex(el => el.name === name);
      if (this.tickers[ind] == this.selected) {
        this.selected = null;
      }
      unsubscribeFromTicker(this.tickers[ind].name);

      this.tickers.splice(ind, 1);

      localStorage.setItem("tickersList", JSON.stringify(this.tickers));
      if (Math.round((this.tickers.length + 2) / 6) < this.filterpage) {
        this.filterpage--;
      }
    }
  }
};
</script>

<style src="./style.css"></style>
