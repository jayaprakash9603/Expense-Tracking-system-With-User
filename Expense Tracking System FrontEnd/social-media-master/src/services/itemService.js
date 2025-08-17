// itemService.js
// Central place to implement API calls for item names.
// Currently returns a local dummy list; replace the internals with a real fetch to your backend when ready.

import { api } from "../config/api";

const dummyItemNames = [
  "Groceries",
  "Fuel",
  "Electricity Bill",
  "Water Bill",
  "Internet Bill",
  "Mobile Recharge",
  "Restaurant",
  "Coffee",
  "Medicines",
  "Stationery",
  "Clothing",
  "Books",
  "Transportation",
  "Parking",
  "Gym Membership",
  "Netflix Subscription",
  "Amazon Prime",
  "Office Supplies",
  "Cleaning Supplies",
  "Personal Care",
  "Home Maintenance",
  "Car Service",
  "Insurance Premium",
  "Bank Charges",
  "ATM Charges",
  "Food Delivery",
  "Uber/Ola",
  "Movie Tickets",
  "Shopping",
  "Hardware Store",
  "Pharmacy",
  "Vegetables",
  "Fruits",
  "Dairy Products",
  "Snacks",
  "Beverages",
  "Fast Food",
  "Pizza",
  "Ice Cream",
  "Bakery Items",
  "Rent",
  "Maintenance",
  "Security Deposit",
  "House Cleaning",
  "Laundry",
  "Dry Cleaning",
  "Pet Food",
  "Veterinary",
  "School Fees",
  "Tuition",
  "Online Courses",
  "Software Subscription",
  "Cloud Storage",
  "Domain Renewal",
  "Hosting",
  "VPN Subscription",
];

// simple in-memory cache to avoid repeated network calls
let cachedItems = null;

export async function getAllItems(forceRefresh = false) {
  if (cachedItems && !forceRefresh) {
    return cachedItems;
  }

  try {
    const resp = await api.get(`/api/bills/items`);
    const data = resp && resp.data ? resp.data : null;

    let items = [];
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === "object") {
      if (Array.isArray(data.userItems) || Array.isArray(data.backupItems)) {
        items = [...(data.userItems || []), ...(data.backupItems || [])];
      } else if (Array.isArray(data.items)) {
        items = data.items;
      } else {
        // flatten string values
        try {
          items = Object.values(data)
            .flat()
            .filter((v) => typeof v === "string");
        } catch (e) {
          items = [];
        }
      }
    }

    if (!items || items.length === 0) {
      // fallback to bundled dummy list
      cachedItems = [...dummyItemNames];
    } else {
      cachedItems = items;
    }

    return cachedItems;
  } catch (err) {
    console.error("itemService.getAllItems error:", err);
    // on error, return the dummy list as fallback
    cachedItems = [...dummyItemNames];
    return cachedItems;
  }
}

export async function searchItems(term = "") {
  if (!term) return [];
  const items = await getAllItems();
  return items.filter((item) =>
    item.toLowerCase().includes(term.toLowerCase())
  );
}

const itemService = { getAllItems, searchItems };

export default itemService;
