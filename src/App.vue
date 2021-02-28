<template>
  <div class="wraper">
    <div class="forinput">
      <p>ticker</p>
      <input
        type="text"
        v-model="ticker"
        @keydown.enter="validation() ? btnAdd() : pass"
        class="generalinput"
      />
      <div v-if="messages.mes" class="messagesfield">
        <p
          v-for="(mes, ind) in messages.mes"
          :key="ind"
          @click="
            ticker = mes;
            validation() ? btnAdd() : pass;
          "
        >
          {{ mes }}
        </p>
      </div>
      <div v-if="messages.errors" class="errorsfield">
        <p>{{ messages.errors }}</p>
      </div>
      <button class="btn btn-add" v-on:click="validation() ? btnAdd() : pass">
        add
      </button>
    </div>
    <hr />
    <div class="filter" v-if="tickers.length!=0">
      <p>Filter:</p>
      <input type="text" class="filterinput" v-model="filter" @input="filterpage=1">
      <button class="btn prevpage"  v-if="filterpage>1" @click="filterpage--">	

&#129128; </button>
      <p>{{filterpage}} from {{Math.round((tickers.length+2)/6)}}</p>
      <button class="btn nextpage" @click="filterpage++" v-if="tickers.length/6>filterpage" > 	
	
	
	
&#129130; </button>
    </div>
    <div class="forwallets">
      <div
        @click="selected === t ? (selected = null) : (selected = t)"
        v-for="(t, i) in filteredTickers"
        :key="i"
        class="walletblock"
        :class="{ active: t === selected }"
      >
        <p>{{ t.name }}/USD</p>
        <p>{{ t.fullName }}</p>
        <h1 :class="{down:t.price<t.oldprice,up:t.price>t.oldprice}">{{ t.price }}</h1>
        <h4 @click.stop="btnDelete(t.name)">Delete</h4>
      </div>
    </div>
    <hr />
    <div v-if="selected" class="outputdisplay">
      <button @click="selected = null" class="closeoutput">X</button>

      <div class="graph">
        <div
          v-for="(key,ind) in Object.keys(maxHeightBar)"
          :key="key"
          :title="key"
          :style="{ height: maxHeightBar[key] + '%' }"
          class="bar"
          :class="{up:maxHeightBar[(Object.keys(maxHeightBar)[ind-1])]< maxHeightBar[(Object.keys(maxHeightBar)[ind])],down:maxHeightBar[(Object.keys(maxHeightBar)[ind-1])]>maxHeightBar[(Object.keys(maxHeightBar)[ind])]}"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      filter:'',
      filterpage:1,
      ticker: "",
      tickers: [],
      coinsList: null,
      selected: null,
      graph: {},
      messages: { mess: null, errors: null }
    };
  },
  watch: {
    
    ticker: function() {
      if (this.tickersName.includes(this.ticker?.toUpperCase())) {
        this.messages.errors = "This crypto is selected alredy";
      } else {
        this.messages.errors = null;
      }

      this.messages.mes = this.tickersMessages;
    },
    
  },
  computed: {
    filteredTickers(){
      const start=(this.filterpage-1)*6
      const end=this.filterpage*6
      return this.tickers.filter(el=>el.name.includes(this.filter.toUpperCase())).slice(start,end)
    },
    tickersMessages() {
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
      let result = {};

      if (this.graph[this.selected.name]) {
        let max = Math.max(...this.graph[this.selected.name]);
        let min = Math.min(...this.graph[this.selected.name]);
        this.graph[this.selected.name].forEach(el => {
          let procent = 5 + ((el - min) * 95) / (max - min);
          result[el] = procent;
        });
      }
      
      return result;
    }
  },
  async created() {
    const resp = await fetch(
      "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    );
    const data = await resp.json();
    this.coinsList = data.Data;
    localStorage.tickersList?this.tickers=JSON.parse(localStorage.getItem('tickersList')):null
    this.tickers.forEach(el=>{
      this.updatePrice(el.name)
    })
    
    

   
  },
  updated(){
    localStorage.setItem('tickersList',JSON.stringify(this.tickers))
   
  },
  methods: {
    updatePrice(tickerName){
      setInterval(async () => {
        let f = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=e471e53bb40142e09d4decbeb1e49a9943383e0b588a08f7c6f60d118fbe82ab`
        );

        const data = await f.json();
        let targetTicker=this.tickers.find(el => el.name === tickerName)
        targetTicker?targetTicker.oldprice=targetTicker.price:null;
        targetTicker?targetTicker.price= data.USD:null;

        this.graph[tickerName]
          ? this.graph[tickerName].push(data.USD)
          : (this.graph[tickerName] = []);
      }, 5000);
    },
    chooseMes(mes) {
      this.ticker = mes;
    },
    validation() {
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
      const added = {
        name: this.ticker.toUpperCase(),
        price: "--------",
        fullName: this.coinsList[this.ticker?.toUpperCase()]["FullName"]
      };
      this.tickers.push(added);
      this.updatePrice(this.ticker)
      this.ticker = "";
      this.filter=''
      this.filterpage=Math.round((this.tickers.length+2)/6)
      
      
    },
    btnDelete(name) {
      let ind=this.tickers.findIndex(el=>el===name)
      this.tickers.splice(ind, 1);
      if (Math.round((this.tickers.length+2)/6)<this.filterpage){
        this.filterpage--
      }
    }
  }
};
</script>

<style src="./style.css"></style>
