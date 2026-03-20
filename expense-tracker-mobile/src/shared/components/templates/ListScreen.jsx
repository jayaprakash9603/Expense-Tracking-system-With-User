import React from "react";
import { AppContainer } from "@/shared/components/layout/AppContainer";
import { AppStack } from "@/shared/components/layout/AppStack";
import { AppSection } from "@/shared/components/layout/AppSection";
import { AsyncStateView } from "@/shared/components/feedback/AsyncStateView";

/**
 * @param {{title?: string, description?: string, actions?: React.ReactNode, toolbar?: React.ReactNode, status?: string, hasData?: boolean, emptyProps?: object, errorProps?: object, loadingProps?: object, children: React.ReactNode}} props
 */
export function ListScreen({
  title,
  description,
  actions,
  toolbar,
  status,
  hasData,
  emptyProps,
  errorProps,
  loadingProps,
  children,
}) {
  return (
    <AppContainer width="wide">
      <AppStack gap="md">
        <AppSection title={title} description={description} actions={actions}>
          {toolbar}
        </AppSection>
        <AsyncStateView
          status={status}
          hasData={hasData}
          emptyProps={emptyProps}
          errorProps={errorProps}
          loadingProps={loadingProps}
        >
          {children}
        </AsyncStateView>
      </AppStack>
    </AppContainer>
  );
}

export default ListScreen;
