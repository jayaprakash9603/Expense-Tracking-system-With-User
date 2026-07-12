import React from "react";
import { AppContainer } from "@/shared/components/layout/AppContainer";
import { AppSection } from "@/shared/components/layout/AppSection";
import { AppStack } from "@/shared/components/layout/AppStack";

/**
 * @param {{title: string, description?: string, actions?: React.ReactNode, summary?: React.ReactNode, children: React.ReactNode}} props
 */
export function DetailScreen({ title, description, actions, summary, children }) {
  return (
    <AppContainer width="page">
      <AppStack gap="md">
        <AppSection title={title} description={description} actions={actions}>
          {summary}
        </AppSection>
        <AppSection>{children}</AppSection>
      </AppStack>
    </AppContainer>
  );
}

export default DetailScreen;
