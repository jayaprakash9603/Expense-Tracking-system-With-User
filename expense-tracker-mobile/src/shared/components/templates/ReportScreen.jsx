import React from "react";
import { AppContainer } from "@/shared/components/layout/AppContainer";
import { AppSection } from "@/shared/components/layout/AppSection";
import { AppStack } from "@/shared/components/layout/AppStack";
import { AsyncStateView } from "@/shared/components/feedback/AsyncStateView";

/**
 * @param {{title: string, description?: string, controls?: React.ReactNode, actions?: React.ReactNode, status?: string, hasData?: boolean, emptyProps?: object, errorProps?: object, loadingProps?: object, children: React.ReactNode}} props
 */
export function ReportScreen({
  title,
  description,
  controls,
  actions,
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
          {controls}
        </AppSection>
        <AppSection>
          <AsyncStateView
            status={status}
            hasData={hasData}
            emptyProps={emptyProps}
            errorProps={errorProps}
            loadingProps={loadingProps}
          >
            {children}
          </AsyncStateView>
        </AppSection>
      </AppStack>
    </AppContainer>
  );
}

export default ReportScreen;
