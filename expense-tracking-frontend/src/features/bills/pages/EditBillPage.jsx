import React from "react";
import BillFormPage from "../components/BillFormPage";

const EditBill = ({ onClose, onSuccess, billId }) => (
  <BillFormPage
    mode="edit"
    onClose={onClose}
    onSuccess={onSuccess}
    billId={billId}
  />
);

export default EditBill;
