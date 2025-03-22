import { axiosInstance, handleAxiosError } from './axios-client';

export interface Receipt {
  id?: string;
  userId: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  imageBase64?: string;
}

export interface ReceiptResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const receiptService = {
  async getReceipts(userId: string): Promise<ReceiptResponse> {
    try {
      const response = await axiosInstance.get(`/receipt/get_by_user_id?uid=${userId}`);
      return { success: true, message: 'Receipts fetched successfully', data: response.data };
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async getReceiptById(id: string): Promise<ReceiptResponse> {
    try {
      const response = await axiosInstance.get(`/receipt/${id}`);
      return { success: true, message: 'Receipt fetched successfully', data: response.data };
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async addReceipt(receipt: Receipt): Promise<ReceiptResponse> {
    try {
      const response = await axiosInstance.post('/receipt', receipt);
      return { success: true, message: 'Receipt added successfully', data: response.data };
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async updateReceipt(id: string, receipt: Partial<Receipt>): Promise<ReceiptResponse> {
    try {
      const response = await axiosInstance.put(`/receipt/${id}`, receipt);
      return { success: true, message: 'Receipt updated successfully', data: response.data };
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async deleteReceipt(id: string): Promise<ReceiptResponse> {
    try {
      const response = await axiosInstance.delete(`/receipt/delete?id=${id}`);
      return { success: true, message: 'Receipt deleted successfully' };
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async uploadImage(file: File): Promise<ReceiptResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/receipt/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, message: 'Image uploaded successfully', data: response.data };
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async getImage(imageReceiptId: string): Promise<ReceiptResponse> {
    try {
      const response = await axiosInstance.get(`/receipt/imageBase64?imageReceiptId=${imageReceiptId}`);
      return { success: true, message: 'Image fetched successfully', data: response.data };
    } catch (error) {
      return handleAxiosError(error);
    }
  },
};