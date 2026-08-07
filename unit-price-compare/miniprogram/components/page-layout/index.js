Component({
  properties: {
    barText: { type: String, value: "" },
    barDisabled: { type: Boolean, value: true },
    barLoading: { type: Boolean, value: false },
    deleteText: { type: String, value: "" },
    deleteVisible: { type: Boolean, value: false },
    deleteDisabled: { type: Boolean, value: true },
    deleteLoading: { type: Boolean, value: false },
  },
  methods: {
    onBarTap() {
      this.triggerEvent("bartap");
    },
    onDeleteTap() {
      this.triggerEvent("deletetap");
    },
  },
});
