import React from "react";
import { AppContainer } from "@/shared/components/layout/AppContainer";
import { AppSection } from "@/shared/components/layout/AppSection";
import { AsyncStateView } from "@/shared/components/feedback/AsyncStateView";

/**
 * @param {{title: string, description?: string, actions?: React.ReactNode, status?: string, errorProps?: object, loadingProps?: object, children: React.ReactNode}} props
 */
export function FormScreen({
  title,
  description,
  actions,
  status,
  errorProps,
  loadingProps,
  children,
}) {
  return (
    <AppContainer width="content">
      <AppSection title={title} description={description} actions={actions}>
        <AsyncStateView
          status={status}
          hasData
          emptyProps={null}
          errorProps={errorProps}
          loadingProps={loadingProps}
        >
          {children}
        </AsyncStateView>
      </AppSection>
    </AppContainer>
  );
}

export default FormScreen;
