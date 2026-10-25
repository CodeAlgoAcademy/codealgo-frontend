import { createAsyncThunk } from "@reduxjs/toolkit";
import http from "axios.config";
import { closePreloader, openPreloader } from "store/fetchSlice";
import {
  CouponValidationResponse,
  IBilling,
  InitiatePaymentRes,
  InstitutionInquiryDto,
  IPlan,
  ISubscribedPlan,
  PaidInitiateResponse,
  PaymentsResponse,
  PaymentStatus,
  Subscription,
  TrialInitiateResponse,
} from "types/interfaces";
import { errorResolver } from "utils/errorResolver";
import { getAccessToken } from "utils/getTokens";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getAccessToken()}` },
});

export const submitInstituionInquiry: any = createAsyncThunk(
  "pricingService/institutionInquiry",
  async (data: InstitutionInquiryDto, thunkApi) => {
    const dispatch = thunkApi.dispatch;
    dispatch(openPreloader({ loadingText: "Submitting Inquiry" }));
    try {
      await http.post("/contact/institution/", data);
      dispatch(closePreloader());
    } catch (error) {
      const errorMessage = errorResolver(error);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const getPricingPlans: any = createAsyncThunk(
  "pricingService/getPlans",
  async (_, thunkApi) => {
    try {
      const response = await http.get<IPlan[]>("/payment/product/");
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);

export const getActiveSubscription: any = createAsyncThunk(
  "pricingService/getActiveSubscription",
  async (_, thunkApi) => {
    try {
      const response = await http.get<Subscription[]>(
        "/payment/subscription/active",
        authHeader()
      );
      return response.data[0] ?? null;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);

export const getBillingHistory: any = createAsyncThunk(
  "pricingService/getBillingHistory",
  async (_, thunkApi) => {
    try {
      const response = await http.get<Subscription[]>(
        `/payment/subscription/history`,
        authHeader()
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);


export const initiatePayment = createAsyncThunk(
  "pricingService/initiatePayment",
  async (
    payload: {
      price_id: number;
      children?: number[];
      is_trial: boolean;
      promotion_code?: string;
    },
    thunkApi
  ) => {
    try {
      const response = await http.post<TrialInitiateResponse>(
        "/payment/subscription/initiate",
        payload,
        authHeader()
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);

export const changePlan = createAsyncThunk(
  "pricingService/changePlan",
  async (
    { subscriptionId, priceId }: { subscriptionId: number; priceId: number },
    thunkApi
  ) => {
    try {
      const response = await http.post(
        `/payment/subscription/${subscriptionId}/change-plan/`,
        { price: priceId },
        authHeader()
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);


export const updateSubscriptionChild = createAsyncThunk(
  "pricingService/updateSubscriptionChild",
  async (
    {
      subscriptionId,
      childId,
      active,
    }: { subscriptionId: number; childId: number; active: boolean },
    thunkApi
  ) => {
    try {
      const response = await http.post(
        `/payment/subscription/${subscriptionId}/update-child/`,
        { child: childId, active },
        authHeader()
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);


export const attachPaymentMethod = createAsyncThunk(
  "pricingService/attachPaymentMethod",
  async (
    payload: {
      subscription_id: number;
      payment_method_id: string;
      is_default?: boolean;
    },
    thunkApi
  ) => {
    try {
      const response = await http.post<PaidInitiateResponse>(
        "/payment/subscription/attach-payment",
        { is_default: false, ...payload },
        authHeader()
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);

export const createSetupIntent = createAsyncThunk(
  "pricingService/createSetupIntent",
  async (subscription_id: number, thunkApi) => {
    try {
      const response = await http.post<{ client_secret: string }>(
        "/payment/setup-intent",
        { subscription_id },
        authHeader()
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);


export const validateCoupon = createAsyncThunk(
  "pricingService/validateCoupon",
  async (
    payload: { code: string; price_id: number; children?: number[] },
    thunkApi
  ) => {
    try {
      const response = await http.post<CouponValidationResponse>(
        "/payment/coupon/validate/",
        payload,
        authHeader()
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);


export const verifyPayment: any = createAsyncThunk(
  "pricingService/verifyPayment",
  async (paymentIntent: string, thunkApi) => {
    try {
      const response = await http.post<{ status: PaymentStatus }>(
        "/payment/subscription/verify",
        { intent_id: paymentIntent },
        authHeader()
      );
      return response.data.status;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);


export const cancelSubscription: any = createAsyncThunk(
  "pricingService/cancelSubscription",
  async (id: number | string, thunkApi) => {
    try {
      const response = await http.post(
        `/payment/subscription/${id}/cancel/`,
        {},
        authHeader()
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);


export const reactivateSubscription = createAsyncThunk(
  "pricingService/reactivateSubscription",
  async (subscriptionId: number, thunkApi) => {
    try {
      const response = await http.post(
        `/payment/subscription/${subscriptionId}/reactivate/`,
        {},
        authHeader()
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);

export const getAllPayment: any = createAsyncThunk(
  "pricingService/getAllPayments",
  async (_, thunkApi) => {
    try {
      const response = await http.get<PaymentsResponse[]>("/payment/");
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(errorResolver(error));
    }
  }
);

export const updateSubscriptionChildren = createAsyncThunk(
  "pricing/updateSubscriptionChildren",
  async (
    payload: {
      subscription_id: number;
      children_to_add: number[];
      children_to_remove: number[];
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await http.patch(
        `/subscriptions/${payload.subscription_id}/children`,
        {
          children_to_add: payload.children_to_add,
          children_to_remove: payload.children_to_remove,
        }
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Update failed");
    }
  }
);

export interface AmountDue {
  client_secret: string | null;
  amount_due?: number;
  currency?: string;
  trial_ended?: boolean;
}

// The open invoice on a past due plan, usually the first charge after a free trial.
export const fetchAmountDue = async (subscription_id: number): Promise<AmountDue> => {
  const res = await http.post<AmountDue>("/payment/subscription/pay-due", { subscription_id }, authHeader());
  return res.data;
};
