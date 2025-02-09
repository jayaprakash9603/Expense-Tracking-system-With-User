import InboxIcon from "@mui/icons-material/Inbox";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EditNoteIcon from "@mui/icons-material/EditNote";
export const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: <DashboardIcon />, // Pass the actual icon component
  },
  {
    label: "Add Expense",
    path: "/add-expense",
    icon: <AddIcon />,
  },
  {
    label: "Edit Expense",
    path: "/edit-expense",
    icon: <EditNoteIcon />,
  },
];
