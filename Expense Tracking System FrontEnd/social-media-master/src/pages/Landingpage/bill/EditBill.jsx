import React from "react";
import { useParams } from "react-router-dom";
import CreateEditBill from "./CreateEditBill";

const EditBill = ({ onClose, onSuccess }) => {
  const { billId } = useParams();

  return (
    <CreateEditBill
      mode="edit"
      billId={billId}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default EditBill;
