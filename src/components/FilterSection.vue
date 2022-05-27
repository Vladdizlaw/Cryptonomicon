<template>
  <div class="filter" v-if="tickersLength != 0">
    <div class="controlpages">
      <button
        class="btn prevpage"
        :disabled="filterpage == 1"
        @click="filterpageDecrease"
      >
        <img src="../assets/Group.svg" alt="" />
      </button>
    </div>
    <div class="filter_input">
      <p>Filter:</p>
      <input
        type="text"
        class="filterinput"
        v-model="filter"
        @input="filterpageTo"
      />
      <p>
        {{ filterpage }} from
        {{ Math.round((tickersLength + 2) / this.allVisiblePages) }}
      </p>
    </div>

    <div class="controlpages">
      <button
        class="btn nextpage"
        @click="filterpageIncrease"
        :disabled="
          filterpage >= Math.round((tickersLength + 2) / this.allVisiblePages)
        "
      >
        <img src="../assets/Group2.svg" alt="" />
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    tickersLength: { type: Number },
    filterpage: {
      type: Number,
    },
  },
  data() {
    return {
      filter: "",
      allVisiblePages: 6,
    };
  },
  watch: {
    filter() {
      this.$emit("filterpage", {
        filterpage: 1,
        filter: this.filter,
      });
    },
  },
  filterpage() {
    this.$emit("filterpage", {
      filterpage: this.filterpage,
      filter: this.filter,
    });
  },
  methods: {
    changeAllVisiblePages(event) {
      console.log("event", event.target.orientation);
      if (event.target.orientation == "0") {
        this.allVisiblePages = 3;
      } else {

           this.allVisiblePages = 6;
        }

      
    },
    filterpageToN() {
      this.$emit("filterpage", { filterpage: 1, filter: this.filter });
    },
    filterpageIncrease() {
      this.$emit("filterpage", {
        filterpage: this.filterpage + 1,
        filter: this.filter,
      });
      console.log("sending increase", this.filterpage + 1);
    },
    filterpageDecrease() {
      this.$emit("filterpage", {
        filterpage: Number(this.filterpage - 1),
        filter: this.filter,
      });
    },
  },
  mounted() {
    window.addEventListener("orientationchange", this.changeAllVisiblePages);
  },
  beforeUnmount() {
    window.removeEventListener("orientationchange", this.changeAllVisiblePages);
  },
};
</script>
