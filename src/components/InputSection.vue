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
import { ref, reactive, computed, watch } from "vue";
export default {
  components: {
    AddButton
  },
  props: {
    coinsList: {
      type: Object
    },
    tickersName: {
      type: Array
    }
  },
  emits: ["add-ticker"],
  setup(props, { emit }) {
    const ticker = ref("");
    const messages = reactive({ mess: null, errors: null });
    const tickersMessages = computed(() => {
      console.log(ticker.value.toUpperCase());
      //Отоброжение подсказок при вводе в тикер.Проверяет на включение значения ticker в coinList ,
      //сортирует по размеру и выводит 4 результата
      if (ticker.value !== "") {
        return Object.keys(props.coinsList)
          .filter(el => el.includes(ticker.value.toUpperCase()))
          .sort((a, b) => {
            return a.length - b.length;
          })
          .slice(0, 5);
      }
      return null;
    });
    watch(ticker, val => {
      // console.log(val.toUpperCase());
      if (props.tickersName.includes(val.toUpperCase())) {
        messages.errors = "This crypto is selected alredy";
      } else {
        messages.errors = null;
      }

      messages.mes = tickersMessages;
    });
    function btnAdd() {
      emit("add-ticker", ticker);
      ticker.value = "";
    }
    function validation() {
      //Валидация инпута добавления
      if (
        props.coinsList[ticker.value.toUpperCase()] &&
        !props.tickersName.includes(ticker.value.toUpperCase())
      ) {
        return true;
      } else {
        return false;
      }
    }
    return {
      ticker,
      messages,
      tickersMessages,
      validation,
      btnAdd
    };
  }
};
</script>
