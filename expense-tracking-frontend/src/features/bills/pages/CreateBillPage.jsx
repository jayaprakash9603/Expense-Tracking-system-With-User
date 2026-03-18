import React from "react";
import BillFormPage from "../components/BillFormPage";

const CreateBill = ({ onClose, onSuccess }) => (
  <BillFormPage mode="create" onClose={onClose} onSuccess={onSuccess} />
);

export default CreateBill;
