import React from "react";
import EntityFormPage from "../../../shared/entity-form/components/EntityFormPage";
import { paymentMethodFormConfig } from "../config/paymentMethodFormConfig";

const EditPaymentMethod = ({ onClose, onPaymentMethodCreated }) => (
  <EntityFormPage
    mode="edit"
    config={paymentMethodFormConfig}
    onClose={onClose}
    onEntityCreated={onPaymentMethodCreated}
  />
);

export default EditPaymentMethod;
