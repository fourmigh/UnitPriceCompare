Component({
  properties: {
    barText: { type: String, value: "" },
    barDisabled: { type: Boolean, value: true },
    barLoading: { type: Boolean, value: false },
  },
  methods: {
    onBarTap() {
      this.triggerEvent("bartap");
    },
  },
});
