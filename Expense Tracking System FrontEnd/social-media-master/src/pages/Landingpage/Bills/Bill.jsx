import React from "react";
import BillsPageContainer from "./BillsPageContainer";

// Minimal wrapper: keeps routing stable while implementation lives in BillsPageContainer
const Bill = () => <BillsPageContainer />;

export default Bill;
