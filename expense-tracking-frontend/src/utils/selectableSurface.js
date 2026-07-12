export const selectableSurfaceStyles = {
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
};

export const handleSelectableSurfaceMouseDown = (event) => {
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    event.preventDefault();
    window.getSelection?.()?.removeAllRanges?.();
  }
};
