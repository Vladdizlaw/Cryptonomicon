<template>
  <div class="forinput">
    <div class="forinput_ticket">
      <p>Ticket</p>
      <input
        type="text"
        v-model="ticker"
        @keydown.enter="validation() ? btnAdd() : null"
        class="generalinput"
      />
      <AddButton v-on:click="validation() ? btnAdd() : null" />
    </div>

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
  </div>
</template>
<script>
import AddButton from "./AddButton.vue";

export default {
  components: {
    AddButton,
  },
  props: {
    coinsList: {
      type: Object,
    },
    tickersName: {
      type: Array,
    },
  },
  data() {
    return {
      ticker: "",
      messages: { mess: null, errors: null },
    };
  },
  computed: {
    tickersMessages() {
      //Отоброжение подсказок при вводе в тикер.Проверяет на включение значения ticker в coinList ,
      //сортирует по размеру и выводит 4 результата
      if (this.ticker != "") {
        return Object.keys(this.coinsList)
          .filter((el) => el.includes(this.ticker?.toUpperCase()))
          .sort((a, b) => {
            return a.length - b.length;
          })
          .slice(0, 5);
      }
      return null;
    },
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
  },
  methods: {
    btnAdd() {
      this.$emit("add-ticker", this.ticker);
      this.ticker = "";
    },
    validation() {
      //Валидация инпута добавления
      if (
        this.coinsList[this.ticker?.toUpperCase()] &&
        !this.tickersName.includes(this.ticker?.toUpperCase())
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>
