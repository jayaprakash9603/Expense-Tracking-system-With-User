import React from "react";
import EntityFormPage from "../../../shared/entity-form/components/EntityFormPage";
import { paymentMethodFormConfig } from "../config/paymentMethodFormConfig";

const CreatePaymentMethod = () => (
  <EntityFormPage mode="create" config={paymentMethodFormConfig} />
);

export default CreatePaymentMethod;
