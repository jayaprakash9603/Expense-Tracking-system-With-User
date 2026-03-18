import React from "react";
import EntityFormPage from "../../../shared/entity-form/components/EntityFormPage";
import { categoryFormConfig } from "../config/categoryFormConfig";

const CreateCategory = () => (
  <EntityFormPage mode="create" config={categoryFormConfig} />
);

export default CreateCategory;
