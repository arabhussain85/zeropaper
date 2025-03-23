import { Receipt } from "@/types/receipt";

export const validateReceipt = (receipt: Receipt): string[] => {
  const errors: string[] = [];
  
  if (!receipt.productName) {
    errors.push("Product name is required");
  }
  
  if (!receipt.storeName) {
    errors.push("Store name is required");
  }
  
  if (!receipt.date) {
    errors.push("Receipt date is required");
  }
  
  if (!receipt.price || receipt.price <= 0) {
    errors.push("Valid price is required");
  }
  
  if (!receipt.category) {
    errors.push("Category is required");
  }
  
  if (!receipt.currency) {
    errors.push("Currency is required");
  }
  
  return errors;
};

export default validateReceipt;