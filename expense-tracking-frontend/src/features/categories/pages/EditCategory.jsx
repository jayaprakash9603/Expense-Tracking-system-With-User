import React from "react";
import EntityFormPage from "../../../shared/entity-form/components/EntityFormPage";
import { categoryFormConfig } from "../config/categoryFormConfig";

const EditCategory = () => (
  <EntityFormPage mode="edit" config={categoryFormConfig} />
);

export default EditCategory;
