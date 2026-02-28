import React, { useEffect, useMemo, useState } from "react";
import TextBanner from "./TextBanner";
import FloatingSuppressionBanner from "./FloatingSuppressionBanner";
import ScrollingSuppressionBanner from "./ScrollingSuppressionBanner";
import { subscribeToGlobalMessage } from "../../../utils/globalMessageBus";

const defaultRenderers = {
  text: TextBanner,
  floatingSuppression: FloatingSuppressionBanner,
  floatingSuppressionTicker: ScrollingSuppressionBanner,
};

const GlobalHeaderMessageSlot = ({ renderers = {}, className = "" }) => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToGlobalMessage(setMessage);
    return unsubscribe;
  }, []);

  const rendererMap = useMemo(
    () => ({
      ...defaultRenderers,
      ...renderers,
    }),
    [renderers]
  );

  if (!message) {
    return null;
  }

  const { component, renderer = "text", props = {} } = message;

  let content = null;

  if (component) {
    if (React.isValidElement(component)) {
      content = component;
    } else if (typeof component === "function") {
      const CustomComponent = component;
      content = <CustomComponent {...props} />;
    }
  } else {
    const RendererComponent = rendererMap[renderer] || rendererMap.text;
    content = RendererComponent ? <RendererComponent {...props} /> : null;
  }

  if (!content) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-start min-h-[40px] ${className}`}
      style={{ pointerEvents: "none" }}
    >
      <div style={{ pointerEvents: "auto" }}>{content}</div>
    </div>
  );
};

export default GlobalHeaderMessageSlot;
