import { Routes } from "react-router-dom";
import { getAuthRoutes } from "./AppRoutes";

export default function GuestAuthApp() {
  return <Routes>{getAuthRoutes()}</Routes>;
}
